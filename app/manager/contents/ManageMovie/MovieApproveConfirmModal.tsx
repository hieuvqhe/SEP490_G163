"use client";

interface MovieApproveConfirmModalProps {
  open: boolean;
  onClose: () => void;
  onConfirm: () => Promise<void>;
  isSubmitting?: boolean;
}

const MovieApproveConfirmModal = ({ open, onClose, onConfirm, isSubmitting }: MovieApproveConfirmModalProps) => {
  if (!open) return null;

  const handleConfirm = async () => {
    if (isSubmitting) return;
    await onConfirm();
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-xl backdrop-blur">
        <div className="space-y-4">
          <div>
            <h2 className="text-2xl font-semibold">Duyệt submission</h2>
            <p className="mt-1 text-sm text-gray-300">
              Xác nhận duyệt submission này. Đối tác sẽ nhận thông báo kết quả.
            </p>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white hover:bg-white/15 disabled:opacity-60"
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="button"
              onClick={handleConfirm}
              className="rounded-lg bg-emerald-500 px-4 py-2 text-sm font-semibold text-slate-900 hover:bg-emerald-400 disabled:opacity-60"
              disabled={isSubmitting}
            >
              {isSubmitting ? "Đang duyệt" : "Xác nhận duyệt"}
            </button>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieApproveConfirmModal;
