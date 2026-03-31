import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';

import './OrderHistory.css';

const OrderHistory = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
    const location = useLocation();
    const [orders, setOrders] = useState([]);
    const [loading, setLoading] = useState(true);
    const [error, setError] = useState(null);

    useEffect(() => {
        if (!user) {
            navigate('/login');
            return;
        }

        const fetchOrders = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL}/orders/${user.id}`,
                    { withCredentials: true }
                );
                setOrders(response.data);
            } catch (err) {
                setError('Failed to load order history');
            } finally {
                setLoading(false);
            }
        };

        fetchOrders();
    }, [user, navigate]);

    const handleBack = () => {
        if (location.state && location.state.from) {
            navigate(location.state.from);
        } else {
            navigate(-1); // fallback to previous page
        }
    };

    if (loading) return <p className="loading-text">Loading your orders...</p>;
    if (error) return <p className="error-text">{error}</p>;
    if (!orders.length) return <p className="empty-text">You have no past orders.</p>;

    return (
        <div className="order-history-page">
            <button onClick={handleBack} className="back-button">Back</button>
            <h2 className="page-heading">Your Order History</h2>
            {orders.map(order => (
                <div key={order.id} className="order-card">
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <h4>Items:</h4>
                    <ul className="order-items-list">
                        {order.items.map(item => (
                            <li key={item.productId}>
                                {item.name} x {item.quantity} @ ${Number(item.price).toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default OrderHistory;