const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated, orderController.createOrder);
router.get('/:userId', isAuthenticated, orderController.getOrdersByUserId);
router.put('/:orderId/status', isAuthenticated, orderController.updateOrderStatus);

module.exports = router;
