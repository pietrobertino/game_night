const jwt = require('jsonwebtoken');

// Crea il token e lo mette nel cookie. La uso in login e guest.
const cookieOptions = {
    httpOnly: true,
    secure: process.env.NODE_ENV === 'production',
    sameSite: 'lax',
    path: '/'
};

const setSessionCookie = (res, userId) => {
    const token = jwt.sign({ id: userId }, process.env.JWT_SECRET, { expiresIn: '30d' });
    res.cookie('session_token', token, { ...cookieOptions, maxAge: 30 * 24 * 60 * 60 * 1000 });
};

//import connection to databse
const db = require('../data/db');
//import bcrypt for hashing and reading passwords
const bcrypt = require('bcrypt');
//importo zod per validare mail e password
const { z } = require('zod');

const registerSchema = z.object({
    mail: z.string().trim().toLowerCase().email('Email non valida'),
    password: z.string().min(8, 'Minimo 8 caratteri')
});


//ottenuti mail e password di un account, comunico se si può accedere o meno
const accessAccount = (req, res) => {

    const { mail, password } = req.body;

    const sql = `SELECT id, email_address, password_hash, nickname, account_type FROM users WHERE email_address = ? `;

    db.query(sql, [mail], async (err, results) => {

        //gestisco errore interno database
        if (err) return res.status(500).json({
            error: true,
            message: err
        });

        //gestisco nessun risultato trovato
        if (results.length === 0) return res.status(404).json({ error: 'Account not found' });



        //verifico che le password corrispondando
        const match = await bcrypt.compare(password, results[0].password_hash);

        if (match) {

            //ottengo i dati di una possibile lobby a cui era connesso e i suoi preferiti
            const lobbySql = `SELECT l.lobby_code, l.admin_id , lp.admission_status
            FROM users u
            LEFT JOIN lobby_players lp ON lp.user_id = u.id
            LEFT JOIN lobbys l ON l.id = lp.lobby_id
            WHERE u.id = ?
            LIMIT 1`;

            db.query(lobbySql, [results[0].id], (err, lobbyRes) => {
                if (err) return res.status(500).json({ error: 'Internal database error' });

                //ottengo anche i giochi preferiti dell'utente
                db.query(`SELECT g.game_slug FROM user_favourites uf JOIN games g ON uf.game_id = g.id WHERE user_id = ?`, [results[0].id], (err, gameRes) => {
                    if (err) return res.status(500).json({ error: 'Internal database error' });

                    //setto il token del cookie con l'id dell'utente
                    setSessionCookie(res, results[0].id);
                    return res.status(200).json({
                        user: {
                            id: results[0].id,
                            nickname: results[0].nickname,
                            account_type: results[0].account_type,
                            ...lobbyRes[0]
                        },
                        favs: gameRes.map(game => game.game_slug)

                    });
                })

            });
        } else return res.status(401).json({ access: false, message: "Wrong password" });

    })

}

const store = (req, res) => {

    const { accountType } = req.params;

    const { nickname } = req.body; //mail, password possono essere vuoti (ingresso come guest)

    //valido il nickname
    if (nickname.length < 3 || nickname.length > 15) return res.status(400).json({ error: 'bad request', message: 'invalid nickname' });

    //verifico che nel caso in cui si stia registrando un nuovo account siano presenti mail e password nel body, e li valido tramite zod
    if (accountType === 'registration') {

        const { mail, password } = req.body;

        //devono essere presenti mail e password (e nickname)
        if (!mail || !password || !nickname) return res.status(400).json({ error: "bad request", message: "Password, Email or Nickname missing" });

        //validazione mail e password
        const result = registerSchema.safeParse({ mail, password });

        if (!result.success) {
            return res.status(400).json({
                error: true,
                message: result.error.issues[0].message
            });
        }

        const { mail: cleanMail, password: cleanPassword } = result.data; //aggiorno mail e password in modo da averle pulite per il database

        //verifico che non esista già un account registrato con quella mail
        const checkSql = 'SELECT email_address FROM users WHERE email_address = ?;';
        db.query(checkSql, [cleanMail], async (err, results) => {
            if (err) return res.status(500).json({ error: true, message: err });
            if (results.length > 0) return res.status(409).json({ error: true, message: 'the e-mail is already in the database' });

            //hash password 
            const hash = await bcrypt.hash(cleanPassword, 10);

            //inserisco la registrazione dell'account nel database
            const sql = `INSERT INTO users (email_address, password_hash, account_type, nickname) VALUES (?, ?, ?, ?);`

            db.query(sql, [cleanMail, hash, accountType, nickname], (err, results) => {
                if (err) return res.status(500).json({ error: true, message: err });

                //setto il token del cookie con l'id appena inserito
                setSessionCookie(res, results.insertId);
                res.status(201).json({
                    user: {
                        id: results.insertId,
                        nickname,
                        account_type: accountType
                    },
                    favs: []
                });
            })
        })


    }

    //caso ingresso come guest
    else if (accountType === 'guest') {
        //controllo che il nickname sia inserito
        if (!nickname) return res.status(400).json({ error: "bad request", message: "Nickname missing" });

        //inserisco il guest nel database
        const sql = `INSERT INTO users (email_address, password_hash, account_type, nickname) VALUES (null, null, ?, ?);`

        db.query(sql, [accountType, nickname], (err, results) => {
            if (err) return res.status(500).json({ error: true, message: err });

            setSessionCookie(res, results.insertId);
            res.status(201).json({
                id: results.insertId,
                nickname,
                account_type: accountType
            });
        })
    }


    //gestisco il caso in cui l'accountType non sia uno dei due previsti
    else return res.status(400).json({ error: 'bad request', message: 'invalid accountType' });

}

