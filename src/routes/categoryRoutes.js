const express = require('express');
const router = express.Router();
const categoryController = require('../controllers/categoryController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.get('/', isAuthenticated, categoryController.getAllCategories);

module.exports = router;