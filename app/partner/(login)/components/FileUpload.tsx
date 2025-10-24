import React from "react";
import { useCallback } from "react";
import { useDropzone } from "react-dropzone";
import { useState } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/Modal";
import { Upload, FileText, Image, FileImage, Camera } from "lucide-react";

interface FileUploadProps {
  isOpen: boolean;
  onClose: () => void;
  onFileSelect: (file: File) => void;
  fileType: 'business' | 'identity' | 'tax' | 'theater';
  title: string;
  isPending?: boolean;
}

const FileUpload: React.FC<FileUploadProps> = ({ 
  isOpen, 
  onClose, 
  onFileSelect, 
  fileType, 
  title,
  isPending
}) => {
  const [selectedFile, setSelectedFile] = useState<File | null>(null);

  const onDrop = useCallback((acceptedFiles: File[]) => {
    if (acceptedFiles.length > 0) {
      const file = acceptedFiles[0];
      setSelectedFile(file);
      onFileSelect(file);
    }
  }, [onFileSelect]);

  const { getRootProps, getInputProps, isDragActive } = useDropzone({ 
    onDrop,
    accept: {
      'image/*': ['.jpeg', '.jpg', '.png', '.gif', '.bmp', '.webp']
    },
    multiple: false
  });

  const getIcon = () => {
    switch (fileType) {
      case 'business':
        return <FileText className="w-16 h-16 text-purple-500" />;
      case 'identity':
        return <Image className="w-16 h-16 text-blue-500" />;
      case 'tax':
        return <FileImage className="w-16 h-16 text-green-500" />;
      case 'theater':
        return <Camera className="w-16 h-16 text-orange-500" />;
      default:
        return <Upload className="w-16 h-16 text-gray-500" />;
    }
  };

  const handleClose = () => {
    setSelectedFile(null);
    onClose();
  };

  return (
    <Modal
      isOpen={isOpen}
      onClose={handleClose}
      title={title}
      className="max-w-2xl"
    >
      <div className="p-6">
        <div
          {...getRootProps()}
          className={`relative border-2 border-dashed rounded-lg p-12 text-center cursor-pointer transition-all duration-300 ${
            isDragActive 
              ? 'border-purple-500 bg-purple-50 dark:bg-purple-900/20' 
              : 'border-gray-300 dark:border-gray-600 hover:border-purple-400 dark:hover:border-purple-500'
          }`}
        >
          <input {...getInputProps()} />
          
          <div className="flex flex-col items-center space-y-4">
            {getIcon()}
            
            {isDragActive ? (
              <div className="text-center">
                <p className="text-lg font-medium text-purple-600 dark:text-purple-400">
                  Thả file vào đây...
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  File sẽ được tải lên tự động
                </p>
              </div>
            ) : selectedFile ? (
              <div className="text-center">
                <p className="text-lg font-medium text-green-600 dark:text-green-400">
                  ✓ File đã được chọn
                </p>
                <p className="text-sm text-gray-600 dark:text-gray-300 mt-2">
                  {selectedFile.name}
                </p>
                <p className="text-xs text-gray-500 dark:text-gray-400 mt-1">
                  {(selectedFile.size / 1024 / 1024).toFixed(2)} MB
                </p>
              </div>
            ) : (
              <div className="text-center">
                <p className="text-lg font-medium text-gray-700 dark:text-gray-300">
                  Kéo thả file vào đây hoặc click để chọn
                </p>
                <p className="text-sm text-gray-500 dark:text-gray-400 mt-2">
                  Hỗ trợ: JPG, PNG, GIF, BMP, WebP
                </p>
                <p className="text-xs text-gray-400 dark:text-gray-500 mt-1">
                  Kích thước tối đa: 10MB
                </p>
              </div>
            )}
          </div>
        </div>

        {selectedFile && (
          <div className="mt-6 flex justify-end space-x-3">
            <Button 
              variant="outline" 
              onClick={() => setSelectedFile(null)}
              className="px-4 py-2 text-black"
            >
              Chọn lại
            </Button>
            <Button 
              onClick={handleClose}
              className="px-4 py-2 bg-purple-600 hover:bg-purple-700 text-white"
            >
              Xác nhận
            </Button>
          </div>
        )}
      </div>
    </Modal>
  );
};

export default FileUpload;
