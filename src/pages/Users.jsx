import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Search, X, Edit, Trash2, Mail, Phone, MessageCircle } from 'lucide-react';
import { addUser } from '../store';
import { openWhatsAppChat } from '../utils/whatsapp';

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header"><h3>{title}</h3><button onClick={onClose}><X size={18} /></button></div>
        {children}
      </div>
    </div>
  );
}

export default function Users() {
  const { users, setUsers, bookings, addNotification } = useApp();
  const [search, setSearch] = useState('');
  const [showModal, setShowModal] = useState(false);
  const [showDetail, setShowDetail] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [form, setForm] = useState({ name: '', email: '', phone: '', role: 'borrower' });

  const filtered = users.filter(u =>
    u.name.toLowerCase().includes(search.toLowerCase()) ||
    u.email.toLowerCase().includes(search.toLowerCase())
  );

  const handleAdd = async () => {
    if (!form.name || !form.email) { alert('Name and email required'); return; }
    const user = await addUser(form);
    setUsers(prev => [...prev, user]);
    addNotification({ type: 'confirmed', message: `${form.name} registered` }, user.id);
    setShowModal(false);
    setForm({ name: '', email: '', phone: '', role: 'borrower' });
  };

  const handleDelete = (u) => {
    if (!confirm(`Remove ${u.name}?`)) return;
    setUsers(prev => prev.filter(x => x.id !== u.id));
    setShowDetail(false);
  };

  const openDetail = (u) => {
    setSelectedUser(u);
    setShowDetail(true);
  };

  const handleWhatsAppContact = (user) => {
    if (!user?.phone) {
      alert('This user has no phone number on file.');
      return;
    }

    const ok = openWhatsAppChat(user.phone, `Hello ${user.name}, this is Kibera Youth Centre. We are reaching out regarding your account.`);
    if (!ok) {
      alert('Unable to open WhatsApp. Please verify the phone number.');
    }
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Users</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Add User</button>
      </div>

      <div className="filters">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search users..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>

      <div className="users-grid">
        {filtered.map(u => {
          const userBookings = bookings.filter(b => b.userId === u.id);
          const active = userBookings.filter(b => b.status === 'confirmed').length;
          return (
            <div key={u.id} className="user-card" onClick={() => openDetail(u)} style={{ cursor: 'pointer' }}>
              <div className="user-card-top">
                <div className="user-card-avatar">{(u.name || '').split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
                <div>
                  <div className="user-card-name">{u.name}</div>
                  <span className={`badge ${u.role === 'staff' ? 'blue' : 'amber'}`}>{u.role}</span>
                </div>
                <div className="action-btns ml-auto">
                  <button className="icon-btn" onClick={(e) => { e.stopPropagation(); handleWhatsAppContact(u); }} title="Contact via WhatsApp"><MessageCircle size={14} /></button>
                  <button className="icon-btn danger" onClick={(e) => { e.stopPropagation(); handleDelete(u); }}><Trash2 size={14} /></button>
                </div>
              </div>
              <div className="user-card-detail"><Mail size={13} />{u.email}</div>
              <div className="user-card-detail"><Phone size={13} />{u.phone}</div>
              <div className="user-card-stats">
                <div><span>{userBookings.length}</span><small>Total</small></div>
                <div><span>{active}</span><small>Active</small></div>
                <div><span>{u.joinDate}</span><small>Joined</small></div>
              </div>
            </div>
          );
        })}
      </div>

      {showModal && (
        <Modal title="Add User" onClose={() => setShowModal(false)}>
          <div className="modal-body">
            {[
              { label: 'Full Name *', key: 'name', type: 'text' },
              { label: 'Email *', key: 'email', type: 'email' },
              { label: 'Phone', key: 'phone', type: 'tel' },
            ].map(({ label, key, type }) => (
              <div key={key} className="form-field">
                <label>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-field">
              <label>Role</label>
              <select value={form.role} onChange={e => setForm(f => ({ ...f, role: e.target.value }))}>
                <option value="borrower">Borrower</option>
                <option value="staff">Staff</option>
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Add User</button>
          </div>
        </Modal>
      )}

      {showDetail && selectedUser && (
        <Modal title={`${selectedUser.name} - Details`} onClose={() => setShowDetail(false)}>
          <div className="modal-body">
            <div style={{ display: 'flex', gap: '16px', marginBottom: '20px' }}>
              <div className="user-card-avatar" style={{ width: '64px', height: '64px', fontSize: '1.5rem' }}>{(selectedUser.name || '').split(' ').map(w => w[0]).join('').slice(0, 2)}</div>
              <div>
                <div className="user-card-name" style={{ fontSize: '1.2rem', marginBottom: '8px' }}>{selectedUser.name}</div>
                <span className={`badge ${selectedUser.role === 'staff' ? 'blue' : 'amber'}`}>{selectedUser.role}</span>
              </div>
            </div>
            <div className="form-field">
              <label>Email</label>
              <div style={{ padding: '8px', background: 'var(--surface2)', borderRadius: '6px', color: 'var(--text2)' }}>{selectedUser.email}</div>
            </div>
            <div className="form-field">
              <label>Phone</label>
              <div style={{ padding: '8px', background: 'var(--surface2)', borderRadius: '6px', color: 'var(--text2)' }}>{selectedUser.phone}</div>
            </div>
            <div className="form-field">
              <label>Member Since</label>
              <div style={{ padding: '8px', background: 'var(--surface2)', borderRadius: '6px', color: 'var(--text2)' }}>{selectedUser.joinDate}</div>
            </div>
            <div style={{ display: 'grid', gridTemplateColumns: 'repeat(3, 1fr)', gap: '12px', marginTop: '16px' }}>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface2)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--gold)' }}>{bookings.filter(b => b.userId === selectedUser.id).length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>Total Bookings</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface2)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--green2)' }}>{bookings.filter(b => b.userId === selectedUser.id && b.status === 'confirmed').length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>Active</div>
              </div>
              <div style={{ textAlign: 'center', padding: '12px', background: 'var(--surface2)', borderRadius: '6px' }}>
                <div style={{ fontSize: '1.5rem', fontWeight: '600', color: 'var(--red2)' }}>{bookings.filter(b => b.userId === selectedUser.id && b.status === 'overdue').length}</div>
                <div style={{ fontSize: '0.75rem', color: 'var(--text3)', marginTop: '4px' }}>Overdue</div>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => handleWhatsAppContact(selectedUser)}><MessageCircle size={15} /> WhatsApp</button>
            <button className="btn-secondary danger" onClick={() => { handleDelete(selectedUser); }}>Remove User</button>
            <button className="btn-secondary" onClick={() => setShowDetail(false)}>Close</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
