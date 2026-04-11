const express = require('express');
const { getDashboardMatches, getLiveMatch, getMatchDetails, updateLiveMatch } = require('../controllers/matches.controller.js');

const router = express.Router();

router.get('/dashboard', getDashboardMatches);
router.get('/live', getLiveMatch);
router.get('/details/:id', getMatchDetails); // Legacy/specific
router.get('/:id', getMatchDetails);         // Standard access
router.post('/update-live/:id', updateLiveMatch);

module.exports = router;
