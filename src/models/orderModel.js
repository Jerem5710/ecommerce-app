const pool = require('../config/db');

exports.createOrder = async (userId, total) => {
    const result = await pool.query(
        'INSERT INTO orders (user_id, total, status) VALUES ($1, $2, $3) RETURNING *',
        [userId, total, 'pending']
    );
    return result.rows[0];
};

exports.addOrderItems = async (orderId, items) => {
    const insertPromises = items.map(item =>
        pool.query(
            'INSERT INTO order_items (order_id, product_id, quantity, price) VALUES ($1, $2, $3, $4)',
            [orderId, item.product_id, item.quantity, item.price]
        )
    );
    await Promise.all(insertPromises);
};

exports.getOrdersByUserId = async (userId) => {
    const result = await pool.query(
        'SELECT * FROM orders WHERE user_id = $1 ORDER BY created_at DESC',
        [userId]
    );
    return result.rows;
};

exports.updateOrderStatus = async (orderId, status) => {
    const result = await pool.query(
        'UPDATE orders SET status = $2 WHERE id = $1 RETURNING *',
        [orderId, status]
    );
    return result.rows[0];
};