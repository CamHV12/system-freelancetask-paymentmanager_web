import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { invoicesAPI } from '../services/api';
import './Projects.css';

const Invoices = () => {
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const navigate = useNavigate();

  useEffect(() => {
    loadInvoices();
  }, []);

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getAll();
      const payload = response.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload.invoices)) {
        items = payload.invoices;
      } else if (Array.isArray(payload.data)) {
        items = payload.data;
      } else {
        items = [];
      }
      setInvoices(items);
    } catch (error) {
      console.error('Error loading invoices:', error);
    } finally {
      setLoading(false);
    }
  };

  const getStatusBadge = (status) => {
    const badges = {
      DRAFT: 'badge badge-info',
      SENT: 'badge badge-warning',
      VIEWED: 'badge badge-info',
      PAID: 'badge badge-success',
      OVERDUE: 'badge badge-danger',
      CANCELLED: 'badge badge-secondary',
    };
    return badges[status] || 'badge';
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Invoices</h1>
      </div>

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice Number</th>
              <th>Client</th>
              <th>Date</th>
              <th>Due Date</th>
              <th>Amount</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {invoices.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No invoices found.
                </td>
              </tr>
            ) : (
              invoices.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.client?.name || 'N/A'}</td>
                  <td>{new Date(invoice.invoiceDate).toLocaleDateString()}</td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>${invoice.totalAmount?.toFixed(2) || '0.00'}</td>
                  <td>
                    <span className={getStatusBadge(invoice.status)}>
                      {invoice.status}
                    </span>
                  </td>
                  <td>
                    <button
                      className="btn btn-primary"
                      onClick={() => navigate(`/invoices/${invoice.id}`)}
                    >
                      View
                    </button>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default Invoices;

