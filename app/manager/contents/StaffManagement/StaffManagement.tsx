"use client";

import { useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Users, Plus, RefreshCcw, Loader2 } from 'lucide-react';

import { useGetManagerStaffs, useGetManagerStaffById } from '@/apis/manager.staff.api';
import { useGetCurrentVoucherManager, useGrantVoucherPermissions, useRevokeVoucherPermissions } from '@/apis/manager.decentralization.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

import StaffFilters from './StaffFilters';
import StaffTable from './StaffTable';
import StaffFormModal from './StaffFormModal';
import StaffDetailModal from './StaffDetailModal';
import StaffDeleteConfirmModal from './StaffDeleteConfirmModal';
import StaffPermissionModal from './StaffPermissionModal';
import VoucherPermissionConfirmModal from './VoucherPermissionConfirmModal';
import RevokeVoucherPermissionModal from './RevokeVoucherPermissionModal';

const containerVariants = {
  hidden: { opacity: 0 },
  visible: { opacity: 1, transition: { duration: 0.4 } }
};

const StaffManagement = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [isActiveFilter, setIsActiveFilter] = useState<boolean | undefined>(true);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState('fullName');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc');

  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [isEditModalOpen, setIsEditModalOpen] = useState(false);
  const [isDetailModalOpen, setIsDetailModalOpen] = useState(false);
  const [isDeleteModalOpen, setIsDeleteModalOpen] = useState(false);
  const [isPermissionModalOpen, setIsPermissionModalOpen] = useState(false);
  const [isVoucherPermissionModalOpen, setIsVoucherPermissionModalOpen] = useState(false);
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [selectedStaffName, setSelectedStaffName] = useState<string>('');

  const { data, isLoading, error, refetch } = useGetManagerStaffs(
    {
      page: currentPage,
      limit,
      isActive: isActiveFilter,
      search: searchTerm,
      sortBy,
      sortOrder
    },
    accessToken ?? undefined
  );

  // Get current voucher manager
  const { data: voucherManagerData } = useGetCurrentVoucherManager(accessToken ?? undefined);
  const currentVoucherManagerId = voucherManagerData?.result?.managerStaffId;

  // Get current voucher manager details
  const { data: voucherManagerDetailData } = useGetManagerStaffById(
    currentVoucherManagerId || 0,
    accessToken ?? undefined
  );
  const currentVoucherManagerName = voucherManagerDetailData?.result?.fullName;

  // Grant voucher permissions mutation
  const grantVoucherMutation = useGrantVoucherPermissions();
  
  // Revoke voucher permissions mutation
  const revokeVoucherMutation = useRevokeVoucherPermissions();
  
  const [isRevokeVoucherModalOpen, setIsRevokeVoucherModalOpen] = useState(false);

  const handleRefresh = () => {
    refetch();
    showToast('Đã làm mới danh sách nhân viên', undefined, 'success');
  };

  const handleViewDetail = (staffId: number) => {
    setSelectedStaffId(staffId);
    setIsDetailModalOpen(true);
  };

  const handleEdit = (staffId: number) => {
    setSelectedStaffId(staffId);
    setIsEditModalOpen(true);
  };

  const handleDeleteClick = (staffId: number, fullName: string) => {
    setSelectedStaffId(staffId);
    setSelectedStaffName(fullName);
    setIsDeleteModalOpen(true);
  };

  const handleManagePermissions = (staffId: number, fullName: string) => {
    setSelectedStaffId(staffId);
    setSelectedStaffName(fullName);
    setIsPermissionModalOpen(true);
  };

  const handleGrantVoucherPermission = (staffId: number, fullName: string) => {
    setSelectedStaffId(staffId);
    setSelectedStaffName(fullName);
    setIsVoucherPermissionModalOpen(true);
  };

  const handleRevokeVoucherPermission = (staffId: number, fullName: string) => {
    setSelectedStaffId(staffId);
    setSelectedStaffName(fullName);
    setIsRevokeVoucherModalOpen(true);
  };

  const handleConfirmGrantVoucherPermission = async () => {
    if (!selectedStaffId) return;

    try {
      await grantVoucherMutation.mutateAsync({
        staffId: selectedStaffId,
        accessToken: accessToken!,
      });
      showToast('Cấp quyền Voucher thành công', undefined, 'success');
      setIsVoucherPermissionModalOpen(false);
      setSelectedStaffId(null);
      setSelectedStaffName('');
      refetch();
    } catch (error: any) {
      showToast(
        'Cấp quyền Voucher thất bại',
        error?.message || 'Vui lòng thử lại',
        'error'
      );
    }
  };

  const handleConfirmRevokeVoucherPermission = async () => {
    if (!selectedStaffId) return;

    try {
      await revokeVoucherMutation.mutateAsync({
        staffId: selectedStaffId,
        accessToken: accessToken!,
      });
      showToast('Thu hồi quyền Voucher thành công', undefined, 'success');
      setIsRevokeVoucherModalOpen(false);
      setSelectedStaffId(null);
      setSelectedStaffName('');
      refetch();
    } catch (error: any) {
      showToast(
        'Thu hồi quyền Voucher thất bại',
        error?.message || 'Vui lòng thử lại',
        'error'
      );
    }
  };

  const handleCloseModals = () => {
    setIsCreateModalOpen(false);
    setIsEditModalOpen(false);
    setIsDetailModalOpen(false);
    setIsDeleteModalOpen(false);
    setIsPermissionModalOpen(false);
    setIsVoucherPermissionModalOpen(false);
    setIsRevokeVoucherModalOpen(false);
    setSelectedStaffId(null);
    setSelectedStaffName('');
  };

  return (
    <motion.div
      className="container mx-auto space-y-8 mt-10"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Header */}
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-4">
          <div className="rounded-full bg-gradient-to-br from-indigo-500 to-purple-600 p-3 shadow-lg">
            <Users className="h-8 w-8 text-white" />
          </div>
          <div>
            <h1 className="font-heading text-3xl font-bold text-white">
              Quản lý Nhân viên Hệ thống
            </h1>
            <p className="font-body text-sm text-gray-400">
              Quản lý tài khoản nhân viên (Manager Staff)
            </p>
          </div>
        </div>

        <div className="flex items-center gap-3">
          <motion.button
            onClick={handleRefresh}
            disabled={isLoading}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-body text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {isLoading ? (
              <Loader2 className="h-4 w-4 animate-spin" />
            ) : (
              <RefreshCcw className="h-4 w-4" />
            )}
            Làm mới
          </motion.button>

          <motion.button
            onClick={() => setIsCreateModalOpen(true)}
            className="flex items-center gap-2 rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-5 py-2 font-body font-semibold text-white shadow-lg transition hover:from-emerald-600 hover:to-teal-700"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Plus className="h-5 w-5" />
            Tạo nhân viên mới
          </motion.button>
        </div>
      </div>

      {/* Filters */}
      <StaffFilters
        isActiveFilter={isActiveFilter}
        searchTerm={searchTerm}
        sortBy={sortBy}
        sortOrder={sortOrder}
        onIsActiveFilterChange={setIsActiveFilter}
        onSearchChange={setSearchTerm}
        onSortByChange={setSortBy}
        onSortOrderChange={setSortOrder}
      />

      {/* Table */}
      <StaffTable
        data={data?.result}
        isLoading={isLoading}
        error={error}
        currentPage={currentPage}
        onPageChange={setCurrentPage}
        onViewDetail={handleViewDetail}
        onEdit={handleEdit}
        onDelete={handleDeleteClick}
        onManagePermissions={handleManagePermissions}
        onGrantVoucherPermission={handleGrantVoucherPermission}
        onRevokeVoucherPermission={handleRevokeVoucherPermission}
        currentVoucherManagerId={currentVoucherManagerId}
        onRefresh={refetch}
      />

      {/* Modals */}
      <AnimatePresence>
        {isCreateModalOpen && (
          <StaffFormModal
            mode="create"
            open={isCreateModalOpen}
            onClose={handleCloseModals}
          />
        )}

        {isEditModalOpen && selectedStaffId && (
          <StaffFormModal
            mode="edit"
            staffId={selectedStaffId}
            open={isEditModalOpen}
            onClose={handleCloseModals}
          />
        )}

        {isDetailModalOpen && selectedStaffId && (
          <StaffDetailModal
            staffId={selectedStaffId}
            open={isDetailModalOpen}
            onClose={handleCloseModals}
          />
        )}

        {isDeleteModalOpen && selectedStaffId && (
          <StaffDeleteConfirmModal
            staffId={selectedStaffId}
            staffName={selectedStaffName}
            open={isDeleteModalOpen}
            onClose={handleCloseModals}
            onSuccess={refetch}
          />
        )}

        {isPermissionModalOpen && selectedStaffId && (
          <StaffPermissionModal
            isOpen={isPermissionModalOpen}
            onClose={handleCloseModals}
            staffId={selectedStaffId}
            staffName={selectedStaffName}
          />
        )}

        {isVoucherPermissionModalOpen && selectedStaffId && (
          <VoucherPermissionConfirmModal
            isOpen={isVoucherPermissionModalOpen}
            onClose={handleCloseModals}
            onConfirm={handleConfirmGrantVoucherPermission}
            staffName={selectedStaffName}
            isAssigning={grantVoucherMutation.isPending}
            currentVoucherManagerName={currentVoucherManagerName}
          />
        )}

        {isRevokeVoucherModalOpen && selectedStaffId && (
          <RevokeVoucherPermissionModal
            isOpen={isRevokeVoucherModalOpen}
            onClose={handleCloseModals}
            onConfirm={handleConfirmRevokeVoucherPermission}
            staffName={selectedStaffName}
            isRevoking={revokeVoucherMutation.isPending}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default StaffManagement;
