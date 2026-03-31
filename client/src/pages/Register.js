import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';

// Import store logo and icons
import { ReactComponent as StoreLogo } from '../assets/images/logos/Luigi-Jer.svg';
import { ReactComponent as RegisterIcon } from '../assets/images/icons/register.svg';
import { ReactComponent as LoginIcon } from '../assets/images/icons/login.svg';

import './Register.css';

const Register = () => {
    const { user } = useContext(AuthContext);
    const [username, setUsername] = React.useState('');
    const [email, setEmail] = React.useState('');
    const [password, setPassword] = React.useState('');
    const [error, setError] = React.useState(null);
    const navigate = useNavigate();

    useEffect(() => {
        if (user) {
            navigate('/products');
        }
    }, [user, navigate]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            await authService.register({ username, email, password });
            navigate('/products');
        } catch (err) {
            setError(err.response?.data?.message || 'Registration failed');
        }
    };

    return (
        <div className="register-page">
            <div className="register-container">
                <StoreLogo className="store-logo" aria-label="Store Logo" />
                <h2 className="register-heading">Register</h2>
                <form onSubmit={handleSubmit} className="register-form">
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
                        <label htmlFor="email">Email:</label>
                        <input
                            id="email"
                            type="email"
                            value={email}
                            onChange={(e) => setEmail(e.target.value)}
                            required
                            className="input-field"
                            placeholder="Enter your email"
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
                    <button type="submit" className="btn register-btn">
                        <RegisterIcon className="btn-icon" /> Register
                    </button>
                </form>
                <p className="login-text">
                    Already have an account?{' '}
                    <Link to="/login" className="login-link">
                        <LoginIcon className="btn-icon" /> Login here
                    </Link>
                </p>
            </div>
        </div>
    );
};

export default Register;