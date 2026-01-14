const { Pool } = require('pg');
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

// Create a new user
async function createUser(username, email, passwordHash) {
    const result = await pool.query(
        'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
        [username, email, passwordHash]
    );
    return result.rows[0];
}

// Get all users
async function getUsers() {
    const result = await pool.query('SELECT id, username, email, created_at FROM users');
    return result.rows;
}

// Get a user by id
async function getUserById(id) {
    const result = await pool.query(
        'SELECT id, username, email, created_at FROM users WHERE id = $1',
        [id]
    );
    return result.rows[0];
}

// Update a user by id
async function updateUser(id, username, email) {
    const result = await pool.query(
        'UPDATE users SET username = $1, email = $2 WHERE id = $3 RETURNING id, username, email, created_at',
        [username, email, id]
    );
    return result.rows[0];
}

// Delete a user by id
async function deleteUser(id) {
    await pool.query('DELETE FROM users WHERE id = $1', [id]);
}

module.exports = {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
};