// src/components/pos/ProductGrid/ProductGrid.jsx
import React from 'react';
import './ProductGrid.css';

const ProductGrid = () => {
  const products = [
    { id: 1, name: 'Product 1', price: 10.99, stock: 15 },
    { id: 2, name: 'Product 2', price: 15.50, stock: 8 },
    { id: 3, name: 'Product 3', price: 8.99, stock: 20 },
    { id: 4, name: 'Product 4', price: 12.75, stock: 5 },
    { id: 5, name: 'Product 5', price: 19.99, stock: 12 },
    { id: 6, name: 'Product 6', price: 7.25, stock: 18 }
  ];

  return (
    <div className="product-grid">
      <div className="product-grid-header">
        <h3>Products</h3>
        <input type="text" placeholder="Search..." className="search-input" />
      </div>
      <div className="products-container">
        {products.map(product => (
          <div key={product.id} className="product-card">
            <div className="product-info">
              <h4>{product.name}</h4>
              <p className="price">${product.price}</p>
              <p className="stock">Stock: {product.stock}</p>
            </div>
            <button className="add-btn">Add</button>
          </div>
        ))}
      </div>
    </div>
  );
};

export default ProductGrid;