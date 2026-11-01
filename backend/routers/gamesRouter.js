const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const requireAuth = require('../middlewares/requireAuth');


// index
router.get('/', gameController.index);

// show
router.get('/:slug', gameController.show);

//start game
router.patch('/:lobbyCode/:gameSlug', requireAuth, gameController.startGame)

//end game

module.exports = router;