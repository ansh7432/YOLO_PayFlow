import * as SecureStore from 'expo-secure-store';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { Platform } from 'react-native';

export interface User {
  id: string;
  username: string;
  email: string;
  role: string;
}

// Platform-aware storage utility
const storage = {
  setItem: async (key: string, value: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.setItem(key, value);
    } else {
      await SecureStore.setItemAsync(key, value);
    }
  },
  getItem: async (key: string): Promise<string | null> => {
    if (Platform.OS === 'web') {
      return await AsyncStorage.getItem(key);
    } else {
      return await SecureStore.getItemAsync(key);
    }
  },
  removeItem: async (key: string) => {
    if (Platform.OS === 'web') {
      await AsyncStorage.removeItem(key);
    } else {
      await SecureStore.deleteItemAsync(key);
    }
  },
};

export const authUtils = {
  // Store authentication data
  setAuthData: async (token: string, user: User) => {
    try {
      await storage.setItem('token', token);
      await storage.setItem('user', JSON.stringify(user));
    } catch (error) {
      console.error('Error storing auth data:', error);
    }
  },

  // Get stored token
  getToken: async (): Promise<string | null> => {
    try {
      return await storage.getItem('token');
    } catch (error) {
      console.error('Error getting token:', error);
      return null;
    }
  },

  // Get stored user
  getUser: async (): Promise<User | null> => {
    try {
      const userString = await storage.getItem('user');
      return userString ? JSON.parse(userString) : null;
    } catch (error) {
      console.error('Error getting user:', error);
      return null;
    }
  },

  // Check if user is authenticated
  isAuthenticated: async (): Promise<boolean> => {
    try {
      const token = await storage.getItem('token');
      return !!token;
    } catch (error) {
      console.error('Error checking authentication:', error);
      return false;
    }
  },

  // Clear authentication data (logout)
  clearAuthData: async () => {
    try {
      await storage.removeItem('token');
      await storage.removeItem('user');
    } catch (error) {
      console.error('Error clearing auth data:', error);
    }
  },
};
