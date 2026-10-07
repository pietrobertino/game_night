const db = require('../data/db');

const showAccount = (req, res) => {
    const { mail } = req.params;
    res.send(`informazioni dell'account con mail ${mail}`);
}

const store = (req, res) => {
    const { accountType } = req.params;
    res.send(`Store account ${accountType}`);
}

const destroyAccount = (req, res) => {
    const { mail } = req.params;
    res.send(`eliminazione account con mail ${mail}`);
}

const storeFavourite = (req, res) => {

    const { mail, gameId } = req.params;

    res.send(`Aggiungo il gioco ${gameId} (se esiste) ai preferiti dell'account con mail ${mail}, se esiste `)
}

const destroyFavourite = (req, res) => {

    const { mail, gameId } = req.params;

    res.send(`Elimino il gioco ${gameId} dai preferiti (se questo esiste ed è presente) dell'account con mail ${mail}, se questo esiste`);
}

module.exports = { showAccount, store, destroyAccount, storeFavourite, destroyFavourite };