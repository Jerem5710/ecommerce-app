const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new product
async function createProduct(name, description, price, stock) {
    const result = await pool.query(
        'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, price, stock]
    );
    return result.rows[0];
}

// Read all products
async function getProducts() {
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
}

// Update a product by id
async function updateProduct(id, name, description, price, stock) {
    const result = await pool.query(
        'UPDATE products SET name = $1, description = $2, price = $3, stock = $4 WHERE id = $5 RETURNING *',
        [name, description, price, stock, id]
    );
    return result.rows[0];
}

// Delete a product by id
async function deleteProduct(id) {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
}

module.exports = {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
};