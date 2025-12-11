"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import {
  Eye,
  Edit,
  Trash2,
  User,
  Mail,
  Phone,
  Calendar,
  CheckCircle,
  XCircle,
  ShieldCheck,
  Ticket,
  MoreVertical,
} from "lucide-react";

import type { GetManagerStaffsResponse } from "@/apis/manager.staff.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";

const tableVariants = {
  hidden: { opacity: 0, y: 12 },
  visible: { opacity: 1, y: 0, transition: { duration: 0.3 } },
};

interface StaffTableProps {
  data?: GetManagerStaffsResponse["result"];
  isLoading: boolean;
  error: Error | null;
  currentPage: number;
  onPageChange: (page: number) => void;
  onViewDetail: (staffId: number) => void;
  onEdit: (staffId: number) => void;
  onDelete: (staffId: number, fullName: string) => void;
  onManagePermissions: (staffId: number, fullName: string) => void;
  onGrantVoucherPermission: (staffId: number, fullName: string) => void;
  onRevokeVoucherPermission: (staffId: number, fullName: string) => void;
  currentVoucherManagerId?: number | null;
  onRefresh: () => void;
}

const StaffTable = ({
  data,
  isLoading,
  error,
  currentPage,
  onPageChange,
  onViewDetail,
  onEdit,
  onDelete,
  onManagePermissions,
  onGrantVoucherPermission,
  onRevokeVoucherPermission,
  currentVoucherManagerId,
  onRefresh,
}: StaffTableProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const [openDropdownId, setOpenDropdownId] = useState<number | null>(null);

  const handleDeleteClick = (staffId: number, fullName: string) => {
    onDelete(staffId, fullName);
  };

  if (isLoading) {
    return (
      <motion.div
        className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="flex flex-col items-center gap-3">
          <div className="h-12 w-12 animate-spin rounded-full border-4 border-white/20 border-t-emerald-500" />
          <p className="font-body text-sm text-gray-400">
            Đang tải danh sách nhân viên...
          </p>
        </div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="flex min-h-[400px] items-center justify-center rounded-2xl border border-red-500/30 bg-red-500/10 backdrop-blur-xl"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <XCircle className="mx-auto h-12 w-12 text-red-400" />
          <p className="mt-3 font-body text-red-300">
            {(error as any)?.message || "Không thể tải danh sách nhân viên"}
          </p>
        </div>
      </motion.div>
    );
  }

  const staffs = data?.managerStaffs || [];
  const pagination = data?.pagination;

  if (staffs.length === 0) {
    return (
      <motion.div
        className="flex min-h-[400px] items-center justify-center rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl"
        variants={tableVariants}
        initial="hidden"
        animate="visible"
      >
        <div className="text-center">
          <User className="mx-auto h-12 w-12 text-gray-400" />
          <p className="mt-3 font-body text-gray-400">Không có nhân viên nào</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="space-y-4"
      variants={tableVariants}
      initial="hidden"
      animate="visible"
    >
      <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-xl">
        <div className="overflow-x-auto">
          <table className="w-full">
            <thead className="border-b border-white/10 bg-white/5">
              <tr>
                <th className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  ID
                </th>
                <th className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Họ và Tên
                </th>
                <th className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Email
                </th>
                <th className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Số điện thoại
                </th>
                <th className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Ngày tuyển dụng
                </th>
                <th className="px-6 py-4 text-left font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Trạng thái
                </th>
                <th className="px-6 py-4 text-center font-body text-xs font-semibold uppercase tracking-wider text-gray-300">
                  Thao tác
                </th>
              </tr>
            </thead>
            <tbody className="divide-y divide-white/10">
              {staffs.map((staff) => (
                <tr
                  key={staff.managerStaffId}
                  className="transition hover:bg-white/5"
                >
                  <td className="px-6 py-4 font-body text-sm text-gray-300">
                    {staff.managerStaffId}
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <User className="h-4 w-4 text-indigo-400" />
                      <span className="font-body font-semibold text-white">
                        {staff.fullName}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Mail className="h-4 w-4 text-blue-400" />
                      <span className="font-body text-sm text-gray-300">
                        {staff.email}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Phone className="h-4 w-4 text-green-400" />
                      <span className="font-body text-sm text-gray-300">
                        {staff.phone}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex items-center gap-2">
                      <Calendar className="h-4 w-4 text-orange-400" />
                      <span className="font-body text-sm text-gray-300">
                        {new Date(staff.hireDate).toLocaleDateString("vi-VN")}
                      </span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    {staff.isActive ? (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-emerald-500/30 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-300">
                        <CheckCircle className="h-3 w-3" />
                        Hoạt động
                      </span>
                    ) : (
                      <span className="inline-flex items-center gap-1.5 rounded-full border border-red-500/30 bg-red-500/20 px-3 py-1 text-xs font-semibold text-red-300">
                        <XCircle className="h-3 w-3" />
                        Vô hiệu hóa
                      </span>
                    )}
                  </td>
                  <td className="px-6 py-4">
                    <div className="relative flex items-center justify-center">
                      <Popover
                        open={openDropdownId === staff.managerStaffId}
                        onOpenChange={(isOpen) =>
                          setOpenDropdownId(
                            isOpen ? staff.managerStaffId : null
                          )
                        }
                      >
                        <PopoverTrigger asChild>
                          <button
                            onClick={() =>
                              setOpenDropdownId(
                                openDropdownId === staff.managerStaffId
                                  ? null
                                  : staff.managerStaffId
                              )
                            }
                            className="rounded-lg border border-gray-500/30 bg-gray-500/20 p-2 text-gray-300 transition hover:bg-gray-500/30"
                            title="Thêm tùy chọn"
                          >
                            <MoreVertical className="h-4 w-4" />
                          </button>
                        </PopoverTrigger>
                        <PopoverContent
                          side="left"
                          align="end"
                          sideOffset={5}
                          avoidCollisions={false}
                          className="w-56 rounded-xl border border-white/10 bg-gray-900/95 p-2 shadow-2xl backdrop-blur-xl"
                        >
                          <div className="flex flex-col gap-1">
                            {/* Xem chi tiết */}
                            <button
                              onClick={() => {
                                onViewDetail(staff.managerStaffId);
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-blue-500/20 hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                              Xem chi tiết
                            </button>

                            {/* Chỉnh sửa */}
                            <button
                              onClick={() => {
                                onEdit(staff.managerStaffId);
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-orange-500/20 hover:text-orange-300"
                            >
                              <Edit className="h-4 w-4" />
                              Chỉnh sửa
                            </button>

                            {/* Phân quyền */}
                            <button
                              onClick={() => {
                                onManagePermissions(
                                  staff.managerStaffId,
                                  staff.fullName
                                );
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-purple-500/20 hover:text-purple-300"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Phân quyền
                            </button>

                            {/* Logic quản lý Voucher */}
                            {currentVoucherManagerId ===
                              staff.managerStaffId && (
                              <>
                                <div className="my-1 h-px bg-white/10" />
                                <div className="flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-2.5 text-xs font-semibold text-green-300">
                                  <Ticket className="h-3.5 w-3.5" />
                                  Quản lý Voucher
                                </div>
                                <button
                                  onClick={() => {
                                    onRevokeVoucherPermission(
                                      staff.managerStaffId,
                                      staff.fullName
                                    );
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-amber-500/20 hover:text-amber-300"
                                >
                                  <Ticket className="h-4 w-4" />
                                  Thu hồi quyền Voucher
                                </button>
                              </>
                            )}

                            {!currentVoucherManagerId && (
                              <>
                                <div className="my-1 h-px bg-white/10" />
                                <button
                                  onClick={() => {
                                    onGrantVoucherPermission(
                                      staff.managerStaffId,
                                      staff.fullName
                                    );
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-pink-500/20 hover:text-pink-300"
                                >
                                  <Ticket className="h-4 w-4" />
                                  Cấp quyền Voucher
                                </button>
                              </>
                            )}

                            <div className="my-1 h-px bg-white/10" />

                            {/* Xóa */}
                            <button
                              onClick={() => {
                                handleDeleteClick(
                                  staff.managerStaffId,
                                  staff.fullName
                                );
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-red-500/20 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa (vô hiệu hóa)
                            </button>
                          </div>
                        </PopoverContent>
                      </Popover>
                    </div>
                  </td>

                  {/* <AnimatePresence>
                    {openDropdownId === staff.managerStaffId && (
                      <>
                        <div
                          className="fixed inset-0 z-40"
                          onClick={() => setOpenDropdownId(null)}
                        />
                        <motion.div
                          initial={{ opacity: 0, scale: 0.95, y: -10 }}
                          animate={{ opacity: 1, scale: 1, y: 0 }}
                          exit={{ opacity: 0, scale: 0.95, y: -10 }}
                          transition={{ duration: 0.15 }}
                          className="absolute right-0 top-12 z-50 w-56 rounded-xl border border-white/10 bg-gray-900/95 backdrop-blur-xl shadow-2xl"
                        >
                          <div className="p-2">
                            <button
                              onClick={() => {
                                onViewDetail(staff.managerStaffId);
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-blue-500/20 hover:text-blue-300"
                            >
                              <Eye className="h-4 w-4" />
                              Xem chi tiết
                            </button>

                            <button
                              onClick={() => {
                                onEdit(staff.managerStaffId);
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-orange-500/20 hover:text-orange-300"
                            >
                              <Edit className="h-4 w-4" />
                              Chỉnh sửa
                            </button>

                            <button
                              onClick={() => {
                                onManagePermissions(
                                  staff.managerStaffId,
                                  staff.fullName
                                );
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-purple-500/20 hover:text-purple-300"
                            >
                              <ShieldCheck className="h-4 w-4" />
                              Phân quyền
                            </button>

                            {currentVoucherManagerId ===
                              staff.managerStaffId && (
                              <>
                                <div className="my-1 h-px bg-white/10" />

                                <div className="flex items-center gap-2 rounded-lg bg-green-500/20 px-4 py-2.5 text-xs font-semibold text-green-300">
                                  <Ticket className="h-3.5 w-3.5" />
                                  Quản lý Voucher
                                </div>
                                <button
                                  onClick={() => {
                                    onRevokeVoucherPermission(
                                      staff.managerStaffId,
                                      staff.fullName
                                    );
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-amber-500/20 hover:text-amber-300"
                                >
                                  <Ticket className="h-4 w-4" />
                                  Thu hồi quyền Voucher
                                </button>
                              </>
                            )}

                            {!currentVoucherManagerId && (
                              <>
                                <div className="my-1 h-px bg-white/10" />

                                <button
                                  onClick={() => {
                                    onGrantVoucherPermission(
                                      staff.managerStaffId,
                                      staff.fullName
                                    );
                                    setOpenDropdownId(null);
                                  }}
                                  className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-pink-500/20 hover:text-pink-300"
                                >
                                  <Ticket className="h-4 w-4" />
                                  Cấp quyền Voucher
                                </button>
                              </>
                            )}

                            <div className="my-1 h-px bg-white/10" />

                            <button
                              onClick={() => {
                                handleDeleteClick(
                                  staff.managerStaffId,
                                  staff.fullName
                                );
                                setOpenDropdownId(null);
                              }}
                              className="flex w-full items-center gap-3 rounded-lg px-4 py-2.5 text-left text-sm text-gray-300 transition hover:bg-red-500/20 hover:text-red-300"
                            >
                              <Trash2 className="h-4 w-4" />
                              Xóa (vô hiệu hóa)
                            </button>
                          </div>
                        </motion.div>
                      </>
                    )}
                  </AnimatePresence> */}
                </tr>
              ))}
            </tbody>
          </table>
        </div>
      </div>

      {/* Pagination */}
      {pagination && pagination.totalPages > 1 && (
        <div className="flex items-center justify-between rounded-lg border border-white/10 bg-white/5 px-6 py-4 backdrop-blur-xl">
          <p className="font-body text-sm text-gray-400">
            Trang {pagination.currentPage} / {pagination.totalPages} • Tổng{" "}
            {pagination.totalCount} nhân viên
          </p>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={!pagination.hasPrevious}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-body text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Trước
            </motion.button>
            <motion.button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={!pagination.hasNext}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 font-body text-sm text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Sau
            </motion.button>
          </div>
        </div>
      )}
    </motion.div>
  );
};

export default StaffTable;
