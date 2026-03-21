import React, { useContext, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import authService from '../services/authService';
import { AuthContext } from '../context/AuthContext';

const Login = () => {
    console.log('API URL:', process.env.REACT_APP_API_URL);

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

    // Check for error query param on mount
    useEffect(() => {
        const params = new URLSearchParams(location.search);
        if (params.get('error') === 'google_failed') {
            setError('Google login failed. Please try again.');
        }
    }, [location]);

    const handleSubmit = async (e) => {
        e.preventDefault();
        setError(null);
        try {
            const data = await authService.login({ username, password });
            setUser(data.user);  // Update user in context
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
        <div>
            <h2>Login</h2>
            <form onSubmit={handleSubmit}>
                <div>
                    <label>Username:</label>
                    <input
                        type="text"
                        value={username}
                        onChange={(e) => setUsername(e.target.value)}
                        required
                    />
                </div>
                <div>
                    <label>Password:</label>
                    <input
                        type="password"
                        value={password}
                        onChange={(e) => setPassword(e.target.value)}
                        required
                    />
                </div>
                {error && <p style={{ color: 'red' }}>{error}</p>}
                <button type="submit">Login</button>
            </form>
            <button onClick={handleGoogleLogin}>Login with Google</button>
            <button onClick={handleFacebookLogin}>Login with Facebook</button>
            <p>
                Don't have an account? <Link to="/register">Register here</Link>
            </p>
        </div>
    );
};

export default Login;