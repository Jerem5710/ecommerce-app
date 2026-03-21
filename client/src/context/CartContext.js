import React, { createContext, useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AuthContext } from './AuthContext';

export const CartContext = createContext();

export const CartProvider = ({ children }) => {
    const { user } = useContext(AuthContext);
    const [cart, setCart] = useState(null);

    // Define fetchOrCreateCart as a reusable function
    const fetchOrCreateCart = async () => {
        if (!user) {
            console.log('No user, clearing cart');
            setCart(null);
            return;
        }
        try {
            console.log('Fetching cart for user:', user.id);
            const res = await axios.get(`${process.env.REACT_APP_API_URL}/carts/${user.id}`, {
                withCredentials: true,
            });
            console.log('Cart fetched successfully:', res.data);
            setCart(res.data);
        } catch (err) {
            if (err.response && err.response.status === 404) {
                console.log('No cart found, creating one for user:', user.id);
                const createRes = await axios.post(
                    `${process.env.REACT_APP_API_URL}/carts`,
                    { userId: user.id },
                    { withCredentials: true }
                );
                console.log('Cart created:', createRes.data);
                setCart(createRes.data);
            } else {
                console.error('Failed to fetch or create cart', err);
            }
        }
    };

    // Call fetchOrCreateCart on user change
    useEffect(() => {
        fetchOrCreateCart();
    }, [user]);

    // Expose refreshCart function to allow manual cart refresh
    return (
        <CartContext.Provider value={{ cart, setCart, refreshCart: fetchOrCreateCart }}>
            {children}
        </CartContext.Provider>
    );
};