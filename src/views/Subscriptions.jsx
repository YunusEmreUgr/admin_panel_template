import React, { useState, useEffect } from 'react';
import { Search, Download, Calendar, CreditCard, Activity, FileText, CheckCircle, RefreshCw, X, Eye, ShieldCheck } from 'lucide-react';

function Subscriptions({ apiFetch }) {
  const [activeTab, setActiveTab] = useState('subs'); // 'subs' or 'txs'
  const [subscriptions, setSubscriptions] = useState([]);
  const [transactions, setTransactions] = useState([]);
  const [loading, setLoading] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [statusFilter, setStatusFilter] = useState('all'); // 'all', 'active', 'expired'
  const [envFilter, setEnvFilter] = useState('all'); // 'all', 'sandbox', 'production'
  const [selectedTx, setSelectedTx] = useState(null); // For detail modal

  useEffect(() => {
    loadSubscriptions();
  }, []);

  const loadSubscriptions = async () => {
    setLoading(true);
    const data = await apiFetch('/admin/subscriptions');
    if (data) {
      setSubscriptions(data.subscriptions || []);
      setTransactions(data.transactions || []);
    }
    setLoading(false);
  };

  // KPIs
  const activeSubs = subscriptions.filter(s => s.isActive).length;
  const sandboxTxCount = transactions.filter(t => t.environment === 'Sandbox').length;
  const prodTxCount = transactions.filter(t => t.environment === 'Production' || t.environment === 'Real').length;
  
  const estimatedMRR = subscriptions.reduce((sum, sub) => {
    if (!sub.isActive) return sum;
    // Premium Yearly = 949.99 / 12 months = ~79.16 per month, Monthly = 129.99 per month
    const price = sub.productId?.includes('yearly') ? 79.16 : 129.99;
    return sum + price;
  }, 0);

  // Filters
  const filteredSubs = subscriptions.filter(sub => {
    const matchesSearch = sub.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          sub.productId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const isExpired = sub.expirationDate && new Date(sub.expirationDate) < new Date();
    const isActiveVal = sub.isActive && !isExpired;

    const matchesStatus = statusFilter === 'all' || 
                          (statusFilter === 'active' && isActiveVal) || 
                          (statusFilter === 'expired' && !isActiveVal);
    
    return matchesSearch && matchesStatus;
  });

  const filteredTxs = transactions.filter(tx => {
    const matchesSearch = tx.userEmail?.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.transactionId?.toLowerCase().includes(searchQuery.toLowerCase()) ||
                          tx.productId?.toLowerCase().includes(searchQuery.toLowerCase());
    
    const matchesEnv = envFilter === 'all' || 
                       tx.environment?.toLowerCase() === envFilter.toLowerCase();
    
    return matchesSearch && matchesEnv;
  });

  // Exporter
  const exportToCSV = (list, type) => {
    if (list.length === 0) {
      alert('Dışa aktarılacak veri bulunamadı.');
      return;
    }
    
    let csvContent = '\uFEFF'; // UTF-8 BOM
    let headers = [];

    if (type === 'subs') {
      headers = ['Abonelik ID', 'Kullanıcı E-Posta', 'Abonelik Tipi', 'Ürün ID', 'Durum', 'Bitiş Tarihi'];
      csvContent += headers.join(',') + '\n';
      list.forEach(item => {
        const row = [
          item.userSubscriptionId,
          item.userEmail,
          item.subscriptionTier,
          item.productId,
          item.isActive ? 'Aktif' : 'Pasif',
          item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('tr-TR') : 'Süresiz'
        ];
        csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
      });
    } else {
      headers = ['İşlem ID', 'Kullanıcı E-Posta', 'Apple İşlem ID', 'Ürün ID', 'Satın Alım Tarihi', 'Bitiş Tarihi', 'Ortam'];
      csvContent += headers.join(',') + '\n';
      list.forEach(item => {
        const row = [
          item.appStoreTransactionId,
          item.userEmail,
          item.transactionId,
          item.productId,
          new Date(item.purchaseDate).toLocaleString('tr-TR'),
          item.expirationDate ? new Date(item.expirationDate).toLocaleDateString('tr-TR') : 'Süresiz',
          item.environment
        ];
        csvContent += row.map(val => `"${String(val).replace(/"/g, '""')}"`).join(',') + '\n';
      });
    }

    const blob = new Blob([csvContent], { type: 'text/csv;charset=utf-8;' });
    const url = URL.createObjectURL(blob);
    const link = document.createElement('a');
    link.setAttribute('href', url);
    link.setAttribute('download', `${type === 'subs' ? 'aktif_abonelikler' : 'odeme_islemleri'}_export.csv`);
    document.body.appendChild(link);
    link.click();
    document.body.removeChild(link);
  };

  return (
    <div style={styles.container}>
      {/* KPI Dashboard */}
      <div style={styles.kpiGrid}>
        <div className="glass-card" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: 'rgba(107, 78, 255, 0.15)', color: '#6B4EFF' }}>
            <Activity size={20} />
          </div>
          <div style={styles.kpiBody}>
            <span style={styles.kpiTitle}>Aktif Premium Üye</span>
            <span style={styles.kpiValue}>{activeSubs}</span>
            <span style={styles.kpiSubtitle}>Veritabanında kayıtlı aktif</span>
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: 'rgba(226, 78, 255, 0.15)', color: '#E24EFF' }}>
            <CreditCard size={20} />
          </div>
          <div style={styles.kpiBody}>
            <span style={styles.kpiTitle}>Toplam Satış Kaydı</span>
            <span style={styles.kpiValue}>{transactions.length}</span>
            <span style={styles.kpiSubtitle}>Prod: {prodTxCount} | Sandbox: {sandboxTxCount}</span>
          </div>
        </div>

        <div className="glass-card" style={styles.kpiCard}>
          <div style={{ ...styles.kpiIcon, background: 'rgba(0, 230, 118, 0.15)', color: '#00E676' }}>
            <ShieldCheck size={20} />
          </div>
          <div style={styles.kpiBody}>
            <span style={styles.kpiTitle}>Tahmini Aylık MRR</span>
            <span style={styles.kpiValue}>₺{estimatedMRR.toLocaleString('tr-TR', { maximumFractionDigits: 2 })}</span>
            <span style={styles.kpiSubtitle}>Yıllık paketler 12'ye bölünmüştür</span>
          </div>
        </div>
      </div>

      {/* Filter / Action Bar */}
      <div className="glass-card" style={styles.filterCard}>
        <div style={styles.filterBar}>
          <div className="search-box" style={{ flex: 1, minWidth: '220px' }}>
            <Search size={16} />
            <input
              type="text"
              placeholder="E-posta, İşlem ID veya Paket arayın..."
              value={searchQuery}
              onChange={(e) => setSearchQuery(e.target.value)}
            />
          </div>

          <div style={styles.filterGroup}>
            {activeTab === 'subs' ? (
              <select 
                style={styles.selectInput} 
                value={statusFilter} 
                onChange={(e) => setStatusFilter(e.target.value)}
              >
                <option value="all">Tüm Durumlar</option>
                <option value="active">Aktif Abonelikler</option>
                <option value="expired">Pasif/Süresi Bitmiş</option>
              </select>
            ) : (
              <select 
                style={styles.selectInput} 
                value={envFilter} 
                onChange={(e) => setEnvFilter(e.target.value)}
              >
                <option value="all">Tüm Ortamlar</option>
                <option value="production">Production (Canlı)</option>
                <option value="sandbox">Sandbox (Test)</option>
              </select>
            )}

            <button 
              className="btn btn-secondary" 
              onClick={() => exportToCSV(activeTab === 'subs' ? filteredSubs : filteredTxs, activeTab)}
              title="CSV olarak dışa aktar"
            >
              <Download size={15} />
              Dışa Aktar
            </button>

            <button 
              className="btn btn-icon" 
              onClick={loadSubscriptions} 
              disabled={loading}
              title="Yenile"
            >
              <RefreshCw size={14} className={loading ? 'spin-animation' : ''} />
            </button>
          </div>
        </div>
      </div>

      {/* Main Tab Panel */}
      <div className="tabs-container" style={{ marginTop: '20px' }}>
        <div className="tabs-header">
          <button 
            className={`tab-btn ${activeTab === 'subs' ? 'active' : ''}`}
            onClick={() => setActiveTab('subs')}
          >
            Aktif Abonelik Kayıtları ({filteredSubs.length})
          </button>
          <button 
            className={`tab-btn ${activeTab === 'txs' ? 'active' : ''}`}
            onClick={() => setActiveTab('txs')}
          >
            IAP İşlem Günlükleri ({filteredTxs.length})
          </button>
        </div>

        {activeTab === 'subs' ? (
          <div className="glass-card" style={styles.tableCard}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>Abonelik ID</th>
                    <th>Kullanıcı E-Posta</th>
                    <th>Tier</th>
                    <th>Ürün Kimliği</th>
                    <th>Bitiş Tarihi</th>
                    <th>Durum</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="6" style={styles.loadingCell}>Yükleniyor...</td>
                    </tr>
                  ) : filteredSubs.length === 0 ? (
                    <tr>
                      <td colSpan="6" style={styles.loadingCell}>Filtreye uygun abonelik kaydı bulunamadı.</td>
                    </tr>
                  ) : (
                    filteredSubs.map(sub => {
                      const date = sub.expirationDate ? new Date(sub.expirationDate) : null;
                      const dateStr = date ? `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}` : 'N/A';
                      const isExpired = date && date < new Date();
                      
                      const badge = sub.isActive && !isExpired
                        ? <span className="badge badge-active" style={styles.activeBadge}>Aktif</span>
                        : <span className="badge badge-inactive">Süresi Bitmiş</span>;

                      return (
                        <tr key={sub.userSubscriptionId}>
                          <td>#{sub.userSubscriptionId}</td>
                          <td style={{ fontWeight: '600' }}>{sub.userEmail}</td>
                          <td>
                            <span style={sub.subscriptionTier === 'Pro' ? styles.proTier : styles.premiumTier}>
                              {sub.subscriptionTier}
                            </span>
                          </td>
                          <td><code>{sub.productId || 'N/A'}</code></td>
                          <td>{dateStr}</td>
                          <td>{badge}</td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        ) : (
          <div className="glass-card" style={styles.tableCard}>
            <div className="table-responsive">
              <table className="admin-table">
                <thead>
                  <tr>
                    <th>İşlem ID</th>
                    <th>Kullanıcı E-Posta</th>
                    <th>Apple Transaction ID</th>
                    <th>Paket ID</th>
                    <th>Satın Alım Tarihi</th>
                    <th>Bitiş Tarihi</th>
                    <th>Ortam</th>
                    <th style={{ textAlign: 'center' }}>Detay</th>
                  </tr>
                </thead>
                <tbody>
                  {loading ? (
                    <tr>
                      <td colSpan="8" style={styles.loadingCell}>Yükleniyor...</td>
                    </tr>
                  ) : filteredTxs.length === 0 ? (
                    <tr>
                      <td colSpan="8" style={styles.loadingCell}>Filtreye uygun App Store işlemi bulunamadı.</td>
                    </tr>
                  ) : (
                    filteredTxs.map(tx => {
                      const date = new Date(tx.purchaseDate);
                      const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()} ${String(date.getHours()).padStart(2, '0')}:${String(date.getMinutes()).padStart(2, '0')}`;
                      const expDate = tx.expirationDate ? new Date(tx.expirationDate) : null;
                      const expDateStr = expDate ? `${expDate.getDate()}/${expDate.getMonth() + 1}/${expDate.getFullYear()}` : 'Süresiz';

                      const envBadge = tx.environment === 'Sandbox'
                        ? <span className="badge" style={styles.sandboxBadge}>Sandbox</span>
                        : <span className="badge" style={styles.productionBadge}>Production</span>;

                      return (
                        <tr key={tx.appStoreTransactionId}>
                          <td>#{tx.appStoreTransactionId}</td>
                          <td>{tx.userEmail}</td>
                          <td><code>{tx.transactionId}</code></td>
                          <td>{tx.productId}</td>
                          <td>{dateStr}</td>
                          <td>{expDateStr}</td>
                          <td>{envBadge}</td>
                          <td style={{ textAlign: 'center' }}>
                            <button 
                              className="btn btn-icon" 
                              onClick={() => setSelectedTx(tx)}
                              title="Makbuz Detaylarını İncele"
                            >
                              <Eye size={13} />
                            </button>
                          </td>
                        </tr>
                      );
                    })
                  )}
                </tbody>
              </table>
            </div>
          </div>
        )}
      </div>

      {/* Audit Detail Inspector Modal */}
      {selectedTx && (
        <div className="modal-wrapper">
          <div className="modal-card" style={styles.modalCard}>
            <div className="modal-header">
              <h3>Makbuz İşlem Detayı</h3>
              <button className="btn-close" onClick={() => setSelectedTx(null)}>
                <X size={18} />
              </button>
            </div>
            
            <div style={styles.modalBody}>
              <div style={styles.modalMeta}>
                <div style={styles.metaRow}>
                  <strong>Kullanıcı E-Posta:</strong>
                  <span>{selectedTx.userEmail}</span>
                </div>
                <div style={styles.metaRow}>
                  <strong>Apple Transaction ID:</strong>
                  <code>{selectedTx.transactionId}</code>
                </div>
                <div style={styles.metaRow}>
                  <strong>Ürün Paket Kimliği:</strong>
                  <code>{selectedTx.productId}</code>
                </div>
                <div style={styles.metaRow}>
                  <strong>Satın Alma Tarihi:</strong>
                  <span>{new Date(selectedTx.purchaseDate).toLocaleString('tr-TR')}</span>
                </div>
                <div style={styles.metaRow}>
                  <strong>Ortam:</strong>
                  <span>{selectedTx.environment}</span>
                </div>
              </div>

              <div style={{ marginTop: '16px' }}>
                <strong style={{ display: 'block', marginBottom: '6px', fontSize: '12px', color: 'rgba(255,255,255,0.5)' }}>
                  Ham İşlem Detayı (Raw Payload):
                </strong>
                <div style={styles.rawViewer}>
                  <pre style={styles.rawPre}>
                    {(() => {
                      try {
                        const parsed = JSON.parse(selectedTx.rawPayload || '{}');
                        return JSON.stringify(parsed, null, 2);
                      } catch (_) {
                        return selectedTx.rawPayload || '{}';
                      }
                    })()}
                  </pre>
                </div>
              </div>
            </div>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column',
    gap: '16px'
  },
  kpiGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(280px, 1fr))',
    gap: '16px'
  },
  kpiCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px',
    padding: '20px'
  },
  kpiIcon: {
    width: '46px',
    height: '46px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  kpiBody: {
    display: 'flex',
    flexDirection: 'column'
  },
  kpiTitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.5)',
    fontWeight: '600',
    textTransform: 'uppercase',
    letterSpacing: '0.5px'
  },
  kpiValue: {
    fontSize: '22px',
    fontWeight: '800',
    margin: '2px 0',
    color: '#FFF'
  },
  kpiSubtitle: {
    fontSize: '10px',
    color: 'rgba(255,255,255,0.35)'
  },
  filterCard: {
    padding: '12px 20px',
  },
  filterBar: {
    display: 'flex',
    flexWrap: 'wrap',
    alignItems: 'center',
    justifyContent: 'space-between',
    gap: '16px'
  },
  filterGroup: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px'
  },
  selectInput: {
    background: 'rgba(255, 255, 255, 0.02)',
    border: '1px solid rgba(255, 255, 255, 0.06)',
    borderRadius: '10px',
    padding: '8px 16px',
    color: '#FFF',
    fontSize: '13px',
    outline: 'none',
    cursor: 'pointer'
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden'
  },
  loadingCell: {
    textAlign: 'center',
    padding: '32px',
    color: 'rgba(255, 255, 255, 0.4)',
    fontSize: '13px'
  },
  activeBadge: {
    boxShadow: '0 0 10px rgba(0, 230, 118, 0.25)',
    border: '1px solid rgba(0, 230, 118, 0.4)'
  },
  proTier: {
    color: '#6B4EFF',
    fontWeight: 'bold',
    fontSize: '12px',
    background: 'rgba(107,78,255,0.12)',
    padding: '4px 8px',
    borderRadius: '6px'
  },
  premiumTier: {
    color: '#FFD700',
    fontWeight: 'bold',
    fontSize: '12px',
    background: 'rgba(255,215,0,0.08)',
    padding: '4px 8px',
    borderRadius: '6px',
    textShadow: '0 0 8px rgba(255,215,0,0.2)'
  },
  sandboxBadge: {
    background: 'rgba(255,153,0,0.12)', 
    color: '#FF9900',
    border: '1px solid rgba(255,153,0,0.2)'
  },
  productionBadge: {
    background: 'rgba(0,230,118,0.12)', 
    color: '#00E676',
    border: '1px solid rgba(0,230,118,0.2)'
  },
  modalCard: {
    width: '560px'
  },
  modalBody: {
    display: 'flex',
    flexDirection: 'column',
    gap: '12px'
  },
  modalMeta: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
    padding: '16px',
    borderRadius: '12px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.04)'
  },
  metaRow: {
    display: 'flex',
    justifyContent: 'space-between',
    fontSize: '13px',
    borderBottom: '1px solid rgba(255,255,255,0.02)',
    paddingBottom: '6px'
  },
  rawViewer: {
    background: '#040308',
    border: '1px solid rgba(255,255,255,0.05)',
    borderRadius: '10px',
    padding: '14px',
    maxHeight: '200px',
    overflowY: 'auto'
  },
  rawPre: {
    fontFamily: 'Courier New, monospace',
    fontSize: '11px',
    color: '#00E676',
    whiteSpace: 'pre-wrap',
    margin: 0
  }
};

export default Subscriptions;
