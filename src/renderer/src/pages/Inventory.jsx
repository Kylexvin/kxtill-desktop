// src/pages/Inventory.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Filter,
  Package,
  AlertTriangle,
  Edit,
  Trash2,
  Download,
  RefreshCw,
  BarChart3,
  X,
  Save
} from 'lucide-react';
import inventoryService from '../services/inventoryService';
import "./Inventory.css";

const Inventory = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [lowStockOnly, setLowStockOnly] = useState(false);
  const [inventoryData, setInventoryData] = useState([]);
  const [loading, setLoading] = useState(true);
  const [editingProduct, setEditingProduct] = useState(null);
  const [adjustingStock, setAdjustingStock] = useState(null);
  const [stockAdjustment, setStockAdjustment] = useState('');

  useEffect(() => {
    loadInventoryData();
  }, []);

  const loadInventoryData = async () => {
    try {
      setLoading(true);
      const data = await inventoryService.getInventory();
      setInventoryData(data);
    } catch (error) {
      console.error('Failed to load inventory:', error);
    } finally {
      setLoading(false);
    }
  };

  const filteredInventory = inventoryData.filter(item => {
    const matchesSearch = item.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesStockFilter = !lowStockOnly || (item.trackStock && item.quantity <= 10);
    
    return matchesSearch && matchesStockFilter;
  });

  const lowStockCount = inventoryData.filter(item => item.trackStock && item.quantity <= 10).length;
  const totalItems = inventoryData.length;
  const totalValue = inventoryData.reduce((sum, item) => {
    if (item.trackStock) {
      return sum + ((item.quantity || 0) * (item.buyingPrice || 0));
    }
    return sum;
  }, 0);

  const getStockStatus = (item) => {
    if (!item.trackStock) return 'not-tracked';
    if (item.quantity === 0) return 'out-of-stock';
    if (item.quantity <= 10) return 'low-stock';
    if (item.quantity <= 20) return 'medium-stock';
    return 'in-stock';
  };

  const getStatusColor = (status) => {
    switch (status) {
      case 'low-stock': return '#ef4444';
      case 'medium-stock': return '#f59e0b';
      case 'in-stock': return '#10b981';
      case 'out-of-stock': return '#dc2626';
      default: return '#6b7280';
    }
  };

  const StockIndicator = ({ item }) => {
    const status = getStockStatus(item);
    const color = getStatusColor(status);
    
    if (!item.trackStock) {
      return (
        <div className="stock-indicator">
          <span className="stock-text" style={{ color }}>
            Not Tracked
          </span>
        </div>
      );
    }

    const maxStock = Math.max(item.quantity, 30);
    
    return (
      <div className="stock-indicator">
        <div className="stock-bar">
          <div 
            className="stock-fill"
            style={{ 
              width: `${Math.min((item.quantity / maxStock) * 100, 100)}%`,
              backgroundColor: color
            }}
          />
        </div>
        <span className="stock-text" style={{ color }}>
          {item.quantity} units
        </span>
      </div>
    );
  };

  const handleEdit = (item) => {
    setEditingProduct(item);
  };

  const handleSaveEdit = async () => {
    if (!editingProduct) return;

    try {
      await inventoryService.updateProduct(editingProduct.id, {
        name: editingProduct.name,
        sellingPrice: editingProduct.sellingPrice,
        buyingPrice: editingProduct.buyingPrice,
        trackStock: editingProduct.trackStock
      });
      setEditingProduct(null);
      await loadInventoryData();
    } catch (error) {
      console.error('Failed to update product:', error);
      alert('Failed to update product');
    }
  };

  const handleAdjustStock = (item) => {
    setAdjustingStock(item);
    setStockAdjustment(item.quantity.toString());
  };

  const handleSaveStockAdjustment = async () => {
    if (!adjustingStock || !stockAdjustment) return;

    try {
      const newQuantity = parseInt(stockAdjustment);
      if (isNaN(newQuantity) || newQuantity < 0) {
        alert('Please enter a valid stock quantity');
        return;
      }

      await inventoryService.updateProduct(adjustingStock.id, {
        quantity: newQuantity
      });
      setAdjustingStock(null);
      setStockAdjustment('');
      await loadInventoryData();
    } catch (error) {
      console.error('Failed to adjust stock:', error);
      alert('Failed to adjust stock');
    }
  };

  const handleDelete = async (item) => {
    if (window.confirm(`Delete ${item.name}? This action cannot be undone.`)) {
      try {
        await inventoryService.deleteProduct(item.id || item._id);
        await loadInventoryData();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleRefresh = () => {
    loadInventoryData();
  };

  // Edit Modal
  const EditModal = () => (
    <div className="modal-overlay" onClick={() => setEditingProduct(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Edit Product</h2>
          <button 
            onClick={() => setEditingProduct(null)}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="form-group">
            <label>Product Name</label>
            <input
              type="text"
              value={editingProduct?.name || ''}
              onChange={(e) => setEditingProduct({...editingProduct, name: e.target.value})}
            />
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Cost Price (KSh)</label>
              <input
                type="number"
                value={editingProduct?.buyingPrice || 0}
                onChange={(e) => setEditingProduct({...editingProduct, buyingPrice: parseFloat(e.target.value)})}
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Selling Price (KSh)</label>
              <input
                type="number"
                value={editingProduct?.sellingPrice || 0}
                onChange={(e) => setEditingProduct({...editingProduct, sellingPrice: parseFloat(e.target.value)})}
                min="0"
                step="0.01"
              />
            </div>
          </div>

          <div className="form-actions">
            <button 
              onClick={() => setEditingProduct(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleSaveEdit} className="btn btn-primary">
              <Save size={16} />
              Save Changes
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  // Stock Adjustment Modal
  const StockAdjustmentModal = () => (
    <div className="modal-overlay" onClick={() => setAdjustingStock(null)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>Adjust Stock - {adjustingStock?.name}</h2>
          <button 
            onClick={() => setAdjustingStock(null)}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <div className="modal-content">
          <div className="current-stock">
            <p>Current Stock: <strong>{adjustingStock?.quantity} units</strong></p>
          </div>

          <div className="form-group">
            <label>New Stock Quantity</label>
            <input
              type="number"
              value={stockAdjustment}
              onChange={(e) => setStockAdjustment(e.target.value)}
              placeholder="Enter new stock quantity"
              min="0"
            />
          </div>

          <div className="stock-actions">
            <button 
              onClick={() => setStockAdjustment((adjustingStock?.quantity + 10).toString())}
              className="btn btn-outline"
            >
              +10
            </button>
            <button 
              onClick={() => setStockAdjustment((adjustingStock?.quantity + 5).toString())}
              className="btn btn-outline"
            >
              +5
            </button>
            <button 
              onClick={() => setStockAdjustment((adjustingStock?.quantity + 1).toString())}
              className="btn btn-outline"
            >
              +1
            </button>
          </div>

          <div className="form-actions">
            <button 
              onClick={() => setAdjustingStock(null)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button onClick={handleSaveStockAdjustment} className="btn btn-primary">
              <Save size={16} />
              Update Stock
            </button>
          </div>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="inventory">
        <div className="inventory-header">
          <h1>Inventory Management</h1>
          <p>Manage stock levels and track inventory</p>
        </div>
        <div className="loading-state">
          <p>Loading inventory data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="inventory">
      <div className="inventory-header">
        <div className="header-left">
          <h1>Inventory Management</h1>
          <p>Manage stock levels and track inventory</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-secondary">
            <Download size={16} />
            Export
          </button>
        </div>
      </div>

      {/* Stats Overview */}
      <div className="inventory-stats">
        <div className="stat-card">
          <div className="stat-icon total">
            <Package size={20} />
          </div>
          <div className="stat-content">
            <h3>{totalItems}</h3>
            <p>Total Products</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon low-stock">
            <AlertTriangle size={20} />
          </div>
          <div className="stat-content">
            <h3>{lowStockCount}</h3>
            <p>Low Stock</p>
          </div>
        </div>
        <div className="stat-card">
          <div className="stat-icon value">
            <BarChart3 size={20} />
          </div>
          <div className="stat-content">
            <h3>KSh {Math.round(totalValue).toLocaleString()}</h3>
            <p>Inventory Value</p>
          </div>
        </div>
      </div>

      {/* Controls */}
      <div className="inventory-controls">
        <div className="search-filter">
          <div className="search-box">
            <Search size={18} />
            <input
              type="text"
              placeholder="Search products..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>
          
          <div className="filter-controls">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={lowStockOnly}
                onChange={(e) => setLowStockOnly(e.target.checked)}
              />
              <AlertTriangle size={16} />
              Low Stock Only
            </label>

            <button className="btn btn-outline" onClick={handleRefresh}>
              <RefreshCw size={16} />
              Refresh
            </button>
          </div>
        </div>
      </div>

      {/* Inventory Table */}
      <div className="inventory-table-container">
        <table className="inventory-table">
          <thead>
            <tr>
              <th>Product</th>
              <th>Stock Level</th>
              <th>Cost Price</th>
              <th>Selling Price</th>
              <th>Stock Type</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {filteredInventory.map(item => {
              const safeItem = {
                id: item.id || item._id,
                name: item.name || 'Unknown Product',
                trackStock: item.trackStock !== false,
                quantity: item.quantity || 0,
                buyingPrice: item.buyingPrice || 0,
                sellingPrice: item.sellingPrice || 0,
                needsCustomPrice: item.needsCustomPrice || false
              };

              const status = getStockStatus(safeItem);
              
              return (
                <tr key={safeItem.id} className={status}>
                  <td>
                    <div className="product-info">
                      <div className="product-name">{safeItem.name}</div>
                      {status === 'low-stock' && (
                        <div className="low-stock-badge">
                          <AlertTriangle size={12} />
                          Low Stock
                        </div>
                      )}
                      {status === 'out-of-stock' && (
                        <div className="out-of-stock-badge">
                          <AlertTriangle size={12} />
                          Out of Stock
                        </div>
                      )}
                    </div>
                  </td>
                  <td>
                    <StockIndicator item={safeItem} />
                  </td>
                  <td>
                    <span className="price">KSh {safeItem.buyingPrice}</span>
                  </td>
                  <td>
                    <span className="price selling">
                      {safeItem.needsCustomPrice ? 'Custom' : `KSh ${safeItem.sellingPrice}`}
                    </span>
                  </td>
                  <td>
                    <span className="stock-type">
                      {safeItem.trackStock ? 'Tracked' : 'Not Tracked'}
                    </span>
                  </td>
                  <td>
                    <div className="action-buttons">
                      <button 
                        onClick={() => handleEdit(safeItem)}
                        className="btn-icon edit"
                        title="Edit Product"
                      >
                        <Edit size={16} />
                      </button>
                      {safeItem.trackStock && (
                        <button 
                          onClick={() => handleAdjustStock(safeItem)}
                          className="btn-icon adjust"
                          title="Adjust Stock"
                        >
                          <RefreshCw size={16} />
                        </button>
                      )}
                      <button 
                        onClick={() => handleDelete(safeItem)}
                        className="btn-icon delete"
                        title="Delete Product"
                      >
                        <Trash2 size={16} />
                      </button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>

        {filteredInventory.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>No products found</p>
            <span>Try adjusting your search or filters</span>
          </div>
        )}
      </div>

      {/* Modals */}
      {editingProduct && <EditModal />}
      {adjustingStock && <StockAdjustmentModal />}
    </div>
  );
};

export default Inventory;