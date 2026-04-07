import React, { useState } from 'react';
import axios from 'axios';
import { useNavigate } from 'react-router-dom';

const Auth = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [formData, setFormData] = useState({ name: '', email: '', password: '' });
  const [error, setError] = useState('');
  const navigate = useNavigate();

  const handleChange = (e) => setFormData({ ...formData, [e.target.name]: e.target.value });

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    const endpoint = isLogin ? '/api/auth/login' : '/api/auth/signup';
    try {
      const response = await axios.post(`http://localhost:5000${endpoint}`, formData);
      localStorage.setItem('token', response.data.token);
      localStorage.setItem('developer', JSON.stringify(response.data.developer));
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.error || 'An error occurred. Please try again.');
    }
  };

  const inputStyle = {
    width: '100%', padding: '0.75rem', borderRadius: '6px', 
    border: '1px solid #334155', backgroundColor: '#0f172a', 
    color: '#f8fafc', outline: 'none'
  };

  return (
    <div className="auth-wrapper">
      {/* Left Sidebar using CSS Class */}
      <div className="auth-sidebar">
        <h1 style={{ fontSize: '3rem', marginBottom: '0.5rem', color: '#3b82f6' }}>CAP Docs AI</h1>
        <p style={{ fontSize: '1.2rem', color: '#94a3b8', marginBottom: '2rem' }}>Documentation Intelligence System</p>
        <h2 style={{ fontWeight: 'normal', color: '#cbd5e1' }}>Welcome to the next generation of local-first development.</h2>
      </div>

      {/* Right Form Area */}
      <div style={{ flex: 1.5, display: 'flex', flexDirection: 'column', justifyContent: 'center', alignItems: 'center', padding: '2rem' }}>
        <div style={{ width: '100%', maxWidth: '420px', padding: '2.5rem', backgroundColor: '#1e293b', borderRadius: '12px', border: '1px solid #334155', boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.5)' }}>
          <h2 style={{ marginBottom: '1.5rem', color: '#f8fafc', fontSize: '1.8rem' }}>
            {isLogin ? 'Welcome Back' : 'Create an Account'}
          </h2>
          
          {error && <p style={{ color: '#ef4444', fontSize: '0.875rem', marginBottom: '1rem' }}>{error}</p>}

          <form onSubmit={handleSubmit} style={{ display: 'flex', flexDirection: 'column', gap: '1.2rem' }}>
            {!isLogin && (
              <div>
                <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Name</label>
                <input type="text" name="name" placeholder="John Doe" value={formData.name} onChange={handleChange} required={!isLogin} style={inputStyle} />
              </div>
            )}
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Email</label>
              <input type="email" name="email" placeholder="you@example.com" value={formData.email} onChange={handleChange} required style={inputStyle} />
            </div>
            <div>
              <label style={{ display: 'block', marginBottom: '0.5rem', fontSize: '0.875rem', color: '#cbd5e1' }}>Password</label>
              <input type="password" name="password" placeholder="••••••••" value={formData.password} onChange={handleChange} required style={inputStyle} />
            </div>
            
            <button type="submit" style={{ padding: '0.875rem', backgroundColor: '#3b82f6', color: 'white', border: 'none', borderRadius: '6px', cursor: 'pointer', marginTop: '1rem', fontSize: '1rem', fontWeight: 'bold' }}>
              {isLogin ? 'Sign In' : 'Sign Up'} 
            </button>
          </form>

          <p style={{ marginTop: '2rem', textAlign: 'center', fontSize: '0.9rem', color: '#94a3b8' }}>
            {isLogin ? "Don't have an account? " : "Already have an account? "}
            <button onClick={() => setIsLogin(!isLogin)} style={{ background: 'none', border: 'none', color: '#60a5fa', cursor: 'pointer', fontWeight: 'bold' }}>
              {isLogin ? 'Sign up' : 'Sign in'}
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default Auth;