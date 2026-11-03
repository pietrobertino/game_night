const express = require('express');
const router = express.Router();
const gameController = require('../controllers/gameController');
const requireAuth = require('../middlewares/requireAuth');


// index
router.get('/', gameController.index);

//index favourites
router.get(`/favourites`, requireAuth, gameController.indexFavourites);

// show
router.get('/:slug', gameController.show);

//Store favourite
router.post('/addFavourite/:gameSlug', requireAuth, gameController.storeFavourite);

//Delete favourite
router.delete('/removeFavourite/:gameSlug', requireAuth, gameController.destroyFavourite);

//start game
router.patch('/:lobbyCode/:gameSlug', requireAuth, gameController.startGame)

//end game



module.exports = router;