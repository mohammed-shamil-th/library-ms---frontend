'use client';

import { createContext, useContext, useState, useEffect } from 'react';

const TabsContext = createContext();

export function Tabs({ defaultValue, value, onValueChange, children, className = '' }) {
  const [internalActiveTab, setInternalActiveTab] = useState(defaultValue || value || '');
  const activeTab = value !== undefined ? value : internalActiveTab;
  const setActiveTab = onValueChange || setInternalActiveTab;

  // Sync internal state with external value prop
  useEffect(() => {
    if (value !== undefined) {
      setInternalActiveTab(value);
    }
  }, [value]);

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab }}>
      <div className={`tabs ${className}`}>{children}</div>
    </TabsContext.Provider>
  );
}

export function TabsList({ children, className = '' }) {
  return <div className={`tabs-list ${className}`}>{children}</div>;
}

export function TabsTrigger({ value, children, className = '' }) {
  const { activeTab, setActiveTab } = useContext(TabsContext);
  const isActive = activeTab === value;

  return (
    <button
      type="button"
      className={`tabs-trigger ${isActive ? 'tabs-trigger-active' : ''} ${className}`}
      onClick={() => setActiveTab(value)}
    >
      {children}
    </button>
  );
}

export function TabsContent({ value, children, className = '' }) {
  const { activeTab } = useContext(TabsContext);
  if (activeTab !== value) return null;

  return <div className={`tabs-content ${className}`}>{children}</div>;
}

