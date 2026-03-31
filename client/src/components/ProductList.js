import React, { useEffect, useState } from 'react';
import axios from 'axios';
import Product from './Product';
import { Link, useLocation } from 'react-router-dom';

import { ReactComponent as SearchIcon } from '../assets/images/icons/search.svg';
import { ReactComponent as ClearIcon } from '../assets/images/icons/close.svg';

import './ProductList.css';

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
        if (location.state && location.state.scrollPosition) {
            window.scrollTo(0, location.state.scrollPosition);
        }
    }, [location.state]);

    if (error) return <p>{error}</p>;

    return (
        <div className="user-product-list-container">
            <h2>Browse Products</h2>

            <div className="search-bar">
                <SearchIcon className="search-icon" />
                <input
                    type="text"
                    placeholder="Search products..."
                    value={searchTerm}
                    onChange={(e) => setSearchTerm(e.target.value)}
                    className="search-input"
                    aria-label="Search products"
                />
                {searchTerm && (
                    <button
                        onClick={() => setSearchTerm('')}
                        className="clear-button"
                        aria-label="Clear search"
                    >
                        <ClearIcon className="clear-icon" />
                    </button>
                )}
            </div>

            <div className="user-products-grid">
                {products.map((product) => (
                    <Link
                        key={product.id}
                        to={`/products/${product.id}`}
                        state={{ scrollPosition: window.pageYOffset }}
                        className="product-link"
                    >
                        <Product product={product} />
                    </Link>
                ))}
            </div>
        </div>
    );
};

export default ProductList;