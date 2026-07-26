import React from 'react';
import { useApp } from '../App';
import { Bell, AlertTriangle, CheckCircle, Clock, ListOrdered, Check, Trash2 } from 'lucide-react';

const typeIcon = { reminder: Clock, overdue: AlertTriangle, confirmed: CheckCircle, queue: ListOrdered };
const typeColor = { reminder: 'amber', overdue: 'red', confirmed: 'green', queue: 'blue' };

export default function Notifications() {
  const { notifications, setNotifications } = useApp();

  const markRead = (id) => setNotifications(prev => prev.map(n => n.id === id ? { ...n, read: true } : n));
  const markAllRead = () => setNotifications(prev => prev.map(n => ({ ...n, read: true })));
  const deleteNotif = (id) => setNotifications(prev => prev.filter(n => n.id !== id));

  const [tab, setTab] = React.useState('All');
  const filtered = notifications.filter(n => tab === 'All' ? true : tab === 'Unread' ? !n.read : n.type === 'reminder');

  return (
    <div className="page">
      <div className="page-header">
        <h2>Notifications</h2>
        <button className="btn-secondary" onClick={markAllRead}><Check size={15} /> Mark All Read</button>
      </div>

      <div className="filters">
        <div className="tab-group">
          {['All', 'Unread', 'Reminders'].map(t => (
            <button key={t} className={`tab-btn ${tab === t ? 'active' : ''}`} onClick={() => setTab(t)}>{t}</button>
          ))}
        </div>
      </div>

      <div className="card notif-list">
        {filtered.length === 0 && <div className="empty">No notifications</div>}
        {filtered.map(n => {
          const Icon = typeIcon[n.type] ?? Bell;
          return (
            <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`} onClick={() => markRead(n.id)}>
              <div className={`notif-icon ${typeColor[n.type]}`}><Icon size={16} /></div>
              <div className="notif-body">
                <div className="notif-msg">{n.message}</div>
                <div className="notif-time">{n.time}</div>
              </div>
              {!n.read && <span className="unread-dot" />}
              <button className="icon-btn" onClick={e => { e.stopPropagation(); deleteNotif(n.id); }}><Trash2 size={14} /></button>
            </div>
          );
        })}
      </div>
    </div>
  );
}
