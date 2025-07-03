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
} from 'react-native';
import { paymentsAPI, CreatePaymentRequest } from '../services/api';

interface Props {
  navigation: any;
}

export default function AddPaymentScreen({ navigation }: Props) {
  const [formData, setFormData] = useState({
    amount: '',
    receiver: '',
    status: 'success' as 'success' | 'failed' | 'pending',
    method: 'credit_card' as 'credit_card' | 'debit_card' | 'paypal' | 'bank_transfer' | 'crypto',
    description: '',
    currency: 'INR',
  });
  
  const [loading, setLoading] = useState(false);
  const [showStatusPicker, setShowStatusPicker] = useState(false);
  const [showMethodPicker, setShowMethodPicker] = useState(false);

  const statusOptions = [
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  const methodOptions = [
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'crypto', label: 'Cryptocurrency' },
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
        amount,
        receiver: formData.receiver.trim(),
        status: formData.status,
        method: formData.method,
        description: formData.description.trim() || undefined,
        currency: formData.currency,
      };

      await paymentsAPI.create(paymentData);
      
      Alert.alert(
        'Success',
        'Payment has been created successfully!',
        [
          {
            text: 'OK',
            onPress: () => {
              // Reset form
              setFormData({
                amount: '',
                receiver: '',
                status: 'success',
                method: 'credit_card',
                description: '',
                currency: 'INR',
              });
              // Navigate back or to transaction list
              navigation.navigate('Transactions');
            },
          },
        ]
      );
    } catch (error: any) {
      Alert.alert(
        'Error',
        error.response?.data?.message || 'Failed to create payment'
      );
    } finally {
      setLoading(false);
    }
  };

  const PickerModal = ({ 
    visible, 
    onClose, 
    title, 
    options, 
    selectedValue, 
    onSelect 
  }: {
    visible: boolean;
    onClose: () => void;
    title: string;
    options: Array<{ value: string; label: string }>;
    selectedValue: string;
    onSelect: (value: string) => void;
  }) => (
    <Modal
      visible={visible}
      animationType="slide"
      transparent={true}
      onRequestClose={onClose}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>{title}</Text>
          
          {options.map((option) => (
            <TouchableOpacity
              key={option.value}
              style={[
                styles.pickerOption,
                selectedValue === option.value && styles.pickerOptionSelected
              ]}
              onPress={() => {
                onSelect(option.value);
                onClose();
              }}
            >
              <Text style={[
                styles.pickerOptionText,
                selectedValue === option.value && styles.pickerOptionTextSelected
              ]}>
                {option.label}
              </Text>
            </TouchableOpacity>
          ))}
          
          <TouchableOpacity
            style={styles.modalCloseButton}
            onPress={onClose}
          >
            <Text style={styles.modalCloseButtonText}>Cancel</Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <TouchableOpacity
          style={styles.backButton}
          onPress={() => navigation.goBack()}
        >
          <Text style={styles.backButtonText}>← Back</Text>
        </TouchableOpacity>
        <Text style={styles.title}>Add New Payment</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        <View style={styles.form}>
          <View style={styles.inputGroup}>
            <Text style={styles.label}>Amount (INR) *</Text>
            <TextInput
              style={styles.input}
              placeholder="0.00"
              placeholderTextColor="#999"
              value={formData.amount}
              onChangeText={(text) => setFormData(prev => ({ ...prev, amount: text }))}
              keyboardType="numeric"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Receiver *</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter receiver name"
              placeholderTextColor="#999"
              value={formData.receiver}
              onChangeText={(text) => setFormData(prev => ({ ...prev, receiver: text }))}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Status *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowStatusPicker(true)}
            >
              <Text style={styles.pickerText}>
                {statusOptions.find(opt => opt.value === formData.status)?.label}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Payment Method *</Text>
            <TouchableOpacity
              style={styles.picker}
              onPress={() => setShowMethodPicker(true)}
            >
              <Text style={styles.pickerText}>
                {methodOptions.find(opt => opt.value === formData.method)?.label}
              </Text>
              <Text style={styles.pickerArrow}>▼</Text>
            </TouchableOpacity>
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Description</Text>
            <TextInput
              style={[styles.input, styles.textArea]}
              placeholder="Optional description"
              placeholderTextColor="#999"
              value={formData.description}
              onChangeText={(text) => setFormData(prev => ({ ...prev, description: text }))}
              multiline
              numberOfLines={3}
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.label}>Currency</Text>
            <TextInput
              style={styles.input}
              placeholder="INR"
              placeholderTextColor="#999"
              value={formData.currency}
              onChangeText={(text) => setFormData(prev => ({ ...prev, currency: text }))}
              maxLength={3}
              autoCapitalize="characters"
            />
          </View>

          <TouchableOpacity
            style={[styles.submitButton, loading && styles.submitButtonDisabled]}
            onPress={handleSubmit}
            disabled={loading}
          >
            {loading ? (
              <ActivityIndicator color="#fff" />
            ) : (
              <Text style={styles.submitButtonText}>Create Payment</Text>
            )}
          </TouchableOpacity>
        </View>
      </ScrollView>

      <PickerModal
        visible={showStatusPicker}
        onClose={() => setShowStatusPicker(false)}
        title="Select Status"
        options={statusOptions}
        selectedValue={formData.status}
        onSelect={(value) => setFormData(prev => ({ ...prev, status: value as any }))}
      />

      <PickerModal
        visible={showMethodPicker}
        onClose={() => setShowMethodPicker(false)}
        title="Select Payment Method"
        options={methodOptions}
        selectedValue={formData.method}
        onSelect={(value) => setFormData(prev => ({ ...prev, method: value as any }))}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
  },
  backButton: {
    marginBottom: 10,
  },
  backButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  content: {
    flex: 1,
  },
  form: {
    padding: 20,
  },
  inputGroup: {
    marginBottom: 20,
  },
  label: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    fontSize: 16,
    borderWidth: 1,
    borderColor: '#ddd',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  textArea: {
    height: 80,
    textAlignVertical: 'top',
  },
  picker: {
    backgroundColor: '#fff',
    borderRadius: 10,
    padding: 15,
    borderWidth: 1,
    borderColor: '#ddd',
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 1,
    },
    shadowOpacity: 0.05,
    shadowRadius: 2,
    elevation: 2,
  },
  pickerText: {
    fontSize: 16,
    color: '#333',
  },
  pickerArrow: {
    fontSize: 12,
    color: '#999',
  },
  submitButton: {
    backgroundColor: '#667eea',
    borderRadius: 10,
    padding: 15,
    alignItems: 'center',
    marginTop: 30,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  submitButtonDisabled: {
    opacity: 0.7,
  },
  submitButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  modalContent: {
    backgroundColor: '#fff',
    borderRadius: 20,
    padding: 25,
    margin: 20,
    width: '80%',
    maxHeight: '70%',
  },
  modalTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  pickerOption: {
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  pickerOptionSelected: {
    backgroundColor: '#f0f4ff',
  },
  pickerOptionText: {
    fontSize: 16,
    color: '#333',
  },
  pickerOptionTextSelected: {
    color: '#667eea',
    fontWeight: '600',
  },
  modalCloseButton: {
    marginTop: 20,
    padding: 15,
    backgroundColor: '#f5f5f5',
    borderRadius: 10,
    alignItems: 'center',
  },
  modalCloseButtonText: {
    fontSize: 16,
    color: '#666',
    fontWeight: '600',
  },
});
