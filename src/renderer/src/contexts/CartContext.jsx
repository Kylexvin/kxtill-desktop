import React, { createContext, useContext, useState } from 'react';

const CartContext = createContext();

export const useCart = () => {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error('useCart must be used within a CartProvider');
  }
  return context;
};

export const CartProvider = ({ children }) => {
  const [cart, setCart] = useState([]);
  const [recentlyAdded, setRecentlyAdded] = useState({});

  const addToCart = (product) => {
    const existingItem = cart.find(item => item.productId === product.id && !item.needsCustomPrice);
    
    if (existingItem) {
      setCart(cart.map(item =>
        item.productId === product.id && !item.needsCustomPrice
          ? { ...item, quantity: item.quantity + 1 }
          : item
      ));
    } else {
      setCart([...cart, {
        productId: product.id,
        cartItemId: `cart-${Date.now()}-${Math.random()}`,
        name: product.name,
        quantity: 1,
        price: product.sellingPrice,
        trackStock: product.trackStock,
        needsCustomPrice: false
      }]);
    }
    
    setRecentlyAdded(prev => ({ ...prev, [product.id]: true }));
    setTimeout(() => {
      setRecentlyAdded(prev => ({ ...prev, [product.id]: false }));
    }, 1000);
  };

  const addCustomToCart = (product, quantity, price) => {
    setCart([...cart, {
      productId: product.id,
      cartItemId: `cart-${Date.now()}-${Math.random()}`,
      name: product.name,
      quantity: quantity,
      price: price,
      trackStock: product.trackStock,
      needsCustomPrice: true
    }]);
  };

  const updateCartQuantity = (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      removeFromCart(cartItemId);
      return;
    }
    setCart(cart.map(item =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: newQuantity }
        : item
    ));
  };

  const removeFromCart = (cartItemId) => {
    setCart(cart.filter(item => item.cartItemId !== cartItemId));
  };

  const clearCart = () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear the cart?')) {
      setCart([]);
    }
  };

  const processSale = async (paymentMethod) => {
    if (cart.length === 0 || !paymentMethod) return false;

    try {
      await new Promise(resolve => setTimeout(resolve, 1000));
      setCart([]);
      return true;
    } catch (error) {
      console.error('Error processing sale:', error);
      return false;
    }
  };

  const total = cart.reduce((sum, item) => sum + (item.price * item.quantity), 0);

  const value = {
    cart,
    recentlyAdded,
    addToCart,
    addCustomToCart,
    updateCartQuantity,
    removeFromCart,
    clearCart,
    processSale,
    total
  };

  return (
    <CartContext.Provider value={value}>
      {children}
    </CartContext.Provider>
  );
};