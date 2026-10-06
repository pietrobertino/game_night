const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');


// index
router.get('/', gameController.index);

// show
router.get('/:slug', gameController.show);

module.exports = router;