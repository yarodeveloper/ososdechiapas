const express = require('express');
const router = express.Router();
const authController = require('../controllers/auth.controller');

// POST /api/auth/login
router.post('/login', authController.login);

// POST /api/auth/update-first-password
router.post('/update-first-password', authController.updateFirstPassword);

// POST /api/auth/update-profile
router.post('/update-profile', authController.updateProfile);

// POST /api/auth/forgot-password
router.post('/forgot-password', authController.forgotPassword);

module.exports = router;
