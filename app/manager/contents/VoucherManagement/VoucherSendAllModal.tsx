"use client";

import { useState } from "react";
import type { SendVoucherToAllUsersRequest } from "@/apis/manager.voucher.api";
import { Loader2 } from "lucide-react";

interface VoucherSendAllModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: SendVoucherToAllUsersRequest) => Promise<void>;
}

const VoucherSendAllModal = ({ open, isSubmitting, onClose, onSubmit }: VoucherSendAllModalProps) => {
  const [subject, setSubject] = useState("Đừng Bỏ Lỡ Voucher Giảm Giá Dành Cho Bạn");
  const [customMessage, setCustomMessage] = useState(
    "Chào bạn, hệ thống gửi tặng bạn voucher đặc biệt cho mùa hè này. Đây là ưu đãi dành cho tất cả người dùng trung thành của chúng tôi. Hãy nhanh tay sử dụng!",
  );
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetState = () => {
    setError(null);
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Vui lòng nhập tiêu đề email");
      return;
    }

    if (!customMessage.trim()) {
      setError("Vui lòng nhập nội dung email");
      return;
    }

    try {
      await onSubmit({
        subject: subject.trim(),
        customMessage: customMessage.trim(),
      });
      resetState();
    } catch {
      setError("Không thể gửi voucher. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-2xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Gửi voucher đến tất cả người dùng</h2>
            <p className="mt-1 text-sm text-gray-300">
              Email sẽ được gửi đến toàn bộ người dùng đủ điều kiện.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/10"
            disabled={isSubmitting}
          >
            Đóng
          </button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Tiêu đề email</label>
            <input
              value={subject}
              onChange={(event) => setSubject(event.target.value)}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
              placeholder="Nhập tiêu đề"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Nội dung thông điệp</label>
            <textarea
              value={customMessage}
              onChange={(event) => setCustomMessage(event.target.value)}
              className="min-h-[160px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
              placeholder="Nhập nội dung email"
            />
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={() => {
                resetState();
                onClose();
              }}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Gửi ngay
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherSendAllModal;
