// src/pages/Analytics.jsx
import React, { useState, useEffect } from 'react';
import { 
  BarChart3, 
  TrendingUp, 
  PieChart, 
  Download,
  Calendar,
  DollarSign,
  ShoppingCart,
  Users,
  Package,
  RefreshCw
} from 'lucide-react';
import analyticsService from '../services/analyticsService';
import "./Analytics.css";

const Analytics = () => {
  const [dateRange, setDateRange] = useState('7d');
  const [activeTab, setActiveTab] = useState('sales');
  const [analyticsData, setAnalyticsData] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadAnalyticsData();
  }, [dateRange]);

  const loadAnalyticsData = async () => {
    try {
      setLoading(true);
      const data = await analyticsService.getComprehensiveAnalytics(dateRange);
      setAnalyticsData(data);
    } catch (error) {
      console.error('Failed to load analytics:', error);
    } finally {
      setLoading(false);
    }
  };

  // Safe data access with fallbacks
  const salesData = analyticsData?.salesData || {
    totalRevenue: 0,
    totalTransactions: 0,
    averageOrderValue: 0,
    revenueChange: 0,
    transactionChange: 0
  };

  const revenueTrend = analyticsData?.revenueTrend || [];
  const categoryPerformance = analyticsData?.categoryPerformance || [];
  const topProducts = analyticsData?.topProducts || [];
  const paymentMethods = analyticsData?.paymentMethods || [];
  const hourlyPerformance = analyticsData?.hourlyPerformance || [];

  const MetricCard = ({ icon, title, value, change, isCurrency = false }) => (
    <div className="metric-card">
      <div className="metric-icon">{icon}</div>
      <div className="metric-content">
        <h3 className="metric-value">
          {isCurrency ? `KSh ${value.toLocaleString()}` : value.toLocaleString()}
        </h3>
        <p className="metric-title">{title}</p>
        <div className={`metric-change ${change >= 0 ? 'positive' : 'negative'}`}>
          {change >= 0 ? '↑' : '↓'} {Math.abs(change)}%
        </div>
      </div>
    </div>
  );

  const RevenueChart = () => {
    const maxRevenue = Math.max(...revenueTrend.map(item => item.revenue), 1);
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>Revenue Trend</h3>
          <span>Last {dateRange}</span>
        </div>
        <div className="chart">
          {revenueTrend.map((day, index) => {
            const height = (day.revenue / maxRevenue) * 100;
            return (
              <div key={day.date} className="chart-bar">
                <div 
                  className="bar-fill"
                  style={{ height: `${height}%` }}
                />
                <span className="bar-label">{day.displayDate || day.date}</span>
                <div className="bar-tooltip">
                  KSh {day.revenue.toLocaleString()}
                </div>
              </div>
            );
          })}
        </div>
      </div>
    );
  };

  const CategoryChart = () => {
    const colors = ['#3b82f6', '#10b981', '#f59e0b', '#ef4444', '#8b5cf6', '#6366f1', '#ec4899'];
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>Revenue by Category</h3>
          <PieChart size={18} />
        </div>
        <div className="category-chart">
          {categoryPerformance.map((item, index) => (
            <div key={item.category} className="category-item">
              <div className="category-info">
                <div className="category-color" style={{
                  backgroundColor: colors[index % colors.length]
                }} />
                <span className="category-name">{item.category}</span>
                <span className="category-percentage">{item.percentage}%</span>
              </div>
              <div className="category-bar">
                <div 
                  className="category-fill"
                  style={{ 
                    width: `${item.percentage}%`,
                    backgroundColor: colors[index % colors.length]
                  }}
                />
              </div>
              <span className="category-revenue">KSh {item.revenue.toLocaleString()}</span>
            </div>
          ))}
        </div>
      </div>
    );
  };

  const TopProductsList = () => (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Top Performing Products</h3>
        <span>By revenue</span>
      </div>
      <div className="products-list">
        {topProducts.map((product, index) => (
          <div key={product.name} className="product-item">
            <div className="product-rank">#{index + 1}</div>
            <div className="product-info">
              <span className="product-name">{product.name}</span>
              <span className="product-sales">{product.sales} sales</span>
            </div>
            <div className="product-revenue">KSh {product.revenue.toLocaleString()}</div>
          </div>
        ))}
        {topProducts.length === 0 && (
          <div className="no-data">No product data available</div>
        )}
      </div>
    </div>
  );

  const PaymentMethodsChart = () => (
    <div className="chart-container">
      <div className="chart-header">
        <h3>Payment Methods</h3>
        <span>Transaction distribution</span>
      </div>
      <div className="payment-chart">
        {paymentMethods.map((method, index) => (
          <div key={method.method} className="payment-item">
            <div className="payment-info">
              <span className="payment-method">{method.method}</span>
              <span className="payment-count">{method.count} transactions</span>
            </div>
            <div className="payment-bar">
              <div 
                className="payment-fill"
                style={{ 
                  width: `${method.percentage}%`,
                  backgroundColor: method.method === 'Cash' ? '#10b981' : '#3b82f6'
                }}
              />
            </div>
            <span className="payment-percentage">{method.percentage}%</span>
          </div>
        ))}
        {paymentMethods.length === 0 && (
          <div className="no-data">No payment data available</div>
        )}
      </div>
    </div>
  );

  const HourlyPerformanceChart = () => {
    const maxSales = Math.max(...hourlyPerformance.map(hour => hour.sales), 1);
    
    return (
      <div className="chart-container">
        <div className="chart-header">
          <h3>Peak Hours</h3>
          <span>Sales by hour</span>
        </div>
        <div className="hourly-chart">
          {hourlyPerformance.map((hour) => (
            <div key={hour.hour} className="hour-item">
              <div className="hour-bar">
                <div 
                  className="hour-fill"
                  style={{ height: `${(hour.sales / maxSales) * 100}%` }}
                />
              </div>
              <span className="hour-label">{hour.hour}</span>
              <span className="hour-sales">{hour.sales}</span>
            </div>
          ))}
          {hourlyPerformance.length === 0 && (
            <div className="no-data">No hourly data available</div>
          )}
        </div>
      </div>
    );
  };

  if (loading) {
    return (
      <div className="analytics">
        <div className="analytics-header">
          <h1>Analytics</h1>
          <p>Deep insights and business intelligence</p>
        </div>
        <div className="loading-state">
          <RefreshCw className="spinner" size={32} />
          <p>Loading analytics data...</p>
        </div>
      </div>
    );
  }

  return (
    <div className="analytics">
      <div className="analytics-header">
        <div className="header-left">
          <h1>Analytics</h1>
          <p>Deep insights and business intelligence</p>
        </div>
        <div className="header-controls">
          <div className="date-filter">
            <Calendar size={16} />
            <select 
              value={dateRange}
              onChange={(e) => setDateRange(e.target.value)}
            >
              <option value="7d">Last 7 days</option>
              <option value="30d">Last 30 days</option>
              <option value="90d">Last 90 days</option>
              <option value="1y">Last year</option>
            </select>
          </div>
          <button className="export-btn" onClick={loadAnalyticsData}>
            <RefreshCw size={16} />
            Refresh
          </button>
          <button className="export-btn">
            <Download size={16} />
            Export Report
          </button>
        </div>
      </div>

      {/* Key Metrics */}
      <div className="metrics-grid">
        <MetricCard 
          icon={<DollarSign size={20} />}
          title="Total Revenue"
          value={salesData.totalRevenue}
          change={salesData.revenueChange}
          isCurrency={true}
        />
        <MetricCard 
          icon={<ShoppingCart size={20} />}
          title="Total Transactions"
          value={salesData.totalTransactions}
          change={salesData.transactionChange}
        />
        <MetricCard 
          icon={<Users size={20} />}
          title="Average Order Value"
          value={salesData.averageOrderValue}
          change={5}
          isCurrency={true}
        />
        <MetricCard 
          icon={<Package size={20} />}
          title="Products Sold"
          value={salesData.totalTransactions * 3} // Estimate based on transactions
          change={salesData.transactionChange}
        />
      </div>

      {/* Tabs */}
      <div className="analytics-tabs">
        <button 
          className={`tab ${activeTab === 'sales' ? 'active' : ''}`}
          onClick={() => setActiveTab('sales')}
        >
          <TrendingUp size={16} />
          Sales Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'products' ? 'active' : ''}`}
          onClick={() => setActiveTab('products')}
        >
          <Package size={16} />
          Product Analytics
        </button>
        <button 
          className={`tab ${activeTab === 'performance' ? 'active' : ''}`}
          onClick={() => setActiveTab('performance')}
        >
          <BarChart3 size={16} />
          Performance
        </button>
      </div>

      {/* Charts Grid */}
      <div className="analytics-content">
        {activeTab === 'sales' && (
          <>
            <div className="chart-row">
              <RevenueChart />
              <CategoryChart />
            </div>
            <div className="chart-row">
              <PaymentMethodsChart />
              <HourlyPerformanceChart />
            </div>
          </>
        )}

        {activeTab === 'products' && (
          <>
            <div className="chart-row">
              <TopProductsList />
              <CategoryChart />
            </div>
            <div className="chart-row">
              <RevenueChart />
              <PaymentMethodsChart />
            </div>
          </>
        )}

        {activeTab === 'performance' && (
          <>
            <div className="chart-row">
              <HourlyPerformanceChart />
              <TopProductsList />
            </div>
            <div className="chart-row">
              <RevenueChart />
              <PaymentMethodsChart />
            </div>
          </>
        )}
      </div>
    </div>
  );
};

export default Analytics;