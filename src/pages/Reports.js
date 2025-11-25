import { useCallback, useEffect, useState } from 'react';
import { reportsAPI } from '../services/api';
import './Reports.css';

const Reports = () => {
  const [activeTab, setActiveTab] = useState('income');
  const [period, setPeriod] = useState('month');
  const [incomeData, setIncomeData] = useState(null);
  const [productivityData, setProductivityData] = useState(null);
  const [clientData, setClientData] = useState([]);
  const [loading, setLoading] = useState(false);

  const loadReportData = useCallback(async () => {
    setLoading(true);
    try {
      if (activeTab === 'income') {
        const response = await reportsAPI.getIncomeReport(period);
        setIncomeData(response.data);
      } else if (activeTab === 'productivity') {
        const response = await reportsAPI.getProductivityReport(period);
        setProductivityData(response.data);
      } else if (activeTab === 'clients') {
        const response = await reportsAPI.getClientProfitability();
        const payload = response.data;
        let items = [];
        if (Array.isArray(payload)) {
          items = payload;
        } else if (Array.isArray(payload.clients)) {
          items = payload.clients;
        } else if (Array.isArray(payload.data)) {
          items = payload.data;
        } else if (Array.isArray(payload.clientData)) {
          items = payload.clientData;
        } else {
          items = [];
        }
        setClientData(items);
      }
    } catch (error) {
      console.error('Error loading report:', error);
    } finally {
      setLoading(false);
    }
  }, [activeTab, period]);

  useEffect(() => {
    loadReportData();
  }, [loadReportData]);

  const formatCurrency = (amount) => {
    return new Intl.NumberFormat('en-US', {
      style: 'currency',
      currency: 'USD',
    }).format(amount || 0);
  };

  const formatHours = (hours) => {
    return `${(hours || 0).toFixed(2)} hours`;
  };

  return (
    <div className="container reports-page">
      <div className="page-header">
        <h1>Reports & Analytics</h1>
        {activeTab !== 'clients' && (
          <div className="period-selector">
            <label>Period:</label>
            <select value={period} onChange={(e) => setPeriod(e.target.value)}>
              <option value="week">This Week</option>
              <option value="month">This Month</option>
              <option value="quarter">This Quarter</option>
              <option value="year">This Year</option>
            </select>
          </div>
        )}
      </div>

      <div className="reports-tabs">
        <button
          className={activeTab === 'income' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('income')}
        >
          Income Report
        </button>
        <button
          className={activeTab === 'productivity' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('productivity')}
        >
          Productivity Report
        </button>
        <button
          className={activeTab === 'clients' ? 'tab active' : 'tab'}
          onClick={() => setActiveTab('clients')}
        >
          Client Profitability
        </button>
      </div>

      {loading ? (
        <div className="loading">Loading report data...</div>
      ) : (
        <>
          {activeTab === 'income' && incomeData && (
            <div className="report-content">
              <div className="report-summary">
                <div className="summary-card">
                  <h3>Total Income</h3>
                  <p className="summary-value">{formatCurrency(incomeData.totalIncome)}</p>
                </div>
                <div className="summary-card">
                  <h3>Paid Invoices</h3>
                  <p className="summary-value">{incomeData.paidInvoices || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Pending</h3>
                  <p className="summary-value">{formatCurrency(incomeData.pendingAmount)}</p>
                </div>
                <div className="summary-card">
                  <h3>Average per Invoice</h3>
                  <p className="summary-value">{formatCurrency(incomeData.averagePerInvoice)}</p>
                </div>
              </div>

              {incomeData.monthlyData && incomeData.monthlyData.length > 0 && (
                <div className="card">
                  <h2>Monthly Breakdown</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Month</th>
                        <th>Income</th>
                        <th>Invoices</th>
                        <th>Average</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeData.monthlyData.map((item, index) => (
                        <tr key={index}>
                          <td>{item.month}</td>
                          <td>{formatCurrency(item.income)}</td>
                          <td>{item.invoiceCount}</td>
                          <td>{formatCurrency(item.average)}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {incomeData.topClients && incomeData.topClients.length > 0 && (
                <div className="card">
                  <h2>Top Clients by Revenue</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Client</th>
                        <th>Total Revenue</th>
                        <th>Invoices</th>
                      </tr>
                    </thead>
                    <tbody>
                      {incomeData.topClients.map((client, index) => (
                        <tr key={index}>
                          <td>{client.name}</td>
                          <td>{formatCurrency(client.revenue)}</td>
                          <td>{client.invoiceCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'productivity' && productivityData && (
            <div className="report-content">
              <div className="report-summary">
                <div className="summary-card">
                  <h3>Total Hours</h3>
                  <p className="summary-value">{formatHours(productivityData.totalHours)}</p>
                </div>
                <div className="summary-card">
                  <h3>Active Projects</h3>
                  <p className="summary-value">{productivityData.activeProjects || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Tasks Completed</h3>
                  <p className="summary-value">{productivityData.completedTasks || 0}</p>
                </div>
                <div className="summary-card">
                  <h3>Avg Hours/Day</h3>
                  <p className="summary-value">{formatHours(productivityData.averageHoursPerDay)}</p>
                </div>
              </div>

              {productivityData.projectBreakdown && productivityData.projectBreakdown.length > 0 && (
                <div className="card">
                  <h2>Time by Project</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Project</th>
                        <th>Hours</th>
                        <th>Percentage</th>
                        <th>Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productivityData.projectBreakdown.map((project, index) => (
                        <tr key={index}>
                          <td>{project.name}</td>
                          <td>{formatHours(project.hours)}</td>
                          <td>
                            <div className="progress-bar">
                              <div
                                className="progress-fill"
                                style={{ width: `${project.percentage}%` }}
                              ></div>
                              <span>{project.percentage.toFixed(1)}%</span>
                            </div>
                          </td>
                          <td>{project.taskCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}

              {productivityData.dailyBreakdown && productivityData.dailyBreakdown.length > 0 && (
                <div className="card">
                  <h2>Daily Activity</h2>
                  <table className="table">
                    <thead>
                      <tr>
                        <th>Date</th>
                        <th>Hours</th>
                        <th>Tasks</th>
                      </tr>
                    </thead>
                    <tbody>
                      {productivityData.dailyBreakdown.map((day, index) => (
                        <tr key={index}>
                          <td>{new Date(day.date).toLocaleDateString()}</td>
                          <td>{formatHours(day.hours)}</td>
                          <td>{day.taskCount}</td>
                        </tr>
                      ))}
                    </tbody>
                  </table>
                </div>
              )}
            </div>
          )}

          {activeTab === 'clients' && clientData && (
            <div className="report-content">
              <div className="card">
                <h2>Client Profitability Analysis</h2>
                <table className="table">
                  <thead>
                    <tr>
                      <th>Client</th>
                      <th>Total Revenue</th>
                      <th>Total Hours</th>
                      <th>Hourly Rate</th>
                      <th>Projects</th>
                      <th>Profitability</th>
                    </tr>
                  </thead>
                  <tbody>
                    {clientData.length === 0 ? (
                      <tr>
                        <td colSpan="6" style={{ textAlign: 'center' }}>
                          No client data available
                        </td>
                      </tr>
                    ) : (
                      clientData.map((client, index) => (
                        <tr key={index}>
                          <td>{client.name}</td>
                          <td>{formatCurrency(client.totalRevenue)}</td>
                          <td>{formatHours(client.totalHours)}</td>
                          <td>{formatCurrency(client.effectiveHourlyRate)}</td>
                          <td>{client.projectCount}</td>
                          <td>
                            <span
                              className={`profitability-badge ${
                                client.profitability >= 80
                                  ? 'high'
                                  : client.profitability >= 50
                                  ? 'medium'
                                  : 'low'
                              }`}
                            >
                              {client.profitability.toFixed(0)}%
                            </span>
                          </td>
                        </tr>
                      ))
                    )}
                  </tbody>
                </table>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default Reports;

