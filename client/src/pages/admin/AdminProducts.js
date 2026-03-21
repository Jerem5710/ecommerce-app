import React, { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import axios from 'axios';

const AdminProducts = () => {
    const [products, setProducts] = useState([]);
    const [categories, setCategories] = useState([]);
    const [selectedCategory, setSelectedCategory] = useState('');
    const [error, setError] = useState(null);
    const navigate = useNavigate();

    // Fetch categories once on mount
    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/categories`,
                    { withCredentials: true }
                );
                setCategories(response.data);
            } catch (err) {
                setError('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    // Fetch products whenever selectedCategory changes
    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = new URL(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products`);
                if (selectedCategory) {
                    url.searchParams.append('category', selectedCategory);
                }
                const response = await axios.get(url.toString(), { withCredentials: true });
                setProducts(response.data);
            } catch (err) {
                setError('Failed to load products');
            }
        };
        fetchProducts();
    }, [selectedCategory]);

    if (error) return <p>{error}</p>;

    return (
        <div style={{ padding: '1rem' }}>
            <h1>Admin Products</h1>

            <button onClick={() => navigate('/products')} style={{ marginRight: '1rem' }}>
                Back to Products Page
            </button>
            <button onClick={() => navigate('/admin/products/new')} style={{ marginBottom: '1rem' }}>
                Create New Product
            </button>
            <button onClick={() => navigate('/admin/orders')}>Go to Admin Orders</button>

            {/* Category filter dropdown with Clear button */}
            <div style={{ display: 'flex', alignItems: 'center', margin: '1rem 0' }}>
                <label htmlFor="categoryFilter" style={{ marginRight: '0.5rem' }}>Filter by Category:</label>
                <select
                    id="categoryFilter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    style={{ marginRight: '0.5rem' }}
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button onClick={() => setSelectedCategory('')}>Clear</button>
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {products.map((product) => (
                    <div
                        key={product.id}
                        style={{
                            border: '1px solid #ddd',
                            padding: '1rem',
                            margin: '0.5rem',
                            maxWidth: '220px',
                            position: 'relative',
                        }}
                    >
                        <img
                            src={product.image_url}
                            alt={product.name}
                            style={{ maxWidth: '200px', height: 'auto', objectFit: 'contain' }}
                        />
                        <h3>{product.name}</h3>
                        <p>{product.description}</p>
                        <p>
                            <strong>Price:</strong> ${Number(product.price).toFixed(2)}
                        </p>
                        <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            style={{ position: 'absolute', top: '10px', right: '10px' }}
                        >
                            Edit
                        </button>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminProducts;