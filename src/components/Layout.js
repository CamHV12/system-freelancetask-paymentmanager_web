import React, { useState, useEffect } from 'react';
import { Link, Outlet, useLocation } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import Notifications from './Notifications';
import { notificationsAPI } from '../services/api';
import './Layout.css';

const Layout = () => {
  const { user, logout } = useAuth();
  const location = useLocation();
  const [sidebarOpen, setSidebarOpen] = useState(true);
  const [showNotifications, setShowNotifications] = useState(false);
  const [unreadCount, setUnreadCount] = useState(0);

  useEffect(() => {
    loadUnreadCount();
    const interval = setInterval(loadUnreadCount, 30000);
    return () => clearInterval(interval);
  }, []);

  const loadUnreadCount = async () => {
    try {
      const response = await notificationsAPI.getUnread();
      setUnreadCount(response.data?.length || 0);
    } catch (error) {
      console.error('Error loading unread count:', error);
    }
  };

  const menuItems = [
    { path: '/dashboard', label: 'Dashboard', icon: '📊' },
    { path: '/projects', label: 'Projects', icon: '📁' },
    { path: '/tasks', label: 'Tasks', icon: '✓' },
    { path: '/kanban', label: 'Kanban', icon: '📋' },
    { path: '/invoices', label: 'Invoices', icon: '💰' },
    { path: '/payment-reminders', label: 'Reminders', icon: '⏰' },
    { path: '/reports', label: 'Reports', icon: '📈' },
    { path: '/clients', label: 'Clients', icon: '👥' },
    { path: '/expenses', label: 'Expenses', icon: '💳' },
    { path: '/settings', label: 'Settings', icon: '⚙️' },
  ];

  return (
    <div className="layout">
      <nav className={`sidebar ${sidebarOpen ? 'open' : 'closed'}`}>
        <div className="sidebar-header">
          <h2>Freelance Manager</h2>
          <button className="toggle-btn" onClick={() => setSidebarOpen(!sidebarOpen)}>
            {sidebarOpen ? '←' : '→'}
          </button>
        </div>
        <ul className="sidebar-menu">
          {menuItems.map((item) => (
            <li key={item.path}>
              <Link
                to={item.path}
                className={location.pathname === item.path ? 'active' : ''}
              >
                <span className="icon">{item.icon}</span>
                {sidebarOpen && <span className="label">{item.label}</span>}
              </Link>
            </li>
          ))}
        </ul>
        <div className="sidebar-footer">
          {sidebarOpen && (
            <div className="user-info">
              <p>{user?.firstName} {user?.lastName}</p>
              <p className="email">{user?.email}</p>
            </div>
          )}
          <button onClick={logout} className="logout-btn">
            {sidebarOpen ? 'Logout' : '🚪'}
          </button>
        </div>
      </nav>
      <main className="main-content">
        <div className="main-header">
          <div className="notification-bell" onClick={() => setShowNotifications(!showNotifications)}>
            🔔
            {unreadCount > 0 && <span className="notification-badge">{unreadCount}</span>}
          </div>
          {showNotifications && (
            <div className="notifications-dropdown">
              <Notifications onClose={() => setShowNotifications(false)} />
            </div>
          )}
        </div>
        <Outlet />
      </main>
    </div>
  );
};

export default Layout;

