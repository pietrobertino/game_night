const { Pool, types } = require('pg');
require('dotenv').config();

// bigint (oid 20) viene restituito da pg come stringa: lo converto in numero
types.setTypeParser(20, (val) => parseInt(val, 10));

const db = new Pool({
    host: process.env.DB_HOST,
    user: process.env.DB_USER,
    password: process.env.DB_PASSWORD,
    database: process.env.DB_NAME,
    port: process.env.DB_PORT || 5432,
    ssl: {
        rejectUnauthorized: false // Necessario per le connessioni esterne a Supabase
    }
});

db.connect((err, client, release) => {
    if (err) {
        console.error('Errore critico di connessione a Supabase (PostgreSQL):', err.message);
        return;
    }
    console.log('Connessione a Supabase (PostgreSQL) riuscita');
    release();
});

module.exports = db;