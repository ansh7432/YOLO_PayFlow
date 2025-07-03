import axios from 'axios';
import AsyncStorage from '@react-native-async-storage/async-storage';
import * as SecureStore from 'expo-secure-store';
import { Platform } from 'react-native';

// Use localhost for web and android emulator (with port forwarding), IP address for real device
// For Android Emulator, we have multiple options:
// Option 1: localhost with port forwarding (current setup)
// Option 2: 10.0.2.2 (Android emulator special IP)
// Option 3: Computer's actual IP address
const getApiBaseUrl = () => {
  if (Platform.OS === 'web') {
    return 'http://localhost:3000';
  }
  
  // For Android emulator - try these in order if connection fails:
  // 1. localhost (requires: adb reverse tcp:3000 tcp:3000)
  return 'http://localhost:3000';
  
  // If localhost doesn't work, try these alternatives:
  // return 'http://10.0.2.2:3000';  // Android emulator special IP
  // return 'http://192.168.182.113:3000';  // Your computer's IP
};

const API_BASE_URL = getApiBaseUrl();

// Debug API URL
console.log('🌐 API Base URL:', API_BASE_URL);
console.log('📱 Platform:', Platform.OS);

// Platform-aware storage utility
const storage = {
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  setItem: async (key: string, value: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  removeItem: async (key: string): Promise<void> => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

// Create axios instance
const api = axios.create({
  baseURL: API_BASE_URL,
  timeout: 10000,
  headers: {
    'Content-Type': 'application/json',
  },
});

// Request interceptor to add auth token
api.interceptors.request.use(
  async (config) => {
    const token = await storage.getItem('token');
    if (token) {
      config.headers.Authorization = `Bearer ${token}`;
    }
    console.log('📤 API Request:', {
      method: config.method?.toUpperCase(),
      url: config.url,
      hasToken: !!token,
      platform: Platform.OS
    });
    return config;
  },
  (error) => {
    console.log('🚨 Request Error:', error);
    return Promise.reject(error);
  }
);

// Response interceptor to handle errors
api.interceptors.response.use(
  (response) => {
    console.log('📥 API Response:', {
      status: response.status,
      url: response.config.url,
      platform: Platform.OS
    });
    return response;
  },
  async (error) => {
    console.log('🚨 API Error:', {
      message: error.message,
      code: error.code,
      status: error.response?.status,
      url: error.config?.url,
      platform: Platform.OS,
      data: error.response?.data
    });

    if (error.code === 'NETWORK_ERROR' || error.code === 'ECONNREFUSED') {
      console.log('🔧 Network Error - Check if backend is running and port forwarding is set up');
      console.log('💡 For Android emulator, run: adb reverse tcp:3000 tcp:3000');
    }

    if (error.response?.status === 401) {
      // Token expired or invalid, logout user
      await storage.removeItem('token');
      await storage.removeItem('user');
    }
    return Promise.reject(error);
  }
);

export interface LoginRequest {
  username: string;
  password: string;
}

export interface LoginResponse {
  access_token: string;
  user: {
    id: string;
    username: string;
    email: string;
    role: string;
  };
}

export interface Payment {
  _id: string;
  amount: number;
  receiver: string;
  status: 'success' | 'failed' | 'pending';
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  description: string;
  createdAt: string;
  updatedAt: string;
}

export interface PaymentsResponse {
  payments: Payment[];
  total: number;
  totalPages: number;
}

export interface PaymentStats {
  totalPaymentsToday: number;
  totalPaymentsWeek: number;
  totalRevenueToday: number;
  totalRevenueWeek: number;
  failedTransactions: number;
  recentPayments: Payment[];
  paymentsByStatus: Array<{ _id: string; count: number }>;
  revenueByDay: Array<{
    _id: { day: number; month: number; year: number };
    revenue: number;
    count: number;
  }>;
}

export interface User {
  _id: string;
  username: string;
  email: string;
  role: 'admin' | 'user';
  createdAt: string;
  updatedAt: string;
}

export interface CreatePaymentRequest {
  amount: number;
  receiver: string;
  status: 'success' | 'failed' | 'pending';
  method: 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto';
  description?: string;
  currency?: string;
}

export interface CreateUserRequest {
  username: string;
  email: string;
  password: string;
  role?: 'admin' | 'user';
}

// API Functions
export const authAPI = {
  login: async (credentials: LoginRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/login', credentials);
    return response.data;
  },

  register: async (userData: CreateUserRequest): Promise<LoginResponse> => {
    const response = await api.post('/auth/register', userData);
    return response.data;
  },

  getProfile: async () => {
    const response = await api.get('/auth/profile');
    return response.data;
  },
};

export const paymentsAPI = {
  getAll: async (params?: any): Promise<Payment[] | PaymentsResponse> => {
    const response = await api.get('/payments', { params });
    return response.data;
  },

  getById: async (id: string): Promise<Payment> => {
    const response = await api.get(`/payments/${id}`);
    return response.data;
  },

  create: async (payment: CreatePaymentRequest): Promise<Payment> => {
    const response = await api.post('/payments', payment);
    return response.data;
  },

  getStats: async (): Promise<PaymentStats> => {
    const response = await api.get('/payments/stats');
    return response.data;
  },

  exportToCsv: async (params?: any): Promise<Blob> => {
    const response = await api.get('/payments/export/csv', { 
      params,
      responseType: 'blob'
    });
    return response.data;
  },
};

export const usersAPI = {
  getAll: async (): Promise<User[]> => {
    const response = await api.get('/users');
    return response.data;
  },

  getById: async (id: string): Promise<User> => {
    const response = await api.get(`/users/${id}`);
    return response.data;
  },

  create: async (user: CreateUserRequest): Promise<User> => {
    const response = await api.post('/users', user);
    return response.data;
  },

  delete: async (id: string): Promise<void> => {
    await api.delete(`/users/${id}`);
  },
};

export default api;
