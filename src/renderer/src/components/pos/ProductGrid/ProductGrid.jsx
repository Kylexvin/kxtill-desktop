import React from 'react';
import { Package, Check } from 'lucide-react';
import './ProductGrid.css';

const ProductGrid = ({ products, loading, onAddToCart, recentlyAdded }) => {
  if (loading) {
    return (
      <div className="products-grid">
        {Array(6).fill(0).map((_, i) => (
          <div key={i} className="product-skeleton">
            <div className="skeleton-image" />
            <div className="skeleton-text" />
            <div className="skeleton-text" />
          </div>
        ))}
      </div>
    );
  }

  if (products.length === 0) {
    return (
      <div className="empty-state">
        <Package size={48} color="#9ca3af" />
        <p>No products found</p>
      </div>
    );
  }

  return (
    <div className="products-grid">
      {products.map(product => (
        <div
          key={product.id}
          onClick={() => onAddToCart(product)}
          className={`product-card ${recentlyAdded[product.id] ? 'product-card-added' : ''}`}
        >
          <div className="product-image">
            <span className="product-initials">
              {product.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
            </span>
            {recentlyAdded[product.id] && (
              <div className="success-overlay">
                <Check size={24} color="white" />
              </div>
            )}
          </div>
          
          <div className="product-info">
            <h3 className="product-name">{product.name}</h3>
            <p className="product-price">
              {product.needsCustomPrice ? 'Custom Price' : `KSh ${product.sellingPrice}`}
            </p>
            
            {product.trackStock && (
              <span className="stock-tag">{product.quantity} in stock</span>
            )}
            
            {product.needsCustomPrice && (
              <span className="custom-badge">Custom</span>
            )}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ProductGrid;