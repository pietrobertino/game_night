const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');
const requireAuth = require('../middlewares/requireAuth');

//informazioni sul mio account/ ottengo l'id
router.get('/me', requireAuth, accountController.me);

//logout
router.post('/logout', requireAuth, accountController.logout);

// Store account/guest 
router.post('/create/:accountType', accountController.store);

//access to an existing account
router.post('/', accountController.accessAccount)

// destroy account
router.post('/delete', requireAuth, accountController.destroyAccount);

//change nickname
router.patch('/changeNickname', requireAuth, accountController.changeNickname);


//Store account favourite
router.post('/:mail/favourites/:gameId', accountController.storeFavourite);

//Delete account favourite
router.delete('/:mail/favourites/:gameId', accountController.destroyFavourite);



module.exports = router;