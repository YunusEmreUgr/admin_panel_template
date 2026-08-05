import React, { useState, useEffect } from 'react';
import Sidebar from './components/Sidebar';
import Header from './components/Header';
import Dashboard from './views/Dashboard';
import Users from './views/Users';
import Subscriptions from './views/Subscriptions';
import Products from './views/Products';
import Health from './views/Health';
import Login from './views/Login';

function App() {
  const [token, setToken] = useState(localStorage.getItem('admin_token'));
  const [currentView, setCurrentView] = useState('dashboard');
  const [adminName, setAdminName] = useState('Yönetici');

  useEffect(() => {
    if (token) {
      localStorage.setItem('admin_token', token);
      verifyAdminRole();
    } else {
      localStorage.removeItem('admin_token');
    }
  }, [token]);

  const verifyAdminRole = async () => {
    try {
      const response = await fetch('/api/v1/auth/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.status === 401) {
        handleLogout();
        return;
      }
      const result = await response.json();
      if (result.success && result.data.includes('Admin')) {
        // Find email or name from claims or mock name
        setAdminName('Sistem Yöneticisi');
      } else {
        alert('Yetkisiz erişim. Bu panele sadece Admin yetkisine sahip kullanıcılar erişebilir.');
        handleLogout();
      }
    } catch (err) {
      console.error('Yetki doğrulaması yapılamadı:', err);
      handleLogout();
    }
  };

  const handleLogout = () => {
    setToken(null);
    localStorage.removeItem('admin_token');
  };

  const apiFetch = async (endpoint, options = {}) => {
    if (!token) return null;
    const headers = {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}`,
      ...options.headers
    };
    try {
      const response = await fetch(`/api/v1${endpoint}`, { ...options, headers });
      if (response.status === 401) {
        handleLogout();
        return null;
      }
      const result = await response.json();
      return result.data;
    } catch (err) {
      console.error(`API Hata (${endpoint}):`, err);
      return null;
    }
  };

  if (!token) {
    return <Login onLoginSuccess={setToken} />;
  }

  const renderView = () => {
    switch (currentView) {
      case 'dashboard':
        return <Dashboard apiFetch={apiFetch} />;
      case 'users':
        return <Users apiFetch={apiFetch} token={token} />;
      case 'subscriptions':
        return <Subscriptions apiFetch={apiFetch} />;
      case 'products':
        return <Products apiFetch={apiFetch} token={token} />;
      case 'health':
        return <Health />;
      default:
        return <Dashboard apiFetch={apiFetch} />;
    }
  };

  return (
    <div style={{ display: 'flex', width: '100vw', height: '100vh' }}>
      <Sidebar 
        currentView={currentView} 
        onViewChange={setCurrentView} 
        adminName={adminName} 
        onLogout={handleLogout} 
      />
      <div style={{ flexGrow: 1, display: 'flex', flexDirection: 'column', height: '100%', overflow: 'hidden' }}>
        <Header 
          currentView={currentView} 
          onRefresh={() => {
            // Trigger refresh logic on subview by updating key or calling ref
            // Simple approach: trigger re-load of the current view
            const prev = currentView;
            setCurrentView('');
            setTimeout(() => setCurrentView(prev), 10);
          }} 
        />
        <main style={{ flexGrow: 1, padding: '32px', overflowY: 'auto' }}>
          {renderView()}
        </main>
      </div>
    </div>
  );
}

export default App;
