const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET all parents
router.get('/parents', userController.getAllParents);

module.exports = router;
