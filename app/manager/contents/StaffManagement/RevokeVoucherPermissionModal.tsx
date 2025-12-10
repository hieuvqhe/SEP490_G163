"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, AlertTriangle, Ticket } from 'lucide-react';

interface RevokeVoucherPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName: string;
  isRevoking: boolean;
}

const RevokeVoucherPermissionModal = ({
  isOpen,
  onClose,
  onConfirm,
  staffName,
  isRevoking
}: RevokeVoucherPermissionModalProps) => {
  return (
    <AnimatePresence>
      {isOpen && (
        <>
          {/* Backdrop */}
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />

          {/* Modal */}
          <div className="fixed inset-0 z-50 flex items-center justify-center p-4">
            <motion.div
              initial={{ opacity: 0, scale: 0.95, y: 20 }}
              animate={{ opacity: 1, scale: 1, y: 0 }}
              exit={{ opacity: 0, scale: 0.95, y: 20 }}
              className="relative w-full max-w-md overflow-hidden rounded-2xl border border-amber-500/30 bg-gradient-to-br from-gray-900 via-gray-800 to-gray-900 shadow-2xl"
            >
              {/* Close Button */}
              <button
                onClick={onClose}
                disabled={isRevoking}
                className="absolute right-4 top-4 rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:opacity-50"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Header */}
              <div className="flex items-center gap-4 border-b border-amber-500/20 bg-amber-500/10 p-6">
                <div className="rounded-full bg-amber-500/20 p-3">
                  <AlertTriangle className="h-6 w-6 text-amber-400" />
                </div>
                <div>
                  <h2 className="font-heading text-xl font-bold text-white">
                    Thu hồi quyền Voucher
                  </h2>
                  <p className="font-body text-sm text-gray-400">
                    Xác nhận thu hồi quyền quản lý Voucher
                  </p>
                </div>
              </div>

              {/* Content */}
              <div className="space-y-6 p-6">
                {/* Warning Message */}
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <p className="font-body text-sm text-amber-200">
                    Bạn có chắc chắn muốn thu hồi quyền quản lý Voucher từ nhân viên{' '}
                    <span className="font-semibold text-amber-100">{staffName}</span>?
                  </p>
                </div>

                {/* Permissions List */}
                <div className="space-y-3">
                  <p className="font-body text-sm font-semibold text-gray-300">
                    Các quyền sẽ bị thu hồi:
                  </p>
                  <div className="space-y-2 rounded-lg border border-white/10 bg-white/5 p-4">
                    {[
                      { code: 'VOUCHER_CREATE', name: 'Tạo voucher mới' },
                      { code: 'VOUCHER_READ', name: 'Xem thông tin voucher' },
                      { code: 'VOUCHER_UPDATE', name: 'Cập nhật voucher' },
                      { code: 'VOUCHER_DELETE', name: 'Xóa voucher' },
                      { code: 'VOUCHER_SEND', name: 'Gửi voucher' }
                    ].map((permission) => (
                      <div
                        key={permission.code}
                        className="flex items-start gap-2 font-body text-sm"
                      >
                        <Ticket className="mt-0.5 h-4 w-4 flex-shrink-0 text-amber-400" />
                        <div>
                          <span className="font-medium text-gray-200">{permission.name}</span>
                          <span className="ml-2 text-xs text-gray-500">({permission.code})</span>
                        </div>
                      </div>
                    ))}
                  </div>
                </div>

                {/* Info Box */}
                <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-4">
                  <p className="font-body text-xs text-blue-200">
                    💡 <span className="font-semibold">Lưu ý:</span> Sau khi thu hồi, bạn có thể
                    cấp quyền này cho nhân viên khác hoặc cấp lại cho nhân viên này sau.
                  </p>
                </div>
              </div>

              {/* Actions */}
              <div className="flex gap-3 border-t border-white/10 bg-white/5 p-6">
                <button
                  onClick={onClose}
                  disabled={isRevoking}
                  className="flex-1 rounded-lg border border-gray-500/30 bg-gray-500/20 px-6 py-3 font-body font-semibold text-gray-300 transition hover:bg-gray-500/30 disabled:opacity-50"
                >
                  Hủy
                </button>
                <button
                  onClick={onConfirm}
                  disabled={isRevoking}
                  className="flex-1 rounded-lg border border-amber-500/30 bg-gradient-to-r from-amber-500 to-orange-500 px-6 py-3 font-body font-semibold text-white shadow-lg transition hover:from-amber-600 hover:to-orange-600 disabled:opacity-50"
                >
                  {isRevoking ? (
                    <span className="flex items-center justify-center gap-2">
                      <div className="h-4 w-4 animate-spin rounded-full border-2 border-white/30 border-t-white" />
                      Đang thu hồi...
                    </span>
                  ) : (
                    'Xác nhận thu hồi'
                  )}
                </button>
              </div>
            </motion.div>
          </div>
        </>
      )}
    </AnimatePresence>
  );
};

export default RevokeVoucherPermissionModal;
