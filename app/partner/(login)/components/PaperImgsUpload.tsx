"use client";

import { useCallback, useState, useEffect } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import {
  FaFileImport,
  FaTimes,
  FaPlus,
  FaImage,
  FaSpinner,
} from "react-icons/fa";

type PaperImgsUploadProps = {
  fieldChange?: (FILES: File[]) => void;
  mediaUrl?: string;
  handleTheaterFileSelect?: (file: File[]) => void;
  label?: string;
  maxFiles?: number;
  isPending?: boolean;
};

function PaperImgsUpload({
  fieldChange = () => {},
  handleTheaterFileSelect = () => {},
  label = "Hình ảnh rạp chiếu",
  maxFiles = 10,
  isPending = false,
}: PaperImgsUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      // Chặn nếu đang pending
      if (isPending) return;

      // Check if adding new files would exceed the limit
      const remainingSlots = maxFiles - files.length;
      if (remainingSlots <= 0) {
        alert(`Bạn chỉ có thể tải lên tối đa ${maxFiles} ảnh!`);
        return;
      }

      // Only take files up to the remaining slots
      const filesToAdd = acceptedFiles.slice(0, remainingSlots);

      if (acceptedFiles.length > remainingSlots) {
        alert(
          `Chỉ thêm được ${remainingSlots} ảnh nữa. Giới hạn ${maxFiles} ảnh.`
        );
      }

      // Create URLs for preview first
      const newUrls = filesToAdd.map((file) => URL.createObjectURL(file));

      // Update both files and URLs
      setFiles((prev) => {
        const newFiles = [...prev, ...filesToAdd];
        fieldChange(newFiles);
        return newFiles;
      });

      setFileUrls((prev) => [...prev, ...newUrls]);
    },
    [fieldChange, files.length, maxFiles, isPending]
  );

  // eslint-disable-next-line react-hooks/exhaustive-deps
  useEffect(() => {
    if (files.length > 0) {
      fieldChange(files);
      handleTheaterFileSelect(files);
    }
  }, [files]);

  const removeFile = (index: number) => {
    // Chặn xóa nếu đang pending
    if (isPending) return;

    // Clean up the object URL to prevent memory leaks
    URL.revokeObjectURL(fileUrls[index]);

    const newFiles = files.filter((_, i) => i !== index);
    const newUrls = fileUrls.filter((_, i) => i !== index);

    setFiles(newFiles);
    setFileUrls(newUrls);
    fieldChange(newFiles);
  };

  // Cleanup object URLs when component unmounts
  useEffect(() => {
    return () => {
      fileUrls.forEach((url) => URL.revokeObjectURL(url));
    };
  }, [fileUrls]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg", ".webp"],
    },
    multiple: true,
    maxFiles: maxFiles - files.length,
    // Vô hiệu hóa dropzone khi đủ file HOẶC đang pending
    disabled: files.length >= maxFiles || isPending,
  });

  return (
    <div className={`mt-4 ${isPending ? "opacity-70 cursor-not-allowed" : ""}`}>
      <div
        className={`bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl transition-all duration-300 ${
          isPending ? "pointer-events-none grayscale-[0.5]" : ""
        }`}
      >
        {files.length > 0 ? (
          <>
            {/* Header with count and add button */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaImage className="text-blue-400 text-lg" />
                <h3 className="text-white font-semibold">
                  {label} ({files.length}/{maxFiles})
                </h3>
              </div>
              {/* Add button in header */}
              <div {...getRootProps()} className="flex-shrink-0">
                <button
                  type="button"
                  disabled={files.length >= maxFiles || isPending}
                  className="flex items-center gap-2 px-4 py-2 bg-blue-500 hover:bg-blue-600 text-white rounded-lg transition-all duration-300 text-sm font-medium disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {isPending ? (
                    <FaSpinner className="animate-spin text-sm" />
                  ) : (
                    <FaPlus className="text-sm" />
                  )}
                  <span>
                    {isPending
                      ? "Đang xử lý..."
                      : files.length >= maxFiles
                      ? "Đã đủ"
                      : "Thêm ảnh"}
                  </span>
                </button>
                <input {...getInputProps()} />
              </div>
            </div>

            {/* Horizontal scrollable image preview */}
            <div className="flex gap-3 py-5 overflow-x-auto pb-2 mb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {fileUrls.map((url, index) => (
                <div
                  key={index}
                  className="relative group flex-shrink-0 overflow-visible"
                >
                  <div className="relative w-24 h-24 rounded-xl border-2 border-slate-600 hover:border-blue-400 transition-all duration-300 shadow-lg">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover rounded-xl"
                    />
                  </div>

                  {!isPending && (
                    <button
                      type="button"
                      onClick={() => removeFile(index)}
                      className="absolute -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 
                     text-white rounded-full flex items-center justify-center text-xs 
                      opacity-0 group-hover:opacity-100 transition-all duration-300 
                      shadow-lg z-20 cursor-pointer"
                    >
                      <FaTimes />
                    </button>
                  )}
                </div>
              ))}
            </div>
          </>
        ) : (
          <div
            {...getRootProps()}
            className={`text-center transition-all ${
              isPending ? "cursor-not-allowed" : "cursor-pointer"
            }`}
          >
            <input {...getInputProps()} />
            <div
              className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                isDragActive && !isPending
                  ? "border-blue-400 bg-blue-400/10 scale-105"
                  : isPending
                  ? "border-slate-600 bg-slate-800/50" // Style khi pending
                  : "border-slate-500 hover:border-blue-400 hover:bg-blue-400/5"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isPending
                      ? "bg-slate-800"
                      : isDragActive
                      ? "bg-blue-400/20 scale-110"
                      : "bg-slate-700 hover:bg-blue-400/20"
                  }`}
                >
                  {isPending ? (
                    <FaSpinner className="text-3xl text-slate-500 animate-spin" />
                  ) : (
                    <FaFileImport
                      className={`text-3xl transition-colors duration-300 ${
                        isDragActive ? "text-blue-400" : "text-slate-400"
                      }`}
                    />
                  )}
                </div>

                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isDragActive && !isPending
                        ? "text-blue-400"
                        : "text-white"
                    }`}
                  >
                    {isPending
                      ? "Đang tải dữ liệu..."
                      : isDragActive
                      ? "Thả ảnh vào đây"
                      : `Tải lên ${label.toLowerCase()}`}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    {isPending
                      ? "Vui lòng đợi trong giây lát"
                      : "Kéo thả ảnh vào đây hoặc click để chọn"}
                  </p>
                  <div
                    className={`flex items-center justify-center gap-2 text-xs ${
                      isPending ? "opacity-50" : "text-slate-500"
                    }`}
                  >
                    <span>Hỗ trợ:</span>
                    <span className="px-2 py-1 bg-slate-700 rounded">PNG</span>
                    <span className="px-2 py-1 bg-slate-700 rounded">JPG</span>
                    <span className="px-2 py-1 bg-slate-700 rounded">SVG</span>
                    <span className="px-2 py-1 bg-slate-700 rounded">WEBP</span>
                  </div>
                </div>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}

export default PaperImgsUpload;
