"use client";

import { useEffect, useMemo, useRef, useState } from 'react';
import { AnimatePresence, motion } from 'framer-motion';
import { Loader2, RefreshCcw, Send, X } from 'lucide-react';
import { pdf } from '@react-pdf/renderer';

import {
  useGetContractById,
  useGenerateUploadSas,
  useSendContract
} from '@/apis/manager.contract.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

import ContractDocument from './ContractDocument';

interface SendContractModalProps {
  contractId: number;
  onClose: () => void;
  onSent?: () => void;
}

const SendContractModal = ({ contractId, onClose, onSent }: SendContractModalProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const [notes, setNotes] = useState('');
  const [pdfUrl, setPdfUrl] = useState('');
  const [isGeneratingPdf, setIsGeneratingPdf] = useState(false);

  const hasGeneratedRef = useRef(false);

  const {
    data,
    isLoading: isContractLoading
  } = useGetContractById(contractId, accessToken || undefined);

  const generateUploadSasMutation = useGenerateUploadSas();
  const sendContractMutation = useSendContract();

  const contract = useMemo(() => data?.result, [data]);

  useEffect(() => {
    if (contractId) {
      setNotes('');
      setPdfUrl('');
      hasGeneratedRef.current = false;
    }
  }, [contractId]);

  useEffect(() => {
    if (!contractId || !contract || !accessToken) return;
    if (hasGeneratedRef.current || isGeneratingPdf) return;

    void handleGenerateAndUploadPdf();
  }, [contractId, contract, accessToken]);

  const handleGenerateAndUploadPdf = async () => {
    if (!contractId || !contract) {
      showToast('Không tìm thấy dữ liệu hợp đồng', undefined, 'error');
      return;
    }

    if (!accessToken) {
      showToast('Vui lòng đăng nhập lại', undefined, 'error');
      return;
    }

    try {
      setIsGeneratingPdf(true);

      const blob = await pdf(<ContractDocument contract={contract} />).toBlob();
      const fileName = `contract-${contractId}-${Date.now()}.pdf`;

      const sasResponse = await generateUploadSasMutation.mutateAsync({
        data: { fileName },
        accessToken,
      });

      const uploadResponse = await fetch(sasResponse.result.sasUrl, {
        method: 'PUT',
        headers: {
          'Content-Type': 'application/pdf',
          'x-ms-blob-type': 'BlockBlob'
        },
        body: blob,
      });

      if (!uploadResponse.ok) {
        throw new Error('Không thể tải PDF lên máy chủ');
      }

      setPdfUrl(sasResponse.result.blobUrl);
      hasGeneratedRef.current = true;
      showToast('Tạo link PDF thành công', undefined, 'success');
    } catch (error: any) {
      showToast(error?.message || 'Không thể tạo link PDF', undefined, 'error');
    } finally {
      setIsGeneratingPdf(false);
    }
  };

  const handleSendContract = () => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập lại', undefined, 'error');
      return;
    }

    if (!pdfUrl) {
      showToast('Link PDF chưa sẵn sàng', undefined, 'error');
      return;
    }

    sendContractMutation.mutate(
      {
        contractId,
        data: {
          pdfUrl,
          notes: notes.trim() ? notes.trim() : undefined,
        },
        accessToken,
      },
      {
        onSuccess: () => {
          showToast('Gửi HĐ thành công!', undefined, 'success');
          onSent?.();
        },
        onError: (error: any) => {
          showToast(error?.message || 'Gửi hợp đồng thất bại', undefined, 'error');
        }
      }
    );
  };

  if (!contractId) {
    return null;
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="mx-4 w-full max-w-xl rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-6 text-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between">
          <div>
            <h2 className="text-lg font-semibold">Gửi hợp đồng</h2>
            <p className="text-sm text-gray-400">ID: {contractId}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            disabled={isGeneratingPdf || sendContractMutation.isPending}
          >
            <X size={18} />
          </button>
        </div>

        <div className="mt-6 space-y-4">
          <div className="space-y-2">
            <label className="text-sm text-gray-300" htmlFor="contract-notes">Ghi chú</label>
            <textarea
              id="contract-notes"
              value={notes}
              onChange={(event) => setNotes(event.target.value)}
              rows={4}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white focus:border-white/20 focus:outline-none"
              placeholder="Nhập ghi chú gửi kèm (không bắt buộc)"
              disabled={sendContractMutation.isPending || isGeneratingPdf}
            />
          </div>

          <div className="space-y-2">
            <label className="text-sm text-gray-300" htmlFor="contract-pdf-url">Link PDF</label>
            <input
              id="contract-pdf-url"
              type="text"
              value={pdfUrl}
              readOnly
              disabled
              className="w-full cursor-not-allowed rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-gray-300"
            />
          </div>

          <div className="flex items-center justify-between gap-3">
            <button
              onClick={() => {
                hasGeneratedRef.current = false;
                void handleGenerateAndUploadPdf();
              }}
              className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              disabled={isGeneratingPdf || sendContractMutation.isPending}
            >
              <RefreshCcw size={16} />
              Tạo lại link PDF
            </button>

            <button
              onClick={handleSendContract}
              className="flex items-center gap-2 rounded-lg bg-orange-500/80 px-4 py-2 text-sm font-semibold text-white transition hover:bg-orange-500"
              disabled={isGeneratingPdf || !pdfUrl || sendContractMutation.isPending}
            >
              {sendContractMutation.isPending ? <Loader2 className="animate-spin" size={16} /> : <Send size={16} />}
              Gửi hợp đồng
            </button>
          </div>
        </div>

        <AnimatePresence>
          {(isContractLoading || isGeneratingPdf || generateUploadSasMutation.isPending) && (
            <motion.div
              className="absolute inset-0 flex items-center justify-center rounded-2xl bg-black/80"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              exit={{ opacity: 0 }}
            >
              <div className="flex flex-col items-center gap-3 text-sm text-gray-200">
                <Loader2 className="animate-spin" size={24} />
                <p>Đang tạo link PDF, vui lòng chờ...</p>
              </div>
            </motion.div>
          )}
        </AnimatePresence>
      </motion.div>
    </motion.div>
  );
};

export default SendContractModal;
