import axios from 'axios';

// Utility to check if token is expired
export const isTokenExpired = () => {
  const token = localStorage.getItem('token');
  if (!token) return true;
  
  try {
    const payload = JSON.parse(atob(token.split('.')[1]));
    const currentTime = Date.now() / 1000;
    return payload.exp < currentTime;
  } catch (error) {
    console.error('Error checking token expiration:', error);
    return true; // Assume expired if we can't parse it
  }
};

// Utility to clear auth data
export const clearAuthData = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('role');
  localStorage.removeItem('username');
};

const api = axios.create({ 
  baseURL: '/api',
  headers: {
    'Content-Type': 'application/json'
  }
});

// Add token to all requests
api.interceptors.request.use((config) => {
  const token = localStorage.getItem('token');
  if (token) {
    config.headers.Authorization = `Bearer ${token}`;
  }
  return config;
});

// Handle token expiration responses
api.interceptors.response.use(
  (response) => response,
  (error) => {
    if (error.response?.status === 401) {
      // Token expired or invalid
      console.warn('Token expired, redirecting to login');
      localStorage.removeItem('token');
      localStorage.removeItem('role');
      localStorage.removeItem('username');
      
      // Redirect to login page
      if (window.location.pathname !== '/login') {
        window.location.href = '/login';
      }
    }
    return Promise.reject(error);
  }
);

export async function fetchQuotations(params = {}) {
  const response = await api.get('/quotations', { params });
  return response.data?.data || [];
}

export async function fetchQuotation(id) {
  const response = await api.get(`/quotations/${id}`);
  return response.data?.data || response.data;
}

export async function createQuotation(payload) {
  const response = await api.post('/quotations', payload);
  return response.data?.data;
}

export async function calculatePricing(payload) {
  const response = await api.post('/quotations/calculate-pricing', payload);
  return response.data;
}

// ✅ FIXED: Added authentication token
export async function updateQuotation(id, data) {
  const token = localStorage.getItem('token');
  
  const response = await fetch(`/api/quotations/${id}`, {
    method: 'PUT',
    headers: {
      'Content-Type': 'application/json',
      'Authorization': `Bearer ${token}` // ✅ Added token
    },
    body: JSON.stringify(data),
  });
  
  if (!response.ok) {
    const errorData = await response.json();
    throw new Error(errorData.error || 'Failed to update quotation');
  }
  
  return response.json();
}
