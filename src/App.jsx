import React, { createContext, useContext, useState, useEffect } from 'react';
import { HashRouter as Router, Routes, Route, NavLink, useNavigate, Navigate } from 'react-router-dom';
import Dashboard from './pages/Dashboard';
import BorrowerDashboard from './pages/BorrowerDashboard';
import Equipment from './pages/Equipment';
import Bookings from './pages/Bookings';
import Queue from './pages/Queue';
import Users from './pages/Users';
import Reports from './pages/Reports';
import Settings from './pages/Settings';
import Notifications from './pages/Notifications';
import EquipmentDetail from './pages/EquipmentDetail';
import SecurityPage from './pages/SecurityPage';
import Login from './pages/Login';
import UserLogin from './pages/UserLogin';
import {
  LayoutDashboard, Laptop, CalendarCheck, ListOrdered,
  Users as UsersIcon, BarChart3, Settings2, Bell, LogOut,
  Menu, X, ChevronDown, ShieldCheck
} from 'lucide-react';
import {
  subscribeEquipment, subscribeBookings, subscribeQueue, subscribeUsers,
  SEED_EQUIPMENT, SEED_BOOKINGS, SEED_QUEUE, SEED_USERS
} from './store';
import {
  isSupabaseEnabled,
  safeOnAuthStateChanged,
  signOutSupabase,
} from './supabase';
import { registerServiceWorker } from './serviceWorkerRegistration';

export const AppContext = createContext({});
export const useApp = () => useContext(AppContext);

function Sidebar({ open, onClose }) {
  const { currentUser, setCurrentUser, isSupabaseEnabled, signOutSupabase } = useApp();
  const navigate = useNavigate();
  const navItems = currentUser?.role === 'staff' ? [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/equipment', label: 'Equipment', icon: Laptop },
    { to: '/bookings', label: 'Bookings', icon: CalendarCheck },
    { to: '/queue', label: 'Queue', icon: ListOrdered },
    { to: '/users', label: 'Users', icon: UsersIcon },
    { to: '/security', label: 'Security', icon: ShieldCheck },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/reports', label: 'Reports', icon: BarChart3 },
    { to: '/settings', label: 'Settings', icon: Settings2 },
  ] : [
    { to: '/', label: 'Dashboard', icon: LayoutDashboard },
    { to: '/equipment', label: 'Browse Equipment', icon: Laptop },
    { to: '/bookings', label: 'My Bookings', icon: CalendarCheck },
    { to: '/queue', label: 'My Queue', icon: ListOrdered },
    { to: '/notifications', label: 'Notifications', icon: Bell },
    { to: '/settings', label: 'Profile', icon: Settings2 },
  ];
  return (
    <>
      {open && <div className="sidebar-overlay" onClick={onClose} />}
      <aside className={`sidebar ${open ? 'open' : ''}`}>
        <div className="sidebar-brand">
          <div className="brand-logo"><span>K</span></div>
          <div>
            <div className="brand-name">KIBERA</div>
            <div className="brand-sub">YOUTH CENTRE</div>
          </div>
          <button className="close-sidebar" onClick={onClose}><X size={18} /></button>
        </div>
        <div className="sidebar-label">MAIN MENU</div>
        <nav className="sidebar-nav">
          {navItems.map(({ to, label, icon: Icon }) => (
            <NavLink key={to} to={to} end={to === '/'} className={({ isActive }) => `nav-item ${isActive ? 'active' : ''}`} onClick={onClose}>
              <Icon size={18} /><span>{label}</span>
            </NavLink>
          ))}
        </nav>
        <div className="sidebar-footer">
          <div className="sidebar-user">
            <div className="user-avatar">{currentUser?.name?.[0] ?? 'L'}</div>
            <div>
              <div className="user-name">{currentUser?.name ?? 'Librarian'}</div>
              <div className="user-role">{currentUser?.role === 'staff' ? 'Staff' : 'Borrower'}</div>
            </div>
            <button className="logout-btn" title="Logout" onClick={() => {
              if (isSupabaseEnabled) {
                signOutSupabase().catch(() => {});
              }
              setCurrentUser(null);
              navigate('/login');
            }}>
              <LogOut size={16} />
            </button>
          </div>
        </div>
      </aside>
    </>
  );
}

