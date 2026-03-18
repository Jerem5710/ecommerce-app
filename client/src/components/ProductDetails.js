import React, { useEffect, useState, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AuthContext } from '../context/AuthContext';
import { CartContext } from '../context/CartContext';

const ProductDetails = () => {
    const { productId } = useParams();
    const { user } = useContext(AuthContext);
    const { cart, setCart } = useContext(CartContext);
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
    }, [productId]);

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
            // Prevent duplicate submissions
            return;
        }
        setLoading(true);
        try {
            await axios.post(
                `${process.env.REACT_APP_API_URL}/cart/${cart.id}/items`,
                { productId, quantity },
                { withCredentials: true }
            );
            // Refresh cart after adding item
            const updatedCartRes = await axios.get(
                `${process.env.REACT_APP_API_URL}/cart/${user.id}`,
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

    if (error) return <p>{error}</p>;
    if (!product) return <p>Loading...</p>;

    return (
        <div style={{ padding: '1rem' }}>
            <img
                src={product.image_url}
                alt={product.name}
                style={{ maxWidth: '300px', objectFit: 'contain' }}
            />
            <h2>{product.name}</h2>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
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
            <button onClick={handleAddToCart} style={{ marginTop: '1rem' }} disabled={loading}>
                {loading ? 'Adding...' : 'Add to Cart'}
            </button>
        </div>
    );
};

export default ProductDetails;