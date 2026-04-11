const express = require('express');
const router = express.Router();
const announcementController = require('../controllers/announcement.controller');
const { upload } = require('../middlewares/uploadMiddleware');

router.get('/', announcementController.getAnnouncements);
router.post('/', upload.single('image'), announcementController.createAnnouncement);
router.delete('/:id', announcementController.deleteAnnouncement);

module.exports = router;
