const express = require('express');
const router = express.Router();
const socialController = require('../controllers/social.controller');

router.get('/', socialController.getSocialPosts);
router.post('/', socialController.addSocialPost);
router.delete('/:id', socialController.deleteSocialPost);

module.exports = router;
