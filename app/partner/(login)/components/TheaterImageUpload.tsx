"use client";

import { useCallback, useState, useEffect } from "react";
import { FileWithPath, useDropzone } from "react-dropzone";
import { FaFileImport, FaTimes, FaPlus, FaImage } from "react-icons/fa";

type TheaterImgsUploadProps = {
  fieldChange?: (FILES: File[]) => void;
  mediaUrl?: string;
  handleTheaterFileSelect?: (file: File[]) => void;
};

function TheaterImgsUpload({
  fieldChange = () => {},
  handleTheaterFileSelect = () => {}
}: TheaterImgsUploadProps) {
  const [files, setFiles] = useState<File[]>([]);
  const [fileUrls, setFileUrls] = useState<string[]>([]);

  const onDrop = useCallback(
    (acceptedFiles: FileWithPath[]) => {
      // Create URLs for preview first
      const newUrls = acceptedFiles.map((file) => URL.createObjectURL(file));

      // Update both files and URLs
      setFiles((prev) => {
        const newFiles = [...prev, ...acceptedFiles];
        fieldChange(newFiles);
        return newFiles;
      });

      setFileUrls((prev) => [...prev, ...newUrls]);
      handleTheaterFileSelect(files)
    },
    [fieldChange]
  );

  const removeFile = (index: number) => {
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
  });

  return (
    <div className="mt-4">
      <div className="bg-gradient-to-br from-slate-800 to-slate-900 rounded-2xl p-6 border border-slate-700 shadow-xl">
        {files.length > 0 ? (
          <>
            {/* Header with count */}
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <FaImage className="text-blue-400 text-lg" />
                <h3 className="text-white font-semibold">
                  Hình ảnh rạp chiếu ({files.length})
                </h3>
              </div>
              <div className="text-sm text-slate-400">
                Kéo thả hoặc click để thêm ảnh
              </div>
            </div>

            {/* Horizontal scrollable image preview */}
            <div className="flex gap-3  pb-2 mb-4 scrollbar-thin scrollbar-thumb-slate-600 scrollbar-track-slate-800">
              {fileUrls.map((url, index) => (
                <div key={index} className="relative group flex-shrink-0">
                  <div className="relative w-24 h-24 rounded-xl overflow-hidden border-2 border-slate-600 hover:border-blue-400 transition-all duration-300 shadow-lg">
                    <img
                      src={url}
                      alt={`Preview ${index + 1}`}
                      className="w-full h-full object-cover"
                    />
                    {/* <div className="absolute inset-0 bg-black bg-opacity-0 group-hover:bg-opacity-30 transition-all duration-300" /> */}

                    {/* Remove button */}
                  </div>
                  <button
                    onClick={() => removeFile(index)}
                    className="absolute cursor-pointer -top-2 -right-2 w-6 h-6 bg-red-500 hover:bg-red-600 text-white rounded-full flex items-center justify-center text-xs opacity-0 group-hover:opacity-100 transition-all duration-300 shadow-lg"
                  >
                    <FaTimes />
                  </button>
                </div>
              ))}

              {/* Add more button */}
              <div {...getRootProps()} className="flex-shrink-0">
                <div className="w-24 h-24 rounded-xl border-2 border-dashed border-slate-500 hover:border-blue-400 hover:bg-blue-400/10 transition-all duration-300 flex flex-col items-center justify-center cursor-pointer group">
                  <FaPlus className="text-slate-400 group-hover:text-blue-400 text-xl mb-1 transition-colors" />
                  <span className="text-xs text-slate-400 group-hover:text-blue-400 transition-colors">
                    Thêm
                  </span>
                </div>
                <input {...getInputProps()} />
              </div>
            </div>
          </>
        ) : (
          <div {...getRootProps()} className="text-center cursor-pointer">
            <input {...getInputProps()} />
            <div
              className={`border-2 border-dashed rounded-2xl p-8 transition-all duration-300 ${
                isDragActive
                  ? "border-blue-400 bg-blue-400/10 scale-105"
                  : "border-slate-500 hover:border-blue-400 hover:bg-blue-400/5"
              }`}
            >
              <div className="flex flex-col items-center gap-4">
                <div
                  className={`p-4 rounded-full transition-all duration-300 ${
                    isDragActive
                      ? "bg-blue-400/20 scale-110"
                      : "bg-slate-700 hover:bg-blue-400/20"
                  }`}
                >
                  <FaFileImport
                    className={`text-3xl transition-colors duration-300 ${
                      isDragActive ? "text-blue-400" : "text-slate-400"
                    }`}
                  />
                </div>

                <div>
                  <h3
                    className={`text-lg font-semibold mb-2 transition-colors duration-300 ${
                      isDragActive ? "text-blue-400" : "text-white"
                    }`}
                  >
                    {isDragActive
                      ? "Thả ảnh vào đây"
                      : "Tải lên hình ảnh rạp chiếu"}
                  </h3>
                  <p className="text-slate-400 text-sm mb-4">
                    Kéo thả ảnh vào đây hoặc click để chọn
                  </p>
                  <div className="flex items-center justify-center gap-2 text-xs text-slate-500">
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

export default TheaterImgsUpload;
