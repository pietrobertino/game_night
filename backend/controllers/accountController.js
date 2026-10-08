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

    const sql = `SELECT id, email_address, password_hash, nickname FROM users WHERE email_address = ? `;

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
            return res.status(200).json({ access: true, message: 'Accesso riuscito' });
        } else return res.status(401).json({ access: false, message: "Password is wrong" });

    })

}

const store = async (req, res) => {

    const { accountType } = req.params;

    const { nickname } = req.body; //mail, password possono essere vuoti (ingresso come guest)

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
        db.query(checkSql, [cleanMail], (err, results) => {
            if (err) return res.status(500).json({ error: true, message: err });
            if (results.length > 0) return res.status(409).json({ error: true, message: 'the e-mail is already in the database' });
        })


        //hash password 
        const hash = await bcrypt.hash(cleanPassword, 10);

        //inserisco la registrazione dell'account nel database
        const sql = `INSERT INTO users (email_address, password_hash, account_type, nickname) VALUES (?, ?, ?, ?);`

        db.query(sql, [cleanMail, hash, accountType, nickname], (err, results) => {

            //gestisco errore db 
            if (err) return res.status(500).json({ error: true, message: err });

            //comunico risultato dell'operazione
            res.status(201).json({ message: 'Account inserito correttamente' });
        })
    }

    //caso ingresso come guest
    else if (accountType === 'guest') {
        //controllo che il nickname sia inserito
        if (!nickname) return res.status(400).json({ error: "bad request", message: "Nickname missing" });

        //inserisco il guest nel database
        const sql = `INSERT INTO users (email_address, password_hash, account_type, nickname) VALUES (null, null, ?, ?);`

        db.query(sql, [accountType, nickname], (err, results) => {

            //gestisco errore db 
            if (err) return res.status(500).json({ error: true, message: err });

            //comunico risultato dell'operazione
            res.status(201).json({ message: 'Guest inserito correttamente' });
        })
    }
    //come fare in modo di eliminare l'account dopo tot tempo dal database?

    //gestisco il caso in cui l'accountType non sia uno dei due previsti
    else return res.status(400).json({ error: 'bad request', message: 'invalid accountType' });

}

const destroyAccount = (req, res) => {

    const { mail, password } = req.body;

    //eseguo lo stesso processo di verifica della rotta access account
    const sql = `SELECT id, email_address, password_hash FROM users WHERE email_address = ? `;

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

        //se email e password corrispondono elimino l'account
        if (!match) return res.status(401).json({ access: false, message: "Password is wrong" });

        const deleteSql = `DELETE FROM users WHERE email_address = ?`;
        db.query(deleteSql, [mail], (err, results) => {
            if (err) return res.status(500).json({ error: 'database error', message: err });
            res.status(200).json({ message: 'deletion complete' });
        })


    })
}

const storeFavourite = (req, res) => {

    const { mail, gameId } = req.params;

    res.send(`Aggiungo il gioco ${gameId} (se esiste) ai preferiti dell'account con mail ${mail}, se esiste `)
}

const destroyFavourite = (req, res) => {

    const { mail, gameId } = req.params;

    res.send(`Elimino il gioco ${gameId} dai preferiti (se questo esiste ed è presente) dell'account con mail ${mail}, se questo esiste`);
}

module.exports = { accessAccount, store, destroyAccount, storeFavourite, destroyFavourite };