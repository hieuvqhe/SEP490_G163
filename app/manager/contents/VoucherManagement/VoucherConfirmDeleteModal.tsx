"use client";

interface VoucherConfirmDeleteModalProps {
  open: boolean;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const VoucherConfirmDeleteModal = ({ open, isProcessing, onCancel, onConfirm }: VoucherConfirmDeleteModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl">
        <h2 className="text-xl font-semibold">Xác nhận xoá voucher</h2>
        <p className="mt-3 text-sm text-gray-300">
          Bạn có chắc chắn muốn xoá voucher này khỏi hệ thống? Hành động này không thể hoàn tác.
        </p>

        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
            disabled={isProcessing}
            type="button"
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="rounded-lg bg-red-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-red-400 disabled:cursor-not-allowed disabled:opacity-70"
            disabled={isProcessing}
            type="button"
          >
            {isProcessing ? "Đang xoá..." : "Xoá"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default VoucherConfirmDeleteModal;
