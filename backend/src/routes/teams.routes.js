const express = require('express');
const { createTeam, getTeams, updateTeam, deleteTeam } = require('../controllers/teams.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.get('/', getTeams);
router.post('/', upload.single('logo'), createTeam);
router.put('/:id', upload.single('logo'), updateTeam);
router.delete('/:id', deleteTeam);

module.exports = router;
