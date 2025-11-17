import React, { useState, useEffect } from 'react';
import { 
  Search, 
  ShoppingCart, 
  Plus, 
  Minus, 
  X, 
  Trash2,
  Check,
  Wifi,
  WifiOff,
  RefreshCw,
  DollarSign,
  Smartphone,
  Package
} from 'lucide-react';
import salesService from '../services/salesService';
import cartService from '../services/cartService';
import productService from '../services/productService';

const POS = () => {
  const [products, setProducts] = useState([]);
  const [cart, setCart] = useState([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);
  const [isOnline, setIsOnline] = useState(true);
  const [pendingSyncCount, setPendingSyncCount] = useState(0);
  const [showCustomPriceModal, setShowCustomPriceModal] = useState(false);
  const [showPaymentModal, setShowPaymentModal] = useState(false);
  const [currentProduct, setCurrentProduct] = useState(null);
  const [customQuantity, setCustomQuantity] = useState('');
  const [customPrice, setCustomPrice] = useState('');
  const [selectedPaymentMethod, setSelectedPaymentMethod] = useState(null);
  const [showSuccessAnimation, setShowSuccessAnimation] = useState(false);
  const [recentlyAdded, setRecentlyAdded] = useState({});

  useEffect(() => {
    const loadInitialData = async () => {
      try {
        const savedCart = await cartService.getCart();
        setCart(Array.isArray(savedCart) ? savedCart : []);
        await loadProducts();
      } catch (error) {
        console.error('Error loading initial data:', error);
        setCart([]); // Ensure cart is always an array
      }
    };

    loadInitialData();
    
    const interval = setInterval(() => {
      setIsOnline(navigator.onLine);
    }, 5000);

    return () => clearInterval(interval);
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    try {
      const productsData = await productService.getAllProducts();
      setProducts(Array.isArray(productsData) ? productsData : []);
    } catch (error) {
      console.error('Error loading products:', error);
      setProducts([]); // Ensure products is always an array
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all', ...new Set(products.map(p => p.category).filter(Boolean))];

  const filteredProducts = products.filter(product => {
    const matchesSearch = product.name.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all' || product.category === selectedCategory;
    return matchesSearch && matchesCategory;
  });

  const addToCart = async (product) => {
    if (product.needsCustomPrice) {
      setCurrentProduct(product);
      setCustomQuantity('');
      setCustomPrice('');
      setShowCustomPriceModal(true);
    } else {
      try {
        const updatedCart = await cartService.addToCart(product);
        setCart(Array.isArray(updatedCart) ? updatedCart : []);
        
        setRecentlyAdded(prev => ({ ...prev, [product.id]: true }));
        setTimeout(() => {
          setRecentlyAdded(prev => ({ ...prev, [product.id]: false }));
        }, 1000);
      } catch (error) {
        console.error('Error adding to cart:', error);
      }
    }
  };

  const handleCustomProductAdd = async () => {
    const quantity = parseFloat(customQuantity);
    const price = parseFloat(customPrice);

    if (!quantity || !price || quantity <= 0 || price <= 0) {
      alert('Please enter valid quantity and price');
      return;
    }

    try {
      const customProductData = {
        ...currentProduct,
        quantity: quantity,
        sellingPrice: price
      };
      
      const updatedCart = await cartService.addToCart(customProductData, quantity, price);
      setCart(Array.isArray(updatedCart) ? updatedCart : []);

      setShowCustomPriceModal(false);
      setCurrentProduct(null);
      setCustomQuantity('');
      setCustomPrice('');
    } catch (error) {
      console.error('Error adding custom product:', error);
      alert('Failed to add custom product. Please try again.');
    }
  };

  const updateCartQuantity = async (cartItemId, newQuantity) => {
    if (newQuantity <= 0) {
      await removeFromCart(cartItemId);
      return;
    }
    
    try {
      const updatedCart = await cartService.updateQuantity(cartItemId, newQuantity);
      setCart(Array.isArray(updatedCart) ? updatedCart : []);
    } catch (error) {
      console.error('Error updating cart quantity:', error);
    }
  };

  const removeFromCart = async (cartItemId) => {
    try {
      const updatedCart = await cartService.removeFromCart(cartItemId);
      setCart(Array.isArray(updatedCart) ? updatedCart : []);
    } catch (error) {
      console.error('Error removing from cart:', error);
    }
  };

  const clearCart = async () => {
    if (cart.length === 0) return;
    if (window.confirm('Are you sure you want to clear the cart?')) {
      try {
        const updatedCart = await cartService.clearCart();
        setCart(Array.isArray(updatedCart) ? updatedCart : []);
      } catch (error) {
        console.error('Error clearing cart:', error);
      }
    }
  };

  // Safe cart calculations
  const total = Array.isArray(cart) ? cart.reduce((sum, item) => {
    return item && item.needsCustomPrice ? sum + (item.price || 0) : sum + ((item.price || 0) * (item.quantity || 0));
  }, 0) : 0;

  const itemCount = Array.isArray(cart) ? cart.reduce((count, item) => count + (item.quantity || 0), 0) : 0;

  const processSale = async () => {
    if (cart.length === 0 || !selectedPaymentMethod) return;

    setLoading(true);
    try {
      const saleItems = cart.map(item => ({
        productId: item.productId,
        quantity: item.quantity,
        price: item.price,
        ...(item.needsCustomPrice && { customPrice: item.price })
      }));

      const saleData = {
        items: saleItems,
        paymentMethod: selectedPaymentMethod,
        total: total
      };

      const result = await salesService.processSale(saleData);
      
      setShowSuccessAnimation(true);
      setShowPaymentModal(false);
      
      setTimeout(() => {
        setShowSuccessAnimation(false);
        setCart([]);
        setSelectedPaymentMethod(null);
        alert(`Sale completed! Total: KSh ${total.toFixed(2)}\nPayment: ${selectedPaymentMethod === 'cash' ? 'Cash' : 'M-Pesa'}\nSale ID: ${result.saleId || 'Local'}`);
      }, 2000);
    } catch (error) {
      console.error('Error processing sale:', error);
      alert('Failed to process sale. Please try again.');
    } finally {
      setLoading(false);
    }
  };



  return (
    <div style={styles.container}>
      <div style={styles.mainContent}>
        <div style={styles.productsSection}>
          <div style={styles.topBar}>
            <div style={styles.searchContainer}>
              <div style={styles.searchInputWrapper}>
                <Search size={20} color="#9ca3af" />
                <input
                  type="text"
                  placeholder="Search products..."
                  value={searchQuery}
                  onChange={(e) => setSearchQuery(e.target.value)}
                  style={styles.searchInput}
                />
              </div>
              
              <button onClick={loadProducts} style={styles.refreshBtn}>
                <RefreshCw size={18} />
              </button>
            </div>

            <div style={styles.statusIndicators}>
              {!isOnline && (
                <div style={styles.offlineBadge}>
                  <WifiOff size={16} />
                  <span>Offline</span>
                </div>
              )}
              {pendingSyncCount > 0 && (
                <div style={styles.syncBadge}>
                  <RefreshCw size={16} />
                  <span>{pendingSyncCount} pending</span>
                </div>
              )}
            </div>
          </div>

          <div style={styles.categoriesContainer}>
            {categories.map(category => (
              <button
                key={category}
                onClick={() => setSelectedCategory(category)}
                style={{
                  ...styles.categoryChip,
                  ...(selectedCategory === category ? styles.categoryChipActive : {})
                }}
              >
                {category === 'all' ? 'All Products' : category}
              </button>
            ))}
          </div>

          <div style={styles.productsGrid}>
            {loading ? (
              Array(6).fill(0).map((_, i) => (
                <div key={i} style={styles.productSkeleton}>
                  <div style={styles.skeletonImage} />
                  <div style={styles.skeletonText} />
                  <div style={styles.skeletonText} />
                </div>
              ))
            ) : filteredProducts.length === 0 ? (
              <div style={styles.emptyState}>
                <Package size={48} color="#9ca3af" />
                <p>No products found</p>
              </div>
            ) : (
              filteredProducts.map(product => (
                <div
                  key={product.id}
                  onClick={() => addToCart(product)}
                  style={{
                    ...styles.productCard,
                    ...(recentlyAdded[product.id] ? styles.productCardAdded : {})
                  }}
                >
                  <div style={styles.productImage}>
                    <span style={styles.productInitials}>
                      {product.name.split(' ').map(w => w[0]).join('').slice(0, 2).toUpperCase()}
                    </span>
                    {recentlyAdded[product.id] && (
                      <div style={styles.successOverlay}>
                        <Check size={24} color="white" />
                      </div>
                    )}
                  </div>
                  
                  <div style={styles.productInfo}>
                    <h3 style={styles.productName}>{product.name}</h3>
                    <p style={styles.productPrice}>
                      {product.needsCustomPrice ? 'Custom Price' : `KSh ${product.sellingPrice}`}
                    </p>
                    
                    {product.trackStock && (
                      <span style={styles.stockTag}>{product.quantity} in stock</span>
                    )}
                    
                    {product.needsCustomPrice && (
                      <span style={styles.customBadge}>Custom</span>
                    )}
                  </div>
                </div>
              ))
            )}
          </div>
        </div>

        <div style={styles.cartSection}>
          <div style={styles.cartHeader}>
            <div style={styles.cartTitleSection}>
              <ShoppingCart size={24} color="#3b82f6" />
              <h2 style={styles.cartTitle}>
                Current Order
                {cart.length > 0 && (
                  <span style={styles.cartItemCount}>({cart.length})</span>
                )}
              </h2>
            </div>
            {cart.length > 0 && (
              <button onClick={clearCart} style={styles.clearBtn}>
                <Trash2 size={18} />
                Clear
              </button>
            )}
          </div>

          <div style={styles.cartItems}>
            {cart.length === 0 ? (
              <div style={styles.emptyCart}>
                <ShoppingCart size={48} color="#9ca3af" />
                <p>No items in cart</p>
                <span>Add products to get started</span>
              </div>
            ) : (
              cart.map(item => (
                <div key={item.cartItemId} style={styles.cartItem}>
                  <div style={styles.cartItemInfo}>
                    <h4 style={styles.cartItemName}>{item.name}</h4>
                    <p style={styles.cartItemPrice}>
                      KSh {item.price} {item.needsCustomPrice && '★'}
                    </p>
                  </div>

                  <div style={styles.cartItemControls}>
                    {!item.needsCustomPrice ? (
                      <div style={styles.quantityControls}>
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity - 1)}
                          style={styles.quantityBtn}
                        >
                          <Minus size={16} />
                        </button>
                        
                        <input
                          type="number"
                          value={item.quantity}
                          onChange={(e) => updateCartQuantity(item.cartItemId, parseFloat(e.target.value) || 0)}
                          style={styles.quantityInput}
                        />
                        
                        <button
                          onClick={() => updateCartQuantity(item.cartItemId, item.quantity + 1)}
                          style={styles.quantityBtn}
                        >
                          <Plus size={16} />
                        </button>
                      </div>
                    ) : (
                      <span style={styles.customQuantity}>Qty: {item.quantity}</span>
                    )}

                    <span style={styles.itemTotal}>
                      KSh {item.needsCustomPrice ? item.price.toFixed(2) : (item.price * item.quantity).toFixed(2)}
                    </span>

                    <button
                      onClick={() => removeFromCart(item.cartItemId)}
                      style={styles.removeBtn}
                    >
                      <X size={18} />
                    </button>
                  </div>
                </div>
              ))
            )}
          </div>

          {cart.length > 0 && (
            <div style={styles.checkoutSection}>
              <div style={styles.totalRow}>
                <span style={styles.totalLabel}>Total:</span>
                <span style={styles.totalAmount}>KSh {total.toFixed(2)}</span>
              </div>

              <div style={styles.paymentButtons}>
                <button
                  onClick={() => {
                    setSelectedPaymentMethod('cash');
                    setShowPaymentModal(true);
                  }}
                  style={{ ...styles.paymentBtn, ...styles.cashBtn }}
                >
                  <DollarSign size={20} />
                  Cash
                </button>
                
                <button
                  onClick={() => {
                    setSelectedPaymentMethod('mpesa');
                    setShowPaymentModal(true);
                  }}
                  style={{ ...styles.paymentBtn, ...styles.mpesaBtn }}
                >
                  <Smartphone size={20} />
                  M-Pesa
                </button>
              </div>
            </div>
          )}
        </div>
      </div>

      {showCustomPriceModal && (
        <div style={styles.modalOverlay} onClick={() => setShowCustomPriceModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>{currentProduct?.name}</h3>
            <p style={styles.modalSubtitle}>Enter custom quantity and price</p>

            <input
              type="number"
              placeholder="Quantity"
              value={customQuantity}
              onChange={(e) => setCustomQuantity(e.target.value)}
              style={styles.modalInput}
              autoFocus
            />

            <input
              type="number"
              placeholder="Price (KSh)"
              value={customPrice}
              onChange={(e) => setCustomPrice(e.target.value)}
              style={styles.modalInput}
            />

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowCustomPriceModal(false)}
                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
              >
                Cancel
              </button>
              <button
                onClick={handleCustomProductAdd}
                style={{ ...styles.modalBtn, ...styles.modalBtnPrimary }}
              >
                Add to Cart
              </button>
            </div>
          </div>
        </div>
      )}

      {showPaymentModal && (
        <div style={styles.modalOverlay} onClick={() => setShowPaymentModal(false)}>
          <div style={styles.modal} onClick={(e) => e.stopPropagation()}>
            <h3 style={styles.modalTitle}>Confirm Payment</h3>
            
            <div style={styles.paymentConfirm}>
              <p style={styles.paymentMethod}>
                {selectedPaymentMethod === 'cash' ? '💵 Cash Payment' : '📱 M-Pesa Payment'}
              </p>
              <p style={styles.paymentTotal}>KSh {total.toFixed(2)}</p>
              <p style={styles.paymentItems}>{cart.length} item(s)</p>
            </div>

            <div style={styles.modalActions}>
              <button
                onClick={() => setShowPaymentModal(false)}
                style={{ ...styles.modalBtn, ...styles.modalBtnSecondary }}
                disabled={loading}
              >
                Cancel
              </button>
              <button
                onClick={processSale}
                style={{ ...styles.modalBtn, ...styles.modalBtnSuccess }}
                disabled={loading}
              >
                {loading ? 'Processing...' : 'Complete Sale'}
              </button>
            </div>
          </div>
        </div>
      )}

      {showSuccessAnimation && (
        <div style={styles.successOverlayFull}>
          <div style={styles.successAnimation}>
            <div style={styles.successCheckmark}>
              <Check size={64} color="white" />
            </div>
            <h2 style={styles.successText}>Sale Completed!</h2>
            <p style={styles.successAmount}>KSh {total.toFixed(2)}</p>
          </div>
        </div>
      )}
    </div>
  );
};

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    height: '100vh',
    backgroundColor: '#f9fafb',
    fontFamily: '-apple-system, BlinkMacSystemFont, "Segoe UI", Roboto, sans-serif',
  },
  mainContent: {
    display: 'flex',
    flex: 1,
    overflow: 'hidden',
  },
  productsSection: {
    flex: 1,
    display: 'flex',
    flexDirection: 'column',
    padding: '16px',
    overflow: 'hidden',
  },
  topBar: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: '12px',
    gap: '12px',
  },
  searchContainer: {
    display: 'flex',
    gap: '8px',
    flex: 1,
  },
  searchInputWrapper: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    padding: '10px 12px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
  },
  searchInput: {
    flex: 1,
    border: 'none',
    outline: 'none',
    fontSize: '14px',
  },
  refreshBtn: {
    padding: '10px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '6px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  statusIndicators: {
    display: 'flex',
    flexDirection: 'column',
    gap: '6px',
    alignItems: 'flex-end',
  },
  offlineBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  syncBadge: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
    padding: '6px 10px',
    backgroundColor: '#dbeafe',
    color: '#3b82f6',
    borderRadius: '16px',
    fontSize: '12px',
    fontWeight: '500',
  },
  categoriesContainer: {
    display: 'flex',
    gap: '6px',
    marginBottom: '12px',
    overflowX: 'auto',
    paddingBottom: '4px',
  },
  categoryChip: {
    padding: '6px 12px',
    backgroundColor: 'white',
    border: '1px solid #e5e7eb',
    borderRadius: '16px',
    cursor: 'pointer',
    whiteSpace: 'nowrap',
    fontSize: '12px',
    transition: 'all 0.2s',
  },
  categoryChipActive: {
    backgroundColor: '#3b82f6',
    color: 'white',
    borderColor: '#3b82f6',
  },
  productsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fill, minmax(150px, 1fr))',
    gap: '10px',
    overflowY: 'auto',
    paddingBottom: '16px',
  },
  productCard: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '12px',
    cursor: 'pointer',
    transition: 'all 0.2s',
    border: '2px solid transparent',
    position: 'relative',
  },
  productCardAdded: {
    borderColor: '#10b981',
    transform: 'scale(1.02)',
  },
  productImage: {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#f3f4f6',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: '8px',
    position: 'relative',
  },
  productInitials: {
    fontSize: '18px',
    fontWeight: 'bold',
    color: '#6b7280',
  },
  successOverlay: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(16, 185, 129, 0.9)',
    borderRadius: '6px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
  },
  productInfo: {
    display: 'flex',
    flexDirection: 'column',
    gap: '4px',
  },
  productName: {
    margin: 0,
    fontSize: '12px',
    fontWeight: '600',
    color: '#1f2937',
    lineHeight: '1.3',
  },
  productPrice: {
    margin: 0,
    fontSize: '13px',
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  stockTag: {
    fontSize: '10px',
    color: '#6b7280',
  },
  customBadge: {
    fontSize: '10px',
    padding: '2px 6px',
    backgroundColor: '#fef3c7',
    color: '#d97706',
    borderRadius: '8px',
    alignSelf: 'flex-start',
  },
  cartSection: {
    width: '350px',
    backgroundColor: 'white',
    borderLeft: '1px solid #e5e7eb',
    display: 'flex',
    flexDirection: 'column',
  },
  cartHeader: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    padding: '16px',
    borderBottom: '1px solid #e5e7eb',
  },
  cartTitleSection: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  cartTitle: {
    margin: 0,
    fontSize: '16px',
    fontWeight: '600',
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  cartItemCount: {
    fontSize: '12px',
    color: '#6b7280',
    fontWeight: 'normal',
  },
  clearBtn: {
    display: 'flex',
    alignItems: 'center',
    gap: '4px',
    padding: '6px 10px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '12px',
  },
  cartItems: {
    flex: 1,
    overflowY: 'auto',
    padding: '12px',
  },
  emptyCart: {
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    height: '100%',
    gap: '8px',
    color: '#9ca3af',
    textAlign: 'center',
  },
  cartItem: {
    padding: '12px',
    backgroundColor: '#f9fafb',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  cartItemInfo: {
    marginBottom: '8px',
  },
  cartItemName: {
    margin: '0 0 4px 0',
    fontSize: '13px',
    fontWeight: '600',
  },
  cartItemPrice: {
    margin: 0,
    fontSize: '12px',
    color: '#6b7280',
  },
  cartItemControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
  },
  quantityControls: {
    display: 'flex',
    alignItems: 'center',
    gap: '6px',
  },
  quantityBtn: {
    width: '24px',
    height: '24px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: '#3b82f6',
    color: 'white',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
  },
  quantityInput: {
    width: '50px',
    padding: '4px',
    textAlign: 'center',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '12px',
  },
  customQuantity: {
    fontSize: '12px',
    color: '#6b7280',
  },
  itemTotal: {
    flex: 1,
    textAlign: 'right',
    fontWeight: '600',
    fontSize: '13px',
  },
  removeBtn: {
    padding: '4px',
    backgroundColor: '#fee2e2',
    color: '#dc2626',
    border: 'none',
    borderRadius: '4px',
    cursor: 'pointer',
    display: 'flex',
    alignItems: 'center',
  },
  checkoutSection: {
    padding: '16px',
    borderTop: '2px solid #e5e7eb',
  },
  totalRow: {
    display: 'flex',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: '12px',
  },
  totalLabel: {
    fontSize: '16px',
    fontWeight: '600',
  },
  totalAmount: {
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#3b82f6',
  },
  paymentButtons: {
    display: 'flex',
    gap: '8px',
  },
  paymentBtn: {
    flex: 1,
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    gap: '6px',
    padding: '10px',
    border: 'none',
    borderRadius: '6px',
    cursor: 'pointer',
    fontSize: '14px',
    fontWeight: '600',
    color: 'white',
  },
  cashBtn: {
    backgroundColor: '#10b981',
  },
  mpesaBtn: {
    backgroundColor: '#3b82f6',
  },
  modalOverlay: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000,
  },
  modal: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '20px',
    width: '90%',
    maxWidth: '320px',
    boxShadow: '0 10px 25px rgba(0, 0, 0, 0.1)',
  },
  modalTitle: {
    margin: '0 0 6px 0',
    fontSize: '16px',
    fontWeight: '600',
  },
  modalSubtitle: {
    margin: '0 0 16px 0',
    fontSize: '12px',
    color: '#6b7280',
  },
  modalInput: {
    width: '100%',
    padding: '8px',
    marginBottom: '8px',
    border: '1px solid #e5e7eb',
    borderRadius: '4px',
    fontSize: '13px',
    boxSizing: 'border-box',
  },
  modalActions: {
    display: 'flex',
    gap: '8px',
    marginTop: '16px',
  },
  modalBtn: {
    flex: 1,
    padding: '8px',
    border: 'none',
    borderRadius: '4px',
    fontSize: '13px',
    fontWeight: '600',
    cursor: 'pointer',
  },
  modalBtnSecondary: {
    backgroundColor: '#f3f4f6',
    color: '#1f2937',
  },
  modalBtnPrimary: {
    backgroundColor: '#3b82f6',
    color: 'white',
  },
  modalBtnSuccess: {
    backgroundColor: '#10b981',
    color: 'white',
  },
  paymentConfirm: {
    textAlign: 'center',
    padding: '16px 0',
  },
  paymentMethod: {
    fontSize: '14px',
    color: '#6b7280',
    marginBottom: '8px',
  },
  paymentTotal: {
    fontSize: '24px',
    fontWeight: 'bold',
    color: '#3b82f6',
    marginBottom: '4px',
  },
  paymentItems: {
    fontSize: '12px',
    color: '#9ca3af',
  },
  successOverlayFull: {
    position: 'fixed',
    top: 0,
    left: 0,
    right: 0,
    bottom: 0,
    backgroundColor: 'rgba(0, 0, 0, 0.7)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 2000,
  },
  successAnimation: {
    backgroundColor: 'white',
    borderRadius: '12px',
    padding: '30px',
    textAlign: 'center',
  },
  successCheckmark: {
    width: '60px',
    height: '60px',
    backgroundColor: '#10b981',
    borderRadius: '50%',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    margin: '0 auto 16px',
  },
  successText: {
    margin: '0 0 8px 0',
    fontSize: '18px',
    fontWeight: 'bold',
  },
  successAmount: {
    margin: 0,
    fontSize: '20px',
    fontWeight: 'bold',
    color: '#10b981',
  },
  emptyState: {
    gridColumn: '1 / -1',
    display: 'flex',
    flexDirection: 'column',
    alignItems: 'center',
    justifyContent: 'center',
    padding: '40px 20px',
    color: '#9ca3af',
    gap: '8px',
  },
  productSkeleton: {
    backgroundColor: 'white',
    borderRadius: '8px',
    padding: '12px',
    animation: 'pulse 1.5s ease-in-out infinite',
  },
  skeletonImage: {
    width: '100%',
    aspectRatio: '1',
    backgroundColor: '#e5e7eb',
    borderRadius: '6px',
    marginBottom: '8px',
  },
  skeletonText: {
    height: '12px',
    backgroundColor: '#e5e7eb',
    borderRadius: '4px',
    marginBottom: '6px',
  },
};

export default POS;