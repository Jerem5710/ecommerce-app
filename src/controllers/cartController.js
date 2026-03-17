const cartModel = require('../models/cartModel');

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
    const paymentDetails = req.body.paymentDetails;

    if (!userId) {
        return res.status(401).json({ error: 'User must be logged in to checkout' });
    }

    try {
        const result = await cartModel.checkoutCart(cartId, userId, paymentDetails);
        res.json({ message: 'Checkout successful', order: result.order, items: result.items });
    } catch (err) {
        console.error(err);
        res.status(400).json({ error: err.message || 'Checkout failed' });
    }
};
