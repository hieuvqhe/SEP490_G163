"use client";

import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, Shield, CheckCircle, XCircle, Loader2 } from 'lucide-react';

import { useGetManagerStaffById } from '@/apis/manager.staff.api';
import { useAuthStore } from '@/store/authStore';

interface StaffDetailModalProps {
  staffId: number;
  open: boolean;
  onClose: () => void;
}

const StaffDetailModal = ({ staffId, open, onClose }: StaffDetailModalProps) => {
  const { accessToken } = useAuthStore();
  const { data, isLoading, error } = useGetManagerStaffById(staffId, accessToken ?? undefined);

  if (!open) return null;

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <Loader2 className="h-12 w-12 animate-spin text-indigo-500" />
          <p className="font-body text-sm text-gray-400">Đang tải thông tin nhân viên...</p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <motion.div
          className="mx-4 w-full max-w-md rounded-2xl border border-red-500/30 bg-red-500/10 p-8 text-center backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.8 }}
          animate={{ opacity: 1, scale: 1 }}
        >
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <h3 className="mt-4 font-heading text-xl font-semibold text-red-300">
            Không thể tải thông tin
          </h3>
          <p className="mt-2 font-body text-sm text-red-200">
            {(error as any)?.message || 'Đã có lỗi xảy ra'}
          </p>
          <motion.button
            onClick={onClose}
            className="mt-6 rounded-lg bg-red-500/20 px-5 py-2 font-body text-sm text-red-300 transition hover:bg-red-500/30"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            Đóng
          </motion.button>
        </motion.div>
      </motion.div>
    );
  }

  const staff = data?.result;
  if (!staff) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-4 w-full max-w-2xl overflow-y-auto max-h-[92vh] rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        {/* Header */}
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">
              Chi tiết Nhân viên
            </h2>
            <p className="mt-1 font-body text-sm text-gray-300">
              Thông tin tài khoản Manager Staff
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="space-y-6">
          {/* Status Badge */}
          <div className="flex justify-center">
            {staff.isActive ? (
              <span className="inline-flex items-center gap-2 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-6 py-2 text-sm font-semibold text-emerald-300">
                <CheckCircle className="h-5 w-5" />
                Tài khoản đang hoạt động
              </span>
            ) : (
              <span className="inline-flex items-center gap-2 rounded-full border border-red-500/30 bg-red-500/20 px-6 py-2 text-sm font-semibold text-red-300">
                <XCircle className="h-5 w-5" />
                Tài khoản đã vô hiệu hóa
              </span>
            )}
          </div>

          {/* Info Grid */}
          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            {/* Manager Staff ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <Shield className="h-4 w-4" />
                ID Nhân viên
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">#{staff.managerStaffId}</p>
              </div>
            </div>

            {/* User ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <User className="h-4 w-4" />
                User ID
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">#{staff.userId}</p>
              </div>
            </div>

            {/* Full Name */}
            <div className="space-y-2 md:col-span-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <User className="h-4 w-4" />
                Họ và Tên
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm font-semibold text-white">{staff.fullName}</p>
              </div>
            </div>

            {/* Email */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <Mail className="h-4 w-4" />
                Email
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">{staff.email}</p>
              </div>
            </div>

            {/* Phone */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <Phone className="h-4 w-4" />
                Số điện thoại
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">{staff.phone}</p>
              </div>
            </div>

            {/* Hire Date */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <Calendar className="h-4 w-4" />
                Ngày tuyển dụng
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">
                  {new Date(staff.hireDate).toLocaleDateString('vi-VN')}
                </p>
              </div>
            </div>

            {/* Role Type */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <Shield className="h-4 w-4" />
                Loại tài khoản
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">{staff.roleType}</p>
              </div>
            </div>

            {/* Manager ID */}
            <div className="space-y-2">
              <label className="flex items-center gap-2 font-body text-xs text-gray-400">
                <User className="h-4 w-4" />
                Manager ID
              </label>
              <div className="rounded-lg border border-white/10 bg-white/5 px-4 py-3">
                <p className="font-body text-sm text-white">#{staff.managerId}</p>
              </div>
            </div>
          </div>

          {/* Close Button */}
          <div className="flex justify-end pt-4">
            <motion.button
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-6 py-2 font-body text-sm text-white transition hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Đóng
            </motion.button>
          </div>
        </div>
      </motion.div>
    </motion.div>
  );
};

export default StaffDetailModal;
