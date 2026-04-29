import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { authAPI } from '../services/api';
import { useAuth } from '../context/AuthContext';
import toast from 'react-hot-toast';

const Login = () => {
  const [isRegister, setIsRegister] = useState(false);
  const [loading, setLoading] = useState(false);
  const [form, setForm] = useState({
    email: '',
    password: '',
    derivToken: '',
    referralCode: '',
  });

  const { login } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const ref = params.get('ref');
    if (ref) {
      setIsRegister(true);
      setForm((prev) => ({ ...prev, referralCode: ref }));
      toast.success('Referral code applied!');
    }
  }, []);

  const handleChange = (e) => {
    setForm({ ...form, [e.target.name]: e.target.value });
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      let response;
      if (isRegister) {
        response = await authAPI.register(form);
      } else {
        response = await authAPI.login(form);
      }
      const { token, user } = response.data;
      login(user, token);
      toast.success(isRegister ? 'Account created! Welcome!' : 'Welcome back!');
      navigate('/dashboard');
    } catch (error) {
      const message = error.response?.data?.message || 'Something went wrong.';
      toast.error(message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div style={styles.container}>
      <div style={styles.card}>

        {/* Logo */}
        <div style={styles.logo}>
          <span style={styles.logoIcon}>📈</span>
          <h1 style={styles.logoText}>TradeFlow</h1>
        </div>

        {/* Title */}
        <h2 style={styles.title}>
          {isRegister ? 'Create Account' : 'Welcome Back'}
        </h2>
        <p style={styles.subtitle}>
          {isRegister ? 'Start trading in minutes' : 'Sign in to your account'}
        </p>

        {/* Form */}
        <form onSubmit={handleSubmit} style={styles.form}>

          {/* Email */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Email Address</label>
            <input
              type="email"
              name="email"
              value={form.email}
              onChange={handleChange}
              placeholder="you@example.com"
              required
              style={styles.input}
            />
          </div>

          {/* Password */}
          <div style={styles.inputGroup}>
            <label style={styles.label}>Password</label>
            <input
              type="password"
              name="password"
              value={form.password}
              onChange={handleChange}
              placeholder="••••••••"
              required
              style={styles.input}
            />
          </div>

          {/* Deriv Token - Register only */}
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>Deriv API Token</label>
              <input
                type="text"
                name="derivToken"
                value={form.derivToken}
                onChange={handleChange}
                placeholder="Your Deriv API token"
                required
                style={styles.input}
              />
              <small style={styles.hint}>
                Get this from app.deriv.com/account/api-token
              </small>
            </div>
          )}

          {/* Referral Code - Register only */}
          {isRegister && (
            <div style={styles.inputGroup}>
              <label style={styles.label}>
                Referral Code
                <span style={styles.optional}> (optional)</span>
              </label>
              <input
                type="text"
                name="referralCode"
                value={form.referralCode}
                onChange={handleChange}
                placeholder="e.g. ABC123"
                style={{
                  ...styles.input,
                  borderColor: form.referralCode
                    ? 'rgba(0,212,255,0.5)'
                    : 'rgba(255,255,255,0.15)',
                }}
              />
              {form.referralCode ? (
                <small style={styles.referralApplied}>
                  Referral code applied
                </small>
              ) : null}
            </div>
          )}

          {/* Submit Button */}
          <button
            type="submit"
            disabled={loading}
            style={{
              ...styles.button,
              opacity: loading ? 0.7 : 1,
              cursor: loading ? 'not-allowed' : 'pointer',
            }}
          >
            {loading
              ? 'Please wait...'
              : isRegister
              ? 'Create Account'
              : 'Sign In'}
          </button>

        </form>

        {/* Divider */}
        <div style={styles.divider}>
          <div style={styles.dividerLine} />
          <span style={styles.dividerText}>or</span>
          <div style={styles.dividerLine} />
        </div>

        {/* Switch Login / Register */}
        <p style={styles.switchText}>
          {isRegister ? 'Already have an account? ' : "Don't have an account? "}
          <span
            onClick={() => {
              setIsRegister(!isRegister);
              setForm({ email: '', password: '', derivToken: '', referralCode: '' });
            }}
            style={styles.switchLink}
          >
            {isRegister ? 'Sign In' : 'Register Free'}
          </span>
        </p>

        {/* Demo note */}
        <p style={styles.demoNote}>
          Demo account supported. No real money required.
        </p>

      </div>
    </div>
  );
};

