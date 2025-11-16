// src/pages/Dashboard.jsx
import React, { useState, useEffect } from 'react';
import { 
  TrendingUp, 
  ShoppingCart, 
  AlertTriangle, 
  Package,
  RefreshCw,
  DollarSign,
  Users,
  BarChart3,
  ArrowUp,
  ArrowDown
} from 'lucide-react';
import analyticsService from '../services/analyticsService';
import "./Dashboard.css";

const Dashboard = () => {
  const [statsData, setStatsData] = useState({
    todaySales: { value: 0, change: 0 },
    transactions: { value: 0, change: 0 },
    lowStock: { value: 0, change: 0 },
    pendingSync: { value: 0, change: 0 }
  });
  const [recentTransactions, setRecentTransactions] = useState([]);
  const [lowStockProducts, setLowStockProducts] = useState([]);
  const [topProducts, setTopProducts] = useState([]);
  const [loading, setLoading] = useState(true);
  const [apiData, setApiData] = useState(null);

  useEffect(() => {
    loadDashboardData();
  }, []);

  const loadDashboardData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getDashboardData('today');
      setApiData(data);
      transformDataForUI(data);
    } catch (error) {
      console.error('Failed to load dashboard data:', error);
      // If API fails, show empty states
      setLowStockProducts([]);
    } finally {
      setLoading(false);
    }
  };

  const transformDataForUI = (data) => {
    // Transform stats data
    setStatsData({
      todaySales: { 
        value: data.revenueToday || 0, 
        change: 15
      },
      transactions: { 
        value: data.totalTransactions?.totalTransactions || 0, 
        change: 8 
      },
      lowStock: { 
        value: data.stockStats?.lowStock || 0, 
        change: -2 
      },
      pendingSync: { value: 0, change: 0 }
    });

    // Transform recent transactions from payment methods
    const transactions = data.paymentMethods?.map((method, index) => ({
      id: index + 1,
      amount: Math.round(method.total || 0),
      items: method.count || 0,
      method: method.method || 'cash',
      time: new Date().toLocaleTimeString([], { hour: '2-digit', minute: '2-digit' })
    })) || [];
    setRecentTransactions(transactions);

    // Transform top products
    const topProductsData = data.topProducts?.map((product, index) => ({
      name: product.name || 'Unknown Product',
      sales: product.totalQuantity || 0,
      revenue: product.totalRevenue || 0
    })) || [];
    setTopProducts(topProductsData);

    // USE REAL LOW STOCK DATA FROM API
    if (data.lowStockProducts && data.lowStockProducts.length > 0) {
      const lowStockData = data.lowStockProducts.map((product, index) => ({
        id: product.id || product._id || index + 1,
        name: product.name || 'Unknown Product',
        stock: product.stock || product.quantity || 0,
        threshold: product.threshold || product.lowStockThreshold || 10
      }));
      setLowStockProducts(lowStockData);
    } else {
      setLowStockProducts([]);
    }
  };

  const StatCard = ({ icon, title, value, change, isPositive = true }) => (
    <div className="stat-card">
      <div className="stat-icon">{icon}</div>
      <div className="stat-content">
        <h3 className="stat-value">{value}</h3>
        <p className="stat-title">{title}</p>
        <div className={`stat-change ${isPositive ? 'positive' : 'negative'}`}>
          {isPositive ? <ArrowUp size={14} /> : <ArrowDown size={14} />}
          <span>{change}%</span>
        </div>
      </div>
    </div>
  );

  if (loading) {
    return (
      <div className="dashboard">
        <div className="dashboard-header">
          <h1>Dashboard</h1>
          <p>Today's overview and key metrics</p>
        </div>
        <div className="dashboard-loading">
          <RefreshCw className="spinner" size={32} />
          <p>Loading dashboard data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="dashboard">
      <div className="dashboard-header">
        <h1>Dashboard</h1>
        <p>Today's overview and key metrics</p>
        <button onClick={loadDashboardData} className="refresh-btn-header">
          <RefreshCw size={16} />
          Refresh
        </button>
      </div>

      {/* Stats Grid */}
      <div className="stats-grid">
        <StatCard 
          icon={<DollarSign size={24} />}
          title="Today's Sales"
          value={`KSh ${statsData.todaySales.value.toLocaleString()}`}
          change={statsData.todaySales.change}
          isPositive={statsData.todaySales.change > 0}
        />
        <StatCard 
          icon={<ShoppingCart size={24} />}
          title="Transactions"
          value={statsData.transactions.value}
          change={statsData.transactions.change}
          isPositive={statsData.transactions.change > 0}
        />
        <StatCard 
          icon={<AlertTriangle size={24} />}
          title="Low Stock"
          value={statsData.lowStock.value}
          change={statsData.lowStock.change}
          isPositive={false}
        />
        <StatCard 
          icon={<Package size={24} />}
          title="Total Products"
          value={apiData?.stockStats?.totalProducts || 0}
          change={0}
          isPositive={true}
        />
      </div>

      <div className="dashboard-content">
        {/* Left Column */}
        <div className="dashboard-column">
          {/* Recent Transactions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Recent Transactions</h3>
              <ShoppingCart size={18} />
            </div>
            <div className="transactions-list">
              {recentTransactions.length > 0 ? (
                recentTransactions.map(transaction => (
                  <div key={transaction.id} className="transaction-item">
                    <div className="transaction-info">
                      <span className="transaction-amount">KSh {transaction.amount}</span>
                      <span className="transaction-details">
                        {transaction.items} items • {transaction.method}
                      </span>
                    </div>
                    <span className="transaction-time">{transaction.time}</span>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No transactions today</p>
                </div>
              )}
            </div>
          </div>

          {/* Low Stock Alerts - NOW WITH REAL DATA */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Low Stock Alerts</h3>
              <AlertTriangle size={18} />
            </div>
            <div className="alerts-list">
              {lowStockProducts.length > 0 ? (
                lowStockProducts.map(product => (
                  <div key={product.id} className="alert-item">
                    <div className="alert-info">
                      <span className="product-name">{product.name}</span>
                      <span className="stock-level">
                        {product.stock} / {product.threshold}
                      </span>
                    </div>
                    <div className="stock-bar">
                      <div 
                        className="stock-fill"
                        style={{ 
                          width: `${(product.stock / product.threshold) * 100}%`,
                          backgroundColor: product.stock < 3 ? '#ef4444' : '#f59e0b'
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-alerts">
                  <p>No low stock alerts</p>
                  <span className="no-alerts-subtitle">All products are sufficiently stocked</span>
                </div>
              )}
            </div>
          </div>
        </div>

        {/* Right Column */}
        <div className="dashboard-column">
          {/* Top Products */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Top Products</h3>
              <TrendingUp size={18} />
            </div>
            <div className="products-list">
              {topProducts.length > 0 ? (
                topProducts.map((product, index) => (
                  <div key={product.name} className="product-item">
                    <div className="product-rank">
                      <span>#{index + 1}</span>
                    </div>
                    <div className="product-info">
                      <span className="product-name">{product.name}</span>
                      <span className="product-sales">{product.sales} sales</span>
                    </div>
                    <div className="sales-bar">
                      <div 
                        className="sales-fill"
                        style={{ 
                          width: `${(product.sales / (topProducts[0]?.sales || 1)) * 100}%` 
                        }}
                      />
                    </div>
                  </div>
                ))
              ) : (
                <div className="no-data">
                  <p>No sales data available</p>
                </div>
              )}
            </div>
          </div>

          {/* Quick Actions */}
          <div className="dashboard-card">
            <div className="card-header">
              <h3>Quick Actions</h3>
              <BarChart3 size={18} />
            </div>
            <div className="quick-actions">
              <button className="action-btn">
                <ShoppingCart size={16} />
                New Sale
              </button>
              <button className="action-btn">
                <Package size={16} />
                Add Product
              </button>
              <button className="action-btn" onClick={loadDashboardData}>
                <RefreshCw size={16} />
                Refresh Data
              </button>
              <button className="action-btn">
                <BarChart3 size={16} />
                View Reports
              </button>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Dashboard;