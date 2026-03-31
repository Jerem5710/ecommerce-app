import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import './AdminOrders.css';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filterUserId, setFilterUserId] = useState('');
    const [error, setError] = useState(null);
    const [loading, setLoading] = useState(false);
    const navigate = useNavigate();

    const fetchOrders = async (userId = '') => {
        setLoading(true);
        setError(null);
        try {
            const url = userId
                ? `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/orders?userId=${userId}`
                : `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/orders`;
            const response = await axios.get(url, { withCredentials: true });
            setOrders(response.data);
        } catch (err) {
            setError('Failed to fetch orders');
        } finally {
            setLoading(false);
        }
    };

    useEffect(() => {
        fetchOrders();
    }, []);

    const handleBack = () => {
        navigate('/admin/products');
    };

    const handleFilterByUserId = () => {
        fetchOrders(filterUserId.trim());
    };

    return (
        <div className="admin-orders-page">
            <h1 className="page-title">Admin Orders</h1>
            <button onClick={handleBack} className="back-button">
                Back to Products
            </button>
            <div className="filter-container">
                <label htmlFor="filterUserId" className="filter-label">
                    Filter by User ID:
                </label>
                <input
                    id="filterUserId"
                    type="text"
                    value={filterUserId}
                    onChange={(e) => setFilterUserId(e.target.value)}
                    placeholder="Enter user ID"
                    className="filter-input"
                />
                <button onClick={handleFilterByUserId} className="btn filter-btn">
                    Filter
                </button>
                <button
                    onClick={() => {
                        setFilterUserId('');
                        fetchOrders();
                    }}
                    className="btn clear-filter-btn"
                >
                    Clear Filter
                </button>
            </div>

            {loading && <p className="loading-text">Loading orders...</p>}
            {error && <p className="error-text">{error}</p>}

            {!loading && !error && orders.length === 0 && <p className="empty-text">No orders found.</p>}

            {!loading && !error && orders.length > 0 && (
                <div className="orders-list">
                    {orders.map((order) => (
                        <div key={order.id} className="order-card">
                            <p>
                                <strong>Order ID:</strong> {order.id}
                            </p>
                            <p>
                                <strong>User ID:</strong> {order.user_id}
                            </p>
                            <p>
                                <strong>Total:</strong> ${Number(order.total).toFixed(2)}
                            </p>
                            <p>
                                <strong>Status:</strong> {order.status}
                            </p>
                            <p>
                                <strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}
                            </p>
                            <div>
                                <strong>Items:</strong>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            Product ID: {item.product_id}, Quantity: {item.quantity}, Price: $
                                            {Number(item.price).toFixed(2)}
                                        </li>
                                    ))}
                                </ul>
                            </div>
                        </div>
                    ))}
                </div>
            )}
        </div>
    );
};

export default AdminOrders;