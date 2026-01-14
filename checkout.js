const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Simulate payment processing (always succeeds here)
async function processPayment(paymentDetails) {
    // In a real app, integrate with payment gateway here
    // For now, simulate success with a delay
    return new Promise((resolve) => setTimeout(() => resolve(true), 500));
}

// Validate cart exists and has items
async function validateCart(cartId) {
    const cartRes = await pool.query('SELECT * FROM carts WHERE id = $1', [cartId]);
    if (cartRes.rows.length === 0) {
        throw new Error('Cart not found');
    }
    const itemsRes = await pool.query('SELECT * FROM cart_items WHERE cart_id = $1', [cartId]);
    if (itemsRes.rows.length === 0) {
        throw new Error('Cart is empty');
    }
    return { cart: cartRes.rows[0], items: itemsRes.rows };
}

// Create order and order items after successful payment
async function createOrder(userId, cartId, items) {
    const client = await pool.connect();
    try {
        await client.query('BEGIN');

        const orderRes = await client.query(
            'INSERT INTO orders (user_id, status, created_at) VALUES ($1, $2, NOW()) RETURNING *',
            [userId, 'paid']
        );
        const order = orderRes.rows[0];

        for (const item of items) {
            await client.query(
                'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
                [order.id, item.product_id, item.quantity, item.price]
            );
        }

        // Optionally clear the cart here or mark it as checked out

        await client.query('COMMIT');
        return order;
    } catch (err) {
        await client.query('ROLLBACK');
        throw err;
    } finally {
        client.release();
    }
}

// Checkout handler
async function checkout(cartId, userId, paymentDetails) {
    // Validate cart and items
    const { cart, items } = await validateCart(cartId);

    // Process payment (simulate)
    const paymentSuccess = await processPayment(paymentDetails);
    if (!paymentSuccess) {
        throw new Error('Payment failed');
    }

    // Create order
    const order = await createOrder(userId, cartId, items);
    return order;
}

module.exports = {
    checkout,
};