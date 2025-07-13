// Central API helper for tenant-aware requests with token expiration handling
export async function apiFetch(url, options = {}) {
  const token = localStorage.getItem('token');
  const tenantSlug = localStorage.getItem('tenantSlug');
  const headers = {
    ...options.headers,
    Authorization: token ? `Bearer ${token}` : undefined,
    'Content-Type': 'application/json',
    ...(tenantSlug ? { 'X-Tenant-Slug': tenantSlug } : {}),
  };

  const response = await fetch(url, { ...options, headers });

  if (response.status === 401) {
    // Token expired or invalid
    localStorage.removeItem('token');
    localStorage.removeItem('user');
    sessionStorage.setItem('sessionExpired', 'Your session has expired. Please log in again.');
    window.location.href = '/login'; // Redirect to login
    return;
  }

  return response;
}

// API client with common methods and enhanced error handling
const api = {
  get: async (url) => {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api${url}`);
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - this will be handled by apiFetch
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  post: async (url, data) => {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api${url}`, {
      method: 'POST',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - this will be handled by apiFetch
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  put: async (url, data) => {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api${url}`, {
      method: 'PUT',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - this will be handled by apiFetch
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  patch: async (url, data) => {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api${url}`, {
      method: 'PATCH',
      body: JSON.stringify(data),
    });
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - this will be handled by apiFetch
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  },
  
  delete: async (url) => {
    const response = await apiFetch(`${import.meta.env.VITE_API_URL || 'http://localhost:5000'}/api${url}`, {
      method: 'DELETE',
    });
    if (!response.ok) {
      if (response.status === 401) {
        // Token expired - this will be handled by apiFetch
        return;
      }
      throw new Error(`HTTP error! status: ${response.status}`);
    }
    return response.json();
  }
};

// Utility function to check if user is authenticated
export const isAuthenticated = () => {
  const token = localStorage.getItem('token');
  const user = localStorage.getItem('user');
  return !!(token && user);
};

// Utility function to logout user
export const logout = () => {
  localStorage.removeItem('token');
  localStorage.removeItem('user');
  localStorage.removeItem('tenantSlug');
  window.location.href = '/login';
};

export { api }; 