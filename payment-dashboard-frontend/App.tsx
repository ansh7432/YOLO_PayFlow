import React, { useState, useEffect } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import { createStackNavigator } from '@react-navigation/stack';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { View, Text, TouchableOpacity, Alert } from 'react-native';

// Import screens
import EnhancedLoginScreen from './src/screens/EnhancedLoginScreen';
import EnhancedDashboardScreen from './src/screens/EnhancedDashboardScreen';
import EnhancedTransactionListScreen from './src/screens/EnhancedTransactionListScreen';
import TransactionDetailsScreen from './src/screens/TransactionDetailsScreen';
import EnhancedAddPaymentScreen from './src/screens/EnhancedAddPaymentScreen';
import EnhancedUsersScreen from './src/screens/EnhancedUsersScreen';

// Import types and utilities
import { RootStackParamList, MainTabParamList } from './src/types';
import { authUtils } from './src/utils/auth';
import { AuthProvider } from './src/contexts/AuthContext';
import { webSocketService } from './src/services/websocket';
import { WebSocketToastProvider } from './src/components/WebSocketToast';

const Stack = createStackNavigator<RootStackParamList>();
const Tab = createBottomTabNavigator<MainTabParamList>();

function TabBarIcon({ icon }: { icon: string }) {
  return <Text style={{ fontSize: 20 }}>{icon}</Text>;
}

function MainTabs({ onLogout }: { onLogout: () => void }) {
  const [userRole, setUserRole] = useState<string>('user');

  useEffect(() => {
    getUserRole();
  }, []);

  const getUserRole = async () => {
    try {
      const user = await authUtils.getUser();
      setUserRole(user?.role || 'user');
    } catch (error) {
      console.error('Error getting user role:', error);
    }
  };

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: onLogout,
        },
      ]
    );
  };

  return (
    <AuthProvider logout={onLogout}>
      <Tab.Navigator
        screenOptions={{
          tabBarActiveTintColor: '#667eea',
          tabBarInactiveTintColor: '#999',
          tabBarStyle: {
            backgroundColor: '#fff',
            borderTopWidth: 1,
            borderTopColor: '#f0f0f0',
            paddingBottom: 5,
            height: 60,
          },
          headerStyle: {
            backgroundColor: '#667eea',
          },
          headerTintColor: '#fff',
          headerTitleStyle: {
            fontWeight: 'bold',
          },
        }}
      >
      <Tab.Screen
        name="Dashboard"
        component={EnhancedDashboardScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon icon="📊" />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="Transactions"
        component={EnhancedTransactionListScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon icon="💳" />,
          headerShown: false,
        }}
      />
      <Tab.Screen
        name="AddPayment"
        component={EnhancedAddPaymentScreen}
        options={{
          tabBarIcon: ({ color }) => <TabBarIcon icon="➕" />,
          tabBarLabel: 'Add',
          headerShown: false,
        }}
      />
      {/* Only show Users tab for admins */}
      {userRole === 'admin' && (
        <Tab.Screen
          name="Users"
          component={EnhancedUsersScreen}
          options={{
            tabBarIcon: ({ color }) => <TabBarIcon icon="👥" />,
            headerShown: true,
            headerTitle: 'User Management',
            headerStyle: {
              backgroundColor: '#667eea',
            },
            headerTintColor: '#fff',
            headerRight: () => (
              <TouchableOpacity
                onPress={handleLogout}
                style={{ marginRight: 15 }}
              >
                <Text style={{ color: '#fff', fontSize: 16 }}>Logout</Text>
              </TouchableOpacity>
            ),
          }}
        />
      )}
    </Tab.Navigator>
    </AuthProvider>
  );
}

export default function App() {
  const [isAuthenticated, setIsAuthenticated] = useState(false);
  const [isLoading, setIsLoading] = useState(true);

  useEffect(() => {
    checkAuthStatus();
  }, []);

  const checkAuthStatus = async () => {
    try {
      const isAuth = await authUtils.isAuthenticated();
      setIsAuthenticated(isAuth);
      
      // If user is authenticated, connect to WebSocket
      if (isAuth) {
        try {
          await webSocketService.connect();
        } catch (error) {
          console.error('Failed to connect to WebSocket on startup:', error);
        }
      }
    } catch (error) {
      console.error('Error checking auth status:', error);
    } finally {
      setIsLoading(false);
    }
  };

  const handleLogin = async () => {
    setIsAuthenticated(true);
    // Connect to WebSocket when user logs in
    try {
      await webSocketService.connect();
    } catch (error) {
      console.error('Failed to connect to WebSocket:', error);
    }
  };

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>Loading...</Text>
      </View>
    );
  }

  const handleLogout = async () => {
    try {
      // Disconnect WebSocket before logout
      webSocketService.disconnect();
      await authUtils.clearAuthData();
      setIsAuthenticated(false);
    } catch (error) {
      console.error('Error during logout:', error);
    }
  };

  return (
    <WebSocketToastProvider>
      <NavigationContainer>
        <Stack.Navigator screenOptions={{ headerShown: false }}>
          {isAuthenticated ? (
            <>
              <Stack.Screen name="Main">
                {() => <MainTabs onLogout={handleLogout} />}
              </Stack.Screen>
              <Stack.Screen
                name="TransactionDetails"
                component={TransactionDetailsScreen}
              />
            </>
          ) : (
            <Stack.Screen name="Login">
              {(props) => <EnhancedLoginScreen {...props} onLogin={handleLogin} />}
            </Stack.Screen>
          )}
        </Stack.Navigator>
      </NavigationContainer>
    </WebSocketToastProvider>
  );
}
