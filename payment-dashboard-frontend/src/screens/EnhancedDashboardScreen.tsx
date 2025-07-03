import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
  TouchableOpacity,
  RefreshControl,
  Alert,
} from 'react-native';
import { LineChart, PieChart } from 'react-native-chart-kit';
import { LinearGradient } from 'expo-linear-gradient';
import * as Animatable from 'react-native-animatable';
import Icon from 'react-native-vector-icons/MaterialIcons';
import { paymentsAPI, PaymentStats } from '../services/api';
import { authUtils } from '../utils/auth';
import { formatIndianCurrency } from '../utils/currency';
import { theme } from '../theme/theme';
import { GradientCard, StatsCard } from '../components/GradientCard';
import { GradientButton } from '../components/GradientButton';
import { useAuth } from '../contexts/AuthContext';
import { webSocketService } from '../services/websocket';
import { WebSocketStatus } from '../components/WebSocketStatus';

const screenWidth = Dimensions.get('window').width;

export default function EnhancedDashboardScreen({ navigation }: any) {
  const [stats, setStats] = useState<PaymentStats | null>(null);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [user, setUser] = useState<any>(null);
  const { logout } = useAuth();

  const handleLogout = () => {
    Alert.alert(
      'Logout',
      'Are you sure you want to logout?',
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Logout',
          style: 'destructive',
          onPress: logout,
        },
      ]
    );
  };

  useEffect(() => {
    fetchData();
    getCurrentUser();
    
    // Set up WebSocket listeners for real-time updates
    const handlePaymentCreated = () => {
      console.log('📊 Dashboard: Payment created, refreshing stats...');
      fetchData();
    };

    const handlePaymentUpdated = () => {
      console.log('📊 Dashboard: Payment updated, refreshing stats...');
      fetchData();
    };

    const handleStatsUpdated = () => {
      console.log('📊 Dashboard: Stats updated, refreshing...');
      fetchData();
    };

    webSocketService.on('paymentCreated', handlePaymentCreated);
    webSocketService.on('paymentUpdated', handlePaymentUpdated);
    webSocketService.on('statsUpdated', handleStatsUpdated);

    // Cleanup listeners on unmount
    return () => {
      webSocketService.off('paymentCreated', handlePaymentCreated);
      webSocketService.off('paymentUpdated', handlePaymentUpdated);
      webSocketService.off('statsUpdated', handleStatsUpdated);
    };
  }, []);

  const getCurrentUser = async () => {
    const userData = await authUtils.getUser();
    setUser(userData);
  };

  const fetchData = async () => {
    try {
      const data = await paymentsAPI.getStats();
      console.log('📊 Dashboard Stats:', JSON.stringify(data, null, 2));
      setStats(data);
    } catch (error) {
      console.error('Failed to fetch stats:', error);
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchData();
  };

  const getGreeting = () => {
    const hour = new Date().getHours();
    if (hour < 12) return 'Good Morning';
    if (hour < 17) return 'Good Afternoon';
    return 'Good Evening';
  };

  const getChartData = () => {
    console.log('📊 Chart Data - Stats:', JSON.stringify(stats, null, 2));
    
    if (!stats?.revenueByDay?.length) {
      console.log('📊 No revenue data available');
      return null;
    }

    const labels = stats.revenueByDay.map((item: any) => {
      // Handle the new API format where date is an object with day, month, year
      const dateObj = item._id;
      const date = new Date(dateObj.year, dateObj.month - 1, dateObj.day);
      return date.toLocaleDateString('en-US', { weekday: 'short' });
    });

    const data = stats.revenueByDay.map((item: any) => item.revenue);

    // Ensure we have at least some data points
    const finalLabels = labels.slice(-7);
    const finalData = data.slice(-7);
    
    // If we have less than 2 data points, return null to show no data message
    if (finalData.length < 2) {
      console.log('📊 Not enough data points');
      return null;
    }

    const chartData = {
      labels: finalLabels,
      datasets: [{
        data: finalData,
        strokeWidth: 4,
        color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
      }],
    };
    
    console.log('📊 Final Chart Data:', JSON.stringify(chartData, null, 2));
    return chartData;
  };

  const getPieChartData = () => {
    if (!stats?.paymentsByStatus?.length) {
      return [];
    }

    const statusMap = stats.paymentsByStatus.reduce((acc, item) => {
      acc[item._id] = item.count;
      return acc;
    }, {} as Record<string, number>);

    return [
      {
        name: 'Success',
        population: statusMap['success'] || 0,
        color: theme.colors.status.success,
        legendFontColor: theme.colors.text.primary,
        legendFontSize: 12,
      },
      {
        name: 'Pending',
        population: statusMap['pending'] || 0,
        color: theme.colors.status.pending,
        legendFontColor: theme.colors.text.primary,
        legendFontSize: 12,
      },
      {
        name: 'Failed',
        population: statusMap['failed'] || 0,
        color: theme.colors.status.failed,
        legendFontColor: theme.colors.text.primary,
        legendFontSize: 12,
      },
    ].filter(item => item.population > 0); // Only show segments with data
  };

  const chartConfig = {
    backgroundColor: '#ffffff',
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#f8f9fa',
    color: (opacity = 1) => `rgba(102, 126, 234, ${opacity})`,
    strokeWidth: 3,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    decimalPlaces: 0,
    style: {
      borderRadius: theme.borderRadius.lg,
    },
    propsForDots: {
      r: '6',
      strokeWidth: '2',
      stroke: theme.colors.primary.start,
      fill: '#ffffff',
    },
    propsForBackgroundLines: {
      strokeDasharray: '',
      stroke: 'rgba(0, 0, 0, 0.1)',
      strokeWidth: 1,
    },
    propsForLabels: {
      fontSize: 12,
      fontWeight: '600',
      fill: '#333333',
    },
  };

  if (loading) {
    return (
      <LinearGradient
        colors={theme.gradients.dashboard as any}
        style={styles.container}
      >
        <View style={styles.loadingContainer}>
          <Animatable.Text 
            animation="pulse" 
            iterationCount="infinite"
            style={styles.loadingText}
          >
            Loading Dashboard...
          </Animatable.Text>
        </View>
      </LinearGradient>
    );
  }

  return (
    <LinearGradient
      colors={theme.gradients.dashboard as any}
      style={styles.container}
    >
      <ScrollView
        style={styles.scrollView}
        contentContainerStyle={styles.scrollContent}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      >
        {/* Header */}
        <Animatable.View 
          animation="fadeInDown" 
          duration={800}
          style={styles.header}
        >
          <View style={styles.headerContent}>
            <View style={styles.userInfo}>
              <Text style={styles.greeting}>{getGreeting()}</Text>
              <Text style={styles.userName}>
                {user?.username || 'User'} 👋
              </Text>
              <Text style={styles.userRole}>
                {user?.role === 'admin' ? '🔐 Administrator' : '👤 User'}
              </Text>
            </View>
            <View style={styles.headerActions}>
              <WebSocketStatus />
              {/* Show logout button for users (admins have it in Users tab) */}
              {user?.role !== 'admin' && (
                <TouchableOpacity
                  onPress={handleLogout}
                  style={styles.logoutButton}
                  activeOpacity={0.8}
                >
                  <Icon name="logout" size={24} color="#fff" />
                  <Text style={styles.logoutText}>Logout</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>
        </Animatable.View>

        {/* Stats Cards */}
        <View style={styles.statsContainer}>
          <View style={styles.statsRow}>
            <StatsCard
              title="Total Revenue (Week)"
              value={formatIndianCurrency(stats?.totalRevenueWeek || 0)}
              variant="primary"
              delay={100}
            />
            <StatsCard
              title="Payments (Week)"
              value={stats?.totalPaymentsWeek || 0}
              variant="secondary"
              delay={200}
            />
          </View>
          
          <View style={styles.statsRow}>
            <StatsCard
              title="Today's Revenue"
              value={formatIndianCurrency(stats?.totalRevenueToday || 0)}
              variant="success"
              delay={300}
            />
            <StatsCard
              title="Failed Transactions"
              value={stats?.failedTransactions || 0}
              variant="warning"
              delay={400}
            />
          </View>
        </View>

        {/* Revenue Chart */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={500}
        >
          <GradientCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>📈 Revenue Trend (Last 7 Days)</Text>
            {getChartData() ? (
              <LineChart
                data={getChartData()!}
                width={screenWidth - theme.spacing.lg * 4}
                height={220}
                chartConfig={chartConfig}
                bezier
                style={styles.chart}
                withHorizontalLabels={true}
                withVerticalLabels={true}
                withDots={true}
                withShadow={false}
                withInnerLines={true}
                withOuterLines={true}
                yAxisLabel="₹"
                yAxisSuffix=""
                yAxisInterval={1}
                segments={4}
                fromZero={true}
              />
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>📊 No revenue data available</Text>
                <Text style={styles.noDataText}>Add some payments to see the chart</Text>
              </View>
            )}
          </GradientCard>
        </Animatable.View>

        {/* Transaction Status Distribution */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={600}
        >
          <GradientCard style={styles.chartCard}>
            <Text style={styles.chartTitle}>📊 Transaction Status Distribution</Text>
            {getPieChartData().length > 0 ? (
              <View style={styles.pieChartContainer}>
                <PieChart
                  data={getPieChartData()}
                  width={screenWidth - theme.spacing.lg * 2}
                  height={200}
                  chartConfig={chartConfig}
                  accessor="population"
                  backgroundColor="transparent"
                  paddingLeft="24"
                  absolute={false}
                  center={[24, 0]}
                />
              </View>
            ) : (
              <View style={styles.noDataContainer}>
                <Text style={styles.noDataText}>📊 No transaction data available</Text>
                <Text style={styles.noDataText}>Add some payments to see the distribution</Text>
              </View>
            )}
          </GradientCard>
        </Animatable.View>

        {/* Quick Actions */}
        <Animatable.View 
          animation="fadeInUp" 
          duration={800}
          delay={700}
          style={styles.actionsContainer}
        >
          <Text style={styles.sectionTitle}>Quick Actions</Text>
          <View style={styles.actionButtons}>
            <GradientButton
              title="💳 Add Payment"
              onPress={() => navigation.navigate('AddPayment')}
              variant="primary"
              size="medium"
              style={styles.actionButton}
            />
            <GradientButton
              title="📋 View Transactions"
              onPress={() => navigation.navigate('Transactions')}
              variant="secondary"
              size="medium"
              style={styles.actionButton}
            />
            {user?.role === 'admin' && (
              <GradientButton
                title="👥 Manage Users"
                onPress={() => navigation.navigate('Users')}
                variant="success"
                size="medium"
                style={styles.actionButton}
              />
            )}
          </View>
        </Animatable.View>

        {/* Footer */}
        <Animatable.View 
          animation="fadeIn" 
          duration={600}
          delay={800}
          style={styles.footer}
        >
          <Text style={styles.footerText}>
            Last updated: {new Date().toLocaleTimeString()}
          </Text>
        </Animatable.View>
      </ScrollView>
    </LinearGradient>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  scrollView: {
    flex: 1,
  },
  scrollContent: {
    paddingBottom: theme.spacing.xxl,
  },
  loadingContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
  },
  loadingText: {
    fontSize: 20,
    color: theme.colors.text.inverse,
    fontWeight: '600',
  },
  header: {
    paddingTop: 60,
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.lg,
  },
  headerContent: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
  },
  userInfo: {
    flex: 1,
  },
  headerActions: {
    alignItems: 'flex-end',
    gap: theme.spacing.sm,
  },
  logoutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    paddingHorizontal: theme.spacing.md,
    paddingVertical: theme.spacing.sm,
    borderRadius: theme.borderRadius.md,
    marginTop: 8,
  },
  logoutText: {
    color: theme.colors.text.inverse,
    fontSize: 14,
    fontWeight: '600',
    marginLeft: theme.spacing.xs,
  },
  greeting: {
    fontSize: 16,
    color: theme.colors.text.inverse,
    opacity: 0.9,
  },
  userName: {
    fontSize: 28,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    marginTop: 4,
  },
  userRole: {
    fontSize: 14,
    color: theme.colors.text.inverse,
    opacity: 0.8,
    marginTop: 2,
  },
  statsContainer: {
    paddingHorizontal: theme.spacing.md,
    marginBottom: theme.spacing.lg,
  },
  statsRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginBottom: theme.spacing.sm,
  },
  chartCard: {
    marginHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
    padding: theme.spacing.lg,
    overflow: 'hidden',
  },
  chartTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  chart: {
    borderRadius: theme.borderRadius.md,
    backgroundColor: '#ffffff',
    padding: 0,
    alignSelf: 'center',
    overflow: 'hidden',
  },
  noDataContainer: {
    height: 200,
    justifyContent: 'center',
    alignItems: 'center',
  },
  noDataText: {
    fontSize: 16,
    color: theme.colors.text.secondary,
    fontStyle: 'italic',
    textAlign: 'center',
    marginBottom: 4,
  },
  pieChartContainer: {
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: theme.spacing.sm,
  },
  actionsContainer: {
    paddingHorizontal: theme.spacing.lg,
    marginBottom: theme.spacing.lg,
  },
  sectionTitle: {
    fontSize: 22,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
    marginBottom: theme.spacing.lg,
    textAlign: 'center',
  },
  actionButtons: {
    gap: theme.spacing.md,
  },
  actionButton: {
    marginBottom: theme.spacing.sm,
  },
  footer: {
    alignItems: 'center',
    paddingHorizontal: theme.spacing.lg,
    marginTop: theme.spacing.lg,
  },
  footerText: {
    fontSize: 12,
    color: theme.colors.text.inverse,
    opacity: 0.7,
  },
});
