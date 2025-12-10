"use client";

import { motion, AnimatePresence } from 'framer-motion';
import { X, Ticket, AlertCircle, Loader2, CheckCircle } from 'lucide-react';

interface VoucherPermissionConfirmModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: () => void;
  staffName: string;
  isAssigning: boolean;
  currentVoucherManagerName?: string | null;
}

export default function VoucherPermissionConfirmModal({
  isOpen,
  onClose,
  onConfirm,
  staffName,
  isAssigning,
  currentVoucherManagerName,
}: VoucherPermissionConfirmModalProps) {
  const hasCurrentManager = !!currentVoucherManagerName;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-lg -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className={`flex h-12 w-12 items-center justify-center rounded-xl ${
                  hasCurrentManager 
                    ? 'bg-amber-500/20 text-amber-400' 
                    : 'bg-purple-500/20 text-purple-400'
                }`}>
                  {hasCurrentManager ? (
                    <AlertCircle size={24} />
                  ) : (
                    <Ticket size={24} />
                  )}
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    {hasCurrentManager ? 'Chuyển quyền Voucher' : 'Cấp quyền Voucher'}
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    {hasCurrentManager 
                      ? 'Quyền quản lý voucher toàn hệ thống' 
                      : 'Cấp quyền quản lý voucher cho nhân viên'}
                  </p>
                </div>
              </div>
              <button
                onClick={onClose}
                disabled={isAssigning}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            <div className="mb-6 space-y-4">
              {hasCurrentManager ? (
                <div className="rounded-lg border border-amber-500/30 bg-amber-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <AlertCircle className="h-5 w-5 text-amber-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-amber-300">
                        Đã có nhân viên quản lý Voucher
                      </p>
                      <p className="mt-2 text-sm text-amber-200/80">
                        Nhân viên <span className="font-semibold">{currentVoucherManagerName}</span> đang quản lý voucher toàn hệ thống.
                      </p>
                      <p className="mt-2 text-sm text-amber-200/80">
                        Nếu tiếp tục, quyền sẽ được chuyển sang nhân viên <span className="font-semibold">{staffName}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              ) : (
                <div className="rounded-lg border border-purple-500/30 bg-purple-500/10 p-4">
                  <div className="flex items-start gap-3">
                    <CheckCircle className="h-5 w-5 text-purple-400 flex-shrink-0 mt-0.5" />
                    <div className="flex-1">
                      <p className="font-semibold text-purple-300">
                        Cấp quyền quản lý Voucher
                      </p>
                      <p className="mt-2 text-sm text-purple-200/80">
                        Bạn sắp cấp quyền quản lý voucher toàn hệ thống cho nhân viên <span className="font-semibold">{staffName}</span>.
                      </p>
                    </div>
                  </div>
                </div>
              )}

              <div className="rounded-lg border border-white/10 bg-white/5 p-4">
                <p className="font-semibold text-white mb-2">Quyền bao gồm:</p>
                <ul className="space-y-1 text-sm text-gray-300">
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Tạo voucher mới
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Xem danh sách và chi tiết voucher
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Cập nhật thông tin voucher
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Xóa voucher (soft delete)
                  </li>
                  <li className="flex items-center gap-2">
                    <div className="h-1.5 w-1.5 rounded-full bg-blue-400" />
                    Gửi voucher cho users
                  </li>
                </ul>
              </div>

              <div className="rounded-lg border border-blue-500/30 bg-blue-500/10 p-3">
                <p className="text-xs text-blue-200">
                  💡 <span className="font-semibold">Lưu ý:</span> Chỉ một nhân viên được quản lý voucher tại một thời điểm. Quyền áp dụng toàn hệ thống.
                </p>
              </div>
            </div>

            <div className="flex gap-3">
              <button
                onClick={onClose}
                disabled={isAssigning}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={onConfirm}
                disabled={isAssigning}
                className={`flex flex-1 items-center justify-center gap-2 rounded-lg px-4 py-2.5 text-sm font-semibold text-white transition disabled:cursor-not-allowed disabled:opacity-50 ${
                  hasCurrentManager
                    ? 'bg-amber-500 hover:bg-amber-600'
                    : 'bg-purple-500 hover:bg-purple-600'
                }`}
              >
                {isAssigning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang xử lý...
                  </>
                ) : (
                  <>
                    <CheckCircle size={16} />
                    {hasCurrentManager ? 'Chuyển quyền' : 'Xác nhận cấp quyền'}
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
