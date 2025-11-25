import React, { useState, useEffect } from 'react';
import { dashboardAPI } from '../services/api';
import { Link } from 'react-router-dom';
import './Dashboard.css';

const Dashboard = () => {
  const [dashboard, setDashboard] = useState(null);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    loadDashboard();
  }, []);

  const loadDashboard = async () => {
    try {
      const response = await dashboardAPI.getDashboard();
      setDashboard(response.data);
    } catch (error) {
      console.error('Error loading dashboard:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return <div className="container">Loading...</div>;
  }

  if (!dashboard) {
    return <div className="container">Error loading dashboard</div>;
  }

  return (
    <div className="container">
      <h1>Dashboard</h1>
      <div className="dashboard-grid">
        <div className="stat-card">
          <h3>Total Projects</h3>
          <p className="stat-number">{dashboard.totalProjects}</p>
          <Link to="/projects">View All</Link>
        </div>
        <div className="stat-card">
          <h3>Active Projects</h3>
          <p className="stat-number">{dashboard.activeProjects}</p>
        </div>
        <div className="stat-card">
          <h3>Tasks To Do</h3>
          <p className="stat-number">{dashboard.todoTasks}</p>
          <Link to="/tasks">View Tasks</Link>
        </div>
        <div className="stat-card">
          <h3>Total Revenue</h3>
          <p className="stat-number">${dashboard.totalRevenue?.toFixed(2) || '0.00'}</p>
        </div>
        <div className="stat-card">
          <h3>Overdue Invoices</h3>
          <p className="stat-number">{dashboard.overdueInvoices}</p>
          <Link to="/invoices">View Invoices</Link>
        </div>
        <div className="stat-card">
          <h3>Hours Tracked</h3>
          <p className="stat-number">{dashboard.totalHoursTracked || 0}</p>
        </div>
      </div>

      {dashboard.overdueInvoicesList && dashboard.overdueInvoicesList.length > 0 && (
        <div className="card">
          <h2>Overdue Invoices</h2>
          <table className="table">
            <thead>
              <tr>
                <th>Invoice Number</th>
                <th>Client</th>
                <th>Amount</th>
                <th>Due Date</th>
                <th>Action</th>
              </tr>
            </thead>
            <tbody>
              {dashboard.overdueInvoicesList.map((invoice) => (
                <tr key={invoice.id}>
                  <td>{invoice.invoiceNumber}</td>
                  <td>{invoice.client?.name}</td>
                  <td>${invoice.totalAmount?.toFixed(2)}</td>
                  <td>{new Date(invoice.dueDate).toLocaleDateString()}</td>
                  <td>
                    <Link to={`/invoices/${invoice.id}`} className="btn btn-primary">
                      View
                    </Link>
                  </td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      )}
    </div>
  );
};

export default Dashboard;

