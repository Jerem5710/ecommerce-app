import React, { useEffect, useState, useContext } from 'react';
import { useParams, useNavigate, useLocation } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

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
        // Refresh the cart to ensure it's up-to-date (enable add-to-cart button)
        if (refreshCart) {
            refreshCart();
        }
    }, [productId, refreshCart]);

    const handleAddToCart = async () => {
        if (!user) {
            alert('Please log in to add items to your cart.');
            return;
        }
        console.log('Current cart state before add:', cart);
        if (!cart) {
            alert('Loading cart, please try again shortly.');
            return;
        }
        if (loading) {
            // Prevent duplicate submissions
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/carts/${cart.id}/items`,
                { productId, quantity },
                { withCredentials: true }
            );
            // Refresh cart after adding item
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
        // Navigate back to product list, restoring scroll position if available
        const scrollPos = location.state?.scrollPosition || 0;
        navigate('/products', { state: { scrollPosition: scrollPos } });
    };

    if (error) return <p>{error}</p>;
    if (!product) return <p>Loading...</p>;

    const price = Number(product.price);
    const formattedPrice = isNaN(price) ? 'N/A' : price.toFixed(2);

    return (
        <div style={{ padding: '1rem' }}>
            <button onClick={handleBack} style={{ marginBottom: '1rem' }}>Back to Products</button>
            <img
                src={product.image_url}
                alt={product.name}
                style={{ maxWidth: '300px', objectFit: 'contain' }}
            />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${formattedPrice}</p>
            <div>
                <label>
                    Quantity:
                    <input
                        type="number"
                        min="1"
                        value={quantity}
                        onChange={(e) => setQuantity(Number(e.target.value))}
                        style={{ width: '50px', marginLeft: '0.5rem' }}
                    />
                </label>
            </div>
            <button onClick={handleAddToCart} style={{ marginTop: '1rem' }} disabled={loading || !cart}>
                {loading ? 'Adding...' : 'Add to Cart'}
            </button>
        </div>
    );
};

export default ProductDetails;