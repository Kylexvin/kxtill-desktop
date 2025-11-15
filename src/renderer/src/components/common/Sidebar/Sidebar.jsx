// src/components/common/Sidebar/Sidebar.jsx
import React from 'react';
import { 
  LayoutDashboard, 
  ShoppingCart, 
  ClipboardList, 
  Package, 
  Warehouse, 
  Users, 
  UserCircle, 
  BarChart3, 
  Settings,
  Circle,
  HelpCircle
} from 'lucide-react';
import './Sidebar.css';

const Sidebar = ({ activeTab, onTabChange, isOnline = true, pendingSyncs = 0 }) => {
  const navItems = [
    { id: 'dashboard', label: 'Dashboard', icon: LayoutDashboard },
    { id: 'pos', label: 'POS', icon: ShoppingCart },    
    { id: 'products', label: 'Products', icon: Package },
    { id: 'inventory', label: 'Inventory', icon: Warehouse },    
    { id: 'staff', label: 'Staff', icon: UserCircle },
    { id: 'analytics', label: 'Analytics', icon: BarChart3 },
    { id: 'settings', label: 'Settings', icon: Settings }
  ];

  const IconComponent = ({ icon: Icon, isActive }) => (
    <Icon size={20} className={isActive ? 'nav-icon-active' : 'nav-icon'} />
  );

  return (
    <div className="sidebar">
      {/* Header */}
      <div className="sidebar-header">
        <div className="logo-container">
          <img src="/logo.png" alt="KxTill POS" className="logo-image" />
          <div className="logo-text">
            <h2>KxTill POS</h2>
          </div>
        </div>
      </div>

      {/* Navigation */}
      <nav className="sidebar-nav">
        {navItems.map((item) => (
          <button
            key={item.id}
            className={`nav-item ${activeTab === item.id ? 'active' : ''}`}
            onClick={() => onTabChange(item.id)}
          >
            <IconComponent 
              icon={item.icon} 
              isActive={activeTab === item.id} 
            />
            <span className="nav-label">{item.label}</span>
          </button>
        ))}
      </nav>

      {/* Footer */}
      <div className="sidebar-footer">
        <div className="status-indicator">
          <Circle 
            size={12} 
            fill={isOnline ? "#10b981" : "#ef4444"} 
            color={isOnline ? "#10b981" : "#ef4444"} 
          />
          <span>{isOnline ? 'Online' : 'Offline'}</span>
        </div>
        
        {pendingSyncs > 0 && (
          <div className="sync-indicator">
            <span>Syncing... ({pendingSyncs} pending)</span>
          </div>
        )}

        <div className="help-section">
          <button className="help-btn">
            <HelpCircle size={16} />
            Help & Support
          </button>
        </div>
        
      </div>
    </div>
  );
};

export default Sidebar;