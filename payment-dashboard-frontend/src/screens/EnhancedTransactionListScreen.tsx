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
  SafeAreaView,
  Dimensions,
  Platform,
  Linking,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import * as FileSystem from 'expo-file-system';
import { paymentsAPI, Payment } from '../services/api';
import { theme } from '../theme/theme';
import { GradientCard } from '../components/GradientCard';
import { GradientButton } from '../components/GradientButton';
import { EnhancedInput } from '../components/EnhancedInput';
import { exportCsv } from '../utils/csvExport';
import { webSocketService } from '../services/websocket';

const { width } = Dimensions.get('window');

interface Props {
  navigation: any;
}

export default function EnhancedTransactionListScreen({ navigation }: Props) {
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

      const response = await paymentsAPI.getAll(params);
      console.log('💳 Transactions fetched:', response);
      let paymentsData: Payment[];
      let totalPagesData: number;
      if (Array.isArray(response)) {
        paymentsData = response;
        totalPagesData = 1;
      } else {
        paymentsData = response.payments;
        totalPagesData = response.totalPages;
      }
      // Always replace payments on fetch to avoid duplicates
      setPayments(paymentsData);
      setHasMore(pageNum < totalPagesData);
    } catch (error: any) {
      console.error('❌ Error fetching transactions:', error);
      Alert.alert('Error', error.message || 'Failed to fetch transactions');
    } finally {
      setLoading(false);
    }
  };

  const onRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    await fetchPayments(1, true);
    setRefreshing(false);
  };

  const loadMore = () => {
    if (hasMore && !loading) {
      const nextPage = page + 1;
      setPage(nextPage);
      fetchPayments(nextPage);
    }
  };

  const applyFilters = async () => {
    setShowFilters(false);
    setPage(1);
    setLoading(true);
    await fetchPayments(1, true);
    setLoading(false);
  };

  const clearFilters = async () => {
    setFilters({ status: '', method: '' });
    setShowFilters(false);
    setPage(1);
    setLoading(true);
    await fetchPayments(1, true);
    setLoading(false);
  };

  useEffect(() => {
    fetchPayments();
    
    // Set up WebSocket listeners for real-time updates
    const handlePaymentCreated = (payment: Payment) => {
      console.log('📋 Transaction List: Payment created, refreshing...');
      fetchPayments();
    };

    const handlePaymentUpdated = (payment: Payment) => {
      console.log('📋 Transaction List: Payment updated, refreshing...');
      fetchPayments();
    };

    const handlePaymentDeleted = (data: { paymentId: string }) => {
      console.log('📋 Transaction List: Payment deleted, refreshing...');
      fetchPayments();
    };

    webSocketService.on('paymentCreated', handlePaymentCreated);
    webSocketService.on('paymentUpdated', handlePaymentUpdated);
    webSocketService.on('paymentDeleted', handlePaymentDeleted);

    // Cleanup listeners on unmount
    return () => {
      webSocketService.off('paymentCreated', handlePaymentCreated);
      webSocketService.off('paymentUpdated', handlePaymentUpdated);
      webSocketService.off('paymentDeleted', handlePaymentDeleted);
    };
  }, []);

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'success':
        return theme.colors.status.success;
      case 'failed':
        return theme.colors.status.failed;
      case 'pending':
        return theme.colors.status.pending;
      default:
        return theme.colors.text.secondary;
    }
  };

  const getMethodIcon = (method: string) => {
    switch (method) {
      case 'credit_card':
      case 'debit_card':
        return 'credit-card';
      case 'paypal':
        return 'account-balance-wallet';
      case 'bank_transfer':
        return 'account-balance';
      case 'crypto':
        return 'currency-bitcoin';
      default:
        return 'payment';
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      month: 'short',
      day: 'numeric',
      hour: '2-digit',
      minute: '2-digit',
    });
  };

  const filteredPayments = payments.filter(payment =>
    payment.receiver.toLowerCase().includes(searchQuery.toLowerCase()) ||
    payment.description?.toLowerCase().includes(searchQuery.toLowerCase())
  );

  const renderTransaction = ({ item, index }: { item: Payment; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.transactionContainer}
    >
      <GradientCard style={styles.transactionCard}>
        <TouchableOpacity
          style={styles.transactionContent}
          onPress={() => navigation.navigate('TransactionDetails', { payment: item })}
        >
          <View style={styles.transactionHeader}>
            <View style={styles.methodContainer}>
              <LinearGradient
                colors={theme.gradients.primary as any}
                style={styles.methodIcon}
              >
                <Icon name={getMethodIcon(item.method)} size={20} color={theme.colors.text.inverse} />
              </LinearGradient>
              <View style={styles.transactionInfo}>
                <Text style={styles.receiverText}>{item.receiver}</Text>
                <Text style={styles.descriptionText}>
                  {item.description || 'No description'}
                </Text>
              </View>
            </View>
            <View style={styles.amountContainer}>
              <Text style={styles.amountText}>
                {formatCurrency(item.amount)}
              </Text>
              <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
                <Text style={styles.statusText}>{item.status.toUpperCase()}</Text>
              </View>
            </View>
          </View>
          <View style={styles.transactionFooter}>
            <Text style={styles.dateText}>{formatDate(item.createdAt)}</Text>
            <Text style={styles.methodText}>
              {item.method.replace('_', ' ').toUpperCase()}
            </Text>
          </View>
        </TouchableOpacity>
      </GradientCard>
    </Animatable.View>
  );

  const statusOptions = [
    { value: '', label: 'All Status' },
    { value: 'success', label: 'Success' },
    { value: 'failed', label: 'Failed' },
    { value: 'pending', label: 'Pending' },
  ];

  const methodOptions = [
    { value: '', label: 'All Methods' },
    { value: 'credit_card', label: 'Credit Card' },
    { value: 'debit_card', label: 'Debit Card' },
    { value: 'paypal', label: 'PayPal' },
    { value: 'bank_transfer', label: 'Bank Transfer' },
    { value: 'crypto', label: 'Cryptocurrency' },
  ];

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
          <Text style={styles.headerTitle}>Transactions</Text>
          <View style={styles.headerButtons}>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={handleCsvDownload}
            >
              <Icon name="download" size={20} color={theme.colors.text.inverse} />
            </TouchableOpacity>
            <TouchableOpacity
              style={styles.headerButton}
              onPress={() => setShowFilters(true)}
            >
              <Icon name="filter-list" size={20} color={theme.colors.text.inverse} />
            </TouchableOpacity>
          </View>
        </Animatable.View>
        
        <Animatable.View animation="fadeInUp" delay={200} style={styles.searchContainer}>
          <EnhancedInput
            placeholder="Search transactions..."
            value={searchQuery}
            onChangeText={setSearchQuery}
            icon={<Icon name="search" size={20} color={theme.colors.text.secondary} />}
            style={styles.searchInput}
          />
        </Animatable.View>
      </LinearGradient>

      <View style={styles.content}>
        {loading && page === 1 ? (
          <Animatable.View animation="fadeIn" style={styles.loadingContainer}>
            <LinearGradient
              colors={theme.gradients.primary as any}
              style={styles.loadingSpinner}
            >
              <Icon name="sync" size={30} color={theme.colors.text.inverse} />
            </LinearGradient>
            <Text style={styles.loadingText}>Loading transactions...</Text>
          </Animatable.View>
        ) : (
          <FlatList
            data={filteredPayments}
            renderItem={renderTransaction}
            keyExtractor={(item, index) => item._id ? `${item._id}-${index}` : `payment-${index}`}
            contentContainerStyle={styles.listContainer}
            showsVerticalScrollIndicator={false}
            refreshControl={
              <RefreshControl
                refreshing={refreshing}
                onRefresh={onRefresh}
                colors={[theme.colors.primary.start]}
                tintColor={theme.colors.primary.start}
              />
            }
            onEndReached={loadMore}
            onEndReachedThreshold={0.1}
            ListEmptyComponent={
              <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                <LinearGradient
                  colors={theme.gradients.secondary as any}
                  style={styles.emptyIcon}
                >
                  <Icon name="receipt-long" size={50} color={theme.colors.text.inverse} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No transactions found</Text>
                <Text style={styles.emptySubtitle}>
                  Try adjusting your search or filters
                </Text>
              </Animatable.View>
            }
          />
        )}
      </View>

      {/* Filter Modal */}
      <Modal
        visible={showFilters}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowFilters(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <LinearGradient colors={theme.gradients.primary as any} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Filter Transactions</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowFilters(false)}
              >
                <Icon name="close" size={24} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalBody}>
              <Text style={styles.filterLabel}>Status</Text>
              <View style={styles.filterOptions}>
                {statusOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.status === option.value && styles.filterOptionSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, status: option.value })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.status === option.value && styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <Text style={styles.filterLabel}>Payment Method</Text>
              <View style={styles.filterOptions}>
                {methodOptions.map((option) => (
                  <TouchableOpacity
                    key={option.value}
                    style={[
                      styles.filterOption,
                      filters.method === option.value && styles.filterOptionSelected,
                    ]}
                    onPress={() => setFilters({ ...filters, method: option.value })}
                  >
                    <Text
                      style={[
                        styles.filterOptionText,
                        filters.method === option.value && styles.filterOptionTextSelected,
                      ]}
                    >
                      {option.label}
                    </Text>
                  </TouchableOpacity>
                ))}
              </View>

              <View style={styles.modalActions}>
                <GradientButton
                  title="Clear Filters"
                  onPress={clearFilters}
                  style={styles.clearButton}
                  colors={theme.gradients.secondary}
                />
                <GradientButton
                  title="Apply Filters"
                  onPress={applyFilters}
                  style={styles.applyButton}
                />
              </View>
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
    marginBottom: theme.spacing.lg,
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
  filterButton: {
    padding: theme.spacing.sm,
  },
  headerButtons: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  headerButton: {
    padding: theme.spacing.sm,
    marginLeft: theme.spacing.xs,
  },
  searchContainer: {
    marginTop: theme.spacing.sm,
  },
  searchInput: {
    backgroundColor: 'rgba(255, 255, 255, 0.15)',
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  transactionContainer: {
    marginBottom: theme.spacing.md,
  },
  transactionCard: {
    padding: 0,
  },
  transactionContent: {
    padding: theme.spacing.lg,
  },
  transactionHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  methodContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  methodIcon: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  transactionInfo: {
    flex: 1,
  },
  receiverText: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: theme.typography.body.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  descriptionText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  amountContainer: {
    alignItems: 'flex-end',
  },
  amountText: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  statusBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  statusText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  transactionFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dateText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  methodText: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontWeight: '500',
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingSpinner: {
    width: 60,
    height: 60,
    borderRadius: 30,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  loadingText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
  },
  emptyContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    paddingVertical: theme.spacing.xl * 2,
  },
  emptyIcon: {
    width: 80,
    height: 80,
    borderRadius: 40,
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: theme.spacing.lg,
  },
  emptyTitle: {
    fontSize: theme.typography.h3.fontSize,
    fontWeight: theme.typography.h3.fontWeight as any,
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  emptySubtitle: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.secondary,
    textAlign: 'center',
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
    maxHeight: '90%', // increased from 80% to 90%
    minHeight: 350,   // ensure a minimum height for better visibility
    paddingBottom: theme.spacing.xl, // add extra padding at the bottom
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
  filterLabel: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.md,
    marginTop: theme.spacing.md,
  },
  filterOptions: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: theme.spacing.sm,
  },
  filterOption: {
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  filterOptionSelected: {
    backgroundColor: theme.colors.primary.start,
    borderColor: theme.colors.primary.start,
  },
  filterOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
  },
  filterOptionTextSelected: {
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  clearButton: {
    flex: 1,
  },
  applyButton: {
    flex: 1,
  },
});