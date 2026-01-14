const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new cart for a user
async function createCart(userId) {
    const result = await pool.query(
        'INSERT INTO carts (user_id) VALUES ($1) RETURNING *',
        [userId]
    );
    return result.rows[0];
}

// Get cart by user id, including items
async function getCartByUserId(userId) {
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
}

// Add item to cart
async function addItemToCart(cartId, productId, quantity) {
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
}

// Remove item from cart
async function removeItemFromCart(cartItemId) {
    await pool.query('DELETE FROM cart_items WHERE id = $1', [cartItemId]);
}

// Clear all items from a cart
async function clearCart(cartId) {
    await pool.query('DELETE FROM cart_items WHERE cart_id = $1', [cartId]);
}

module.exports = {
    createCart,
    getCartByUserId,
    addItemToCart,
    removeItemFromCart,
    clearCart,
};