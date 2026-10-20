const db = require('../data/db');

const store = (req, res) => {

    const chars = '23456789ABCDEFGHJKLMNPQRSTUVWXYZ';

    //funzione per generare codice univoco
    const generateUniqueCode = (callback) => {
        //genero un codice per la lobby
        let lobbyCode = '';
        for (let i = 0; i < 6; i++) {
            lobbyCode += chars[Math.floor(Math.random() * chars.length)];
        }
        //verifico che il codice della lobby non sia già in uso
        db.query('SELECT lobby_code FROM lobbys WHERE lobby_code = ?', [lobbyCode], (err, results) => {
            if (err) return callback(err);
            if (results.length > 0) return generateUniqueCode(callback); // duplicato: riprovo
            callback(null, lobbyCode); // codice libero
        });
    }

    const adminId = req.user.id;


    //verifico che l'id dell'admin sia veramente associato ad un account presente nel db
    const adminSql = `SELECT id, nickname FROM users WHERE id = ?`;
    db.query(adminSql, [adminId], (adminErr, adminResults) => {
        if (adminErr) return res.status(500).json({ error: 'Internal database error' });
        if (adminResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Invalid Admin ID' })

        //l'admin esiste, quindi genero il codice univoco
        generateUniqueCode((codeErr, lobbyCode) => {
            if (codeErr) return res.status(500).json({ error: 'Internal database error' });

            //inserisco i dati della lobby che ho creato nel database
            const insertSql = `INSERT INTO lobbys (lobby_code, admin_id) VALUES (?, ?);`;
            db.query(insertSql, [lobbyCode, adminId], (lobbyInsertErr, lobbyInsertResults) => {
                if (lobbyInsertErr) return res.status(500).json({ error: 'Internal database error' });

                //inserisco i dati della lobby e dell'admin in lobby_players
                const sql = `INSERT INTO lobby_players (lobby_id, user_id, nickname, player_role, admission_status ) VALUES (?,?,?,?,?)`;
                db.query(sql, [lobbyInsertResults.insertId, adminId, adminResults[0].nickname, 'admin', 'admitted'], (err, results) => {
                    if (err) return res.status(500).json({ error: 'Internal database error' });

                    //inserisco il socket dell'admin nel gruppo di socket della lobby
                    const io = req.app.get('io');
                    io.in(`user_${adminId}`).socketsJoin(`lobby_${lobbyInsertResults.insertId}`);

                    res.status(201).json({
                        lobby_id: lobbyInsertResults.insertId,
                        lobby_code: lobbyCode,
                        message: 'Lobby creata correttamente'
                    });
                });
            });
        });
    });
}

const show = (req, res) => {

    const { lobbyCode } = req.params;

    const showSql = `SELECT * FROM lobbys WHERE lobby_code = ?`;
    db.query(showSql, [lobbyCode], (err, results) => {
        if (err) return res.status(500).json({ error: 'Internal database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Not Found', message: `no existing lobby with code ${lobbyCode}` });
        res.status(200).json(results[0]);
    })

}

const destroy = (req, res) => {

    const { lobbyCode } = req.params;
    const userId = req.user.id;


    //cerco lobby ed admin
    const lobbySql = `SELECT id, admin_id FROM lobbys WHERE lobby_code = ?`;
    db.query(lobbySql, [lobbyCode], (err, results) => {
        if (err) return res.status(500).json({ error: 'Internal database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });

        const lobby = results[0];

        // verifico che l'user sia l'admin della lobby
        if (lobby.admin_id !== userId) {
            return res.status(403).json({ error: 'Forbidden', message: 'Solo l\'admin può eliminare la lobby' });
        }

        // elimino la lobby (tutto ciò che è collegato viene eliminato automaticamente da on delete cascade)
        db.query(`DELETE FROM lobbys WHERE id = ?`, [lobby.id], (err) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });

            const io = req.app.get('io');
            io.to(`lobby_${lobby.id}`).emit('lobby_deleted');
            io.in(`lobby_${lobby.id}`).socketsLeave(`lobby_${lobby.id}`);

            res.json({ message: 'Lobby eliminata correttamente' });
        });

    });
}

