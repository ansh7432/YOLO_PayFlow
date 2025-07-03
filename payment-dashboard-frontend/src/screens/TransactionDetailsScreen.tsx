import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  TouchableOpacity,
} from 'react-native';
import { Payment } from '../types';

interface Props {
  route: {
    params: {
      payment: Payment;
    };
  };
  navigation: any;
}

export default function TransactionDetailsScreen({ route, navigation }: Props) {
  const payment = route?.params?.payment;

  // If no payment data, show error or navigate back
  if (!payment) {
    return (
      <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
        <Text>No transaction data found</Text>
        <TouchableOpacity onPress={() => navigation.goBack()}>
          <Text>Go Back</Text>
        </TouchableOpacity>
      </View>
    );
  }

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleString('en-US', {
      year: 'numeric',
      month: 'long',
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

  const DetailRow = ({ label, value, valueStyle = {} }: { label: string; value: string; valueStyle?: any }) => (
    <View style={styles.detailRow}>
      <Text style={styles.detailLabel}>{label}</Text>
      <Text style={[styles.detailValue, valueStyle]}>{value}</Text>
    </View>
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
        <Text style={styles.title}>Transaction Details</Text>
      </View>

      <ScrollView style={styles.content} showsVerticalScrollIndicator={false}>
        {/* Status Card */}
        <View style={styles.statusCard}>
          <View style={[
            styles.statusBadge,
            { backgroundColor: getStatusColor(payment.status) }
          ]}>
            <Text style={styles.statusText}>{payment.status.toUpperCase()}</Text>
          </View>
          <Text style={styles.transactionId}>{payment.transactionId}</Text>
        </View>

        {/* Amount Card */}
        <View style={styles.card}>
          <Text style={styles.amountLabel}>Amount</Text>
          <Text style={styles.amount}>{formatCurrency(payment.amount)}</Text>
          {payment.fee > 0 && (
            <Text style={styles.fee}>Fee: {formatCurrency(payment.fee)}</Text>
          )}
        </View>

        {/* Payment Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Payment Information</Text>
          
          <DetailRow label="Receiver" value={payment.receiver} />
          <DetailRow label="Payment Method" value={getMethodDisplay(payment.method)} />
          <DetailRow label="Currency" value={payment.currency} />
          
          {payment.description && (
            <DetailRow label="Description" value={payment.description} />
          )}
          
          <DetailRow 
            label="Date Created" 
            value={formatDate(payment.createdAt)} 
          />
          <DetailRow 
            label="Last Updated" 
            value={formatDate(payment.updatedAt)} 
          />
        </View>

        {/* Technical Details */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Technical Information</Text>
          
          <DetailRow 
            label="Transaction ID" 
            value={payment.transactionId}
            valueStyle={styles.monospace}
          />
          <DetailRow 
            label="Database ID" 
            value={payment._id}
            valueStyle={styles.monospace}
          />
        </View>

        {/* Timeline */}
        <View style={styles.card}>
          <Text style={styles.cardTitle}>Timeline</Text>
          
          <View style={styles.timelineItem}>
            <View style={styles.timelineDot} />
            <View style={styles.timelineContent}>
              <Text style={styles.timelineTitle}>Payment Created</Text>
              <Text style={styles.timelineDate}>{formatDate(payment.createdAt)}</Text>
            </View>
          </View>
          
          {payment.updatedAt !== payment.createdAt && (
            <View style={styles.timelineItem}>
              <View style={[
                styles.timelineDot,
                { backgroundColor: getStatusColor(payment.status) }
              ]} />
              <View style={styles.timelineContent}>
                <Text style={styles.timelineTitle}>Status Updated</Text>
                <Text style={styles.timelineDate}>{formatDate(payment.updatedAt)}</Text>
                <Text style={styles.timelineStatus}>Status: {payment.status}</Text>
              </View>
            </View>
          )}
        </View>
      </ScrollView>
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
    padding: 20,
  },
  statusCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    alignItems: 'center',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  statusBadge: {
    paddingHorizontal: 20,
    paddingVertical: 8,
    borderRadius: 20,
    marginBottom: 10,
  },
  statusText: {
    fontSize: 14,
    fontWeight: 'bold',
    color: '#fff',
  },
  transactionId: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    fontFamily: 'monospace',
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    marginBottom: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  amountLabel: {
    fontSize: 16,
    color: '#666',
    marginBottom: 5,
    textAlign: 'center',
  },
  amount: {
    fontSize: 36,
    fontWeight: 'bold',
    color: '#667eea',
    textAlign: 'center',
    marginBottom: 5,
  },
  fee: {
    fontSize: 14,
    color: '#999',
    textAlign: 'center',
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 8,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  detailLabel: {
    fontSize: 16,
    color: '#666',
    flex: 1,
  },
  detailValue: {
    fontSize: 16,
    color: '#333',
    fontWeight: '600',
    flex: 2,
    textAlign: 'right',
  },
  monospace: {
    fontFamily: 'monospace',
    fontSize: 14,
  },
  timelineItem: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    marginBottom: 20,
  },
  timelineDot: {
    width: 12,
    height: 12,
    borderRadius: 6,
    backgroundColor: '#667eea',
    marginTop: 4,
    marginRight: 15,
  },
  timelineContent: {
    flex: 1,
  },
  timelineTitle: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 4,
  },
  timelineDate: {
    fontSize: 14,
    color: '#666',
    marginBottom: 2,
  },
  timelineStatus: {
    fontSize: 14,
    color: '#999',
  },
});
