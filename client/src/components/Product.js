import React from 'react';

const Product = ({ product }) => {
    return (
        <div style={{ border: '1px solid #ddd', padding: '1rem', margin: '1rem', maxWidth: '220px' }}>
            <img
                src={product.image_url}
                alt={product.name}
                style={{ maxWidth: '200px', height: 'auto', objectFit: 'contain' }}
            />
            <h3>{product.name}</h3>
            <p>{product.description}</p>
            <p><strong>Price:</strong> ${product.price.toFixed(2)}</p>
        </div>
    );
};

export default Product;