const styles = {
  container: {
    minHeight: '100vh',
    background: 'linear-gradient(135deg, #0f0f1a 0%, #1a1a2e 50%, #16213e 100%)',
    display: 'flex',
    alignItems: 'center',
    justifyContent: 'center',
    fontFamily: "'Segoe UI', sans-serif",
    padding: '20px',
  },
  card: {
    background: 'rgba(255,255,255,0.05)',
    backdropFilter: 'blur(20px)',
    border: '1px solid rgba(255,255,255,0.1)',
    borderRadius: '24px',
    padding: '48px 40px',
    width: '100%',
    maxWidth: '440px',
    boxShadow: '0 25px 50px rgba(0,0,0,0.5)',
  },
  logo: {
    display: 'flex',
    alignItems: 'center',
    gap: '10px',
    marginBottom: '32px',
    justifyContent: 'center',
  },
  logoIcon: { fontSize: '32px' },
  logoText: {
    fontSize: '28px',
    fontWeight: '800',
    color: '#00d4ff',
    margin: 0,
  },
  title: {
    color: '#ffffff',
    fontSize: '24px',
    fontWeight: '700',
    margin: '0 0 8px 0',
    textAlign: 'center',
  },
  subtitle: {
    color: 'rgba(255,255,255,0.5)',
    fontSize: '14px',
    textAlign: 'center',
    marginBottom: '32px',
    marginTop: 0,
  },
  form: {
    display: 'flex',
    flexDirection: 'column',
    gap: '20px',
  },
  inputGroup: {
    display: 'flex',
    flexDirection: 'column',
    gap: '8px',
  },
  label: {
    color: 'rgba(255,255,255,0.7)',
    fontSize: '14px',
    fontWeight: '500',
  },
  optional: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '12px',
    fontWeight: '400',
  },
  input: {
    background: 'rgba(255,255,255,0.07)',
    border: '1px solid rgba(255,255,255,0.15)',
    borderRadius: '12px',
    padding: '14px 16px',
    color: '#ffffff',
    fontSize: '15px',
    outline: 'none',
    transition: 'border-color 0.2s',
    width: '100%',
    boxSizing: 'border-box',
  },
  hint: {
    color: 'rgba(255,255,255,0.35)',
    fontSize: '12px',
  },
  referralApplied: {
    color: '#00ff88',
    fontSize: '12px',
  },
  button: {
    background: 'linear-gradient(135deg, #00d4ff, #0099ff)',
    border: 'none',
    borderRadius: '12px',
    padding: '15px',
    color: '#ffffff',
    fontSize: '16px',
    fontWeight: '700',
    marginTop: '8px',
    width: '100%',
    transition: 'opacity 0.2s',
  },
  divider: {
    display: 'flex',
    alignItems: 'center',
    gap: '12px',
    margin: '24px 0 16px',
  },
  dividerLine: {
    flex: 1,
    height: '1px',
    background: 'rgba(255,255,255,0.1)',
  },
  dividerText: {
    color: 'rgba(255,255,255,0.3)',
    fontSize: '13px',
  },
  switchText: {
    color: 'rgba(255,255,255,0.5)',
    textAlign: 'center',
    fontSize: '14px',
    margin: 0,
  },
  switchLink: {
    color: '#00d4ff',
    cursor: 'pointer',
    fontWeight: '600',
    textDecoration: 'underline',
  },
  demoNote: {
    color: 'rgba(255,255,255,0.2)',
    textAlign: 'center',
    fontSize: '12px',
    marginTop: '16px',
    marginBottom: 0,
  },
};

export default Login;