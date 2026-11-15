const db = require('../data/db');
const games = require('../games');

const index = (req, res) => {

    const { search } = req.query;
    const showFavs = req.query.favourites === 'true';

    const userId = req.user.id;

    const queryParams = [];

    let sql =
        `SELECT
         g.id,
         g.game_slug,
         g.title,
         g.game_image,
         g.game_background,
         g.min_players
         FROM games g`;

    //se la ricerca chiede solo i preferiti allora la restringo a quelli
    if (showFavs) {
        queryParams.push(userId);
        sql += ` JOIN user_favourites uf ON g.id = uf.game_id
         WHERE uf.user_id = $1`;
    }

    //se è stata effettuata una ricerca aggiorno la query (usando ILIKE per case-insensitive in Postgres)
    if (search && search.trim() !== "") {
        queryParams.push(`%${search}%`);
        const placeholder = `$${queryParams.length}`;
        sql += showFavs ? ` AND g.title ILIKE ${placeholder}` : ` WHERE g.title ILIKE ${placeholder}`;
    }

    db.query(sql, queryParams, (err, result) => {

        if (err) return res.status(500).json({
            error: true,
            message: 'Database error',
            text: err.message
        });

        res.json(result.rows);

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
         WHERE game_slug = $1`;

    db.query(sql, [slug], (err, result) => {

        if (err) return res.status(500).json({
            error: true,
            message: 'Database error'
        });

        res.json(result.rows);

    })
}



const storeFavourite = (req, res) => {

    const { gameSlug } = req.params;
    const userId = req.user.id;

    //verifico che l'utente abbia un account
    db.query(`SELECT account_type FROM users WHERE id = $1`, [userId], (err, userRes) => {
        if (err) return res.status(500).json({ message: 'Internal Database error' });
        if (userRes.rows.length === 0) return res.status(404).json({ error: 'Not Found', message: 'User not in database' });
        if (userRes.rows[0].account_type !== 'registration') return res.status(403).json({ error: 'Forbidden', message: 'Devi avere un account per aggiungere un preferito' });

        //controllo che lo slug corrisponda ad un gioco esistente
        db.query(`SELECT id FROM games WHERE game_slug = $1`, [gameSlug], (err, gameRes) => {
            if (err) return res.status(500).json({ message: 'Internal Database error' });
            if (gameRes.rows.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Game not in database' });

            const gameId = gameRes.rows[0].id;

            //controllo che non sia già nei preferiti dell'utente
            db.query(`SELECT * FROM user_favourites WHERE game_id = $1 AND user_id = $2`, [gameId, userId], (err, results) => {
                if (err) return res.status(500).json({ message: 'Internal Database error' });
                if (results.rows.length !== 0) return res.status(409).json({ error: 'Conflict', message: 'Game already in favourites' });

                //lo aggiungo ai preferiti dell'utente
                db.query(`INSERT INTO user_favourites (game_id, user_id) VALUES ($1, $2)`, [gameId, userId], (err) => {
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
    db.query(`SELECT id FROM games WHERE game_slug = $1`, [gameSlug], (err, gameRes) => {
        if (err) return res.status(500).json({ message: 'Internal Database error' });
        if (gameRes.rows.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Game not in database' });

        const gameId = gameRes.rows[0].id;

        //lo rimuovo dai preferiti se lo trovo
        db.query(`DELETE FROM user_favourites WHERE game_id = $1 AND user_id = $2`, [gameId, userId], (err, result) => {
            if (err) return res.status(500).json({ message: 'Internal Database error' });
            if (result.rowCount === 0) return res.status(404).json({ error: 'Not Found', message: 'Game not in favourites' });
            res.status(204).json({ message: 'Gioco rimosso dai preferiti' });
        })

    })

}

const startGame = (req, res) => {

    const { lobbyCode, gameSlug } = req.params;
    const id = req.user.id;
    const io = req.app.get('io');

    //verifico che la lobby esista
    db.query(`SELECT id, admin_id FROM lobbys WHERE lobby_code = $1`, [lobbyCode], (err, lobbyResults) => {
        if (err) return res.status(500).json({ error: 'Internal Database error' });
        if (lobbyResults.rows.length === 0) return res.status(404).json({ error: 'Not Found', message: 'Lobby not found' });

        const lobby = lobbyResults.rows[0];

        //verifico che chi fa la richiesta sia l'admin
        if (lobby.admin_id !== id) return res.status(403).json({ error: 'Forbidden', message: 'Solo l\'admin può dare via al gioco' });

        //controllo quale è il gioco e se esiste
        db.query(`SELECT id FROM games WHERE game_slug = $1`, [gameSlug], (err, gameResults) => {
            if (err) return res.status(500).json({ error: 'Internal Database error' });

            const game = games[gameSlug]; // la logica del gioco, dal file games/
            if (gameResults.rows.length === 0 || !game) return res.status(404).json({ error: 'Not Found', message: 'Game not found' });

            //prendo i giocatori ammessi alla lobby
            db.query(
                `SELECT user_id, nickname FROM lobby_players WHERE lobby_id = $1 AND admission_status = 'admitted'`,
                [lobby.id],
                (err, playersRes) => {
                    if (err) return res.status(500).json({ error: 'Internal Database error' });

                    //aggiorno il current game id della tabella lobby e modifico lo stato della lobby da LOBBY a IN_GIOCO
                    db.query(
                        `UPDATE lobbys SET current_game_id = $1, global_status = $2 WHERE id = $3`,
                        [gameResults.rows[0].id, 'IN_GIOCO', lobby.id],
                        (err) => {
                            if (err) return res.status(500).json({ error: 'Internal Database error' });

                            //dipendentemente dal gioco eseguo la logica relativa
                            //assegno ad ogni giocatore i relativi dati di gioco ed emetto le informazioni tramite socket
                            game.start({ lobby, players: playersRes.rows, io }, (err) => {
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

module.exports = { index, show, storeFavourite, destroyFavourite, startGame };