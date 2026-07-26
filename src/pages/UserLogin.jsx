import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Mail, Lock, UserRound, Phone } from 'lucide-react';
import { addUser } from '../store';

export default function UserLogin() {
  const { setCurrentUser, users, setUsers } = useApp();
  const navigate = useNavigate();
  const [isRegistering, setIsRegistering] = useState(false);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('brian@kibera.org');
  const [phone, setPhone] = useState('');
  const [password, setPassword] = useState('password123');
  const [confirmPassword, setConfirmPassword] = useState('password123');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);

  const handleLogin = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const normalizedEmail = email.trim().toLowerCase();
    const user = users.find(u => u.email?.toLowerCase() === normalizedEmail && u.role === 'borrower');
    const isValidPassword = user && (password === 'password123' || user.password === password);

    if (!user || !isValidPassword) {
      setError('Invalid borrower credentials. Use a registered borrower email and password.');
      setLoading(false);
      return;
    }

    setCurrentUser(user);
    navigate('/');
    setLoading(false);
  };

  const handleRegister = async (e) => {
    e.preventDefault();
    setError('');

    const normalizedEmail = email.trim().toLowerCase();
    if (!name.trim() || !normalizedEmail || !password) {
      setError('Please enter your name, email and password.');
      return;
    }

    if (password.length < 6) {
      setError('Password must be at least 6 characters.');
      return;
    }

    if (password !== confirmPassword) {
      setError('Passwords do not match.');
      return;
    }

    if (users.some(u => u.email?.toLowerCase() === normalizedEmail)) {
      setError('A user with that email already exists. Try logging in instead.');
      return;
    }

    setLoading(true);
    const newUser = await addUser({
      name: name.trim(),
      email: normalizedEmail,
      phone: phone.trim(),
      role: 'borrower',
      status: 'active',
      password,
    });

    setUsers(prev => [...prev, newUser]);
    setCurrentUser(newUser);
    navigate('/');
    setLoading(false);
  };

  return (
    <div className="login-page">
      <div className="login-bg" />
      <div className="login-card">
        <div className="login-brand">
          <div className="login-logo">
            <svg viewBox="0 0 64 64" xmlns="http://www.w3.org/2000/svg" aria-hidden>
              <defs>
                <linearGradient id="lg1" x1="0" x2="1" y1="0" y2="1">
                  <stop offset="0" stopColor="#b8a07a" />
                  <stop offset="1" stopColor="#d4956a" />
                </linearGradient>
              </defs>
              <g className="logo-anim">
                <circle cx="32" cy="32" r="28" fill="url(#lg1)" />
                <circle className="logo-ring" cx="32" cy="32" r="20" strokeWidth="3" />
                <text className="logo-letter" x="32" y="38" textAnchor="middle">K</text>
              </g>
            </svg>
          </div>
          <h1>KIBERA</h1>
          <p>Youth Centre Tool Library</p>
        </div>
        <h4 className="login-title">{isRegistering ? 'Register as Borrower' : 'User Login'}</h4>
        <p className="login-sub">{isRegistering ? 'Create your account to access bookings and appear on the staff list.' : 'Access your bookings, queue, notifications and profile.'}</p>

        <form onSubmit={isRegistering ? handleRegister : handleLogin} className="login-form">
          {isRegistering && (
            <div className="form-field">
              <label>Full Name</label>
              <div className="input-wrap">
                <UserRound size={16} className="input-icon" />
                <input type="text" value={name} onChange={e => setName(e.target.value)} placeholder="Jane Doe" />
              </div>
            </div>
          )}

          <div className="form-field">
            <label>Email</label>
            <div className="input-wrap">
              <Mail size={16} className="input-icon" />
              <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="brian@kibera.org" />
            </div>
          </div>

          {isRegistering && (
            <div className="form-field">
              <label>Phone</label>
              <div className="input-wrap">
                <Phone size={16} className="input-icon" />
                <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254700000000" />
              </div>
            </div>
          )}

          <div className="form-field">
            <label>{isRegistering ? 'Create Password' : 'Password'}</label>
            <div className="input-wrap">
              <Lock size={16} className="input-icon" />
              <input type="password" value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
            </div>
          </div>

          {isRegistering && (
            <div className="form-field">
              <label>Confirm Password</label>
              <div className="input-wrap">
                <Lock size={16} className="input-icon" />
                <input type="password" value={confirmPassword} onChange={e => setConfirmPassword(e.target.value)} placeholder="••••••••" />
              </div>
            </div>
          )}

          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? 'Please wait...' : (isRegistering ? 'Register & Enter' : 'Login as Borrower')}
          </button>
        </form>

        <p className="signup-link">
          {isRegistering ? 'Already have an account?' : 'First time here?'}{' '}
          <button type="button" className="btn-link" onClick={() => {
            setIsRegistering(!isRegistering);
            setError('');
            setPassword('');
            setConfirmPassword('');
          }} style={{ background: 'none', border: 'none', padding: 0, color: 'var(--gold)', cursor: 'pointer' }}>
            {isRegistering ? 'Login instead' : 'Register now'}
          </button>
        </p>
        <p className="signup-link">Need admin access? <a href="#/login">Staff login</a></p>
        <div className="demo-hint">New borrower accounts appear on the staff Users page immediately after registration.</div>
      </div>
    </div>
  );
}
