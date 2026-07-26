import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Plus, Search, Filter, Laptop, Camera, Tablet, Edit, Trash2, Eye, X } from 'lucide-react';
import { addEquipment, updateEquipment, deleteEquipment, SEED_EQUIPMENT } from '../store';

const CATEGORY_ICONS = { Laptop, Camera, Tablet };

const statusColor = { available: 'green', in_use: 'amber', overdue: 'red' };
const statusLabel = { available: 'Available', in_use: 'In Use', overdue: 'Overdue' };

function Modal({ title, children, onClose }) {
  return (
    <div className="modal-overlay" onClick={onClose}>
      <div className="modal" onClick={e => e.stopPropagation()}>
        <div className="modal-header">
          <h3>{title}</h3>
          <button onClick={onClose}><X size={18} /></button>
        </div>
        {children}
      </div>
    </div>
  );
}

export default function Equipment() {
  const { equipment, setEquipment, addNotification, currentUser } = useApp();
  const navigate = useNavigate();
  const [search, setSearch] = useState('');
  const [catFilter, setCatFilter] = useState('All');
  const [statusFilter, setStatusFilter] = useState('All');
  const [showModal, setShowModal] = useState(false);
  const [editItem, setEditItem] = useState(null);
  const [form, setForm] = useState({ name: '', category: 'Laptop', condition: 'Good', serialNumber: '', specs: '', status: 'available' });
  const isStaff = currentUser?.role === 'staff';

  const filtered = equipment.filter(e => {
    const matchSearch = e.name.toLowerCase().includes(search.toLowerCase()) || e.serialNumber?.toLowerCase().includes(search.toLowerCase());
    const matchCat = catFilter === 'All' || e.category === catFilter;
    const matchStatus = statusFilter === 'All' || e.status === statusFilter;
    return matchSearch && matchCat && matchStatus;
  });

  const openAdd = () => { setEditItem(null); setForm({ name: '', category: 'Laptop', condition: 'Good', serialNumber: '', specs: '', status: 'available' }); setShowModal(true); };
  const openEdit = (item) => { setEditItem(item); setForm({ ...item }); setShowModal(true); };

  const handleSave = async () => {
    if (!form.name) return;
    if (editItem) {
      await updateEquipment(editItem.id, form);
      setEquipment(prev => prev.map(e => e.id === editItem.id ? { ...e, ...form } : e));
      addNotification({ type: 'confirmed', message: `${form.name} updated` }, currentUser?.id);
    } else {
      const newItem = await addEquipment(form);
      setEquipment(prev => [...prev, newItem]);
      addNotification({ type: 'confirmed', message: `${form.name} added to inventory` }, currentUser?.id);
    }
    setShowModal(false);
  };

  const handleDelete = async (item) => {
    if (!confirm(`Delete ${item.name}?`)) return;
    await deleteEquipment(item.id);
    setEquipment(prev => prev.filter(e => e.id !== item.id));
    addNotification({ type: 'reminder', message: `${item.name} removed from inventory` }, currentUser?.id);
  };

  return (
    <div className="page">
      <div className="page-header">
        <h2>Equipment</h2>
        {isStaff && <button className="btn-primary" onClick={openAdd}><Plus size={16} /> Add Equipment</button>}
      </div>

      {/* Filters */}
      <div className="filters">
        <div className="search-wrap">
          <Search size={16} className="search-icon" />
          <input placeholder="Search equipment or serial..." value={search} onChange={e => setSearch(e.target.value)} />
        </div>
        <div className="filter-tabs">
          {['All', 'Laptop', 'Camera', 'Tablet'].map(c => (
            <button key={c} className={`filter-tab ${catFilter === c ? 'active' : ''}`} onClick={() => setCatFilter(c)}>{c}</button>
          ))}
        </div>
        <div className="filter-tabs">
          {['All', 'available', 'in_use', 'overdue'].map(s => (
            <button key={s} className={`filter-tab ${statusFilter === s ? 'active' : ''}`} onClick={() => setStatusFilter(s)}>
              {statusLabel[s] ?? s}
            </button>
          ))}
        </div>
      </div>

      {/* Summary Cards */}
      <div className="eq-summary">
        {['Laptop', 'Camera', 'Tablet'].map(cat => {
          const items = equipment.filter(e => e.category === cat);
          const Icon = CATEGORY_ICONS[cat];
          return (
            <div key={cat} className="eq-sum-card">
              <Icon size={20} />
              <div>
                <div className="eq-sum-num">{items.length}</div>
                <div className="eq-sum-label">{cat}s</div>
              </div>
              <div className="eq-sum-dots">
                <span className="dot green" />{items.filter(e => e.status === 'available').length}
                <span className="dot red" style={{ marginLeft: 6 }} />{items.filter(e => e.status !== 'available').length}
              </div>
            </div>
          );
        })}
      </div>

      {/* Table */}
      <div className="card table-card">
        <div className="table-wrap">
          <table>
            <thead>
              <tr>
                <th>Item</th>
                <th>Category</th>
                <th>Condition</th>
                <th>Serial No.</th>
                <th>Status</th>
                <th>Actions</th>
              </tr>
            </thead>
            <tbody>
              {filtered.map(item => {
                const Icon = CATEGORY_ICONS[item.category] ?? Laptop;
                  return (
                    <tr key={item.id} onClick={() => navigate(`/equipment/${item.id}`)} style={{ cursor: 'pointer' }}>
                    <td>
                      <div className="item-cell">
                        <div className="item-icon"><Icon size={16} /></div>
                        <div>
                          <div className="item-name">{item.name}</div>
                          <div className="item-spec">{item.specs}</div>
                        </div>
                      </div>
                    </td>
                    <td><span className="cat-badge">{item.category}</span></td>
                    <td>{item.condition}</td>
                    <td className="mono">{item.serialNumber}</td>
                    <td><span className={`badge ${statusColor[item.status]}`}>{statusLabel[item.status]}</span></td>
                    <td>
                      <div className="action-btns">
                        <button className="icon-btn" title="View" onClick={(e) => { e.stopPropagation(); navigate(`/equipment/${item.id}`); }}><Eye size={15} /></button>
                        {isStaff && <button className="icon-btn" title="Edit" onClick={(e) => { e.stopPropagation(); openEdit(item); }}><Edit size={15} /></button>}
                        {isStaff && <button className="icon-btn danger" title="Delete" onClick={(e) => { e.stopPropagation(); handleDelete(item); }}><Trash2 size={15} /></button>}
                      </div>
                    </td>
                  </tr>
                );
              })}
            </tbody>
          </table>
          {filtered.length === 0 && <div className="empty">No equipment found</div>}
        </div>
      </div>

      {showModal && (
        <Modal title={editItem ? 'Edit Equipment' : 'Add Equipment'} onClose={() => setShowModal(false)}>
          <div className="modal-body">
            {[
              { label: 'Name', key: 'name', type: 'text' },
              { label: 'Serial Number', key: 'serialNumber', type: 'text' },
              { label: 'Specifications', key: 'specs', type: 'text' },
            ].map(({ label, key, type }) => (
              <div key={key} className="form-field">
                <label>{label}</label>
                <input type={type} value={form[key]} onChange={e => setForm(f => ({ ...f, [key]: e.target.value }))} />
              </div>
            ))}
            <div className="form-row">
              <div className="form-field">
                <label>Category</label>
                <select value={form.category} onChange={e => setForm(f => ({ ...f, category: e.target.value }))}>
                  {['Laptop', 'Camera', 'Tablet'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Condition</label>
                <select value={form.condition} onChange={e => setForm(f => ({ ...f, condition: e.target.value }))}>
                  {['Excellent', 'Good', 'Fair', 'Poor'].map(c => <option key={c}>{c}</option>)}
                </select>
              </div>
              <div className="form-field">
                <label>Status</label>
                <select value={form.status} onChange={e => setForm(f => ({ ...f, status: e.target.value }))}>
                  <option value="available">Available</option>
                  <option value="in_use">In Use</option>
                  <option value="overdue">Overdue</option>
                </select>
              </div>
            </div>
          </div>
          <div className="modal-footer">
            <button className="btn-secondary" onClick={() => setShowModal(false)}>Cancel</button>
            <button className="btn-primary" onClick={handleSave}>{editItem ? 'Save Changes' : 'Add Equipment'}</button>
          </div>
        </Modal>
      )}
    </div>
  );
}
