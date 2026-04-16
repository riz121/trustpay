const BASE_URL = 'http://51.21.197.111';
const TOKEN_KEY = 'trustpay_access_token';

export const getToken = () => {
  return localStorage.getItem(TOKEN_KEY) || sessionStorage.getItem(TOKEN_KEY);
};

export const setToken = (token) => {
  localStorage.setItem(TOKEN_KEY, token);
};

export const removeToken = () => {
  localStorage.removeItem(TOKEN_KEY);
};

async function request(method, path, body = null, requiresAuth = true) {
  const headers = { 'Content-Type': 'application/json', Accept: 'application/json' };
  if (requiresAuth) {
    const token = getToken();
    if (token) headers['Authorization'] = `Bearer ${token}`;
  }
  const options = { method, headers };
  if (body !== null) options.body = JSON.stringify(body);
  const response = await fetch(`${BASE_URL}${path}`, options);
  let data;
  try { data = await response.json(); } catch { data = {}; }
  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    throw error;
  }
  return data;
}

export const api = {
  get: (path) => request('GET', path),
  post: (path, body) => request('POST', path, body),
  put: (path, body) => request('PUT', path, body),
  delete: (path) => request('DELETE', path),
};

export const adminApi = {
  // Auth
  login: (credentials) => request('POST', '/api/auth/login', credentials, false),
  getMe: () => api.get('/api/auth/me'),
  // Dashboard
  getDashboard: () => api.get('/api/admin/dashboard'),
  // Users
  getUsers: () => api.get('/api/admin/users'),
  updateUserStatus: (id, data) => api.put(`/api/admin/users/${id}/status`, data),
  // Transactions
  getTransactions: () => api.get('/api/admin/transactions'),
  // Disputes
  getDisputes: () => api.get('/api/admin/disputes'),
  updateDispute: (id, data) => api.put(`/api/admin/disputes/${id}`, data),
  // Reports
  getReports: () => api.get('/api/admin/reports'),
  createReport: (data) => api.post('/api/admin/reports', data),
  // Notifications
  getNotifications: () => api.get('/api/admin/notifications'),
  createNotification: (data) => api.post('/api/admin/notifications', data),
  // Chat
  getConversations: () => api.get('/api/admin/conversations'),
  createConversation: (data) => api.post('/api/admin/conversations', data),
  updateConversation: (id, data) => api.put(`/api/admin/conversations/${id}`, data),
  getMessages: (conversation_id) => api.get(`/api/admin/messages?conversation_id=${conversation_id}`),
  createMessage: (data) => api.post('/api/admin/messages', data),
  // Tickets
  getTickets: () => api.get('/api/admin/tickets'),
  updateTicket: (id, data) => api.put(`/api/admin/tickets/${id}`, data),
  // Audit Logs
  getAuditLogs: () => api.get('/api/admin/audit-logs'),
  // Admin users
  getAdmins: () => api.get('/api/admin/admins'),
  inviteAdmin: (data) => api.post('/api/admin/admins/invite', data),
  updateAdminRole: (id, data) => api.put(`/api/admin/admins/${id}/role`, data),
};

export default adminApi;
