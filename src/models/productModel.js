const pool = require('../config/db');

exports.getProducts = async (categoryId, searchTerm) => {
    let baseQuery = 'SELECT id, name, description, price, stock, image_url, category_id FROM products';
    const params = [];
    const conditions = [];

    if (categoryId) {
        params.push(categoryId);
        conditions.push(`category_id = $${params.length}`);
    }

    if (searchTerm) {
        params.push(`%${searchTerm.toLowerCase()}%`);
        conditions.push(`(LOWER(name) LIKE $${params.length} OR LOWER(description) LIKE $${params.length})`);
    }

    if (conditions.length > 0) {
        baseQuery += ' WHERE ' + conditions.join(' AND ');
    }

    const result = await pool.query(baseQuery, params);
    return result.rows;
};

exports.getProductById = async (id) => {
    const result = await pool.query(
        'SELECT id, name, description, price, stock, image_url, category_id FROM products WHERE id = $1',
        [id]
    );
    return result.rows[0];
};

exports.createProduct = async (
    name,
    description,
    price,
    stock,
    image_url,
    category_id
) => {
    const result = await pool.query(
        'INSERT INTO products (name, description, price, stock, image_url, category_id) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
        [name, description, price, stock, image_url, category_id]
    );
    return result.rows[0];
};

exports.updateProduct = async (
    id,
    name,
    description,
    price,
    stock,
    image_url,
    category_id
) => {
    const result = await pool.query(
        'UPDATE products SET name=$2, description=$3, price=$4, stock=$5, image_url=$6, category_id=$7 WHERE id=$1 RETURNING *',
        [id, name, description, price, stock, image_url, category_id]
    );
    return result.rows[0];
};

exports.deleteProduct = async (id) => {
    await pool.query('DELETE FROM products WHERE id = $1', [id]);
};