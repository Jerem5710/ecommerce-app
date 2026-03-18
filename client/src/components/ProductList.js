import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Product from './Product';
import { Link } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const response = await axios.get(
                    `${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products`
                );
                setProducts(response.data);
            } catch (err) {
                setError('Failed to load products');
            }
        };

        fetchProducts();
    }, []);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Products</h2>
            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {products.map((product) => (
                    <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        style={{ textDecoration: 'none', color: 'inherit' }}
                    >
                        <Product product={product} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductList;