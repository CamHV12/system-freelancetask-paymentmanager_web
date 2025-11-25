import { useEffect, useState } from 'react';
import { paymentAPI } from '../services/api';
import './PaymentGatewaySettings.css';

const PaymentGatewaySettings = () => {
  const [gateways, setGateways] = useState([]);
  const [loading, setLoading] = useState(true);
  const [connecting, setConnecting] = useState(null);
  const [formData, setFormData] = useState({});

  useEffect(() => {
    loadGateways();
  }, []);

  const loadGateways = async () => {
    try {
      const response = await paymentAPI.getGateways();
      const payload = response.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload.gateways)) {
        items = payload.gateways;
      } else if (Array.isArray(payload.data)) {
        items = payload.data;
      } else {
        items = [];
      }
      setGateways(items);
    } catch (error) {
      console.error('Error loading gateways:', error);
    } finally {
      setLoading(false);
    }
  };

  const handleConnect = async (gateway) => {
    setConnecting(gateway);
    try {
      // In a real app, this would open OAuth flow or show connection form
      alert(`${gateway} integration requires backend setup. Please configure in backend.`);
    } catch (error) {
      console.error(`Error connecting ${gateway}:`, error);
      alert(`Error connecting ${gateway}`);
    } finally {
      setConnecting(null);
    }
  };

  const handleDisconnect = async (gateway) => {
    if (!window.confirm(`Are you sure you want to disconnect ${gateway}?`)) {
      return;
    }

    try {
      await paymentAPI.disconnectGateway(gateway);
      loadGateways();
    } catch (error) {
      console.error(`Error disconnecting ${gateway}:`, error);
      alert(`Error disconnecting ${gateway}`);
    }
  };

  const getGatewayIcon = (gateway) => {
    const icons = {
      stripe: '💳',
      paypal: '💰',
      square: '⬜',
    };
    return icons[gateway.toLowerCase()] || '💳';
  };

  if (loading) {
    return <div>Loading payment gateways...</div>;
  }

  return (
    <div className="payment-gateway-settings">
      <h3>Payment Gateway Integration</h3>
      <p className="description">
        Connect payment gateways to allow clients to pay invoices directly online.
      </p>

      <div className="gateways-list">
        {['stripe', 'paypal'].map((gateway) => {
          const gatewayData = gateways.find((g) => ((g && g.name) || '').toLowerCase() === gateway);
          const isConnected = gatewayData?.connected || false;

          return (
            <div key={gateway} className="gateway-card">
              <div className="gateway-header">
                <div className="gateway-info">
                  <span className="gateway-icon">{getGatewayIcon(gateway)}</span>
                  <div>
                    <h4>{gateway.charAt(0).toUpperCase() + gateway.slice(1)}</h4>
                    <p className="gateway-description">
                      {gateway === 'stripe'
                        ? 'Accept credit cards and other payment methods'
                        : 'Accept PayPal payments from clients'}
                    </p>
                  </div>
                </div>
                <div className="gateway-status">
                  {isConnected ? (
                    <>
                      <span className="status-badge connected">Connected</span>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDisconnect(gateway)}
                      >
                        Disconnect
                      </button>
                    </>
                  ) : (
                    <button
                      className="btn btn-primary"
                      onClick={() => handleConnect(gateway)}
                      disabled={connecting === gateway}
                    >
                      {connecting === gateway ? 'Connecting...' : 'Connect'}
                    </button>
                  )}
                </div>
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default PaymentGatewaySettings;