function TopBar({ onMenuClick }) {
  const { currentUser, notifications, installPromptEvent, appInstalled, promptInstall } = useApp();
  const navigate = useNavigate();
  const unread = notifications.filter(n => !n.read).length;
  return (
    <header className="topbar">
      <button className="menu-btn" onClick={onMenuClick}><Menu size={22} /></button>
      <h1 className="page-title">Tool Library Management System</h1>
      <div className="topbar-right">
        {installPromptEvent && !appInstalled && (
          <button className="btn-secondary" onClick={promptInstall}>Install App</button>
        )}
        <button className="notif-btn" onClick={() => navigate('/notifications')}>
          <Bell size={20} />
          {unread > 0 && <span className="notif-badge">{unread}</span>}
        </button>
        <div className="topbar-user">
          <div className="user-avatar sm">{currentUser?.name?.[0] ?? 'L'}</div>
          <span>{currentUser?.name ?? 'Librarian'}</span>
          <ChevronDown size={14} />
        </div>
      </div>
    </header>
  );
}

function ProtectedRoute({ children }) {
  const { currentUser } = useApp();
  const navigate = useNavigate();

  useEffect(() => {
    if (!currentUser) {
      navigate('/login', { replace: true });
    }
  }, [currentUser, navigate]);

  if (!currentUser) {
    return null;
  }

  return children;
}

function RoleRoute({ children, roles }) {
  const { currentUser } = useApp();
  if (!currentUser) {
    return null;
  }
  if (roles && !roles.includes(currentUser.role)) {
    return <Navigate to="/" replace />;
  }
  return children;
}

function AppLayout() {
  const [sidebarOpen, setSidebarOpen] = useState(false);
  const { currentUser } = useApp();

  if (!currentUser) {
    return null;
  }

  return (
    <div className="app-layout">
      <Sidebar open={sidebarOpen} onClose={() => setSidebarOpen(false)} />
      <div className="main-content">
        <TopBar onMenuClick={() => setSidebarOpen(true)} />
        <div className="page-body">
          <Routes>
            <Route path="/" element={currentUser.role === 'staff' ? <Dashboard /> : <BorrowerDashboard />} />
            <Route path="/equipment" element={<Equipment />} />
            <Route path="/equipment/:id" element={<EquipmentDetail />} />
            <Route path="/bookings" element={<Bookings />} />
            <Route path="/queue" element={<Queue />} />
            <Route path="/users" element={<RoleRoute roles={[ 'staff' ]}><Users /></RoleRoute>} />
            <Route path="/security" element={<RoleRoute roles={[ 'staff' ]}><SecurityPage /></RoleRoute>} />
            <Route path="/notifications" element={<Notifications />} />
            <Route path="/reports" element={<RoleRoute roles={[ 'staff' ]}><Reports /></RoleRoute>} />
            <Route path="/settings" element={<Settings />} />
          </Routes>
        </div>
      </div>
    </div>
  );
}

