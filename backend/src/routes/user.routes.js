const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');

// GET all parents
router.get('/parents', userController.getAllParents);

// POST create parent
router.post('/parents', userController.createParent);

module.exports = router;
