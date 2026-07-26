import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, Search, X, CheckCircle, XCircle, Clock } from 'lucide-react';
import { addBooking, updateBookingStatus } from '../store';

const statusColor = { confirmed: 'green', pending: 'amber', overdue: 'red', completed: 'blue' };

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

export default function Bookings() {
  const { bookings, setBookings, equipment, users, addNotification, currentUser } = useApp();
  const [tab, setTab] = useState('All Bookings');
  const [search, setSearch] = useState('');
  const isStaff = currentUser?.role === 'staff';
  const [showModal, setShowModal] = useState(false);
  const [form, setForm] = useState({ equipmentId: '', userId: '', fromDate: '', toDate: '', notes: '' });

  const tabs = ['All Bookings', 'My Bookings', 'History'];

  const myBookingsOnly = currentUser?.role === 'borrower';
  const filtered = bookings
    .filter(b => !myBookingsOnly || b.userId === currentUser.id)
    .filter(b => {
      const matchSearch = b.equipmentName?.toLowerCase().includes(search.toLowerCase()) || b.userName?.toLowerCase().includes(search.toLowerCase());
      if (tab === 'History') return matchSearch && b.status === 'completed';
      if (tab === 'My Bookings') return matchSearch && b.status !== 'completed';
      return matchSearch;
    });

  const handleAdd = async () => {
    if (!form.equipmentId || !form.userId || !form.fromDate || !form.toDate) {
      alert('Please fill all required fields'); return;
    }
    const eq = equipment.find(e => e.id === form.equipmentId);
    const user = users.find(u => u.id === form.userId);
    const booking = await addBooking({
      ...form,
      equipmentName: eq?.name ?? '',
      userName: user?.name ?? '',
      status: 'pending'
    });
    setBookings(prev => [...prev, booking]);
    addNotification({ type: 'confirmed', message: `Booking for ${eq?.name} submitted` }, currentUser?.id);
    setShowModal(false);
    setForm({ equipmentId: '', userId: '', fromDate: '', toDate: '', notes: '' });
  };

  const handleStatus = async (id, status) => {
    const bookingItem = bookings.find(b => b.id === id);
    await updateBookingStatus(id, status);
    setBookings(prev => prev.map(b => b.id === id ? { ...b, status } : b));
    addNotification({ type: status === 'confirmed' ? 'confirmed' : 'reminder', message: status === 'confirmed' ? 'Booking confirmed' : 'Booking updated' }, bookingItem?.userId || currentUser?.id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Bookings</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> New Booking</button>
      </div>

      <div className="filters">
        <div className="tab-group">
          {tabs.map(t => <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>)}
        </div>
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search bookings..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
      </div>
      <div className="page-header">
        <h2>{isStaff ? 'Bookings' : 'My Bookings'}</h2>
      </div>

      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Borrower</th>
                <th>From</th>
                <th>To</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(b => (
                <tr key={b.id}>
                  <td><strong>{b.equipmentName}</strong></td>
                  <td>{b.userName}</td>
                  <td>{b.fromDate}</td>
                  <td>{b.toDate}</td>
                  <td><span className={`badge ${statusColor[b.status] ?? 'amber'}`}>{b.status}</span></td>
                  <td>
                    <div className="action-btns">
                      {isStaff ? (
                        b.status === 'pending' ? (
                          <>
                            <button className="icon-btn success" title="Confirm" onClick={() => handleStatus(b.id, 'confirmed')}><CheckCircle size={15} /></button>
                            <button className="icon-btn danger" title="Reject" onClick={() => handleStatus(b.id, 'completed')}><XCircle size={15} /></button>
                          </>
                        ) : b.status === 'confirmed' ? (
                          <button className="icon-btn" title="Mark Returned" onClick={() => handleStatus(b.id, 'completed')}><Clock size={15} /></button>
                        ) : null
                      ) : (
                        <span className={`badge ${statusColor[b.status] ?? 'amber'}`}>{b.status}</span>
                      )}
                    </div>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty">No bookings found</div>}
        </div>
        <div className="table-footer">
          Showing {filtered.length} of {bookings.length} bookings
        </div>
      </div>

      {showModal && (
        <Modal title="New Booking" onClose={() => setShowModal(false)}>
          <div className="modal-body">
            <div className="form-field">
              <label>Equipment *</label>
              <select value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
                <option value="">Select equipment</option>
                {equipment.filter(e => e.status === 'available').map(e => <option key={e.id} value={e.id}>{e.name}</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>Borrower *</label>
              <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
                <option value="">Select user</option>
                {users.filter(u => u.role === 'borrower').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>From *</label>
                <input type="date" value={form.fromDate} onChange={e => setForm(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>To *</label>
                <input type="date" value={form.toDate} onChange={e => setForm(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-field">
              <label>Notes</label>
              <textarea rows={3} value={form.notes} onChange={e => setForm(f => ({ ...f, notes: e.target.value }))} placeholder="Purpose of booking..." />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleAdd}>Create Booking</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
