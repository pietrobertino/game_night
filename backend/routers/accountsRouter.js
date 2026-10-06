const express = require('express');
const router = express.Router();
const accountController = require('../controllers/accountController');

// Store account/guest 
router.post('/:accountType', accountController.store);

//account show (access to an existing account)
router.get('/:mail', accountController.showAccount)

// destroy account
router.delete('/:mail', accountController.destroyAccount);


module.exports = router;