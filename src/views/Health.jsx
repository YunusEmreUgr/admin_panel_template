import React, { useState, useEffect } from 'react';
import { Activity, CheckCircle, AlertTriangle, ShieldX } from 'lucide-react';

function Health() {
  const [health, setHealth] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadHealth();
  }, []);

  const loadHealth = async () => {
    setLoading(true);
    try {
      const response = await fetch('/api/health');
      const data = await response.json();
      setHealth(data);
    } catch (err) {
      console.error(err);
      setHealth({ status: 'Unhealthy', checks: [] });
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div style={{ color: 'rgba(255,255,255,0.6)' }}>Yükleniyor...</div>;
  }

  const isHealthy = health.status === 'Healthy';

  return (
    <div style={styles.healthGrid}>
      <div className="glass-card" style={styles.healthStatusCard}>
        <div style={styles.cardHeader}>
          <h4 style={styles.cardTitle}>API Sağlık Denetimi</h4>
        </div>
        
        <div style={{
          ...styles.statusValue,
          color: isHealthy ? '#00E676' : '#FF1744'
        }}>
          {isHealthy ? (
            <>
              <CheckCircle size={32} />
              <span>Sistem Sorunsuz Çalışıyor</span>
            </>
          ) : (
            <>
              <AlertTriangle size={32} />
              <span>Sistem Sağlık Uyarısı</span>
            </>
          )}
        </div>

        <ul style={styles.detailsList}>
          {health.checks && health.checks.length > 0 ? (
            health.checks.map(check => {
              const checkHealthy = check.status === 'Healthy';
              return (
                <li key={check.name} style={styles.detailItem}>
                  <span>{check.name} Durumu</span>
                  <span style={{ 
                    fontWeight: 700, 
                    color: checkHealthy ? '#00E676' : '#FF1744' 
                  }}>
                    {checkHealthy ? 'Sorunsuz' : 'Hatalı'} ({check.duration})
                  </span>
                </li>
              );
            })
          ) : (
            <li style={styles.detailItem}>
              <span>Sunucu Durumu</span>
              <span style={{ color: '#FF1744', fontWeight: 700 }}>Bağlantı Kurulamadı</span>
            </li>
          )}
        </ul>
      </div>

      <div className="glass-card" style={styles.systemInfoCard}>
        <div style={styles.cardHeader}>
          <h4 style={styles.cardTitle}>Sunucu Bilgileri</h4>
        </div>
        <table className="info-table" style={{ width: '100%', marginTop: '16px' }}>
          <tbody>
            <tr style={styles.infoRow}>
              <td style={styles.infoLabel}>Çalışma Zamanı (Runtime)</td>
              <td style={styles.infoVal}>.NET 9.0 SDK</td>
            </tr>
            <tr style={styles.infoRow}>
              <td style={styles.infoLabel}>İşletim Sistemi</td>
              <td style={styles.infoVal}>Windows (Server Core)</td>
            </tr>
            <tr style={styles.infoRow}>
              <td style={styles.infoLabel}>Bağlantı Protokolü</td>
              <td style={styles.infoVal}>HTTP/2 (Kestrel)</td>
            </tr>
            <tr style={styles.infoRow}>
              <td style={styles.infoLabel}>Log Süzgeci</td>
              <td style={styles.infoVal}>Serilog Console & File</td>
            </tr>
            <tr style={styles.infoRow}>
              <td style={styles.infoLabel}>Dağıtık Önbellek</td>
              <td style={styles.infoVal}>MemoryCache & Redis</td>
            </tr>
          </tbody>
        </table>
      </div>
    </div>
  );
}

const styles = {
  healthGrid: {
    display: 'grid',
    gridTemplateColumns: '1fr 1fr',
    gap: '24px'
  },
  healthStatusCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  systemInfoCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  cardHeader: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    paddingBottom: '12px'
  },
  cardTitle: {
    fontSize: '15px',
    fontWeight: '700'
  },
  statusValue: {
    display: 'flex',
    alignItems: 'center',
    gap: '14px',
    fontSize: '20px',
    fontWeight: '800',
    margin: '24px 0'
  },
  detailsList: {
    listStyle: 'none',
    display: 'flex',
    flexDirection: 'column',
    gap: '8px'
  },
  detailItem: {
    display: 'flex',
    justifyContent: 'space-between',
    padding: '10px 0',
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)',
    fontSize: '13px'
  },
  infoRow: {
    borderBottom: '1px solid rgba(255, 255, 255, 0.05)'
  },
  infoLabel: {
    padding: '12px 0',
    fontSize: '13px',
    color: 'rgba(255, 255, 255, 0.65)'
  },
  infoVal: {
    padding: '12px 0',
    fontSize: '13px',
    fontWeight: '600',
    textAlign: 'right'
  }
};

export default Health;
