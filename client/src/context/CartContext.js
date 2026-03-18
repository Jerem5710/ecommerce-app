import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState(null);

    useEffect(() => {
        const fetchOrCreateCart = async () => {
            if (!user) {
                setCart(null);
                return;
            }
            try {
                // Try to get existing cart
                const res = await axios.get(`${process.env.REACT_APP_API_URL}/cart/${user.id}`, {
                    withCredentials: true,
                });
                setCart(res.data);
            } catch (err) {
                if (err.response && err.response.status === 404) {
                    // No cart found, create one
                    const createRes = await axios.post(
                        `${process.env.REACT_APP_API_URL}/cart`,
                        { userId: user.id },
                        { withCredentials: true }
                    );
                    setCart(createRes.data);
                } else {
                    console.error('Failed to fetch or create cart', err);
                }
            }
        };

        fetchOrCreateCart();
    }, [user]);

    return (
        <CartContext.Provider value={{ cart, setCart }}>
            {children}
        </CartContext.Provider>
    );
};