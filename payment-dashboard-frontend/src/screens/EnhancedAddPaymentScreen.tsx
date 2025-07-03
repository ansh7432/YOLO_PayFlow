import React, { useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TextInput,
  TouchableOpacity,
  Alert,
  ActivityIndicator,
  Modal,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { paymentsAPI, CreatePaymentRequest } from '../services/api';
import { theme } from '../theme/theme';
import { GradientCard } from '../components/GradientCard';
import { GradientButton } from '../components/GradientButton';
import { EnhancedInput } from '../components/EnhancedInput';

interface Props {
  navigation: any;
}

export default function EnhancedAddPaymentScreen({ navigation }: Props) {
  const [formData, setFormData] = useState({
    amount: '',
    receiver: '',
    status: 'success' as 'success' | 'failed' | 'pending',
    method: 'credit_card' as 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto',
    description: '',
  });
  
  const [loading, setLoading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  const statusOptions = [
    { value: 'success', label: 'Success', color: theme.colors.status.success, icon: 'check-circle' },
    { value: 'failed', label: 'Failed', color: theme.colors.status.failed, icon: 'error' },
    { value: 'pending', label: 'Pending', color: theme.colors.status.pending, icon: 'schedule' },
  ];

  const methodOptions = [
    { value: 'credit_card', label: 'Credit Card', icon: 'credit-card', color: theme.colors.methods.credit_card },
    { value: 'debit_card', label: 'Debit Card', icon: 'credit-card', color: theme.colors.methods.debit_card },
    { value: 'paypal', label: 'PayPal', icon: 'account-balance-wallet', color: theme.colors.methods.paypal },
    { value: 'bank_transfer', label: 'Bank Transfer', icon: 'account-balance', color: theme.colors.methods.bank_transfer },
    { value: 'crypto', label: 'Cryptocurrency', icon: 'currency-bitcoin', color: theme.colors.methods.crypto },
  ];

  const handleSubmit = async () => {
    // Validation
    if (!formData.amount || !formData.receiver) {
      Alert.alert('Error', 'Please fill in all required fields');
      return;
    }

    const amount = parseFloat(formData.amount);
    if (isNaN(amount) || amount <= 0) {
      Alert.alert('Error', 'Please enter a valid amount');
      return;
    }

    setLoading(true);
    
    try {
      const paymentData: CreatePaymentRequest = {
        amount: amount,
        receiver: formData.receiver,
        status: formData.status,
        method: formData.method,
        description: formData.description || undefined,
        currency: 'INR',
      };

      await paymentsAPI.create(paymentData);
      
      Alert.alert(
        'Success',
        'Payment created successfully!',
        [
          {
            text: 'OK',
            onPress: () => navigation.goBack(),
          },
        ]
      );
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create payment');
    } finally {
      setLoading(false);
    }
  };

  const getCurrentStatusOption = () => {
    return statusOptions.find(option => option.value === formData.status);
  };

  const getCurrentMethodOption = () => {
    return methodOptions.find(option => option.value === formData.method);
  };

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={theme.gradients.primary as any} style={styles.header}>
        <Animatable.View animation="fadeInDown" style={styles.headerContent}>
          <TouchableOpacity
            style={styles.backButton}
            onPress={() => navigation.goBack()}
          >
            <Icon name="arrow-back" size={24} color={theme.colors.text.inverse} />
          </TouchableOpacity>
          <Text style={styles.headerTitle}>Add Payment</Text>
          <View style={styles.headerSpacer} />
        </Animatable.View>
      </LinearGradient>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <Animatable.View animation="fadeInUp" delay={200}>
          <GradientCard style={styles.formCard}>
            <Text style={styles.formTitle}>Payment Details</Text>
            
            <View style={styles.formGroup}>
              <Text style={styles.label}>Amount (INR) *</Text>
              <EnhancedInput
                placeholder="Enter amount"
                value={formData.amount}
                onChangeText={(text) => setFormData({ ...formData, amount: text })}
                keyboardType="numeric"
                icon={<Icon name="attach-money" size={20} color={theme.colors.text.secondary} />}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Receiver *</Text>
              <EnhancedInput
                placeholder="Enter receiver name"
                value={formData.receiver}
                onChangeText={(text) => setFormData({ ...formData, receiver: text })}
                icon={<Icon name="person" size={20} color={theme.colors.text.secondary} />}
                style={styles.input}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Description</Text>
              <EnhancedInput
                placeholder="Enter description (optional)"
                value={formData.description}
                onChangeText={(text) => setFormData({ ...formData, description: text })}
                icon={<Icon name="description" size={20} color={theme.colors.text.secondary} />}
                multiline
                numberOfLines={3}
                style={[styles.input, styles.textArea]}
              />
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Status</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowStatusPicker(true)}
              >
                <View style={styles.pickerContent}>
                  <View style={styles.pickerLeft}>
                    <LinearGradient
                      colors={[getCurrentStatusOption()?.color || theme.colors.text.secondary, getCurrentStatusOption()?.color || theme.colors.text.secondary]}
                      style={styles.pickerIcon}
                    >
                      <Icon name={getCurrentStatusOption()?.icon || 'help'} size={20} color={theme.colors.text.inverse} />
                    </LinearGradient>
                    <Text style={styles.pickerText}>{getCurrentStatusOption()?.label}</Text>
                  </View>
                  <Icon name="keyboard-arrow-down" size={24} color={theme.colors.text.secondary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.formGroup}>
              <Text style={styles.label}>Payment Method</Text>
              <TouchableOpacity
                style={styles.picker}
                onPress={() => setShowMethodPicker(true)}
              >
                <View style={styles.pickerContent}>
                  <View style={styles.pickerLeft}>
                    <LinearGradient
                      colors={[getCurrentMethodOption()?.color || theme.colors.text.secondary, getCurrentMethodOption()?.color || theme.colors.text.secondary]}
                      style={styles.pickerIcon}
                    >
                      <Icon name={getCurrentMethodOption()?.icon || 'payment'} size={20} color={theme.colors.text.inverse} />
                    </LinearGradient>
                    <Text style={styles.pickerText}>{getCurrentMethodOption()?.label}</Text>
                  </View>
                  <Icon name="keyboard-arrow-down" size={24} color={theme.colors.text.secondary} />
                </View>
              </TouchableOpacity>
            </View>

            <View style={styles.buttonContainer}>
              <GradientButton
                title={loading ? 'Creating Payment...' : 'Create Payment'}
                onPress={handleSubmit}
                disabled={loading}
                style={styles.submitButton}
                colors={theme.gradients.primary}
              />
            </View>
          </GradientCard>
        </Animatable.View>
      </ScrollView>

      {/* Status Picker Modal */}
      <Modal
        visible={showStatusPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowStatusPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <LinearGradient colors={theme.gradients.primary as any} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Status</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowStatusPicker(false)}
              >
                <Icon name="close" size={24} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalBody}>
              {statusOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    formData.status === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, status: option.value as any });
                    setShowStatusPicker(false);
                  }}
                >
                  <LinearGradient
                    colors={[option.color, option.color]}
                    style={styles.modalOptionIcon}
                  >
                    <Icon name={option.icon} size={20} color={theme.colors.text.inverse} />
                  </LinearGradient>
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                  {formData.status === option.value && (
                    <Icon name="check" size={20} color={theme.colors.primary.start} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
        </View>
      </Modal>

      {/* Method Picker Modal */}
      <Modal
        visible={showMethodPicker}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowMethodPicker(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <LinearGradient colors={theme.gradients.primary as any} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Select Payment Method</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowMethodPicker(false)}
              >
                <Icon name="close" size={24} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalBody}>
              {methodOptions.map((option) => (
                <TouchableOpacity
                  key={option.value}
                  style={[
                    styles.modalOption,
                    formData.method === option.value && styles.modalOptionSelected,
                  ]}
                  onPress={() => {
                    setFormData({ ...formData, method: option.value as any });
                    setShowMethodPicker(false);
                  }}
                >
                  <LinearGradient
                    colors={[option.color, option.color]}
                    style={styles.modalOptionIcon}
                  >
                    <Icon name={option.icon} size={20} color={theme.colors.text.inverse} />
                  </LinearGradient>
                  <Text style={styles.modalOptionText}>{option.label}</Text>
                  {formData.method === option.value && (
                    <Icon name="check" size={20} color={theme.colors.primary.start} />
                  )}
                </TouchableOpacity>
              ))}
            </View>
          </Animatable.View>
        </View>
      </Modal>
    </SafeAreaView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: theme.colors.background,
  },
  header: {
    paddingTop: Platform.OS === 'ios' ? 0 : 20,
    paddingBottom: theme.spacing.lg,
    paddingHorizontal: theme.spacing.lg,
    borderBottomLeftRadius: theme.borderRadius.xl,
    borderBottomRightRadius: theme.borderRadius.xl,
  },
  headerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  backButton: {
    padding: theme.spacing.sm,
  },
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text.inverse,
    flex: 1,
    textAlign: 'center',
  },
  headerSpacer: {
    width: 40,
  },
  content: {
    flex: 1,
    padding: theme.spacing.lg,
  },
  formCard: {
    padding: theme.spacing.xl,
  },
  formTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xl,
    textAlign: 'center',
  },
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  input: {
    marginBottom: 0,
  },
  textArea: {
    height: 80,
  },
  picker: {
    borderWidth: 1,
    borderColor: theme.colors.border,
    borderRadius: theme.borderRadius.md,
    backgroundColor: theme.colors.surface,
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.md,
    ...theme.shadows.sm,
  },
  pickerContent: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
  },
  pickerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  pickerIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  pickerText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  buttonContainer: {
    marginTop: theme.spacing.xl,
  },
  submitButton: {
    paddingVertical: theme.spacing.md,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'flex-end',
  },
  modalContent: {
    backgroundColor: theme.colors.background,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
    maxHeight: '70%',
  },
  modalHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    padding: theme.spacing.lg,
    borderTopLeftRadius: theme.borderRadius.xl,
    borderTopRightRadius: theme.borderRadius.xl,
  },
  modalTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.inverse,
    flex: 1,
  },
  modalCloseButton: {
    padding: theme.spacing.sm,
  },
  modalBody: {
    padding: theme.spacing.lg,
  },
  modalOption: {
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    marginBottom: theme.spacing.sm,
    backgroundColor: theme.colors.surface,
  },
  modalOptionSelected: {
    backgroundColor: theme.colors.primary.start + '10',
    borderWidth: 1,
    borderColor: theme.colors.primary.start,
  },
  modalOptionIcon: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  modalOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
    flex: 1,
  },
});
