import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const stripePromise = loadStripe('pk_test_51TCPQuAtHJsynMrL6EPPMSkSyVwD0cvYj4YB1dAQMFvwxJSqSPlh21DdKPRca18X50dGqdXnmf6Yx8pLGtrt5JQ700WFz967g4'); // Replace with your Stripe publishable key

const CheckoutForm = () => {
    const { cart, setCart } = useContext(CartContext);
    const navigate = useNavigate();
    const { user } = useContext(AuthContext);
    const stripe = useStripe();
    const elements = useElements();
    const [error, setError] = useState(null);
    const [processing, setProcessing] = useState(false);
    const [succeeded, setSucceeded] = useState(false);
    const [showSuccessAlert, setShowSuccessAlert] = useState(false);

    // Redirect to login if not authenticated
    useEffect(() => {
        if (!user) {
            navigate('/login');
        }
    }, [user, navigate]);

    const totalAmount = cart?.items.reduce((sum, item) => sum + item.quantity * item.product.price, 0) || 0;

    const handleSubmit = async (event) => {
        event.preventDefault();
        setProcessing(true);
        setError(null);

        if (!stripe || !elements) {
            setProcessing(false);
            return;
        }

        try {
            // Create payment intent on backend
            const paymentIntentRes = await axios.post(
                `${process.env.REACT_APP_API_URL}/cart/${cart.id}/checkout`,
                { paymentDetails: { amount: totalAmount * 100 } }, // amount in cents
                { withCredentials: true }
            );

            const clientSecret = paymentIntentRes.data.clientSecret;

            // Confirm card payment
            const cardElement = elements.getElement(CardElement);
            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: cardElement },
            });

            if (paymentResult.error) {
                setError(paymentResult.error.message);
                setProcessing(false);
            } else if (paymentResult.paymentIntent.status === 'succeeded') {
                setSucceeded(true);
                setProcessing(false);
                // Optionally clear cart in frontend
                setCart(null);
                setShowSuccessAlert(true);
                // Redirect to order history or confirmation page
                // Automatically clear alert and redirect after 3 seconds
                setTimeout(() => {
                    setShowSuccessAlert(false);
                    navigate('/order-history');
                }, 3000);
            }
        } catch (err) {
            console.error('Payment failed:', err);
            setError('Payment failed. Please try again.');
            setProcessing(false);
        }
    };

    if (!cart || !cart.items.length) return <p>Your cart is empty.</p>;

    return (
        <form onSubmit={handleSubmit}>
            <h2>Checkout</h2>
            <ul>
                {cart.items.map(({ id, product, quantity }) => (
                    <li key={id}>
                        {product.name} x {quantity} = ${(product.price * quantity).toFixed(2)}
                    </li>
                ))}
            </ul>
            <h3>Total: ${totalAmount.toFixed(2)}</h3>
            <CardElement />
            {error && <div style={{ color: 'red' }}>{error}</div>}
            {showSuccessAlert && (
                <div style={{ color: 'green', marginTop: '1rem' }}>
                    Payment successful! Redirecting to your order history...
                </div>
            )}
            <button type="submit" disabled={!stripe || processing || succeeded}>
                {processing ? 'Processing...' : 'Pay Now'}
            </button>
            {succeeded && !showSuccessAlert && <p>Payment succeeded!</p>}
        </form>
    );
};

const Checkout = () => (
    <Elements stripe={stripePromise}>
        <CheckoutForm />
    </Elements>
);

export default Checkout;