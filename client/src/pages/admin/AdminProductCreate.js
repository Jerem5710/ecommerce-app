import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';
import categoryService from '../../services/categoryService';

import './AdminProductCreate.css';

const AdminProductCreate = () => {
    const navigate = useNavigate();
    const [product, setProduct] = useState({
        name: '',
        description: '',
        price: '',
        stock: '',
        image_url: '',
        category_id: '',
    });
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchCategories = async () => {
            try {
                const categories = await categoryService.getCategories();
                setCategories(categories);
            } catch (err) {
                setError('Failed to load categories');
            }
        };
        fetchCategories();
    }, []);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        setError(null);
        try {
            if (!product.name || !product.price) {
                setError('Name and price are required');
                setLoading(false);
                return;
            }
            if (!product.category_id) {
                setError('Category is required');
                setLoading(false);
                return;
            }

            const payload = {
                ...product,
                price: parseFloat(product.price),
                stock: parseInt(product.stock, 10) || 0,
                category_id: parseInt(product.category_id, 10),
            };

            await axios.post(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products`,
                payload,
                { withCredentials: true }
            );
            alert('Product created successfully');
            navigate('/admin/products');
        } catch (err) {
            setError('Failed to create product');
        } finally {
            setLoading(false);
        }
    };

    const handleCancel = () => {
        navigate('/admin/products');
    };

    return (
        <div className="admin-product-create-page">
            <h2 className="page-heading">Create New Product</h2>
            {error && <p className="error-message">{error}</p>}
            <div className="form-container">
                <label className="form-label">
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={product.name}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Product name"
                    />
                </label>
                <label className="form-label">
                    Description:
                    <textarea
                        name="description"
                        value={product.description}
                        onChange={handleChange}
                        className="textarea-field"
                        placeholder="Product description"
                    />
                </label>
                <label className="form-label">
                    Price:
                    <input
                        type="number"
                        name="price"
                        value={product.price}
                        onChange={handleChange}
                        step="0.01"
                        className="input-field"
                        placeholder="0.00"
                    />
                </label>
                <label className="form-label">
                    Stock:
                    <input
                        type="number"
                        name="stock"
                        value={product.stock}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="0"
                    />
                </label>
                <label className="form-label">
                    Image URL:
                    <input
                        type="text"
                        name="image_url"
                        value={product.image_url}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="https://example.com/image.jpg"
                    />
                </label>
                <label className="form-label">
                    Category:
                    <select
                        name="category_id"
                        value={product.category_id}
                        onChange={handleChange}
                        className="select-field"
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <div className="button-group">
                    <button
                        onClick={handleSave}
                        disabled={loading}
                        className="btn save-btn"
                    >
                        {loading ? 'Saving...' : 'Save'}
                    </button>
                    <button
                        onClick={handleCancel}
                        disabled={loading}
                        className="btn cancel-btn"
                    >
                        Cancel
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProductCreate;