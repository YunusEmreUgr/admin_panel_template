import React, { useState, useEffect } from 'react';
import { Plus, Edit3, Trash2, X } from 'lucide-react';

function Products({ apiFetch, token }) {
  const [products, setProducts] = useState([]);
  const [loading, setLoading] = useState(true);

  // Modal states
  const [modalOpen, setModalOpen] = useState(false);
  const [modalMode, setModalMode] = useState('add'); // 'add' or 'edit'
  const [productId, setProductId] = useState('');
  const [name, setName] = useState('');
  const [description, setDescription] = useState('');
  const [price, setPrice] = useState('');
  const [stock, setStock] = useState('');
  const [categoryId, setCategoryId] = useState('1');

  useEffect(() => {
    loadProducts();
  }, []);

  const loadProducts = async () => {
    setLoading(true);
    const data = await apiFetch('/products');
    if (data) {
      setProducts(data);
    }
    setLoading(false);
  };

  const handleOpenAdd = () => {
    setModalMode('add');
    setProductId('');
    setName('');
    setDescription('');
    setPrice('');
    setStock('');
    setCategoryId('1');
    setModalOpen(true);
  };

  const handleOpenEdit = (p) => {
    setModalMode('edit');
    setProductId(p.productId);
    setName(p.name);
    setDescription(p.description);
    setPrice(p.price);
    setStock(p.stock);
    setCategoryId(p.categoryId.toString());
    setModalOpen(true);
  };

  const handleDelete = async (id) => {
    if (!confirm('Bu ürünü silmek istediğinize emin misiniz?')) return;
    try {
      const response = await fetch(`/api/v1/products/${id}`, {
        method: 'DELETE',
        headers: { 'Authorization': `Bearer ${token}` }
      });
      if (response.ok) {
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    const payload = {
      name,
      description,
      price: parseFloat(price),
      stock: parseInt(stock),
      categoryId: parseInt(categoryId)
    };

    if (modalMode === 'edit') {
      payload.productId = productId;
    }

    try {
      const response = await fetch('/api/v1/products', {
        method: modalMode === 'edit' ? 'PUT' : 'POST',
        headers: {
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${token}`
        },
        body: JSON.stringify(payload)
      });

      if (response.ok) {
        setModalOpen(false);
        loadProducts();
      }
    } catch (err) {
      console.error(err);
    }
  };

  return (
    <div style={styles.container}>
      <div className="glass-card" style={styles.tableCard}>
        <div style={styles.tableActions}>
          <button className="btn btn-primary" onClick={handleOpenAdd}>
            <Plus size={16} />
            <span>Yeni Ürün Ekle</span>
          </button>
        </div>

        <div className="table-responsive">
          <table className="admin-table">
            <thead>
              <tr>
                <th>ID</th>
                <th>Ürün Adı</th>
                <th>Açıklama</th>
                <th>Fiyat</th>
                <th>Stok</th>
                <th>Kategori ID</th>
                <th className="actions-col">İşlemler</th>
              </tr>
            </thead>
            <tbody>
              {loading ? (
                <tr>
                  <td colSpan="7" style={styles.loadingCell}>Yükleniyor...</td>
                </tr>
              ) : products.length === 0 ? (
                <tr>
                  <td colSpan="7" style={styles.loadingCell}>Ürün bulunmamaktadır.</td>
                </tr>
              ) : (
                products.map(p => (
                  <tr key={p.productId}>
                    <td>{p.productId}</td>
                    <td><strong>{p.name}</strong></td>
                    <td>{p.description}</td>
                    <td>₺{p.price.toLocaleString('tr-TR', { minimumFractionDigits: 2 })}</td>
                    <td>{p.stock}</td>
                    <td>{p.categoryId}</td>
                    <td className="actions-col">
                      <button 
                        className="btn btn-icon" 
                        title="Düzenle" 
                        onClick={() => handleOpenEdit(p)}
                        style={{ marginRight: '6px' }}
                      >
                        <Edit3 size={14} />
                      </button>
                      <button 
                        className="btn btn-icon" 
                        title="Sil" 
                        onClick={() => handleDelete(p.productId)}
                      >
                        <Trash2 size={14} className="text-error" />
                      </button>
                    </td>
                  </tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </div>

      {/* Modal Dialog */}
      {modalOpen && (
        <div className="modal-wrapper">
          <div className="modal-card">
            <div className="modal-header">
              <h3>{modalMode === 'edit' ? 'Ürünü Düzenle' : 'Yeni Ürün Ekle'}</h3>
              <button className="btn-close" onClick={() => setModalOpen(false)}>
                <X size={18} />
              </button>
            </div>
            <form onSubmit={handleSubmit}>
              <div className="input-group">
                <label>Ürün Adı</label>
                <input 
                  type="text" 
                  value={name} 
                  onChange={(e) => setName(e.target.value)} 
                  required 
                  placeholder="Örn: Premium Bulut Sunucu" 
                />
              </div>
              <div className="input-group">
                <label>Açıklama</label>
                <textarea 
                  value={description} 
                  onChange={(e) => setDescription(e.target.value)} 
                  required 
                  placeholder="Ürün özellikleri..."
                  style={{ height: '80px', fontFamily: 'inherit' }}
                />
              </div>
              <div className="row">
                <div className="col input-group">
                  <label>Fiyat (TL)</label>
                  <input 
                    type="number" 
                    step="0.01" 
                    value={price} 
                    onChange={(e) => setPrice(e.target.value)} 
                    required 
                    placeholder="0.00" 
                  />
                </div>
                <div className="col input-group">
                  <label>Stok Adedi</label>
                  <input 
                    type="number" 
                    value={stock} 
                    onChange={(e) => setStock(e.target.value)} 
                    required 
                    placeholder="0" 
                  />
                </div>
              </div>
              <div className="input-group">
                <label>Kategori ID</label>
                <input 
                  type="number" 
                  value={categoryId} 
                  onChange={(e) => setCategoryId(e.target.value)} 
                  required 
                />
              </div>
              <button type="submit" className="btn btn-primary btn-block">Kaydet</button>
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
  },
  loadingCell: {
    textAlign: 'center',
    padding: '24px',
    color: 'rgba(255, 255, 255, 0.4)'
  }
};

export default Products;
