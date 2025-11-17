// src/services/cartService.js
const cartService = {
  async getCart() {
    try {
      // First try localStorage for immediate access
      const localCart = localStorage.getItem('pos_cart');
      const cart = localCart ? JSON.parse(localCart) : [];
      
      // Also ensure cart is saved in SQLite for offline persistence
      if (window.electronAPI?.database?.saveCart) {
        await window.electronAPI.database.saveCart(cart);
      }
      
      return cart;
    } catch (error) {
      console.error('Error getting cart:', error);
      // Fallback to localStorage only
      const localCart = localStorage.getItem('pos_cart');
      return localCart ? JSON.parse(localCart) : [];
    }
  },

  async saveCart(cart) {
    try {
      // Save to localStorage for immediate access
      localStorage.setItem('pos_cart', JSON.stringify(cart));
      
      // Also save to SQLite for offline persistence and sync
      if (window.electronAPI?.database?.saveCart) {
        await window.electronAPI.database.saveCart(cart);
      }
    } catch (error) {
      console.error('Error saving cart:', error);
      // Fallback to localStorage only
      localStorage.setItem('pos_cart', JSON.stringify(cart));
    }
  },

  async addToCart(product, quantity = 1, customPrice = null) {
    const cart = await this.getCart();
    
    const cartItem = {
      productId: product.id,
      cartItemId: `cart-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`,
      name: product.name,
      quantity: quantity,
      price: customPrice || product.sellingPrice,
      trackStock: product.trackStock,
      needsCustomPrice: product.needsCustomPrice || false,
      customPrice: customPrice || null,
      productData: product // Store full product data for offline use
    };

    if (!cartItem.needsCustomPrice) {
      const existingItem = cart.find(item => 
        item.productId === product.id && !item.needsCustomPrice
      );

      if (existingItem) {
        const updatedCart = cart.map(item =>
          item.productId === product.id && !item.needsCustomPrice
            ? { ...item, quantity: item.quantity + quantity }
            : item
        );
        await this.saveCart(updatedCart);
        return updatedCart;
      } else {
        cart.push(cartItem);
        await this.saveCart(cart);
        return cart;
      }
    } else {
      cart.push(cartItem);
      await this.saveCart(cart);
      return cart;
    }
  },

  async updateQuantity(cartItemId, newQuantity) {
    const cart = await this.getCart();
    if (newQuantity <= 0) {
      return await this.removeFromCart(cartItemId);
    }
    
    const updatedCart = cart.map(item =>
      item.cartItemId === cartItemId
        ? { ...item, quantity: newQuantity }
        : item
    );
    
    await this.saveCart(updatedCart);
    return updatedCart;
  },

  async removeFromCart(cartItemId) {
    const cart = await this.getCart();
    const updatedCart = cart.filter(item => item.cartItemId !== cartItemId);
    await this.saveCart(updatedCart);
    return updatedCart;
  },

  async clearCart() {
    await this.saveCart([]);
    return [];
  },

  async getCartTotal() {
    const cart = await this.getCart();
    return cart.reduce((sum, item) => {
      return item.needsCustomPrice ? sum + item.price : sum + (item.price * item.quantity);
    }, 0);
  },

  getItemTotal(item) {
    return item.needsCustomPrice ? item.price : item.price * item.quantity;
  },

  async getItemCount() {
    const cart = await this.getCart();
    return cart.reduce((count, item) => count + item.quantity, 0);
  },

  // NEW: Save completed sale for offline sync
  async saveCompletedSale(saleData) {
    try {
      if (window.electronAPI?.database?.saveCompletedSale) {
        await window.electronAPI.database.saveCompletedSale(saleData);
      }
      
      // Also try to sync immediately if online
      if (navigator.onLine && window.electronAPI?.sync?.syncOfflineSales) {
        await window.electronAPI.sync.syncOfflineSales();
      }
    } catch (error) {
      console.error('Error saving completed sale:', error);
      throw error;
    }
  },

  // NEW: Get offline sales pending sync
  async getPendingSales() {
    try {
      if (window.electronAPI?.database?.getPendingSales) {
        return await window.electronAPI.database.getPendingSales();
      }
      return [];
    } catch (error) {
      console.error('Error getting pending sales:', error);
      return [];
    }
  }
};

export default cartService;