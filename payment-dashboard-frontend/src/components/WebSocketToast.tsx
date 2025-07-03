import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, Animated, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { theme } from '../theme/theme';
import { webSocketService } from '../services/websocket';

interface ToastProps {
  message: string;
  type: 'success' | 'info' | 'warning' | 'error';
  visible: boolean;
  onHide: () => void;
}

const Toast: React.FC<ToastProps> = ({ message, type, visible, onHide }) => {
  const [fadeAnim] = useState(new Animated.Value(0));

  useEffect(() => {
    if (visible) {
      Animated.sequence([
        Animated.timing(fadeAnim, {
          toValue: 1,
          duration: 300,
          useNativeDriver: true,
        }),
        Animated.delay(3000),
        Animated.timing(fadeAnim, {
          toValue: 0,
          duration: 300,
          useNativeDriver: true,
        }),
      ]).start(() => {
        onHide();
      });
    }
  }, [visible]);

  const getToastStyle = () => {
    switch (type) {
      case 'success':
        return { backgroundColor: '#28a745' };
      case 'error':
        return { backgroundColor: '#dc3545' };
      case 'warning':
        return { backgroundColor: '#ffc107' };
      default:
        return { backgroundColor: '#007bff' };
    }
  };

  const getIcon = () => {
    switch (type) {
      case 'success':
        return 'check-circle';
      case 'error':
        return 'error';
      case 'warning':
        return 'warning';
      default:
        return 'info';
    }
  };

  if (!visible) return null;

  return (
    <Animated.View
      style={[
        styles.container,
        getToastStyle(),
        { opacity: fadeAnim }
      ]}
    >
      <TouchableOpacity style={styles.content} onPress={onHide}>
        <Icon name={getIcon()} size={20} color="white" />
        <Text style={styles.message}>{message}</Text>
      </TouchableOpacity>
    </Animated.View>
  );
};

export const WebSocketToastProvider: React.FC<{ children: React.ReactNode }> = ({ children }) => {
  const [toast, setToast] = useState<{
    visible: boolean;
    message: string;
    type: 'success' | 'info' | 'warning' | 'error';
  }>({
    visible: false,
    message: '',
    type: 'info',
  });

  useEffect(() => {
    // Listen for WebSocket events and show toasts
    const handlePaymentCreated = () => {
      setToast({
        visible: true,
        message: '💳 New payment received!',
        type: 'success',
      });
    };

    const handlePaymentUpdated = () => {
      setToast({
        visible: true,
        message: '📝 Payment updated',
        type: 'info',
      });
    };

    webSocketService.on('paymentCreated', handlePaymentCreated);
    webSocketService.on('paymentUpdated', handlePaymentUpdated);

    return () => {
      webSocketService.off('paymentCreated', handlePaymentCreated);
      webSocketService.off('paymentUpdated', handlePaymentUpdated);
    };
  }, []);

  const hideToast = () => {
    setToast(prev => ({ ...prev, visible: false }));
  };

  return (
    <View style={{ flex: 1 }}>
      {children}
      <Toast
        visible={toast.visible}
        message={toast.message}
        type={toast.type}
        onHide={hideToast}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    position: 'absolute',
    top: 60,
    left: 20,
    right: 20,
    borderRadius: 8,
    paddingVertical: 12,
    paddingHorizontal: 16,
    zIndex: 1000,
    elevation: 6,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.25,
    shadowRadius: 4,
  },
  content: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  message: {
    color: 'white',
    fontSize: 14,
    fontWeight: '500',
    marginLeft: 8,
    flex: 1,
  },
});
