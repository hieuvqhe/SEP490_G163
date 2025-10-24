"use client";

import React, { useState } from "react";
import { Upload, Loader2, CheckCircle2, XCircle } from "lucide-react";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import Image from "next/image";

const CloudinaryUpload = () => {
  const uploadMutation = useUploadToCloudinary();
  const [previewUrl, setPreviewUrl] = useState<string | null>(null);

  const handleFileInput = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    // Hiển thị preview tạm trước khi upload
    const preview = URL.createObjectURL(file);
    setPreviewUrl(preview);

    // Gửi file lên Cloudinary
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        console.log("✅ Upload success:", data.secure_url);
        setPreviewUrl(data.secure_url);
      },
      onError: (error) => {
        console.error("❌ Upload failed:", error);
      },
    });
  };

  return (
    <div className="w-full max-w-md mx-auto">
      <label
        htmlFor="file-upload"
        className={`flex flex-col items-center justify-center w-full h-48 border-2 border-dashed rounded-2xl cursor-pointer transition-all duration-300 
        ${
          uploadMutation.isError
            ? "border-red-500 bg-red-950/20"
            : uploadMutation.isSuccess
            ? "border-green-500 bg-green-900/10"
            : "border-gray-400 bg-gradient-to-br from-gray-800 via-gray-900 to-black hover:from-gray-700 hover:via-gray-800 hover:to-gray-900"
        }`}
      >
        {uploadMutation.isPending ? (
          <>
            <Loader2 className="w-10 h-10 text-gray-300 mb-3 animate-spin" />
            <p className="text-gray-300 text-sm">Đang tải lên...</p>
          </>
        ) : uploadMutation.isSuccess ? (
          <>
            <CheckCircle2 className="w-10 h-10 text-green-400 mb-3" />
            <p className="text-gray-200 text-sm">Tải lên thành công!</p>
          </>
        ) : uploadMutation.isError ? (
          <>
            <XCircle className="w-10 h-10 text-red-400 mb-3" />
            <p className="text-red-300 text-sm">Tải lên thất bại</p>
          </>
        ) : (
          <>
            <Upload className="w-10 h-10 text-gray-300 mb-3" />
            <p className="text-gray-200 text-sm font-medium">
              Nhấn để chọn hoặc kéo thả ảnh vào đây
            </p>
          </>
        )}

        {previewUrl && (
          <Image
            src={previewUrl}
            alt="preview"
            width={80}
            height={80}
            className="object-cover rounded-xl shadow-md border border-white/20"
          />
        )}
      </label>

      <input
        id="file-upload"
        type="file"
        accept="image/*"
        className="hidden"
        onChange={handleFileInput}
      />
    </div>
  );
};

export default CloudinaryUpload;
