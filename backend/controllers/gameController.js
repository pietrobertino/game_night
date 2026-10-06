const db = require('../data/db');

const index = (req, res) => {
    res.send('rotta index games')
}

const show = (req, res) => {

    const { slug } = req.params;

    res.send(`rotta show game con slug ${slug}`);
}

module.exports = { index, show };