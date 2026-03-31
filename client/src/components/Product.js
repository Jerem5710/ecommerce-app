import React from 'react';
import './Product.css';

const Product = ({ product }) => {
    const price = Number(product.price);
    const displayPrice = isNaN(price) ? 'N/A' : price.toFixed(2);

    return (
        <div className="user-product-card">
            <img
                src={product.image_url}
                alt={product.name}
                className="product-image"
            />
            <div className="product-info">
                <h3 className="product-name">{product.name}</h3>
                <p className="product-description">{product.description}</p>
                <p className="product-price">
                    <strong>Price:</strong> ${displayPrice}
                </p>
            </div>
        </div>
    );
};

export default Product;