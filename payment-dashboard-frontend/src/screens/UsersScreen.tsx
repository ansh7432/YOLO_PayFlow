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
} from 'react-native';
import { usersAPI, User } from '../services/api';
import { authUtils } from '../utils/auth';

export default function UsersScreen() {
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

  const onRefresh = () => {
    setRefreshing(true);
    fetchUsers();
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
      setNewUser({ username: '', email: '', password: '', role: 'user' });
      fetchUsers();
      Alert.alert('Success', 'User created successfully');
    } catch (error: any) {
      Alert.alert('Error', error.response?.data?.message || 'Failed to create user');
    } finally {
      setAddingUser(false);
    }
  };

  const handleDeleteUser = (user: User) => {
    if (user._id === currentUser?.id) {
      Alert.alert('Error', 'You cannot delete your own account');
      return;
    }

    Alert.alert(
      'Confirm Delete',
      `Are you sure you want to delete user "${user.username}"?`,
      [
        { text: 'Cancel', style: 'cancel' },
        {
          text: 'Delete',
          style: 'destructive',
          onPress: async () => {
            try {
              await usersAPI.delete(user._id);
              fetchUsers();
              Alert.alert('Success', 'User deleted successfully');
            } catch (error: any) {
              Alert.alert('Error', 'Failed to delete user');
            }
          },
        },
      ]
    );
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-US', {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  const getRoleColor = (role: string) => {
    switch (role) {
      case 'admin':
        return '#dc2626';
      case 'viewer':
        return '#2563eb';
      default:
        return '#6b7280';
    }
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <View style={styles.userCard}>
      <View style={styles.userHeader}>
        <View style={styles.userInfo}>
          <Text style={styles.username}>{item.username}</Text>
          <Text style={styles.email}>{item.email}</Text>
        </View>
        
        <View style={styles.userActions}>
          <View style={[styles.roleBadge, { backgroundColor: getRoleColor(item.role) }]}>
            <Text style={styles.roleText}>{item.role.toUpperCase()}</Text>
          </View>
          
          {currentUser?.id !== item._id && (
            <TouchableOpacity
              style={styles.deleteButton}
              onPress={() => handleDeleteUser(item)}
            >
              <Text style={styles.deleteButtonText}>Delete</Text>
            </TouchableOpacity>
          )}
        </View>
      </View>
      
      <View style={styles.userFooter}>
        <Text style={styles.createdDate}>
          Created: {formatDate(item.createdAt)}
        </Text>
        <View style={[
          styles.statusIndicator,
          { backgroundColor: '#22c55e' }
        ]}>
          <Text style={styles.statusText}>
            Active
          </Text>
        </View>
      </View>
    </View>
  );

  const AddUserModal = () => (
    <Modal
      visible={showAddUser}
      animationType="slide"
      transparent={true}
      onRequestClose={() => setShowAddUser(false)}
    >
      <View style={styles.modalOverlay}>
        <View style={styles.modalContent}>
          <Text style={styles.modalTitle}>Add New User</Text>
          
          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Username</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter username"
              value={newUser.username}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, username: text }))}
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Email</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter email"
              value={newUser.email}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, email: text }))}
              keyboardType="email-address"
              autoCapitalize="none"
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Password</Text>
            <TextInput
              style={styles.input}
              placeholder="Enter password"
              value={newUser.password}
              onChangeText={(text) => setNewUser(prev => ({ ...prev, password: text }))}
              secureTextEntry
            />
          </View>

          <View style={styles.inputGroup}>
            <Text style={styles.inputLabel}>Role</Text>
            <View style={styles.roleOptions}>
              {['admin', 'user'].map(role => (
                <TouchableOpacity
                  key={role}
                  style={[
                    styles.roleOption,
                    newUser.role === role && styles.roleOptionSelected
                  ]}
                  onPress={() => setNewUser(prev => ({ ...prev, role: role as 'admin' | 'user' }))}
                >
                  <Text style={[
                    styles.roleOptionText,
                    newUser.role === role && styles.roleOptionTextSelected
                  ]}>
                    {role.charAt(0).toUpperCase() + role.slice(1)}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          <View style={styles.modalButtons}>
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonSecondary]}
              onPress={() => setShowAddUser(false)}
            >
              <Text style={styles.modalButtonTextSecondary}>Cancel</Text>
            </TouchableOpacity>
            
            <TouchableOpacity
              style={[styles.modalButton, styles.modalButtonPrimary]}
              onPress={handleAddUser}
              disabled={addingUser}
            >
              {addingUser ? (
                <ActivityIndicator color="#fff" size="small" />
              ) : (
                <Text style={styles.modalButtonTextPrimary}>Create User</Text>
              )}
            </TouchableOpacity>
          </View>
        </View>
      </View>
    </Modal>
  );

  if (loading) {
    return (
      <View style={[styles.container, styles.centered]}>
        <ActivityIndicator size="large" color="#667eea" />
        <Text style={styles.loadingText}>Loading users...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <View style={styles.header}>
        <Text style={styles.title}>User Management</Text>
        <TouchableOpacity
          style={styles.addButton}
          onPress={() => setShowAddUser(true)}
        >
          <Text style={styles.addButtonText}>+ Add User</Text>
        </TouchableOpacity>
      </View>

      <FlatList
        data={users}
        renderItem={renderUserItem}
        keyExtractor={(item, index) => item._id ? `${item._id}-${index}` : `user-${index}`}
        contentContainerStyle={styles.listContainer}
        refreshControl={
          <RefreshControl refreshing={refreshing} onRefresh={onRefresh} />
        }
        showsVerticalScrollIndicator={false}
      />

      <AddUserModal />
    </View>
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
  loadingText: {
    marginTop: 10,
    fontSize: 16,
    color: '#666',
  },
  header: {
    backgroundColor: '#667eea',
    paddingTop: 60,
    paddingBottom: 20,
    paddingHorizontal: 20,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-end',
  },
  title: {
    fontSize: 28,
    fontWeight: 'bold',
    color: '#fff',
  },
  addButton: {
    backgroundColor: 'rgba(255, 255, 255, 0.2)',
    borderRadius: 10,
    paddingHorizontal: 15,
    paddingVertical: 8,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  addButtonText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 14,
  },
  listContainer: {
    padding: 20,
  },
  userCard: {
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
  userHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'flex-start',
    marginBottom: 12,
  },
  userInfo: {
    flex: 1,
  },
  username: {
    fontSize: 18,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 4,
  },
  email: {
    fontSize: 14,
    color: '#666',
  },
  userActions: {
    alignItems: 'flex-end',
  },
  roleBadge: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
    marginBottom: 8,
  },
  roleText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
  },
  deleteButton: {
    backgroundColor: '#ef4444',
    borderRadius: 6,
    paddingHorizontal: 10,
    paddingVertical: 4,
  },
  deleteButtonText: {
    color: '#fff',
    fontSize: 12,
    fontWeight: '600',
  },
  userFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  createdDate: {
    fontSize: 12,
    color: '#999',
  },
  statusIndicator: {
    paddingHorizontal: 8,
    paddingVertical: 4,
    borderRadius: 12,
  },
  statusText: {
    fontSize: 12,
    fontWeight: 'bold',
    color: '#fff',
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
    width: '90%',
    maxHeight: '80%',
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    color: '#333',
    marginBottom: 20,
    textAlign: 'center',
  },
  inputGroup: {
    marginBottom: 15,
  },
  inputLabel: {
    fontSize: 16,
    fontWeight: '600',
    color: '#333',
    marginBottom: 8,
  },
  input: {
    borderWidth: 1,
    borderColor: '#ddd',
    borderRadius: 8,
    padding: 12,
    fontSize: 16,
    backgroundColor: '#f9f9f9',
  },
  roleOptions: {
    flexDirection: 'row',
    gap: 10,
  },
  roleOption: {
    flex: 1,
    backgroundColor: '#f5f5f5',
    borderRadius: 8,
    paddingVertical: 12,
    alignItems: 'center',
    borderWidth: 1,
    borderColor: '#ddd',
  },
  roleOptionSelected: {
    backgroundColor: '#667eea',
    borderColor: '#667eea',
  },
  roleOptionText: {
    fontSize: 14,
    color: '#333',
    fontWeight: '600',
  },
  roleOptionTextSelected: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 20,
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
