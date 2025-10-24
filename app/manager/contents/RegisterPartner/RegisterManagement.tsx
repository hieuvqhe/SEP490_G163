/* eslint-disable @typescript-eslint/no-explicit-any */
import { useState, useEffect } from 'react';
import { useToast } from '@/components/ToastProvider';
import { motion, AnimatePresence } from 'framer-motion';
import { useAuthStore } from '@/store/authStore';

import {
  useGetPendingPartners,
  useApprovePartner,
  useRejectPartner
} from '@/apis/manager.register';
import type {
  PendingPartner,
  GetPendingPartnersParams
} from '@/apis/manager.register';

import { RegisterFilters } from './RegisterFilters';
import { RegisterTable } from './RegisterTable';
import { PartnerDetailModal, ApproveConfirmModal, RejectConfirmModal } from './RegisterModal';

export const RegisterManagement = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  // Partner Management States
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(10);
  const [searchTerm, setSearchTerm] = useState('');
  const [sortBy, setSortBy] = useState<string>('created_at');
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('desc');

  // Modal states
  const [selectedPartner, setSelectedPartner] = useState<PendingPartner | null>(null);
  const [showPartnerModal, setShowPartnerModal] = useState(false);
  const [showApproveModal, setShowApproveModal] = useState(false);
  const [showRejectModal, setShowRejectModal] = useState(false);
  const [partnerToApprove, setPartnerToApprove] = useState<PendingPartner | null>(null);
  const [partnerToReject, setPartnerToReject] = useState<PendingPartner | null>(null);

  // Build query params
  const queryParams: GetPendingPartnersParams = {
    page: currentPage,
    limit,
    search: searchTerm || undefined,
    sortBy: sortBy as GetPendingPartnersParams['sortBy'],
    sortOrder
  };

  // TanStack Query hooks
  const { data: partnersData, isLoading: partnersLoading, refetch: refetchPartners } = useGetPendingPartners(queryParams, accessToken || undefined);

  const approvePartnerMutation = useApprovePartner();
  const rejectPartnerMutation = useRejectPartner();

  // Extract data
  const partners = partnersData?.result?.partners || [];
  const totalPartners = partnersData?.result?.pagination?.totalCount || 0;

  // Local flag to ensure we only notify once per fetch cycle
  const [hasNotifiedEmpty, setHasNotifiedEmpty] = useState(false);

  // Effect to watch for empty results and show a toast
  // Note: partnersLoading is true while fetching; we only notify when loading finished.
  useEffect(() => {
    if (!partnersLoading) {
      if (Array.isArray(partners) && partners.length === 0 && totalPartners === 0) {
        if (!hasNotifiedEmpty) {
          showToast('Hiện tại chưa có partner nào đăng ký.', undefined, 'info');
          setHasNotifiedEmpty(true);
        }
      } else {
        // reset notification flag when data appears
        if (hasNotifiedEmpty) setHasNotifiedEmpty(false);
      }
    }
  }, [partnersLoading, partners, totalPartners, hasNotifiedEmpty, showToast]);

  // Handlers
  const handleViewPartner = (partner: PendingPartner) => {
    setSelectedPartner(partner);
    setShowPartnerModal(true);
  };

  const handleApprovePartner = (partnerId: number) => {
    const partner = partners.find(p => p.partnerId === partnerId);
    if (partner) {
      setPartnerToApprove(partner);
      setShowApproveModal(true);
    }
  };

  const handleRejectPartner = (partnerId: number) => {
    const partner = partners.find(p => p.partnerId === partnerId);
    if (partner) {
      setPartnerToReject(partner);
      setShowRejectModal(true);
    }
  };

  const handleConfirmApprove = async () => {
    if (!partnerToApprove) return;

    try {
      await approvePartnerMutation.mutateAsync({
        partnerId: partnerToApprove.partnerId,
        accessToken: accessToken || ''
      });
      showToast('Đối tác đã được duyệt thành công', undefined, 'success');
      setShowApproveModal(false);
      setPartnerToApprove(null);
      refetchPartners();
    } catch (error: any) {
      showToast(error?.message || 'Không thể duyệt đối tác', undefined, 'error');
    }
  };

  const handleConfirmReject = async (rejectionReason: string) => {
    if (!partnerToReject) return;

    try {
      await rejectPartnerMutation.mutateAsync({
        partnerId: partnerToReject.partnerId,
        data: { rejectionReason },
        accessToken: accessToken || ''
      });
      showToast('Đối tác đã bị từ chối', undefined, 'success');
      setShowRejectModal(false);
      setPartnerToReject(null);
      refetchPartners();
    } catch (error: any) {
      showToast(error?.message || 'Không thể từ chối đối tác', undefined, 'error');
    }
  };

  const handlePageChange = (page: number) => {
    setCurrentPage(page);
  };

  const handleSearch = (e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  };

  const handleViewPartnerWrapper = (partner: PendingPartner) => {
    handleViewPartner(partner);
  };

  const handleApprovePartnerWrapper = (partnerId: number) => {
    handleApprovePartner(partnerId);
  };

  const handleRejectPartnerWrapper = (partnerId: number) => {
    handleRejectPartner(partnerId);
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
        <div className="flex flex-col gap-4 rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-lg shadow-lg md:flex-row md:items-center md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Quản lý đăng ký đối tác</h2>
            <p className="mt-2 max-w-2xl text-sm text-gray-300">
              Theo dõi các yêu cầu đăng ký từ đối tác, xem chi tiết hồ sơ và xử lý duyệt nhanh chóng trong một giao diện thống nhất.
            </p>
          </div>
          <div className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 px-4 py-3 text-sm text-gray-200">
            <span className="font-medium text-white">{totalPartners}</span>
            <span className="text-gray-300">đối tác đang chờ duyệt</span>
          </div>
        </div>
      </motion.div>

      <motion.div variants={itemVariants}>
        <RegisterFilters
          totalPartners={totalPartners}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          sortBy={sortBy}
          setSortBy={setSortBy}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onSearch={handleSearch}
          onRefresh={refetchPartners}
        />
      </motion.div>

      <motion.div variants={itemVariants}>
        {Array.isArray(partners) && partners.length > 0 ? (
          <RegisterTable
            partners={partners}
            partnersLoading={partnersLoading}
            currentPage={currentPage}
            totalPartners={totalPartners}
            limit={limit}
            onApprovePartner={handleApprovePartnerWrapper}
            onRejectPartner={handleRejectPartnerWrapper}
            onViewPartner={handleViewPartnerWrapper}
            onPageChange={handlePageChange}
          />
        ) : (
          // Inline empty state when no partners found
          <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-gray-300 backdrop-blur-lg">
            <h3 className="text-lg font-medium text-white">Chưa có đối tác đăng ký</h3>
            <p className="mt-2 text-sm">Hiện chưa có partner nào gửi yêu cầu đăng ký. Vui lòng thử lại sau hoặc nhấn "Làm mới".</p>
          </div>
        )}
      </motion.div>

      {/* Modals with AnimatePresence */}
      <AnimatePresence mode="wait">
        {showPartnerModal && selectedPartner && (
          <PartnerDetailModal
            partner={selectedPartner}
            onClose={() => {
              setShowPartnerModal(false);
              setSelectedPartner(null);
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showApproveModal && partnerToApprove && (
          <ApproveConfirmModal
            partner={partnerToApprove}
            onClose={() => {
              setShowApproveModal(false);
              setPartnerToApprove(null);
            }}
            onConfirm={handleConfirmApprove}
          />
        )}
      </AnimatePresence>

      <AnimatePresence mode="wait">
        {showRejectModal && partnerToReject && (
          <RejectConfirmModal
            partner={partnerToReject}
            onClose={() => {
              setShowRejectModal(false);
              setPartnerToReject(null);
            }}
            onConfirm={handleConfirmReject}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};