const cartModel = require('../models/cartModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Simulate payment processing (replace with real Stripe integration)

exports.createCart = async (req, res) => {
    try {
        const cart = await cartModel.createCart(req.body.userId);
        res.status(201).json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create cart' });
    }
};

exports.getCartByUserId = async (req, res) => {
    const userId = req.params.userId;
    console.log(`Received request to get cart for user ID: ${userId}`);

    try {
        let cart = await cartModel.getCartByUserId(userId);
        if (!cart) {
            // Create a new cart if none exists
            cart = await cartModel.createCart(userId);
        }
        res.json(cart);
    } catch (err) {
        console.error(`Error fetching cart for user ID ${userId}:`, err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

exports.addItemToCart = async (req, res) => {
    console.log(`Add item to cart request received: cartId=${req.params.cartId}, productId=${req.body.productId}, quantity=${req.body.quantity}`);
    try {
        const item = await cartModel.addItemToCart(
            req.params.cartId,
            req.body.productId,
            req.body.quantity
        );
        console.log('Item added to cart successfully:', item);
        res.status(201).json(item);
    } catch (err) {
        console.error('Error adding item to cart:', err);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
};


exports.removeItemFromCart = async (req, res) => {
    try {
        await cartModel.removeItemFromCart(req.params.itemId);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        await cartModel.clearCart(req.params.cartId);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
};

exports.checkoutCart = async (req, res) => {
    const cartId = req.params.cartId;
    const userId = req.user?.id;
    const paymentDetails = req.body.paymentDetails;

    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to checkout' });
    }

    try {
        const { order, clientSecret } = await cartModel.checkout(cartId, userId, paymentDetails);

        res.json({ message: 'Checkout initiated', order, clientSecret });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Checkout failed' });
    }
};

