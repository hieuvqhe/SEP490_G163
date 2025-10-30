"use client";

import React, { useCallback, useState } from "react";
import { useDropzone } from "react-dropzone";
import { motion, AnimatePresence } from "framer-motion";
import { Document, Page, pdfjs } from "react-pdf";
import {
  FiUpload,
  FiX,
  FiAlertCircle,
  FiCheckCircle,
  FiEye,
} from "react-icons/fi";
import { useToast } from "@/hooks/use-toast";
import { Dialog, DialogContent } from "@/components/ui/dialog";

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//unpkg.com/pdfjs-dist@${pdfjs.version}/build/pdf.worker.min.mjs`;

interface NoticeProps {
  type: "success" | "error" | "info";
  message: string;
}

const Notice = ({ type, message }: NoticeProps) => {
  const Icon =
    type === "success" ? FiCheckCircle : type === "error" ? FiX : FiAlertCircle;
  const bgColor =
    type === "success"
      ? "bg-green-500"
      : type === "error"
      ? "bg-red-500"
      : "bg-blue-500";

  return (
    <motion.div
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      exit={{ opacity: 0, y: -20 }}
      className={`${bgColor} text-white p-4 rounded-lg shadow-lg flex items-center gap-2 mb-4`}
    >
      <Icon className="w-5 h-5" />
      <span>{message}</span>
    </motion.div>
  );
};

