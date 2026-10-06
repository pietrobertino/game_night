const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');

//store
router.post('/', lobbyController.store);

//destroy
router.delete('/:id', lobbyController.destroy);

//Index Players
router.get('/:id/players', lobbyController.playersIndex);

module.exports = router;