"use client";

import type { ReactNode } from "react";
import { Loader2, Mail, Pencil, Send, Trash2, Eye, Users, ToggleRight, MoreHorizontal, UserSquare2 } from "lucide-react";
import {
  DropdownMenu,
  DropdownMenuTrigger,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuSeparator
} from "@/components/ui/dropdown-menu";
import { Button } from "@/components/ui/button";
import type { Pagination, VoucherSummary } from "@/apis/manager.voucher.api";
import { useGetManagerStaffById } from "@/apis/manager.staff.api";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";

interface VoucherTableProps {
  vouchers: VoucherSummary[];
  isLoading: boolean;
  isFetching: boolean;
  pagination?: Pagination;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onChangeLimit: (limit: number) => void;
  onView: (voucherId: number) => void;
  onEdit: (voucherId: number) => void;
  onDelete: (voucherId: number) => void;
  onToggleStatus: (voucherId: number) => void;
  onSendAll: (voucherId: number) => void;
  onSendSpecific: (voucherId: number) => void;
  onViewEmailHistory: (voucherId: number) => void;
  disableActions?: boolean;
  canEdit?: boolean;
  canDelete?: boolean;
  canSend?: boolean;
}

const limitOptions = [5, 10, 20, 50];

const VoucherTable = ({
  vouchers,
  isLoading,
  isFetching,
  pagination,
  page,
  onPageChange,
  limit,
  onChangeLimit,
  onView,
  onEdit,
  onDelete,
  onToggleStatus,
  onSendAll,
  onSendSpecific,
  onViewEmailHistory,
  disableActions,
  canEdit = true,
  canDelete = true,
  canSend = true,
}: VoucherTableProps) => {
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalCount ?? vouchers.length;

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (totalPages && page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm text-gray-200">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left">Mã voucher</th>
              <th className="px-6 py-3 text-left">Loại</th>
              <th className="px-6 py-3 text-left">Giá trị</th>
              <th className="px-6 py-3 text-left">Hiệu lực</th>
              <th className="px-6 py-3 text-left">Giới hạn / Đã dùng</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
              <th className="px-6 py-3 text-left">Quản lý bởi</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10">
                  <div className="flex items-center justify-center gap-2 text-sm text-gray-200">
                    <Loader2 className="h-5 w-5 animate-spin" />
                    Đang tải danh sách voucher...
                  </div>
                </td>
              </tr>
            ) : vouchers.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-300">
                  Không có voucher nào phù hợp.
                </td>
              </tr>
            ) : (
              vouchers.map((voucher) => (
                <tr key={voucher.voucherId} className="hover:bg-white/10 transition-colors">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex flex-col gap-0.5">
                      <span>{voucher.voucherCode}</span>
                      <span className="text-xs text-gray-400">ID: {voucher.voucherId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 capitalize text-gray-300">
                    {voucher.discountType === 'percent' ? 'Giảm theo %' : 'Giảm tiền mặt'}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {voucher.discountType === 'percent'
                      ? `${voucher.discountVal}%`
                      : `${formatCurrency(voucher.discountVal)}`}
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex flex-col text-xs">
                      <span>Từ: {formatDate(voucher.validFrom)}</span>
                      <span>Đến: {formatDate(voucher.validTo)}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    {voucher.usedCount}/{voucher.usageLimit}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        'inline-flex items-center rounded-full px-3 py-1 text-xs font-medium border',
                        voucher.isActive
                          ? 'border-emerald-400/40 bg-emerald-500/20 text-emerald-200'
                          : 'border-gray-400/40 bg-gray-500/20 text-gray-200',
                      )}
                    >
                      {voucher.isActive ? 'Hoạt động' : 'Ngưng hoạt động'}
                    </span>
                  </td>
                  <td className="px-6 py-4">
                    <VoucherManagerCell 
                      managerName={voucher.managerName} 
                      managerStaffId={voucher.managerStaffId} 
                    />
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex justify-end">
                      <DropdownMenu>
                        <DropdownMenuTrigger asChild>
                          <Button
                            variant="ghost"
                            size="icon-sm"
                            className="text-gray-300 hover:text-white"
                            disabled={disableActions}
                          >
                            <MoreHorizontal className="h-4 w-4" />
                            <span className="sr-only">Tác vụ voucher</span>
                          </Button>
                        </DropdownMenuTrigger>
                        <DropdownMenuContent className="w-52 bg-slate-900/95 text-white border-white/10">
                          <DropdownMenuItem onSelect={() => onView(voucher.voucherId)}>
                            <Eye className="h-4 w-4" />
                            Chi tiết
                          </DropdownMenuItem>
                          {canEdit && (
                            <>
                              <DropdownMenuItem onSelect={() => onEdit(voucher.voucherId)}>
                                <Pencil className="h-4 w-4" />
                                Sửa
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onToggleStatus(voucher.voucherId)}>
                                <ToggleRight className="h-4 w-4" />
                                {voucher.isActive ? 'Tắt hoạt động' : 'Bật hoạt động'}
                              </DropdownMenuItem>
                            </>
                          )}
                          {canSend && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem onSelect={() => onSendAll(voucher.voucherId)}>
                                <Mail className="h-4 w-4" />
                                Gửi cho tất cả
                              </DropdownMenuItem>
                              <DropdownMenuItem onSelect={() => onSendSpecific(voucher.voucherId)}>
                                <Users className="h-4 w-4" />
                                Gửi cho người cụ thể
                              </DropdownMenuItem>
                            </>
                          )}
                          <DropdownMenuItem onSelect={() => onViewEmailHistory(voucher.voucherId)}>
                            <Send className="h-4 w-4" />
                            Lịch sử email
                          </DropdownMenuItem>
                          {canDelete && (
                            <>
                              <DropdownMenuSeparator />
                              <DropdownMenuItem
                                className="text-red-300 focus:text-red-200"
                                onSelect={() => onDelete(voucher.voucherId)}
                              >
                                <Trash2 className="h-4 w-4" />
                                Xoá voucher
                              </DropdownMenuItem>
                            </>
                          )}
                        </DropdownMenuContent>
                      </DropdownMenu>
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/5 px-6 py-4 text-sm text-gray-200 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span>
            Trang {page} / {totalPages || 1}
          </span>
          <span className="hidden text-xs text-gray-400 md:inline">Tổng: {totalCount} voucher</span>
          <select
            value={limit}
            onChange={(event) => onChangeLimit(Number(event.target.value))}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white focus:border-orange-400 focus:outline-none"
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}/trang
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={page <= 1 || disableActions}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={handleNext}
            disabled={!!totalPages && page >= totalPages || disableActions}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>

        {isFetching && !isLoading && (
          <div className="flex items-center gap-2 text-xs text-gray-300">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang cập nhật dữ liệu...
          </div>
        )}
      </div>
    </div>
  );
};

