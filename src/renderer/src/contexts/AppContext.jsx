import React, { createContext, useContext, useState, useEffect } from 'react';

const AppContext = createContext();

export const useApp = () => {
  const context = useContext(AppContext);
  if (!context) {
    throw new Error('useApp must be used within an AppProvider');
  }
  return context;
};

export const AppProvider = ({ children }) => {
  const [activeTab, setActiveTab] = useState('dashboard');
  const [isOnline, setIsOnline] = useState(navigator.onLine);
  const [pendingSyncs, setPendingSyncs] = useState(0);

  useEffect(() => {
    const handleOnline = () => setIsOnline(true);
    const handleOffline = () => setIsOnline(false);

    window.addEventListener('online', handleOnline);
    window.addEventListener('offline', handleOffline);

    return () => {
      window.removeEventListener('online', handleOnline);
      window.removeEventListener('offline', handleOffline);
    };
  }, []);

  useEffect(() => {
    const interval = setInterval(() => {
      if (!isOnline && pendingSyncs < 10) {
        setPendingSyncs(prev => prev + 1);
      }
    }, 5000);

    return () => clearInterval(interval);
  }, [isOnline, pendingSyncs]);

  const value = {
    activeTab,
    setActiveTab,
    isOnline,
    setIsOnline,
    pendingSyncs,
    setPendingSyncs
  };

  return (
    <AppContext.Provider value={value}>
      {children}
    </AppContext.Provider>
  );
};