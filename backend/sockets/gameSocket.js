const jwt = require('jsonwebtoken');
const db = require('../data/db').promise();
const JWT_SECRET = process.env.JWT_SECRET;

// ---------------------------------------------------------------
// CONFIGURAZIONE
// ---------------------------------------------------------------

// ELIMINAZIONE ACCOUNT GUEST

// Quanto aspettare dopo una disconnessione prima di eliminare il guest.
const GUEST_DELETE_DELAY = 60 * 60 * 1000; // 60 minuti

// Dopo quanto tempo di inattività un guest viene eliminato dalla pulizia periodica.
const GUEST_MAX_INACTIVITY = '1 DAY'; // sintassi MySQL INTERVAL

// ELIMINAZIONE LOBBY

// Quanto aspettare dopo che l'admin si è disconnesso prima di eliminare la lobby.
// Tienilo più basso di GUEST_DELETE_DELAY: se l'admin è un guest, la lobby deve sparire prima del suo account.
const LOBBY_DELETE_DELAY = 30 * 60 * 1000; // 30 minuti

// Dopo quanto tempo di assenza dell'admin una lobby viene eliminata dalla pulizia periodica.
const LOBBY_ADMIN_MAX_ABSENCE = '2 HOUR'; // sintassi MySQL INTERVAL

// Ogni quanto far girare la pulizia periodica (guest e lobby).
const CLEANUP_INTERVAL = 3 * 60 * 60 * 1000; // 3 ore

// Timer di eliminazione in attesa. Servono per poterli annullare se la persona torna.
const deleteTimers = new Map(); // userId -> timer (guest)
const lobbyTimers = new Map();  // lobbyId -> timer (lobby)

// ---------------------------------------------------------------
// FUNZIONI DI SUPPORTO
// ---------------------------------------------------------------

// Controlla se l'utente ha almeno un socket connesso in questo momento.
// Ogni socket entra nella stanza "user_<id>" appena si connette.
const isUserConnected = async (io, userId) => {
    const sockets = await io.in(`user_${userId}`).fetchSockets();
    return sockets.length > 0;
};

// Aggiorna la data dell'ultima attività dell'utente.
const updateLastSeen = async (userId) => {
    try {
        await db.query(`UPDATE users SET last_seen = NOW() WHERE id = ?`, [userId]);
    } catch (err) {
        console.error('Errore aggiornamento last_seen:', err);
    }
};

// --- GUEST ---

// Elimina un account guest dal database.
// Il controllo su account_type = 'guest' garantisce che gli utenti registrati
// non vengano mai toccati, nemmeno per errore.
const deleteGuest = async (userId) => {
    const [rows] = await db.query(
        `SELECT id FROM users WHERE id = ? AND account_type = 'guest'`,
        [userId]
    );
    if (rows.length === 0) return;

    // Prima elimino le righe collegate, altrimenti la chiave esterna blocca il DELETE.
    // (Se lobby_players ha già ON DELETE CASCADE, questa riga si può togliere.)
    await db.query(`DELETE FROM lobby_players WHERE user_id = ?`, [userId]);
    await db.query(`DELETE FROM users WHERE id = ?`, [userId]);

    console.log(`Account guest ${userId} eliminato`);
};

// Fa partire il timer di eliminazione per un utente appena disconnesso.
const scheduleGuestDeletion = (io, userId) => {
    // Se c'era già un timer per questo utente, lo azzero per evitarne due
    clearTimeout(deleteTimers.get(userId));

    const timer = setTimeout(async () => {
        deleteTimers.delete(userId);
        try {
            // Se nel frattempo è tornato con un'altra scheda, non elimino
            if (await isUserConnected(io, userId)) return;

            await deleteGuest(userId);
        } catch (err) {
            console.error('Errore eliminazione guest:', err);
        }
    }, GUEST_DELETE_DELAY);

    deleteTimers.set(userId, timer);
};

