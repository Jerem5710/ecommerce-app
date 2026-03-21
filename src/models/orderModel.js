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
        `SELECT 
       o.id AS order_id,
       o.created_at AS order_date,
       o.status,
       oi.product_id,
       oi.quantity,
       oi.price,
       p.name AS product_name
     FROM orders o
     JOIN order_items oi ON o.id = oi.order_id
     JOIN products p ON oi.product_id = p.id
     WHERE o.user_id = $1
     ORDER BY o.created_at DESC`,
        [userId]
    );

    // Group rows by order_id
    const ordersMap = new Map();

    result.rows.forEach(row => {
        if (!ordersMap.has(row.order_id)) {
            ordersMap.set(row.order_id, {
                id: row.order_id,
                orderDate: row.order_date,
                status: row.status,
                items: [],
            });
        }
        ordersMap.get(row.order_id).items.push({
            productId: row.product_id,
            name: row.product_name,
            quantity: row.quantity,
            price: row.price,
        });
    });

    return Array.from(ordersMap.values());
};

exports.updateOrderStatus = async (orderId, status) => {
    const result = await pool.query(
        'UPDATE orders SET status = $2 WHERE id = $1 RETURNING *',
        [orderId, status]
    );
    return result.rows[0];
};

exports.getAllOrders = async (userId) => {
    let query = `
    SELECT o.id, o.user_id, o.total, o.status, o.created_at,
           json_agg(json_build_object(
             'product_id', oi.product_id,
             'quantity', oi.quantity,
             'price', oi.price
           )) AS items
    FROM orders o
    LEFT JOIN order_items oi ON o.id = oi.order_id
  `;
    const params = [];

    if (userId) {
        query += ' WHERE o.user_id = $1';
        params.push(userId);
    }

    query += ' GROUP BY o.id ORDER BY o.created_at DESC';

    const result = await pool.query(query, params);
    return result.rows;
};