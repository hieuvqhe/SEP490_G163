"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Eye, Loader2, Lock, RefreshCcw, Send } from 'lucide-react';

import {
  useGetContracts,
  useActivateContract,
  type Contract,
  type ActivateContractRequest
} from '@/apis/manager.contract.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

import ContractDetailModal from './ContractDetailModal';
import SendContractModal from './SendContractModal';
import ConfirmActivationModal from './ConfirmActivationModal';

const tableVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const statusBadgeMap: Record<string, { label: string; className: string }> = {
  draft: {
    label: 'Bản nháp',
    className: 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
  },
  pending_signature: {
    label: 'Chờ ký',
    className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
  },
  pending: {
    label: 'Partner đã ký',
    className: 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
  },
  active: {
    label: 'Đã kích hoạt',
    className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
  },
  expired: {
    label: 'Đã hết hạn',
    className: 'bg-red-500/20 text-red-300 border border-red-500/30'
  }
};

const getStatusBadge = (status: string) => {
  return (
    statusBadgeMap[status] || {
      label: status,
      className: 'bg-slate-500/20 text-slate-200 border border-slate-500/30'
    }
  );
};

const toStartOfDay = (date: Date) => {
  const newDate = new Date(date);
  newDate.setHours(0, 0, 0, 0);
  return newDate;
};

const getOperationalStatus = (contract: Contract) => {
  if (contract.status !== 'active') {
    return {
      label: 'Chưa kích hoạt',
      className: 'bg-gray-500/20 text-gray-200 border border-gray-500/30'
    };
  }

  const today = toStartOfDay(new Date());
  const start = toStartOfDay(new Date(contract.startDate));
  const end = toStartOfDay(new Date(contract.endDate));

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return {
      label: 'Đang hoạt động',
      className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
    };
  }

  if (end < today) {
    return {
      label: 'Đã hết hạn',
      className: 'bg-red-500/20 text-red-300 border border-red-500/30'
    };
  }

  const msPerDay = 24 * 60 * 60 * 1000;
  const daysUntilEnd = Math.ceil((end.getTime() - today.getTime()) / msPerDay);

  if (start > today) {
    return {
      label: 'Sắp diễn ra',
      className: 'bg-sky-500/20 text-sky-200 border border-sky-500/30'
    };
  }

  if (daysUntilEnd <= 30) {
    return {
      label: 'Sắp hết hạn',
      className: 'bg-orange-500/20 text-orange-300 border border-orange-500/30'
    };
  }

  return {
    label: 'Đang hoạt động',
    className: 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
  };
};

const formatDateRange = (startDate?: string, endDate?: string) => {
  if (!startDate || !endDate) {
    return 'Không xác định';
  }

  const start = new Date(startDate);
  const end = new Date(endDate);

  if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
    return 'Không xác định';
  }

  return `${start.toLocaleDateString('vi-VN')} - ${end.toLocaleDateString('vi-VN')}`;
};

