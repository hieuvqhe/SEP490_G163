'use client';

import { useState, useEffect } from 'react';
import { useResendVerification } from '@/hooks/useAuth';
import { useToast } from '@/components/ToastProvider';

interface EmailVerificationModalProps {
  isOpen: boolean;
  onClose: () => void;
  userEmail?: string;
}

export default function EmailVerificationModal({ isOpen, onClose, userEmail }: EmailVerificationModalProps) {
  const [countdown, setCountdown] = useState(300); // 5 minutes = 300 seconds
  const [resendCount, setResendCount] = useState(0);
  const [isCountdownActive, setIsCountdownActive] = useState(true);
  const { showToast } = useToast();

  const resendMutation = useResendVerification({
    onSuccess: (data) => {
      showToast('Email đã được gửi lại!', data.message, 'success');
      setResendCount(prev => prev + 1);
      setCountdown(300); // Reset countdown to 5 minutes
      setIsCountdownActive(true);
    },
    onError: (error) => {
      showToast('Lỗi', error, 'error');
    }
  });

  // Countdown effect
  useEffect(() => {
    if (!isOpen || !isCountdownActive) return;

    const timer = setInterval(() => {
      setCountdown(prev => {
        if (prev <= 1) {
          setIsCountdownActive(false);
          return 0;
        }
        return prev - 1;
      });
    }, 1000);

    return () => clearInterval(timer);
  }, [isOpen, isCountdownActive]);

  // Reset state when modal opens
  useEffect(() => {
    if (isOpen) {
      setCountdown(300);
      setResendCount(0);
      setIsCountdownActive(true);
    }
  }, [isOpen]);

  const handleResendEmail = () => {
    if (userEmail && resendCount < 3 && !isCountdownActive) {
      resendMutation.mutate({ email: userEmail });
    }
  };

  const formatTime = (seconds: number) => {
    const minutes = Math.floor(seconds / 60);
    const remainingSeconds = seconds % 60;
    return `${minutes}:${remainingSeconds.toString().padStart(2, '0')}`;
  };

  const canResend = !isCountdownActive && resendCount < 3 && !resendMutation.isPending;

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 z-[9999] flex items-center justify-center">
      {/* Backdrop */}
      <div 
        className="absolute inset-0 bg-black/50 backdrop-blur-sm"
        onClick={onClose}
      />
      
      {/* Modal */}
      <div className="relative bg-white rounded-xl shadow-2xl w-full max-w-md mx-4">
        <div className="p-6 text-center">
          {/* Success Icon */}
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>

          {/* Header */}
          <h2 className="text-2xl font-bold text-gray-900 mb-2">Đăng Ký Thành Công!</h2>
          
          {/* Content */}
          <div className="space-y-4 mb-6">
            <p className="text-gray-600">
              Tài khoản của bạn đã được tạo thành công.
            </p>
            
            <div className="bg-blue-50 border border-blue-200 rounded-lg p-4">
              <div className="flex items-center mb-2">
                <svg className="w-5 h-5 text-blue-500 mr-2" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 8l7.89 4.26a2 2 0 002.22 0L21 8M5 19h14a2 2 0 002-2V7a2 2 0 00-2-2H5a2 2 0 00-2 2v10a2 2 0 002 2z" />
                </svg>
                <span className="font-medium text-blue-900">Xác Minh Email</span>
              </div>
              <p className="text-blue-800 text-sm">
                Chúng tôi đã gửi email xác minh đến <span className="font-medium">{userEmail}</span>. 
                Vui lòng kiểm tra hộp thư và nhấp vào liên kết xác minh để kích hoạt tài khoản.
              </p>
            </div>

            <div className="text-sm text-gray-500">
              <p>💡 <strong>Lưu ý:</strong> Kiểm tra cả thư mục spam nếu bạn không thấy email.</p>
            </div>
          </div>

          {/* Actions */}
          <div className="space-y-3">
            <button
              onClick={handleResendEmail}
              disabled={!canResend}
              className={`w-full font-medium py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-offset-2 transform ${
                canResend 
                  ? 'bg-pink-500 hover:bg-pink-600 hover:scale-105 hover:shadow-lg text-white focus:ring-pink-500' 
                  : 'bg-gray-300 text-gray-500 cursor-not-allowed'
              }`}
              style={canResend ? { backgroundColor: '#F84565' } : {}}
            >
              {resendMutation.isPending ? (
                'Đang gửi...'
              ) : isCountdownActive ? (
                `Gửi lại email (${formatTime(countdown)})`
              ) : resendCount >= 3 ? (
                'Đã đạt giới hạn gửi lại'
              ) : (
                'Gửi lại email'
              )}
            </button>

            {/* Display resend attempts */}
            {resendCount > 0 && (
              <div className="text-xs text-gray-500 text-center">
                Đã gửi lại: {resendCount}/3 lần
              </div>
            )}
            
            <button
              onClick={() => {
                window.open('https://mail.google.com/', '_blank');
              }}
              className="w-full border border-gray-300 hover:border-blue-400 hover:bg-blue-50 hover:text-blue-700 hover:scale-105 hover:shadow-lg text-gray-700 font-medium py-3 px-4 rounded-lg transition-all duration-200 ease-in-out focus:outline-none focus:ring-2 focus:ring-blue-500 focus:ring-offset-2 transform"
            >
              Mở Ứng Dụng Email
            </button>

            <button
              onClick={onClose}
              className="w-full text-gray-500 hover:text-gray-700 font-medium py-2 px-4 rounded-lg transition-colors duration-200 focus:outline-none"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    </div>
  );
}