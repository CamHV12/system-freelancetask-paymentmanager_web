import React, { useEffect, useState } from 'react';
import { expensesAPI, projectsAPI } from '../services/api';
import './Projects.css';

const Expenses = () => {
  const [expenses, setExpenses] = useState([]);
  const [projects, setProjects] = useState([]);
  const [loading, setLoading] = useState(true);
  const [showModal, setShowModal] = useState(false);
  const [formData, setFormData] = useState({
    description: '',
    amount: '',
    date: new Date().toISOString().split('T')[0],
    category: 'OFFICE',
    reimbursable: false,
    projectId: '',
    receiptUrl: '',
    receiptFile: null,
  });

  useEffect(() => {
    loadExpenses();
    loadProjects();
  }, []);

  const loadExpenses = async () => {
    try {
      const response = await expensesAPI.getAll();
      setExpenses(response.data);
    } catch (error) {
      console.error('Error loading expenses:', error);
    } finally {
      setLoading(false);
    }
  };

  const loadProjects = async () => {
    try {
      const response = await projectsAPI.getAll();
      setProjects(response.data);
    } catch (error) {
      console.error('Error loading projects:', error);
    }
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setLoading(true);
    try {
      const expenseData = {
        description: formData.description,
        amount: parseFloat(formData.amount),
        date: formData.date,
        category: formData.category,
        reimbursable: formData.reimbursable,
        projectId: formData.projectId || null,
      };
      const response = await expensesAPI.create(expenseData);
      
      // Upload receipt if provided
      if (formData.receiptFile && response.data?.id) {
        try {
          await expensesAPI.uploadReceipt(response.data.id, formData.receiptFile);
        } catch (uploadError) {
          console.error('Error uploading receipt:', uploadError);
        }
      }

      setShowModal(false);
      setFormData({
        description: '',
        amount: '',
        date: new Date().toISOString().split('T')[0],
        category: 'OFFICE',
        reimbursable: false,
        projectId: '',
        receiptUrl: '',
        receiptFile: null,
      });
      loadExpenses();
    } catch (error) {
      console.error('Error creating expense:', error);
      alert('Error creating expense');
    } finally {
      setLoading(false);
    }
  };

  const getCategoryBadge = (category) => {
    const badges = {
      OFFICE: 'badge badge-info',
      TRAVEL: 'badge badge-warning',
      MEALS: 'badge badge-success',
      SOFTWARE: 'badge badge-primary',
      OTHER: 'badge badge-secondary',
    };
    return badges[category] || 'badge';
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  const totalExpenses = expenses.reduce((sum, exp) => sum + (exp.amount || 0), 0);
  const reimbursableTotal = expenses
    .filter(exp => exp.reimbursable)
    .reduce((sum, exp) => sum + (exp.amount || 0), 0);

  return (
    <div className="container">
      <div className="page-header">
        <h1>Expenses</h1>
        <button className="btn btn-primary" onClick={() => setShowModal(true)}>
          + New Expense
        </button>
      </div>

      <div className="dashboard-grid" style={{ marginBottom: '20px' }}>
        <div className="stat-card">
          <h3>Total Expenses</h3>
          <p className="stat-number">${totalExpenses.toFixed(2)}</p>
        </div>
        <div className="stat-card">
          <h3>Reimbursable</h3>
          <p className="stat-number">${reimbursableTotal.toFixed(2)}</p>
        </div>
      </div>

      {showModal && (
        <div className="modal-overlay" onClick={() => setShowModal(false)}>
          <div className="modal-content" onClick={(e) => e.stopPropagation()}>
            <h2>Add New Expense</h2>
            <form onSubmit={handleSubmit}>
              <div className="form-group">
                <label>Description *</label>
                <input
                  type="text"
                  value={formData.description}
                  onChange={(e) => setFormData({ ...formData, description: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Amount *</label>
                <input
                  type="number"
                  step="0.01"
                  value={formData.amount}
                  onChange={(e) => setFormData({ ...formData, amount: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Date *</label>
                <input
                  type="date"
                  value={formData.date}
                  onChange={(e) => setFormData({ ...formData, date: e.target.value })}
                  required
                />
              </div>
              <div className="form-group">
                <label>Category *</label>
                <select
                  value={formData.category}
                  onChange={(e) => setFormData({ ...formData, category: e.target.value })}
                  required
                >
                  <option value="OFFICE">Office</option>
                  <option value="TRAVEL">Travel</option>
                  <option value="MEALS">Meals</option>
                  <option value="SOFTWARE">Software</option>
                  <option value="OTHER">Other</option>
                </select>
              </div>
              <div className="form-group">
                <label>Project</label>
                <select
                  value={formData.projectId}
                  onChange={(e) => setFormData({ ...formData, projectId: e.target.value })}
                >
                  <option value="">No Project</option>
                  {projects.map((project) => (
                    <option key={project.id} value={project.id}>
                      {project.name}
                    </option>
                  ))}
                </select>
              </div>
              <div className="form-group">
                <label>
                  <input
                    type="checkbox"
                    checked={formData.reimbursable}
                    onChange={(e) => setFormData({ ...formData, reimbursable: e.target.checked })}
                  />
                  {' '}Reimbursable
                </label>
              </div>
              <div className="form-group">
                <label>Receipt</label>
                <input
                  type="file"
                  accept="image/*,application/pdf"
                  onChange={(e) => {
                    const file = e.target.files[0];
                    if (file) {
                      setFormData({ ...formData, receiptFile: file, receiptUrl: URL.createObjectURL(file) });
                    }
                  }}
                />
                {formData.receiptUrl && (
                  <div style={{ marginTop: '10px' }}>
                    <a href={formData.receiptUrl} target="_blank" rel="noopener noreferrer">
                      View Receipt
                    </a>
                  </div>
                )}
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
              <th>Date</th>
              <th>Description</th>
              <th>Category</th>
              <th>Project</th>
              <th>Amount</th>
              <th>Reimbursable</th>
              <th>Actions</th>
            </tr>
          </thead>
          <tbody>
            {expenses.length === 0 ? (
              <tr>
                <td colSpan="7" style={{ textAlign: 'center' }}>
                  No expenses found. Add your first expense!
                </td>
              </tr>
            ) : (
              expenses.map((expense) => (
                <tr key={expense.id}>
                  <td>{new Date(expense.date).toLocaleDateString()}</td>
                  <td>{expense.description}</td>
                  <td>
                    <span className={getCategoryBadge(expense.category)}>
                      {expense.category}
                    </span>
                  </td>
                  <td>{expense.project?.name || 'N/A'}</td>
                  <td>${expense.amount?.toFixed(2) || '0.00'}</td>
                  <td>{expense.reimbursable ? '✓' : '✗'}</td>
                  <td>
                    <button className="btn btn-primary">View</button>
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

export default Expenses;

