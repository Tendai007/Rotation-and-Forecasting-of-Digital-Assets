import React, { useState } from 'react';
import { useApp } from '../App';
import { BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer, PieChart, Pie, Cell, LineChart, Line } from 'recharts';
import { Download, RefreshCw } from 'lucide-react';

const COLORS = ['#b8a07a', '#d4956a', '#8b4a2f', '#6b7c6a', '#4a5568'];

export default function Reports() {
  const { equipment, bookings, users } = useApp();
  const [from, setFrom] = useState('2025-01-01');
  const [to, setTo] = useState('2025-12-31');

  const totalBookings = bookings.length;
  const completed = bookings.filter(b => b.status === 'completed').length;
  const overdueCount = bookings.filter(b => b.status === 'overdue').length;
  const active = bookings.filter(b => b.status === 'confirmed').length;

  // Most used equipment
  const eqCounts = {};
  bookings.forEach(b => { eqCounts[b.equipmentName] = (eqCounts[b.equipmentName] || 0) + 1; });
  const mostUsed = Object.entries(eqCounts).map(([name, count]) => ({ name: (name || '').split(' ').slice(0, 3).join(' '), count })).sort((a, b) => b.count - a.count).slice(0, 6);

  // Status breakdown
  const statusData = [
    { name: 'Completed', value: completed },
    { name: 'Active', value: active },
    { name: 'Overdue', value: overdueCount },
    { name: 'Pending', value: bookings.filter(b => b.status === 'pending').length },
  ].filter(d => d.value > 0);

  // Monthly trend (mock)
  const monthlyData = [
    { month: 'Jan', bookings: 8 }, { month: 'Feb', bookings: 12 }, { month: 'Mar', bookings: 15 },
    { month: 'Apr', bookings: 10 }, { month: 'May', bookings: 18 }, { month: 'Jun', bookings: 14 },
  ];

  const handleExport = () => {
    const rows = [['Equipment', 'Borrower', 'From', 'To', 'Status'], ...bookings.map(b => [b.equipmentName, b.userName, b.fromDate, b.toDate, b.status])];
    const csv = rows.map(r => r.join(',')).join('\n');
    const blob = new Blob([csv], { type: 'text/csv' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a'); a.href = url; a.download = 'bookings_report.csv'; a.click();
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Reports</h2>
        <div style={{ display: 'flex', gap: 8 }}>
          <button className="btn-secondary" onClick={() => window.location.reload()}><RefreshCw size={15} /> Refresh</button>
          <button className="btn-primary" onClick={handleExport}><Download size={15} /> Export CSV</button>
        </div>
      </div>

      <div className="report-filter card">
        <label>From</label>
        <input type="date" value={from} onChange={e => setFrom(e.target.value)} />
        <label>To</label>
        <input type="date" value={to} onChange={e => setTo(e.target.value)} />
        <button className="btn-primary">Generate Report</button>
      </div>

      <div className="report-stats">
        {[
          { label: 'Total Bookings', value: totalBookings, color: '' },
          { label: 'Completed', value: completed, color: 'green' },
          { label: 'Overdue', value: overdueCount, color: 'red' },
          { label: 'Active', value: active, color: 'amber' },
        ].map(({ label, value, color }) => (
          <div key={label} className="card report-stat">
            <div className={`rs-num ${color}`}>{value}</div>
            <div className="rs-label">{label}</div>
          </div>
        ))}
      </div>

      <div className="report-charts">
        <div className="card">
          <h3 className="card-title">Most Used Equipment</h3>
          <ResponsiveContainer width="100%" height={220}>
            <BarChart data={mostUsed}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
              <XAxis dataKey="name" stroke="#7a6a5a" tick={{ fill: '#9a8a7a', fontSize: 11 }} />
              <YAxis stroke="#7a6a5a" tick={{ fill: '#9a8a7a', fontSize: 11 }} />
              <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3530', color: '#e8dcc8' }} />
              <Bar dataKey="count" fill="#b8a07a" radius={[4, 4, 0, 0]} />
            </BarChart>
          </ResponsiveContainer>
        </div>
        <div className="card">
          <h3 className="card-title">Booking Status Breakdown</h3>
          <ResponsiveContainer width="100%" height={220}>
            <PieChart>
              <Pie data={statusData} cx="50%" cy="50%" outerRadius={80} dataKey="value" label={({ name, value }) => `${name}: ${value}`} labelLine={{ stroke: '#7a6a5a' }}>
                {statusData.map((_, i) => <Cell key={i} fill={COLORS[i]} />)}
              </Pie>
              <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3530', color: '#e8dcc8' }} />
            </PieChart>
          </ResponsiveContainer>
        </div>
        <div className="card" style={{ gridColumn: '1 / -1' }}>
          <h3 className="card-title">Monthly Booking Trend</h3>
          <ResponsiveContainer width="100%" height={200}>
            <LineChart data={monthlyData}>
              <CartesianGrid strokeDasharray="3 3" stroke="#2a2520" />
              <XAxis dataKey="month" stroke="#7a6a5a" tick={{ fill: '#9a8a7a' }} />
              <YAxis stroke="#7a6a5a" tick={{ fill: '#9a8a7a' }} />
              <Tooltip contentStyle={{ background: '#1a1814', border: '1px solid #3a3530', color: '#e8dcc8' }} />
              <Line type="monotone" dataKey="bookings" stroke="#d4956a" strokeWidth={2} dot={{ fill: '#d4956a', r: 4 }} />
            </LineChart>
          </ResponsiveContainer>
        </div>
      </div>
    </div>
  );
}
