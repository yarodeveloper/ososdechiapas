const express = require('express');
const router = express.Router();
const userController = require('../controllers/user.controller');
const { upload } = require('../middlewares/uploadMiddleware');

// GET all parents
router.get('/parents', userController.getAllParents);

// POST create parent
router.post('/parents', userController.createParent);

// PUT update password
router.put('/:id/password', userController.updatePassword);

// ── Coaches ──────────────────────────────────────────────
router.get('/coaches', userController.getAllCoaches);
router.post('/coaches', upload.single('avatar'), userController.createCoach);
router.get('/coaches/:id/credentials', userController.getCoachCredentials);
router.put('/coaches/:id/status', userController.updateCoachStatus);
router.delete('/coaches/:id', userController.deleteCoach);

module.exports = router;
