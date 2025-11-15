// src/components/pos/ShoppingCart/ShoppingCart.jsx
import React from 'react';
import { useCart } from '../../../contexts/CartContext';
import './ShoppingCart.css';

const ShoppingCart = () => {
  const { cartItems, removeFromCart, updateQuantity, clearCart, getCartTotal } = useCart();

  return (
    <div className="shopping-cart">
      <div className="cart-header">
        <h3>Shopping Cart</h3>
        {cartItems.length > 0 && (
          <button className="clear-cart-btn" onClick={clearCart}>
            Clear All
          </button>
        )}
      </div>

      <div className="cart-items">
        {cartItems.length === 0 ? (
          <div className="empty-cart">
            <p>Cart is empty</p>
            <span>Add products from the grid</span>
          </div>
        ) : (
          cartItems.map(item => (
            <div key={item.id} className="cart-item">
              <div className="item-info">
                <h4 className="item-name">{item.name}</h4>
                <p className="item-price">${item.price}</p>
              </div>
              <div className="item-controls">
                <div className="quantity-controls">
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity - 1)}
                    className="quantity-btn"
                  >
                    -
                  </button>
                  <span className="quantity">{item.quantity}</span>
                  <button 
                    onClick={() => updateQuantity(item.id, item.quantity + 1)}
                    className="quantity-btn"
                  >
                    +
                  </button>
                </div>
                <button 
                  onClick={() => removeFromCart(item.id)}
                  className="remove-btn"
                >
                  Remove
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cartItems.length > 0 && (
        <div className="cart-footer">
          <div className="cart-total">
            <span>Total:</span>
            <span className="total-amount">${getCartTotal().toFixed(2)}</span>
          </div>
          <button className="checkout-btn">
            Process Payment
          </button>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;