import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminOrders = () => {
    const [orders, setOrders] = useState([]);
    const [filterUserId, setFilterUserId] = useState('');
    const [filterUsername, setFilterUsername] = useState(''); // Optional, if you want to filter by username
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

    // Optional: If you want to filter by username, you would need an API endpoint to get userId by username
    // For now, this example filters only by userId

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Admin Orders</h1>
            <button onClick={handleBack} style={{ marginBottom: '1rem' }}>
                Back to Products
            </button>
            <div style={{ marginBottom: '1rem' }}>
                <label>
                    Filter by User ID:{' '}
                    <input
                        type="text"
                        value={filterUserId}
                        onChange={(e) => setFilterUserId(e.target.value)}
                        placeholder="Enter user ID"
                        style={{ marginRight: '0.5rem' }}
                    />
                </label>
                <button onClick={handleFilterByUserId}>Filter</button>
                <button onClick={() => { setFilterUserId(''); fetchOrders(); }} style={{ marginLeft: '0.5rem' }}>
                    Clear Filter
                </button>
            </div>

            {loading && <p>Loading orders...</p>}
            {error && <p style={{ color: 'red' }}>{error}</p>}

            {!loading && !error && orders.length === 0 && <p>No orders found.</p>}

            {!loading && !error && orders.length > 0 && (
                <div>
                    {orders.map((order) => (
                        <div key={order.id} style={{ border: '1px solid #ccc', padding: '1rem', marginBottom: '1rem' }}>
                            <p><strong>Order ID:</strong> {order.id}</p>
                            <p><strong>User ID:</strong> {order.user_id}</p>
                            <p><strong>Total:</strong> ${Number(order.total).toFixed(2)}</p>
                            <p><strong>Status:</strong> {order.status}</p>
                            <p><strong>Created At:</strong> {new Date(order.created_at).toLocaleString()}</p>
                            <div>
                                <strong>Items:</strong>
                                <ul>
                                    {order.items.map((item, idx) => (
                                        <li key={idx}>
                                            Product ID: {item.product_id}, Quantity: {item.quantity}, Price: ${Number(item.price).toFixed(2)}
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