const pool = require('../config/db');

exports.findByUsernameOrEmail = async (username, email) => {
    const result = await pool.query(
        'SELECT * FROM users WHERE username = $1 OR email = $2',
        [username, email]
    );
    return result.rows[0];
};

exports.createUser = async (username, email, passwordHash) => {
    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
        [username, email, passwordHash]
    );
    return result.rows[0];
};

exports.getUsers = async () => {
    const result = await pool.query('SELECT id, username, email FROM users');
    return result.rows;
};

exports.getUserById = async (id) => {
    const result = await pool.query('SELECT id, username, email FROM users WHERE id = $1', [id]);
    return result.rows[0];
};

exports.updateUser = async (id, username, email) => {
    const result = await pool.query(
        'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email',
        [username, email, id]
    );
    return result.rows[0];
};

exports.deleteUser = async (id) => {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
};

