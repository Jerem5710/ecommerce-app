import React from 'react';
import ProductList from '../components/ProductList';

const ProductsPage = () => {
    return (
        <div>
            <h1>Welcome {user ? user.username : 'Guest'}! Browse Products</h1>
            <ProductList />
        </div>
    );
};

export default ProductsPage;