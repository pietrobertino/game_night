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

    const sql = `SELECT id, email_address, password_hash, nickname, account_type FROM users WHERE email_address = $1 `;

    db.query(sql, [mail], async (err, result) => {

        //gestisco errore interno database
        if (err) return res.status(500).json({
            error: true,
            message: err.message
        });

        //gestisco nessun risultato trovato
        if (result.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

        const user = result.rows[0];

        //verifico che le password corrispondando
        const match = await bcrypt.compare(password, user.password_hash);

        if (match) {

            //ottengo i dati di una possibile lobby a cui era connesso e i suoi preferiti
            const lobbySql = `SELECT l.lobby_code, l.admin_id , lp.admission_status
            FROM users u
            LEFT JOIN lobby_players lp ON lp.user_id = u.id
            LEFT JOIN lobbys l ON l.id = lp.lobby_id
            WHERE u.id = $1
            LIMIT 1`;

            db.query(lobbySql, [user.id], (err, lobbyRes) => {
                if (err) return res.status(500).json({ error: 'Internal database error' });

                //ottengo anche i giochi preferiti dell'utente
                db.query(`SELECT g.game_slug FROM user_favourites uf JOIN games g ON uf.game_id = g.id WHERE user_id = $1`, [user.id], (err, gameRes) => {
                    if (err) return res.status(500).json({ error: 'Internal database error' });

                    //setto il token del cookie con l'id dell'utente
                    setSessionCookie(res, user.id);
                    return res.status(200).json({
                        user: {
                            id: user.id,
                            nickname: user.nickname,
                            account_type: user.account_type,
                            ...(lobbyRes.rows[0] || {})
                        },
                        favs: gameRes.rows.map(game => game.game_slug)

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
    if (!nickname || nickname.length < 3 || nickname.length > 15) return res.status(400).json({ error: 'bad request', message: 'invalid nickname' });

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
        const checkSql = 'SELECT email_address FROM users WHERE email_address = $1;';
        db.query(checkSql, [cleanMail], async (err, result) => {
            if (err) return res.status(500).json({ error: true, message: err.message });
            if (result.rows.length > 0) return res.status(409).json({ error: true, message: 'the e-mail is already in the database' });

            //hash password 
            const hash = await bcrypt.hash(cleanPassword, 10);

            //inserisco la registrazione dell'account nel database (usiamo RETURNING id per recuperare l'id generato)
            const sql = `INSERT INTO users (email_address, password_hash, account_type, nickname) VALUES ($1, $2, $3, $4) RETURNING id;`

            db.query(sql, [cleanMail, hash, accountType, nickname], (err, insertResult) => {
                if (err) return res.status(500).json({ error: true, message: err.message });

                const newUserId = insertResult.rows[0].id;
                //setto il token del cookie con l'id appena inserito
                setSessionCookie(res, newUserId);
                res.status(201).json({
                    user: {
                        id: newUserId,
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
        const sql = `INSERT INTO users (email_address, password_hash, account_type, nickname) VALUES (null, null, $1, $2) RETURNING id;`

        db.query(sql, [accountType, nickname], (err, insertResult) => {
            if (err) return res.status(500).json({ error: true, message: err.message });

            const newUserId = insertResult.rows[0].id;
            setSessionCookie(res, newUserId);
            res.status(201).json({
                id: newUserId,
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

    db.query(`SELECT lobby_id FROM lobby_players WHERE user_id = $1`, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'database error', message: err.message });
        if (result.rows.length > 0) return res.status(409).json({ err: 'Conflict', message: 'Non puoi eliminare un account mentre fai parte di una lobby' });

        //eseguo lo stesso processo di verifica della rotta access account
        const sql = `SELECT id, email_address, password_hash FROM users WHERE id = $1 `;

        db.query(sql, [id], async (err, userResult) => {

            //gestisco errore interno database
            if (err) return res.status(500).json({
                error: true,
                message: err.message
            });

            //gestisco nessun risultato trovato
            if (userResult.rows.length === 0) return res.status(404).json({ error: 'Account not found' });

            const user = userResult.rows[0];

            //verifico che le password corrispondando
            const match = await bcrypt.compare(password, user.password_hash);

            //se password corrisponde elimino l'account
            if (!match) return res.status(401).json({ access: false, message: "Password is wrong" });

            const deleteSql = `DELETE FROM users WHERE id = $1`;
            db.query(deleteSql, [id], (err) => {
                if (err) return res.status(500).json({ error: 'database error', message: err.message });
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
                WHERE u.id = $1
                LIMIT 1`;

    db.query(sql, [req.user.id], (err, result) => {
        if (err) return res.status(500).json({ error: 'Internal database error' });

        // il token è valido ma l'utente non esiste più (es. guest eliminato)
        if (result.rows.length === 0) return res.status(401).json({ error: 'Unauthorized' });

        const user = result.rows[0];

        //ottengo anche i giochi preferiti dell'utente
        db.query(`SELECT g.game_slug FROM user_favourites uf JOIN games g ON uf.game_id = g.id WHERE user_id = $1`, [req.user.id], (err, gameRes) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });
            res.json({ user, favs: gameRes.rows.map(game => game.game_slug) });
        })

    });
};

// il cookie è HttpOnly, quindi solo il server può cancellarlo
const logout = (req, res) => {

    const id = req.user.id;

    //verifico come prima cosa che l'utente non faccia parte di una lobby

    db.query(`SELECT lobby_id FROM lobby_players WHERE user_id = $1`, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'database error', message: err.message });
        if (result.rows.length > 0) return res.status(409).json({ err: 'Conflict', message: 'Non puoi uscire dall account mentre fai parte di una lobby' });

        res.clearCookie('session_token', cookieOptions);
        res.json({ message: 'Logout effettuato' });
    })
};

const changeNickname = (req, res) => {

    const { nickname } = req.body;
    const id = req.user.id;

    //valido il nickname
    if (!nickname || nickname.length <= 3 || nickname.length > 15) return res.status(400).json({ error: 'bad request', message: 'invalid nickname' });


    //verifico che l'utente non faccia parte di una lobby

    db.query(`SELECT user_id FROM lobby_players WHERE user_id = $1`, [id], (err, result) => {
        if (err) return res.status(500).json({ error: 'database error', message: err.message });
        if (result.rows.length > 0) return res.status(409).json({ err: 'Conflict', message: 'Non puoi cambiare nickname mentre fai parte di una lobby' });

        //verifico che il nickname non sia uguale a quello che stiamo inserendo
        db.query(`UPDATE users SET nickname = $1 WHERE id = $2 AND nickname <> $1 `, [nickname, id], (err, updateResult) => {
            if (err) return res.status(500).json({ error: 'Internal database error' });
            if (updateResult.rowCount === 0) return res.status(409).json({ error: 'Conflict', message: 'Same nickname as the saved one or user not found' });

            res.json({ id, nickname, message: 'Nickname aggiornato' });
        });

    })
}


module.exports = { accessAccount, store, destroyAccount, me, logout, changeNickname };