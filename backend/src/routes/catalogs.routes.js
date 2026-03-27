const express = require('express');
const { getPositions, getBloodTypes } = require('../controllers/catalogs.controller.js');

const router = express.Router();

router.get('/positions', getPositions);
router.get('/blood-types', getBloodTypes);

module.exports = router;
