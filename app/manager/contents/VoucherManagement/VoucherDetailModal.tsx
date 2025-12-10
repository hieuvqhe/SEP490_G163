"use client";

import { Loader2, UserSquare2 } from "lucide-react";
import type { VoucherDetail } from "@/apis/manager.voucher.api";
import { useGetManagerStaffById } from "@/apis/manager.staff.api";
import { useAuthStore } from "@/store/authStore";

interface VoucherDetailModalProps {
  open: boolean;
  voucher?: VoucherDetail;
  isLoading?: boolean;
  onClose: () => void;
}

const VoucherDetailModal = ({ open, voucher, isLoading, onClose }: VoucherDetailModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Chi tiết voucher</h2>
            <p className="mt-1 text-sm text-gray-300">
              Thông tin chi tiết về voucher được chọn.
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/10"
            type="button"
          >
            Đóng
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải chi tiết voucher...
          </div>
        ) : !voucher ? (
          <div className="py-16 text-center text-sm text-gray-300">
            Không tìm thấy thông tin voucher.
          </div>
        ) : (
          <div className="space-y-6">
            <div className="grid gap-5 md:grid-cols-2">
              <InfoItem label="Mã voucher" value={voucher.voucherCode} />
              <InfoItem label="Loại giảm giá" value={voucher.discountType === "percent" ? "Giảm theo %" : "Giảm tiền mặt"} />
              <InfoItem
                label="Giá trị"
                value={
                  voucher.discountType === "percent"
                    ? `${voucher.discountVal}%`
                    : formatCurrency(voucher.discountVal)
                }
              />
              <InfoItem label="Giới hạn sử dụng" value={`${voucher.usageLimit}`} />
              <InfoItem label="Đã sử dụng" value={`${voucher.usedCount}`} />
              <InfoItem label="Trạng thái" value={voucher.isActive ? "Đang hoạt động" : "Ngưng hoạt động"} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InfoItem label="Ngày bắt đầu" value={formatDate(voucher.validFrom)} />
              <InfoItem label="Ngày kết thúc" value={formatDate(voucher.validTo)} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <div className="space-y-1">
                <p className="text-xs uppercase tracking-wider text-gray-400">Quản lý bởi</p>
                <VoucherManagerInfo 
                  managerName={voucher.managerName} 
                  managerStaffId={voucher.managerStaffId} 
                />
              </div>
              <InfoItem label="ID quản lý" value={voucher.managerId ? `#${voucher.managerId}` : "-"} />
            </div>

            <div className="grid gap-5 md:grid-cols-2">
              <InfoItem label="Ngày tạo" value={formatDateTime(voucher.createdAt)} />
              <InfoItem label="Ngày cập nhật" value={voucher.updatedAt ? formatDateTime(voucher.updatedAt) : "Chưa cập nhật"} />
            </div>

            <div>
              <h3 className="text-sm font-semibold text-gray-200">Mô tả</h3>
              <p className="mt-2 min-h-[60px] rounded-lg border border-white/10 bg-white/5 p-4 text-sm text-gray-200">
                {voucher.description || "Không có mô tả"}
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

interface InfoItemProps {
  label: string;
  value: string;
}

const InfoItem = ({ label, value }: InfoItemProps) => (
  <div className="space-y-1">
    <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
    <p className="text-sm text-white">{value}</p>
  </div>
);

const VoucherManagerInfo = ({ managerName, managerStaffId }: { managerName: string; managerStaffId: number | null }) => {
  const { accessToken } = useAuthStore();
  
  const { data: staffData } = useGetManagerStaffById(
    managerStaffId || 0,
    managerStaffId ? accessToken ?? undefined : undefined
  );

  if (!managerStaffId) {
    return (
      <div className="flex items-center gap-2 text-sm text-white">
        <UserSquare2 className="h-4 w-4 text-blue-400" />
        <span>{managerName || 'Manager'}</span>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="flex items-center gap-2 text-sm">
        <UserSquare2 className="h-4 w-4 text-gray-400" />
        <span className="text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col gap-1 text-sm">
      <div className="flex items-center gap-2">
        <UserSquare2 className="h-4 w-4 text-purple-400" />
        <span className="text-white">{staffData.result.fullName}</span>
      </div>
      <span className="text-xs text-gray-400">Staff #{managerStaffId}</span>
    </div>
  );
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

const formatCurrency = (value: number) => {
  return value.toLocaleString("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  });
};

export default VoucherDetailModal;
