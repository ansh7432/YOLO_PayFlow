import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  Alert,
  Dimensions,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { authAPI } from '../services/api';
import { authUtils } from '../utils/auth';
import { theme } from '../theme/theme';
import { GradientButton } from '../components/GradientButton';
import { EnhancedInput } from '../components/EnhancedInput';
import { GradientCard } from '../components/GradientCard';

const { width, height } = Dimensions.get('window');

interface Props {
  navigation: any;
  onLogin?: () => void;
}

export default function EnhancedLoginScreen({ navigation, onLogin }: Props) {
  const [isLogin, setIsLogin] = useState(true);
  const [loading, setLoading] = useState(false);
  const [formData, setFormData] = useState({
    username: '',
    password: '',
    email: '',
    confirmPassword: '',
    role: 'user' as 'admin' | 'user',
  });
  const [errors, setErrors] = useState<any>({});

  const validateForm = () => {
    const newErrors: any = {};
    
    if (!formData.username.trim()) {
      newErrors.username = 'Username is required';
    } else if (formData.username.length < 3) {
      newErrors.username = 'Username must be at least 3 characters';
    }
    
    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }
    
    if (!isLogin) {
      if (!formData.email.trim()) {
        newErrors.email = 'Email is required';
      } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
        newErrors.email = 'Please enter a valid email';
      }
      
      if (!formData.confirmPassword) {
        newErrors.confirmPassword = 'Please confirm your password';
      } else if (formData.password !== formData.confirmPassword) {
        newErrors.confirmPassword = 'Passwords do not match';
      }
    }
    
    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async () => {
    if (!validateForm()) return;
    
    setLoading(true);
    try {
      if (isLogin) {
        // Login logic
        const response = await authAPI.login({
          username: formData.username,
          password: formData.password,
        });
        
        await authUtils.setAuthData(response.access_token, response.user);
        if (onLogin) {
          onLogin();
        } else {
          navigation.replace('Main');
        }
      } else {
        // Signup logic
        const response = await authAPI.register({
          username: formData.username,
          email: formData.email,
          password: formData.password,
          role: formData.role,
        });
        
        // Automatically log the user in after successful registration
        await authUtils.setAuthData(response.access_token, response.user);
        if (onLogin) {
          onLogin();
        } else {
          navigation.replace('Main');
        }
      }
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || (isLogin ? 'Login failed' : 'Signup failed')
      );
    } finally {
      setLoading(false);
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setFormData({ username: '', password: '', email: '', confirmPassword: '', role: 'user' });
    setErrors({});
  };

  return (
    <KeyboardAvoidingView 
      style={styles.container}
      behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
    >
      <LinearGradient
        colors={theme.gradients.dashboard as any}
        start={{ x: 0, y: 0 }}
        end={{ x: 1, y: 1 }}
        style={styles.background}
      >
        <ScrollView 
          contentContainerStyle={styles.scrollContent}
          showsVerticalScrollIndicator={false}
        >
          {/* Header */}
          <Animatable.View 
            animation="fadeInDown" 
            duration={1000}
            style={styles.header}
          >
            <Text style={styles.title}>💳</Text>
            <Text style={styles.appName}>PayFlow</Text>
            <Text style={styles.subtitle}>
              {isLogin ? 'Welcome back!' : 'Create your account'}
            </Text>
          </Animatable.View>

          {/* Form Card */}
          <Animatable.View 
            animation="fadeInUp" 
            duration={800}
            delay={200}
            style={styles.formContainer}
          >
            <GradientCard variant="default" style={styles.formCard}>
              <View style={styles.formHeader}>
                <Text style={styles.formTitle}>
                  {isLogin ? 'Sign In' : 'Sign Up'}
                </Text>
                <Text style={styles.formSubtitle}>
                  {isLogin 
                    ? 'Enter your credentials to continue' 
                    : 'Fill in your details to get started'
                  }
                </Text>
              </View>

              <View style={styles.form}>
                <EnhancedInput
                  label={isLogin ? "Username or Email" : "Username"}
                  placeholder={isLogin ? "Enter your username or email" : "Enter your username"}
                  value={formData.username}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, username: text }));
                    if (errors.username) setErrors((prev: any) => ({ ...prev, username: null }));
                  }}
                  error={errors.username}
                  success={!errors.username && formData.username.length >= 3}
                  autoCapitalize="none"
                  autoCorrect={false}
                />

                {!isLogin && (
                  <EnhancedInput
                    label="Email"
                    placeholder="Enter your email"
                    value={formData.email}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, email: text }));
                      if (errors.email) setErrors((prev: any) => ({ ...prev, email: null }));
                    }}
                    error={errors.email}
                    success={!errors.email && /\S+@\S+\.\S+/.test(formData.email)}
                    keyboardType="email-address"
                    autoCapitalize="none"
                    autoCorrect={false}
                  />
                )}

                <EnhancedInput
                  label="Password"
                  placeholder="Enter your password"
                  value={formData.password}
                  onChangeText={(text) => {
                    setFormData(prev => ({ ...prev, password: text }));
                    if (errors.password) setErrors((prev: any) => ({ ...prev, password: null }));
                  }}
                  error={errors.password}
                  success={!errors.password && formData.password.length >= 6}
                  secureTextEntry
                />

                {!isLogin && (
                  <EnhancedInput
                    label="Confirm Password"
                    placeholder="Confirm your password"
                    value={formData.confirmPassword}
                    onChangeText={(text) => {
                      setFormData(prev => ({ ...prev, confirmPassword: text }));
                      if (errors.confirmPassword) setErrors((prev: any) => ({ ...prev, confirmPassword: null }));
                    }}
                    error={errors.confirmPassword}
                    success={!errors.confirmPassword && formData.confirmPassword === formData.password}
                    secureTextEntry
                  />
                )}

                {!isLogin && (
                  <View style={styles.roleContainer}>
                    <Text style={styles.roleLabel}>Select Role</Text>
                    <View style={styles.roleSelector}>
                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          formData.role === 'user' && styles.roleOptionSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, role: 'user' }))}
                      >
                        <LinearGradient
                          colors={formData.role === 'user' ? theme.gradients.primary as any : ['#f8fafc', '#f8fafc']}
                          style={styles.roleOptionGradient}
                        >
                          <Icon name="person" size={20} color={formData.role === 'user' ? theme.colors.text.inverse : theme.colors.text.secondary} />
                          <Text style={[
                            styles.roleOptionText,
                            formData.role === 'user' && styles.roleOptionTextSelected
                          ]}>
                            User
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                      
                      <TouchableOpacity
                        style={[
                          styles.roleOption,
                          formData.role === 'admin' && styles.roleOptionSelected,
                        ]}
                        onPress={() => setFormData(prev => ({ ...prev, role: 'admin' }))}
                      >
                        <LinearGradient
                          colors={formData.role === 'admin' ? theme.gradients.primary as any : ['#f8fafc', '#f8fafc']}
                          style={styles.roleOptionGradient}
                        >
                          <Icon name="admin-panel-settings" size={20} color={formData.role === 'admin' ? theme.colors.text.inverse : theme.colors.text.secondary} />
                          <Text style={[
                            styles.roleOptionText,
                            formData.role === 'admin' && styles.roleOptionTextSelected
                          ]}>
                            Admin
                          </Text>
                        </LinearGradient>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                <GradientButton
                  title={isLogin ? 'Sign In' : 'Create Account'}
                  onPress={handleSubmit}
                  loading={loading}
                  size="large"
                  style={styles.submitButton}
                />
              </View>
            </GradientCard>
          </Animatable.View>

          {/* Toggle Mode */}
          <Animatable.View 
            animation="fadeIn" 
            duration={600}
            delay={400}
            style={styles.toggleContainer}
          >
            <Text style={styles.toggleText}>
              {isLogin ? "Don't have an account?" : "Already have an account?"}
            </Text>
            <TouchableOpacity onPress={toggleMode} style={styles.toggleButton}>
              <Text style={styles.toggleButtonText}>
                {isLogin ? 'Sign Up' : 'Sign In'}
              </Text>
            </TouchableOpacity>
          </Animatable.View>

          {/* Demo Credentials */}
          {isLogin && (
            <Animatable.View 
              animation="fadeInUp" 
              duration={600}
              delay={600}
              style={styles.demoContainer}
            >
              <GradientCard variant="secondary" style={styles.demoCard}>
                <Text style={styles.demoTitle}>Demo Credentials</Text>
                <View style={styles.demoRow}>
                  <Text style={styles.demoLabel}>Admin:</Text>
                  <Text style={styles.demoValue}>admin / 123456</Text>
                </View>
                <TouchableOpacity
                  onPress={() => {
                    setFormData(prev => ({ ...prev, username: 'admin', password: '123456' }));
                  }}
                  style={styles.demoButton}
                >
                  <Text style={styles.demoButtonText}>Use Demo Credentials</Text>
                </TouchableOpacity>
              </GradientCard>
            </Animatable.View>
          )}
        </ScrollView>
      </LinearGradient>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  background: {
    flex: 1,
  },
  scrollContent: {
    flexGrow: 1,
    paddingHorizontal: theme.spacing.lg,
    paddingTop: Platform.OS === 'ios' ? 60 : 40,
    paddingBottom: theme.spacing.xl,
  },
  header: {
    alignItems: 'center',
    marginBottom: theme.spacing.xxl,
  },
  title: {
    fontSize: 80,
    marginBottom: theme.spacing.md,
  },
  appName: {
    fontSize: 32,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.sm,
    textAlign: 'center',
  },
  subtitle: {
    fontSize: 18,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    textAlign: 'center',
  },
  formContainer: {
    marginBottom: theme.spacing.xl,
  },
  formCard: {
    paddingHorizontal: theme.spacing.xl,
    paddingVertical: theme.spacing.xxl,
  },
  formHeader: {
    alignItems: 'center',
    marginBottom: theme.spacing.xl,
  },
  formTitle: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  formSubtitle: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    textAlign: 'center',
  },
  form: {
    width: '100%',
  },
  submitButton: {
    marginTop: theme.spacing.lg,
  },
  toggleContainer: {
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  toggleText: {
    fontSize: 16,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  toggleButton: {
    marginLeft: theme.spacing.sm,
  },
  toggleButtonText: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    textDecorationLine: 'underline',
  },
  demoContainer: {
    marginTop: theme.spacing.lg,
  },
  demoCard: {
    padding: theme.spacing.lg,
    alignItems: 'center',
  },
  demoTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.md,
  },
  demoRow: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: theme.spacing.sm,
  },
  demoLabel: {
    fontSize: 16,
    color: theme.colors.text.inverse,
    opacity: 0.9,
    marginRight: theme.spacing.sm,
  },
  demoValue: {
    fontSize: 16,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  demoButton: {
    marginTop: theme.spacing.sm,
    paddingVertical: theme.spacing.sm,
    paddingHorizontal: theme.spacing.lg,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
  },
  demoButtonText: {
    fontSize: 14,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  roleContainer: {
    marginBottom: theme.spacing.lg,
  },
  roleLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  roleOption: {
    flex: 1,
    borderRadius: theme.borderRadius.md,
    overflow: 'hidden',
    ...theme.shadows.sm,
  },
  roleOptionSelected: {
    transform: [{ scale: 1.02 }],
  },
  roleOptionGradient: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    gap: theme.spacing.sm,
  },
  roleOptionText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.secondary,
  },
  roleOptionTextSelected: {
    color: theme.colors.text.inverse,
  },
});
