// Enhanced Theme System for PayFlow
import { Dimensions } from 'react-native';

const { width, height } = Dimensions.get('window');

export const theme = {
  colors: {
    // Primary gradient colors
    primary: {
      start: '#667eea',
      middle: '#764ba2',
      end: '#f093fb',
    },
    secondary: {
      start: '#4facfe',
      end: '#00f2fe',
    },
    success: {
      start: '#11998e',
      end: '#38ef7d',
    },
    warning: {
      start: '#f093fb',
      end: '#f5576c',
    },
    error: {
      start: '#ff416c',
      end: '#ff4b2b',
    },
    
    // Neutral colors
    background: '#f8fafc',
    surface: '#ffffff',
    card: '#ffffff',
    text: {
      primary: '#1e293b',
      secondary: '#64748b',
      tertiary: '#94a3b8',
      inverse: '#ffffff',
    },
    border: '#e2e8f0',
    shadow: 'rgba(0, 0, 0, 0.1)',
    
    // Status colors
    status: {
      success: '#10b981',
      pending: '#f59e0b',
      failed: '#ef4444',
    },
    
    // Payment method colors
    methods: {
      credit_card: '#667eea',
      debit_card: '#4f46e5',
      paypal: '#0070ba',
      bank_transfer: '#059669',
      crypto: '#f59e0b',
    },
  },
  
  gradients: {
    primary: ['#667eea', '#764ba2'],
    secondary: ['#4facfe', '#00f2fe'],
    success: ['#11998e', '#38ef7d'],
    warning: ['#f093fb', '#f5576c'],
    error: ['#ff416c', '#ff4b2b'],
    card: ['#ffffff', '#f8fafc'],
    dashboard: ['#667eea', '#764ba2', '#f093fb'],
  },
  
  spacing: {
    xs: 4,
    sm: 8,
    md: 16,
    lg: 24,
    xl: 32,
    xxl: 48,
  },
  
  borderRadius: {
    sm: 8,
    md: 12,
    lg: 16,
    xl: 24,
    xxl: 32,
    full: 9999,
  },
  
  typography: {
    h1: {
      fontSize: 32,
      fontWeight: 'bold',
      lineHeight: 40,
    },
    h2: {
      fontSize: 24,
      fontWeight: 'bold',
      lineHeight: 32,
    },
    h3: {
      fontSize: 20,
      fontWeight: '600',
      lineHeight: 28,
    },
    body: {
      fontSize: 16,
      fontWeight: 'normal',
      lineHeight: 24,
    },
    caption: {
      fontSize: 14,
      fontWeight: 'normal',
      lineHeight: 20,
    },
  },
  
  shadows: {
    sm: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 1 },
      shadowOpacity: 0.05,
      shadowRadius: 2,
      elevation: 2,
    },
    md: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 4 },
      shadowOpacity: 0.1,
      shadowRadius: 8,
      elevation: 4,
    },
    lg: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 8 },
      shadowOpacity: 0.15,
      shadowRadius: 16,
      elevation: 8,
    },
    xl: {
      shadowColor: '#000',
      shadowOffset: { width: 0, height: 16 },
      shadowOpacity: 0.2,
      shadowRadius: 24,
      elevation: 12,
    },
  },
  
  animations: {
    timing: {
      fast: 200,
      normal: 300,
      slow: 500,
    },
    easing: {
      ease: 'ease',
      easeIn: 'ease-in',
      easeOut: 'ease-out',
      easeInOut: 'ease-in-out',
    },
  },
  
  dimensions: {
    screen: { width, height },
    isSmallScreen: width < 375,
    isMediumScreen: width >= 375 && width < 768,
    isLargeScreen: width >= 768,
  },
};

export type Theme = typeof theme;
