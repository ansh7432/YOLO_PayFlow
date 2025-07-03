import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  RefreshControl,
  Alert,
  Dimensions,
} from 'react-native';
import { LineChart } from 'react-native-chart-kit';
import { paymentsAPI, PaymentStats } from '../services/api';

const screenWidth = Dimensions.get('window').width;

export default function DashboardScreen() {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);

  const fetchStats = async () => {
    try {
      const data = await paymentsAPI.getStats();
      setStats(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch dashboard stats');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  useEffect(() => {
    fetchStats();
  }, []);

  const onRefresh = () => {
    setRefreshing(true);
    fetchStats();
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
    }).format(amount);
  };

  const getChartData = () => {
    if (!stats || !stats.revenueByDay.length) {
      return {
        labels: ['Mon', 'Tue', 'Wed', 'Thu', 'Fri', 'Sat', 'Sun'],
        datasets: [
          {
            data: [0, 0, 0, 0, 0, 0, 0],
          },
        ],
      };
    }

    const labels = stats.revenueByDay.map((item: any) => {
      const date = new Date(2025, item._id.month - 1, item._id.day);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const data = stats.revenueByDay.map((item: any) => item.revenue);

    return {
      labels: labels.slice(-7), // Show last 7 days
      datasets: [
        {
          data: data.slice(-7),
          strokeWidth: 3,
        },
      ],
    };
  };

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <Text>Loading dashboard...</Text>
      </View>
    );
  }

  return (
    <ScrollView
      style={styles.container}
      refreshControl={
        <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
      }
    >
      <View style={styles.header}>
        <Text style={styles.title}>PayFlow</Text>
        <Text style={styles.subtitle}>Overview & Analytics</Text>
      </View>

      {/* Metrics Cards */}
      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today's Payments</Text>
          <Text style={styles.metricValue}>{stats?.totalPaymentsToday || 0}</Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>This Week</Text>
          <Text style={styles.metricValue}>{stats?.totalPaymentsWeek || 0}</Text>
        </View>
      </View>

      <View style={styles.metricsContainer}>
        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Today's Revenue</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(stats?.totalRevenueToday || 0)}
          </Text>
        </View>

        <View style={styles.metricCard}>
          <Text style={styles.metricLabel}>Week's Revenue</Text>
          <Text style={styles.metricValue}>
            {formatCurrency(stats?.totalRevenueWeek || 0)}
          </Text>
        </View>
      </View>

      <View style={styles.singleMetricContainer}>
        <View style={[styles.metricCard, styles.failedCard]}>
          <Text style={styles.metricLabel}>Failed Transactions</Text>
          <Text style={[styles.metricValue, styles.failedValue]}>
            {stats?.failedTransactions || 0}
          </Text>
        </View>
      </View>

      {/* Revenue Chart */}
      <View style={styles.chartContainer}>
        <Text style={styles.chartTitle}>Revenue Trend (Last 7 Days)</Text>
        <LineChart
          data={getChartData()}
          width={screenWidth - 80}
          height={220}
          chartConfig={{
            backgroundColor: '#fff',
            backgroundGradientFrom: '#fff',
            backgroundGradientTo: '#fff',
            decimalPlaces: 0,
            color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
            labelColor: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
            style: {
              borderRadius: 16,
            },
            propsForDots: {
              r: '6',
              strokeWidth: '2',
              stroke: '#667eea',
            },
          }}
          bezier
          style={styles.chart}
        />
      </View>

      {/* Recent Payments */}
      <View style={styles.recentContainer}>
        <Text style={styles.sectionTitle}>Recent Payments</Text>
        {stats?.recentPayments?.map((payment) => (
          <View key={payment._id} style={styles.paymentItem}>
            <View style={styles.paymentInfo}>
              <Text style={styles.paymentReceiver}>{payment.receiver}</Text>
              <Text style={styles.paymentMethod}>{payment.method}</Text>
            </View>
            <View style={styles.paymentDetails}>
              <Text style={styles.paymentAmount}>
                {formatCurrency(payment.amount)}
              </Text>
              <View style={[
                styles.statusBadge,
                payment.status === 'success' ? styles.statusSuccess :
                payment.status === 'failed' ? styles.statusFailed : styles.statusPending
              ]}>
                <Text style={styles.statusText}>{payment.status}</Text>
              </View>
            </View>
          </View>
        ))}
      </View>
    </ScrollView>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f9fa',
  },
  centered: {
    justifyContent: 'center',
    alignItems: 'center',
  },
  header: {
    padding: 20,
    backgroundColor: '#667eea',
    paddingTop: 60,
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  subtitle: {
    fontSize: 16,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: 5,
  },
  metricsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    paddingHorizontal: 20,
    marginTop: 20,
  },
  singleMetricContainer: {
    paddingHorizontal: 20,
    marginTop: 20,
  },
  metricCard: {
    backgroundColor: '#fff',
    borderRadius: 12,
    padding: 20,
    flex: 1,
    marginHorizontal: 5,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  failedCard: {
    backgroundColor: '#fff5f5',
    borderColor: '#fed7d7',
    borderWidth: 1,
  },
  metricLabel: {
    fontSize: 14,
    color: '#666',
    marginBottom: 8,
  },
  metricValue: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
  },
  failedValue: {
    color: '#e53e3e',
  },
  chartContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 15,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
    textAlign: 'center',
  },
  chart: {
    borderRadius: 16,
  },
  recentContainer: {
    backgroundColor: '#fff',
    margin: 20,
    borderRadius: 12,
    padding: 20,
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 2,
    },
    shadowOpacity: 0.1,
    shadowRadius: 3.84,
    elevation: 5,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 15,
  },
  paymentItem: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: '#f0f0f0',
  },
  paymentInfo: {
    flex: 1,
  },
  paymentReceiver: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
  },
  paymentMethod: {
    fontSize: 14,
    color: '#666',
    marginTop: 2,
  },
  paymentDetails: {
    alignItems: 'flex-end',
  },
  paymentAmount: {
    fontSize: 16,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  statusBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusSuccess: {
    backgroundColor: '#c6f6d5',
  },
  statusFailed: {
    backgroundColor: '#fed7d7',
  },
  statusPending: {
    backgroundColor: '#fef5e7',
  },
  statusText: {
    fontSize: 12,
    fontWeight: '600',
    color: '#333',
  },
});
