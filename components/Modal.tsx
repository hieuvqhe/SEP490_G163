import { useState, ReactNode } from "react";
import { AnimatePresence, motion } from "framer-motion";
import { CircleAlert, X } from "lucide-react";

import { cn } from "@/lib/utils";

interface ModalProps {
  modalSize?: "sm" | "lg" | "xl";
  isOpen?: boolean;
  onClose?: () => void;
  children?: ReactNode;
  title?: string;
  showCloseButton?: boolean;
  className?: string;
  contentClassName?: string;
  showExampleButton?: boolean;
}

export default function Modal({ 
  modalSize = "lg",
  isOpen: controlledIsOpen,
  onClose: controlledOnClose,
  children,
  title,
  showCloseButton = true,
  className,
  contentClassName,
  showExampleButton = false
}: ModalProps) {
  const [internalIsOpen, setInternalIsOpen] = useState(false);
  
  // Use controlled state if provided, otherwise use internal state
  const isOpen = controlledIsOpen !== undefined ? controlledIsOpen : internalIsOpen;
  const onClose = controlledOnClose || (() => setInternalIsOpen(false));
  const onOpen = () => setInternalIsOpen(true);

  return (
    <div>
      {showExampleButton && (
        <button
          onClick={onOpen}
          className="rounded bg-indigo-800 p-2 font-medium text-white transition-opacity hover:opacity-90"
        >
          Open Modal
        </button>
      )}

      <AnimatePresence>
        {isOpen && (
          <div
            onClick={onClose}
            className="fixed inset-0 z-50 flex cursor-pointer items-center justify-center overflow-y-scroll bg-slate-900/20 p-8 backdrop-blur"
          >
            <motion.div
              initial={{ scale: 0, rotate: "180deg" }}
              animate={{
                scale: 1,
                rotate: "0deg",
                transition: {
                  type: "spring",
                  bounce: 0.25,
                },
              }}
              exit={{ scale: 0, rotate: "180deg" }}
              onClick={(e) => e.stopPropagation()}
              className={cn(
                "relative w-full cursor-default overflow-hidden rounded-xl bg-white p-6 shadow-2xl",
                {
                  "max-w-sm": modalSize === "sm",
                  "max-w-lg": modalSize === "lg",
                  "max-w-2xl": modalSize === "xl",
                },
                className
              )}
            >
              {/* Close button */}
              {showCloseButton && (
                <button
                  onClick={onClose}
                  className="absolute right-4 top-4 text-gray-400 hover:text-gray-600 transition-colors z-10"
                >
                  <X size={24} />
                </button>
              )}

              {/* Title */}
              {title && (
                <div className="mb-4">
                  <h3 className="text-2xl font-bold text-gray-900">{title}</h3>
                </div>
              )}

              {/* Content */}
              <div className={cn("", contentClassName)}>
                {children || (
                  <div className="flex flex-col gap-3 text-center">
                    <CircleAlert className="mx-auto text-indigo-500" size={48} />
                    <h3 className="text-3xl font-bold text-gray-900">
                      Welcome to the modal!
                    </h3>
                    <p className="mb-1 text-gray-600">
                      Lorem ipsum dolor sit amet, consectetur adipiscing elit, sed do eiusmod tempor
                      incididunt ut labore et dolore magna.
                    </p>
                    <div className="flex gap-2">
                      <button
                        onClick={onClose}
                        className="w-full rounded bg-gray-200 py-2 font-semibold text-gray-700 transition-colors hover:bg-gray-300"
                      >
                        Close!
                      </button>
                      <button
                        onClick={onClose}
                        className="w-full rounded bg-indigo-600 py-2 font-semibold text-white transition-opacity hover:opacity-80"
                      >
                        Understood!
                      </button>
                    </div>
                  </div>
                )}
              </div>
            </motion.div>
          </div>
        )}
      </AnimatePresence>
    </div>
  );
}
