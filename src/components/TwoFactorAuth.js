import React, { useState, useEffect } from 'react';
import { authAPI } from '../services/api';
import './TwoFactorAuth.css';

const TwoFactorAuth = () => {
  const [enabled, setEnabled] = useState(false);
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [verificationCode, setVerificationCode] = useState('');
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    // Check if 2FA is enabled
    check2FAStatus();
  }, []);

  const check2FAStatus = async () => {
    // This would check user's 2FA status
    // For now, we'll assume it's disabled
    setEnabled(false);
  };

  const handleEnable2FA = async () => {
    setLoading(true);
    setMessage('');
    try {
      const response = await authAPI.enable2FA();
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
    } catch (error) {
      console.error('Error enabling 2FA:', error);
      setMessage('Error enabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  const handleVerify2FA = async () => {
    if (!verificationCode || verificationCode.length !== 6) {
      setMessage('Please enter a valid 6-digit code');
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await authAPI.verify2FA(verificationCode);
      setEnabled(true);
      setQrCode('');
      setSecret('');
      setVerificationCode('');
      setMessage('2FA enabled successfully!');
    } catch (error) {
      console.error('Error verifying 2FA:', error);
      setMessage('Invalid verification code');
    } finally {
      setLoading(false);
    }
  };

  const handleDisable2FA = async () => {
    if (!window.confirm('Are you sure you want to disable 2FA? This will reduce your account security.')) {
      return;
    }

    setLoading(true);
    setMessage('');
    try {
      await authAPI.disable2FA();
      setEnabled(false);
      setMessage('2FA disabled successfully');
    } catch (error) {
      console.error('Error disabling 2FA:', error);
      setMessage('Error disabling 2FA');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="two-factor-auth">
      <h3>Two-Factor Authentication (2FA)</h3>
      <p className="description">
        Add an extra layer of security to your account by requiring a verification code
        in addition to your password when logging in.
      </p>

      {message && (
        <div className={`message ${message.includes('Error') || message.includes('Invalid') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      {!enabled ? (
        <div className="enable-2fa">
          {!qrCode ? (
            <div>
              <p>Click the button below to enable 2FA. You'll need to scan a QR code with an authenticator app.</p>
              <button
                className="btn btn-primary"
                onClick={handleEnable2FA}
                disabled={loading}
              >
                {loading ? 'Enabling...' : 'Enable 2FA'}
              </button>
            </div>
          ) : (
            <div className="setup-2fa">
              <h4>Scan this QR code with your authenticator app:</h4>
              {qrCode && (
                <div className="qr-code">
                  <img src={qrCode} alt="QR Code" />
                </div>
              )}
              <p className="secret-text">
                Or enter this code manually: <strong>{secret}</strong>
              </p>
              <div className="verification-form">
                <label>Enter the 6-digit code from your app:</label>
                <input
                  type="text"
                  maxLength="6"
                  value={verificationCode}
                  onChange={(e) => setVerificationCode(e.target.value.replace(/\D/g, ''))}
                  placeholder="000000"
                  className="code-input"
                />
                <button
                  className="btn btn-primary"
                  onClick={handleVerify2FA}
                  disabled={loading || verificationCode.length !== 6}
                >
                  {loading ? 'Verifying...' : 'Verify & Enable'}
                </button>
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="disable-2fa">
          <div className="status-enabled">
            <span className="status-icon">✓</span>
            <span>2FA is currently enabled</span>
          </div>
          <button
            className="btn btn-danger"
            onClick={handleDisable2FA}
            disabled={loading}
          >
            {loading ? 'Disabling...' : 'Disable 2FA'}
          </button>
        </div>
      )}
    </div>
  );
};

export default TwoFactorAuth;

