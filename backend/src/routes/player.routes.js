const express = require('express');
const { createPlayer, getPlayers, getPlayerById, updatePlayer, deletePlayer } = require('../controllers/player.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.get('/',        getPlayers);
router.get('/:id',     getPlayerById);
router.post('/',       upload.single('photo'), createPlayer);
router.put('/:id',     upload.single('photo'), updatePlayer);
router.delete('/:id',  deletePlayer);

module.exports = router;
