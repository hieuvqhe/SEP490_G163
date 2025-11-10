"use client";

import { Loader2 } from "lucide-react";
import type { VoucherEmailHistoryItem } from "@/apis/manager.voucher.api";

interface VoucherEmailHistoryModalProps {
  open: boolean;
  history: VoucherEmailHistoryItem[];
  isLoading?: boolean;
  onClose: () => void;
}

const VoucherEmailHistoryModal = ({ open, history, isLoading, onClose }: VoucherEmailHistoryModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Lịch sử gửi email</h2>
            <p className="mt-1 text-sm text-gray-300">
              Danh sách bản ghi email đã gửi cho voucher này.
            </p>
          </div>
          <button
            type="button"
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/10"
          >
            Đóng
          </button>
        </div>

        {isLoading ? (
          <div className="flex items-center justify-center gap-2 py-16 text-sm text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải lịch sử email...
          </div>
        ) : history.length === 0 ? (
          <div className="py-16 text-center text-sm text-gray-300">
            Chưa có email nào được gửi cho voucher này.
          </div>
        ) : (
          <div className="max-h-[60vh] overflow-y-auto rounded-xl border border-white/10 bg-white/5">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-3">Email</th>
                  <th className="px-6 py-3">Tên người nhận</th>
                  <th className="px-6 py-3">Thời gian gửi</th>
                  <th className="px-6 py-3">Trạng thái</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {history.map((item) => (
                  <tr key={item.id} className="hover:bg-white/10">
                    <td className="px-6 py-4 text-white">{item.userEmail}</td>
                    <td className="px-6 py-4 text-gray-300">{item.userName || "-"}</td>
                    <td className="px-6 py-4 text-gray-300">{formatDateTime(item.sentAt)}</td>
                    <td className="px-6 py-4">
                      <span className="inline-flex items-center rounded-full border border-emerald-400/40 bg-emerald-500/20 px-3 py-1 text-xs font-medium text-emerald-200">
                        {item.status === "success" ? "Thành công" : item.status}
                      </span>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>
    </div>
  );
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

export default VoucherEmailHistoryModal;
