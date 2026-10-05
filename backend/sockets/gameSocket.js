const jwt = require('jsonwebtoken');
const db = require('../data/db');
const JWT_SECRET = process.env.JWT_SECRET;

const initGameSocket = (io) => {

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

        // LOGICA DI RICONNESSIONE POST-CRASH
        try {
            const [players] = await db.query(
                `SELECT lobby_id, nickname FROM LOBBY_PLAYERS WHERE user_id = ?`,
                [userId]
            );

            if (players.length > 0) {   
                const activeLobby = players[0];
                const lobbyId = activeLobby.lobby_id;

                socket.join(`lobby_${lobbyId}`);

                await db.query(
                    `UPDATE LOBBY_PLAYERS SET connection_status = 'ONLINE' WHERE lobby_id = ? AND user_id = ?`,
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
                    `SELECT lobby_id FROM LOBBY_PLAYERS WHERE user_id = ?`,
                    [userId]
                );

                if (players.length > 0) {
                    const lobbyId = players[0].lobby_id;

                    await db.query(
                        `UPDATE LOBBY_PLAYERS SET connection_status = 'OFFLINE' WHERE lobby_id = ? AND user_id = ?`,
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
        });
    });
};

module.exports = initGameSocket;
