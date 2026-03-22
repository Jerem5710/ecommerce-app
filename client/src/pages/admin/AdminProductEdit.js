import React, { useState, useEffect } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import axios from 'axios';
import categoryService from '../../services/categoryService';

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

    if (error) return <p>{error}</p>;
    if (!product) return <p>Loading...</p>;

    return (
        <div style={{ padding: '1rem' }}>
            <button onClick={handleBack} style={{ marginBottom: '1rem' }}>
                Back to Products
            </button>
            <h2>Edit Product</h2>
            <div style={{ maxWidth: '400px' }}>
                <label>
                    Name:
                    <input
                        type="text"
                        name="name"
                        value={product.name || ''}
                        onChange={handleChange}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                </label>
                <label>
                    Description:
                    <textarea
                        name="description"
                        value={product.description || ''}
                        onChange={handleChange}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                </label>
                <label>
                    Price:
                    <input
                        type="number"
                        name="price"
                        value={product.price || ''}
                        onChange={handleChange}
                        step="0.01"
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                </label>
                <label>
                    Stock:
                    <input
                        type="number"
                        name="stock"
                        value={product.stock || ''}
                        onChange={handleChange}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                </label>
                <label>
                    Image URL:
                    <input
                        type="text"
                        name="image_url"
                        value={product.image_url || ''}
                        onChange={handleChange}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    />
                </label>
                <label>
                    Category:
                    <select
                        name="category_id"
                        value={product.category_id || ''}
                        onChange={handleChange}
                        style={{ width: '100%', marginBottom: '0.5rem' }}
                    >
                        <option value="">Select a category</option>
                        {categories.map((cat) => (
                            <option key={cat.id} value={cat.id}>
                                {cat.name}
                            </option>
                        ))}
                    </select>
                </label>
                <button onClick={handleSave} disabled={loading} style={{ marginRight: '1rem' }}>
                    {loading ? 'Saving...' : 'Save'}
                </button>
                <button
                    onClick={handleDelete}
                    disabled={loading}
                    style={{ backgroundColor: 'red', color: 'white' }}
                >
                    {loading ? 'Deleting...' : 'Delete'}
                </button>
            </div>
        </div>
    );
};

export default AdminProductEdit;