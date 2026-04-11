const express = require('express');
const { createPlayer, getPlayers, getPlayerById, updatePlayer, deletePlayer, getPlayersByParent, getPlayersByCategory } = require('../controllers/player.controller.js');
const { upload } = require('../middlewares/uploadMiddleware.js');

const router = express.Router();

router.get('/',        getPlayers);
router.get('/:id',     getPlayerById);
router.get('/parent/:parentId', getPlayersByParent);
router.get('/category/:categoryId', getPlayersByCategory);
router.post('/',       upload.single('photo'), createPlayer);
router.put('/:id',     upload.single('photo'), updatePlayer);
router.delete('/:id',  deletePlayer);

module.exports = router;
