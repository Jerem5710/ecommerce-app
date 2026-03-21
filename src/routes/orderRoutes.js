const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/isAuthenticated');
const isAdmin = require('../middleware/isAdmin');

router.post('/', isAuthenticated, orderController.createOrder);
router.get('/:userId', isAuthenticated, orderController.getOrdersByUserId);
router.put('/:orderId/status', isAuthenticated, orderController.updateOrderStatus);

// Admin route to get all orders, optionally filtered by userId query param
router.get('/', isAuthenticated, isAdmin, orderController.getAllOrders);

module.exports = router;
