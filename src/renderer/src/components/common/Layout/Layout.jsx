// src/components/common/Layout/Layout.jsx
import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import './Layout.css';

const Layout = ({ activeTab, onTabChange, children, isOnline, pendingSyncs }) => {
  return (
    <div className="layout">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={onTabChange}
        isOnline={isOnline}
        pendingSyncs={pendingSyncs}
      />
      <main className="main-content">
        {children}
      </main>
    </div>
  );
};

export default Layout;