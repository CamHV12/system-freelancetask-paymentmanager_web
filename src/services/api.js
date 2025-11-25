import axios from 'axios';

const API_BASE_URL = process.env.REACT_APP_API_URL || 'http://localhost:8080/api';

const api = axios.create({
  baseURL: API_BASE_URL,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Add token to requests
api.interceptors.request.use(
  (config) => {
    const token = localStorage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    return config;
  },
  (error) => {
    return Promise.reject(error);
  }
);

// Handle token expiration
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      localStorage.removeItem('token');
      localStorage.removeItem('user');
      window.location.href = '/login';
    }
    return Promise.reject(error);
  }
);

// Auth API
export const authAPI = {
  login: (email, password) => api.post('/auth/login', { email, password }),
  register: (data) => api.post('/auth/register', data),
  socialLogin: (provider, token) => api.post(`/auth/social/${provider}`, { token }),
  enable2FA: () => api.post('/auth/2fa/enable'),
  verify2FA: (code) => api.post('/auth/2fa/verify', { code }),
  disable2FA: () => api.post('/auth/2fa/disable'),
};

// Dashboard API
export const dashboardAPI = {
  getDashboard: () => api.get('/dashboard'),
};

// Projects API
export const projectsAPI = {
  getAll: () => api.get('/projects'),
  getById: (id) => api.get(`/projects/${id}`),
  create: (data) => api.post('/projects', data),
  update: (id, data) => api.put(`/projects/${id}`, data),
  delete: (id) => api.delete(`/projects/${id}`),
  getByStatus: (status) => api.get(`/projects/status/${status}`),
};

// Tasks API
export const tasksAPI = {
  getByProject: (projectId) => api.get(`/tasks/project/${projectId}`),
  getById: (id, projectId) => api.get(`/tasks/${id}?projectId=${projectId}`),
  create: (data) => api.post('/tasks', data),
  update: (id, data, projectId) => api.put(`/tasks/${id}?projectId=${projectId}`, data),
  delete: (id, projectId) => api.delete(`/tasks/${id}?projectId=${projectId}`),
  getByStatus: (projectId, status) => api.get(`/tasks/project/${projectId}/status/${status}`),
};

// Time Entries API
export const timeEntriesAPI = {
  startTimer: (taskId) => api.post(`/time-entries/start/${taskId}`),
  stopTimer: (timeEntryId) => api.post(`/time-entries/stop/${timeEntryId}`),
  createManual: (data) => api.post('/time-entries/manual', data),
  getByTask: (taskId) => api.get(`/time-entries/task/${taskId}`),
  getByProject: (projectId) => api.get(`/time-entries/project/${projectId}`),
  delete: (id) => api.delete(`/time-entries/${id}`),
};

// Invoices API
export const invoicesAPI = {
  getAll: () => api.get('/invoices'),
  getById: (id) => api.get(`/invoices/${id}`),
  create: (data) => api.post('/invoices', data),
  createFromProject: (projectId) => api.post(`/invoices/from-project/${projectId}`),
  update: (id, data) => api.put(`/invoices/${id}`, data),
  send: (id) => api.post(`/invoices/${id}/send`),
  getOverdue: () => api.get('/invoices/overdue'),
};

// Clients API
export const clientsAPI = {
  getAll: () => api.get('/clients'),
  getById: (id) => api.get(`/clients/${id}`),
  create: (data) => api.post('/clients', data),
  update: (id, data) => api.put(`/clients/${id}`, data),
  delete: (id) => api.delete(`/clients/${id}`),
};

// Expenses API
export const expensesAPI = {
  getAll: () => api.get('/expenses'),
  getById: (id) => api.get(`/expenses/${id}`),
  create: (data) => api.post('/expenses', data),
  update: (id, data) => api.put(`/expenses/${id}`, data),
  delete: (id) => api.delete(`/expenses/${id}`),
  getReimbursable: () => api.get('/expenses/reimbursable'),
  uploadReceipt: (id, file) => {
    const formData = new FormData();
    formData.append('file', file);
    return api.post(`/expenses/${id}/receipt`, formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
};

// Reports API
export const reportsAPI = {
  getIncomeReport: (period) => api.get(`/reports/income?period=${period}`),
  getProductivityReport: (period) => api.get(`/reports/productivity?period=${period}`),
  getClientProfitability: () => api.get('/reports/client-profitability'),
};

// Notifications API
export const notificationsAPI = {
  getAll: () => api.get('/notifications'),
  getUnread: () => api.get('/notifications/unread'),
  markAsRead: (id) => api.put(`/notifications/${id}/read`),
  markAllAsRead: () => api.put('/notifications/read-all'),
  delete: (id) => api.delete(`/notifications/${id}`),
};

// Comments API
export const commentsAPI = {
  getByTask: (taskId) => api.get(`/comments/task/${taskId}`),
  create: (data) => api.post('/comments', data),
  update: (id, data) => api.put(`/comments/${id}`, data),
  delete: (id) => api.delete(`/comments/${id}`),
};

// Files API
export const filesAPI = {
  upload: (file, projectId, taskId) => {
    const formData = new FormData();
    formData.append('file', file);
    if (projectId) formData.append('projectId', projectId);
    if (taskId) formData.append('taskId', taskId);
    return api.post('/files/upload', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getByProject: (projectId) => api.get(`/files/project/${projectId}`),
  getByTask: (taskId) => api.get(`/files/task/${taskId}`),
  delete: (id) => api.delete(`/files/${id}`),
  download: (id) => api.get(`/files/${id}/download`, { responseType: 'blob' }),
};

// Payment Gateway API
export const paymentAPI = {
  getGateways: () => api.get('/payment/gateways'),
  connectGateway: (gateway, data) => api.post(`/payment/gateways/${gateway}/connect`, data),
  disconnectGateway: (gateway) => api.delete(`/payment/gateways/${gateway}/disconnect`),
  processPayment: (invoiceId, gateway) => api.post(`/payment/process/${invoiceId}`, { gateway }),
};

// Settings API
export const settingsAPI = {
  updateProfile: (data) => api.put('/settings/profile', data),
  updateBranding: (data) => {
    const formData = new FormData();
    if (data.logo) formData.append('logo', data.logo);
    if (data.primaryColor) formData.append('primaryColor', data.primaryColor);
    if (data.secondaryColor) formData.append('secondaryColor', data.secondaryColor);
    return api.post('/settings/branding', formData, {
      headers: { 'Content-Type': 'multipart/form-data' },
    });
  },
  getBranding: () => api.get('/settings/branding'),
};

// Payment Reminders API
export const remindersAPI = {
  getAll: () => api.get('/payment-reminders'),
  create: (data) => api.post('/payment-reminders', data),
  update: (id, data) => api.put(`/payment-reminders/${id}`, data),
  delete: (id) => api.delete(`/payment-reminders/${id}`),
  sendReminder: (invoiceId) => api.post(`/payment-reminders/send/${invoiceId}`),
};

export default api;

