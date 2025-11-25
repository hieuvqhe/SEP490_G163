"use client";

import { useState, useEffect } from 'react';
import { Loader2, X, FileText } from 'lucide-react';
import { useGenerateReadSasUrl } from '@/apis/pdf.blob.api';
import { useToast } from '@/components/ToastProvider';

interface SignedContractModalProps {
  contractId: number;
  contractTitle: string;
  partnerSignatureUrl: string;
  onClose: () => void;
}

const SignedContractModal = ({ 
  contractId, 
  contractTitle,
  partnerSignatureUrl, 
  onClose 
}: SignedContractModalProps) => {
  const { showToast } = useToast();
  const [pdfUrl, setPdfUrl] = useState<string | null>(null);
  const [isLoading, setIsLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  
  const generateReadSasMutation = useGenerateReadSasUrl();

  useEffect(() => {
    const loadPdf = async () => {
      setIsLoading(true);
      setError(null);

      try {
        const response = await generateReadSasMutation.mutateAsync({
          blobUrl: partnerSignatureUrl,
          expiryInDays: 1,
        });

        setPdfUrl(response.result.readSasUrl);
      } catch (error: any) {
        const errorMessage = error?.message || 'Không thể tải file PDF. Vui lòng thử lại.';
        setError(errorMessage);
        showToast(errorMessage, undefined, 'error');
      } finally {
        setIsLoading(false);
      }
    };

    loadPdf();
  }, [partnerSignatureUrl]);

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      onClick={onClose}
    >
      <div
        className="mx-4 flex h-[90vh] w-full max-w-6xl flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 text-white shadow-2xl"
        onClick={(event) => event.stopPropagation()}
      >
        {/* Header */}
        <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
          <div className="flex items-center gap-3">
            <FileText className="text-purple-400" size={24} />
            <div>
              <h2 className="text-xl font-semibold">Hợp đồng đã ký</h2>
              <p className="text-sm text-gray-400">{contractTitle} - ID: {contractId}</p>
            </div>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
          >
            <X size={18} />
          </button>
        </div>

        {/* Content */}
        <div className="relative flex-1 bg-black/30">
          {isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 text-sm text-gray-300">
              <Loader2 className="animate-spin" size={24} />
              <p>Đang tải hợp đồng đã ký...</p>
            </div>
          )}

          {error && !isLoading && (
            <div className="flex h-full flex-col items-center justify-center gap-3 px-6 text-center text-sm text-gray-300">
              <FileText className="text-red-400" size={48} />
              <p className="text-red-400">{error}</p>
              <button
                onClick={onClose}
                className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
              >
                Đóng
              </button>
            </div>
          )}

          {pdfUrl && !isLoading && !error && (
            <iframe
              src={pdfUrl}
              className="h-full w-full"
              title="Hợp đồng đã ký"
            />
          )}
        </div>
      </div>
    </div>
  );
};

export default SignedContractModal;
