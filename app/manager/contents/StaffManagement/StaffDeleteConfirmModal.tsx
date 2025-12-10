 "use client";

import { motion } from 'framer-motion';
import { AlertTriangle, Loader2 } from 'lucide-react';

import { useDeleteManagerStaff } from '@/apis/manager.staff.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

interface StaffDeleteConfirmModalProps {
  open: boolean;
  staffId: number;
  staffName: string;
  onClose: () => void;
  onSuccess: () => void;
}

const StaffDeleteConfirmModal = ({
  open,
  staffId,
  staffName,
  onClose,
  onSuccess
}: StaffDeleteConfirmModalProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const deleteStaffMutation = useDeleteManagerStaff();

  const handleConfirm = () => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập lại', undefined, 'error');
      return;
    }

    deleteStaffMutation.mutate(
      { staffId, accessToken },
      {
        onSuccess: (response) => {
          showToast(response.message || 'Xóa nhân viên thành công', undefined, 'success');
          onSuccess();
          onClose();
        },
        onError: (error: any) => {
          const message = error?.message || 'Xóa nhân viên thất bại';
          showToast(message, undefined, 'error');
        }
      }
    );
  };

  if (!open) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-4 w-full max-w-md rounded-2xl border border-red-500/30 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Icon */}
        <div className="mb-6 flex justify-center">
          <div className="rounded-full bg-red-500/20 p-4">
            <AlertTriangle className="h-12 w-12 text-red-400" />
          </div>
        </div>

        {/* Header */}
        <div className="mb-6 text-center">
          <h2 className="font-heading text-2xl font-semibold text-white">
            Xác nhận vô hiệu hóa
          </h2>
          <p className="mt-3 font-body text-sm text-gray-300">
            Bạn có chắc chắn muốn vô hiệu hóa nhân viên
          </p>
          <p className="mt-2 font-body text-lg font-semibold text-red-300">
            "{staffName}"
          </p>
          <p className="mt-3 font-body text-xs text-gray-400">
            Tài khoản sẽ bị vô hiệu hóa (isActive = false) và không thể đăng nhập.
            Bạn có thể kích hoạt lại sau.
          </p>
        </div>

        {/* Actions */}
        <div className="flex gap-3">
          <motion.button
            type="button"
            onClick={onClose}
            disabled={deleteStaffMutation.isPending}
            className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 font-body text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            Hủy bỏ
          </motion.button>
          <motion.button
            type="button"
            onClick={handleConfirm}
            disabled={deleteStaffMutation.isPending}
            className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-red-500 px-4 py-2.5 font-body font-semibold text-white transition hover:bg-red-600 disabled:cursor-not-allowed disabled:opacity-50"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {deleteStaffMutation.isPending ? (
              <>
                <Loader2 className="h-4 w-4 animate-spin" />
                Đang xử lý...
              </>
            ) : (
              <>
                <AlertTriangle className="h-4 w-4" />
                Xác nhận vô hiệu hóa
              </>
            )}
          </motion.button>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StaffDeleteConfirmModal;
