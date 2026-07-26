import React from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Laptop, Camera, Tablet, Users, AlertTriangle, Clock, CheckCircle, TrendingUp } from 'lucide-react';
import { LineChart, Line, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell } from 'recharts';

const bookingChartData = [
  { day: 'Mon', bookings: 4 },
  { day: 'Tue', bookings: 7 },
  { day: 'Wed', bookings: 11 },
  { day: 'Thu', bookings: 9 },
  { day: 'Fri', bookings: 6 },
  { day: 'Sat', bookings: 5 },
  { day: 'Sun', bookings: 3 },
];

const PIE_COLORS = ['#b8a07a', '#d4956a', '#8b4a2f'];

export default function Dashboard() {
  const { equipment, bookings, queue, users } = useApp();
  const navigate = useNavigate();

  const laptops = equipment.filter(e => e.category === 'Laptop');
  const cameras = equipment.filter(e => e.category === 'Camera');
  const tablets = equipment.filter(e => e.category === 'Tablet');

  const available = equipment.filter(e => e.status === 'available').length;
  const inUse = equipment.filter(e => e.status === 'in_use').length;
  const overdue = equipment.filter(e => e.status === 'overdue').length;

  const pieData = [
    { name: 'Available', value: available },
    { name: 'In Use', value: inUse },
    { name: 'Overdue', value: overdue },
  ];

  const handleNavigate = (path) => {
    navigate(path);
  };

  const upcomingReturns = bookings
    .filter(b => b.status === 'confirmed')
    .slice(0, 4);

  const overdueItems = bookings.filter(b => b.status === 'overdue');
  const nextInQueue = queue[0];

  return (
    <div className="dashboard">
      {/* Stats Row */}
      <div className="stats-grid">
        {[
          { label: 'Laptops', total: laptops.length, avail: laptops.filter(e => e.status === 'available').length, inUse: laptops.filter(e => e.status === 'in_use').length, icon: Laptop, color: 'stat-blue', path: '/equipment' },
          { label: 'Cameras', total: cameras.length, avail: cameras.filter(e => e.status === 'available').length, inUse: cameras.filter(e => e.status === 'in_use').length, icon: Camera, color: 'stat-amber', path: '/equipment' },
          { label: 'Tablets', total: tablets.length, avail: tablets.filter(e => e.status === 'available').length, inUse: tablets.filter(e => e.status === 'in_use').length, icon: Tablet, color: 'stat-green', path: '/equipment' },
          { label: 'Total Users', total: users.length, avail: null, inUse: null, icon: Users, color: 'stat-rose', extra: 'Registered', path: '/users' },
        ].map(({ label, total, avail, inUse: iu, icon: Icon, color, extra, path }) => (
          <div key={label} className={`stat-card ${color}`} onClick={() => handleNavigate(path)} style={{ cursor: 'pointer' }}>
            <div className="stat-icon"><Icon size={22} /></div>
            <div className="stat-info">
              <div className="stat-num">{total}</div>
              <div className="stat-label">{label}</div>
              {avail !== null && (
                <div className="stat-sub">
                  <span className="dot green" />{avail} Available
                  <span className="dot red" style={{ marginLeft: 8 }} />{iu} In Use
                </div>
              )}
              {extra && <div className="stat-sub"><span className="dot amber" />{extra}</div>}
            </div>
          </div>
        ))}
      </div>

      {/* Middle Row */}
      <div className="dash-mid">
        {/* Availability Donut */}
        <div className="card">
          <h3 className="card-title">Equipment Availability</h3>
          <div className="avail-chart">
            <ResponsiveContainer width="100%" height={200}>
              <PieChart>
                <Pie data={pieData} cx="50%" cy="50%" innerRadius={55} outerRadius={80} dataKey="value" stroke="none">
                  {pieData.map((_, i) => <Cell key={i} fill={PIE_COLORS[i]} />)}
                </Pie>
                <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3530', color: '#e8dcc8' }} />
              </PieChart>
            </ResponsiveContainer>
            <div className="avail-center">
              <span className="avail-num">{available}</span>
              <span className="avail-label">Available</span>
            </div>
          </div>
          <div className="legend">
            {pieData.map((d, i) => (
              <div key={d.name} className="legend-item">
                <span className="legend-dot" style={{ background: PIE_COLORS[i] }} />
                <span>{d.name}</span>
                <span className="legend-val">{d.value} ({Math.round(d.value / equipment.length * 100)}%)</span>
              </div>
            ))}
          </div>
        </div>

        {/* Upcoming Returns */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title">Upcoming Returns <span className="card-sub">(Next 7 Days)</span></h3>
            <button className="link-btn" onClick={() => navigate('/bookings')}>View all →</button>
          </div>
          <div className="return-list">
            {upcomingReturns.map(b => (
              <div key={b.id} className="return-item" onClick={() => navigate('/bookings')}>
                <div className="return-icon"><Laptop size={16} /></div>
                <div className="return-info">
                  <div className="return-name">{b.equipmentName}</div>
                  <div className="return-user">Borrowed by: {b.userName}</div>
                </div>
                <div className="return-date">
                  <div>{b.toDate}</div>
                  <span className="badge green">3 Days Left</span>
                </div>
              </div>
            ))}
          </div>
        </div>

        {/* Overdue */}
        <div className="card">
          <div className="card-header">
            <h3 className="card-title overdue-title"><AlertTriangle size={16} /> Overdue Items</h3>
            <button className="link-btn" onClick={() => navigate('/bookings')}>View all →</button>
          </div>
          <div className="return-list">
            {overdueItems.map(b => (
              <div key={b.id} className="return-item" onClick={() => navigate('/bookings')}>
                <div className="return-icon overdue"><Camera size={16} /></div>
                <div className="return-info">
                  <div className="return-name">{b.equipmentName}</div>
                  <div className="return-user">Borrowed by: {b.userName}</div>
                </div>
                <div className="return-date">
                  <span className="badge red">Overdue</span>
                </div>
              </div>
            ))}
          </div>
        </div>
      </div>

      {/* Bottom Row */}
      <div className="dash-bottom">
        {/* Bookings Chart */}
        <div className="card chart-card">
          <div className="card-header">
            <h3 className="card-title">Bookings Overview <span className="card-sub">(This Week)</span></h3>
          </div>
          <ResponsiveContainer width="100%" height={180}>
            <LineChart data={bookingChartData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
              <XAxis dataKey="day" stroke="#7a6a5a" tick={{ fill: '#9a8a7a', fontSize: 12 }} />
              <YAxis stroke="#7a6a5a" tick={{ fill: '#9a8a7a', fontSize: 12 }} />
              <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3530', color: '#e8dcc8' }} />
              <Line type="monotone" dataKey="bookings" stroke="#b8a07a" strokeWidth={2} dot={{ fill: '#b8a07a', r: 4 }} activeDot={{ r: 6 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>

        {/* Queue Summary */}
        <div className="card">
          <h3 className="card-title">Queue Summary</h3>
          <div className="queue-summary">
            <div className="qs-row">
              <Users size={16} />
              <span>Total in Queue</span>
              <strong>{queue.length}</strong>
            </div>
            {nextInQueue && (
              <div className="qs-row highlight">
                <Clock size={16} />
                <span>Next in Line</span>
                <strong>{nextInQueue.userName}</strong>
                <span className="badge amber">{nextInQueue.equipmentName ? nextInQueue.equipmentName.split(' ')[0] : ''}</span>
              </div>
            )}
            <div className="qs-row">
              <TrendingUp size={16} />
              <span>Avg Wait Time</span>
              <strong>2.4 Days</strong>
            </div>
            <button className="btn-secondary full-width" onClick={() => navigate('/queue')}>
              Manage Queue
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}
