// src/pages/Login.jsx
import React, { useState } from 'react';
import { useAuth } from '../contexts/AuthContext';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState('');
  const { login } = useAuth();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setIsLoading(true);

    try {
      const result = await login({ email, password });
      if (!result.success) {
        setError(result.error || 'Failed to login. Please try again.');
      }
    } catch (err) {
      setError(err.message || 'Failed to login. Please try again.');
    } finally {
      setIsLoading(false);
    }
  };

  return (
    <div className="login-container">
      {/* Animated Background */}
      <div className="login-background">
        <div className="gradient-orb orb-1"></div>
        <div className="gradient-orb orb-2"></div>
        <div className="gradient-orb orb-3"></div>
        <div className="grid-overlay"></div>
      </div>

      {/* Single Balanced Card */}
      <div className="login-layout">
        <div className="login-card">
          {/* Left Section - Brand & Info */}
          <div className="login-left">
            <div className="brand-section">
              <div className="logo-container">
                <img 
                  src="/logo.png" 
                  alt="KxTill POS Logo" 
                  className="logo-image"
                />
                <div className="logo-text-container">
                  <h1 className="logo-text">KXTILL POS</h1>
                  <p className="brand-tagline">Streamline Your Business Operations</p>
                </div>
              </div>
            </div>

            <div className="features-section">
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M9 12l2 2 4-4m6 2a9 9 0 11-18 0 9 9 0 0118 0z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Real-time Analytics</h3>
                  <p>Monitor sales and performance instantly</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M12 15v2m-6 4h12a2 2 0 002-2v-6a2 2 0 00-2-2H6a2 2 0 00-2 2v6a2 2 0 002 2zm10-10V7a4 4 0 00-8 0v4h8z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Secure & Reliable</h3>
                  <p>Enterprise-grade security for your data</p>
                </div>
              </div>
              
              <div className="feature-item">
                <div className="feature-icon">
                  <svg width="24" height="24" viewBox="0 0 24 24" fill="none">
                    <path d="M13 10V3L4 14h7v7l9-11h-7z" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round"/>
                  </svg>
                </div>
                <div className="feature-text">
                  <h3>Lightning Fast</h3>
                  <p>Optimized for speed and efficiency</p>
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Login Form */}
          <div className="login-right">
            <div className="login-form-container">
              <div className="login-header">
                <h2 className="login-title">Welcome Back</h2>
                <p className="login-subtitle">Sign in to continue to your dashboard</p>
              </div>

              {error && (
                <div className="error-message">
                  <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                    <path 
                      d="M10 18a8 8 0 100-16 8 8 0 000 16zM9 9V5h2v4H9zm0 4v-2h2v2H9z" 
                      fill="currentColor"
                    />
                  </svg>
                  <span>{error}</span>
                </div>
              )}

              <form onSubmit={handleSubmit} className="login-form">
                <div className="form-group">
                  <label htmlFor="email" className="form-label">
                    Email Address
                  </label>
                  <input
                    id="email"
                    type="email"
                    className="input"
                    placeholder="name@company.com"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <div className="form-group">
                  <label htmlFor="password" className="form-label">
                    Password
                  </label>
                  <input
                    id="password"
                    type="password"
                    className="input"
                    placeholder="••••••••"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                    required
                    disabled={isLoading}
                  />
                </div>

                <button 
                  type="submit" 
                  className="btn btn-primary btn-login"
                  disabled={isLoading}
                >
                  {isLoading ? (
                    <>
                      <div className="spinner-small"></div>
                      <span>Signing in...</span>
                    </>
                  ) : (
                    <>
                      <span>Sign In</span>
                      <svg width="20" height="20" viewBox="0 0 20 20" fill="none">
                        <path 
                          d="M13 10l-4-4m4 4l-4 4m4-4H3m12-4a8 8 0 110 12" 
                          stroke="currentColor" 
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                        />
                      </svg>
                    </>
                  )}
                </button>
              </form>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Login;