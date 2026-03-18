require('dotenv').config();

const express = require('express');
const app = express();
const PORT = process.env.PORT || 3000;

const pool = require('./src/config/db'); // Import your configured pool

const setupSwagger = require('./src/docs/swagger');

const cors = require('cors');

// Middleware to parse JSON bodies
app.use(express.json());

// Enable CORS for all routes (you can configure this further for specific origins)
app.use(cors({
    origin: 'http://localhost:3000', // Adjust this to your frontend URL
    credentials: true, // Allow cookies to be sent with requests
}));

// Session and Passport.js setup for authentication
const session = require('express-session');
const passport = require('./src/middleware/auth');

app.use(session({
    secret: process.env.SESSION_SECRET || 'your_secret_key_here', // Use env var for secret
    resave: false,
    saveUninitialized: false,
}));

app.use(passport.initialize());
app.use(passport.session());

// Initialize swagger documentation
setupSwagger(app);

// Connect to PostgreSQL
pool.connect()
    .then(() => console.log('Connected to PostgreSQL'))
    .catch(err => console.error('Connection error', err.stack));

// Import route modules
const userRoutes = require('./src/routes/userRoutes');
const productRoutes = require('./src/routes/productRoutes');
const orderRoutes = require('./src/routes/orderRoutes');
const cartRoutes = require('./src/routes/cartRoutes');

// Use routes
app.use('/users', userRoutes);
app.use('/products', productRoutes);
app.use('/orders', orderRoutes);
app.use('/carts', cartRoutes);

// Start the server
app.listen(PORT, () => {
    console.log(`Server is running on port ${PORT}`);
});