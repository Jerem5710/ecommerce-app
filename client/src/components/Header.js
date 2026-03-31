import React, { useContext, useState, useRef, useEffect } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Import SVGs as React components
import { ReactComponent as StoreLogo } from '../assets/images/logos/Luigi-Jer.svg';
import { ReactComponent as OrderIcon } from '../assets/images/icons/order.svg';
import { ReactComponent as AdminIcon } from '../assets/images/icons/icon-admin.svg';
import { ReactComponent as CheckoutIcon } from '../assets/images/icons/full-cart.svg';
import { ReactComponent as LogoutIcon } from '../assets/images/icons/logout.svg';
import logoPng from '../assets/images/logos/Luigi-Jer.png';
import menuIcon from '../assets/images/icons/menu.png';

import './Header.css'; // Import CSS for styling

const Header = () => {
    const { user, setUser } = useContext(AuthContext);
    const { cart } = useContext(CartContext);
    const cartItemsCount = cart?.items?.length || 0;
    const navigate = useNavigate();
    const [isOpen, setIsOpen] = useState(false); 
    const dropdownRef = useRef(null); // close dropdown when clicking outside

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

    // Close dropdown when clicking outside
    const iconRef = useRef(null);

    useEffect(() => {
        const handleClickOutside = (event) => {
            if (
                dropdownRef.current &&
                !dropdownRef.current.contains(event.target) &&
                iconRef.current &&
                !iconRef.current.contains(event.target)
            ) {
                setIsOpen(false);
            }
        };
        document.addEventListener('mousedown', handleClickOutside);
        return () => {
            document.removeEventListener('mousedown', handleClickOutside);
        };
    }, []);

    return (
        <header className="header">
            <nav className="nav">
                <Link to="/" className="logo-link" aria-label="Home">
                    {/*<StoreLogo className="logo" />} */}
                    <img src={logoPng} alt="Store Logo" className="logo" />
                </Link>

                {/* Desktop Links */}
                <div className="nav-links">
                {user && (
                    <>
                        <Link to="/order-history" className="nav-link">
                            <OrderIcon className="icon" />
                            <span>Order History</span>
                        </Link>

                        {user.isAdmin && (
                            <Link to="/admin/products" className="nav-link">
                                <AdminIcon className="icon" />
                                <span>Admin Panel</span>
                            </Link>
                        )}

                        {cartItemsCount > 0 && (
                            <Link to="/checkout" className="nav-link">
                                <CheckoutIcon className="icon" />
                                <span>Checkout</span>
                            </Link>
                        )}

                        <button onClick={handleLogout} className="nav-button" aria-label="Logout">
                            <LogoutIcon className="icon" />
                            <span>Logout</span>
                        </button>
                    </>
                    )}
                </div>

                {/* Mobile Menu icon */}
                {user && (
                    <img
                        src={menuIcon}
                        ref={iconRef}
                        alt="Menu"
                        className="menu-icon"
                        onClick={() => setIsOpen(prev => !prev)} // toggles open/close
                    />
                )}
            </nav>
            {/* Dropdown menu - render outside the nav so it doesn't stack inside the header*/}
            {isOpen && (
                <div className="dropdown" ref={dropdownRef}>
                    <Link to="/order-history" onClick={() => setIsOpen(false)}>Order History</Link>
                    {user?.isAdmin && (
                        <Link to="/admin/products" onClick={() => setIsOpen(false)}>Admin Panel</Link>
                    )}
                    {cartItemsCount > 0 && (
                        <Link to="/checkout" onClick={() => setIsOpen(false)}>Checkout</Link>
                    )}
                    <button onClick={() => { handleLogout(); setIsOpen(false); }}>Logout</button>
                </div>
            )}
        </header>
    );
};

export default Header;