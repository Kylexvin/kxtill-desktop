// src/main/database/Database.js
import Database from 'better-sqlite3';
import path from 'path';
import { app } from 'electron';
import fs from 'fs';

class POSDatabase {
  constructor() {
    const userDataPath = app.getPath('userData');
    const dbPath = path.join(userDataPath, 'kxtill.db');
    
    console.log('📁 Database path:', dbPath);
    
    // Ensure userData directory exists
    if (!fs.existsSync(userDataPath)) {
      fs.mkdirSync(userDataPath, { recursive: true });
    }
    
    this.db = new Database(dbPath);
    this.initDatabase();
  }

  // Initialize database tables - EXACT SAME STRUCTURE AS YOUR REACT NATIVE APP
  initDatabase() {
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS products (
        id TEXT PRIMARY KEY NOT NULL,
        name TEXT,
        category TEXT,
        sellingPrice REAL,
        trackStock INTEGER,
        needsCustomPrice INTEGER,
        quantity REAL,
        updated_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pending_sales (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        sale_data TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pending_product_operations (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        operation TEXT NOT NULL,
        product_data TEXT NOT NULL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    this.db.exec(`
      CREATE TABLE IF NOT EXISTS pending_stock_adjustments (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        product_id TEXT NOT NULL,
        adjustment_type TEXT NOT NULL,
        quantity_change REAL NOT NULL,
        previous_quantity REAL,
        new_quantity REAL,
        synced INTEGER DEFAULT 0,
        created_at TEXT DEFAULT CURRENT_TIMESTAMP
      );
    `);

    // Analytics cache table (for your analytics service)
    this.db.exec(`
      CREATE TABLE IF NOT EXISTS analytics_cache (
        id INTEGER PRIMARY KEY AUTOINCREMENT,
        type TEXT NOT NULL,
        period TEXT NOT NULL,
        data TEXT NOT NULL,
        timestamp DATETIME DEFAULT CURRENT_TIMESTAMP
      );
    `);

    console.log('✅ Electron Database initialized successfully (same structure as React Native)');
  }

  // SIMPLE RESET FUNCTIONS - SAME AS YOUR APP
  resetEntireDatabase() {
    try {
      console.log('🧹 NUCLEAR: Resetting entire database...');
      
      this.db.prepare('DELETE FROM pending_stock_adjustments;').run();
      this.db.prepare('DELETE FROM pending_sales;').run();
      this.db.prepare('DELETE FROM pending_product_operations;').run();
      this.db.prepare('DELETE FROM products;').run();
      this.db.prepare('DELETE FROM analytics_cache;').run();
      
      console.log('✅ Database completely reset');
      return true;
    } catch (error) {
      console.error('Error resetting database:', error);
      throw error;
    }
  }

  resetToCleanState() {
    try {
      console.log('🧹 Resetting to clean state...');
      
      this.db.prepare('DELETE FROM pending_stock_adjustments;').run();
      this.db.prepare('DELETE FROM pending_sales;').run();
      this.db.prepare('DELETE FROM pending_product_operations;').run();
      
      console.log('✅ Clean state achieved');
      return true;
    } catch (error) {
      console.error('Error resetting to clean state:', error);
      throw error;
    }
  }

  // BASIC PRODUCT OPERATIONS - ADAPTED
  saveProducts(products) {
    try {
      // Clear existing products
      this.db.prepare('DELETE FROM products;').run();
      
      const stmt = this.db.prepare(`
        INSERT INTO products (id, name, category, sellingPrice, trackStock, needsCustomPrice, quantity, updated_at)
        VALUES (?, ?, ?, ?, ?, ?, ?, ?);
      `);

      const insertMany = this.db.transaction((products) => {
        for (const product of products) {
          stmt.run(
            product.id,
            product.name,
            product.category || '',
            product.sellingPrice,
            product.trackStock ? 1 : 0,
            product.needsCustomPrice ? 1 : 0,
            product.quantity || 0,
            new Date().toISOString()
          );
        }
      });

      insertMany(products);
      console.log(`✅ Saved ${products.length} products to local database`);
      return products.length;
    } catch (error) {
      console.error('❌ Error saving products:', error);
      throw error;
    }
  }

  getProducts() {
    try {
      const stmt = this.db.prepare('SELECT * FROM products ORDER BY name ASC;');
      const rows = stmt.all();
      
      const products = rows.map(row => ({
        ...row,
        trackStock: row.trackStock === 1,
        needsCustomPrice: row.needsCustomPrice === 1
      }));
      
      return products;
    } catch (error) {
      console.error('❌ Error getting products:', error);
      return [];
    }
  }

  // PENDING SALES - ADAPTED
  savePendingSale(saleData) {
    try {
      const stmt = this.db.prepare(
        'INSERT INTO pending_sales (sale_data, synced, created_at) VALUES (?, ?, ?);'
      );

      const result = stmt.run(
        JSON.stringify(saleData),
        0,
        new Date().toISOString()
      );

      console.log(`💾 Saved pending sale: ${result.lastInsertRowid}`);
      return result.lastInsertRowid;
    } catch (error) {
      console.error('❌ Error saving pending sale:', error);
      throw error;
    }
  }

  getPendingSales() {
    try {
      const stmt = this.db.prepare('SELECT * FROM pending_sales WHERE synced = 0 ORDER BY created_at ASC;');
      const rows = stmt.all();
      
      return rows.map(row => ({
        id: row.id,
        sale_data: JSON.parse(row.sale_data),
        created_at: row.created_at
      }));
    } catch (error) {
      console.error('❌ Error getting pending sales:', error);
      return [];
    }
  }

  markSaleAsSynced(id) {
    try {
      this.db.prepare('DELETE FROM pending_sales WHERE id = ?;').run(id);
      console.log(`✅ Marked sale ${id} as synced`);
      return true;
    } catch (error) {
      console.error('❌ Error marking sale as synced:', error);
      throw error;
    }
  }

  // ANALYTICS METHODS - FOR YOUR ANALYTICS SERVICE
  cacheAnalytics(analyticsData) {
    try {
      const stmt = this.db.prepare(`
        INSERT OR REPLACE INTO analytics_cache (type, period, data)
        VALUES (?, ?, ?)
      `);

      stmt.run(
        analyticsData.type,
        analyticsData.period,
        JSON.stringify(analyticsData.data)
      );
      
      console.log(`📊 Cached analytics: ${analyticsData.type} for ${analyticsData.period}`);
      return true;
    } catch (error) {
      console.error('❌ Error caching analytics:', error);
      throw error;
    }
  }

  getCachedAnalytics(type, period) {
    try {
      const stmt = this.db.prepare(`
        SELECT data FROM analytics_cache 
        WHERE type = ? AND period = ?
        ORDER BY timestamp DESC 
        LIMIT 1
      `);

      const result = stmt.get(type, period);
      return result ? JSON.parse(result.data) : null;
    } catch (error) {
      console.error('❌ Error getting cached analytics:', error);
      return null;
    }
  }

  // CART METHODS - FOR YOUR CART SERVICE
  saveCart(cartItems) {
    try {
      // For now, we'll just log this - implement proper cart storage if needed
      console.log(`🛒 Cart saved with ${cartItems?.length} items`);
      return cartItems?.length || 0;
    } catch (error) {
      console.error('❌ Error saving cart:', error);
      throw error;
    }
  }

  getCart() {
    try {
      // For now, return empty array - cart is primarily in localStorage
      console.log('🛒 Getting cart from database');
      return [];
    } catch (error) {
      console.error('❌ Error getting cart:', error);
      return [];
    }
  }

  // DEBUGGING FUNCTIONS
  getDatabaseStats() {
    try {
      const products = this.db.prepare('SELECT COUNT(*) as count FROM products;').get();
      const pendingSales = this.db.prepare('SELECT COUNT(*) as count FROM pending_sales WHERE synced = 0;').get();
      const pendingProducts = this.db.prepare('SELECT COUNT(*) as count FROM pending_product_operations WHERE synced = 0;').get();
      const pendingAdjustments = this.db.prepare('SELECT COUNT(*) as count FROM pending_stock_adjustments WHERE synced = 0;').get();
      
      return {
        products: products?.count || 0,
        pendingSales: pendingSales?.count || 0,
        pendingProducts: pendingProducts?.count || 0,
        pendingAdjustments: pendingAdjustments?.count || 0
      };
    } catch (error) {
      console.error('❌ Error getting database stats:', error);
      return { products: 0, pendingSales: 0, pendingProducts: 0, pendingAdjustments: 0 };
    }
  }

  close() {
    this.db.close();
  }
}

export default POSDatabase;