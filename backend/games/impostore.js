const db = require('../data/db');

module.exports = {

    start({ lobby, players, io }, callback) {
        const impostorCount = 1;

        //parola e indizio casuali
        db.query(`SELECT word, hint FROM impostor_words ORDER BY RAND() LIMIT 1`, (err, rows) => {
            if (err) return callback(err);
            const { word, hint } = rows[0];

            //scelgo gli impostori
            const impostorIds = [...players]
                .sort(() => Math.random() - 0.5)
                .slice(0, impostorCount)
                .map(p => p.user_id);

            //dati condivisi: li vedono tutti
            db.query(
                `UPDATE lobbys SET game_data = ? WHERE id = ?`,
                [JSON.stringify({ phase: 'discussion', round: 1 }), lobby.id],
                (err) => {
                    if (err) return callback(err);

                    //dati privati: uno per giocatore, salvati nel database e mandati solo a lui
                    let completed = 0;
                    let failed = false;

                    players.forEach(p => {
                        const data = impostorIds.includes(p.user_id)
                            ? { role: 'impostore', hint }
                            : { role: 'giocatore', word };

                        db.query(
                            `UPDATE lobby_players SET game_data = ? WHERE lobby_id = ? AND user_id = ?`,
                            [JSON.stringify(data), lobby.id, p.user_id],
                            (err) => {
                                if (failed) return;
                                if (err) {
                                    failed = true;
                                    return callback(err);
                                }

                                io.to(`user_${p.user_id}`).emit('game_private_data', data);

                                completed++;
                                if (completed === players.length) callback(null);
                            }
                        );
                    });
                }
            );
        });
    }
};