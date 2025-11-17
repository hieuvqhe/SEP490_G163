"use client";

import { useState } from "react";

interface MovieRejectModalProps {
  open: boolean;
  onClose: () => void;
  onSubmit: (reason: string) => Promise<void>;
  isSubmitting?: boolean;
}

const MovieRejectModal = ({ open, onClose, onSubmit, isSubmitting }: MovieRejectModalProps) => {
  const [reason, setReason] = useState("");
  const [error, setError] = useState<string | null>(null);

  if (!open) return null;

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    const trimmed = reason.trim();
    if (!trimmed) {
      setError("Vui lòng nhập lý do từ chối");
      return;
    }

    setError(null);

    try {
      await onSubmit(trimmed);
      setReason("");
    } catch (err) {
      setError((err as Error)?.message || "Không thể từ chối submission. Vui lòng thử lại.");
    }
  };

  const handleClose = () => {
    if (isSubmitting) return;
    setReason("");
    setError(null);
    onClose();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-xl rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-xl backdrop-blur">
        <div className="mb-4">
          <h2 className="text-2xl font-semibold">Từ chối submission</h2>
          <p className="mt-1 text-sm text-gray-300">
            Vui lòng cung cấp lý do cụ thể để thông báo cho đối tác.
          </p>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit}>
          <div className="space-y-2">
            <label className="text-sm font-medium text-gray-200" htmlFor="movie-rejection-reason">
              Lý do từ chối
            </label>
            <textarea
              id="movie-rejection-reason"
              value={reason}
              onChange={(event) => setReason(event.target.value)}
              rows={5}
              className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
              placeholder="Ví dụ: Tài liệu đi kèm chưa hợp lệ, vui lòng cập nhật lại."
            />
            {error && <p className="text-xs text-red-300">{error}</p>}
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={handleClose}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="rounded-lg bg-red-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-red-400 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang xử lý" : "Xác nhận từ chối"}
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default MovieRejectModal;
