// src/main/database/Database.js
const path = require('path');
const { app } = require('electron');
const fs = require('fs');

// sql.js exports a function that returns a Promise
const initSqlJs = require('sql.js');

class POSDatabase {
  constructor() {
    // We need to handle this differently since sql.js is async
    // For now, create a simple mock to get things working
    console.log('🔄 Setting up database...');
    this.useSimpleDatabase();
  }

  useSimpleDatabase() {
    console.log('🔧 Using simple in-memory database for now');
    this.products = [];
    
    // Mock database methods that match the better-sqlite3 API
    this.db = {
      prepare: (sql) => ({
        run: (params) => {
          console.log('🔧 DB execute:', sql.substring(0, 50) + '...');
          if (sql.includes('DELETE FROM products')) {
            const oldCount = this.products.length;
            this.products = [];
            return { changes: oldCount };
          }
          if (sql.includes('INSERT INTO products')) {
            // Simulate insert
            return { changes: 1, lastInsertRowid: Date.now() };
          }
          return { changes: 0 };
        },
        get: (params) => {
          console.log('🔧 DB get:', sql.substring(0, 50) + '...');
          return null;
        },
        all: (params) => {
          console.log('🔧 DB query:', sql.substring(0, 50) + '...');
          if (sql.includes('SELECT * FROM products')) {
            return this.products;
          }
          if (sql.includes('COUNT(*)')) {
            return [{ count: this.products.length }];
          }
          return [];
        }
      }),
      exec: (sql) => {
        console.log('🔧 DB exec:', sql.substring(0, 50) + '...');
      }
    };

    this.initDatabase();
  }

  // Initialize database tables
  initDatabase() {
    console.log('🔄 Initializing database tables...');
    // Add some sample data
    this.products = [
      {
        id: 'sample-1',
        name: 'Sample Product 1',
        sellingPrice: 19.99,
        trackStock: true,
        quantity: 25,
        category: 'general',
        trackStock: 1,
        needsCustomPrice: 0
      },
      {
        id: 'sample-2',
        name: 'Sample Product 2',
        sellingPrice: 39.99,
        trackStock: false,
        quantity: 0,
        category: 'general',
        trackStock: 0,
        needsCustomPrice: 0
      }
    ];
    console.log('✅ Database initialized with', this.products.length, 'sample products');
  }

  // Save products to database
  saveProducts(products) {
    try {
      console.log(`💾 Saving ${products?.length} products to database`);
      
      if (!products || !Array.isArray(products)) {
        console.log('❌ No products to save');
        return 0;
      }

      // Convert products to database format
      this.products = products.map(product => ({
        id: product.id,
        name: product.name,
        category: product.category || '',
        sellingPrice: product.sellingPrice,
        trackStock: product.trackStock ? 1 : 0,
        needsCustomPrice: product.needsCustomPrice ? 1 : 0,
        quantity: product.quantity || 0,
        updated_at: new Date().toISOString()
      }));

      console.log(`✅ Saved ${this.products.length} products to database`);
      return this.products.length;
    } catch (error) {
      console.error('❌ Error saving products:', error);
      return 0;
    }
  }

  getProducts() {
    try {
      console.log('📦 Getting products from database');
      const products = this.products.map(product => ({
        ...product,
        trackStock: product.trackStock === 1,
        needsCustomPrice: product.needsCustomPrice === 1
      }));
      
      console.log(`✅ Retrieved ${products.length} products from database`);
      return products;
    } catch (error) {
      console.error('❌ Error getting products:', error);
      return [];
    }
  }

  // DEBUGGING FUNCTION FOR TEST SYNC
  debugTestSync() {
    try {
      console.log('🧪 DEBUG TEST SYNC - Testing database...');
      
      // Test with sample data
      const testProducts = [
        {
          id: 'test-1',
          name: 'Test Product 1',
          sellingPrice: 29.99,
          trackStock: true,
          quantity: 50,
          category: 'test'
        },
        {
          id: 'test-2', 
          name: 'Test Product 2',
          sellingPrice: 49.99,
          trackStock: false,
          quantity: 0,
          category: 'test'
        }
      ];
      
      console.log('💾 Testing with sample data:', testProducts.length, 'products');
      
      const result = this.saveProducts(testProducts);
      console.log('✅ Save result:', result);
      
      // Verify
      const finalProducts = this.getProducts();
      console.log('🔍 Verification - Products in DB:', finalProducts.length);
      
      return { 
        success: true, 
        saved: result,
        verified: finalProducts.length,
        products: finalProducts,
        message: `Debug test: Saved ${result} products, verified ${finalProducts.length} in DB`
      };
    } catch (error) {
      console.error('❌ Debug test failed:', error);
      return { success: false, error: error.message };
    }
  }

  // Other methods can return simple responses for now
  savePendingSale(saleData) {
    console.log('💰 Saved pending sale (mock)');
    return Date.now();
  }

  getPendingSales() {
    return [];
  }

  markSaleAsSynced(id) {
    console.log(`✅ Marked sale ${id} as synced (mock)`);
    return true;
  }

  cacheAnalytics(analyticsData) {
    console.log(`📊 Cached analytics: ${analyticsData?.type} (mock)`);
    return true;
  }

  getCachedAnalytics(type, period) {
    return null;
  }

  saveCart(cartItems) {
    console.log(`🛒 Cart saved with ${cartItems?.length} items (mock)`);
    return cartItems?.length || 0;
  }

  getCart() {
    return [];
  }

  getDatabaseStats() {
    return {
      products: this.products.length,
      pendingSales: 0,
      pendingProducts: 0,
      pendingAdjustments: 0
    };
  }

  close() {
    console.log('🔒 Database closed');
  }
}

module.exports = POSDatabase;