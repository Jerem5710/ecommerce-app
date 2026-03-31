import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

// Import Add to Cart icon as React component
import { ReactComponent as AddToCartIcon } from '../assets/images/icons/add-to-cart.svg';

import './ProductDetails.css';

const ProductDetails = () => {
    const { productId } = useParams();
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const { cart, setCart, refreshCart } = useContext(CartContext);
    const [product, setProduct] = useState(null);
    const [error, setError] = useState(null);
    const [quantity, setQuantity] = useState(1);
    const [loading, setLoading] = useState(false); // Loading state for add-to-cart

    useEffect(() => {
        const fetchProduct = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products/${productId}`
                );
                setProduct(response.data);
            } catch (err) {
                setError('Failed to load product details');
            }
        };

        fetchProduct();
        if (refreshCart) {
            refreshCart();
        }
    }, [productId, refreshCart]);

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please log in to add items to your cart.');
            return;
        }
        if (!cart) {
            alert('Loading cart, please try again shortly.');
            return;
        }
        if (loading) {
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/carts/${cart.id}/items`,
                { productId, quantity },
                { withCredentials: true }
            );
            const updatedCartRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/carts/${user.id}`,
                { withCredentials: true }
            );
            setCart(updatedCartRes.data);
            alert('Item added to cart!');
        } catch (err) {
            console.error('Failed to add item to cart', err);
            alert('Failed to add item to cart');
        } finally {
            setLoading(false);
        }
    };

    const handleBack = () => {
        const scrollPos = location.state?.scrollPosition || 0;
        navigate('/products', { state: { scrollPosition: scrollPos } });
    };

    if (error) return <p>{error}</p>;
    if (!product) return <p>Loading...</p>;

    const price = Number(product.price);
    const formattedPrice = isNaN(price) ? 'N/A' : price.toFixed(2);

    return (
        <div className="product-details-container">
            <button onClick={handleBack} className="back-button">
                &larr; Back to Products
            </button>
            <div className="product-details-content">
                <img
                    src={product.image_url}
                    alt={product.name}
                    className="product-image"
                />
                <div className="product-info">
                    <h2 className="product-name">{product.name}</h2>
                    <p className="product-description">{product.description}</p>
                    <p className="product-price">
                        <strong>Price:</strong> ${formattedPrice}
                    </p>
                    <div className="quantity-container">
                        <label htmlFor="quantity-input">Quantity:</label>
                        <input
                            id="quantity-input"
                            type="number"
                            min="1"
                            value={quantity}
                            onChange={(e) => setQuantity(Number(e.target.value))}
                            className="quantity-input"
                        />
                    </div>
                    <button
                        onClick={handleAddToCart}
                        className="add-to-cart-button"
                        disabled={loading || !cart}
                    >
                        {loading ? (
                            'Adding...'
                        ) : (
                            <>
                                <AddToCartIcon className="add-to-cart-icon" /> Add to Cart
                            </>
                        )}
                    </button>
                </div>
            </div>
        </div>
    );
};

export default ProductDetails;