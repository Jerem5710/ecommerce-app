require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const { Pool } = require('pg');

const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
});

pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

// Middleware to parse JSON bodies
app.use(express.json());

// Session and Passport.js setup for authentication
const session = require('express-session');
const passport = require('./auth');

app.use(session({
    secret: 'your_secret_key_here', // replace with a strong secret in production
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());// Import authentication routes

const bcrypt = require('bcryptjs');

// Registration endpoint
app.post('/register', async (req, res) => {
    const { username, email, password } = req.body;
    if (!username || !email || !password) {
        return res.status(400).json({ error: 'Please provide username, email, and password' });
    }
    try {
        // Check if user exists
        const userCheck = await pool.query('SELECT * FROM users WHERE username = $1 OR email = $2', [username, email]);
        if (userCheck.rows.length > 0) {
            return res.status(409).json({ error: 'Username or email already exists' });
        }
        // Hash password
        const salt = await bcrypt.genSalt(10);
        const passwordHash = await bcrypt.hash(password, salt);
        // Insert new user
        const newUser = await pool.query(
            'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING id, username, email',
            [username, email, passwordHash]
        );
        res.status(201).json(newUser.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to register user' });
    }
});

// Login endpoint
app.post('/login', (req, res, next) => {
    passport.authenticate('local', (err, user, info) => {
        if (err) { return next(err); }
        if (!user) {
            return res.status(401).json({ error: info.message || 'Login failed' });
        }
        req.logIn(user, (err) => {
            if (err) { return next(err); }
            return res.json({ message: 'Login successful', user: { id: user.id, username: user.username, email: user.email } });
        });
    })(req, res, next);
});

// Logout endpoint
app.post('/logout', (req, res) => {
    req.logout(() => {
        res.json({ message: 'Logged out successfully' });
    });
});

// Import product CRUD functions
const {
    createProduct,
    getProducts,
    updateProduct,
    deleteProduct,
} = require('./products');

// Import user CRUD functions
const {
    createUser,
    getUsers,
    getUserById,
    updateUser,
    deleteUser,
} = require('./users'); 

// Import cart CRUD functions
const {
    createCart,
    getCartByUserId,
    addItemToCart,
    removeItemFromCart,
    clearCart,
} = require('./carts');

// Import order CRUD functions
const {
    createOrder,
    addOrderItems,
    getOrdersByUserId,
    updateOrderStatus,
} = require('./orders');


// Routes for product CRUD operations

// Basic route
app.get('/', (req, res) => {
    res.send('Welcome to the E-Commerce API!');
});

// Product routes

// Get all products
app.get('/products', async (req, res) => {
    try {
        const products = await getProducts();
        console.log('Fetched products:', products);
        res.json(products);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch products' });
    }
});

// Create a new product
app.post('/products', async (req, res) => {
    console.log('Request body:', req.body);
    const { name, description, price, stock } = req.body;
    try {
        const newProduct = await createProduct(name, description, price, stock);
        console.log('Created product:', newProduct);
        res.status(201).json(newProduct);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create product' });
    }
});

// Update a product by id
app.put('/products/:id', async (req, res) => {
    const { id } = req.params;
    const { name, description, price, stock } = req.body;
    try {
        const updatedProduct = await updateProduct(id, name, description, price, stock);
        if (updatedProduct) {
            res.json(updatedProduct);
        } else {
            res.status(404).json({ error: 'Product not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update product' });
    }
});

// Delete a product by id
app.delete('/products/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deleteProduct(id);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete product' });
    }
});

// user routes

// Get all users
app.get('/users', async (req, res) => {
    try {
        const users = await getUsers();
        res.json(users);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch users' });
    }
});

// Get a user by id
app.get('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        const user = await getUserById(id);
        if (user) {
            res.json(user);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch user' });
    }
});

// Create a new user
app.post('/users', async (req, res) => {
    const { username, email, passwordHash } = req.body;
    try {
        const newUser = await createUser(username, email, passwordHash);
        res.status(201).json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Update a user by id
app.put('/users/:id', async (req, res) => {
    const { id } = req.params;
    const { username, email } = req.body;
    try {
        const updatedUser = await updateUser(id, username, email);
        if (updatedUser) {
            res.json(updatedUser);
        } else {
            res.status(404).json({ error: 'User not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// Delete a user by id
app.delete('/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await deleteUser(id);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// cart routes
// Create a new cart for a user
app.post('/carts', async (req, res) => {
    const { userId } = req.body;
    try {
        const cart = await createCart(userId);
        res.status(201).json(cart);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create cart' });
    }
});

// Get cart by user id
app.get('/carts/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const cart = await getCartByUserId(userId);
        if (cart) {
            res.json(cart);
        } else {
            res.status(404).json({ error: 'Cart not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch cart' });
    }
});

// Add item to cart
app.post('/carts/:cartId/items', async (req, res) => {
    const { cartId } = req.params;
    const { productId, quantity } = req.body;
    try {
        const item = await addItemToCart(cartId, productId, quantity);
        res.status(201).json(item);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to add item to cart' });
    }
});

// Remove item from cart
app.delete('/carts/items/:itemId', async (req, res) => {
    const { itemId } = req.params;
    try {
        await removeItemFromCart(itemId);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to remove item from cart' });
    }
});

// Clear all items from a cart
app.delete('/carts/:cartId/items', async (req, res) => {
    const { cartId } = req.params;
    try {
        await clearCart(cartId);
        res.status(204).send();
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to clear cart' });
    }
});

// order routes
// Create a new order with items
app.post('/orders', async (req, res) => {
    const { userId, total, items } = req.body; // items: array of { product_id, quantity, price }
    try {
        const order = await createOrder(userId, total);
        await addOrderItems(order.id, items);
        const fullOrder = await getOrdersByUserId(userId);
        res.status(201).json(fullOrder[0]); // Return the newly created order with items
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create order' });
    }
});

// Get all orders for a user
app.get('/orders/:userId', async (req, res) => {
    const { userId } = req.params;
    try {
        const orders = await getOrdersByUserId(userId);
        res.json(orders);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to fetch orders' });
    }
});

// Update order status
app.put('/orders/:orderId/status', async (req, res) => {
    const { orderId } = req.params;
    const { status } = req.body;
    try {
        const updatedOrder = await updateOrderStatus(orderId, status);
        if (updatedOrder) {
            res.json(updatedOrder);
        } else {
            res.status(404).json({ error: 'Order not found' });
        }
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update order status' });
    }
});


// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});