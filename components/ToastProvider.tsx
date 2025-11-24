"use client";

import * as Toast from "@radix-ui/react-toast";
import {
  createContext,
  useContext,
  useState,
  ReactNode,
  useCallback,
} from "react";

type ToastType = "success" | "error" | "info" | "warning";

type ToastMessageInput =
  | string
  | {
      message?: string | null;
      msg?: string | null;
      errors?: Record<string, { msg?: string | null }>;
    };

const resolveToastMessage = (input: ToastMessageInput): string => {
  if (typeof input === "string") {
    return input;
  }

  if (!input || typeof input !== "object") {
    return "Thông báo";
  }

  const directMessage = input.message ?? input.msg;
  if (directMessage && typeof directMessage === "string") {
    return directMessage;
  }

  const firstErrorKey = input.errors ? Object.keys(input.errors)[0] : undefined;
  if (firstErrorKey) {
    const errorEntry = input.errors?.[firstErrorKey];
    if (errorEntry?.msg) {
      return errorEntry.msg;
    }
  }

  return "Thông báo";
};

interface ToastData {
  id: string;
  title: string;
  description?: string;
  type: ToastType;
}

interface ToastContextType {
  showToast: (
    title: ToastMessageInput,
    description?: string,
    type?: ToastType
  ) => void;
}

const ToastContext = createContext<ToastContextType | undefined>(undefined);

export const useToast = () => {
  const context = useContext(ToastContext);
  if (!context) {
    throw new Error("useToast must be used within a ToastProvider");
  }
  return context;
};

interface ToastProviderProps {
  children: ReactNode;
}

export function ToastProvider({ children }: ToastProviderProps) {
  const [toasts, setToasts] = useState<ToastData[]>([]);

  const showToast = (
    title: ToastMessageInput,
    description?: string,
    type: ToastType = "info"
  ) => {
    const id = Math.random().toString(36).substr(2, 9);
    const resolvedTitle = resolveToastMessage(title);
    const newToast: ToastData = { id, title: resolvedTitle, description, type };

    setToasts((prev) => [...prev, newToast]);

    // Auto remove toast after 5 seconds
    setTimeout(() => {
      setToasts((prev) => prev.filter((toast) => toast.id !== id));
    }, 5000);
  };

  const removeToast = useCallback((id: string) => {
    setToasts((prev) => prev.filter((toast) => toast.id !== id));
  }, []);

  const getToastStyles = useCallback((type: ToastType) => {
    switch (type) {
      case "success":
        return {
          background: "linear-gradient(135deg, #10B981, #059669)",
          border: "1px solid #059669",
        };
      case "error":
        return {
          background: "linear-gradient(135deg, #EF4444, #DC2626)",
          border: "1px solid #DC2626",
        };
      case "warning":
        return {
          background: "linear-gradient(135deg, #F59E0B, #D97706)",
          border: "1px solid #D97706",
        };
      case "info":
      default:
        return {
          background: "linear-gradient(135deg, #F84565, #E11D48)",
          border: "1px solid #E11D48",
        };
    }
  }, []);

  const getIcon = useCallback((type: ToastType) => {
    switch (type) {
      case "success":
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M5 13l4 4L19 7"
            />
          </svg>
        );
      case "error":
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M6 18L18 6M6 6l12 12"
            />
          </svg>
        );
      case "warning":
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M12 9v4m0 4h.01M2.458 19h19.084c1.54 0 2.497-1.667 1.732-3L13.732 4c-.77-1.333-2.694-1.333-3.464 0L.726 16c-.765 1.333.193 3 1.732 3z"
            />
          </svg>
        );
      case "info":
      default:
        return (
          <svg
            className="w-5 h-5 text-white"
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M13 16h-1v-4h-1m1-4h.01M21 12a9 9 0 11-18 0 9 9 0 0118 0z"
            />
          </svg>
        );
    }
  }, []);

  return (
    <ToastContext.Provider value={{ showToast }}>
      <Toast.Provider swipeDirection="right">
        {children}

        {toasts.map((toast) => (
          <Toast.Root
            key={toast.id}
            className="bg-white rounded-lg shadow-lg border overflow-hidden"
            style={getToastStyles(toast.type)}
            duration={5000}
            onOpenChange={(open) => {
              if (!open) removeToast(toast.id);
            }}
          >
            <div className="flex items-start p-4">
              {/* <div className="flex-shrink-0 mr-3 mt-0.5">
                {getIcon(toast.type)}d
              </div> */}

              <div className="flex-1">
                <Toast.Title className="text-white font-semibold text-sm">
                  {toast.title}
                </Toast.Title>
                {toast.description && (
                  <Toast.Description className="text-white/90 text-sm mt-1">
                    {toast.description}
                  </Toast.Description>
                )}
              </div>

              <Toast.Close className="flex-shrink-0 ml-3 text-white/70 hover:text-white transition-colors">
                <svg
                  className="w-4 h-4"
                  fill="none"
                  stroke="currentColor"
                  viewBox="0 0 24 24"
                >
                  <path
                    strokeLinecap="round"
                    strokeLinejoin="round"
                    strokeWidth={2}
                    d="M6 18L18 6M6 6l12 12"
                  />
                </svg>
              </Toast.Close>
            </div>
          </Toast.Root>
        ))}

        <Toast.Viewport className="fixed top-0 right-0 flex flex-col p-6 gap-2 w-96 max-w-[100vw] m-0 list-none z-[2147483647] outline-none" />
      </Toast.Provider>
    </ToastContext.Provider>
  );
}