const ContractManagement = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [sendContractId, setSendContractId] = useState<number | null>(null);
  const [activationContractId, setActivationContractId] = useState<number | null>(null);

  const queryParams = useMemo(() => ({ page: 1, limit: 10 }), []);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useGetContracts(queryParams, accessToken || undefined);

  const hasShownErrorRef = useRef(false);

  useEffect(() => {
    if (isError && !hasShownErrorRef.current) {
      const apiError = error as { message?: string } | undefined;
      showToast(apiError?.message || 'Không thể tải danh sách hợp đồng', undefined, 'error');
      hasShownErrorRef.current = true;
    }

    if (!isError) {
      hasShownErrorRef.current = false;
    }
  }, [isError, error, showToast]);

  const contracts = data?.result?.contracts || [];

  const handleViewDetails = (contractId: number) => {
    setSelectedContractId(contractId);
  };

  const closeDetailModal = () => {
    setSelectedContractId(null);
  };

  const handleOpenSendModal = (contractId: number) => {
    setSendContractId(contractId);
  };

  const handleCloseSendModal = () => {
    setSendContractId(null);
  };

  const activateContractMutation = useActivateContract();

  const handleActivateContract = (contractId: number) => {
    setActivationContractId(contractId);
  };

  const handleCloseActivationModal = () => {
    setActivationContractId(null);
  };

  const handleConfirmActivate = (payload: ActivateContractRequest) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập lại', undefined, 'error');
      return;
    }

    if (activationContractId === null) {
      return;
    }

    activateContractMutation.mutate(
      { contractId: activationContractId, accessToken, data: payload },
      {
        onSuccess: () => {
          showToast('Kích hoạt HĐ thành công!', undefined, 'success');
          setActivationContractId(null);

          refetch();
        },
        onError: (error: any) => {
          showToast(error?.message || 'Kích hoạt hợp đồng thất bại', undefined, 'error');
        }
      }
    );
  };

  return (
    <motion.div
      className="space-y-6"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <div className="flex items-center justify-between rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-lg">
        <div>
          <h2 className="text-2xl font-semibold text-white">Quản lý hợp đồng</h2>
          <p className="mt-2 text-sm text-gray-400">
            Theo dõi danh sách hợp đồng, trạng thái và các hành động liên quan.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
          <RefreshCcw size={16} />
          Làm mới
        </button>
      </div>

      <motion.div
        className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        {isLoading && (
          <div className="flex items-center justify-center gap-3 p-8 text-sm text-gray-300">
            <Loader2 className="animate-spin" size={20} />
            Đang tải danh sách hợp đồng...
          </div>
        )}

        {!isLoading && !accessToken && (
          <p className="p-6 text-sm text-gray-300">Vui lòng đăng nhập để xem danh sách hợp đồng.</p>
        )}

        {!isLoading && accessToken && contracts.length === 0 && (
          <p className="p-6 text-sm text-gray-300">Hiện chưa có hợp đồng nào.</p>
        )}

        {!isLoading && accessToken && contracts.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Tên hợp đồng</th>
                  <th scope="col" className="px-6 py-3">Đối tác</th>
                  <th scope="col" className="px-6 py-3">Thời gian</th>
                  <th scope="col" className="px-6 py-3">% Hoa hồng</th>
                  <th scope="col" className="px-6 py-3">Loại hợp đồng</th>
                  <th scope="col" className="px-6 py-3">Trạng thái</th>
                  <th scope="col" className="px-6 py-3">Trạng thái hoạt động</th>
                  <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {contracts.map((contract) => {
                  const statusBadge = getStatusBadge(contract.status);
                  const operationalStatus = getOperationalStatus(contract);

                  return (
                    <tr key={contract.contractId} className="transition hover:bg-white/10">
                      <td className="px-6 py-4 font-medium text-white">
                        <div className="flex flex-col">
                          <span>{contract.title || contract.contractNumber}</span>
                          <span className="text-xs text-gray-400">#{contract.contractNumber}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex flex-col">
                          <span className="text-white">{contract.partnerName}</span>
                          <span className="text-xs text-gray-400">ID: {contract.partnerId}</span>
                        </div>
                      </td>
                      <td className="px-6 py-4 text-gray-300">{formatDateRange(contract.startDate, contract.endDate)}</td>
                      <td className="px-6 py-4 text-gray-300">{contract.commissionRate}%</td>
                      <td className="px-6 py-4 text-gray-300 capitalize">{contract.contractType}</td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${statusBadge.className}`}>
                          {statusBadge.label}
                        </span>
                      </td>
                      <td className="px-6 py-4 whitespace-nowrap">
                        <span className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium whitespace-nowrap ${operationalStatus.className}`}>
                          {operationalStatus.label}
                        </span>
                      </td>
                      <td className="px-6 py-4">
                        <div className="flex items-center justify-end gap-2 text-xs">
                          <button
                            onClick={() => handleViewDetails(contract.contractId)}
                            className="flex w-32 items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 font-semibold text-blue-200 transition hover:bg-blue-500/30"
                          >
                            <Eye size={14} />
                            Xem chi tiết
                          </button>
                          {contract.status === 'draft' && (
                            <button
                              onClick={() => handleOpenSendModal(contract.contractId)}
                              className="flex w-32 items-center justify-center gap-2 rounded-lg bg-orange-500/20 px-3 py-2 font-semibold text-orange-200 transition hover:bg-orange-500/30"
                            >
                              <Send size={14} />
                              Gửi HĐ
                            </button>
                          )}
                          {contract.status === 'pending' && (
                            <button
                              onClick={() => handleActivateContract(contract.contractId)}
                              className="flex w-32 items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                            >
                              <Lock size={14} />
                              Kích hoạt
                            </button>
                          )}
                        </div>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {selectedContractId !== null && (
          <ContractDetailModal
            contractId={selectedContractId}
            onClose={closeDetailModal}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {sendContractId !== null && (
          <SendContractModal
            contractId={sendContractId}
            onClose={handleCloseSendModal}
            onSent={() => {
              handleCloseSendModal();
              refetch();
            }}
          />
        )}
      </AnimatePresence>

      <AnimatePresence>
        {activationContractId !== null && (
          <ConfirmActivationModal
            contractId={activationContractId}
            onCancel={handleCloseActivationModal}
            onConfirm={handleConfirmActivate}
            isProcessing={activateContractMutation.isPending}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default ContractManagement;