const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new product
async function createProduct(name, description, price, stock, categoryId = null) {
    const result = await pool.query(
        'INSERT INTO products (name, description, price, stock, categoryId) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, stock, categoryId]
    );
    return result.rows[0];
}

// Read all products or filter by categoryId
async function getProducts(categoryId = null) {
    if (categoryId) {
        const result = await pool.query(
            'SELECT * FROM products WHERE categoryId = $1',
            [categoryId]
        );
        return result.rows;
    }
    else {
    const result = await pool.query('SELECT * FROM products');
        return result.rows;
    }
}

// Read a single product by id 
async function getProductById(id) {
    const result = await pool.query(
        'SELECT * FROM products WHERE id = $1',
        [id]
    );
    return result.rows[0];
}

// Update a product by id
async function updateProduct(id, name, description, price, stock, categoryId = null) {
    const result = await pool.query(
        'UPDATE products SET name = $1, description = $2, price = $3, stock = $4, categoryId = $5 WHERE id = $6 RETURNING *',
        [name, description, price, stock, categoryId, id]
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
    getProductById,
    updateProduct,
    deleteProduct,
};