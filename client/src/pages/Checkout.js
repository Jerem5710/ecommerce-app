import React, { useContext, useState, useEffect } from 'react';
import { CartContext } from '../context/CartContext';
import { AuthContext } from '../context/AuthContext';
import { loadStripe } from '@stripe/stripe-js';
import { Elements, CardElement, useStripe, useElements } from '@stripe/react-stripe-js';
import axios from 'axios';
import { useNavigate, useLocation } from 'react-router-dom';

import {ReactComponent as PayNowIcon} from '../assets/images/icons/dollar.svg';
import {ReactComponent as EmptyCartIcon} from '../assets/images/icons/cart-empty.svg';

import './Checkout.css';

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
            const paymentIntentRes = await axios.post(
                `${process.env.REACT_APP_API_URL}/carts/${cart.id}/checkout`,
                { paymentDetails: { amount: totalAmount * 100 } },
                { withCredentials: true }
            );

            const clientSecret = paymentIntentRes.data.clientSecret;

            const paymentResult = await stripe.confirmCardPayment(clientSecret, {
                payment_method: { card: elements.getElement(CardElement) },
            });

            if (paymentResult.error) {
                setError(paymentResult.error.message);
                setProcessing(false);
            } else if (paymentResult.paymentIntent.status === 'succeeded') {
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
            <div className="empty-cart-container">
                <EmptyCartIcon className="empty-cart-icon" aria-label="Empty cart icon" />
                <p className="empty-cart-text">Your cart is empty.</p>
                <button onClick={handleBack} className="btn back-btn">
                    Back to Products
                </button>
            </div>
        );
    }

    return (
        <>
            {showSuccessAlert && (
                <div className="payment-success-alert" role="alert">
                    Payment successful!
                </div>
            )}
            <form onSubmit={handleSubmit} className="checkout-form">
                <button type="button" onClick={handleBack} className="btn back-btn">
                    Back to Product Details
                </button>
                <h2 className="checkout-heading">Checkout</h2>
                <ul className="cart-items-list">
                    {cart.items.map(({ id, name, price, quantity }) => (
                        <li key={id} className="cart-item">
                            {name} x {quantity} = ${(parseFloat(price) * quantity).toFixed(2)}
                        </li>
                    ))}
                </ul>
                <h3 className="total-amount">Total: ${totalAmount.toFixed(2)}</h3>
                <div className="card-element-container">
                    <CardElement options={{ hidePostalCode: true }} />
                </div>
                {error && <div className="error-message">{error}</div>}
                <div className="button-group">
                    <button type="submit" disabled={!stripe || processing || succeeded} className="btn pay-now-btn">
                        <PayNowIcon className="btn-icon" aria-hidden="true" />
                        {processing ? 'Processing...' : 'Pay Now'}
                    </button>
                    <button
                        type="button"
                        onClick={handleClearCart}
                        disabled={processing}
                        className="btn clear-cart-btn"
                    >
                        {processing ? 'Clearing...' : 'Clear Cart'}
                    </button>
                </div>
                {succeeded && !showSuccessAlert && <p className="payment-succeeded-text">Payment succeeded!</p>}
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