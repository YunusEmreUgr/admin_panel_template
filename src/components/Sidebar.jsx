import React from 'react';
import { 
  LayoutDashboard, 
  Users, 
  CreditCard, 
  Box, 
  HeartPulse, 
  ShieldCheck, 
  Power,
  UserCheck
} from 'lucide-react';

function Sidebar({ currentView, onViewChange, adminName, onLogout }) {
  const menuItems = [
    { id: 'dashboard', label: 'Gösterge Paneli', icon: LayoutDashboard },
    { id: 'users', label: 'Kullanıcı Yönetimi', icon: Users },
    { id: 'subscriptions', label: 'Abonelik & Ödemeler', icon: CreditCard },
    { id: 'products', label: 'Ürün Katalogu', icon: Box },
    { id: 'health', label: 'Sistem Sağlığı', icon: HeartPulse },
  ];

  return (
    <aside style={styles.sidebar}>
      <div style={styles.brand}>
        <ShieldCheck size={28} style={styles.brandLogo} />
        <div style={styles.brandText}>
          <h1 style={styles.brandTitle}>Enterprise</h1>
          <span style={styles.brandSubtitle}>Control Center</span>
        </div>
      </div>
      <nav style={styles.menu}>
        {menuItems.map(item => {
          const Icon = item.icon;
          const isActive = currentView === item.id;
          return (
            <button
              key={item.id}
              onClick={() => onViewChange(item.id)}
              style={{
                ...styles.menuItem,
                ...(isActive ? styles.menuItemActive : {})
              }}
            >
              <Icon size={18} />
              <span>{item.label}</span>
            </button>
          );
        })}
      </nav>
      <div style={styles.footer}>
        <div style={styles.userCard}>
          <div style={styles.avatar}>
            <UserCheck size={18} />
          </div>
          <div style={styles.userInfo}>
            <span style={styles.userName}>{adminName}</span>
            <span style={styles.userRole}>Sistem Admin</span>
          </div>
        </div>
        <button onClick={onLogout} style={styles.logoutBtn}>
          <Power size={14} />
          <span>Çıkış Yap</span>
        </button>
      </div>
    </aside>
  );
}

const styles = {
  sidebar: {
    width: '260px',
    backgroundColor: '#080611',
    borderRight: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    height: '100%',
    flexShrink: 0
  },
  brand: {
    height: '70px',
    display: 'flex',
    alignItems: 'center',
    padding: '0 20px',
    gap: '12px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  },
  brandLogo: {
    color: '#E24EFF',
    filter: 'drop-shadow(0 0 8px rgba(226, 78, 255, 0.4))'
  },
  brandText: {
    display: 'flex',
    flexDirection: 'column'
  },
  brandTitle: {
    fontSize: '17px',
    fontWeight: '800',
    letterSpacing: '0.5px',
    lineHeight: '1.1'
  },
  brandSubtitle: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.35)',
    fontWeight: '600',
    textTransform: 'uppercase'
  },
  menu: {
    flexGrow: 1,
    padding: '20px 10px',
    display: 'flex',
    flexDirection: 'column',
    gap: '4px'
  },
  menuItem: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    padding: '12px 14px',
    borderRadius: '10px',
    color: 'rgba(255, 255, 255, 0.65)',
    textDecoration: 'none',
    fontSize: '13px',
    fontWeight: '500',
    background: 'transparent',
    border: 'none',
    cursor: 'pointer',
    textAlign: 'left',
    transition: 'all 0.2s'
  },
  menuItemActive: {
    backgroundColor: '#6B4EFF',
    color: 'white',
    boxShadow: '0 4px 12px rgba(107, 78, 255, 0.3)'
  },
  footer: {
    padding: '16px',
    borderTop: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    flexDirection: 'column',
    gap: '10px'
  },
  userCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px'
  },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: '10px',
    background: 'rgba(255, 255, 255, 0.04)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    color: '#E24EFF'
  },
  userInfo: {
    display: 'flex',
    flexDirection: 'column'
  },
  userName: {
    fontSize: '12px',
    fontWeight: '600'
  },
  userRole: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.35)'
  },
  logoutBtn: {
    background: 'transparent',
    border: 'none',
    color: '#FF5252',
    cursor: 'pointer',
    fontSize: '11px',
    fontWeight: '600',
    padding: '8px 10px',
    display: 'flex',
    alignItems: 'center',
    gap: '8px',
    borderRadius: '6px',
    transition: 'all 0.2s',
    textAlign: 'left'
  }
};

export default Sidebar;
