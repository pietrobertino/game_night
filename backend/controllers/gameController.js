const db = require('../data/db');
const games = require('../games');

const index = (req, res) => {


    const sql =
        `SELECT
         id,
         game_slug,
         title,
         game_image,
         game_background,
         min_players
         FROM games;`;

    db.query(sql, (err, results) => {

        if (err) return res.status(500).json({
            error: true,
            message: 'Database error'
        });

        res.json(results);

    })

}

const show = (req, res) => {

    const { slug } = req.params;

    const sql =
        `SELECT
         id,
         game_slug,
         title,
         description,
         game_image,
         game_background,
         min_players,
         max_players
         FROM games
         WHERE game_slug = ?`;

    db.query(sql, [slug], (err, results) => {

        if (err) return res.status(500).json({
            error: true,
            message: 'Database error'
        });

        res.json(results);

    })
}

const indexFavourites = (req, res) => {

    const userId = req.user.id;
    const sql = `SELECT 
         g.id,
         g.game_slug,
         g.title,
         g.game_image,
         g.game_background,
         g.min_players
         FROM games g 
         JOIN user_favourites uf ON g.id = uf.game_id
         WHERE uf.user_id = ?`
    //prendo tutti i suoi preferiti
    db.query(sql, [userId], (err, results) => {
        if (err) return res.status(500).json({ message: 'Internal Database error' });
        res.json(results);
    })
}


const storeFavourite = (req, res) => {

    const { gameSlug } = req.params;
    const userId = req.user.id;

    //verifico che l'utente abbia un account
    db.query(`SELECT account_type FROM users WHERE id = ?`, [userId], (err, userRes) => {
        if (err) return res.status(500).json({ message: 'Internal Database error' });
        if (userRes.length === 0) return res.status(404).json({ error: 'Not Found', message: 'User not in database' });
        if (userRes[0].account_type !== 'registration') return res.status(403).json({ error: 'Forbidden', message: 'Devi avere un account per aggiungere un preferito' });
        //controllo che lo slug corrisponda ad un gioco esistente
        db.query(`SELECT id FROM games WHERE game_slug = ?`, [gameSlug], (err, gameRes) => {
            if (err) return res.status(500).json({ message: 'Internal Database error' });
            if (gameRes.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Game not in database' });
            //controllo che non sia già nei preferiti dell'utente
            db.query(`SELECT * FROM user_favourites WHERE game_id = ? AND user_id = ?`, [gameRes[0].id, userId], (err, results) => {
                if (err) return res.status(500).json({ message: 'Internal Database error' });
                if (results.length !== 0) return res.status(409).json({ error: 'Conflict', message: 'Game already in favourites' });
                //lo aggiungo ai preferiti dell'utente
                db.query(`INSERT INTO user_favourites (game_id, user_id) VALUES (?,?)`, [gameRes[0].id, userId], (err, finalRes) => {
                    if (err) return res.status(500).json({ message: 'Internal Database error' });
                    res.status(201).json({ message: 'Gioco aggiunto ai preferiti' });
                })

            })

        })
    })

}

const destroyFavourite = (req, res) => {

    const { gameSlug } = req.params;
    const userId = req.user.id;


    //controllo che lo slug corrisponda ad un gioco esistente
    db.query(`SELECT id FROM games WHERE game_slug = ?`, [gameSlug], (err, gameRes) => {
        if (err) return res.status(500).json({ message: 'Internal Database error' });
        if (gameRes.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Game not in database' });
        //lo rimuovo dai preferiti se lo trovo
        db.query(`DELETE FROM user_favourites WHERE game_id = ? AND user_id = ?`, [gameRes[0].id, userId], (err, results) => {
            if (err) return res.status(500).json({ message: 'Internal Database error' });
            if (results.affectedRows === 0) return res.status(404).json({ error: 'Not Found', message: 'Game not in favourites' });
            res.status(204).json({ message: 'Gioco rimosso dai preferiti' });
        })

    })

}

const startGame = (req, res) => {

    const { lobbyCode, gameSlug } = req.params;
    const id = req.user.id;
    const io = req.app.get('io');

    //verifico che la lobby esista
    db.query(`SELECT id, admin_id FROM lobbys WHERE lobby_code = ?`, [lobbyCode], (err, lobbyResults) => {
        if (err) return res.status(500).json({ error: 'Internal Database error' });
        if (lobbyResults.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });

        const lobby = lobbyResults[0];

        //verifico che chi fa la richiesta sia l'admin
        if (lobby.admin_id !== id) return res.status(403).json({ error: 'Forbidden', message: 'Solo l\'admin può dare via al gioco' });

        //controllo quale è il gioco e se esiste
        db.query(`SELECT id FROM games WHERE game_slug = ?`, [gameSlug], (err, gameResults) => {
            if (err) return res.status(500).json({ error: 'Internal Database error' });

            const game = games[gameSlug]; // la logica del gioco, dal file games/
            if (gameResults.length === 0 || !game) return res.status(404).json({ error: 'Not Found', message: 'Game not found' });

            //prendo i giocatori ammessi alla lobby
            db.query(
                `SELECT user_id, nickname FROM lobby_players WHERE lobby_id = ? AND admission_status = 'admitted'`,
                [lobby.id],
                (err, players) => {
                    if (err) return res.status(500).json({ error: 'Internal Database error' });

                    //aggiorno il current game id della tabella lobby e modifico lo stato della lobby da LOBBY a IN_GIOCO
                    db.query(
                        `UPDATE lobbys SET current_game_id = ?, global_status = ? WHERE id = ?`,
                        [gameResults[0].id, 'IN_GIOCO', lobby.id],
                        (err) => {
                            if (err) return res.status(500).json({ error: 'Internal Database error' });

                            //dipendentemente dal gioco eseguo la logica relativa
                            //assegno ad ogni giocatore i relativi dati di gioco ed emetto le informazioni tramite socket
                            game.start({ lobby, players, io }, (err) => {
                                if (err) return res.status(500).json({ error: 'Internal Database error' });

                                //avviso tutti i giocatori che la partita è iniziata
                                io.to(`lobby_${lobby.id}`).emit('game_started', { gameSlug });
                                res.json({ message: 'Partita avviata' });
                            });
                        }
                    );
                }
            );
        });
    });
};

module.exports = { index, indexFavourites, show, storeFavourite, destroyFavourite, startGame };