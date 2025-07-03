import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity } from 'react-native';
import { Payment } from '../types';

interface Props {
  payment: Payment;
  onPress: () => void;
}

export default function TransactionCard({ payment, onPress }: Props) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return '#22c55e';
      case 'failed':
        return '#ef4444';
      case 'pending':
        return '#f59e0b';
      default:
        return '#6b7280';
    }
  };

  const getMethodDisplay = (method: string) => {
    switch (method) {
      case 'credit_card':
        return 'Credit Card';
      case 'debit_card':
        return 'Debit Card';
      case 'paypal':
        return 'PayPal';
      case 'bank_transfer':
        return 'Bank Transfer';
      case 'crypto':
        return 'Cryptocurrency';
      default:
        return method;
    }
  };

  return (
    <TouchableOpacity style={styles.card} onPress={onPress}>
      <View style={styles.header}>
        <Text style={styles.receiver}>{payment.receiver}</Text>
        <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
      </View>
      
      <View style={styles.details}>
        <Text style={styles.method}>{getMethodDisplay(payment.method)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(payment.status) }]}>
          <Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.footer}>
        <Text style={styles.transactionId}>ID: {payment.transactionId}</Text>
        <Text style={styles.date}>{formatDate(payment.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 16,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  receiver: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    flex: 1,
  },
  amount: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#667eea',
  },
  details: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 8,
  },
  method: {
    fontSize: 14,
    color: '#666',
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  footer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  transactionId: {
    fontSize: 12,
    color: '#999',
  },
  date: {
    fontSize: 12,
    color: '#999',
  },
});
