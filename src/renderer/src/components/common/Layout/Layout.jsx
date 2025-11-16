import React from 'react';
import Sidebar from '../Sidebar/Sidebar';
import { useApp } from '../../../contexts/AppContext';
import './Layout.css';

const Layout = ({ children }) => {
  const { activeTab, setActiveTab, isOnline, pendingSyncs } = useApp();

  return (
    <div className="layout">
      <Sidebar 
        activeTab={activeTab}
        onTabChange={setActiveTab}
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