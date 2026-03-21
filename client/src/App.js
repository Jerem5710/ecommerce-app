import React from 'react';
import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import PrivateRoute from './components/PrivateRoute';

import Header from './components/Header';
import ProductsPage from './pages/ProductsPage';
import ProductDetails from './components/ProductDetails';
import Login from './pages/Login';
import Register from './pages/Register';
import { AuthProvider } from './context/AuthContext';
import { CartProvider } from './context/CartContext';
import Checkout from './pages/Checkout';
import OrderHistory from './pages/OrderHistory';

function App() {
    const addToCart = (product, quantity) => {
        console.log('Add to cart:', product, quantity);
        // Implement cart state update here
    };

    return (
        <AuthProvider>
            <CartProvider>
            <Router>
                <Header />
                <Routes>
                        <Route path="/" element={<Navigate to="/products" />} />

                        <Route
                            path="/products"
                            element={
                                <PrivateRoute>
                                    <ProductsPage />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/products/:productId"
                            element={
                                <PrivateRoute>
                                    <ProductDetails addToCart={addToCart} />
                                </PrivateRoute>
                            }
                        />
                        <Route path="/login" element={<Login />} />
                        <Route path="/register" element={<Register />} />
                        <Route
                            path="/checkout"
                            element={
                                <PrivateRoute>
                                    <Checkout />
                                </PrivateRoute>
                            }
                        />
                        <Route
                            path="/order-history"
                            element={
                                <PrivateRoute>
                                    <OrderHistory />
                                </PrivateRoute>
                            }
                        />
                    {/* Add routes for login, register, cart, etc. */}
                </Routes>
                </Router>
            </CartProvider>
        </AuthProvider>
    );
}

export default App;