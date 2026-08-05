import React, { useState } from 'react';
import { ShieldCheck, Mail, Lock } from 'lucide-react';

function Login({ onLoginSuccess }) {
  const [email, setEmail] = useState('admin@template.com');
  const [password, setPassword] = useState('Admin123!');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    try {
      const response = await fetch('/api/v1/auth/login', {
        method: 'POST',
        headers: { 'Content-Type': 'application/json' },
        body: JSON.stringify({ email, password })
      });

      const result = await response.json();
      if (!response.ok || !result.success) {
        throw new Error(result.message || 'Giriş başarısız.');
      }

      const token = result.data.token;
      
      // Rol doğrulaması yap
      const claimsResponse = await fetch('/api/v1/auth/claims', {
        headers: { 'Authorization': `Bearer ${token}` }
      });
      const claimsResult = await claimsResponse.json();

      if (claimsResult.success && claimsResult.data.includes('Admin')) {
        onLoginSuccess(token);
      } else {
        throw new Error('Erişim engellendi. Bu panele giriş yapabilmek için Admin rolüne sahip olmalısınız.');
      }

    } catch (err) {
      setError(err.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.loginWrapper}>
      <div className="glass-card" style={styles.loginCard}>
        <div style={styles.loginHeader}>
          <ShieldCheck size={40} style={styles.brandIcon} />
          <h2 style={styles.loginTitle}>Control Center</h2>
          <p style={styles.loginSubtitle}>Yönetici kimlik bilgilerinizle giriş yapın</p>
        </div>
        <form onSubmit={handleSubmit}>
          <div className="input-group">
            <label>E-Posta</label>
            <div className="input-with-icon">
              <Mail size={16} />
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="admin@template.com" 
              />
            </div>
          </div>
          <div className="input-group">
            <label>Şifre</label>
            <div className="input-with-icon">
              <Lock size={16} />
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="••••••••" 
              />
            </div>
          </div>
          <button type="submit" disabled={loading} className="btn btn-primary btn-block">
            {loading ? 'Giriş Yapılıyor...' : 'Giriş Yap'}
          </button>
        </form>
        {error && <div className="error-banner">{error}</div>}
      </div>
    </div>
  );
}

const styles = {
  loginWrapper: {
    position: 'fixed',
    top: 0,
    left: 0,
    width: '100%',
    height: '100%',
    background: 'linear-gradient(135deg, #090615 0%, #030206 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    zIndex: 1000
  },
  loginCard: {
    width: '380px',
    boxShadow: '0 20px 50px rgba(0,0,0,0.5)',
    padding: '36px'
  },
  loginHeader: {
    textAlign: 'center',
    marginBottom: '26px'
  },
  brandIcon: {
    color: '#E24EFF',
    filter: 'drop-shadow(0 0 10px rgba(226, 78, 255, 0.4))',
    marginBottom: '10px'
  },
  loginTitle: {
    fontSize: '24px',
    fontWeight: '700',
    marginBottom: '4px'
  },
  loginSubtitle: {
    color: 'rgba(255, 255, 255, 0.6)',
    fontSize: '12px'
  }
};

export default Login;
