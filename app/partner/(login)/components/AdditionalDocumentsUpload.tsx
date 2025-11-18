"use client";

import { useCallback, useMemo } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { FaFileImport, FaImage, FaPlus } from "react-icons/fa";
import { X } from "lucide-react";

interface AdditionalDocumentsUploadProps {
  documents: string[];
  onFilesSelected: (files: File[]) => void;
  onRemove: (index: number) => void;
  maxFiles?: number;
}

const AdditionalDocumentsUpload = ({
  documents,
  onFilesSelected,
  onRemove,
  maxFiles = 10,
}: AdditionalDocumentsUploadProps) => {
  const remainingSlots = useMemo(
    () => Math.max(maxFiles - documents.length, 0),
    [documents.length, maxFiles]
  );

  const handleDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      if (!acceptedFiles || acceptedFiles.length === 0 || remainingSlots <= 0) {
        return;
      }

      const limitedFiles = acceptedFiles.slice(0, remainingSlots);
      onFilesSelected(limitedFiles);
    },
    [onFilesSelected, remainingSlots]
  );

  const { getRootProps, getInputProps, isDragActive } = useDropzone({
    onDrop: handleDrop,
    accept: {
      "image/*": [".png", ".jpeg", ".jpg", ".svg", ".webp"],
    },
    multiple: remainingSlots !== 1,
    disabled: remainingSlots <= 0,
  });

  const renderPreviewCard = (url: string, index: number) => (
    <div
      key={`${url}-${index}`}
      className="relative group flex flex-col overflow-hidden rounded-2xl border border-slate-700/80 bg-slate-900/70 transition hover:border-blue-500/70"
    >
      <div className="relative w-full aspect-[3/4] overflow-hidden">
        <img
          src={url}
          alt={`Tài liệu ${index + 1}`}
          className="h-full w-full object-cover"
        />
      </div>
      <button
        type="button"
        onClick={() => onRemove(index)}
        className="absolute right-3 top-3 flex h-8 w-8 items-center justify-center rounded-full bg-black/60 text-slate-200 shadow-md transition group-hover:bg-red-500/90 group-hover:text-white"
        aria-label="Xóa tài liệu"
      >
        <X className="h-4 w-4" />
      </button>
    </div>
  );

  return (
    <div className="bg-gradient-to-br from-slate-800/80 to-slate-900/90 rounded-2xl p-6 border border-slate-700/80 shadow-xl space-y-5">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div className="flex items-center gap-3">
          <div className="flex h-10 w-10 items-center justify-center rounded-xl bg-blue-500/20 text-blue-300">
            <FaImage className="text-lg" />
          </div>
          <div className="text-left">
            <h3 className="text-base font-semibold text-gray-100">
              Giấy tờ liên quan ({documents.length}/{maxFiles})
            </h3>
            <p className="text-sm text-gray-400">
              Tải lên tối đa {maxFiles} ảnh tài liệu theo định dạng PNG, JPG, SVG, WEBP.
            </p>
          </div>
        </div>
        <div className="rounded-full border border-slate-700/80 px-4 py-1 text-xs text-slate-300">
          Kéo thả hoặc bấm để chọn
        </div>
      </div>

      {documents.length === 0 ? (
        <div
          {...getRootProps({
            className:
              "flex flex-col items-center justify-center gap-4 rounded-2xl border-2 border-dashed border-slate-600 p-8 text-center transition-all duration-300 cursor-pointer hover:border-blue-500/80 hover:bg-blue-500/10",
          })}
        >
          <input {...getInputProps()} />
          <div
            className={`rounded-full p-6 transition ${
              isDragActive ? "bg-blue-500/20" : "bg-slate-800"
            }`}
          >
            <FaFileImport
              className={`text-3xl transition ${
                isDragActive ? "text-blue-400" : "text-slate-400"
              }`}
            />
          </div>
          <div className="space-y-1">
            <p className="text-lg font-medium text-gray-100">
              {isDragActive ? "Thả ảnh vào đây" : "Tải lên tài liệu"}
            </p>
            <p className="text-sm text-gray-400">
              Kéo thả hoặc click để chọn ảnh. Cho phép tối đa {maxFiles} ảnh.
            </p>
          </div>
        </div>
      ) : (
        <div className="grid gap-4 grid-cols-2 sm:grid-cols-3">
          {documents.map((url, index) => renderPreviewCard(url, index))}

          {remainingSlots > 0 ? (
            <div
              {...getRootProps({
                className:
                  "flex flex-col items-center justify-center gap-3 rounded-2xl border-2 border-dashed border-slate-600/80 p-4 text-center transition duration-300 cursor-pointer hover:border-blue-500/80 hover:bg-blue-500/5",
              })}
            >
              <input {...getInputProps()} />
              <div className="flex h-14 w-14 items-center justify-center rounded-full bg-slate-800 text-slate-300 transition group-hover:text-blue-400">
                <FaPlus className="text-xl" />
              </div>
              <div className="space-y-1">
                <p className="text-sm font-medium text-gray-100">
                  Thêm tài liệu mới
                </p>
                <p className="text-xs text-gray-400">
                  Còn {remainingSlots} tài liệu có thể tải lên
                </p>
              </div>
            </div>
          ) : null}
        </div>
      )}
    </div>
  );
};

export default AdditionalDocumentsUpload;
