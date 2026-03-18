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
    try {
        const cart = await cartModel.getCartByUserId(req.params.userId);
        if (cart) res.json(cart);
        else res.status(404).json({ error: 'Cart not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
};

exports.addItemToCart = async (req, res) => {
    try {
        const item = await cartModel.addItemToCart(
            req.params.cartId,
            req.body.productId,
            req.body.quantity
        );
        res.status(201).json(item);
    } catch (err) {
        console.error(err);
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
    const paymentDetails = req.body.paymentDetails; // Adjusted to get paymentDetails directly

    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to checkout' });
    }

    try {
        // Validate or calculate total amount here if needed
        const amount = paymentDetails.amount; // amount in cents, sent from frontend

        // Create Stripe PaymentIntent
        const paymentIntent = await stripe.paymentIntents.create({
            amount,
            currency: 'usd',
            metadata: { cartId, userId },
        });

        // You can optionally save order info here or after payment confirmation

        // Respond with client secret for frontend to confirm payment
        res.json({ clientSecret: paymentIntent.client_secret });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Checkout failed' });
    }
};

