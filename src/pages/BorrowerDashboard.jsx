import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';

export default function BorrowerDashboard() {
  const { bookings, queue, notifications, currentUser } = useApp();
  const navigate = useNavigate();

  const myBookings = bookings.filter(b => b.userId === currentUser?.id);
  const activeBookings = myBookings.filter(b => b.status === 'confirmed');
  const pendingBookings = myBookings.filter(b => b.status === 'pending');
  const myQueue = queue.filter(q => q.userId === currentUser?.id);
  const myNotifications = notifications;

  const handleNavigate = (path) => {
    navigate(path);
  };

  return (
    <div className="dashboard">
      <div className="page-header">
        <div>
          <h2>Welcome back, {currentUser?.name}</h2>
          <p>Here is your borrower dashboard.</p>
        </div>
      </div>

      <div className="stats-grid">
        <div className="stat-card stat-green" onClick={() => handleNavigate('/bookings')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📌</div>
          <div className="stat-info">
            <div className="stat-num">{activeBookings.length}</div>
            <div className="stat-label">Active Bookings</div>
            <div className="stat-sub">Currently confirmed</div>
          </div>
        </div>
        <div className="stat-card stat-amber" onClick={() => handleNavigate('/bookings')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">⏳</div>
          <div className="stat-info">
            <div className="stat-num">{pendingBookings.length}</div>
            <div className="stat-label">Pending Requests</div>
            <div className="stat-sub">Awaiting approval</div>
          </div>
        </div>
        <div className="stat-card stat-blue" onClick={() => handleNavigate('/notifications')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">📨</div>
          <div className="stat-info">
            <div className="stat-num">{myNotifications.filter(n => !n.read).length}</div>
            <div className="stat-label">Unread Alerts</div>
            <div className="stat-sub">Important updates</div>
          </div>
        </div>
        <div className="stat-card stat-rose" onClick={() => handleNavigate('/queue')} style={{ cursor: 'pointer' }}>
          <div className="stat-icon">👤</div>
          <div className="stat-info">
            <div className="stat-num">{myQueue.length}</div>
            <div className="stat-label">Queue Positions</div>
            <div className="stat-sub">Equipment waiting</div>
          </div>
        </div>
      </div>

      <div className="dash-mid">
        <div className="card">
          <div className="card-header">
            <h3>My Active Bookings</h3>
            <button className="link-btn" onClick={() => navigate('/bookings')}>View all</button>
          </div>
          {activeBookings.length === 0 ? (
            <div className="empty">You have no active bookings right now.</div>
          ) : (
            <div className="list-grid">
              {activeBookings.map(b => (
                <div key={b.id} className="list-card">
                  <div>
                    <h4>{b.equipmentName}</h4>
                    <p>{b.fromDate} → {b.toDate}</p>
                    <p className="muted">Status: {b.status}</p>
                  </div>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="card">
          <div className="card-header">
            <h3>My Queue Positions</h3>
            <button className="link-btn" onClick={() => navigate('/queue')}>Manage queue</button>
          </div>
          {myQueue.length === 0 ? (
            <div className="empty">You are not in any queues yet.</div>
          ) : (
            myQueue.map(q => (
              <div key={q.id} className="mini-row">
                <div>
                  <strong>{q.equipmentName}</strong>
                  <p className="muted">Position {q.position}, joined {q.joinedAt}</p>
                </div>
                <span className="badge amber">{q.estimatedWait}</span>
              </div>
            ))
          )}
        </div>
      </div>

      <div className="dash-bottom">
        <div className="card">
          <div className="card-header">
            <h3>Notifications</h3>
          </div>
          {myNotifications.length === 0 ? (
            <div className="empty">No notifications yet.</div>
          ) : (
            myNotifications.slice(0, 6).map(n => (
              <div key={n.id} className={`notif-item ${n.read ? 'read' : ''}`}>
                <div className={`notif-icon ${n.type}`}>{n.type}</div>
                <div>
                  <p>{n.message}</p>
                  <div className="muted">{n.time}</div>
                </div>
              </div>
            ))
          )}
        </div>
        <div className="card">
          <div className="card-header">
            <h3>My Profile</h3>
          </div>
          <div className="profile-summary">
            <div><strong>Name</strong><p>{currentUser?.name}</p></div>
            <div><strong>Email</strong><p>{currentUser?.email}</p></div>
            <div><strong>Phone</strong><p>{currentUser?.phone}</p></div>
            <div><strong>Role</strong><p>Borrower</p></div>
          </div>
        </div>
      </div>
    </div>
  );
}
