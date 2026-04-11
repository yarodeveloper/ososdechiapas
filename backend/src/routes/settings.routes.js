const express = require('express');
const router = express.Router();
const settingsController = require('../controllers/settings.controller');

// GET /api/settings
router.get('/', settingsController.getSettings);

// POST /api/settings
router.post('/', settingsController.updateSettings);

module.exports = router;
