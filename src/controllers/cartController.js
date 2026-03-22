const cartModel = require('../models/cartModel');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);
// Simulate payment processing (replace with real Stripe integration)
const emailService = require('../utils/emailService');

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
        console.log('Starting checkout process for user:', userId, 'cart:', cartId);
        const { order, clientSecret } = await cartModel.checkout(cartId, userId, paymentDetails);
        console.log('Checkout order:', order);
        // Prepare order details string for email
        if (!order || !order.items || !Array.isArray(order.items) || order.items.length === 0) {
            return res.status(400).json({ error: 'Order creation failed or no items in order' });
        }
        const orderDetails = order.items
            .map(item => `${item.name} - $${parseFloat(item.price).toFixed(2)}`)
            .join('<br>');

        // Send purchase confirmation email
        try {
            await emailService.sendEmail(
                req.user.email,
                'Thank you for your purchase!',
                'checkout',
                {
                    logoUrl: 'https://yourstore.com/logo.png',
                    username: req.user.username,
                    orderDetails,
                    contactEmail: 'info@store.com',
                    contactPhone: '123-456-7890',
                    address: '123 Store St, City, Country',
                }
            );
            console.log('Purchase confirmation email sent successfully to', req.user.email);
        } catch (emailErr) {
            console.error('Failed to send purchase confirmation email:', emailErr);
            // Optionally continue without blocking response
        }
        res.json({ message: 'Checkout initiated', order, clientSecret });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Checkout failed' });
    }
};

