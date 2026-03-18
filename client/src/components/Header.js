import React from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';

const Header = ({ user, setUser }) => {
    const { user, setUser } = useContext(AuthContext);
    const navigate = useNavigate();

    const handleLogout = async () => {
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/users/logout`,
                {},
                { withCredentials: true }
            );
            setUser(null); // Clear user state on frontend
            navigate('/login'); // Redirect to login page
        } catch (err) {
            console.error('Logout failed', err);
        }
    };

    return (
        <header>
            <nav>
                {/* Other navigation links */}
                {user && <button onClick={handleLogout}>Logout</button>}
            </nav>
        </header>
    );
};

export default Header;
