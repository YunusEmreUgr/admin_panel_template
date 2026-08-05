import React, { useState, useEffect } from 'react';
import Chart from 'react-apexcharts';
import { Users, Star, Wallet, Boxes, TrendingUp } from 'lucide-react';

function Dashboard({ apiFetch }) {
  const [stats, setStats] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadStats();
  }, []);

  const loadStats = async () => {
    setLoading(true);
    const data = await apiFetch('/admin/stats');
    if (data) {
      setStats(data);
    }
    setLoading(false);
  };

  if (loading || !stats) {
    return <div style={{ color: 'rgba(255,255,255,0.6)' }}>Yükleniyor...</div>;
  }

  // Chart setup
  const chartCategories = stats.salesData.map(d => d.month);
  const chartSales = stats.salesData.map(d => d.sales);

  const chartOptions = {
    chart: {
      id: 'mrr-chart',
      toolbar: { show: false },
      background: 'transparent',
      foreColor: 'rgba(255, 255, 255, 0.4)'
    },
    colors: ['#E24EFF'],
    stroke: { curve: 'smooth', width: 3 },
    fill: {
      type: 'gradient',
      gradient: {
        shadeIntensity: 1,
        opacityFrom: 0.45,
        opacityTo: 0.05,
        stops: [0, 100]
      }
    },
    xaxis: { categories: chartCategories },
    grid: { borderColor: 'rgba(255, 255, 255, 0.06)' },
    dataLabels: { enabled: false },
    tooltip: { theme: 'dark' }
  };

  const chartSeries = [{
    name: 'MRR (TL)',
    data: chartSales
  }];

  return (
    <div style={styles.dashboardContainer}>
      {/* Stats Cards */}
      <div style={styles.statsGrid}>
        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(107, 78, 255, 0.15)', color: '#6B4EFF' }}>
            <Users size={22} />
          </div>
          <div style={styles.statBody}>
            <span style={styles.statTitle}>Toplam Üye</span>
            <span style={styles.statValue}>{stats.totalUsers}</span>
            <span style={styles.statTrend}><TrendingUp size={12} /> +12% bu ay</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(226, 78, 255, 0.15)', color: '#E24EFF' }}>
            <Star size={22} />
          </div>
          <div style={styles.statBody}>
            <span style={styles.statTitle}>Aktif Abonelik</span>
            <span style={styles.statValue}>{stats.activeSubscriptions}</span>
            <span style={styles.statTrend}><TrendingUp size={12} /> +8% bu ay</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(0, 230, 118, 0.15)', color: '#00E676' }}>
            <Wallet size={22} />
          </div>
          <div style={styles.statBody}>
            <span style={styles.statTitle}>Tahmini MRR</span>
            <span style={styles.statValue}>₺{stats.mrr.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</span>
            <span style={styles.statTrend}><TrendingUp size={12} /> +15% bu ay</span>
          </div>
        </div>

        <div className="glass-card" style={styles.statCard}>
          <div style={{ ...styles.statIcon, background: 'rgba(255, 214, 0, 0.15)', color: '#FFD600' }}>
            <Boxes size={22} />
          </div>
          <div style={styles.statBody}>
            <span style={styles.statTitle}>Katalog Ürün</span>
            <span style={styles.statValue}>{stats.totalProducts}</span>
            <span style={styles.statTrendNeutral}>Sabit</span>
          </div>
        </div>
      </div>

      {/* Graphs & Recents Grid */}
      <div style={styles.dashboardGrid}>
        <div className="glass-card" style={styles.chartCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>MRR Büyüme Analizi (Son 6 Ay)</h4>
          </div>
          <div style={{ marginTop: '16px' }}>
            <Chart options={chartOptions} series={chartSeries} type="area" height={280} />
          </div>
        </div>

        <div className="glass-card" style={styles.recentCard}>
          <div style={styles.cardHeader}>
            <h4 style={styles.cardTitle}>Son Kayıt Olan Üyeler</h4>
          </div>
          <div style={styles.recentList}>
            {stats.recentUsers.map(user => {
              const date = new Date(user.createdAt);
              const dateStr = `${date.getDate()} ${date.toLocaleString('tr-TR', { month: 'short' })} ${date.getFullYear()}`;
              return (
                <div key={user.userId} style={styles.recentItem}>
                  <div>
                    <h5 style={styles.recentName}>{user.firstName} {user.lastName}</h5>
                    <span style={styles.recentEmail}>{user.email}</span>
                  </div>
                  <span style={styles.recentDate}>{dateStr}</span>
                </div>
              );
            })}
          </div>
        </div>
      </div>
    </div>
  );
}

const styles = {
  dashboardContainer: {
    display: 'flex',
    flexDirection: 'column',
    gap: '24px'
  },
  statsGrid: {
    display: 'grid',
    gridTemplateColumns: 'repeat(auto-fit, minmax(220px, 1fr))',
    gap: '20px'
  },
  statCard: {
    display: 'flex',
    alignItems: 'center',
    gap: '20px'
  },
  statIcon: {
    width: '50px',
    height: '50px',
    borderRadius: '12px',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center'
  },
  statBody: {
    display: 'flex',
    flexDirection: 'column'
  },
  statTitle: {
    fontSize: '11px',
    color: 'rgba(255, 255, 255, 0.6)',
    fontWeight: '500'
  },
  statValue: {
    fontSize: '24px',
    fontWeight: '800',
    margin: '2px 0'
  },
  statTrend: {
    fontSize: '10px',
    fontWeight: '600',
    color: '#00E676',
    display: 'flex',
    alignItems: 'center',
    gap: '3px'
  },
  statTrendNeutral: {
    fontSize: '10px',
    fontWeight: '600',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  dashboardGrid: {
    display: 'grid',
    gridTemplateColumns: '2fr 1fr',
    gap: '24px'
  },
  chartCard: {
    display: 'flex',
    flexDirection: 'column'
  },
  recentCard: {
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
  recentList: {
    display: 'flex',
    flexDirection: 'column',
    gap: '10px',
    marginTop: '16px'
  },
  recentItem: {
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: '10px 12px',
    borderRadius: '10px',
    background: 'rgba(255,255,255,0.01)',
    border: '1px solid rgba(255,255,255,0.03)'
  },
  recentName: {
    fontSize: '12px',
    fontWeight: '600'
  },
  recentEmail: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.4)'
  },
  recentDate: {
    fontSize: '10px',
    color: 'rgba(255, 255, 255, 0.6)'
  }
};

export default Dashboard;