// Pulizia periodica: elimina i guest inattivi da troppo tempo.
// Copre il caso in cui il server sia stato riavviato e i timer in memoria siano andati persi.
const cleanupInactiveGuests = async (io) => {
    try {
        // COALESCE usa created_at se last_seen è ancora NULL
        // (guest creato ma mai collegato via socket)
        const [guests] = await db.query(
            `SELECT id FROM users
             WHERE account_type = 'guest'
             AND COALESCE(last_seen, created_at) < NOW() - INTERVAL ${GUEST_MAX_INACTIVITY}`
        );

        for (const guest of guests) {
            // Salto chi è connesso in questo momento
            if (await isUserConnected(io, guest.id)) continue;

            await deleteGuest(guest.id);
        }
    } catch (err) {
        console.error('Errore nella pulizia dei guest:', err);
    }
};

// --- LOBBY ---

// Elimina una lobby dal database e avvisa chi è ancora nella stanza.
// Le righe collegate (lobby_players, ecc.) vengono eliminate da ON DELETE CASCADE.
const deleteLobby = async (io, lobbyId) => {
    clearTimeout(lobbyTimers.get(lobbyId));
    lobbyTimers.delete(lobbyId);

    await db.query(`DELETE FROM lobbys WHERE id = ?`, [lobbyId]);

    // Prima avviso (i socket sono ancora nella stanza), poi svuoto la stanza
    io.to(`lobby_${lobbyId}`).emit('lobby_deleted');
    io.in(`lobby_${lobbyId}`).socketsLeave(`lobby_${lobbyId}`);

    console.log(`Lobby ${lobbyId} eliminata: admin assente`);
};

// Fa partire il timer di eliminazione per una lobby il cui admin si è disconnesso.
const scheduleLobbyDeletion = (io, lobbyId, adminId) => {
    // Se c'era già un timer per questa lobby, lo azzero per evitarne due
    clearTimeout(lobbyTimers.get(lobbyId));

    const timer = setTimeout(async () => {
        lobbyTimers.delete(lobbyId);
        try {
            // Se nel frattempo l'admin è tornato (anche con un'altra scheda), non elimino
            if (await isUserConnected(io, adminId)) return;

            await deleteLobby(io, lobbyId);
        } catch (err) {
            console.error('Errore eliminazione lobby:', err);
        }
    }, LOBBY_DELETE_DELAY);

    lobbyTimers.set(lobbyId, timer);
};

// Pulizia periodica: elimina le lobby il cui admin manca da troppo tempo.
// Copre il caso in cui il server sia stato riavviato e i timer in memoria siano andati persi.
const cleanupAbandonedLobbies = async (io) => {
    try {
        // COALESCE usa created_at se last_seen è ancora NULL
        const [lobbies] = await db.query(
            `SELECT l.id, l.admin_id FROM lobbys l
             JOIN users u ON u.id = l.admin_id
             WHERE COALESCE(u.last_seen, u.created_at) < NOW() - INTERVAL ${LOBBY_ADMIN_MAX_ABSENCE}`
        );

        for (const lobby of lobbies) {
            // Salto le lobby il cui admin è connesso in questo momento
            if (await isUserConnected(io, lobby.admin_id)) continue;

            await deleteLobby(io, lobby.id);
        }
    } catch (err) {
        console.error('Errore nella pulizia delle lobby:', err);
    }
};

// Esegue le due pulizie. Prima le lobby, poi i guest:
// un guest admin non si può eliminare finché la sua lobby esiste.
const runCleanup = async (io) => {
    await cleanupAbandonedLobbies(io);
    await cleanupInactiveGuests(io);
};

// ---------------------------------------------------------------
// INIZIALIZZAZIONE SOCKET
// ---------------------------------------------------------------

