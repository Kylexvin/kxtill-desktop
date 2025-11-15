// src/pages/POS.jsx
import React, { useState } from 'react';
import Layout from '../components/common/Layout/Layout';
import ProductGrid from '../components/pos/ProductGrid/ProductGrid';
import ShoppingCart from '../components/pos/ShoppingCart/ShoppingCart';
import { CartProvider } from '../contexts/CartContext';
import './POS.css';

const POS = () => {
  const [activeTab, setActiveTab] = useState('pos');

  return (
    <CartProvider>
      <Layout 
        activeTab={activeTab}
        onTabChange={setActiveTab}
        isOnline={true}
        pendingSyncs={0}
      >
        {/* <div className="pos-container">
          <div className="pos-products">
            <ProductGrid />
          </div>
          <div className="pos-cart">
            <ShoppingCart />
          </div>
        </div> */}
      </Layout>
    </CartProvider>
  );
};

export default POS;