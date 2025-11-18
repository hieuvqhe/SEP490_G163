"use client";

import { useCallback, useEffect, useState } from 'react';
import { motion } from 'framer-motion';
import { Loader2, RefreshCcw, X } from 'lucide-react';
import { PDFViewer } from '@react-pdf/renderer';

import { useGetContractById } from '@/apis/manager.contract.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

import ContractDocument, { type ContractTemplate } from './ContractDocument';

const CONTRACT_TEMPLATE_URL = '/data-contract/data.json';

interface ContractDetailModalProps {
  contractId: number;
  onClose: () => void;
}

const ContractDetailModal = ({ contractId, onClose }: ContractDetailModalProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const {
    data,
    isLoading,
    isError,
    error,
    refetch
  } = useGetContractById(contractId, accessToken || undefined);

  const [template, setTemplate] = useState<ContractTemplate | null>(null);
  const [isTemplateLoading, setIsTemplateLoading] = useState(true);
  const [templateError, setTemplateError] = useState<string | null>(null);

  const loadTemplate = useCallback(
    async (signal?: AbortSignal) => {
      try {
        if (!signal?.aborted) {
          setIsTemplateLoading(true);
          setTemplateError(null);
        }

        const response = await fetch(CONTRACT_TEMPLATE_URL, { signal });

        if (!response.ok) {
          throw new Error('Không thể tải mẫu hợp đồng.');
        }

        const json = (await response.json()) as { hop_dong?: ContractTemplate; hopDong?: ContractTemplate };
        const templateData = json.hop_dong ?? json.hopDong;

        if (!templateData) {
          throw new Error('Dữ liệu mẫu hợp đồng không hợp lệ.');
        }

        if (!signal?.aborted) {
          setTemplate(templateData);
        }
      } catch (error) {
        if (signal?.aborted) {
          return;
        }

        setTemplate(null);
        setTemplateError(error instanceof Error ? error.message : 'Đã xảy ra lỗi khi tải mẫu hợp đồng.');
      } finally {
        if (!signal?.aborted) {
          setIsTemplateLoading(false);
        }
      }
    },
    []
  );

  useEffect(() => {
    const controller = new AbortController();
    loadTemplate(controller.signal).catch(() => undefined);

    return () => {
      controller.abort();
    };
  }, [loadTemplate]);

  useEffect(() => {
    if (isError) {
      const apiError = error as { message?: string } | undefined;
      showToast(apiError?.message || 'Không thể tải thông tin hợp đồng', undefined, 'error');
    }
  }, [isError, error, showToast]);

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
        className="mx-4 flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.85, y: 30 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.9, y: 20 }}
        transition={{ duration: 0.25 }}
        onClick={(event) => event.stopPropagation()}
      >
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div>
            <h2 className="text-xl font-semibold">Chi tiết hợp đồng</h2>
            <p className="text-sm text-gray-400">ID: {contractId}</p>
          </div>
          <div className="flex items-center gap-2">
            <button
              onClick={() => {
                refetch();
                loadTemplate().catch(() => undefined);
              }}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
            >
              <RefreshCcw size={14} />
              Tải lại
            </button>
            <button
              onClick={onClose}
              className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            >
              <X size={18} />
            </button>
          </div>
        </div>

        <div className="relative flex-1 bg-black/30">
          {!accessToken && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-gray-300">
              <p>Bạn cần đăng nhập để xem chi tiết hợp đồng.</p>
            </div>
          )}

          {accessToken && isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-gray-300">
              <Loader2 className="animate-spin" size={24} />
              <p>Đang tải hợp đồng...</p>
            </div>
          )}

          {accessToken && !isLoading && isTemplateLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-gray-300">
              <Loader2 className="animate-spin" size={24} />
              <p>Đang tải mẫu hợp đồng...</p>
            </div>
          )}

          {accessToken && !isLoading && templateError && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-gray-300">
              <p>{templateError}</p>
              <button
                onClick={() => loadTemplate().catch(() => undefined)}
                className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-xs font-medium text-white transition hover:bg-white/20"
              >
                <RefreshCcw size={14} />
                Thử lại
              </button>
            </div>
          )}

          {accessToken && !isLoading && !isTemplateLoading && template && data?.result && (
            <PDFViewer style={{ width: '100%', height: '100%' }}>
              <ContractDocument contract={data.result} template={template} />
            </PDFViewer>
          )}

          {accessToken && !isLoading && !data?.result && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-gray-300">
              <p>Không tìm thấy thông tin hợp đồng.</p>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};

export default ContractDetailModal;
