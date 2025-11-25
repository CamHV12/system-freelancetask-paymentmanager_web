import { useEffect, useState } from 'react';
import { Link, useNavigate } from 'react-router-dom';
import { useAuth } from '../hooks/useAuth';
import './Login.css';

const Login = () => {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const [loading, setLoading] = useState(false);
  const { login } = useAuth();
  const { user, loadings } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    // If already logged in, redirect to dashboard
    if (user && !loadings) {
      navigate('/dashboard');
    }
  }, [user, loadings, navigate]);

  if (loadings) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // If user is logged in, display user info
  if (user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Freelance Task Manager</h1>
          <h2>Welcome!</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError('');
    setLoading(true);

    const result = await login(email, password);
    if (result.success) {
      navigate('/dashboard');
    } else {
      setError(result.error);
    }
    setLoading(false);
  };

  const handleSocialLogin = async (provider) => {
    setError('');
    setLoading(true);
    const width = 500;
    const height = 600;
    const left = window.screenX + (window.outerWidth - width) / 2;
    const top = window.screenY + (window.outerHeight - height) / 2;
    const providerKey = provider.toLowerCase();

    // If Google, try to open the Google consent page directly (preferred)
    if (providerKey === 'google') {
      window.open(
        'http://localhost:8080/oauth2/authorization/google',
        'OAuthWindow',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }else{
      window.open(
        'http://localhost:8080/oauth2/authorization/facebook',
        'OAuthWindow',
        `width=${width},height=${height},left=${left},top=${top}`
      );
    }
  };

  if (loading) {
    return <div style={{ padding: 20 }}>Loading...</div>;
  }

  // If user is logged in, display user info
  if (user) {
    return (
      <div className="login-container">
        <div className="login-card">
          <h1>Freelance Task Manager</h1>
          <h2>Welcome!</h2>
          <div className="user-info">
            <p><strong>Name:</strong> {user.firstName} {user.lastName}</p>
            <p><strong>Email:</strong> {user.email}</p>
          </div>
          <button 
            className="btn btn-primary" 
            onClick={() => navigate('/dashboard')}
          >
            Go to Dashboard
          </button>
        </div>
      </div>
    );
  }

  return (
    <div className="login-container">
      <div className="login-card">
        <h1>Freelance Task Manager</h1>
        <h2>Login</h2>
        {error && <div className="error-message">{error}</div>}
        <form onSubmit={handleSubmit}>
          <div className="form-group">
            <label>Email</label>
            <input
              type="email"
              value={email}
              onChange={(e) => setEmail(e.target.value)}
              required
            />
          </div>
          <div className="form-group">
            <label>Password</label>
            <input
              type="password"
              value={password}
              onChange={(e) => setPassword(e.target.value)}
              required
            />
          </div>
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Logging in...' : 'Login'}
          </button>
        </form>

        <div className="social-login">
          <div className="divider">
            <span>OR</span>
          </div>
          <button
            className="btn btn-social google"
            onClick={() => handleSocialLogin('Google')}
            disabled={loading}
          >
            <span>🔍</span> Continue with Google
          </button>
          <button
            className="btn btn-social facebook"
            onClick={() => handleSocialLogin('Facebook')}
            disabled={loading}
          >
            <span>👤</span> Continue with Facebook
          </button>
        </div>

        <p className="register-link">
          Don't have an account? <Link to="/register">Register here</Link>
        </p>
      </div>
    </div>
  );

};

export default Login;