const ContractUpload = () => {
  const [file, setFile] = useState<File | null>(null);
  const [numPages, setNumPages] = useState<number | null>(null);
  const [notice, setNotice] = useState<NoticeProps | null>(null);
  const [isPreviewOpen, setIsPreviewOpen] = useState(false);
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];

    if (selectedFile?.type !== "application/pdf") {
      setNotice({
        type: "error",
        message: "Please upload a PDF file only",
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) {
      // 5MB limit
      setNotice({
        type: "error",
        message: "File size should not exceed 5MB",
      });
      return;
    }

    setFile(selectedFile);
    setNotice({
      type: "success",
      message: "File uploaded successfully",
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "application/pdf": [".pdf"],
    },
    maxFiles: 1,
  });

  const onDocumentLoadSuccess = ({ numPages }: { numPages: number }) => {
    setNumPages(numPages);
  };

  const removeFile = () => {
    setFile(null);
    setNumPages(null);
    setNotice(null);
  };

  const handleUpload = () => {
    if (!file) {
      toast({
        title: "Error",
        description: "Please select a file first",
        variant: "destructive",
      });
      return;
    }

    // Here you would typically handle the file upload to your backend
    toast({
      title: "Success",
      description: "Contract uploaded successfully",
    });
  };

  return (
    <div className="flex flex-col w-full items-baseline px-4 py-6 space-y-6">
      <div>
        <h2 className="text-2xl font-bold text-white">Đăng tải hợp đồng</h2>
      </div>

      <div className="w-full flex flex-col gap-2 px-4 py-5 rounded-xl border border-yellow-500/30 bg-yellow-500/10 text-yellow-100">
        <p className="text-sm font-semibold uppercase tracking-wide flex items-center gap-2">
          ⚠️ Lưu ý quan trọng
        </p>
        <p className="text-sm leading-relaxed text-zinc-200">
          Đây là{" "}
          <span className="font-medium text-yellow-300">
            bản hợp đồng cuối cùng
          </span>{" "}
          giữa bạn và <span className="font-semibold">TicketXpress</span>. Vui
          lòng{" "}
          <span className="text-yellow-300">
            kiểm tra kỹ nội dung hợp đồng
          </span>{" "}
          trước khi tải lên hệ thống.
        </p>
      </div>

      <div className="flex flex-col w-full items-center justify-center">
        <AnimatePresence>
          {notice && <Notice type={notice.type} message={notice.message} />}
        </AnimatePresence>

        <div className="space-y-6">
          {/* Upload Area */}
          <div
            {...getRootProps()}
            className={`
    group relative flex flex-col items-center justify-center
    border-2 border-dashed rounded-2xl p-10 text-center cursor-pointer
    transition-all duration-300 ease-in-out
    ${
      isDragActive
        ? "border-primary bg-primary/5 shadow-md scale-[1.01]"
        : "border-zinc-300/50 dark:border-zinc-700 hover:border-primary/60 hover:bg-zinc-50/5 hover:shadow-sm"
    }
    ${file ? "border-green-500/50 bg-green-500/5 shadow-sm" : ""}
  `}
          >
            <input {...getInputProps()} />

            <div className="space-y-4">
              <div
                className={`
        w-16 h-16 mx-auto flex items-center justify-center
        rounded-full bg-zinc-100/50 dark:bg-zinc-800/60
        transition-colors duration-300
        group-hover:bg-primary/10
        ${file ? "bg-green-500/10 text-green-500" : "text-zinc-400"}
      `}
              >
                <FiUpload className="w-8 h-8" />
              </div>

              {isDragActive ? (
                <p className="text-lg font-medium text-primary">
                  Thả file PDF của bạn vào đây...
                </p>
              ) : (
                <div>
                  <p className="text-lg font-medium text-zinc-200 mb-1">
                    Kéo & thả hợp đồng PDF vào đây
                  </p>
                  <p className="text-sm text-zinc-400">
                    hoặc{" "}
                    <span className="text-primary font-medium">
                      nhấn để chọn file
                    </span>
                  </p>
                  <p className="text-xs text-zinc-500 mt-2">
                    Dung lượng tối đa: 5MB
                  </p>
                </div>
              )}
            </div>

            {/* Nếu có file được chọn thì hiển thị ở dưới */}
            {file && (
              <div className="mt-6 text-sm text-green-500 font-medium flex items-center justify-center gap-2">
                <FiUpload className="w-4 h-4" />
                <span>{file.name}</span>
              </div>
            )}
          </div>

          {/* File Info Area */}
          {file && (
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              className="bg-zinc-800 dark:bg-zinc-900 rounded-lg p-6 shadow-lg"
            >
              <div className="flex justify-between items-center mb-4">
                <div>
                  <h3 className="text-lg font-medium text-zinc-100">
                    {file.name}
                  </h3>
                  <p className="text-sm text-zinc-400">
                    {(file.size / 1024 / 1024).toFixed(2)}MB • {numPages} pages
                  </p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setIsPreviewOpen(true)}
                    className="p-2 hover:bg-blue-500/10 rounded-full text-blue-500 transition-colors"
                    title="Preview PDF"
                  >
                    <FiEye className="w-5 h-5" />
                  </button>
                  <button
                    onClick={removeFile}
                    className="p-2 hover:bg-red-500/10 rounded-full text-red-500 transition-colors"
                    title="Remove file"
                  >
                    <FiX className="w-5 h-5" />
                  </button>
                </div>
              </div>

              <div className="mt-4 flex justify-end">
                <button
                  onClick={handleUpload}
                  className="px-6 py-2 bg-primary text-white rounded-lg hover:bg-primary/90 transition-colors"
                >
                  Upload Contract
                </button>
              </div>
            </motion.div>
          )}

          {/* PDF Preview Modal */}
          <Dialog open={isPreviewOpen} onOpenChange={setIsPreviewOpen}>
            <DialogContent className="max-w-5xl bg-zinc-900 text-zinc-100 border border-zinc-800 shadow-2xl rounded-2xl overflow-hidden">
              <div className="flex items-center justify-between border-b border-zinc-800 px-6 pb-2 bg-zinc-900/70 backdrop-blur-md">
                <div>
                  <h2 className="text-lg font-semibold text-white">
                    PDF Preview
                  </h2>
                  {file && (
                    <p className="text-xs text-zinc-400 mt-1 truncate max-w-xs">
                      {file.name}
                    </p>
                  )}
                </div>
              </div>
              <div className="max-h-[80vh] w-full overflow-y-auto overflow-x-hidden bg-zinc-800 rounded-lg">
                <Document
                  file={file}
                  onLoadSuccess={onDocumentLoadSuccess}
                  className="flex flex-col items-center"
                >
                  {numPages &&
                    [...Array(numPages)].map((_, index) => (
                      <div key={index} className="mb-4">
                        <Page
                          pageNumber={index + 1}
                          width={600}
                          renderTextLayer={false}
                          renderAnnotationLayer={false}
                        />
                      </div>
                    ))}
                </Document>
              </div>
            </DialogContent>
          </Dialog>
        </div>
      </div>
    </div>
  );
};

export default ContractUpload;
