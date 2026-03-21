import React, { useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const Header = () => {
    const { user, setUser } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const cartItemsCount = cart?.items?.length || 0; // Calculate total items in cart
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
                {user?.isAdmin && (
                    <Link to="/admin/products" style={{ marginLeft: '1rem' }}>
                        Admin Panel
                    </Link>
                )}
                {user && cartItemsCount > 0 && ( // Show checkout link only if there are items in the cart
                    <Link to="/checkout" style={{ marginLeft: '1rem' }}>
                        Checkout
                    </Link>
                )}
                {user && <button onClick={handleLogout}>Logout</button>}
            </nav>
        </header>
    );
};

export default Header;