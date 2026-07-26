import React, { useState } from 'react';
import { useParams, useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { ArrowLeft, Laptop, Camera, Tablet, CalendarCheck, Users, Info, X } from 'lucide-react';
import { addBooking, joinQueue } from '../store';

const statusColor = { available: 'green', in_use: 'amber', overdue: 'red' };
const statusLabel = { available: 'Available', in_use: 'In Use', overdue: 'Overdue' };

const today = new Date();
const fmt = (d) => d.toISOString().split('T')[0];
const addDays = (d, n) => { const r = new Date(d); r.setDate(r.getDate() + n); return r; };

export default function EquipmentDetail() {
  const { id } = useParams();
  const { equipment, bookings, queue } = useApp();
  const navigate = useNavigate();

  const item = equipment.find(e => e.id === id);
  if (!item) return <div className="page"><button className="btn-secondary" onClick={() => navigate('/equipment')}>← Back</button><p>Item not found.</p></div>;

  const itemBookings = bookings.filter(b => b.equipmentId === id);
  const itemQueue = queue.filter(q => q.equipmentId === id);
  const Icon = item.category === 'Camera' ? Camera : item.category === 'Tablet' ? Tablet : Laptop;

  const schedule = Array.from({ length: 7 }, (_, i) => {
    const d = addDays(today, i);
    const dayStr = fmt(d);
    const booking = itemBookings.find(b => b.fromDate <= dayStr && b.toDate >= dayStr && b.status === 'confirmed');
    return { date: dayStr, label: d.toLocaleDateString('en', { month: 'short', day: 'numeric' }), status: booking ? 'booked' : 'available' };
  });

  const { setBookings, setQueue, currentUser, addNotification, users } = useApp();
  const [showBookingModal, setShowBookingModal] = useState(false);
  const [bookingForm, setBookingForm] = useState({ equipmentId: id, userId: currentUser?.id || '', fromDate: fmt(today), toDate: fmt(addDays(today, 3)), notes: '' });

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

  const handleCreateBooking = async () => {
    if (!bookingForm.userId || !bookingForm.fromDate || !bookingForm.toDate) {
      alert('Please select borrower and dates');
      return;
    }
    const user = users.find(u => u.id === bookingForm.userId) || { name: 'Guest' };
    const booking = await addBooking({
      equipmentId: id,
      equipmentName: item.name,
      userId: bookingForm.userId,
      userName: user.name,
      fromDate: bookingForm.fromDate,
      toDate: bookingForm.toDate,
      notes: bookingForm.notes,
      status: 'pending'
    });
    setBookings(prev => [booking, ...prev]);
    addNotification({ type: 'confirmed', message: `Booking requested for ${item.name}` }, bookingForm.userId || currentUser?.id);
    setShowBookingModal(false);
  };

  const handleJoinQueue = async () => {
    if (!currentUser) { alert('Please login to join queue'); return; }
    const q = await joinQueue({ equipmentId: id, equipmentName: item.name, userId: currentUser.id, userName: currentUser.name, position: (itemQueue.length || 0) + 1, estimatedWait: 'TBD' });
    setQueue(prev => [q, ...prev]);
    addNotification({ type: 'reminder', message: `Joined queue for ${item.name}` }, currentUser?.id);
  };

  return (
    <div className="page">
      <button className="back-btn" onClick={() => navigate('/equipment')}>
        <ArrowLeft size={16} /> Back to Equipment
      </button>

      <div className="detail-grid">
        {/* Left: Info */}
        <div className="card detail-main">
          <div className="detail-header">
            <div className="detail-icon"><Icon size={40} /></div>
            <div>
              <h2>{item.name}</h2>
              <span className={`badge ${statusColor[item.status]}`}>{statusLabel[item.status]}</span>
            </div>
          </div>
          <div className="detail-fields">
            <div className="detail-field"><span>Category</span><strong>{item.category}</strong></div>
            <div className="detail-field"><span>Condition</span><strong>{item.condition}</strong></div>
            <div className="detail-field"><span>Serial Number</span><strong className="mono">{item.serialNumber}</strong></div>
            <div className="detail-field"><span>Specifications</span><strong>{item.specs}</strong></div>
            <div className="detail-field"><span>Daily Rate</span><strong>{item.dailyRate ? `$${item.dailyRate}` : 'Free'}</strong></div>
            <div style={{ marginTop: 12 }}>
              <button className="btn-primary" onClick={() => setShowBookingModal(true)}><CalendarCheck size={16} /> New Booking</button>
              <button className="btn-secondary" style={{ marginLeft: 8 }} onClick={handleJoinQueue}>Join Queue</button>
            </div>
          </div>
        </div>

        {/* Right: Schedule + Queue */}
        <div className="detail-side">
          <div className="card">
            <h3 className="card-title">Availability Schedule (Next 7 Days)</h3>
            <div className="schedule-grid">
              {schedule.map(s => (
                <div key={s.date} className={`schedule-day ${s.status}`}>
                  <div>{s.label ? s.label.split(' ')[0] : ''}</div>
                  <div>{s.label ? s.label.split(' ')[1] : ''}</div>
                  <span className={`badge ${s.status === 'booked' ? 'red' : 'green'}`}>{s.status === 'booked' ? 'Booked' : 'Free'}</span>
                </div>
              ))}
            </div>
          </div>

          {itemQueue.length > 0 && (
            <div className="card">
              <h3 className="card-title">Queue ({itemQueue.length})</h3>
              {itemQueue.map((q, i) => (
                <div key={q.id} className="queue-row">
                  <span className="q-num">{i + 1}</span>
                  <span>{q.userName}</span>
                  <span className="q-wait">{q.estimatedWait}</span>
                </div>
              ))}
            </div>
          )}

          <div className="card">
            <h3 className="card-title">Booking History</h3>
            {itemBookings.length === 0 ? <p className="muted">No bookings yet</p> : itemBookings.slice(0, 5).map(b => (
              <div key={b.id} className="history-row">
                <div>
                  <div className="history-user">{b.userName}</div>
                  <div className="muted">{b.fromDate} → {b.toDate}</div>
                </div>
                <span className={`badge ${statusColor[b.status] ?? 'amber'}`}>{b.status}</span>
              </div>
            ))}
          </div>
        </div>
      </div>
      {showBookingModal && (
        <Modal title={`New booking — ${item.name}`} onClose={() => setShowBookingModal(false)}>
          <div className="modal-body">
            <div className="form-field">
              <label>Borrower</label>
              <select value={bookingForm.userId} onChange={e => setBookingForm(f => ({ ...f, userId: e.target.value }))}>
                <option value="">Select borrower</option>
                {users.filter(u => u.role === 'borrower').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
            <div className="form-row">
              <div className="form-field">
                <label>From</label>
                <input type="date" value={bookingForm.fromDate} onChange={e => setBookingForm(f => ({ ...f, fromDate: e.target.value }))} />
              </div>
              <div className="form-field">
                <label>To</label>
                <input type="date" value={bookingForm.toDate} onChange={e => setBookingForm(f => ({ ...f, toDate: e.target.value }))} />
              </div>
            </div>
            <div className="form-field">
              <label>Notes</label>
              <textarea rows={3} value={bookingForm.notes} onChange={e => setBookingForm(f => ({ ...f, notes: e.target.value }))} />
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowBookingModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleCreateBooking}>Request Booking</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
