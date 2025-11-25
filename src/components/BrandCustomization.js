import React, { useState, useEffect } from 'react';
import { settingsAPI } from '../services/api';
import './BrandCustomization.css';

const BrandCustomization = () => {
  const [branding, setBranding] = useState({
    logo: null,
    logoUrl: '',
    primaryColor: '#007bff',
    secondaryColor: '#6c757d',
  });
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState('');

  useEffect(() => {
    loadBranding();
  }, []);

  const loadBranding = async () => {
    try {
      const response = await settingsAPI.getBranding();
      if (response.data) {
        setBranding({
          ...branding,
          logoUrl: response.data.logoUrl || '',
          primaryColor: response.data.primaryColor || '#007bff',
          secondaryColor: response.data.secondaryColor || '#6c757d',
        });
      }
    } catch (error) {
      console.error('Error loading branding:', error);
    }
  };

  const handleLogoChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      if (file.size > 5 * 1024 * 1024) {
        setMessage('Logo file size must be less than 5MB');
        return;
      }
      setBranding({ ...branding, logo: file });
      const reader = new FileReader();
      reader.onloadend = () => {
        setBranding({ ...branding, logo: file, logoUrl: reader.result });
      };
      reader.readAsDataURL(file);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    setMessage('');

    try {
      await settingsAPI.updateBranding({
        logo: branding.logo,
        primaryColor: branding.primaryColor,
        secondaryColor: branding.secondaryColor,
      });
      setMessage('Branding updated successfully!');
      setTimeout(() => setMessage(''), 3000);
    } catch (error) {
      console.error('Error updating branding:', error);
      setMessage('Error updating branding');
      setTimeout(() => setMessage(''), 3000);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="brand-customization">
      <h3>Brand Customization</h3>
      <p className="description">
        Customize your brand appearance for invoices and client portal.
      </p>

      {message && (
        <div className={`message ${message.includes('Error') ? 'error' : 'success'}`}>
          {message}
        </div>
      )}

      <form onSubmit={handleSubmit}>
        <div className="form-group">
          <label>Logo</label>
          <div className="logo-upload">
            {branding.logoUrl && (
              <div className="logo-preview">
                <img src={branding.logoUrl} alt="Logo preview" />
              </div>
            )}
            <input
              type="file"
              id="logo-upload"
              accept="image/*"
              onChange={handleLogoChange}
              className="file-input"
            />
            <label htmlFor="logo-upload" className="file-label">
              {branding.logoUrl ? 'Change Logo' : 'Upload Logo'}
            </label>
          </div>
          <p className="help-text">Recommended: 200x50px, PNG or JPG, max 5MB</p>
        </div>

        <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
          <div className="form-group">
            <label>Primary Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={branding.primaryColor}
                onChange={(e) => setBranding({ ...branding, primaryColor: e.target.value })}
                className="color-text"
              />
            </div>
          </div>
          <div className="form-group">
            <label>Secondary Color</label>
            <div className="color-input-group">
              <input
                type="color"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="color-picker"
              />
              <input
                type="text"
                value={branding.secondaryColor}
                onChange={(e) => setBranding({ ...branding, secondaryColor: e.target.value })}
                className="color-text"
              />
            </div>
          </div>
        </div>

        <div className="color-preview">
          <h4>Preview</h4>
          <div
            className="preview-box"
            style={{
              background: `linear-gradient(135deg, ${branding.primaryColor} 0%, ${branding.secondaryColor} 100%)`,
            }}
          >
            {branding.logoUrl && (
              <img src={branding.logoUrl} alt="Logo" className="preview-logo" />
            )}
            <p style={{ color: 'white', margin: 0 }}>Your Brand Preview</p>
          </div>
        </div>

        <div className="form-actions">
          <button type="submit" className="btn btn-primary" disabled={loading}>
            {loading ? 'Saving...' : 'Save Branding'}
          </button>
        </div>
      </form>
    </div>
  );
};

export default BrandCustomization;

