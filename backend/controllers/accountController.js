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

module.exports = { showAccount, store, destroyAccount };