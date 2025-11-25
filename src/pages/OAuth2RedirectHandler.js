import { useEffect } from 'react';
import { useNavigate } from 'react-router-dom';

const OAuth2RedirectHandler = () => {
  const navigate = useNavigate();

  useEffect(() => {
    const params = new URLSearchParams(window.location.search);
    const token = params.get('token');
    const userParam = params.get('user');

    if (!token) {
      navigate('/login');
      return;
    }

    // Save token and user to localStorage
    localStorage.setItem('token', token);
    if (userParam) {
      try {
        const user = JSON.parse(userParam);
        localStorage.setItem('user', JSON.stringify(user));
      } catch (e) {
        console.error('Failed to parse user param', e);
      }
    }

    // If this is a popup, close it and the opener will receive the auth
    if (window.opener && window.opener !== window) {
      // notify opener about successful auth
      window.opener.postMessage({ type: 'oauth_success', token, user: userParam ? JSON.parse(userParam) : null }, window.location.origin);
      window.close();
    } else {
      // Otherwise redirect to home in same tab
      window.location.href = '/';
    }
  }, [navigate]);

  return (
    <div style={{ padding: 20, textAlign: 'center' }}>
      <p>Signing you in...</p>
    </div>
  );
};

export default OAuth2RedirectHandler;
