const express = require('express');
const { createTeam, getTeams } = require('../controllers/teams.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.get('/', getTeams);
router.post('/', upload.single('logo'), createTeam);

module.exports = router;
