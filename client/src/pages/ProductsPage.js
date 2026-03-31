import React, { useContext } from 'react';
import ProductList from '../components/ProductList';
import { AuthContext } from '../context/AuthContext';

import './ProductsPage.css';

const ProductsPage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div className="products-page-container">
            <h1 className="welcome-heading">Welcome {user ? user.username : 'Guest'}! Browse Products</h1>
            <ProductList />
        </div>
    );
};

export default ProductsPage;