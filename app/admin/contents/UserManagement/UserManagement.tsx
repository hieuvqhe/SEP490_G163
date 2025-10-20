/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState } from 'react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';
import {
  useGetUsers,
  useGetUserById,
  useUpdateUser,
  useDeleteUser,
  useBanUser,
  useUnbanUser,
  useUpdateUserRole
} from '@/apis/admin.api';
import type {
  AdminUser,
  GetUsersParams,
  UpdateUserRequest
} from '@/apis/admin.api';

import { UserFilters } from './UserFilters';
import { UserTable } from './UserTable';
import { UserDetailModal, EditUserModal, DeleteConfirmModal } from './UserModals';

export const UserManagement = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  // User Management States
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [roleFilter, setRoleFilter] = useState<string>('');
  const [sortBy, setSortBy] = useState<string>('createdAt');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [selectedUser, setSelectedUser] = useState<AdminUser | null>(null);
  const [showUserModal, setShowUserModal] = useState(false);
  const [showEditModal, setShowEditModal] = useState(false);
  const [showDeleteModal, setShowDeleteModal] = useState(false);
  const [userToDelete, setUserToDelete] = useState<AdminUser | null>(null);

  // Build query params
  const queryParams: GetUsersParams = {
    page: currentPage,
    limit,
    search: searchTerm || undefined,
    role: roleFilter as GetUsersParams['role'] || undefined,
    sort_by: sortBy,
    sort_order: sortOrder
  };

  // TanStack Query hooks
  const { data: usersData, isLoading: usersLoading, refetch: refetchUsers } = useGetUsers(queryParams, accessToken || undefined);
  const { data: userDetailData } = useGetUserById(selectedUser?.id || 0, accessToken || undefined);

  const updateUserMutation = useUpdateUser();
  const deleteUserMutation = useDeleteUser();
  const banUserMutation = useBanUser();
  const unbanUserMutation = useUnbanUser();
  const updateUserRoleMutation = useUpdateUserRole();

  // Extract data
  const users = usersData?.result?.users || [];
  const totalUsers = usersData?.result?.total || 0;

  // Handlers
  const handleViewUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowUserModal(true);
  };

  const handleEditUser = (user: AdminUser) => {
    setSelectedUser(user);
    setShowEditModal(true);
  };

  const handleDeleteUser = (user: AdminUser) => {
    setUserToDelete(user);
    setShowDeleteModal(true);
  };

  const handleConfirmDelete = async () => {
    if (!userToDelete) return;

    try {
      await deleteUserMutation.mutateAsync({
        userId: userToDelete.id,
        accessToken: accessToken || ''
      });
      showToast('User deleted successfully', undefined, 'success');
      setShowDeleteModal(false);
      setUserToDelete(null);
      refetchUsers();
    } catch (error) {
      showToast('Failed to delete user', undefined, 'error');
    }
  };

  const handleUpdateUser = async (userId: number, userData: UpdateUserRequest) => {
    try {
      await updateUserMutation.mutateAsync({
        userId,
        data: userData,
        accessToken: accessToken || ''
      });
      showToast('User updated successfully', undefined, 'success');
      setShowEditModal(false);
      setSelectedUser(null);
      refetchUsers();
    } catch (error) {
      showToast('Failed to update user', undefined, 'error');
    }
  };

  const handleToggleUserStatus = async (userId: number, isCurrentlyActive: boolean) => {
    try {
      if (isCurrentlyActive) {
        await banUserMutation.mutateAsync({
          userId,
          accessToken: accessToken || ''
        });
        showToast('User banned successfully', undefined, 'success');
      } else {
        await unbanUserMutation.mutateAsync({
          userId,
          accessToken: accessToken || ''
        });
        showToast('User unbanned successfully', undefined, 'success');
      }
      refetchUsers();
    } catch (error) {
      showToast('Failed to update user status', undefined, 'error');
    }
  };

  const handleUpdateUserRole = async (userId: number, role: string) => {
    try {
      await updateUserRoleMutation.mutateAsync({
        userId,
        data: { role },
        accessToken: accessToken || ''
      });
      showToast('User role updated successfully', undefined, 'success');
      refetchUsers();
    } catch (error) {
      showToast('Failed to update user role', undefined, 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleRoleFilter = (role: string) => {
    setRoleFilter(role);
    setCurrentPage(1);
  };

  const handleViewUserWrapper = (userId: string) => {
    const user = users.find(u => u.id.toString() === userId);
    if (user) {
      handleViewUser(user);
    }
  };

  const handleToggleUserStatusWrapper = (userId: string, isCurrentlyActive: boolean) => {
    const user = users.find(u => u.id.toString() === userId);
    if (user) {
      handleToggleUserStatus(user.id, isCurrentlyActive);
    }
  };

  const handleUpdateUserWrapper = (userId: string, userData: UpdateUserRequest) => {
    const user = users.find(u => u.id.toString() === userId);
    if (user) {
      handleUpdateUser(user.id, userData);
    }
  };

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1
      }
    }
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4
      }
    }
  };

  return (
    <motion.div 
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      <motion.div variants={itemVariants}>
        <UserFilters
          totalUsers={totalUsers}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          roleFilter={roleFilter}
          setRoleFilter={setRoleFilter}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onSearch={handleSearch}
          onRefresh={refetchUsers}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        <UserTable
          users={users}
          usersLoading={usersLoading}
          currentPage={currentPage}
          totalUsers={totalUsers}
          limit={limit}
          onViewUser={handleViewUserWrapper}
          onEditUser={handleEditUser}
          onToggleUserStatus={handleToggleUserStatusWrapper}
          onDeleteUser={handleDeleteUser}
          onPageChange={handlePageChange}
        />
      </motion.div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence mode="wait">
        {showUserModal && selectedUser && (
          <UserDetailModal
            user={selectedUser}
            onClose={() => {
              setShowUserModal(false);
              setSelectedUser(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showEditModal && selectedUser && (
          <EditUserModal
            user={selectedUser}
            onClose={() => {
              setShowEditModal(false);
              setSelectedUser(null);
            }}
            onSave={handleUpdateUserWrapper}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showDeleteModal && userToDelete && (
          <DeleteConfirmModal
            user={userToDelete}
            onClose={() => {
              setShowDeleteModal(false);
              setUserToDelete(null);
            }}
            onConfirm={handleConfirmDelete}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
