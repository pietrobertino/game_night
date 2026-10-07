const db = require('../data/db');

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

module.exports = { index, show };