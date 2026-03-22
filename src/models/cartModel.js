const pool = require('../config/db');
const stripe = require('stripe')(process.env.STRIPE_SECRET_KEY);

// Create a new cart for a user
exports.createCart = async (userId) => {
    const result = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
        [userId]
    );
    return result.rows[0];
};

// Get cart by user id, including items
exports.getCartByUserId = async (userId) => {
    const cartResult = await pool.query(
        'SELECT * FROM carts WHERE user_id = $1',
        [userId]
    );
    const cart = cartResult.rows[0];
    if (!cart) return null;

    const itemsResult = await pool.query(
        `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.description, p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cart.id]
    );

    cart.items = itemsResult.rows;
    return cart;
};

// Add or update item quantity in cart
exports.addItemToCart = async (cartId, productId, quantity) => {
    // Check if item already exists in cart
    const existingItemResult = await pool.query(
        'SELECT * FROM cart_items WHERE cart_id = $1 AND product_id = $2',
        [cartId, productId]
    );

    if (existingItemResult.rows.length > 0) {
        // Update quantity
        const updatedResult = await pool.query(
            'UPDATE cart_items SET quantity = quantity + $1 WHERE cart_id = $2 AND product_id = $3 RETURNING *',
            [quantity, cartId, productId]
        );
        return updatedResult.rows[0];
    } else {
        // Insert new item
        const insertResult = await pool.query(
            'INSERT INTO cart_items (cart_id, product_id, quantity) VALUES ($1, $2, $3) RETURNING *',
            [cartId, productId, quantity]
        );
        return insertResult.rows[0];
    }
};

// Remove item from cart
exports.removeItemFromCart = async (cartItemId) => {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
};

// Clear all items from a cart
exports.clearCart = async (cartId) => {
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
};

// Simulate payment processing (always succeeds here)
const processPayment = async (paymentDetails) => {
    // In a real app, integrate with payment gateway here
    // For now, simulate success with a delay
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
};

// Validate cart exists and has items
const validateCart = async (cartId) => {
    const cartRes = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
    if (cartRes.rows.length === 0) {
        throw new Error('Cart not found');
    }
    const itemsRes = await pool.query(
        `SELECT ci.id, ci.quantity, p.id AS product_id, p.name, p.description, p.price
         FROM cart_items ci
         JOIN products p ON ci.product_id = p.id
         WHERE ci.cart_id = $1`,
        [cartId]
    );
    if (itemsRes.rows.length === 0) {
        throw new Error('Cart is empty');
    }
    return { cart: cartRes.rows[0], items: itemsRes.rows };
};


// Create order and order items after successful payment
const createOrder = async (userId, cartId, items) => {
    const client = await pool.connect();
    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    try {
        await client.query('BEGIN');

        const orderRes = await client.query(
            'INSERT INTO orders (user_id, total, status, created_at) VALUES ($1, $2, $3, NOW()) RETURNING *',
            [userId, total, 'paid']
        );
        const order = orderRes.rows[0];

        for (const item of items) {
            if (item.price == null) {
                throw new Error(`Missing price for product_id ${item.product_id}`);
            }
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order.id, item.product_id, item.quantity, item.price]
            );
        }
        // Query inserted order items and attach to order
        const itemsRes = await client.query(
            `SELECT oi.product_id as id, oi.quantity, oi.price, p.name
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [order.id]
        );
        order.items = itemsRes.rows;

        // Optionally clear the cart here or mark it as checked out
        await client.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);

        await client.query('COMMIT');
        return order;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
};

// Checkout cart: validate, process payment, create order
exports.checkout = async (cartId, userId, paymentDetails) => {
    // Validate cart and items
    const { cart, items } = await validateCart(cartId);

    // Calculate total amount in cents
    const total = items.reduce((sum, item) => sum + parseFloat(item.price) * item.quantity, 0);
    const amountInCents = Math.round(total * 100);

    console.log('Starting checkout for cartId:', cartId, 'userId:', userId);
    console.log('Payment details:', paymentDetails);

    // Create Stripe PaymentIntent
    const paymentIntent = await stripe.paymentIntents.create({
        amount: amountInCents,
        currency: 'usd', // or your currency
        // optionally, you can add metadata or receipt_email here
    });

    console.log('Stripe payment intent created and confirmed:', paymentIntent);

    // Process payment (simulate)
    const paymentSuccess = await processPayment(paymentDetails);
    if (!paymentSuccess) {
        throw new Error('Payment failed');
    }   
    // Create order
    const order = await createOrder(userId, cartId, items);
    return { order, clientSecret: paymentIntent.client_secret };
};