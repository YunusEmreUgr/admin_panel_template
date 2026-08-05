import React, { useState } from 'react';
import { RotateCw } from 'lucide-react';

const viewHeaders = {
  dashboard: { title: 'Gösterge Paneli', subtitle: 'SaaS verilerini ve işlem geçmişini buradan yönetin.' },
  users: { title: 'Kullanıcı Yönetimi', subtitle: 'Kayıtlı sistem kullanıcılarını yönetin, rolleri düzenleyin veya engelleyin.' },
  subscriptions: { title: 'Abonelik & Ödemeler', subtitle: 'App Store abonelik durumlarını ve yerel doğrulama günlüklerini izleyin.' },
  products: { title: 'Ürün Katalogu', subtitle: 'SaaS sistemindeki ürünlerin listesini, stok ve fiyat bilgilerini güncelleyin.' },
  health: { title: 'Sistem Sağlığı', subtitle: 'Sunucu, veritabanı ve bağlı servislerin çalışma durumlarını takip edin.' },
  '': { title: 'Yükleniyor...', subtitle: 'Veriler çekiliyor...' }
};

function Header({ currentView, onRefresh }) {
  const [spinning, setSpinning] = useState(false);
  const header = viewHeaders[currentView] || { title: 'Yönetim Paneli', subtitle: 'Enterprise Dashboard' };

  const handleRefreshClick = () => {
    setSpinning(true);
    onRefresh();
    setTimeout(() => setSpinning(false), 800);
  };

  return (
    <header style={styles.header}>
      <div>
        <h2 style={styles.title}>{header.title}</h2>
        <span style={styles.subtitle}>{header.subtitle}</span>
      </div>
      <div>
        <button onClick={handleRefreshClick} className="btn btn-secondary">
          <RotateCw size={14} className={spinning ? 'fa-spin' : ''} style={{ animation: spinning ? 'spin 1s linear infinite' : 'none' }} />
          <span>Yenile</span>
        </button>
      </div>
      <style>{`
        @keyframes spin {
          from { transform: rotate(0deg); }
          to { transform: rotate(360deg); }
        }
      `}</style>
    </header>
  );
}

const styles = {
  header: {
    height: '70px',
    padding: '0 32px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    flexShrink: 0
  },
  title: {
    fontSize: '20px',
    fontWeight: '700'
  },
  subtitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)'
  }
};

export default Header;
