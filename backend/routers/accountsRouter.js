const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Store account/guest 
router.post('/create/:accountType', accountController.store);

//access to an existing account
router.post('/', accountController.accessAccount)

// destroy account
router.post('/delete', accountController.destroyAccount);

//Store account favourite
router.post('/:mail/favourites/:gameId', accountController.storeFavourite);

//Delete account favourite
router.delete('/:mail/favourites/:gameId', accountController.destroyFavourite);


module.exports = router;