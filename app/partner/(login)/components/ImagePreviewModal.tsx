"use client";

import React from "react";
import { motion, AnimatePresence } from "framer-motion";
import { FaTimes, FaChevronLeft, FaChevronRight } from "react-icons/fa";

interface ImagePreviewModalProps {
  isOpen: boolean;
  onClose: () => void;
  imageUrl: string;
  title: string;
  currentIndex?: number;
  totalImages?: number;
  onPrevious?: () => void;
  onNext?: () => void;
}

const ImagePreviewModal: React.FC<ImagePreviewModalProps> = ({
  isOpen,
  onClose,
  imageUrl,
  title,
  currentIndex,
  totalImages,
  onPrevious,
  onNext,
}) => {
  if (!isOpen) return null;

  return (
    <AnimatePresence>
      {isOpen && (
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/80 backdrop-blur-sm p-4"
          onClick={onClose}
        >
          <motion.div
            initial={{ scale: 0.9, opacity: 0 }}
            animate={{ scale: 1, opacity: 1 }}
            exit={{ scale: 0.9, opacity: 0 }}
            className="relative max-w-5xl w-full bg-gray-900 rounded-2xl overflow-hidden shadow-2xl"
            onClick={(e) => e.stopPropagation()}
          >
            {/* Header */}
            <div className="flex items-center justify-between p-4 border-b border-gray-700">
              <h3 className="text-white font-semibold text-lg">{title}</h3>
              <button
                onClick={onClose}
                className="p-2 hover:bg-gray-800 rounded-lg transition-colors"
              >
                <FaTimes className="text-white text-xl" />
              </button>
            </div>

            {/* Image Container */}
            <div className="relative bg-gray-800 flex items-center justify-center min-h-[400px] max-h-[70vh]">
              <img
                src={imageUrl}
                alt={title}
                className="max-w-full max-h-[70vh] object-contain"
              />

              {/* Navigation Buttons */}
              {totalImages && totalImages > 1 && (
                <>
                  {currentIndex !== undefined && currentIndex > 0 && (
                    <button
                      onClick={onPrevious}
                      className="absolute left-4 p-3 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-all shadow-lg"
                    >
                      <FaChevronLeft className="text-xl" />
                    </button>
                  )}
                  {currentIndex !== undefined && currentIndex < totalImages - 1 && (
                    <button
                      onClick={onNext}
                      className="absolute right-4 p-3 bg-gray-900/80 hover:bg-gray-900 text-white rounded-full transition-all shadow-lg"
                    >
                      <FaChevronRight className="text-xl" />
                    </button>
                  )}
                </>
              )}
            </div>

            {/* Footer */}
            {totalImages && totalImages > 1 && currentIndex !== undefined && (
              <div className="p-4 border-t border-gray-700 text-center">
                <p className="text-gray-400 text-sm">
                  Ảnh {currentIndex + 1} / {totalImages}
                </p>
              </div>
            )}
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default ImagePreviewModal;
