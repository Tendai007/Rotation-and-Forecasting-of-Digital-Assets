import React, { useState } from 'react';
import { useApp } from '../App';
import { Save, Database, Bell, Shield, Palette, MessageCircle } from 'lucide-react';
import { seedDatabase } from '../store';
import { openWhatsAppChat } from '../utils/whatsapp';

export default function Settings() {
  const { currentUser, setCurrentUser, addNotification } = useApp();
  const [seeding, setSeeding] = useState(false);
  const [saved, setSaved] = useState(false);
  const [userProfile, setUserProfile] = useState({ name: currentUser?.name || '', email: currentUser?.email || '', phone: currentUser?.phone || '' });
  const [settings, setSettings] = useState({
    centreName: 'Kibera Youth Centre',
    email: 'admin@kibera.org',
    phone: '+254700000001',
    overdueAlertDays: 1,
    maxBorrowDays: 14,
    emailNotifications: true,
    smsNotifications: false,
    autoOverdueFlag: true,
  });

  const handleSave = () => {
    if (userProfile.name) {
      setCurrentUser(prev => ({ ...prev, name: userProfile.name, email: userProfile.email, phone: userProfile.phone }));
    }
    setSaved(true);
    addNotification({ type: 'confirmed', message: 'Settings saved' }, currentUser?.id);
    setTimeout(() => setSaved(false), 2000);
  };

  const handleSeed = async () => {
    setSeeding(true);
    const ok = await seedDatabase();
    addNotification({ type: ok ? 'confirmed' : 'reminder', message: ok ? 'Database seeded with demo data' : 'Seeding failed - check Supabase config' }, currentUser?.id);
    setSeeding(false);
  };

  const handleWhatsAppTest = () => {
    const phone = '0794924192';
    const ok = openWhatsAppChat(phone, `Hello! This is a test message from Kibera Youth Centre on ${new Date().toLocaleString()}.`);
    if (!ok) {
      alert('Unable to open WhatsApp. Please check the phone number.');
    }
  };

  const Section = ({ icon: Icon, title, children }) => (
    <div className="card settings-section">
      <div className="settings-title"><Icon size={18} />{title}</div>
      {children}
    </div>
  );

  return (
    <div className="page">
      <div className="page-header">
        <h2>Settings</h2>
        <button className="btn-primary" onClick={handleSave}><Save size={15} /> {saved ? 'Saved!' : 'Save Changes'}</button>
      </div>

      <div className="settings-grid">
        <Section icon={Palette} title="Your Profile">
          {[
            { label: 'Full Name', key: 'name', type: 'text' },
            { label: 'Email', key: 'email', type: 'email' },
            { label: 'Phone', key: 'phone', type: 'tel' },
          ].map(({ label, key, type }) => (
            <div key={key} className="form-field">
              <label>{label}</label>
              <input type={type} value={userProfile[key]} onChange={e => setUserProfile(p => ({ ...p, [key]: e.target.value }))} />
            </div>
          ))}
        </Section>

        <Section icon={Palette} title="Centre Information">
          {[
            { label: 'Centre Name', key: 'centreName', type: 'text' },
            { label: 'Contact Email', key: 'email', type: 'email' },
            { label: 'Phone Number', key: 'phone', type: 'tel' },
          ].map(({ label, key, type }) => (
            <div key={key} className="form-field">
              <label>{label}</label>
              <input type={type} value={settings[key]} onChange={e => setSettings(s => ({ ...s, [key]: e.target.value }))} />
            </div>
          ))}
        </Section>

        {currentUser?.role === 'staff' && (
          <>
            <Section icon={Shield} title="Borrowing Rules">
              <div className="form-field">
                <label>Overdue Alert (days before due)</label>
                <input type="number" min="0" max="7" value={settings.overdueAlertDays} onChange={e => setSettings(s => ({ ...s, overdueAlertDays: +e.target.value }))} />
              </div>
              <div className="form-field">
                <label>Max Borrow Duration (days)</label>
                <input type="number" min="1" max="30" value={settings.maxBorrowDays} onChange={e => setSettings(s => ({ ...s, maxBorrowDays: +e.target.value }))} />
              </div>
              <div className="toggle-field">
                <label>Auto-flag overdue items</label>
                <button className={`toggle ${settings.autoOverdueFlag ? 'on' : ''}`} onClick={() => setSettings(s => ({ ...s, autoOverdueFlag: !s.autoOverdueFlag }))} />
              </div>
            </Section>

            <Section icon={Bell} title="Notifications">
              <div className="toggle-field">
                <label>Email Notifications</label>
                <button className={`toggle ${settings.emailNotifications ? 'on' : ''}`} onClick={() => setSettings(s => ({ ...s, emailNotifications: !s.emailNotifications }))} />
              </div>
              <div className="toggle-field">
                <label>SMS Notifications (Twilio)</label>
                <button className={`toggle ${settings.smsNotifications ? 'on' : ''}`} onClick={() => setSettings(s => ({ ...s, smsNotifications: !s.smsNotifications }))} />
              </div>

              <div className="form-field" style={{ marginTop: 12 }}>
                <label>WhatsApp contact</label>
                <button className="btn-secondary" onClick={handleWhatsAppTest}>
                  <MessageCircle size={15} /> Send test WhatsApp message
                </button>
                <div className="settings-desc" style={{ marginTop: 8 }}>
                  Opens WhatsApp Web/WhatsApp for the number 0794924192.
                </div>
              </div>
            </Section>

            <Section icon={Database} title="Database">
              <p className="settings-desc">Seed the Supabase database with demo data. Requires valid Supabase config in <code>src/supabase.js</code> and matching tables.</p>
              <button className="btn-secondary" onClick={handleSeed} disabled={seeding}>
                <Database size={15} /> {seeding ? 'Seeding...' : 'Seed Demo Data'}
              </button>
              <div className="firebase-hint">
                <strong>Supabase Setup:</strong>
                <ol>
                  <li>Go to <a href="https://app.supabase.com" target="_blank">app.supabase.com</a></li>
                  <li>Create a project and configure a web client</li>
                  <li>Copy URL and anon key into <code>.env</code> or <code>src/supabase.js</code></li>
                  <li>Create tables: <code>equipment</code>, <code>users</code>, <code>bookings</code>, <code>queue</code></li>
                  <li>Click "Seed Demo Data" above</li>
                </ol>
              </div>
            </Section>
          </>
        )}
      </div>
    </div>
  );
}
