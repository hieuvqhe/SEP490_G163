"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';

import {
  useGetPartnersWithoutContracts,
  type PartnerWithoutContract
} from '@/apis/manager.contract.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

import CreateContractModal from './ContractModal';

const tableVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } }
};

const PartnerSigningTab = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const [selectedPartner, setSelectedPartner] = useState<PartnerWithoutContract | null>(null);
  const [showCreateModal, setShowCreateModal] = useState(false);

  const queryParams = useMemo(() => ({ page: 1, limit: 10 }), []);

  const isAuthenticated = Boolean(accessToken);

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useGetPartnersWithoutContracts(queryParams, typeof accessToken === 'string' ? accessToken : undefined);

  const hasShownErrorRef = useRef(false);

  useEffect(() => {
    if (isError && !hasShownErrorRef.current) {
      const apiError = error as { message?: string } | undefined;
      showToast(apiError?.message || 'Không thể tải danh sách đối tác', undefined, 'error');
      hasShownErrorRef.current = true;
    }

    if (!isError) {
      hasShownErrorRef.current = false;
    }
  }, [isError, error, showToast]);

  const partners = data?.result?.partners || [];

  const handleOpenModal = (partner: PartnerWithoutContract) => {
    setSelectedPartner(partner);
    setShowCreateModal(true);
  };

  const handleCloseModal = () => {
    setShowCreateModal(false);
    setSelectedPartner(null);
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
          <h2 className="text-2xl font-semibold text-white">Đối tác chưa ký hợp đồng</h2>
          <p className="mt-2 text-sm text-gray-400">
            Danh sách các đối tác chưa có hợp đồng. Tạo hợp đồng mới bằng cách chọn nút tương ứng.
          </p>
        </div>
        <button
          onClick={() => refetch()}
          className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
        >
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
          <p className="p-6 text-sm text-gray-300">Loading...</p>
        )}

        {!isLoading && accessToken && partners.length === 0 && (
          <p className="p-6 text-sm text-gray-300">Hiện chưa có đối tác nào cần tạo hợp đồng.</p>
        )}

        {!isLoading && !accessToken && (
          <p className="p-6 text-sm text-gray-300">Vui lòng đăng nhập lại để xem danh sách đối tác.</p>
        )}

        {!isLoading && partners.length > 0 && (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th scope="col" className="px-6 py-3">Tên đối tác</th>
                  <th scope="col" className="px-6 py-3">Mã đối tác</th>
                  <th scope="col" className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {partners.map((partner) => (
                  <tr key={partner.partnerId} className="hover:bg-white/10">
                    <td className="px-6 py-4 font-medium text-white">{partner.partnerName}</td>
                    <td className="px-6 py-4 text-gray-300">#{partner.partnerId}</td>
                    <td className="px-6 py-4 text-right">
                      <button
                        onClick={() => handleOpenModal(partner)}
                        className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black transition hover:bg-orange-400"
                      >
                        Tạo hợp đồng
                      </button>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </motion.div>

      <AnimatePresence>
        {showCreateModal && selectedPartner && (
          <CreateContractModal
            partner={selectedPartner}
            open={showCreateModal}
            onClose={handleCloseModal}
          />
        )}
      </AnimatePresence>
    </motion.div>
  );
};

export default PartnerSigningTab;
