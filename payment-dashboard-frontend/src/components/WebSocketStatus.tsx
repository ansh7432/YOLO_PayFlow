import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { webSocketService } from '../services/websocket';
import { theme } from '../theme/theme';

export const WebSocketStatus: React.FC = () => {
  const [isConnected, setIsConnected] = useState(false);

  useEffect(() => {
    const checkConnection = () => {
      setIsConnected(webSocketService.isConnected());
    };

    // Check connection status every 3 seconds
    const interval = setInterval(checkConnection, 3000);
    
    // Initial check
    checkConnection();

    return () => clearInterval(interval);
  }, []);

  return (
    <View style={styles.container}>
      <View style={[styles.indicator, { backgroundColor: isConnected ? theme.colors.status.success : theme.colors.status.failed }]} />
      <Text style={styles.text}>
        {isConnected ? 'Live' : 'Offline'}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingHorizontal: 8,
    paddingVertical: 4,
    backgroundColor: 'rgba(255, 255, 255, 0.1)',
    borderRadius: 12,
  },
  indicator: {
    width: 8,
    height: 8,
    borderRadius: 4,
    marginRight: 6,
  },
  text: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    fontWeight: '500',
  },
});