const destroyAccount = (req, res) => {

    const { password } = req.body;
    const id = req.user.id;

    //verifico come prima cosa che l'utente non faccia parte di una lobby

    db.query(`SELECT lobby_id FROM lobby_players WHERE user_id = ?`, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'database error', message: err });
        if (results.length > 0) return res.status(409).json({ err: 'Conflict', message: 'Non puoi eliminare un account mentre fai parte di una lobby' });

        //eseguo lo stesso processo di verifica della rotta access account
        const sql = `SELECT id, email_address, password_hash FROM users WHERE id = ? `;

        db.query(sql, [id], async (err, results) => {

            //gestisco errore interno database
            if (err) return res.status(500).json({
                error: true,
                message: err
            });

            //gestisco nessun risultato trovato
            if (results.length === 0) return res.status(404).json({ error: 'Account not found' });

            //verifico che le password corrispondando
            const match = await bcrypt.compare(password, results[0].password_hash);

            //se password corrisponde elimino l'account
            if (!match) return res.status(401).json({ access: false, message: "Password is wrong" });

            const deleteSql = `DELETE FROM users WHERE id = ?`;
            db.query(deleteSql, [id], (err, results) => {
                if (err) return res.status(500).json({ error: 'database error', message: err });
                res.status(200).json({ message: 'deletion complete' });
            })

        })


    })
}

// React la chiama all'apertura del sito per sapere se c'è già una sessione valida
const me = (req, res) => {

    const sql = `SELECT u.id, u.nickname, u.account_type, l.lobby_code, l.admin_id , lp.admission_status
                FROM users u
                LEFT JOIN lobby_players lp ON lp.user_id = u.id
                LEFT JOIN lobbys l ON l.id = lp.lobby_id
                WHERE u.id = ?
                LIMIT 1`;

    db.query(sql, [req.user.id], (err, results) => {
        if (err) return res.status(500).json({ error: 'Internal database error' });

        // il token è valido ma l'utente non esiste più (es. guest eliminato)
        if (results.length === 0) return res.status(401).json({ error: 'Unauthorized' });

        //ottengo anche i giochi preferiti dell'utente
        db.query(`SELECT g.game_slug FROM user_favourites uf JOIN games g ON uf.game_id = g.id WHERE user_id = ?`, [req.user.id], (err, gameRes) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });
            res.json({ user: results[0], favs: gameRes.map(game => game.game_slug) });
        })

    });
};

// il cookie è HttpOnly, quindi solo il server può cancellarlo
const logout = (req, res) => {

    const id = req.user.id;

    //verifico come prima cosa che l'utente non faccia parte di una lobby

    db.query(`SELECT lobby_id FROM lobby_players WHERE user_id = ?`, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'database error', message: err });
        if (results.length > 0) return res.status(409).json({ err: 'Conflict', message: 'Non puoi uscire dall account mentre fai parte di una lobby' });

        res.clearCookie('session_token', cookieOptions);
        res.json({ message: 'Logout effettuato' });
    })
};

const changeNickname = (req, res) => {

    const { nickname } = req.body;
    const id = req.user.id;

    //valido il nickname
    if (nickname.length <= 3 || nickname.length > 15) return res.status(400).json({ error: 'bad request', message: 'invalid nickname' });


    //verifico che l'utente non faccia parte di una lobby

    db.query(`SELECT user_id FROM lobby_players WHERE user_id = ?`, [id], (err, results) => {
        if (err) return res.status(500).json({ error: 'database error', message: err });
        if (results.length > 0) return res.status(409).json({ err: 'Conflict', message: 'Non puoi cambiare nickname mentre fai parte di una lobby' });

        db.query(`SELECT * FROM users WHERE id = ?`, [id], (err, results) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });
            if (results.length === 0) return res.status(404).json({ error: 'Not Found', message: 'User not found' });

            //verifico che il nickname non sia uguale a quello che stiamo inserendo
            db.query(`UPDATE users SET nickname = ? WHERE id = ? AND nickname <> ? `, [nickname, id, nickname], (err, result) => {
                if (err) return res.status(500).json({ error: 'Internal database error' });
                if (result.affectedRows === 0) return res.status(409).json({ error: 'Conflict', message: 'Same nickname as the saved one' });

                res.json({ id: req.user.id, nickname, message: 'Nickname aggiornato' });
            });
        })

    })
}


module.exports = { accessAccount, store, destroyAccount, me, logout, changeNickname };