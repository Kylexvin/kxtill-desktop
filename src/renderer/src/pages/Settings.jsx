// src/pages/Settings.jsx
import React, { useState } from 'react';
import { 
  Save,
  RefreshCw,
  Download,
  Upload,
  Store,
  Receipt,
  CreditCard,
  Bell,
  Shield,
  Database,
  Wifi,
  Globe,
  Palette,
  Moon,
  Sun
} from 'lucide-react';
import './Settings.css';
const Settings = () => {
  const [activeTab, setActiveTab] = useState('general');
  const [hasUnsavedChanges, setHasUnsavedChanges] = useState(false);

  // Mock settings data - replace with actual API calls
  const [settings, setSettings] = useState({
    // General Settings
    store: {
      name: 'KxTill POS',
      address: '123 Business Street, Nairobi',
      phone: '+254712345678',
      email: 'info@kxtill.com',
      currency: 'KES',
      timezone: 'Africa/Nairobi'
    },
    
    // Receipt Settings
    receipt: {
      header: 'KxTill POS - Thank You for Your Business!',
      footer: 'Returns accepted within 7 days with receipt',
      showStoreInfo: true,
      showTaxDetails: true,
      printAutomatically: false,
      paperSize: '80mm'
    },
    
    // Payment Settings
    payment: {
      cashEnabled: true,
      mpesaEnabled: true,
      cardEnabled: false,
      defaultPaymentMethod: 'cash',
      mpesaPaybill: '123456',
      mpesaAccount: 'KxTill'
    },
    
    // Notifications
    notifications: {
      lowStockAlerts: true,
      dailySalesReport: true,
      syncNotifications: true,
      soundEnabled: true
    },
    
    // Security
    security: {
      requirePin: true,
      autoLogout: 30,
      passwordExpiry: 90,
      loginAttempts: 5
    },
    
    // Data & Sync
    data: {
      autoSync: true,
      syncInterval: 5,
      backupEnabled: true,
      backupFrequency: 'daily',
      cloudSync: false
    },
    
    // Appearance
    appearance: {
      theme: 'light',
      language: 'en',
      compactMode: false,
      fontSize: 'medium'
    }
  });

  const handleSettingChange = (category, key, value) => {
    setSettings(prev => ({
      ...prev,
      [category]: {
        ...prev[category],
        [key]: value
      }
    }));
    setHasUnsavedChanges(true);
  };

  const handleSave = () => {
    console.log('Saving settings:', settings);
    // Implement save functionality
    setHasUnsavedChanges(false);
    // Show success message
    alert('Settings saved successfully!');
  };

  const handleReset = () => {
    if (window.confirm('Reset all settings to default? This cannot be undone.')) {
      console.log('Resetting settings to default');
      // Implement reset functionality
      setHasUnsavedChanges(false);
    }
  };

  const handleExport = () => {
    console.log('Exporting settings');
    // Implement export functionality
  };

  const handleImport = () => {
    console.log('Importing settings');
    // Implement import functionality
  };

  const SettingSection = ({ title, icon, children }) => (
    <div className="setting-section">
      <div className="section-header">
        {icon}
        <h3>{title}</h3>
      </div>
      <div className="section-content">
        {children}
      </div>
    </div>
  );

  const SettingRow = ({ label, description, children }) => (
    <div className="setting-row">
      <div className="setting-info">
        <label className="setting-label">{label}</label>
        {description && <p className="setting-description">{description}</p>}
      </div>
      <div className="setting-control">
        {children}
      </div>
    </div>
  );

  const TabButton = ({ id, icon, label, isActive }) => (
    <button
      className={`tab-button ${isActive ? 'active' : ''}`}
      onClick={() => setActiveTab(id)}
    >
      {icon}
      <span>{label}</span>
    </button>
  );

  return (
    <div className="settings">
      <div className="settings-header">
        <div className="header-left">
          <h1>Settings</h1>
          <p>Configure your POS system preferences</p>
        </div>
        <div className="header-actions">
          {hasUnsavedChanges && (
            <span className="unsaved-changes">Unsaved changes</span>
          )}
          <button className="btn btn-outline" onClick={handleReset}>
            <RefreshCw size={16} />
            Reset
          </button>
          <button className="btn btn-outline" onClick={handleExport}>
            <Download size={16} />
            Export
          </button>
          <button className="btn btn-outline" onClick={handleImport}>
            <Upload size={16} />
            Import
          </button>
          <button 
            className="btn btn-primary" 
            onClick={handleSave}
            disabled={!hasUnsavedChanges}
          >
            <Save size={16} />
            Save Changes
          </button>
        </div>
      </div>

      <div className="settings-layout">
        {/* Sidebar Tabs */}
        <div className="settings-sidebar">
          <TabButton
            id="general"
            icon={<Store size={18} />}
            label="General"
            isActive={activeTab === 'general'}
          />
          <TabButton
            id="receipt"
            icon={<Receipt size={18} />}
            label="Receipt"
            isActive={activeTab === 'receipt'}
          />
          <TabButton
            id="payment"
            icon={<CreditCard size={18} />}
            label="Payment"
            isActive={activeTab === 'payment'}
          />
          <TabButton
            id="notifications"
            icon={<Bell size={18} />}
            label="Notifications"
            isActive={activeTab === 'notifications'}
          />
          <TabButton
            id="security"
            icon={<Shield size={18} />}
            label="Security"
            isActive={activeTab === 'security'}
          />
          <TabButton
            id="data"
            icon={<Database size={18} />}
            label="Data & Sync"
            isActive={activeTab === 'data'}
          />
          <TabButton
            id="appearance"
            icon={<Palette size={18} />}
            label="Appearance"
            isActive={activeTab === 'appearance'}
          />
        </div>

        {/* Settings Content */}
        <div className="settings-content">
          {activeTab === 'general' && (
            <div className="tab-content">
              <SettingSection title="Store Information" icon={<Store size={20} />}>
                <SettingRow 
                  label="Store Name" 
                  description="Display name for your business"
                >
                  <input
                    type="text"
                    value={settings.store.name}
                    onChange={(e) => handleSettingChange('store', 'name', e.target.value)}
                    className="setting-input"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Store Address" 
                  description="Physical business address"
                >
                  <textarea
                    value={settings.store.address}
                    onChange={(e) => handleSettingChange('store', 'address', e.target.value)}
                    className="setting-textarea"
                    rows="3"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Phone Number" 
                  description="Contact number for customers"
                >
                  <input
                    type="tel"
                    value={settings.store.phone}
                    onChange={(e) => handleSettingChange('store', 'phone', e.target.value)}
                    className="setting-input"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Email" 
                  description="Business email address"
                >
                  <input
                    type="email"
                    value={settings.store.email}
                    onChange={(e) => handleSettingChange('store', 'email', e.target.value)}
                    className="setting-input"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Currency" 
                  description="Default currency for transactions"
                >
                  <select
                    value={settings.store.currency}
                    onChange={(e) => handleSettingChange('store', 'currency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="KES">Kenyan Shilling (KES)</option>
                    <option value="USD">US Dollar (USD)</option>
                    <option value="EUR">Euro (EUR)</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Timezone" 
                  description="Your local timezone"
                >
                  <select
                    value={settings.store.timezone}
                    onChange={(e) => handleSettingChange('store', 'timezone', e.target.value)}
                    className="setting-select"
                  >
                    <option value="Africa/Nairobi">East Africa Time (Nairobi)</option>
                    <option value="UTC">UTC</option>
                  </select>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'receipt' && (
            <div className="tab-content">
              <SettingSection title="Receipt Configuration" icon={<Receipt size={20} />}>
                <SettingRow 
                  label="Receipt Header" 
                  description="Text to display at top of receipt"
                >
                  <textarea
                    value={settings.receipt.header}
                    onChange={(e) => handleSettingChange('receipt', 'header', e.target.value)}
                    className="setting-textarea"
                    rows="2"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Receipt Footer" 
                  description="Text to display at bottom of receipt"
                >
                  <textarea
                    value={settings.receipt.footer}
                    onChange={(e) => handleSettingChange('receipt', 'footer', e.target.value)}
                    className="setting-textarea"
                    rows="2"
                  />
                </SettingRow>
                
                <SettingRow 
                  label="Paper Size" 
                  description="Receipt printer paper size"
                >
                  <select
                    value={settings.receipt.paperSize}
                    onChange={(e) => handleSettingChange('receipt', 'paperSize', e.target.value)}
                    className="setting-select"
                  >
                    <option value="80mm">80mm Thermal</option>
                    <option value="58mm">58mm Thermal</option>
                    <option value="A4">A4 Paper</option>
                  </select>
                </SettingRow>
                
                <div className="setting-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.receipt.showStoreInfo}
                      onChange={(e) => handleSettingChange('receipt', 'showStoreInfo', e.target.checked)}
                    />
                    <span>Show store information on receipt</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.receipt.showTaxDetails}
                      onChange={(e) => handleSettingChange('receipt', 'showTaxDetails', e.target.checked)}
                    />
                    <span>Show tax breakdown</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.receipt.printAutomatically}
                      onChange={(e) => handleSettingChange('receipt', 'printAutomatically', e.target.checked)}
                    />
                    <span>Print receipt automatically after sale</span>
                  </label>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === 'payment' && (
            <div className="tab-content">
              <SettingSection title="Payment Methods" icon={<CreditCard size={20} />}>
                <div className="setting-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.payment.cashEnabled}
                      onChange={(e) => handleSettingChange('payment', 'cashEnabled', e.target.checked)}
                    />
                    <span>Enable Cash Payments</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.payment.mpesaEnabled}
                      onChange={(e) => handleSettingChange('payment', 'mpesaEnabled', e.target.checked)}
                    />
                    <span>Enable M-Pesa Payments</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.payment.cardEnabled}
                      onChange={(e) => handleSettingChange('payment', 'cardEnabled', e.target.checked)}
                    />
                    <span>Enable Card Payments</span>
                  </label>
                </div>
                
                <SettingRow 
                  label="Default Payment Method" 
                  description="Preselected payment method"
                >
                  <select
                    value={settings.payment.defaultPaymentMethod}
                    onChange={(e) => handleSettingChange('payment', 'defaultPaymentMethod', e.target.value)}
                    className="setting-select"
                  >
                    <option value="cash">Cash</option>
                    <option value="mpesa">M-Pesa</option>
                    <option value="card">Card</option>
                  </select>
                </SettingRow>
                
                {settings.payment.mpesaEnabled && (
                  <>
                    <SettingRow 
                      label="M-Pesa Paybill Number" 
                      description="Your business paybill number"
                    >
                      <input
                        type="text"
                        value={settings.payment.mpesaPaybill}
                        onChange={(e) => handleSettingChange('payment', 'mpesaPaybill', e.target.value)}
                        className="setting-input"
                        placeholder="123456"
                      />
                    </SettingRow>
                    
                    <SettingRow 
                      label="M-Pesa Account Number" 
                      description="Account name for payments"
                    >
                      <input
                        type="text"
                        value={settings.payment.mpesaAccount}
                        onChange={(e) => handleSettingChange('payment', 'mpesaAccount', e.target.value)}
                        className="setting-input"
                        placeholder="Your Business Name"
                      />
                    </SettingRow>
                  </>
                )}
              </SettingSection>
            </div>
          )}

          {activeTab === 'notifications' && (
            <div className="tab-content">
              <SettingSection title="Notification Preferences" icon={<Bell size={20} />}>
                <div className="setting-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.lowStockAlerts}
                      onChange={(e) => handleSettingChange('notifications', 'lowStockAlerts', e.target.checked)}
                    />
                    <span>Low stock alerts</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.dailySalesReport}
                      onChange={(e) => handleSettingChange('notifications', 'dailySalesReport', e.target.checked)}
                    />
                    <span>Daily sales summary</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.syncNotifications}
                      onChange={(e) => handleSettingChange('notifications', 'syncNotifications', e.target.checked)}
                    />
                    <span>Sync status notifications</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.notifications.soundEnabled}
                      onChange={(e) => handleSettingChange('notifications', 'soundEnabled', e.target.checked)}
                    />
                    <span>Enable sound notifications</span>
                  </label>
                </div>
              </SettingSection>
            </div>
          )}

          {activeTab === 'security' && (
            <div className="tab-content">
              <SettingSection title="Security Settings" icon={<Shield size={20} />}>
                <div className="setting-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.security.requirePin}
                      onChange={(e) => handleSettingChange('security', 'requirePin', e.target.checked)}
                    />
                    <span>Require PIN for staff login</span>
                  </label>
                </div>
                
                <SettingRow 
                  label="Auto Logout" 
                  description="Minutes of inactivity before automatic logout"
                >
                  <select
                    value={settings.security.autoLogout}
                    onChange={(e) => handleSettingChange('security', 'autoLogout', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                    <option value={0}>Never</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Password Expiry" 
                  description="Days before password expires"
                >
                  <select
                    value={settings.security.passwordExpiry}
                    onChange={(e) => handleSettingChange('security', 'passwordExpiry', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={30}>30 days</option>
                    <option value={60}>60 days</option>
                    <option value={90}>90 days</option>
                    <option value={0}>Never</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Max Login Attempts" 
                  description="Failed attempts before lockout"
                >
                  <select
                    value={settings.security.loginAttempts}
                    onChange={(e) => handleSettingChange('security', 'loginAttempts', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={3}>3 attempts</option>
                    <option value={5}>5 attempts</option>
                    <option value={10}>10 attempts</option>
                  </select>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'data' && (
            <div className="tab-content">
              <SettingSection title="Data & Synchronization" icon={<Database size={20} />}>
                <div className="setting-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.data.autoSync}
                      onChange={(e) => handleSettingChange('data', 'autoSync', e.target.checked)}
                    />
                    <span>Auto-sync with cloud</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.data.backupEnabled}
                      onChange={(e) => handleSettingChange('data', 'backupEnabled', e.target.checked)}
                    />
                    <span>Automatic backups</span>
                  </label>
                  
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.data.cloudSync}
                      onChange={(e) => handleSettingChange('data', 'cloudSync', e.target.checked)}
                    />
                    <span>Enable cloud synchronization</span>
                  </label>
                </div>
                
                <SettingRow 
                  label="Sync Interval" 
                  description="Minutes between sync attempts"
                >
                  <select
                    value={settings.data.syncInterval}
                    onChange={(e) => handleSettingChange('data', 'syncInterval', parseInt(e.target.value))}
                    className="setting-select"
                  >
                    <option value={5}>5 minutes</option>
                    <option value={15}>15 minutes</option>
                    <option value={30}>30 minutes</option>
                    <option value={60}>1 hour</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Backup Frequency" 
                  description="How often to create backups"
                >
                  <select
                    value={settings.data.backupFrequency}
                    onChange={(e) => handleSettingChange('data', 'backupFrequency', e.target.value)}
                    className="setting-select"
                  >
                    <option value="daily">Daily</option>
                    <option value="weekly">Weekly</option>
                    <option value="monthly">Monthly</option>
                  </select>
                </SettingRow>
              </SettingSection>
            </div>
          )}

          {activeTab === 'appearance' && (
            <div className="tab-content">
              <SettingSection title="Appearance & Language" icon={<Palette size={20} />}>
                <SettingRow 
                  label="Theme" 
                  description="Choose your preferred theme"
                >
                  <div className="theme-selector">
                    <button
                      className={`theme-option ${settings.appearance.theme === 'light' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'theme', 'light')}
                    >
                      <Sun size={16} />
                      <span>Light</span>
                    </button>
                    <button
                      className={`theme-option ${settings.appearance.theme === 'dark' ? 'active' : ''}`}
                      onClick={() => handleSettingChange('appearance', 'theme', 'dark')}
                    >
                      <Moon size={16} />
                      <span>Dark</span>
                    </button>
                  </div>
                </SettingRow>
                
                <SettingRow 
                  label="Language" 
                  description="Interface language"
                >
                  <select
                    value={settings.appearance.language}
                    onChange={(e) => handleSettingChange('appearance', 'language', e.target.value)}
                    className="setting-select"
                  >
                    <option value="en">English</option>
                    <option value="sw">Swahili</option>
                  </select>
                </SettingRow>
                
                <SettingRow 
                  label="Font Size" 
                  description="Text size throughout the app"
                >
                  <select
                    value={settings.appearance.fontSize}
                    onChange={(e) => handleSettingChange('appearance', 'fontSize', e.target.value)}
                    className="setting-select"
                  >
                    <option value="small">Small</option>
                    <option value="medium">Medium</option>
                    <option value="large">Large</option>
                  </select>
                </SettingRow>
                
                <div className="setting-checkboxes">
                  <label className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={settings.appearance.compactMode}
                      onChange={(e) => handleSettingChange('appearance', 'compactMode', e.target.checked)}
                    />
                    <span>Compact mode (denser layout)</span>
                  </label>
                </div>
              </SettingSection>
            </div>
          )}
        </div>
      </div>
    </div>
  );
};

export default Settings;