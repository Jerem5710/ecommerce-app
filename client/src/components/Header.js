import React, { useContext } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { Link } from 'react-router-dom';

const Header = () => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/logout`,
                {},
                { withCredentials: true }
            );
            setUser(null);
            navigate('/login');
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <header>
            <nav>
                {/* Other navigation links */}
                {user && <Link to="/order-history">Order History</Link>}
                {user && <button onClick={handleLogout}>Logout</button>}
            </nav>
        </header>
    );
};

export default Header;