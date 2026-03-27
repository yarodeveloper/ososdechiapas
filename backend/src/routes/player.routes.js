const express = require('express');
const { createPlayer, getPlayers } = require('../controllers/player.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.post('/', upload.single('photo'), createPlayer);
router.get('/', getPlayers);

module.exports = router;
