const passport = require('passport');
const GoogleStrategy = require('passport-google-oauth20').Strategy;
const FacebookStrategy = require('passport-facebook').Strategy;
const pool = require('./db'); // adjust path if needed
const bcrypt = require('bcryptjs');
const emailService = require('../utils/emailService'); // adjust path if needed

// Helper function to find or create user
async function findOrCreateUser(profile, done) {
    try {
        const email = profile.emails[0].value;
        const username = profile.displayName || profile.username || email.split('@')[0];

        // Check if user exists by email
        const res = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        let user = res.rows[0];
        let isNewUser = false;

        if (!user) {
            // Create new user with a random password hash (or null)
            const randomPassword = Math.random().toString(36).slice(-8);
            const salt = await bcrypt.genSalt(10);
            const passwordHash = await bcrypt.hash(randomPassword, salt);

            const insertRes = await pool.query(
                'INSERT INTO users (username, email, password_hash) VALUES ($1, $2, $3) RETURNING *',
                [username, email, passwordHash]
            );
            user = insertRes.rows[0];
            isNewUser = true;
        }
        if (isNewUser) {
            await emailService.sendEmail(
                user.email,
                'Welcome to Our Store!',
                'registration',
                {
                    logoUrl: 'https://yourstore.com/logo.png',
                    username: user.username || user.email,
                    contactEmail: 'info@store.com',
                    contactPhone: '123-456-7890',
                    address: '123 Store St, City, Country',
                }
            );
        }
        done(null, user);
    } catch (err) {
        done(err, null);
    }
}

// Google OAuth Strategy
passport.use(new GoogleStrategy({
    clientID: process.env.GOOGLE_CLIENT_ID,
    clientSecret: process.env.GOOGLE_CLIENT_SECRET,
    callbackURL: '/users/auth/google/callback',
}, (accessToken, refreshToken, profile, done) => {
    findOrCreateUser(profile, done);
}));

// Facebook OAuth Strategy
passport.use(new FacebookStrategy({
    clientID: process.env.FACEBOOK_APP_ID,
    clientSecret: process.env.FACEBOOK_APP_SECRET,
    callbackURL: '/auth/facebook/callback',
    profileFields: ['id', 'displayName', 'emails'],
}, (accessToken, refreshToken, profile, done) => {
    findOrCreateUser(profile, done);
}));

// Serialize and deserialize user (reuse your existing code)
passport.serializeUser((user, done) => {
    done(null, user.id);
});

passport.deserializeUser(async (id, done) => {
    try {
        const res = await pool.query('SELECT * FROM users WHERE id = $1', [id]);
        const user = res.rows[0];
        done(null, user);
    } catch (err) {
        done(err);
    }
});

module.exports = passport;
