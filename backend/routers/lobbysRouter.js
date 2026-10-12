const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');

//store new lobby
router.post('/', lobbyController.store);

//show lobby
router.get('/:lobbyCode', lobbyController.show);

//destroy lobby
router.delete('/:lobbyCode', lobbyController.destroy);

//Store player in attesa
router.post('/:lobbyCode/players', lobbyController.storeWaitingPlayer);

//Accettare player in attesa
router.post('/:lobbyCode/players/accept/:playerId', lobbyController.acceptWaitingPlayer);

//Index Players 
router.get('/:lobbyCode/players', lobbyController.indexPlayers);

//Destroy player from lobby (in attesa o membro)
router.delete('/:lobbyCode/players/:playerId', lobbyController.destroyPlayer);

//Leave lobby
router.delete('/:lobbyCode/players', lobbyController.leaveLobby);



//Show player from lobby
router.get('/:lobbyId/players/:playerId', lobbyController.showPlayer);


//Modify Lobby admin
router.patch('/:lobbyId/players/:playerId', lobbyController.modifyAdmin);

module.exports = router;