const initGameSocket = (io) => {

    // Pulizia periodica di lobby abbandonate e guest inattivi.
    // Parte una volta all'avvio e poi ogni CLEANUP_INTERVAL.
    runCleanup(io);
    setInterval(() => runCleanup(io), CLEANUP_INTERVAL);

    // Middleware di Socket.io per l'autenticazione tramite cookie HTTP-Only
    io.use((socket, next) => {
        try {
            const cookieHeader = socket.request.headers.cookie;
            if (!cookieHeader) return next(new Error('Autenticazione fallita: nessun cookie'));

            const cookies = Object.fromEntries(cookieHeader.split('; ').map(c => c.split('=')));
            const token = cookies['session_token'];

            if (!token) return next(new Error('Token mancante'));

            const decoded = jwt.verify(token, JWT_SECRET);
            socket.user = decoded; // Iniettiamo l'utente nel socket
            next();
        } catch (err) {
            next(new Error('Token non valido'));
        }
    });

    // Gestione degli eventi di connessione
    io.on('connection', async (socket) => {
        const userId = socket.user.id;
        console.log(`Plugin Socket connesso per l'utente ID: ${userId}`);

        // La persona è tornata: annullo l'eventuale eliminazione del guest in attesa
        clearTimeout(deleteTimers.get(userId));
        deleteTimers.delete(userId);

        // Stanza personale dell'utente: serve a sapere se ha socket attivi
        socket.join(`user_${userId}`);

        // Segno che l'utente è attivo adesso
        await updateLastSeen(userId);

        // LOGICA DI RICONNESSIONE POST-CRASH / REFRESH
        try {
            const [players] = await db.query(
                `SELECT lp.lobby_id, lp.nickname, l.admin_id
                 FROM lobby_players lp
                 JOIN lobbys l ON l.id = lp.lobby_id
                 WHERE lp.user_id = ?`,
                [userId]
            );

            if (players.length > 0) {
                const activeLobby = players[0];
                const lobbyId = activeLobby.lobby_id;

                socket.join(`lobby_${lobbyId}`);

                // L'admin è tornato: annullo l'eventuale eliminazione della lobby
                if (activeLobby.admin_id === userId) {
                    clearTimeout(lobbyTimers.get(lobbyId));
                    lobbyTimers.delete(lobbyId);
                }

                await db.query(
                    `UPDATE lobby_players SET connection_status = 'ONLINE' WHERE lobby_id = ? AND user_id = ?`,
                    [lobbyId, userId]
                );

                io.to(`lobby_${lobbyId}`).emit('player_status_changed', {
                    userId: userId,
                    status: 'ONLINE'
                });

                console.log(`Utente ${activeLobby.nickname} riagganciato alla lobby ${lobbyId}`);
            }
        } catch (err) {
            console.error("Errore durante il recupero sessione socket:", err);
        }

        // GESTIONE DISCONNESSIONE / REFRESH
        socket.on('disconnect', async () => {
            console.log(`Socket disconnesso per l'utente ID: ${userId}`);
            try {
                const [players] = await db.query(
                    `SELECT lp.lobby_id, l.admin_id
                     FROM lobby_players lp
                     JOIN lobbys l ON l.id = lp.lobby_id
                     WHERE lp.user_id = ?`,
                    [userId]
                );

                if (players.length > 0) {
                    const lobbyId = players[0].lobby_id;

                    await db.query(
                        `UPDATE lobby_players SET connection_status = 'OFFLINE' WHERE lobby_id = ? AND user_id = ?`,
                        [lobbyId, userId]
                    );

                    io.to(`lobby_${lobbyId}`).emit('player_status_changed', {
                        userId: userId,
                        status: 'OFFLINE'
                    });

                    // Se era l'admin e non ha altre schede aperte, parte il timer di eliminazione della lobby
                    if (players[0].admin_id === userId && !(await isUserConnected(io, userId))) {
                        scheduleLobbyDeletion(io, lobbyId, userId);
                    }
                }
            } catch (err) {
                console.error("Errore nella disconnessione del socket:", err);
            }

            // Registro l'ultima attività e faccio partire il timer di eliminazione del guest
            // (se l'account non è guest, deleteGuest non farà nulla)
            await updateLastSeen(userId);
            scheduleGuestDeletion(io, userId);
        });
    });
};

module.exports = initGameSocket;