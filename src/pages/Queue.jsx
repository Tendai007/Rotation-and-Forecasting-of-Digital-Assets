import React, { useState } from 'react';
import { useApp } from '../App';
import { Plus, X, Trash2, ArrowUp } from 'lucide-react';
import { joinQueue, removeFromQueue } from '../store';

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

export default function Queue() {
  const { queue, setQueue, equipment, users, addNotification, currentUser } = useApp();
  const [showModal, setShowModal] = useState(false);
  const [tab, setTab] = useState('My Queue');
  const [form, setForm] = useState({ equipmentId: '', userId: currentUser?.id || '' });
  const isStaff = currentUser?.role === 'staff';

  const filteredQueue = isStaff ? queue : queue.filter(q => q.userId === currentUser?.id);
  const grouped = equipment
    .filter(e => filteredQueue.some(q => q.equipmentId === e.id))
    .map(e => ({ ...e, queueItems: filteredQueue.filter(q => q.equipmentId === e.id).sort((a, b) => a.position - b.position) }));

  const handleJoin = async () => {
    if (!form.equipmentId || !form.userId) { alert('Please fill all fields'); return; }
    const eq = equipment.find(e => e.id === form.equipmentId);
    const user = users.find(u => u.id === form.userId);
    const existing = queue.filter(q => q.equipmentId === form.equipmentId);
    const item = await joinQueue({
      equipmentId: form.equipmentId,
      equipmentName: eq?.name ?? '',
      userId: form.userId,
      userName: user?.name ?? '',
      position: existing.length + 1,
      estimatedWait: `${(existing.length + 1) * 2} Days`,
    });
    setQueue(prev => [...prev, item]);
    addNotification({ type: 'queue', message: `Joined queue for ${eq?.name}` }, form.userId || currentUser?.id);
    setShowModal(false);
  };

  const handleRemove = async (id, name) => {
    if (!confirm(`Remove from queue?`)) return;
    await removeFromQueue(id);
    setQueue(prev => prev.filter(q => q.id !== id));
    addNotification({ type: 'reminder', message: `Removed from queue for ${name}` }, currentUser?.id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Queue Management</h2>
        <button className="btn-primary" onClick={() => setShowModal(true)}><Plus size={16} /> Join Queue</button>
      </div>

      <div className="filters">
        <div className="tab-group">
          {['My Queue', 'All Queues'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="queue-stats">
        <div className="card qs-stat">
          <div className="qs-num">{queue.length}</div>
          <div className="qs-lbl">Total in Queue</div>
        </div>
        <div className="card qs-stat">
          <div className="qs-num">{grouped.length}</div>
          <div className="qs-lbl">Items with Queues</div>
        </div>
        <div className="card qs-stat">
          <div className="qs-num">2.4</div>
          <div className="qs-lbl">Avg Wait (Days)</div>
        </div>
      </div>

      {grouped.length === 0 ? (
        <div className="card empty-state">
          <p>No active queues. Equipment is available for direct booking.</p>
          <button className="btn-primary" onClick={() => setShowModal(true)}>Join a Queue</button>
        </div>
      ) : (
        grouped.map(group => (
          <div key={group.id} className="card queue-group">
            <div className="queue-group-header">
              <h3>{group.name}</h3>
              <span className="badge amber">{group.queueItems.length} waiting</span>
            </div>
            <div className="queue-group-body">
              {group.queueItems.map((q, i) => (
                <div key={q.id} className={`queue-item-row ${i === 0 ? 'first' : ''}`}>
                  <span className="q-position">{i + 1}</span>
                  <div className="q-info">
                    <span className="q-name">{q.userName}</span>
                    {i === 0 && <span className="badge green next-badge">Next Up</span>}
                  </div>
                  <span className="q-joined">{q.joinedAt}</span>
                  <span className="q-wait-chip">{q.estimatedWait}</span>
                  <div className="action-btns">
                    {i === 0 && <button className="icon-btn success" title="Move to booking"><ArrowUp size={14} /></button>}
                    <button className="icon-btn danger" title="Remove" onClick={() => handleRemove(q.id, group.name)}><Trash2 size={14} /></button>
                  </div>
                </div>
              ))}
            </div>
          </div>
        ))
      )}

      {showModal && (
        <Modal title="Join Queue" onClose={() => setShowModal(false)}>
          <div className="modal-body">
            <div className="form-field">
              <label>Equipment</label>
              <select value={form.equipmentId} onChange={e => setForm(f => ({ ...f, equipmentId: e.target.value }))}>
                <option value="">Select equipment</option>
                {equipment.filter(e => e.status !== 'available').map(e => <option key={e.id} value={e.id}>{e.name} ({e.status})</option>)}
              </select>
            </div>
            <div className="form-field">
              <label>User</label>
              <select value={form.userId} onChange={e => setForm(f => ({ ...f, userId: e.target.value }))}>
                <option value="">Select user</option>
                {users.filter(u => u.role === 'borrower').map(u => <option key={u.id} value={u.id}>{u.name}</option>)}
              </select>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleJoin}>Join Queue</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