export default function App() {
  const [currentUser, setCurrentUser] = useState(null);
  const [equipment, setEquipment] = useState(SEED_EQUIPMENT);
  const [bookings, setBookings] = useState(SEED_BOOKINGS);
  const [queue, setQueue] = useState(SEED_QUEUE);
  const [users, setUsers] = useState(SEED_USERS);
  const [notificationsByUser, setNotificationsByUser] = useState({});
  const [supabaseUser, setSupabaseUser] = useState(null);
  const [pwaRegistered, setPwaRegistered] = useState(false);
  const [installPromptEvent, setInstallPromptEvent] = useState(null);
  const [appInstalled, setAppInstalled] = useState(false);

  useEffect(() => {
    const handleBeforeInstallPrompt = (event) => {
      event.preventDefault();
      setInstallPromptEvent(event);
    };
    const handleAppInstalled = () => setAppInstalled(true);

    window.addEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
    window.addEventListener('appinstalled', handleAppInstalled);

    return () => {
      window.removeEventListener('beforeinstallprompt', handleBeforeInstallPrompt);
      window.removeEventListener('appinstalled', handleAppInstalled);
    };
  }, []);

  const promptInstall = async () => {
    if (!installPromptEvent) {
      return;
    }

    try {
      installPromptEvent.prompt();
      const choiceResult = await installPromptEvent.userChoice;
      if (choiceResult.outcome === 'accepted') {
        setAppInstalled(true);
      }
    } catch (err) {
      console.warn('Install prompt failed', err);
    } finally {
      setInstallPromptEvent(null);
    }
  };

  useEffect(() => {
    const unsub1 = subscribeEquipment(setEquipment);
    const unsub2 = subscribeBookings(setBookings);
    const unsub3 = subscribeQueue(setQueue);
    const unsub4 = subscribeUsers(setUsers);
    return () => { unsub1(); unsub2(); unsub3(); unsub4(); };
  }, []);

  useEffect(() => {
    if (!isSupabaseEnabled) {
      return;
    }

    const unsubscribe = safeOnAuthStateChanged((user) => {
      setSupabaseUser(user);

      if (user) {
        setCurrentUser(prev => prev ?? {
          id: user.id,
          name: user.user_metadata?.full_name || user.email || user.phone || 'Supabase User',
          email: user.email || user.phone,
          role: 'staff',
        });
      } else {
        setCurrentUser(null);
      }
    });

    return unsubscribe;
  }, []);

  useEffect(() => {
    if (typeof navigator !== 'undefined' && 'serviceWorker' in navigator) {
      registerServiceWorker()
        .then(() => setPwaRegistered(true))
        .catch(() => setPwaRegistered(false));
    }
  }, []);

  const notifications = currentUser ? (notificationsByUser[currentUser.id] ?? []) : [];

  const setNotifications = (updater) => {
    if (!currentUser?.id) {
      return;
    }

    setNotificationsByUser(prev => ({
      ...prev,
      [currentUser.id]: typeof updater === 'function'
        ? updater(prev[currentUser.id] ?? [])
        : updater,
    }));
  };

  const addNotification = (notif, recipientId = currentUser?.id) => {
    if (!recipientId) {
      return;
    }

    const entry = {
      ...notif,
      id: `n${Date.now()}-${Math.random().toString(36).slice(2, 7)}`,
      read: false,
      time: 'Just now',
      recipientId,
      actorId: currentUser?.id,
      actorName: currentUser?.name ?? 'System',
    };

    setNotificationsByUser(prev => ({
      ...prev,
      [recipientId]: [entry, ...(prev[recipientId] ?? [])],
    }));
  };

  return (
    <AppContext.Provider value={{
      currentUser,
      setCurrentUser,
      equipment,
      setEquipment,
      bookings,
      setBookings,
      queue,
      setQueue,
      users,
      setUsers,
      notifications,
      setNotifications,
      addNotification,
      supabaseUser,
      isSupabaseEnabled,
      signOutSupabase,
      pwaRegistered,
      installPromptEvent,
      promptInstall,
      appInstalled,
    }}>
      <Router>
        <Routes>
          <Route path="/login" element={<Login />} />
          <Route path="/user-login" element={<UserLogin />} />
          <Route
            path="/*"
            element={
              currentUser ? (
                <AppLayout />
              ) : (
                <Navigate to="/login" replace />
              )
            }
          />
        </Routes>
      </Router>
    </AppContext.Provider>
  );
}
