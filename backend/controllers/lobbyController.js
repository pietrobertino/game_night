const db = require('../data/db');

const store = (req, res) => {
    res.send('Creazione nuova lobby');
}

const show = (req, res) => {

    const { id } = req.params;

    res.send(`Dati della lobby con id ${id}, se esiste`);
}

const destroy = (req, res) => {

    const { id } = req.params;

    res.send(`Eliminazione lobby con id ${id}, se esiste`);
}

const storePlayer = (req, res) => {

    const { lobbyId, playerId } = req.params;

    res.send(`Aggiungo il giocatore id:${playerId} alla lobby id:${lobbyId}, se entrambi esistono e se la lobby non ha raggiunto la massima capacità`);
}

const indexPlayers = (req, res) => {

    const { id } = req.params;

    res.send(`Tutti i giocatori della lobby con id ${id}, se essa esiste`);
}

const showPlayer = (req, res) => {

    const { lobbyId, playerId } = req.params;

    res.send(`Dati del giocatore id:${playerId} della lobby id:${lobbyId}, se entrambi esistono`);
}

const destroyPlayer = (req, res) => {

    const { lobbyId, playerId } = req.params;

    res.send(`Eliminato il giocatore id:${playerId} dalla lobby id:${lobbyId}, se entrambi esistono`);
}

const modifyAdmin = (req, res) => {

    const { lobbyId, playerId } = req.params;

    res.send(`L'admin della lobby ${lobbyId} (se questa esiste) diventa il giocatore ${playerId}, se questo esiste, fa parte della lobby e non è già l'admin`)
}

module.exports = { store, show, destroy, indexPlayers, destroyPlayer, showPlayer, storePlayer, modifyAdmin };