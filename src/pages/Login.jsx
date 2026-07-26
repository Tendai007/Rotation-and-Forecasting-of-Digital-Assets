import React, { useState, useRef } from 'react';
import { useNavigate } from 'react-router-dom';
import { useApp } from '../App';
import { Eye, EyeOff, Lock, Mail, MessageCircle, Smartphone, ArrowRight } from 'lucide-react';
import { SEED_USERS } from '../store';
import { signInWithSupabaseEmail, signInWithSupabasePhone, verifySupabasePhoneOtp } from '../supabase';

export default function Login() {
  const { setCurrentUser, isSupabaseEnabled } = useApp();
  const navigate = useNavigate();
  const [authMode, setAuthMode] = useState('email');
  const [email, setEmail] = useState('admin@kibera.org');
  const [password, setPassword] = useState('Password123');
  const [phone, setPhone] = useState('+254712345678');
  const [smsCode, setSmsCode] = useState('');
  const [showPw, setShowPw] = useState(false);
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const [smsSent, setSmsSent] = useState(false);
  const recaptchaRef = useRef(null);

  const handleLocalLogin = async () => {
    const user = SEED_USERS.find(u => u.email === email);
    if (user && password === 'Password123') {
      setCurrentUser(user);
      navigate('/');
      return;
    }
    throw new Error('Invalid credentials. Try admin@kibera.org / password123');
  };

  const handleEmailLogin = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      if (isSupabaseEnabled) {
        const result = await signInWithSupabaseEmail(email.trim(), password);
        const user = result.user;
        setCurrentUser({
          id: user.id,
          name: user.user_metadata?.full_name || user.email || 'Supabase User',
          email: user.email,
          role: 'staff',
        });
      } else {
        await handleLocalLogin();
      }
      navigate('/');
    } catch (err) {
      setError(err.message || 'Login failed.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneSend = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    if (!isSupabaseEnabled) {
      setError('Phone login requires Supabase configuration.');
      setLoading(false);
      return;
    }

    try {
      await signInWithSupabasePhone(phone.trim());
      setSmsSent(true);
    } catch (err) {
      setError(err.message || 'Unable to send SMS code.');
    } finally {
      setLoading(false);
    }
  };

  const handlePhoneVerify = async (e) => {
    e.preventDefault();
    setLoading(true);
    setError('');

    try {
      const result = await verifySupabasePhoneOtp(phone.trim(), smsCode.trim());
      const user = result.user;
      setCurrentUser({
        id: user.id,
        name: user.user_metadata?.full_name || user.phone || 'Supabase User',
        email: user.email,
        role: 'staff',
      });
      navigate('/');
    } catch (err) {
      setError(err.message || 'Verification failed.');
    } finally {
      setLoading(false);
    }
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
        <h2 className="login-title">Welcome Back</h2>
        <p className="login-sub">Sign in to continue managing digital assets</p>
        <div className="auth-toggle" style={{ display: 'flex', gap: '8px', marginBottom: 18 }}>
          <button type="button" className={`btn-secondary ${authMode === 'email' ? 'active' : ''}`} onClick={() => setAuthMode('email')}>Email Login</button>
          <button type="button" className={`btn-secondary ${authMode === 'phone' ? 'active' : ''}`} onClick={() => setAuthMode('phone')}>SMS Login</button>
        </div>

        <form onSubmit={authMode === 'email' ? handleEmailLogin : smsSent ? handlePhoneVerify : handlePhoneSend} className="login-form">
          {authMode === 'email' ? (
            <>
              <div className="form-field">
                <label>Email</label>
                <div className="input-wrap">
                  <Mail size={16} className="input-icon" />
                  <input type="email" value={email} onChange={e => setEmail(e.target.value)} placeholder="admin@kibera.org" />
                </div>
              </div>
              <div className="form-field">
                <label>Password</label>
                <div className="input-wrap">
                  <Lock size={16} className="input-icon" />
                  <input type={showPw ? 'text' : 'password'} value={password} onChange={e => setPassword(e.target.value)} placeholder="••••••••" />
                  <button type="button" className="pw-toggle" onClick={() => setShowPw(!showPw)}>
                    {showPw ? <EyeOff size={16} /> : <Eye size={16} />}
                  </button>
                </div>
              </div>
              <div className="login-options">
                <label className="remember"><input type="checkbox" /> Remember me</label>
                <a href="#" className="forgot">Forgot Password?</a>
              </div>
            </>
          ) : (
            <>
              <div className="form-field">
                <label>Phone number</label>
                <div className="input-wrap">
                  <Smartphone size={16} className="input-icon" />
                  <input type="tel" value={phone} onChange={e => setPhone(e.target.value)} placeholder="+254712345678" />
                </div>
              </div>
              {smsSent && (
                <div className="form-field">
                  <label>Verification code</label>
                  <div className="input-wrap">
                    <MessageCircle size={16} className="input-icon" />
                    <input type="text" value={smsCode} onChange={e => setSmsCode(e.target.value)} placeholder="123456" />
                  </div>
                </div>
              )}
              <div style={{ marginBottom: 16 }} />
            </>
          )}

          {error && <div className="login-error">{error}</div>}
          <button type="submit" className="btn-login" disabled={loading}>
            {loading ? <span className="spinner" /> : (authMode === 'email' ? 'Login' : smsSent ? 'Verify Code' : 'Send SMS')}
          </button>
        </form>
        <p className="signup-link">Need borrower access? <a href="#/user-login">User login</a></p>
        <div className="demo-hint">
          <strong>Demo:</strong> admin@kibera.org / password123
          {isSupabaseEnabled ? ' or use SMS login if configured.' : ' (Supabase not configured: local fallback only)'}
        </div>
      </div>
    </div>
  );
}
