const express = require('express');
const router = express.Router();
const passport = require('../config/passportStrategies'); 
const userController = require('../controllers/userController');

// Registration endpoint
/**
 * @swagger
 * /users/register:
 *   post:
 *     summary: Register a new user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - email
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               email:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       201:
 *         description: User created successfully
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 id:
 *                   type: integer
 *                 username:
 *                   type: string
 *                 email:
 *                   type: string
 *       400:
 *         description: Missing required fields
 *       409:
 *         description: Username or email already exists
 *       500:
 *         description: Server error
 */
router.post('/register', userController.register);

// Login endpoint
/**
 * @swagger
 * /users/login:
 *   post:
 *     summary: Login a user
 *     requestBody:
 *       required: true
 *       content:
 *         application/json:
 *           schema:
 *             type: object
 *             required:
 *               - username
 *               - password
 *             properties:
 *               username:
 *                 type: string
 *               password:
 *                 type: string
 *     responses:
 *       200:
 *         description: Login successful
 *         content:
 *           application/json:
 *             schema:
 *               type: object
 *               properties:
 *                 message:
 *                   type: string
 *                 user:
 *                   type: object
 *                   properties:
 *                     id:
 *                       type: integer
 *                     username:
 *                       type: string
 *                     email:
 *                       type: string
 *       401:
 *         description: Login failed
 */
router.post('/login', userController.login);

// logout endpoint
/**
 * @swagger
 * /users/logout:
 *   post:
 *     summary: Logout the current user
 *     responses:
 *       200:
 *         description: Logout successful
 */
router.post('/logout', userController.logout);

// Google OAuth login route
router.get('/auth/google',
    passport.authenticate('google', { scope: ['profile', 'email'] })
);

// Google OAuth callback route
router.get('/auth/google/callback',
    passport.authenticate('google', {
        failureRedirect: '/login', // Redirect to login on failure
        successRedirect: '/',       // Redirect to home on success
        session: true,
    })
);

// Facebook OAuth login route
router.get('/auth/facebook',
    passport.authenticate('facebook', { scope: ['email'] })
);

// Facebook OAuth callback route
router.get('/auth/facebook/callback',
    passport.authenticate('facebook', {
        failureRedirect: '/login',
        successRedirect: '/',
        session: true,
    })
);

// User routes
router.get('/', userController.getAllUsers);
router.get('/:id', userController.getUserById);
router.post('/', userController.createUser);
router.put('/:id', userController.updateUser);
router.delete('/:id', userController.deleteUser);

module.exports = router;
