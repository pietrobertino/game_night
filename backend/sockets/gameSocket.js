const jwt = require('jsonwebtoken');
const db = require('../data/db').promise();
const JWT_SECRET = process.env.JWT_SECRET;

// CONFIGURAZIONE ELIMINAZIONE ACCOUNT GUEST

// Quanto aspettare dopo una disconnessione prima di eliminare il guest.
const GUEST_DELETE_DELAY = 60 * 60 * 1000; // 60 minuti

// Dopo quanto tempo di inattività un guest viene eliminato dalla pulizia periodica.
const GUEST_MAX_INACTIVITY = '1 DAY'; // sintassi MySQL INTERVAL

// Ogni quanto far girare la pulizia periodica.
const CLEANUP_INTERVAL = 3 * 60 * 60 * 1000; // 3 ore

// Timer di eliminazione in attesa: userId -> timer.
// Serve per poter annullare l'eliminazione se la persona torna.
const deleteTimers = new Map();

// ---------------------------------------------------------------
// FUNZIONI DI SUPPORTO
// ---------------------------------------------------------------

// Controlla se l'utente ha almeno un socket connesso in questo momento.
// Ogni socket entra nella stanza "user_<id>" appena si connette.
const isUserConnected = async (io, userId) => {
    const sockets = await io.in(`user_${userId}`).fetchSockets();
    return sockets.length > 0;
};

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

// Aggiorna la data dell'ultima attività dell'utente.
const updateLastSeen = async (userId) => {
    try {
        await db.query(`UPDATE users SET last_seen = NOW() WHERE id = ?`, [userId]);
    } catch (err) {
        console.error('Errore aggiornamento last_seen:', err);
    }
};

// ---------------------------------------------------------------
// INIZIALIZZAZIONE SOCKET
// ---------------------------------------------------------------

const initGameSocket = (io) => {

    // Pulizia periodica dei guest inattivi.
    // Parte una volta all'avvio e poi ogni CLEANUP_INTERVAL.
    cleanupInactiveGuests(io);
    setInterval(() => cleanupInactiveGuests(io), CLEANUP_INTERVAL);

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

        // La persona è tornata: annullo l'eventuale eliminazione in attesa
        clearTimeout(deleteTimers.get(userId));
        deleteTimers.delete(userId);

        // Stanza personale dell'utente: serve a sapere se ha socket attivi
        socket.join(`user_${userId}`);

        // Segno che l'utente è attivo adesso
        await updateLastSeen(userId);

        // LOGICA DI RICONNESSIONE POST-CRASH
        try {
            const [players] = await db.query(
                `SELECT lobby_id, nickname FROM lobby_players WHERE user_id = ?`,
                [userId]
            );

            if (players.length > 0) {
                const activeLobby = players[0];
                const lobbyId = activeLobby.lobby_id;

                socket.join(`lobby_${lobbyId}`);

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
                    `SELECT lobby_id FROM lobby_players WHERE user_id = ?`,
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
                }
            } catch (err) {
                console.error("Errore nella disconnessione del socket:", err);
            }

            // Registro l'ultima attività e faccio partire il timer di eliminazione
            // (se l'account non è guest, deleteGuest non farà nulla)
            await updateLastSeen(userId);
            scheduleGuestDeletion(io, userId);
        });
    });
};

module.exports = initGameSocket;