import React, { useContext } from 'react';
import ProductList from '../components/ProductList';
import { AuthContext } from '../context/AuthContext';

const ProductsPage = () => {
    const { user } = useContext(AuthContext);

    return (
        <div>
            <h1>Welcome {user ? user.username : 'Guest'}! Browse Products</h1>
            <ProductList />
        </div>
    );
};

export default ProductsPage;