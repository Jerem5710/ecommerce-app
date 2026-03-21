const pool = require('../config/db');

exports.getCategories = async () => {
    const result = await pool.query('SELECT id, name, description FROM categories ORDER BY name');
    return result.rows;
};