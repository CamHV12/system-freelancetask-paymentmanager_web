import { useEffect, useState } from 'react';
import { invoicesAPI, remindersAPI } from '../services/api';
import './PaymentReminders.css';
import './Projects.css';

const PaymentReminders = () => {
  const [reminders, setReminders] = useState([]);
  const [invoices, setInvoices] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    invoiceId: '',
    reminderType: 'BEFORE_DUE',
    daysBefore: 3,
    message: '',
    enabled: true,
  });

  useEffect(() => {
    loadReminders();
    loadInvoices();
  }, []);

  const loadReminders = async () => {
    try {
      const response = await remindersAPI.getAll();
      const payload = response.data;
      let items = [];
      if (Array.isArray(payload)) {
        items = payload;
      } else if (Array.isArray(payload.reminders)) {
        items = payload.reminders;
      } else if (Array.isArray(payload.data)) {
        items = payload.data;
      } else {
        // In some APIs the list may be nested or the response may be an object.
        // Default to empty array to avoid `map` errors.
        items = [];
      }
      setReminders(items);
    } catch (error) {
      console.error('Error loading reminders:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadInvoices = async () => {
    try {
      const response = await invoicesAPI.getAll();
      setInvoices(response.data || []);
    } catch (error) {
      console.error('Error loading invoices:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await remindersAPI.create(formData);
      setShowModal(false);
      setFormData({
        invoiceId: '',
        reminderType: 'BEFORE_DUE',
        daysBefore: 3,
        message: '',
        enabled: true,
      });
      loadReminders();
    } catch (error) {
      console.error('Error creating reminder:', error);
      alert('Error creating reminder');
    }
  };

  const handleSendReminder = async (invoiceId) => {
    if (!window.confirm('Send payment reminder for this invoice?')) {
      return;
    }
    try {
      await remindersAPI.sendReminder(invoiceId);
      alert('Reminder sent successfully!');
      loadReminders();
    } catch (error) {
      console.error('Error sending reminder:', error);
      alert('Error sending reminder');
    }
  };

  const handleToggle = async (id, enabled) => {
    try {
      await remindersAPI.update(id, { enabled: !enabled });
      loadReminders();
    } catch (error) {
      console.error('Error updating reminder:', error);
    }
  };

  const handleDelete = async (id) => {
    if (!window.confirm('Are you sure you want to delete this reminder?')) {
      return;
    }
    try {
      await remindersAPI.delete(id);
      loadReminders();
    } catch (error) {
      console.error('Error deleting reminder:', error);
      alert('Error deleting reminder');
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  return (
    <div className="container">
      <div className="page-header">
        <h1>Payment Reminders</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Reminder
        </button>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Create Payment Reminder</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Invoice *</label>
                <select
                  value={formData.invoiceId}
                  onChange={(e) => setFormData({ ...formData, invoiceId: e.target.value })}
                  required
                >
                  <option value="">Select an invoice</option>
                  {invoices
                    .filter((inv) => inv.status !== 'PAID' && inv.status !== 'CANCELLED')
                    .map((invoice) => (
                      <option key={invoice.id} value={invoice.id}>
                        {invoice.invoiceNumber} - {invoice.client?.name} - ${invoice.totalAmount?.toFixed(2)}
                      </option>
                    ))}
                </select>
              </div>
              <div className="form-group">
                <label>Reminder Type *</label>
                <select
                  value={formData.reminderType}
                  onChange={(e) => setFormData({ ...formData, reminderType: e.target.value })}
                  required
                >
                  <option value="BEFORE_DUE">Before Due Date</option>
                  <option value="ON_DUE">On Due Date</option>
                  <option value="AFTER_DUE">After Due Date</option>
                </select>
              </div>
              {formData.reminderType === 'BEFORE_DUE' && (
                <div className="form-group">
                  <label>Days Before Due Date</label>
                  <input
                    type="number"
                    min="1"
                    value={formData.daysBefore}
                    onChange={(e) => setFormData({ ...formData, daysBefore: parseInt(e.target.value) })}
                  />
                </div>
              )}
              <div className="form-group">
                <label>Custom Message</label>
                <textarea
                  value={formData.message}
                  onChange={(e) => setFormData({ ...formData, message: e.target.value })}
                  rows="4"
                  placeholder="Leave empty to use default message..."
                />
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.enabled}
                    onChange={(e) => setFormData({ ...formData, enabled: e.target.checked })}
                  />
                  {' '}Enabled
                </label>
              </div>
              <div className="modal-actions">
                <button type="button" className="btn btn-secondary" onClick={() => setShowModal(false)}>
                  Cancel
                </button>
                <button type="submit" className="btn btn-primary">
                  Create
                </button>
              </div>
            </form>
          </div>
        </div>
      )}

      <div className="card">
        <table className="table">
          <thead>
            <tr>
              <th>Invoice</th>
              <th>Client</th>
              <th>Type</th>
              <th>Status</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {reminders.length === 0 ? (
              <tr>
                <td colSpan="5" style={{ textAlign: 'center' }}>
                  No payment reminders found. Create your first reminder!
                </td>
              </tr>
            ) : (
              reminders.map((reminder) => {
                const invoice = invoices.find((inv) => inv.id === reminder.invoiceId);
                return (
                  <tr key={reminder.id}>
                    <td>{invoice?.invoiceNumber || 'N/A'}</td>
                    <td>{invoice?.client?.name || 'N/A'}</td>
                    <td>
                      {reminder.reminderType === 'BEFORE_DUE'
                        ? `${reminder.daysBefore} days before`
                        : reminder.reminderType === 'ON_DUE'
                        ? 'On due date'
                        : 'After due date'}
                    </td>
                    <td>
                      <label className="switch">
                        <input
                          type="checkbox"
                          checked={reminder.enabled}
                          onChange={() => handleToggle(reminder.id, reminder.enabled)}
                        />
                        <span className="slider"></span>
                      </label>
                    </td>
                    <td>
                      <button
                        className="btn btn-primary btn-sm"
                        onClick={() => handleSendReminder(reminder.invoiceId)}
                      >
                        Send Now
                      </button>
                      <button
                        className="btn btn-danger btn-sm"
                        onClick={() => handleDelete(reminder.id)}
                        style={{ marginLeft: '5px' }}
                      >
                        Delete
                      </button>
                    </td>
                  </tr>
                );
              })
            )}
          </tbody>
        </table>
      </div>
    </div>
  );
};

export default PaymentReminders;

