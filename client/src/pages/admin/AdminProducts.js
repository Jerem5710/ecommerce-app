import React, { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

import './AdminProducts.css';

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

    if (error) return <p className="error-message">{error}</p>;

    return (
        <div className="admin-products-page">
            <h1 className="page-title">Click any Product to edit</h1>

            <div className="top-buttons">
                <button onClick={() => navigate('/products')} className="btn back-btn">
                    Back to Products Page
                </button>
                <button onClick={() => navigate('/admin/products/new')} className="btn create-btn">
                    Create New Product
                </button>
                <button onClick={() => navigate('/admin/orders')} className="btn orders-btn">
                    Go to Admin Orders
                </button>
            </div>

            {/* Category filter dropdown with Clear button */}
            <div className="filter-container">
                <label htmlFor="categoryFilter" className="filter-label">Filter by Category:</label>
                <select
                    id="categoryFilter"
                    value={selectedCategory}
                    onChange={(e) => setSelectedCategory(e.target.value)}
                    className="filter-select"
                >
                    <option value="">All Categories</option>
                    {categories.map((cat) => (
                        <option key={cat.id} value={cat.id}>
                            {cat.name}
                        </option>
                    ))}
                </select>
                <button onClick={() => setSelectedCategory('')} className="btn clear-filter-btn">
                    Clear
                </button>
            </div>

            <div className="admin-products-grid">
                {products.map((product) => (
                    <div key={product.id} className="product-card">
                        <button
                            onClick={() => navigate(`/admin/products/${product.id}/edit`)}
                            className="edit-btn"
                            aria-label={`Edit ${product.name}`}
                        >
                            Edit
                        </button>
                        <img
                            src={product.image_url}
                            alt={product.name}
                            className="product-image"
                        />
                        <h3 className="product-name">{product.name}</h3>
                        <p className="product-description">{product.description}</p>
                        <p className="product-price">
                            <strong>Price:</strong> ${Number(product.price).toFixed(2)}
                        </p>
                    </div>
                ))}
            </div>
        </div>
    );
};

export default AdminProducts;