const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/category.controller');

// Categories
router.get('/', categoryController.getAllCategories);
router.post('/', categoryController.createCategory);
router.put('/:id', categoryController.updateCategory);
router.delete('/:id', categoryController.deleteCategory);

// Leagues
router.get('/leagues/all', categoryController.getAllLeagues);
router.post('/leagues', categoryController.createLeague);
router.put('/leagues/:id', categoryController.updateLeague);
router.delete('/leagues/:id', categoryController.deleteLeague);

module.exports = router;
