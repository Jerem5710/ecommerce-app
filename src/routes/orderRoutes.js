const express = require('express');
const router = express.Router();
const orderController = require('../controllers/orderController');

router.post('/', orderController.createOrder);
router.get('/:userId', orderController.getOrdersByUserId);
router.put('/:orderId/status', orderController.updateOrderStatus);

module.exports = router;