const storeWaitingPlayer = (req, res) => {

    const { lobbyCode } = req.params;
    const userId = req.user.id;

    //verifico che il giocatore sia nel database e ne prendo il nickname e l'id
    const playerSql = `SELECT id, nickname FROM users WHERE id = ?`;
    db.query(playerSql, [userId], (playerErr, playerResults) => {
        if (playerErr) return res.status(500).json({ error: 'Internal database error' });
        if (playerResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'User not found' });

        //se il giocatore è presente, verifico che la lobby sia presente
        const lobbySql = `SELECT id FROM lobbys WHERE lobby_code = ? `;
        db.query(lobbySql, [lobbyCode], (lobbyErr, lobbyResults) => {
            if (lobbyErr) return res.status(500).json({ error: 'Internal database error' });
            if (lobbyResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });

            //se anche la lobby è presente, verifico che il giocatore non sia già presente nella lobby
            const playerLobbySql = `SELECT * FROM lobby_players WHERE lobby_id = ? AND user_id = ?`;
            db.query(playerLobbySql, [lobbyResults[0].id, userId], (playerLobbyErr, playerLobbyResults) => {
                if (playerLobbyErr) return res.status(500).json({ error: 'Internal database error' });
                if (playerLobbyResults.length > 0) return res.status(409).json({ error: 'Conflict', message: 'Player already in lobby' });

                //verificato che l'utente non è già presente il lobby, lo aggiungo come giocatore in attesa (defalut)
                const insertSql = `INSERT INTO lobby_players (lobby_id, user_id, nickname) VALUES (?,?,?)`;
                db.query(insertSql, [lobbyResults[0].id, userId, playerResults[0].nickname], (err, results) => {
                    if (err) return res.status(500).json({ error: 'Internal database error' });

                    //avviso l'admin della richiesta
                    const io = req.app.get('io');
                    io.to(`lobby_${lobbyResults[0].id}`).emit('player_requested', {
                        userId,
                        nickname: playerResults[0].nickname
                    });

                    res.status(201).json({
                        message: 'Richiesta inviata correttamente'
                    });
                });
            });
        });
    });
}

const acceptWaitingPlayer = (req, res) => {
    const { lobbyCode, playerId } = req.params;
    const userId = req.user.id;

    //ottengo l'id della lobby e verifico che esista
    db.query(`SELECT id, admin_id FROM lobbys WHERE lobby_code = ?`, [lobbyCode], (lobbyErr, lobbyResults) => {
        if (lobbyErr) return res.status(500).json({ error: 'Internal database error' });
        if (lobbyResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });

        //verifico che l'user sia l'admin della lobby
        if (lobbyResults[0].admin_id !== userId) {
            return res.status(403).json({ error: 'Forbidden', message: 'Solo l\'admin può accettare giocatori nella lobby' });
        }

        //Cerco il player all'interno della lobby, verifico che non sia già stato ammesso, e lo ammetto
        const searchSql = `SELECT * FROM lobby_players WHERE lobby_id = ? AND user_id = ?;`;
        db.query(searchSql, [lobbyResults[0].id, playerId], (playerErr, playerResults) => {
            if (playerErr) return res.status(500).json({ error: 'Internal database error' });
            if (playerResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Player not found' });

            //se ho trovato il player, cambio la sua richiesta da pending a admitted 
            db.query(`UPDATE lobby_players SET admission_status = 'admitted' WHERE lobby_id = ? AND user_id = ? AND admission_status = 'pending';`, [lobbyResults[0].id, playerId], (admissionErr, admissionResults) => {
                if (admissionErr) return res.status(500).json({ error: 'Internal database error' });
                if (admissionResults.affectedRows === 0) return res.status(409).json({ error: 'Conflict', message: 'Player already in lobby' });

                //aggiungo il socket al gruppo di socket della lobby
                const io = req.app.get('io');
                io.in(`user_${playerId}`).socketsJoin(`lobby_${lobbyResults[0].id}`);

                //avviso gli altri giocatori
                io.to(`lobby_${lobbyResults[0].id}`).emit('player_joined', {
                    userId: Number(playerId),
                    nickname: playerResults[0].nickname
                });

                res.status(201).json({
                    message: 'Giocatore accettato in lobby'
                });
            });
        });
    });

};

