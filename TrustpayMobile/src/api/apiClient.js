import AsyncStorage from '@react-native-async-storage/async-storage';

const BASE_URL = 'https://api.trustdepo.com';
const TOKEN_KEY = 'trustpay_access_token';
const REFRESH_TOKEN_KEY = 'trustpay_refresh_token';

export const getToken = async () => {
  try {
    return await AsyncStorage.getItem(TOKEN_KEY);
  } catch {
    return null;
  }
};

export const setToken = async (token) => {
  try {
    await AsyncStorage.setItem(TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save token:', e);
  }
};

export const removeToken = async () => {
  try {
    await AsyncStorage.multiRemove([TOKEN_KEY, REFRESH_TOKEN_KEY]);
  } catch (e) {
    console.error('Failed to remove token:', e);
  }
};

export const setRefreshToken = async (token) => {
  try {
    if (token) await AsyncStorage.setItem(REFRESH_TOKEN_KEY, token);
  } catch (e) {
    console.error('Failed to save refresh token:', e);
  }
};

export const getRefreshToken = async () => {
  try {
    return await AsyncStorage.getItem(REFRESH_TOKEN_KEY);
  } catch {
    return null;
  }
};

async function request(method, path, body = null, requiresAuth = true) {
  const headers = {
    'Content-Type': 'application/json',
    Accept: 'application/json',
  };

  if (requiresAuth) {
    const token = await getToken();
    if (token) {
      headers['Authorization'] = `Bearer ${token}`;
    }
  }

  const options = {
    method,
    headers,
  };

  if (body !== null) {
    options.body = JSON.stringify(body);
  }

  const response = await fetch(`${BASE_URL}${path}`, options);

  let data;
  try {
    data = await response.json();
  } catch {
    data = {};
  }

  if (!response.ok) {
    const error = new Error(data.message || data.error || `Request failed with status ${response.status}`);
    error.status = response.status;
    error.data = data;
    throw error;
  }

  return data;
}

export const api = {
  get: (path, requiresAuth = true) => request('GET', path, null, requiresAuth),
  post: (path, body, requiresAuth = true) => request('POST', path, body, requiresAuth),
  put: (path, body, requiresAuth = true) => request('PUT', path, body, requiresAuth),
  delete: (path, requiresAuth = true) => request('DELETE', path, null, requiresAuth),
};

// Auth endpoints
export const authApi = {
  login: (credentials) => api.post('/api/auth/login', credentials, false),
  register: (data) => api.post('/api/auth/register', data, false),
  getMe: () => api.get('/api/auth/me'),
  updateMe: (data) => api.put('/api/auth/me', data),
  deleteMe: () => api.delete('/api/auth/me'),
  lookupUser: (username) => api.get(`/api/user/lookup?username=${encodeURIComponent(username)}`),
  forgotPassword: (email) => api.post('/api/auth/forgot-password', { email }, false),
  changePassword: (current_password, new_password) => api.put('/api/auth/change-password', { current_password, new_password }),
};

// Transaction endpoints
export const transactionApi = {
  getAll: () => api.get('/api/transactions'),
  getById: (id) => api.get(`/api/transactions?id=${id}`),
  createEscrow: (data) => api.post('/api/functions/createEscrow', data),
  confirmEscrow: (transaction_id) => api.post('/api/functions/confirmEscrow', { transaction_id }),
  cancelEscrow: (transaction_id) => api.post('/api/functions/cancelEscrow', { transaction_id }),
  disputeEscrow: (transaction_id, reason, file_url) =>
    api.post('/api/functions/disputeEscrow', { transaction_id, reason, ...(file_url && { file_url }) }),
  uploadDisputeFile: async (fileUri, fileName, mimeType) => {
    const token = await getToken();
    const formData = new FormData();
    formData.append('file', { uri: fileUri, name: fileName, type: mimeType || 'application/octet-stream' });

    const response = await fetch(`${BASE_URL}/api/upload/dispute`, {
      method: 'POST',
      headers: {
        Accept: 'application/json',
        ...(token ? { Authorization: `Bearer ${token}` } : {}),
        // No Content-Type — fetch sets it automatically with multipart boundary
      },
      body: formData,
    });

    let data;
    try { data = await response.json(); } catch { data = {}; }

    if (!response.ok) {
      const error = new Error(data.message || data.error || `Upload failed with status ${response.status}`);
      error.status = response.status;
      throw error;
    }

    return data; // { url, name, size }
  },
};

// Dispute endpoints
export const disputeApi = {
  getMyDisputes: () => api.get('/api/user/disputes'),
};

// Bank account endpoints
export const bankApi = {
  getAll: () => api.get('/api/user/bank-accounts'),
  add: (data) => api.post('/api/user/bank-accounts', data),
  remove: (id) => api.delete(`/api/user/bank-accounts/${id}`),
};

// Withdrawal
export const withdrawalApi = {
  request: (amount) => api.post('/api/functions/withdrawalRequest', { amount }),
};

// Payments / Stripe
export const paymentApi = {
  createPaymentIntent: (amount, transaction_id) =>
    api.post('/api/payments/create-payment-intent', { amount, transaction_id }),
  fundTransaction: (transaction_id, payment_intent_id) =>
    api.post('/api/payments/fund-transaction', { transaction_id, payment_intent_id }),
};

// Stripe Connect
export const connectApi = {
  addBankAccount: (account_holder_name, account_number, sort_code) =>
    api.post('/api/user/connect/add-bank', { account_holder_name, account_number, sort_code }),
  getStatus: () => api.get('/api/user/connect/status'),
};

// Admin withdrawals
export const adminWithdrawalApi = {
  getAll: (status = 'pending') => api.get(`/api/admin/withdrawals?status=${status}`),
  approve: (id) => api.post(`/api/admin/withdrawals/${id}/approve`, {}),
  reject: (id, reason) => api.post(`/api/admin/withdrawals/${id}/reject`, { reason }),
};

// Live Chat
export const chatApi = {
  start: (subject) => api.post('/api/user/chat/start', { subject }),
  getMessages: (conversation_id) => api.get(`/api/user/chat/messages?conversation_id=${conversation_id}`),
  sendMessage: (conversation_id, content) => api.post('/api/user/chat/messages', { conversation_id, content }),
};
