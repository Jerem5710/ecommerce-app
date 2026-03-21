const express = require('express');
const router = express.Router();
const cartController = require('../controllers/cartController');
const isAuthenticated = require('../middleware/isAuthenticated');

router.post('/', isAuthenticated,cartController.createCart);
router.get('/:userId', isAuthenticated, cartController.getCartByUserId);
router.post('/:cartId/items', isAuthenticated, cartController.addItemToCart);
router.delete('/items/:itemId', isAuthenticated, cartController.removeItemFromCart);
router.delete('/:cartId/items', isAuthenticated, cartController.clearCart);

// Checkout route
router.post('/:cartId/checkout', isAuthenticated, cartController.checkoutCart);

module.exports = router;
