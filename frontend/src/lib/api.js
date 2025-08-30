// lib/api.js

// API Configuration
const API_CONFIG = {
    baseURL: process.env.NEXT_PUBLIC_API_URL || 'http://localhost:8000',
    apiVersion: '/api/v1'
  };
  
  // Get full API base URL
  export const getApiBaseUrl = () => {
    return `${API_CONFIG.baseURL}${API_CONFIG.apiVersion}`;
  };
  
  // API endpoints object
  export const API_ENDPOINTS = {
    blogs: {
      getAll: () => `${getApiBaseUrl()}/blogs`,
      getById: (id) => `${getApiBaseUrl()}/blogs/${id}`,
      getBySlug: (slug) => `${getApiBaseUrl()}/blogs/slug/${slug}`,
      create: () => `${getApiBaseUrl()}/blogs/create`,
      update: (id) => `${getApiBaseUrl()}/blogs/${id}/update`,
      delete: (id) => `${getApiBaseUrl()}/blogs/${id}/delete`,
      publish: (id) => `${getApiBaseUrl()}/blogs/${id}/publish`,
      like: (id) => `${getApiBaseUrl()}/blogs/${id}/like`,
      unlike: (id) => `${getApiBaseUrl()}/blogs/${id}/unlike`,
      addComment: (id) => `${getApiBaseUrl()}/blogs/${id}/comment`,
      search: (query) => `${getApiBaseUrl()}/blogs/search?q=${query}`,
      byCategory: (category) => `${getApiBaseUrl()}/blogs/category/${category}`,
      byTag: (tag) => `${getApiBaseUrl()}/blogs/tag/${tag}`,
    },
    users: {
      register: () => `${getApiBaseUrl()}/users/register`,
      login: () => `${getApiBaseUrl()}/users/login`,
      logout: () => `${getApiBaseUrl()}/users/logout`,
      getCurrentUser: () => `${getApiBaseUrl()}/users/current-user`,
      refreshToken: () => `${getApiBaseUrl()}/users/refresh-access-token`,
    }
  };
  
  // Generic API call function
  export const apiCall = async (url, options = {}) => {
    try {
      console.log(`🚀 API Call to: ${url}`);
      
      const defaultHeaders = {
        'Content-Type': 'application/json',
      };
  
      const config = {
        method: 'GET',
        headers: defaultHeaders,
        ...options,
        headers: {
          ...defaultHeaders,
          ...options.headers,
        }
      };
  
      const response = await fetch(url, config);
      
      console.log(`📡 Response Status: ${response.status}`);
  
      if (!response.ok) {
        throw new Error(`HTTP error! status: ${response.status}`);
      }
  
      const data = await response.json();
      console.log(`📦 Response Data:`, data);
  
      return data;
  
    } catch (error) {
      console.error(`❌ API Error for ${url}:`, error.message);
      throw error;
    }
  };
  
  // Specific API functions for blogs
  export const blogAPI = {
    // Get all blogs
    getAll: async (params = {}) => {
      const searchParams = new URLSearchParams(params);
      const url = `${API_ENDPOINTS.blogs.getAll()}${searchParams.toString() ? `?${searchParams}` : ''}`;
      return await apiCall(url);
    },
  
    // Get blog by ID
    getById: async (id) => {
      return await apiCall(API_ENDPOINTS.blogs.getById(id));
    },
  
    // Get blog by slug
    getBySlug: async (slug) => {
      return await apiCall(API_ENDPOINTS.blogs.getBySlug(slug));
    },
  
    // Search blogs
    search: async (query) => {
      return await apiCall(API_ENDPOINTS.blogs.search(query));
    },
  
    // Get blogs by category
    getByCategory: async (category, params = {}) => {
      const searchParams = new URLSearchParams(params);
      const url = `${API_ENDPOINTS.blogs.byCategory(category)}${searchParams.toString() ? `?${searchParams}` : ''}`;
      return await apiCall(url);
    },
  
    // Get blogs by tag
    getByTag: async (tag, params = {}) => {
      const searchParams = new URLSearchParams(params);
      const url = `${API_ENDPOINTS.blogs.byTag(tag)}${searchParams.toString() ? `?${searchParams}` : ''}`;
      return await apiCall(url);
    }
  };
  
  export default { API_ENDPOINTS, apiCall, blogAPI };