"use client";

import { useState } from "react";
import type { SendVoucherToSpecificUsersRequest } from "@/apis/manager.voucher.api";
import { Loader2 } from "lucide-react";

interface VoucherSendSpecificModalProps {
  open: boolean;
  isSubmitting?: boolean;
  onClose: () => void;
  onSubmit: (payload: SendVoucherToSpecificUsersRequest) => Promise<void>;
}

const VoucherSendSpecificModal = ({ open, isSubmitting, onClose, onSubmit }: VoucherSendSpecificModalProps) => {
  const [subject, setSubject] = useState("Đừng Bỏ Lỡ Voucher Đặc Biệt Dành Cho Bạn");
  const [customMessage, setCustomMessage] = useState(
    "Chào bạn, chúng tôi gửi tặng bạn voucher đặc biệt này như một lời cảm ơn vì đã là khách hàng thân thiết. Ưu đãi này chỉ dành riêng cho bạn!",
  );
  const [userIdsText, setUserIdsText] = useState("25,16");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const resetState = () => {
    setError(null);
  };

  const parseUserIds = (value: string): number[] => {
    return value
      .split(/[,\s]+/)
      .map((item) => item.trim())
      .filter(Boolean)
      .map((item) => Number(item))
      .filter((item) => Number.isInteger(item) && item > 0);
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

    const userIds = parseUserIds(userIdsText);
    if (userIds.length === 0) {
      setError("Vui lòng nhập ít nhất một ID người dùng hợp lệ");
      return;
    }

    try {
      await onSubmit({
        subject: subject.trim(),
        customMessage: customMessage.trim(),
        userIds,
      });
      resetState();
    } catch {
      setError("Không thể gửi voucher cho người dùng được chọn. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-xl">
      <div className="mx-4 w-full max-w-lg rounded-2xl border border-white/10 bg-[#1c1c24]/90 p-6 text-white shadow-2xl backdrop-blur-md">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Gửi voucher cho người dùng cụ thể</h2>
            <p className="mt-1 text-sm text-gray-300">
              Chỉ những người dùng có ID được liệt kê mới nhận được email.
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

        <form className="space-y-4" onSubmit={handleSubmit}>
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
              className="min-h-[100px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
              placeholder="Nhập nội dung email"
            />
          </div>

          <div className="space-y-2">
            <label className="block text-sm font-medium text-gray-200">Danh sách ID người dùng</label>
            <textarea
              value={userIdsText}
              onChange={(event) => setUserIdsText(event.target.value)}
              className="min-h-[80px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
              placeholder="Nhập các ID, phân tách bằng dấu phẩy hoặc xuống dòng"
            />
            <p className="text-xs text-gray-400">Ví dụ: 25, 16 hoặc 25\n16</p>
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
              Gửi voucher
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherSendSpecificModal;
