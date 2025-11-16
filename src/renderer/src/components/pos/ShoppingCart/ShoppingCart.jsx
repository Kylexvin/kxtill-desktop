import React from 'react';
import { Trash2, X, Plus, Minus, DollarSign, Smartphone, ShoppingCart } from 'lucide-react';
import { useCart } from '../../contexts/CartContext';
import './ShoppingCart.css';

const ShoppingCart = ({ onProcessSale, total }) => {
  const { cart, updateCartQuantity, removeFromCart, clearCart } = useCart();

  return (
    <div className="cart-section">
      <div className="cart-header">
        <h2 className="cart-title">Current Order</h2>
        {cart.length > 0 && (
          <button onClick={clearCart} className="clear-btn">
            <Trash2 size={18} />
            Clear
          </button>
        )}
      </div>

      <div className="cart-items">
        {cart.length === 0 ? (
          <div className="empty-cart">
            <ShoppingCart size={48} color="#9ca3af" />
            <p>No items in cart</p>
            <span>Add products to get started</span>
          </div>
        ) : (
          cart.map(item => (
            <div key={item.cartItemId} className="cart-item">
              <div className="cart-item-info">
                <h4 className="cart-item-name">{item.name}</h4>
                <p className="cart-item-price">
                  KSh {item.price} {item.needsCustomPrice && '★'}
                </p>
              </div>

              <div className="cart-item-controls">
                {!item.needsCustomPrice ? (
                  <div className="quantity-controls">
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                      className="quantity-btn"
                    >
                      <Minus size={16} />
                    </button>
                    
                    <input
                      type="number"
                      value={item.quantity}
                      onChange={(e) => updateCartQuantity(item.cartItemId, parseFloat(e.target.value) || 0)}
                      className="quantity-input"
                    />
                    
                    <button
                      onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                      className="quantity-btn"
                    >
                      <Plus size={16} />
                    </button>
                  </div>
                ) : (
                  <span className="custom-quantity">Qty: {item.quantity}</span>
                )}

                <span className="item-total">
                  KSh {(item.price * item.quantity).toFixed(2)}
                </span>

                <button
                  onClick={() => removeFromCart(item.cartItemId)}
                  className="remove-btn"
                >
                  <X size={18} />
                </button>
              </div>
            </div>
          ))
        )}
      </div>

      {cart.length > 0 && (
        <div className="checkout-section">
          <div className="total-row">
            <span className="total-label">Total:</span>
            <span className="total-amount">KSh {total.toFixed(2)}</span>
          </div>

          <div className="payment-buttons">
            <button
              onClick={() => onProcessSale('cash')}
              className="payment-btn cash-btn"
            >
              <DollarSign size={20} />
              Cash
            </button>
            
            <button
              onClick={() => onProcessSale('mpesa')}
              className="payment-btn mpesa-btn"
            >
              <Smartphone size={20} />
              M-Pesa
            </button>
          </div>
        </div>
      )}
    </div>
  );
};

export default ShoppingCart;