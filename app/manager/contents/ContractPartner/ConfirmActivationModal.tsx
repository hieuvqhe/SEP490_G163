"use client";

import { useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, ShieldAlert, X } from 'lucide-react';

import type { ActivateContractRequest } from '@/apis/manager.contract.api';

type ConfirmActivationModalProps = {
  contractId: number;
  isProcessing?: boolean;
  onConfirm: (payload: ActivateContractRequest) => void;
  onCancel: () => void;
};

const ConfirmActivationModal = ({
  contractId,
  isProcessing = false,
  onConfirm,
  onCancel,
}: ConfirmActivationModalProps) => {
  const [managerSignature, setManagerSignature] = useState('');
  const [notes, setNotes] = useState('');
  const [signatureError, setSignatureError] = useState('');
  const [notesError, setNotesError] = useState('');

  useEffect(() => {
    setManagerSignature('');
    setNotes('');
    setSignatureError('');
    setNotesError('');
  }, [contractId]);

  const handleSubmit = (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();

    const trimmedSignature = managerSignature.trim();
    const trimmedNotes = notes.trim();

    let hasError = false;

    if (trimmedSignature.length === 0) {
      setSignatureError('Vui lòng nhập chữ ký số.');
      hasError = true;
    } else {
      setSignatureError('');
    }

    if (trimmedNotes.length === 0) {
      setNotesError('Vui lòng nhập ghi chú.');
      hasError = true;
    } else {
      setNotesError('');
    }

    if (hasError) {
      return;
    }

    onConfirm({
      managerSignature: trimmedSignature,
      notes: trimmedNotes,
    });
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onCancel}
    >
      <motion.div
        className="mx-4 w-full max-w-md overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <h2 className="text-lg font-semibold">Kích hoạt hợp đồng</h2>
          <button
            onClick={onCancel}
            className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            disabled={isProcessing}
          >
            <X size={18} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="px-6 py-6 space-y-6">
          <div className="flex items-start gap-3">
            <div className="rounded-full bg-orange-500/20 p-3 text-orange-200">
              <ShieldAlert size={20} />
            </div>
            <div className="space-y-2 text-sm text-gray-200">
              <p className="font-medium text-white">
                Bạn có chắc muốn kích hoạt hợp đồng #{contractId}?
              </p>
              <p>
                Hành động này sẽ khóa hợp đồng và không thể hoàn tác. Vui lòng đảm bảo mọi thông tin đã chính xác
                trước khi xác nhận.
              </p>
            </div>
          </div>

          <div className="space-y-4">
            <label className="block space-y-2 text-sm">
              <span className="font-medium text-gray-200">Chữ ký số của bạn</span>
              <input
                type="text"
                value={managerSignature}
                onChange={(event) => {
                  setManagerSignature(event.target.value);
                  if (signatureError) {
                    setSignatureError('');
                  }
                }}
                placeholder="Nhập chữ ký số"
                className={`w-full rounded-xl border px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 disabled:opacity-70 ${
                  signatureError
                    ? 'border-red-500/60 bg-red-500/10 focus:border-red-400 focus:ring-red-400/40'
                    : 'border-white/10 bg-white/5 focus:border-emerald-400 focus:ring-emerald-400/40'
                }`}
                disabled={isProcessing}
              />
              {signatureError ? <p className="text-xs text-red-400">{signatureError}</p> : null}
            </label>

            <label className="block space-y-2 text-sm">
              <span className="font-medium text-gray-200">Ghi chú bổ sung</span>
              <textarea
                value={notes}
                onChange={(event) => {
                  setNotes(event.target.value);
                  if (notesError) {
                    setNotesError('');
                  }
                }}
                rows={4}
                placeholder="Ví dụ: Hợp đồng đã được rà soát và xác nhận."
                className={`w-full resize-none rounded-xl border px-4 py-2 text-sm text-white placeholder:text-gray-500 focus:outline-none focus:ring-2 disabled:opacity-70 ${
                  notesError
                    ? 'border-red-500/60 bg-red-500/10 focus:border-red-400 focus:ring-red-400/40'
                    : 'border-white/10 bg-white/5 focus:border-emerald-400 focus:ring-emerald-400/40'
                }`}
                disabled={isProcessing}
              />
              {notesError ? <p className="text-xs text-red-400">{notesError}</p> : null}
            </label>
          </div>

          <div className="flex items-center justify-end gap-3">
            <button
              type="button"
              onClick={onCancel}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-medium text-gray-200 transition hover:bg-white/10 disabled:opacity-70"
              disabled={isProcessing}
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-emerald-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-emerald-500 disabled:opacity-70"
              disabled={isProcessing}
            >
              {isProcessing ? <Loader2 className="animate-spin" size={16} /> : null}
              Xác nhận
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default ConfirmActivationModal;
