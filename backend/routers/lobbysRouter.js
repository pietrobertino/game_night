const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');

//store
router.post('/', lobbyController.store);

//show lobby
router.get('/:id', lobbyController.show);

//destroy lobby
router.delete('/:id', lobbyController.destroy);

//Store Player in lobby
router.post('/:lobbyId/players/:playerId', lobbyController.storePlayer);

//Index Players
router.get('/:id/players', lobbyController.indexPlayers);

//Show player from lobby
router.get('/:lobbyId/players/:playerId', lobbyController.showPlayer);

//Destroy player from lobby 
router.delete('/:lobbyId/players/:playerId', lobbyController.destroyPlayer);

//Modify Lobby admin
router.patch('/:lobbyId/players/:playerId', lobbyController.modifyAdmin);

module.exports = router;