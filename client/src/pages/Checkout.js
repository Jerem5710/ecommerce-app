import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51TCPQuAtHJsynMrL6EPPMSkSyVwD0cvYj4YB1dAQMFvwxJSqSPlh21DdKPRca18X50dGqdXnmf6Yx8pLGtrt5JQ700WFz967g4'); // Replace with your Stripe publishable key

const CheckoutForm = () => {
    const { cart, setCart } = useContext(CartContext);
    const navigate = useNavigate();
    const location = useLocation();
    const { user } = useContext(AuthContext);
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);
    const [cartCleared, setCartCleared] = useState(false);

    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const totalAmount = cart?.items.reduce((sum, item) => sum + item.quantity * parseFloat(item.price), 0) || 0;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            setProcessing(false);
            return;
        }

        try {
            console.log('Creating payment intent for amount:', totalAmount * 100);
            const paymentIntentRes = await axios.post(
                `${process.env.REACT_APP_API_URL}/carts/${cart.id}/checkout`,
                { paymentDetails: { amount: totalAmount * 100 } },
                { withCredentials: true }
            );
            console.log('Payment intent response:', paymentIntentRes.data);

            const clientSecret = paymentIntentRes.data.clientSecret;

            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) },
            });

            console.log('Payment result:', paymentResult);

            if (paymentResult.error) {
                setError(paymentResult.error.message);
                setProcessing(false);
            } else if (paymentResult.paymentIntent.status === 'succeeded') {
                console.log('Payment succeeded, showing success alert');
                setSucceeded(true);
                setProcessing(false);
                setShowSuccessAlert(true);
                // Delay clearing cart and navigation to allow notification to show
                setTimeout(() => {
                    setShowSuccessAlert(false);
                    setCart(null);
                    navigate('/order-history');
                }, 3000);
            }
        } catch (err) {
            console.error('Payment failed:', err);
            setError('Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    const handleClearCart = async () => {
        if (!cart) return;
        setProcessing(true);
        setError(null);
        try {
            await axios.delete(
                `${process.env.REACT_APP_API_URL}/carts/${cart.id}/items`,
                { withCredentials: true }
            );
            setCart(null);
            setCartCleared(true);
            setProcessing(false);
        } catch (err) {
            console.error('Failed to clear cart:', err);
            setError('Failed to clear cart. Please try again.');
            setProcessing(false);
        }
    };

    const handleBack = () => {
        if (location.state && location.state.from) {
            navigate(location.state.from);
        } else {
            navigate(-1);
        }
    };

    if (!cart || !cart.items.length || cartCleared) {
        return (
            <div style={{ padding: '1rem' }}>
                <p>Your cart is empty.</p>
                <button onClick={handleBack} style={{ marginTop: '1rem' }}>
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <>
            {showSuccessAlert && (
                <div style={{
                    position: 'fixed',
                    top: '1rem',
                    right: '1rem',
                    backgroundColor: '#4BB543',
                    color: 'white',
                    padding: '1rem 1.5rem',
                    borderRadius: '5px',
                    boxShadow: '0 2px 6px rgba(0,0,0,0.2)',
                    zIndex: 1000,
                    fontWeight: 'bold',
                    fontSize: '1rem',
                    animation: 'fadein 0.5s ease-in-out'
                }}>
                    Payment successful!
                </div>
            )}
            <form onSubmit={handleSubmit} style={{ padding: '1rem' }}>
                <button type="button" onClick={handleBack} style={{ marginBottom: '1rem' }}>
                    Back to Product Details
                </button>
                <h2>Checkout</h2>
                <ul>
                    {cart.items.map(({ id, name, price, quantity }) => (
                        <li key={id}>
                            {name} x {quantity} = ${(parseFloat(price) * quantity).toFixed(2)}
                        </li>
                    ))}
                </ul>
                <h3>Total: ${totalAmount.toFixed(2)}</h3>
                <CardElement />
                {error && <div style={{ color: 'red' }}>{error}</div>}
                <button type="submit" disabled={!stripe || processing || succeeded} style={{ marginRight: '1rem' }}>
                    {processing ? 'Processing...' : 'Pay Now'}
                </button>
                <button
                    type="button"
                    onClick={handleClearCart}
                    disabled={processing}
                    style={{ backgroundColor: '#d9534f', color: 'white', border: 'none', padding: '0.5rem 1rem', cursor: 'pointer' }}
                >
                    {processing ? 'Clearing...' : 'Clear Cart'}
                </button>
                {succeeded && !showSuccessAlert && <p>Payment succeeded!</p>}
            </form>
        </>
    );
};

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default Checkout;