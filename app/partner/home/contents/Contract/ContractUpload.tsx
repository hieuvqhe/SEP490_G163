"use client"

import React, { useCallback, useState } from 'react';
import { useDropzone } from 'react-dropzone';
import { motion, AnimatePresence } from 'framer-motion';
import { Document, Page, pdfjs } from 'react-pdf';
import { FiUpload, FiX, FiAlertCircle, FiCheckCircle } from 'react-icons/fi';
import { useToast } from '@/hooks/use-toast';

// Initialize PDF.js worker
pdfjs.GlobalWorkerOptions.workerSrc = `//cdnjs.cloudflare.com/ajax/libs/pdf.js/${pdfjs.version}/pdf.worker.min.js`;

interface NoticeProps {
  type: 'success' | 'error' | 'info';
  message: string;
}

const Notice = ({ type, message }: NoticeProps) => {
  const Icon = type === 'success' ? FiCheckCircle : type === 'error' ? FiX : FiAlertCircle;
  const bgColor = type === 'success' ? 'bg-green-500' : type === 'error' ? 'bg-red-500' : 'bg-blue-500';

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
  const { toast } = useToast();

  const onDrop = useCallback((acceptedFiles: File[]) => {
    const selectedFile = acceptedFiles[0];

    if (selectedFile?.type !== 'application/pdf') {
      setNotice({
        type: 'error',
        message: 'Please upload a PDF file only',
      });
      return;
    }

    if (selectedFile.size > 5 * 1024 * 1024) { // 5MB limit
      setNotice({
        type: 'error',
        message: 'File size should not exceed 5MB',
      });
      return;
    }

    setFile(selectedFile);
    setNotice({
      type: 'success',
      message: 'File uploaded successfully',
    });
  }, []);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      'application/pdf': ['.pdf'],
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
    <div className="max-w-4xl mx-auto p-6">
      <AnimatePresence>
        {notice && <Notice type={notice.type} message={notice.message} />}
      </AnimatePresence>

      <div className="space-y-6">
        {/* Upload Area */}
        <div
          {...getRootProps()}
          className={`border-2 border-dashed rounded-lg p-8 text-center cursor-pointer transition-colors
            ${isDragActive ? 'border-primary bg-primary/5' : 'border-gray-300 dark:border-gray-700'}
            ${file ? 'border-green-500/50 bg-green-500/5' : ''}
          `}
        >
          <input {...getInputProps()} />
          <div className="space-y-4">
            <FiUpload className="w-12 h-12 mx-auto text-gray-400" />
            {isDragActive ? (
              <p className="text-lg">Drop the PDF file here...</p>
            ) : (
              <div>
                <p className="text-lg mb-2">Drag & drop your contract PDF here</p>
                <p className="text-sm text-gray-500">or click to select file</p>
                <p className="text-xs text-gray-400 mt-2">Maximum file size: 5MB</p>
              </div>
            )}
          </div>
        </div>

        {/* Preview Area */}
        {file && (
          <motion.div
            initial={{ opacity: 0, y: 20 }}
            animate={{ opacity: 1, y: 0 }}
            className="bg-white dark:bg-zinc-900 rounded-lg p-6 shadow-lg"
          >
            <div className="flex justify-between items-center mb-4">
              <div>
                <h3 className="text-lg font-medium">{file.name}</h3>
                <p className="text-sm text-gray-500">
                  {(file.size / 1024 / 1024).toFixed(2)}MB • {numPages} pages
                </p>
              </div>
              <button
                onClick={removeFile}
                className="p-2 hover:bg-red-500/10 rounded-full text-red-500"
              >
                <FiX className="w-5 h-5" />
              </button>
            </div>

            <div className="max-h-[600px] overflow-y-auto rounded-lg border dark:border-zinc-800">
              <Document
                file={file}
                onLoadSuccess={onDocumentLoadSuccess}
                className="mx-auto"
              >
                {numPages && [...Array(numPages)].map((_, index) => (
                  <div key={index} className="mb-4">
                    <Page
                      pageNumber={index + 1}
                      width={550}
                      renderTextLayer={false}
                      renderAnnotationLayer={false}
                    />
                  </div>
                ))}
              </Document>
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
      </div>
    </div>
  );
};

export default ContractUpload;