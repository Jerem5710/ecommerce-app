const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new order
async function createOrder(userId, total, status = 'pending') {
    const result = await pool.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, total, status]
    );
    return result.rows[0];
}

// Add items to an order
async function addOrderItems(orderId, items) {
    // items is an array of { product_id, quantity, price }
    const queries = items.map(item => {
        return pool.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
            [orderId, item.product_id, item.quantity, item.price]
        );
    });
    await Promise.all(queries);
}

// Get orders by user id with items
async function getOrdersByUserId(userId) {
    const ordersResult = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    const orders = ordersResult.rows;

    for (const order of orders) {
        const itemsResult = await pool.query(
            `SELECT oi.id, oi.quantity, oi.price, p.id AS product_id, p.name, p.description
       FROM order_items oi
       JOIN products p ON oi.product_id = p.id
       WHERE oi.order_id = $1`,
            [order.id]
        );
        order.items = itemsResult.rows;
    }

    return orders;
}

// Update order status
async function updateOrderStatus(orderId, status) {
    const result = await pool.query(
        'UPDATE orders SET status = $1 WHERE id = $2 RETURNING *',
        [status, orderId]
    );
    return result.rows[0];
}

module.exports = {
    createOrder,
    addOrderItems,
    getOrdersByUserId,
    updateOrderStatus,
};