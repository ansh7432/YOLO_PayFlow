import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  TextInput,
  Alert,
  RefreshControl,
  Modal,
  Platform,
} from 'react-native';
import * as FileSystem from 'expo-file-system';
import { paymentsAPI, Payment, PaymentsResponse } from '../services/api';
import { exportCsv } from '../utils/csvExport';

interface Props {
  navigation: any;
}

export default function TransactionListScreen({ navigation }: Props) {
  const [payments, setPayments] = useState<Payment[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [searchQuery, setSearchQuery] = useState('');
  const [showFilters, setShowFilters] = useState(false);
  const [filters, setFilters] = useState({
    status: '',
    method: '',
  });

  const handleCsvDownload = async () => {
    try {
      const params = {
        ...(filters.status && { status: filters.status }),
        ...(filters.method && { method: filters.method }),
      };

      const csvBlob = await paymentsAPI.exportToCsv(params);
      await exportCsv(csvBlob, `transactions_${new Date().toISOString().split('T')[0]}.csv`);
    } catch (error) {
      Alert.alert('Error', 'Failed to export transactions');
      console.error('CSV export error:', error);
    }
  };

  const fetchPayments = async (pageNum = 1, reset = false) => {
    try {
      const params = {
        page: pageNum,
        limit: 20,
        ...(filters.status && { status: filters.status }),
        ...(filters.method && { method: filters.method }),
      };

      const data = await paymentsAPI.getAll(params);
      
      // Handle both array and paginated object responses
      const paymentsData = Array.isArray(data) ? data : data.payments;
      const totalPages = Array.isArray(data) ? 1 : data.totalPages;
      
      if (reset) {
        setPayments(paymentsData);
      } else {
        setPayments(prev => [...prev, ...paymentsData]);
      }
      
      setHasMore(pageNum < totalPages);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch payments');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchPayments(1, true);
  }, [filters]);

  const onRefresh = () => {
    setRefreshing(true);
    setPage(1);
    fetchPayments(1, true);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPayments(nextPage);
    }
  };

  const filteredPayments = payments.filter(payment =>
    payment.receiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment._id.toLowerCase().includes(searchQuery.toLowerCase())
  );

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

  const renderPaymentItem = ({ item }: { item: Payment }) => (
    <TouchableOpacity
      style={styles.paymentCard}
      onPress={() => navigation.navigate('TransactionDetails', { payment: item })}
    >
      <View style={styles.paymentHeader}>
        <Text style={styles.receiver}>{item.receiver}</Text>
        <Text style={styles.amount}>{formatCurrency(item.amount)}</Text>
      </View>
      
      <View style={styles.paymentDetails}>
        <Text style={styles.method}>{getMethodDisplay(item.method)}</Text>
        <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
          <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
        </View>
      </View>
      
      <View style={styles.paymentFooter}>
        <Text style={styles.transactionId}>ID: {item._id}</Text>
        <Text style={styles.date}>{formatDate(item.createdAt)}</Text>
      </View>
    </TouchableOpacity>
  );

  const FilterModal = () => (
    <Modal
      visible={showFilters}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowFilters(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Filter Payments</Text>
          
          <Text style={styles.filterLabel}>Status</Text>
          <View style={styles.filterOptions}>
            {['', 'success', 'failed', 'pending'].map(status => (
              <TouchableOpacity
                key={status}
                style={[
                  styles.filterOption,
                  filters.status === status && styles.filterOptionActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, status }))}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.status === status && styles.filterOptionTextActive
                ]}>
                  {status || 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <Text style={styles.filterLabel}>Payment Method</Text>
          <View style={styles.filterOptions}>
            {['', 'credit_card', 'debit_card', 'paypal', 'bank_transfer', 'crypto'].map(method => (
              <TouchableOpacity
                key={method}
                style={[
                  styles.filterOption,
                  filters.method === method && styles.filterOptionActive
                ]}
                onPress={() => setFilters(prev => ({ ...prev, method }))}
              >
                <Text style={[
                  styles.filterOptionText,
                  filters.method === method && styles.filterOptionTextActive
                ]}>
                  {method ? getMethodDisplay(method) : 'All'}
                </Text>
              </TouchableOpacity>
            ))}
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => {
                setFilters({ status: '', method: '' });
                setShowFilters(false);
              }}
            >
              <Text style={styles.modalButtonTextSecondary}>Reset</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={() => setShowFilters(false)}
            >
              <Text style={styles.modalButtonTextPrimary}>Apply</Text>
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <View style={styles.titleContainer}>
          <Text style={styles.title}>Transactions</Text>
          <TouchableOpacity
            style={styles.downloadButton}
            onPress={handleCsvDownload}
          >
            <Text style={styles.downloadButtonText}>📥 CSV</Text>
          </TouchableOpacity>
        </View>
        
        <View style={styles.searchContainer}>
          <TextInput
            style={styles.searchInput}
            placeholder="Search by receiver or transaction ID"
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={setSearchQuery}
          />
          
          <TouchableOpacity
            style={styles.filterButton}
            onPress={() => setShowFilters(true)}
          >
            <Text style={styles.filterButtonText}>Filter</Text>
          </TouchableOpacity>
        </View>
      </View>

      <FlatList
        data={filteredPayments}
        renderItem={renderPaymentItem}
        keyExtractor={(item, index) => item._id ? `${item._id}-${index}` : `payment-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        onEndReached={loadMore}
        onEndReachedThreshold={0.1}
        showsVerticalScrollIndicator={false}
      />

      <FilterModal />
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
  titleContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 15,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
    flex: 1,
  },
  downloadButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 8,
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  downloadButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 12,
  },
  searchContainer: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  searchInput: {
    flex: 1,
    backgroundColor: 'rgba(255, 255, 255, 0.9)',
    borderRadius: 10,
    padding: 12,
    fontSize: 16,
    marginRight: 10,
  },
  filterButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 12,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  filterButtonText: {
    color: '#fff',
    fontWeight: '600',
  },
  listContainer: {
    padding: 20,
  },
  paymentCard: {
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
  paymentHeader: {
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
  paymentDetails: {
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
  paymentFooter: {
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
    maxHeight: '80%',
    width: '90%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  filterLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 10,
    marginTop: 15,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
  },
  filterOption: {
    backgroundColor: '#f5f5f5',
    borderRadius: 20,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: '#ddd',
  },
  filterOptionActive: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  filterOptionText: {
    fontSize: 14,
    color: '#333',
  },
  filterOptionTextActive: {
    color: '#fff',
    fontWeight: '600',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
    gap: 10,
  },
  modalButton: {
    flex: 1,
    borderRadius: 10,
    paddingVertical: 12,
    alignItems: 'center',
  },
  modalButtonPrimary: {
    backgroundColor: '#667eea',
  },
  modalButtonSecondary: {
    backgroundColor: 'transparent',
    borderWidth: 1,
    borderColor: '#667eea',
  },
  modalButtonTextPrimary: {
    color: '#fff',
    fontWeight: 'bold',
    fontSize: 16,
  },
  modalButtonTextSecondary: {
    color: '#667eea',
    fontWeight: 'bold',
    fontSize: 16,
  },
});
