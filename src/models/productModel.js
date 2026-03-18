const pool = require('../config/db');

exports.getProducts = async (categoryId) => {
    const baseQuery = 'SELECT id, name, description, price, stock, image_url FROM products';

    if (categoryId) {
        const result = await pool.query(`${baseQuery} WHERE category_id = $1`, [categoryId]);
        return result.rows;
    }

    const result = await pool.query(baseQuery);
    return result.rows;
};

exports.getProductById = async (id) => {
    const result = await pool.query(
        'SELECT id, name, description, price, stock, image_url FROM products WHERE id = $1',
        [id]
    );
    return result.rows[0];
};


exports.createProduct = async (name, description, price, stock, image_url) => {
    const result = await pool.query(
        'INSERT INTO products (name, description, price, stock, image_url) VALUES ($1, $2, $3, $4, $5) RETURNING *',
        [name, description, price, stock, image_url]
    );
    return result.rows[0];
};

exports.updateProduct = async (id, name, description, price, stock, image_url) => {
    const result = await pool.query(
        'UPDATE products SET name=$2, description=$3, price=$4, stock=$5, image_url=$6 WHERE id=$1 RETURNING *',
        [id, name, description, price, stock, image_url]
    );
    return result.rows[0];
};

exports.deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
};