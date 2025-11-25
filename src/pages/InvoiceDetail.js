import { useCallback, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { invoicesAPI } from '../services/api';
import './InvoiceDetail.css';

const InvoiceDetail = () => {
  const { id } = useParams();
  const navigate = useNavigate();
  const [invoice, setInvoice] = useState(null);
  const [loading, setLoading] = useState(true);
  const [editing, setEditing] = useState(false);
  const [formData, setFormData] = useState({
    invoiceDate: '',
    dueDate: '',
    notes: '',
    taxRate: '',
    discountAmount: '',
    paymentTerms: '',
  });
  const [message, setMessage] = useState('');

  const loadInvoice = useCallback(async () => {
    try {
      const response = await invoicesAPI.getById(id);
      setInvoice(response.data);
    } catch (error) {
      console.error('Error loading invoice:', error);
    } finally {
      setLoading(false);
    }
  }, [id]);

  useEffect(() => {
    loadInvoice();
  }, [loadInvoice]);

  useEffect(() => {
    if (invoice && !editing) {
      setFormData({
        invoiceDate: invoice.invoiceDate ? invoice.invoiceDate.split('T')[0] : '',
        dueDate: invoice.dueDate ? invoice.dueDate.split('T')[0] : '',
        notes: invoice.notes || '',
        taxRate: invoice.taxRate || '',
        discountAmount: invoice.discountAmount || '',
        paymentTerms: invoice.paymentTerms || '',
      });
    }
  }, [invoice, editing]);

  const handleSend = async () => {
    if (!window.confirm('Are you sure you want to send this invoice to the client?')) {
      return;
    }
    try {
      await invoicesAPI.send(id);
      setMessage('Invoice sent successfully!');
      setTimeout(() => setMessage(''), 3000);
      loadInvoice();
    } catch (error) {
      console.error('Error sending invoice:', error);
      setMessage('Error sending invoice');
      setTimeout(() => setMessage(''), 3000);
    }
  };


  const handleUpdate = async (e) => {
    e.preventDefault();
    try {
      await invoicesAPI.update(id, formData);
      setEditing(false);
      setMessage('Invoice updated successfully!');
      setTimeout(() => setMessage(''), 3000);
      loadInvoice();
    } catch (error) {
      console.error('Error updating invoice:', error);
      setMessage('Error updating invoice');
      setTimeout(() => setMessage(''), 3000);
    }
  };

  const handlePrint = () => {
    window.print();
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

  if (!invoice) {
    return <div className="container">Invoice not found</div>;
  }

  return (
    <div className="container invoice-detail-page">
      {message && (
        <div className={`alert ${message.includes('Error') ? 'alert-danger' : 'alert-success'}`}>
          {message}
        </div>
      )}

      <div className="page-header">
        <div>
        <button className="btn btn-secondary" onClick={() => navigate('/invoices')}>
          ← Back
        </button>
        <h1 style={{ display: 'inline', marginLeft: '20px' }}>
          Invoice {invoice.invoiceNumber}
        </h1>
        </div>
        <div className="invoice-actions">
        {invoice.status === 'DRAFT' && (
            <>
              {!editing ? (
                <>
                  <button className="btn btn-primary" onClick={() => setEditing(true)}>
                    Edit Invoice
                  </button>
                  <button className="btn btn-success" onClick={handleSend}>
            Send Invoice
                  </button>
                </>
              ) : (
                <>
                  <button className="btn btn-secondary" onClick={() => setEditing(false)}>
                    Cancel
                  </button>
                  <button className="btn btn-primary" onClick={handleUpdate}>
                    Save Changes
                  </button>
                </>
              )}
            </>
          )}
          <button className="btn btn-outline" onClick={handlePrint}>
            Print / PDF
          </button>
        </div>
      </div>

      <div className="card invoice-card">
        <div className="invoice-header">
          <div className="invoice-info">
            <h2>Invoice Details</h2>
            <div className="invoice-meta">
              <p><strong>Status:</strong> <span className={getStatusBadge(invoice.status)}>{invoice.status}</span></p>
              {!editing ? (
                <>
            <p><strong>Date:</strong> {new Date(invoice.invoiceDate).toLocaleDateString()}</p>
            <p><strong>Due Date:</strong> {new Date(invoice.dueDate).toLocaleDateString()}</p>
                </>
              ) : (
                <>
                  <div className="form-group">
                    <label>Invoice Date *</label>
                    <input
                      type="date"
                      value={formData.invoiceDate}
                      onChange={(e) => setFormData({ ...formData, invoiceDate: e.target.value })}
                      required
                    />
                  </div>
                  <div className="form-group">
                    <label>Due Date *</label>
                    <input
                      type="date"
                      value={formData.dueDate}
                      onChange={(e) => setFormData({ ...formData, dueDate: e.target.value })}
                      required
                    />
                  </div>
                </>
              )}
            </div>
          </div>
          <div className="invoice-client">
            <h3>Bill To</h3>
            <p><strong>{invoice.client?.name || 'N/A'}</strong></p>
            {invoice.client?.companyName && <p>{invoice.client.companyName}</p>}
            {invoice.client?.email && <p>{invoice.client.email}</p>}
            {invoice.client?.phoneNumber && <p>{invoice.client.phoneNumber}</p>}
            {invoice.client?.address && <p>{invoice.client.address}</p>}
            {invoice.client?.city && invoice.client?.country && (
              <p>{invoice.client.city}, {invoice.client.country}</p>
            )}
          </div>
        </div>

        <div className="invoice-items">
          <h3>Items</h3>
          <table className="table invoice-table">
            <thead>
              <tr>
                <th>Description</th>
                <th>Quantity</th>
                <th>Unit Price</th>
                <th>Total</th>
              </tr>
            </thead>
            <tbody>
              {invoice.invoiceItems && invoice.invoiceItems.length > 0 ? (
                invoice.invoiceItems.map((item, index) => (
                <tr key={index}>
                  <td>{item.description}</td>
                  <td>{item.quantity || 1}</td>
                  <td>${item.unitPrice?.toFixed(2) || '0.00'}</td>
                  <td>${item.totalPrice?.toFixed(2) || '0.00'}</td>
                </tr>
                ))
              ) : (
                <tr>
                  <td colSpan="4" style={{ textAlign: 'center', color: '#999' }}>
                    No items in this invoice
                  </td>
                </tr>
              )}
            </tbody>
            <tfoot>
              <tr>
                <td colSpan="3" style={{ textAlign: 'right' }}>Subtotal:</td>
                <td>${(invoice.subtotal || invoice.totalAmount || 0).toFixed(2)}</td>
              </tr>
              {invoice.taxRate > 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right' }}>
                    Tax ({invoice.taxRate}%):
                  </td>
                  <td>${((invoice.subtotal || invoice.totalAmount || 0) * invoice.taxRate / 100).toFixed(2)}</td>
                </tr>
              )}
              {invoice.discountAmount > 0 && (
                <tr>
                  <td colSpan="3" style={{ textAlign: 'right' }}>Discount:</td>
                  <td>-${invoice.discountAmount.toFixed(2)}</td>
                </tr>
              )}
              <tr className="invoice-total">
                <td colSpan="3" style={{ textAlign: 'right', fontWeight: 'bold', fontSize: '18px' }}>
                  Total:
                </td>
                <td style={{ fontWeight: 'bold', fontSize: '18px' }}>
                  ${invoice.totalAmount?.toFixed(2) || '0.00'}
                </td>
              </tr>
            </tfoot>
          </table>
        </div>

        <div className="invoice-notes">
          {!editing ? (
            invoice.notes && (
              <>
            <h3>Notes</h3>
            <p>{invoice.notes}</p>
              </>
            )
          ) : (
            <>
              <div className="form-group">
                <label>Notes</label>
                <textarea
                  value={formData.notes}
                  onChange={(e) => setFormData({ ...formData, notes: e.target.value })}
                  rows="4"
                  placeholder="Additional notes or terms..."
                />
              </div>
              <div style={{ display: 'grid', gridTemplateColumns: '1fr 1fr', gap: '15px' }}>
                <div className="form-group">
                  <label>Tax Rate (%)</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.taxRate}
                    onChange={(e) => setFormData({ ...formData, taxRate: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
                <div className="form-group">
                  <label>Discount Amount</label>
                  <input
                    type="number"
                    step="0.01"
                    value={formData.discountAmount}
                    onChange={(e) => setFormData({ ...formData, discountAmount: e.target.value })}
                    placeholder="0.00"
                  />
                </div>
              </div>
              <div className="form-group">
                <label>Payment Terms</label>
                <input
                  type="text"
                  value={formData.paymentTerms}
                  onChange={(e) => setFormData({ ...formData, paymentTerms: e.target.value })}
                  placeholder="e.g., Net 30, Due on receipt, etc."
                />
              </div>
            </>
          )}
          {!editing && invoice.paymentTerms && (
            <div style={{ marginTop: '15px' }}>
              <strong>Payment Terms:</strong> {invoice.paymentTerms}
          </div>
        )}
      </div>
      </div>

      {invoice.project && (
        <div className="card">
          <h3>Related Project</h3>
          <p><strong>Project:</strong> {invoice.project.name}</p>
          <p><strong>Type:</strong> {invoice.project.type}</p>
          <button 
            className="btn btn-primary"
            onClick={() => navigate(`/projects/${invoice.project.id}`)}
          >
            View Project
          </button>
        </div>
      )}
    </div>
  );
};

export default InvoiceDetail;

