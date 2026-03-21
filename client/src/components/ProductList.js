import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Product from './Product';
import { Link, useLocation } from 'react-router-dom';

const ProductList = () => {
    const [products, setProducts] = useState([]);
    const [error, setError] = useState(null);
    const [searchTerm, setSearchTerm] = useState('');
    const location = useLocation();

    useEffect(() => {
        const fetchProducts = async () => {
            try {
                const url = new URL(`${process.env.REACT_APP_API_URL || 'http://localhost:3000'}/products`);
                if (searchTerm) {
                    url.searchParams.append('search', searchTerm);
                }
                const response = await axios.get(url.toString());
                setProducts(response.data);
            } catch (err) {
                setError('Failed to load products');
            }
        };

        fetchProducts();
    }, [searchTerm]);

    useEffect(() => {
        // Restore scroll position if available
        if (location.state && location.state.scrollPosition) {
            window.scrollTo(0, location.state.scrollPosition);
        }
    }, [location.state]);

    if (error) return <p>{error}</p>;

    return (
        <div>
            <h2>Products</h2>

            {/* Search input with clear button */}
            <div style={{ marginBottom: '1rem', position: 'relative', maxWidth: '300px' }}>
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    style={{ width: '100%', paddingRight: '24px' }}
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        style={{
                            position: 'absolute',
                            right: '4px',
                            top: '50%',
                            transform: 'translateY(-50%)',
                            background: 'transparent',
                            border: 'none',
                            cursor: 'pointer',
                            fontSize: '16px',
                            lineHeight: '1',
                        }}
                        aria-label="Clear search"
                    >
                        &times;
                    </button>
                )}
            </div>

            <div style={{ display: 'flex', flexWrap: 'wrap' }}>
                {products.map((product) => (
                    <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        state={{ scrollPosition: window.pageYOffset }}
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