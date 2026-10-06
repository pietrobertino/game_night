const db = require('../data/db');

const store = (req, res) => {
    res.send('rotta store lobby');
}

const destroy = (req, res) => {

    const { id } = req.params;

    res.send(`rotta destroy lobby con id ${id}`);
}

const playersIndex = (req, res) => {

    const { id } = req.params;

    res.send(`rotta index dei giocatori della lobby con id ${id}`);
}

module.exports = { store, destroy, playersIndex };