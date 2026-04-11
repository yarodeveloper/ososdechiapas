const express = require('express');
const router = express.Router();
const calendarController = require('../controllers/calendar.controller');

router.get('/', calendarController.getEvents);
router.post('/', calendarController.createEvent);
router.put('/:id', calendarController.updateEvent); // Ruta general de actualización
router.put('/:id/score', calendarController.updateEvent); // Compatible con la anterior
router.delete('/:id', calendarController.deleteEvent);

module.exports = router;
