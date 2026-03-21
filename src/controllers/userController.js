const userModel = require('../models/userModel');
const bcrypt = require('bcryptjs');
const passport = require('../config/passportStrategies');

exports.register = async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password' });
    }
    try {
        const exists = await userModel.findByUsernameOrEmail(username, email);
        if (exists) return res.status(409).json({ error: 'Username or email already exists' });

        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        const newUser = await userModel.createUser(username, email, passwordHash);

        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
};

exports.login = (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) return next(err);
        if (!user) {
            return res.status(401).json({ error: info?.message || 'Login failed' });
        }
        req.logIn(user, (err) => {
            if (err) return next(err);
            return res.json({
                message: 'Login successful',
                user: { id: user.id, username: user.username, email: user.email }
            });
        });
    })(req, res, next);
};

exports.logout = (req, res, next) => {
    req.logout(function (err) {
        if (err) { return next(err); }
        req.session.destroy((err) => {
            if (err) {
                console.error('Session destruction error:', err);
                return res.status(500).json({ message: 'Logout failed' });
            }
            res.clearCookie('connect.sid'); // Clear session cookie
            res.status(200).json({ message: 'Logged out successfully' });
        });
    });
};

exports.getCurrentUser = (req, res) => {
    if (req.isAuthenticated()) {
        res.json({ user: req.user });
    } else {
        res.status(401).json({ user: null });
    }
};

exports.getAllUsers = async (req, res) => {
    try {
        const users = await userModel.getUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
};

exports.getUserById = async (req, res) => {
    try {
        const user = await userModel.getUserById(req.params.id);
        if (user) res.json(user);
        else res.status(404).json({ error: 'User not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
};

exports.createUser = async (req, res) => {
    const { username, email, passwordHash } = req.body;
    try {
        const newUser = await userModel.createUser(username, email, passwordHash);
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
};

exports.updateUser = async (req, res) => {
    const { username, email } = req.body;
    try {
        const updatedUser = await userModel.updateUser(req.params.id, username, email);
        if (updatedUser) res.json(updatedUser);
        else res.status(404).json({ error: 'User not found' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
};

exports.deleteUser = async (req, res) => {
    try {
        await userModel.deleteUser(req.params.id);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
};