import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import categoryService from '../../services/categoryService';

import './AdminProductEdit.css';

const AdminProductEdit = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const [product, setProduct] = useState(null);
    const [categories, setCategories] = useState([]);
    const [loading, setLoading] = useState(false);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products/${productId}`,
                    { withCredentials: true }
                );
                setProduct(response.data);
            } catch (err) {
                setError('Failed to load product details');
            }
        };

        const fetchCategories = async () => {
            try {
                const categories = await categoryService.getCategories();
                setCategories(categories);
            } catch (err) {
                setError('Failed to load categories');
            }
        };

        fetchProduct();
        fetchCategories();
    }, [productId]);

    const handleChange = (e) => {
        const { name, value } = e.target;
        setProduct((prev) => ({ ...prev, [name]: value }));
    };

    const handleSave = async () => {
        setLoading(true);
        try {
            await axios.put(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products/${productId}`,
                {
                    ...product,
                    price: parseFloat(product.price),
                    stock: parseInt(product.stock, 10) || 0,
                    category_id: parseInt(product.category_id, 10),
                },
                { withCredentials: true }
            );
            alert('Product updated successfully');
            navigate('/admin/products');
        } catch (err) {
            alert('Failed to update product');
        } finally {
            setLoading(false);
        }
    };

    const handleDelete = async () => {
        if (!window.confirm('Are you sure you want to delete this product?')) return;
        setLoading(true);
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products/${productId}`,
                { withCredentials: true }
            );
            alert('Product deleted successfully');
            navigate('/admin/products');
        } catch (err) {
            alert('Failed to delete product');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        navigate('/admin/products');
    };

    if (error) return <p className="error-message">{error}</p>;
    if (!product) return <p className="loading-text">Loading...</p>;

    return (
        <div className="admin-product-edit-page">
            <button onClick={handleBack} className="back-button">
                Back to Products
            </button>
            <h2 className="page-heading">Edit Product</h2>
            <div className="form-container">
                <label className="form-label">
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={product.name || ''}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="Product name"
                    />
                </label>
                <label className="form-label">
                    Description:
                    <textarea
                        name="description"
                        value={product.description || ''}
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
                        value={product.price || ''}
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
                        value={product.stock || ''}
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
                        value={product.image_url || ''}
                        onChange={handleChange}
                        className="input-field"
                        placeholder="https://example.com/image.jpg"
                    />
                </label>
                <label className="form-label">
                    Category:
                    <select
                        name="category_id"
                        value={product.category_id || ''}
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
                        onClick={handleDelete}
                        disabled={loading}
                        className="btn delete-btn"
                    >
                        {loading ? 'Deleting...' : 'Delete'}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default AdminProductEdit;