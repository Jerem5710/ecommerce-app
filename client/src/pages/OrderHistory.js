import React, { useContext, useEffect, useState } from 'react';
import { AuthContext } from '../context/AuthContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const OrderHistory = () => {
    const { user } = useContext(AuthContext);
    const navigate = useNavigate();
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

    if (loading) return <p>Loading your orders...</p>;
    if (error) return <p>{error}</p>;
    if (!orders.length) return <p>You have no past orders.</p>;

    return (
        <div>
            <h2>Your Order History</h2>
            {orders.map(order => (
                <div key={order.id} style={{ border: '1px solid #ccc', marginBottom: '1rem', padding: '1rem' }}>
                    <p><strong>Order ID:</strong> {order.id}</p>
                    <p><strong>Date:</strong> {new Date(order.orderDate).toLocaleDateString()}</p>
                    <p><strong>Status:</strong> {order.status}</p>
                    <h4>Items:</h4>
                    <ul>
                        {order.items.map(item => (
                            <li key={item.productId}>
                                {item.name} x {item.quantity} @ ${item.price.toFixed(2)}
                            </li>
                        ))}
                    </ul>
                </div>
            ))}
        </div>
    );
};

export default OrderHistory;