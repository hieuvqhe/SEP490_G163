"use client";
import { useState, useEffect } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastProvider';
import { useForgotPassword } from '@/hooks/useAuth';
import VerifyResetCodeModal from '@/components/VerifyResetCodeModal';
import ResetPasswordModal from '@/components/ResetPasswordModal';

interface ForgotPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSwitchToLogin?: () => void;
}

export default function ForgotPasswordModal({ isOpen, onClose, onSwitchToLogin }: ForgotPasswordModalProps) {
  const [emailOrUsername, setEmailOrUsername] = useState('');
  const [countdown, setCountdown] = useState(0);
  const [resendCount, setResendCount] = useState(0);
  const { showToast } = useToast();
  const [showVerifyModal, setShowVerifyModal] = useState(false);
  const [showResetPasswordModal, setShowResetPasswordModal] = useState(false);

  const forgotPasswordMutation = useForgotPassword({
    onSuccess: (data) => {
      showToast('Thành công', data.message, 'success');
      setCountdown(300); // 5 phút
      setResendCount((prev) => prev + 1);
      setShowVerifyModal(true);
    },
    onError: (error) => {
      showToast('Lỗi', error, 'error');
    }
  });

  useEffect(() => {
    if (countdown > 0) {
      const timer = setInterval(() => {
        setCountdown((prev) => (prev > 0 ? prev - 1 : 0));
      }, 1000);
      return () => clearInterval(timer);
    }
  }, [countdown]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (!emailOrUsername.trim()) {
      showToast('Lỗi', 'Vui lòng nhập email hoặc tên đăng nhập', 'error');
      return;
    }
    forgotPasswordMutation.mutate({ emailOrUsername });
  };

  const canResend = countdown === 0 && resendCount < 3 && !forgotPasswordMutation.isPending;

  if (!isOpen) return null;

  return (
    <>
      <Modal isOpen={isOpen} onClose={onClose} title="Quên mật khẩu">
        <form onSubmit={handleSubmit} className="space-y-4">
          <div>
            <label className="block text-sm font-medium text-gray-700 mb-1">Email hoặc tên đăng nhập</label>
            <input
              type="text"
              value={emailOrUsername}
              onChange={(e) => setEmailOrUsername(e.target.value)}
              className="w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors border-gray-300"
              placeholder="Nhập email hoặc tên đăng nhập"
              disabled={forgotPasswordMutation.isPending}
            />
          </div>
          <button
            type="submit"
            className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-60"
            disabled={!canResend}
          >
            {forgotPasswordMutation.isPending
              ? 'Đang gửi...'
              : countdown > 0
                ? `Gửi lại sau ${Math.floor(countdown / 60)}:${(countdown % 60).toString().padStart(2, '0')}`
                : resendCount > 0
                  ? 'Gửi lại email'
                  : 'Gửi email khôi phục'}
          </button>
          <div className="text-xs text-gray-500 text-center">
            {resendCount > 0 && <span>Bạn còn {3 - resendCount} lần gửi lại.</span>}
          </div>
        </form>
      </Modal>
      
      {/* Verify Reset Code Modal */}
      <VerifyResetCodeModal
        isOpen={showVerifyModal}
        onClose={() => setShowVerifyModal(false)}
        emailOrUsername={emailOrUsername}
        onSuccess={() => {
          setShowVerifyModal(false);
          setShowResetPasswordModal(true);
        }}
      />

      {/* Reset Password Modal */}
      <ResetPasswordModal
        isOpen={showResetPasswordModal}
        onClose={() => setShowResetPasswordModal(false)}
        emailOrUsername={emailOrUsername}
        onSuccess={() => {
          setShowResetPasswordModal(false);
          onClose();
          showToast('Thành công', 'Đặt lại mật khẩu thành công. Vui lòng đăng nhập với mật khẩu mới.', 'success');
          if (onSwitchToLogin) {
            onSwitchToLogin();
          }
        }}
      />
    </>
  );
}