import React, { useState, useEffect } from 'react';
import { Search, UserCheck, UserX, UserSquare, ShieldAlert, X } from 'lucide-react';

function Users({ apiFetch, token }) {
  const [users, setUsers] = useState([]);
  const [totalCount, setTotalCount] = useState(0);
  const [page, setPage] = useState(1);
  const [pageSize] = useState(10);
  const [search, setSearch] = useState('');
  const [loading, setLoading] = useState(true);

  // Modal states
  const [selectedUser, setSelectedUser] = useState(null);
  const [modalOpen, setModalOpen] = useState(false);
  const [claimsInput, setClaimsInput] = useState({
    Admin: false,
    Moderator: false,
    Premium: false,
    User: false
  });

  useEffect(() => {
    loadUsers();
  }, [page, search]);

  const loadUsers = async () => {
    setLoading(true);
    const data = await apiFetch(`/admin/users?pageNumber=${page}&pageSize=${pageSize}&search=${search}`);
    if (data) {
      setUsers(data.items);
      setTotalCount(data.totalCount);
    }
    setLoading(false);
  };

  const handleStatusToggle = async (userId, newStatus) => {
    try {
      const response = await fetch(`/api/v1/admin/users/${userId}/status`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ status: newStatus })
      });
      if (response.ok) {
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const openClaimsEdit = (user) => {
    setSelectedUser(user);
    setClaimsInput({
      Admin: user.claims.includes('Admin'),
      Moderator: user.claims.includes('Moderator'),
      Premium: user.claims.includes('Premium'),
      User: user.claims.includes('User')
    });
    setModalOpen(true);
  };

  const handleClaimsSubmit = async (e) => {
    e.preventDefault();
    const claimNames = Object.keys(claimsInput).filter(key => claimsInput[key]);

    try {
      const response = await fetch(`/api/v1/admin/users/${selectedUser.userId}/claims`, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify({ claimNames })
      });
      if (response.ok) {
        setModalOpen(false);
        loadUsers();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const startRecord = (page - 1) * pageSize + 1;
  const endRecord = Math.min(page * pageSize, totalCount);

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableActions}>
          <div className="search-box">
            <Search size={16} />
            <input
              type="text"
              placeholder="İsim veya e-posta arayın..."
              value={search}
              onChange={(e) => {
                setSearch(e.target.value);
                setPage(1);
              }}
            />
          </div>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Kullanıcı Bilgileri</th>
                <th>Kayıt Tarihi</th>
                <th>Roller</th>
                <th>Durum</th>
                <th className="actions-col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' }}>
                    Yükleniyor...
                  </td>
                </tr>
              ) : users.length === 0 ? (
                <tr>
                  <td colSpan="6" style={{ textAlign: 'center', padding: '24px', color: 'rgba(255,255,255,0.4)' }}>
                    Eşleşen kullanıcı bulunamadı.
                  </td>
                </tr>
              ) : (
                users.map(user => {
                  const date = new Date(user.createdAt);
                  const dateStr = `${date.getDate()}/${date.getMonth() + 1}/${date.getFullYear()}`;
                  return (
                    <tr key={user.userId}>
                      <td>{user.userId}</td>
                      <td>
                        <div style={{ fontWeight: 600 }}>{user.firstName} {user.lastName}</div>
                        <div style={{ color: 'rgba(255,255,255,0.4)', fontSize: '11px' }}>{user.email}</div>
                      </td>
                      <td>{dateStr}</td>
                      <td>
                        {user.claims.map(c => (
                          <span key={c} className="badge badge-claim">{c}</span>
                        ))}
                      </td>
                      <td>
                        {user.status ? (
                          <span className="badge badge-active">Aktif</span>
                        ) : (
                          <span className="badge badge-inactive">Engelli</span>
                        )}
                      </td>
                      <td className="actions-col">
                        <button
                          className="btn btn-icon"
                          title="Yetkileri Düzenle"
                          onClick={() => openClaimsEdit(user)}
                          style={{ marginRight: '6px' }}
                        >
                          <UserSquare size={14} />
                        </button>
                        <button
                          className="btn btn-icon"
                          title={user.status ? 'Kullanıcıyı Engelle' : 'Kullanıcıyı Aktifleştir'}
                          onClick={() => handleStatusToggle(user.userId, !user.status)}
                        >
                          {user.status ? <UserX size={14} className="text-error" /> : <UserCheck size={14} className="text-success" />}
                        </button>
                      </td>
                    </tr>
                  );
                })
              )}
            </tbody>
          </table>
        </div>

        <div className="table-pagination">
          <span>{totalCount > 0 ? startRecord : 0} - {endRecord} / {totalCount} kayıt</span>
          <div className="pagination-buttons">
            <button
              className="btn btn-icon"
              disabled={page === 1}
              onClick={() => setPage(p => p - 1)}
            >
              &lt;
            </button>
            <button
              className="btn btn-icon"
              disabled={endRecord >= totalCount}
              onClick={() => setPage(p => p + 1)}
            >
              &gt;
            </button>
          </div>
        </div>
      </div>

      {/* Claims Modal */}
      {modalOpen && (
        <div className="modal-wrapper">
          <div className="modal-card">
            <div className="modal-header">
              <h3>Yetki ve Rolleri Güncelle</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <p style={{ fontSize: '13px', color: 'rgba(255,255,255,0.65)', marginBottom: '16px' }}>
              Düzenlenen Kullanıcı: <strong style={{ color: 'white' }}>{selectedUser.email}</strong>
            </p>
            <form onSubmit={handleClaimsSubmit}>
              <div className="checkbox-group">
                {Object.keys(claimsInput).map(role => (
                  <label key={role} className="checkbox-label">
                    <input
                      type="checkbox"
                      checked={claimsInput[role]}
                      onChange={(e) => setClaimsInput(c => ({ ...c, [role]: e.target.checked }))}
                    />
                    <span>{role} Yetkisi</span>
                  </label>
                ))}
              </div>
              <button type="submit" className="btn btn-primary btn-block">Yetkileri Kaydet</button>
            </form>
          </div>
        </div>
      )}
    </div>
  );
}

const styles = {
  container: {
    display: 'flex',
    flexDirection: 'column'
  },
  tableCard: {
    padding: 0,
    overflow: 'hidden'
  },
  tableActions: {
    padding: '16px 20px',
    borderBottom: '1px solid rgba(255, 255, 255, 0.06)'
  }
};

export default Users;
