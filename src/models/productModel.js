const pool = require('../config/db');

exports.getProducts = async (categoryId) => {
    if (categoryId) {
        const result = await pool.query('SELECT * FROM products WHERE category_id = $1', [categoryId]);
        return result.rows;
    }
    const result = await pool.query('SELECT * FROM products');
    return result.rows;
};

exports.getProductById = async (id) => {
    const result = await pool.query('SELECT * FROM products WHERE id = $1', [id]);
    return result.rows[0];
};

exports.createProduct = async (name, description, price, stock) => {
    const result = await pool.query(
        'INSERT INTO products (name, description, price, stock) VALUES ($1, $2, $3, $4) RETURNING *',
        [name, description, price, stock]
    );
    return result.rows[0];
};

exports.updateProduct = async (id, name, description, price, stock) => {
    const result = await pool.query(
        'UPDATE products SET name=$2, description=$3, price=$4, stock=$5 WHERE id=$1 RETURNING *',
        [id, name, description, price, stock]
    );
    return result.rows[0];
};

exports.deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
};