/**
 * TrustPay API Client
 * Drop-in replacement for the Base44 SDK.
 * Exposes the same interface used across all page components:
 *   apiClient.auth.*
 *   apiClient.entities.EscrowTransaction.*
 *   apiClient.functions.invoke(name, data)
 */

const BASE_URL = import.meta.env.VITE_API_URL || 'http://localhost:5000';
const TOKEN_KEY = 'trustpay_access_token';

// ── Token helpers ────────────────────────────────────────────────────────────
export function getToken() {
  return localStorage.getItem(TOKEN_KEY);
}

export function setToken(token) {
  localStorage.setItem(TOKEN_KEY, token);
}

export function removeToken() {
  localStorage.removeItem(TOKEN_KEY);
}

// ── Base fetch wrapper ───────────────────────────────────────────────────────
async function request(method, path, body) {
  const headers = { 'Content-Type': 'application/json' };
  const token = getToken();
  if (token) headers['Authorization'] = `Bearer ${token}`;

  const res = await fetch(`${BASE_URL}${path}`, {
    method,
    headers,
    body: body ? JSON.stringify(body) : undefined,
  });

  const json = await res.json().catch(() => ({}));

  if (!res.ok) {
    const err = new Error(json.error || `Request failed: ${res.status}`);
    err.status = res.status;
    throw err;
  }

  return json;
}

// ── Auth ─────────────────────────────────────────────────────────────────────
const auth = {
  /**
   * Sign in with email + password.
   * Returns { user, access_token }.
   */
  async login(email, password) {
    const data = await request('POST', '/api/auth/login', { email, password });
    setToken(data.access_token);
    return data;
  },

  /**
   * Register a new account.
   */
  async register(email, password, full_name) {
    return request('POST', '/api/auth/register', { email, password, full_name });
  },

  /**
   * Return the current authenticated user profile.
   */
  async me() {
    return request('GET', '/api/auth/me');
  },

  /**
   * Update the current user's profile.
   */
  async updateMe(updates) {
    return request('PUT', '/api/auth/me', updates);
  },

  /**
   * Verify the 6-digit OTP code sent to the email after registration.
   * Returns { user, access_token } on success and stores the token.
   */
  async verifyOtp(email, token) {
    const data = await request('POST', '/api/auth/verify-otp', { email, token });
    setToken(data.access_token);
    return data;
  },

  /**
   * Resend the OTP verification code.
   */
  async resendOtp(email) {
    return request('POST', '/api/auth/resend-otp', { email });
  },

  /**
   * Sign out — clears the stored token.
   */
  async logout() {
    try {
      await request('POST', '/api/auth/logout');
    } finally {
      removeToken();
    }
  },

  /**
   * Delete the current user account.
   */
  async deleteAccount() {
    return request('DELETE', '/api/auth/me');
  },
};

// ── Entity helpers ───────────────────────────────────────────────────────────
function buildQueryString(params) {
  const qs = new URLSearchParams();
  for (const [k, v] of Object.entries(params)) {
    if (v !== undefined && v !== null) qs.set(k, v);
  }
  const str = qs.toString();
  return str ? `?${str}` : '';
}

const EscrowTransaction = {
  /**
   * List transactions.
   * @param {string} sortBy  e.g. '-created_date'
   * @param {number} limit
   */
  async list(sortBy = '-created_date', limit = 100) {
    return request('GET', `/api/transactions${buildQueryString({ sort: sortBy, limit })}`);
  },

  /**
   * Filter transactions by field.
   * @param {{ id?: string, status?: string }} filters
   * @returns {Promise<Array>}
   */
  async filter(filters = {}) {
    const data = await request('GET', `/api/transactions${buildQueryString(filters)}`);
    // Always return an array (matches Base44 behaviour)
    return Array.isArray(data) ? data : [data];
  },
};

const entities = { EscrowTransaction };

// ── Functions ────────────────────────────────────────────────────────────────
const functions = {
  /**
   * Invoke a named backend function.
   * Mirrors: base44.functions.invoke(name, data)
   */
  async invoke(name, data = {}) {
    return request('POST', `/api/functions/${name}`, data);
  },
};

// ── User (bank accounts) ─────────────────────────────────────────────────────
const user = {
  async getBankAccounts() {
    return request('GET', '/api/user/bank-accounts');
  },

  async addBankAccount(data) {
    return request('POST', '/api/user/bank-accounts', data);
  },

  async deleteBankAccount(id) {
    return request('DELETE', `/api/user/bank-accounts/${id}`);
  },
};

// ── Default export ────────────────────────────────────────────────────────────
const apiClient = { auth, entities, functions, user };

export default apiClient;