interface ActionButtonProps {
  icon: ReactNode;
  label: string;
  onClick: () => void;
  disabled?: boolean;
  variant?: 'primary' | 'success' | 'danger' | 'secondary' | 'info';
}

const ActionButton = ({ icon, label, onClick, disabled, variant = 'secondary' }: ActionButtonProps) => {
  const baseClass = 'flex items-center gap-1 rounded-lg px-3 py-2 text-xs font-semibold transition';
  const variantClassMap: Record<NonNullable<ActionButtonProps['variant']>, string> = {
    primary: 'bg-orange-500/20 text-orange-200 hover:bg-orange-500/30 border border-orange-400/30',
    success: 'bg-emerald-500/20 text-emerald-200 hover:bg-emerald-500/30 border border-emerald-400/30',
    danger: 'bg-red-500/20 text-red-200 hover:bg-red-500/30 border border-red-400/30',
    secondary: 'bg-slate-500/10 text-gray-200 hover:bg-slate-500/20 border border-white/10',
    info: 'bg-blue-500/20 text-blue-200 hover:bg-blue-500/30 border border-blue-400/30',
  };

  return (
    <button
      className={clsx(baseClass, variantClassMap[variant], 'disabled:cursor-not-allowed disabled:opacity-60')}
      onClick={onClick}
      disabled={disabled}
    >
      {icon}
      <span>{label}</span>
    </button>
  );
};

const VoucherManagerCell = ({ managerName, managerStaffId }: { managerName: string; managerStaffId: number | null }) => {
  const { accessToken } = useAuthStore();
  
  const { data: staffData } = useGetManagerStaffById(
    managerStaffId || 0,
    managerStaffId ? accessToken ?? undefined : undefined
  );

  if (!managerStaffId) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <UserSquare2 className="h-4 w-4 text-blue-400" />
        <span className="text-gray-300">{managerName || 'Manager'}</span>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <UserSquare2 className="h-4 w-4 text-gray-400" />
        <span className="text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-xs">
      <div className="flex items-center gap-2">
        <UserSquare2 className="h-4 w-4 text-purple-400" />
        <span className="text-gray-300">{staffData.result.fullName}</span>
      </div>
      <span className="text-gray-400">Staff #{managerStaffId}</span>
    </div>
  );
};

const formatDate = (value?: string | null) => {
  if (!value) return '-';
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return '-';
  return date.toLocaleDateString('vi-VN');
};

const formatCurrency = (value: number) => {
  return value.toLocaleString('vi-VN', {
    style: 'currency',
    currency: 'VND',
    maximumFractionDigits: 0,
  });
};

export default VoucherTable;