const indexPlayers = (req, res) => {

    const { lobbyCode } = req.params;

    //Cerco tutti i giocatori della lobby, se essa esiste
    const sql = `SELECT lp.user_id AS userId, lp.nickname, lp.player_role, lp.admission_status, lp.connection_status FROM lobbys l JOIN lobby_players lp ON lp.lobby_id = l.id WHERE l.lobby_code = ?;`
    db.query(sql, [lobbyCode], (err, results) => {
        if (err) return res.status(500).json({ error: 'Internal database error' });
        if (results.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby Not Found' });
        res.json(results);
    })
}

const showPlayer = (req, res) => {

    const { lobbyId, playerId } = req.params;

    res.send(`Dati del giocatore id:${playerId} della lobby id:${lobbyId}, se entrambi esistono`);
}

const destroyPlayer = (req, res) => {

    const { lobbyCode, playerId } = req.params;
    const userId = req.user.id;


    //ottengo l'id della lobby e verifico che esista
    db.query(`SELECT id, admin_id FROM lobbys WHERE lobby_code = ?`, [lobbyCode], (lobbyErr, lobbyResults) => {
        if (lobbyErr) return res.status(500).json({ error: 'Internal database error' });
        if (lobbyResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });

        //verifico che l'user sia l'admin della lobby
        if (lobbyResults[0].admin_id !== userId) {
            return res.status(403).json({ error: 'Forbidden', message: 'Solo l\'admin può eliminare giocatori dalla lobby' });
        }

        //Elimino il giocatore dalla lobby se presente, altrimenti segnalo di non averlo trovato
        const searchSql = `DELETE FROM lobby_players WHERE lobby_id = ? AND user_id = ?;`;
        db.query(searchSql, [lobbyResults[0].id, playerId], (err, results) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Not Found', message: 'Player not found' });

            const io = req.app.get('io');
            const targetId = Number(playerId);

            io.to(`lobby_${lobbyResults[0].id}`).emit('player_removed', { userId: targetId });
            io.in(`user_${targetId}`).socketsLeave(`lobby_${lobbyResults[0].id}`);

            res.status(201).json({
                message: 'Giocatore eliminato dalla lobby'
            });
        });
    });
}

const leaveLobby = (req, res) => {

    const { lobbyCode } = req.params;
    const userId = req.user.id;

    //Verifico l'esistenza della lobby e ne prendo l'id
    db.query(`SELECT id, admin_id FROM lobbys WHERE lobby_code = ?`, [lobbyCode], (lobbyErr, lobbyResults) => {
        if (lobbyErr) return res.status(500).json({ error: 'Internal database error' });
        if (lobbyResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });


        //Elimino il giocatore dalla lobby se presente, altrimenti segnalo di non averlo trovato
        const searchSql = `DELETE FROM lobby_players WHERE lobby_id = ? AND user_id = ?;`;
        db.query(searchSql, [lobbyResults[0].id, userId], (err, results) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Not Found', message: 'Player not found' });

            const io = req.app.get('io');

            io.in(`user_${userId}`).socketsLeave(`lobby_${lobbyResults[0].id}`);
            io.to(`lobby_${lobbyResults[0].id}`).emit('player_left', { userId });

            res.status(201).json({
                message: 'Giocatore eliminato dalla lobby'
            });
        });
    });

}

const modifyAdmin = (req, res) => {

    const { lobbyId, playerId } = req.params;

    res.send(`L'admin della lobby ${lobbyId} (se questa esiste) diventa il giocatore ${playerId}, se questo esiste, fa parte della lobby e non è già l'admin`)
}

module.exports = { store, show, destroy, indexPlayers, destroyPlayer, showPlayer, storeWaitingPlayer, acceptWaitingPlayer, modifyAdmin, leaveLobby };