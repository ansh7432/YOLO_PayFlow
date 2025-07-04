import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  StyleSheet,
  FlatList,
  TouchableOpacity,
  Alert,
  RefreshControl,
  Modal,
  TextInput,
  ActivityIndicator,
  SafeAreaView,
  Platform,
} from 'react-native';
import { LinearGradient } from 'expo-linear-gradient';
import Icon from 'react-native-vector-icons/MaterialIcons';
import * as Animatable from 'react-native-animatable';
import { usersAPI, User } from '../services/api';
import { authUtils } from '../utils/auth';
import { theme } from '../theme/theme';
import { GradientCard } from '../components/GradientCard';
import { GradientButton } from '../components/GradientButton';
import { EnhancedInput } from '../components/EnhancedInput';

export default function EnhancedUsersScreen({ navigation }: { navigation?: any }) {
  const [users, setUsers] = useState<User[]>([]);
  const [loading, setLoading] = useState(true);
  const [refreshing, setRefreshing] = useState(false);
  const [showAddUser, setShowAddUser] = useState(false);
  const [currentUser, setCurrentUser] = useState<any>(null);
  const [newUser, setNewUser] = useState({
    username: '',
    email: '',
    password: '',
    role: 'user' as 'admin' | 'user',
  });
  const [addingUser, setAddingUser] = useState(false);

  useEffect(() => {
    fetchUsers();
    getCurrentUser();
  }, []);

  const getCurrentUser = async () => {
    const user = await authUtils.getUser();
    setCurrentUser(user);
  };

  const fetchUsers = async () => {
    try {
      const data = await usersAPI.getAll();
      setUsers(data);
    } catch (error: any) {
      Alert.alert('Error', 'Failed to fetch users');
    } finally {
      setLoading(false);
      setRefreshing(false);
    }
  };

  const handleAddUser = async () => {
    if (!newUser.username || !newUser.email || !newUser.password) {
      Alert.alert('Error', 'Please fill in all fields');
      return;
    }

    setAddingUser(true);
    try {
      await usersAPI.create(newUser);
      setShowAddUser(false);
      setNewUser({
        username: '',
        email: '',
        password: '',
        role: 'user',
      });
      fetchUsers();
      Alert.alert('Success', 'User created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.message || 'Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = (userId: string, username: string) => {
    Alert.alert(
      'Delete User',
      `Are you sure you want to delete user "${username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersAPI.delete(userId);
              fetchUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', error.message || 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
  };

  const getRoleColor = (role: string) => {
    return role === 'admin' ? theme.colors.error.start : theme.colors.primary.start;
  };

  const getRoleIcon = (role: string) => {
    return role === 'admin' ? 'admin-panel-settings' : 'person';
  };

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const renderUser = ({ item, index }: { item: User; index: number }) => (
    <Animatable.View
      animation="fadeInUp"
      delay={index * 100}
      style={styles.userContainer}
    >
      <GradientCard style={styles.userCard}>
        <View style={styles.userContent}>
          <View style={styles.userHeader}>
            <View style={styles.userInfo}>
              <LinearGradient
                colors={[getRoleColor(item.role), getRoleColor(item.role)]}
                style={styles.roleIcon}
              >
                <Icon name={getRoleIcon(item.role)} size={24} color={theme.colors.text.inverse} />
              </LinearGradient>
              <View style={styles.userDetails}>
                <Text style={styles.username}>{item.username}</Text>
                <Text style={styles.email}>{item.email}</Text>
              </View>
            </View>
            <View style={styles.userActions}>
              <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
                <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
              </View>
              {currentUser?.role === 'admin' && item._id !== currentUser._id && (
                <TouchableOpacity
                  style={styles.deleteButton}
                  onPress={() => handleDeleteUser(item._id, item.username)}
                >
                  <Icon name="delete" size={20} color={theme.colors.error.start} />
                </TouchableOpacity>
              )}
            </View>
          </View>
          <View style={styles.userFooter}>
            <Text style={styles.userDate}>Joined {formatDate(item.createdAt)}</Text>
            <Text style={styles.userId}>ID: {item._id.slice(-8)}</Text>
          </View>
        </View>
      </GradientCard>
    </Animatable.View>
  );

  const roleOptions = [
    { value: 'user', label: 'User', icon: 'person', color: theme.colors.primary.start },
    { value: 'admin', label: 'Admin', icon: 'admin-panel-settings', color: theme.colors.error.start },
  ];

  return (
    <SafeAreaView style={styles.container}>
      <LinearGradient colors={theme.gradients.primary as any} style={styles.header}>
        <Animatable.View animation="fadeInDown" style={styles.headerContent}>
          <Text style={styles.headerTitle}>Users Management</Text>
          {currentUser?.role === 'admin' && (
            <TouchableOpacity
              style={styles.addButton}
              onPress={() => setShowAddUser(true)}
            >
              <Icon name="add" size={24} color={theme.colors.text.inverse} />
            </TouchableOpacity>
          )}
        </Animatable.View>
        
        <Animatable.View animation="fadeInUp" delay={200} style={styles.statsContainer}>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>{users.length}</Text>
            <Text style={styles.statLabel}>Total Users</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {users.filter(user => user.role === 'admin').length}
            </Text>
            <Text style={styles.statLabel}>Admins</Text>
          </View>
          <View style={styles.statItem}>
            <Text style={styles.statNumber}>
              {users.filter(user => user.role === 'user').length}
            </Text>
            <Text style={styles.statLabel}>Users</Text>
          </View>
        </Animatable.View>
      </LinearGradient>

      <View style={styles.content}>
        {loading ? (
          <Animatable.View animation="fadeIn" style={styles.loadingContainer}>
            <LinearGradient
              colors={theme.gradients.primary as any}
              style={styles.loadingSpinner}
            >
              <Icon name="people" size={30} color={theme.colors.text.inverse} />
            </LinearGradient>
            <Text style={styles.loadingText}>Loading users...</Text>
          </Animatable.View>
        ) : (
          <FlatList
            data={users}
            renderItem={renderUser}
            keyExtractor={(item, index) => item._id ? `${item._id}-${index}` : `user-${index}`}
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
            ListEmptyComponent={
              <Animatable.View animation="fadeIn" style={styles.emptyContainer}>
                <LinearGradient
                  colors={theme.gradients.secondary as any}
                  style={styles.emptyIcon}
                >
                  <Icon name="people-outline" size={50} color={theme.colors.text.inverse} />
                </LinearGradient>
                <Text style={styles.emptyTitle}>No users found</Text>
                <Text style={styles.emptySubtitle}>
                  Users will appear here once added
                </Text>
              </Animatable.View>
            }
          />
        )}
      </View>

      {/* Add User Modal */}
      <Modal
        visible={showAddUser}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setShowAddUser(false)}
      >
        <View style={styles.modalOverlay}>
          <Animatable.View animation="slideInUp" style={styles.modalContent}>
            <LinearGradient colors={theme.gradients.primary as any} style={styles.modalHeader}>
              <Text style={styles.modalTitle}>Add New User</Text>
              <TouchableOpacity
                style={styles.modalCloseButton}
                onPress={() => setShowAddUser(false)}
              >
                <Icon name="close" size={24} color={theme.colors.text.inverse} />
              </TouchableOpacity>
            </LinearGradient>

            <View style={styles.modalBody}>
              <View style={styles.formGroup}>
                <Text style={styles.label}>Username</Text>
                <EnhancedInput
                  placeholder="Enter username"
                  value={newUser.username}
                  onChangeText={(text) => setNewUser({ ...newUser, username: text })}
                  icon={<Icon name="person" size={20} color={theme.colors.text.secondary} />}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Email</Text>
                <EnhancedInput
                  placeholder="Enter email"
                  value={newUser.email}
                  onChangeText={(text) => setNewUser({ ...newUser, email: text })}
                  keyboardType="email-address"
                  icon={<Icon name="email" size={20} color={theme.colors.text.secondary} />}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Password</Text>
                <EnhancedInput
                  placeholder="Enter password"
                  value={newUser.password}
                  onChangeText={(text) => setNewUser({ ...newUser, password: text })}
                  secureTextEntry
                  icon={<Icon name="lock" size={20} color={theme.colors.text.secondary} />}
                />
              </View>

              <View style={styles.formGroup}>
                <Text style={styles.label}>Role</Text>
                <View style={styles.roleSelector}>
                  {roleOptions.map((option) => (
                    <TouchableOpacity
                      key={option.value}
                      style={[
                        styles.roleOption,
                        newUser.role === option.value && styles.roleOptionSelected,
                      ]}
                      onPress={() => setNewUser({ ...newUser, role: option.value as any })}
                    >
                      <LinearGradient
                        colors={[option.color, option.color]}
                        style={styles.roleOptionIcon}
                      >
                        <Icon name={option.icon} size={16} color={theme.colors.text.inverse} />
                      </LinearGradient>
                      <Text
                        style={[
                          styles.roleOptionText,
                          newUser.role === option.value && styles.roleOptionTextSelected,
                        ]}
                      >
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>

              <View style={styles.modalActions}>
                <GradientButton
                  title="Cancel"
                  onPress={() => setShowAddUser(false)}
                  style={styles.cancelButton}
                  colors={theme.gradients.secondary}
                />
                <GradientButton
                  title={addingUser ? 'Creating...' : 'Create User'}
                  onPress={handleAddUser}
                  disabled={addingUser}
                  style={styles.createButton}
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
  headerTitle: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: theme.typography.h2.fontWeight as any,
    color: theme.colors.text.inverse,
    flex: 1,
  },
  addButton: {
    padding: theme.spacing.sm,
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: theme.borderRadius.md,
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-around',
    marginTop: theme.spacing.sm,
  },
  statItem: {
    alignItems: 'center',
  },
  statNumber: {
    fontSize: theme.typography.h2.fontSize,
    fontWeight: 'bold',
    color: theme.colors.text.inverse,
  },
  statLabel: {
    fontSize: theme.typography.caption.fontSize,
    color: 'rgba(255, 255, 255, 0.8)',
    marginTop: theme.spacing.xs,
  },
  content: {
    flex: 1,
    paddingTop: theme.spacing.lg,
  },
  listContainer: {
    paddingHorizontal: theme.spacing.lg,
    paddingBottom: theme.spacing.xl,
  },
  userContainer: {
    marginBottom: theme.spacing.md,
  },
  userCard: {
    padding: 0,
  },
  userContent: {
    padding: theme.spacing.lg,
  },
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: theme.spacing.md,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
    flex: 1,
  },
  roleIcon: {
    width: 48,
    height: 48,
    borderRadius: 24,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.md,
  },
  userDetails: {
    flex: 1,
  },
  username: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.xs,
  },
  email: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  userActions: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: theme.spacing.sm,
  },
  roleBadge: {
    paddingHorizontal: theme.spacing.sm,
    paddingVertical: theme.spacing.xs,
    borderRadius: theme.borderRadius.sm,
  },
  roleText: {
    fontSize: theme.typography.caption.fontSize,
    fontWeight: '600',
    color: theme.colors.text.inverse,
  },
  deleteButton: {
    padding: theme.spacing.xs,
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  userDate: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
  },
  userId: {
    fontSize: theme.typography.caption.fontSize,
    color: theme.colors.text.secondary,
    fontFamily: 'monospace',
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
    maxHeight: '80%',
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
  formGroup: {
    marginBottom: theme.spacing.lg,
  },
  label: {
    fontSize: theme.typography.body.fontSize,
    fontWeight: '600',
    color: theme.colors.text.primary,
    marginBottom: theme.spacing.sm,
  },
  roleSelector: {
    flexDirection: 'row',
    gap: theme.spacing.md,
  },
  roleOption: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    paddingVertical: theme.spacing.md,
    paddingHorizontal: theme.spacing.md,
    borderRadius: theme.borderRadius.md,
    borderWidth: 1,
    borderColor: theme.colors.border,
    backgroundColor: theme.colors.surface,
  },
  roleOptionSelected: {
    backgroundColor: theme.colors.primary.start + '10',
    borderColor: theme.colors.primary.start,
  },
  roleOptionIcon: {
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: theme.spacing.sm,
  },
  roleOptionText: {
    fontSize: theme.typography.body.fontSize,
    color: theme.colors.text.primary,
    fontWeight: '500',
  },
  roleOptionTextSelected: {
    color: theme.colors.primary.start,
    fontWeight: '600',
  },
  modalActions: {
    flexDirection: 'row',
    gap: theme.spacing.md,
    marginTop: theme.spacing.xl,
  },
  cancelButton: {
    flex: 1,
  },
  createButton: {
    flex: 1,
  },
});