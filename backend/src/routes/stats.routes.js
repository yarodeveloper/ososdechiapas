const express = require('express');
const router = express.Router();
const statsController = require('../controllers/stats.controller');

router.get('/catalogs', statsController.getStatsCatalogs);
router.get('/match/:event_id', statsController.getMatchStats);
router.get('/player/:player_id', statsController.getPlayerResume);
router.get('/player/:player_id/history', statsController.getPlayerResume);
router.get('/leaderboard/global/mvps', statsController.getGlobalMvps);
router.get('/leaderboard/:category_id', statsController.getLeaderboard); // Nueva ruta para el top de jugadores
router.post('/', statsController.savePlayerStats);

module.exports = router;
