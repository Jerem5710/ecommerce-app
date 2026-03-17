const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');

router.post('/', cartController.createCart);
router.get('/:userId', cartController.getCartByUserId);
router.post('/:cartId/items', cartController.addItemToCart);
router.delete('/items/:itemId', cartController.removeItemFromCart);
router.delete('/:cartId/items', cartController.clearCart);

// Checkout route
router.post('/:cartId/checkout', cartController.checkoutCart);

module.exports = router;
