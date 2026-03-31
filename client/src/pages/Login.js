import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';

// Import store logo and icons
import { ReactComponent as StoreLogo } from '../assets/images/logos/Luigi-Jer.svg';
import { ReactComponent as LoginIcon } from '../assets/images/icons/login.svg';
import { ReactComponent as GoogleIcon } from '../assets/images/icons/google.svg';
import { ReactComponent as FacebookIcon } from '../assets/images/icons/facebook.svg';
import { ReactComponent as RegisterIcon } from '../assets/images/icons/register.svg';
import logoPng from '../assets/images/logos/Luigi-Jer.png';

import './Login.css';

const Login = () => {
    const { user, setUser } = useContext(AuthContext);
    const [username, setUsername] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/products');
        }
    }, [user, navigate]);

    useEffect(() => {
        const params = new URLSearchParams(window.location.search);
        if (params.get('error') === 'google_failed') {
            setError('Google login failed. Please try again.');
        }
    }, []);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await authService.login({ username, password });
            setUser(data.user);
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Login failed');
        }
    };

    const handleGoogleLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/auth/google`;
    };

    const handleFacebookLogin = () => {
        window.location.href = `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/auth/facebook`;
    };

    return (
        <div className="login-page">
            <div className="login-container">
                {/* <StoreLogo className="store-logo" aria-label="Store Logo" /> */}
                <img src={logoPng} alt="Store Logo" className="store-logo" />
                <h2 className="login-heading">Login</h2>
                <form onSubmit={handleSubmit} className="login-form">
                    <div className="form-group">
                        <label htmlFor="username">Username:</label>
                        <input
                            id="username"
                            type="text"
                            value={username}
                            onChange={(e) => setUsername(e.target.value)}
                            required
                            className="input-field"
                            placeholder="Enter your username"
                        />
                    </div>
                    <div className="form-group">
                        <label htmlFor="password">Password:</label>
                        <input
                            id="password"
                            type="password"
                            value={password}
                            onChange={(e) => setPassword(e.target.value)}
                            required
                            className="input-field"
                            placeholder="Enter your password"
                        />
                    </div>
                    {error && <p className="error-message">{error}</p>}
                    <button type="submit" className="btn login-btn">
                        <LoginIcon className="btn-icon" /> Login
                    </button>
                </form>
                <div className="social-login-buttons">
                    <button onClick={handleGoogleLogin} className="btn google-btn">
                        <GoogleIcon className="btn-icon" /> Login with Google
                    </button>
                    <button onClick={handleFacebookLogin} className="btn facebook-btn">
                        <FacebookIcon className="btn-icon" /> Login with Facebook
                    </button>
                </div>
                <p className="register-text">
                    Don't have an account?{' '}
                    <Link to="/register" className="register-link">
                        <RegisterIcon className="btn-icon" /> Register here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Login;