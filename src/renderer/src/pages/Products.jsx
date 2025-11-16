// src/pages/Products.jsx
import React, { useState, useEffect } from 'react';
import { 
  Search, 
  Plus, 
  Edit,
  Trash2,
  Download,
  Upload,
  Package,
  Tag,
  DollarSign,
  X
} from 'lucide-react';
import productService from '../services/productService';
import "./Products.css";

const Products = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [showProductForm, setShowProductForm] = useState(false);
  const [editingProduct, setEditingProduct] = useState(null);
  const [productsData, setProductsData] = useState([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadProductsData();
  }, []);

  const loadProductsData = async () => {
    try {
      setLoading(true);
      const data = await productService.getAllProducts();
      setProductsData(data);
    } catch (error) {
      console.error('Failed to load products:', error);
    } finally {
      setLoading(false);
    }
  };

  const categories = ['all'];

  const filteredProducts = productsData.filter(product => {
    const matchesSearch = product.name?.toLowerCase().includes(searchQuery.toLowerCase());
    const matchesCategory = selectedCategory === 'all';
    return matchesSearch && matchesCategory;
  });

  const [formData, setFormData] = useState({
    name: '',
    sellingPrice: '',
    buyingPrice: '',
    trackStock: true,
    quantity: '',
    description: ''
  });

  const handleAddProduct = () => {
    setEditingProduct(null);
    setFormData({
      name: '',
      sellingPrice: '',
      buyingPrice: '',
      trackStock: true,
      quantity: '',
      description: ''
    });
    setShowProductForm(true);
  };

  const handleEditProduct = (product) => {
    setEditingProduct(product);
    setFormData({
      name: product.name || '',
      sellingPrice: product.sellingPrice || '',
      buyingPrice: product.buyingPrice || '',
      trackStock: product.trackStock !== false,
      quantity: product.quantity || '',
      description: product.description || ''
    });
    setShowProductForm(true);
  };

  const handleDeleteProduct = async (product) => {
    if (window.confirm(`Delete ${product.name}? This action cannot be undone.`)) {
      try {
        await productService.deleteProduct(product.id);
        await loadProductsData();
      } catch (error) {
        console.error('Failed to delete product:', error);
        alert('Failed to delete product');
      }
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      const productData = {
        name: formData.name,
        sellingPrice: parseFloat(formData.sellingPrice),
        buyingPrice: parseFloat(formData.buyingPrice) || 0,
        trackStock: formData.trackStock,
        description: formData.description
      };

      if (formData.trackStock) {
        productData.quantity = parseInt(formData.quantity) || 0;
      }

      if (editingProduct) {
        await productService.updateProduct(editingProduct.id, productData);
      } else {
        await productService.createProduct(productData);
      }
      
      setShowProductForm(false);
      await loadProductsData();
    } catch (error) {
      console.error('Failed to save product:', error);
      alert('Failed to save product');
    }
  };

  const ProductForm = () => (
    <div className="modal-overlay" onClick={() => setShowProductForm(false)}>
      <div className="modal" onClick={(e) => e.stopPropagation()}>
        <div className="modal-header">
          <h2>{editingProduct ? 'Edit Product' : 'Add New Product'}</h2>
          <button 
            onClick={() => setShowProductForm(false)}
            className="close-btn"
          >
            <X size={20} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="product-form">
          <div className="form-row">
            <div className="form-group">
              <label>Product Name *</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({...formData, name: e.target.value})}
                placeholder="Enter product name"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Buying Price (KSh)</label>
              <input
                type="number"
                value={formData.buyingPrice}
                onChange={(e) => setFormData({...formData, buyingPrice: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
              />
            </div>
            <div className="form-group">
              <label>Selling Price (KSh) *</label>
              <input
                type="number"
                value={formData.sellingPrice}
                onChange={(e) => setFormData({...formData, sellingPrice: e.target.value})}
                placeholder="0.00"
                min="0"
                step="0.01"
                required
              />
            </div>
          </div>

          <div className="form-row">
            <div className="form-group">
              <label>Description</label>
              <textarea
                value={formData.description}
                onChange={(e) => setFormData({...formData, description: e.target.value})}
                placeholder="Enter product description"
                rows="3"
              />
            </div>
          </div>

          <div className="form-checkboxes">
            <label className="checkbox-label">
              <input
                type="checkbox"
                checked={formData.trackStock}
                onChange={(e) => setFormData({...formData, trackStock: e.target.checked})}
              />
              <span>Track stock for this product</span>
            </label>
          </div>

          {formData.trackStock && (
            <div className="form-row">
              <div className="form-group">
                <label>Initial Stock Quantity *</label>
                <input
                  type="number"
                  value={formData.quantity}
                  onChange={(e) => setFormData({...formData, quantity: e.target.value})}
                  placeholder="0"
                  min="0"
                  required={formData.trackStock}
                />
              </div>
            </div>
          )}

          <div className="form-actions">
            <button 
              type="button" 
              onClick={() => setShowProductForm(false)}
              className="btn btn-secondary"
            >
              Cancel
            </button>
            <button type="submit" className="btn btn-primary">
              {editingProduct ? 'Update Product' : 'Add Product'}
            </button>
          </div>
        </form>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="products">
        <div className="products-header">
          <h1>Product Catalog</h1>
          <p>Manage your products and pricing</p>
        </div>
        <div className="loading-state">
          <p>Loading products...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="products">
      <div className="products-header">
        <div className="header-left">
          <h1>Product Catalog</h1>
          <p>Manage your products and pricing</p>
        </div>
        <div className="header-actions">
          <button className="btn btn-outline">
            <Upload size={16} />
            Import
          </button>
          <button className="btn btn-outline">
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-primary" onClick={handleAddProduct}>
            <Plus size={16} />
            Add Product
          </button>
        </div>
      </div>

      {/* Controls */}
      <div className="products-controls">
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
        </div>
      </div>

      {/* Products Grid */}
      <div className="products-grid">
        {filteredProducts.map(product => {
          const safeProduct = {
            id: product.id || product._id,
            name: product.name || 'Unknown Product',
            trackStock: product.trackStock !== false,
            sellingPrice: product.sellingPrice || 0,
            buyingPrice: product.buyingPrice || 0,
            quantity: product.quantity || 0,
            description: product.description || '',
            needsCustomPrice: product.needsCustomPrice || false
          };

          return (
            <div key={safeProduct.id} className="product-card">
              <div className="product-header">
                <div className="product-icon">
                  <Package size={20} />
                </div>
                <div className="product-actions">
                  <button 
                    onClick={() => handleEditProduct(safeProduct)}
                    className="btn-icon edit"
                    title="Edit"
                  >
                    <Edit size={14} />
                  </button>
                  <button 
                    onClick={() => handleDeleteProduct(safeProduct)}
                    className="btn-icon delete"
                    title="Delete"
                  >
                    <Trash2 size={14} />
                  </button>
                </div>
              </div>

              <div className="product-content">
                <h3 className="product-name">{safeProduct.name}</h3>
                
                <div className="product-prices">
                  <div className="price-row">
                    <span>Cost:</span>
                    <span className="cost-price">KSh {safeProduct.buyingPrice}</span>
                  </div>
                  <div className="price-row">
                    <span>Selling:</span>
                    <span className="selling-price">
                      {safeProduct.needsCustomPrice ? 'Custom' : `KSh ${safeProduct.sellingPrice}`}
                    </span>
                  </div>
                </div>

                {safeProduct.description && (
                  <p className="product-description">{safeProduct.description}</p>
                )}

                {safeProduct.trackStock && (
                  <div className="product-stock">
                    <div className="stock-info">
                      <span>Stock: {safeProduct.quantity}</span>
                      {safeProduct.quantity <= 10 && (
                        <span className="low-stock-alert">Low Stock</span>
                      )}
                    </div>
                  </div>
                )}

                {safeProduct.needsCustomPrice && (
                  <div className="custom-price-badge">
                    Custom Pricing
                  </div>
                )}
              </div>
            </div>
          );
        })}

        {filteredProducts.length === 0 && (
          <div className="empty-state">
            <Package size={48} />
            <p>No products found</p>
            <span>Try adjusting your search or add a new product</span>
            <button className="btn btn-primary" onClick={handleAddProduct}>
              <Plus size={16} />
              Add Your First Product
            </button>
          </div>
        )}
      </div>

      {/* Product Form Modal */}
      {showProductForm && <ProductForm />}
    </div>
  );
};

export default Products;