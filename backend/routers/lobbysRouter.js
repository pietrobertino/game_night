const express = require('express');
const router = express.Router();
const lobbyController = require('../controllers/lobbyController');
const requireAuth = require('../middlewares/requireAuth');

//store new lobby
router.post('/', requireAuth, lobbyController.store);

//show lobby
router.get('/:lobbyCode', lobbyController.show);

//destroy lobby
router.delete('/:lobbyCode', requireAuth, lobbyController.destroy);

//Store player in attesa
router.post('/:lobbyCode/players', requireAuth, lobbyController.storeWaitingPlayer);

//Accettare player in attesa
router.post('/:lobbyCode/players/accept/:playerId', requireAuth, lobbyController.acceptWaitingPlayer);

//Index Players 
router.get('/:lobbyCode/players', lobbyController.indexPlayers);

//Destroy player from lobby (in attesa o membro)
router.delete('/:lobbyCode/players/:playerId', requireAuth, lobbyController.destroyPlayer);

//Leave lobby
router.delete('/:lobbyCode/players', requireAuth, lobbyController.leaveLobby);



//Show player from lobby
router.get('/:lobbyId/players/:playerId', lobbyController.showPlayer);


//Modify Lobby admin
router.patch('/:lobbyId/players/:playerId', lobbyController.modifyAdmin);

module.exports = router;