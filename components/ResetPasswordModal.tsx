"use client";
import { useState } from 'react';
import Modal from '@/components/Modal';
import { useToast } from '@/components/ToastProvider';
import { useResetPassword } from '@/hooks/useAuth';

interface ResetPasswordModalProps {
  isOpen: boolean;
  onClose: () => void;
  emailOrUsername: string;
  onSuccess: () => void;
}

export default function ResetPasswordModal({ isOpen, onClose, emailOrUsername, onSuccess }: ResetPasswordModalProps) {
  const [formData, setFormData] = useState({
    newPassword: '',
    verifyPassword: ''
  });
  const [errors, setErrors] = useState<{ newPassword?: string; verifyPassword?: string }>({});
  const [showPassword, setShowPassword] = useState(false);
  const [showVerifyPassword, setShowVerifyPassword] = useState(false);
  const { showToast } = useToast();

  const resetPasswordMutation = useResetPassword({
    onSuccess: (data) => {
      showToast('Thành công', data.message, 'success');
      onSuccess();
    },
    onError: (error) => {
      showToast('Lỗi', error, 'error');
    }
  });

  const validateForm = (): boolean => {
    const newErrors: { newPassword?: string; verifyPassword?: string } = {};

    // Password validation
    if (!formData.newPassword) {
      newErrors.newPassword = 'Mật khẩu mới là bắt buộc';
    } else if (formData.newPassword.length < 6 || formData.newPassword.length > 12) {
      newErrors.newPassword = 'Mật khẩu phải từ 6 đến 12 ký tự';
    } else if (!/^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]+$/.test(formData.newPassword)) {
      newErrors.newPassword = 'Mật khẩu phải có chữ hoa, chữ thường, số và ký tự đặc biệt';
    }

    // Verify password validation
    if (!formData.verifyPassword) {
      newErrors.verifyPassword = 'Xác nhận mật khẩu là bắt buộc';
    } else if (formData.newPassword !== formData.verifyPassword) {
      newErrors.verifyPassword = 'Mật khẩu và xác nhận mật khẩu không khớp';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof typeof formData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      resetPasswordMutation.mutate({
        emailOrUsername,
        newPassword: formData.newPassword,
        verifyPassword: formData.verifyPassword
      });
    }
  };

  if (!isOpen) return null;

  return (
    <Modal isOpen={isOpen} onClose={onClose} title="Đặt lại mật khẩu">
      <form onSubmit={handleSubmit} className="space-y-4">
        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showPassword ? 'text' : 'password'}
              value={formData.newPassword}
              onChange={(e) => handleInputChange('newPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.newPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập mật khẩu mới (6-12 ký tự)"
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowPassword(!showPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.newPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.newPassword}</p>
          )}
        </div>

        <div>
          <label className="block text-sm font-medium text-gray-700 mb-1">
            Xác nhận mật khẩu mới
          </label>
          <div className="relative">
            <input
              type={showVerifyPassword ? 'text' : 'password'}
              value={formData.verifyPassword}
              onChange={(e) => handleInputChange('verifyPassword', e.target.value)}
              className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.verifyPassword ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập lại mật khẩu mới"
              disabled={resetPasswordMutation.isPending}
            />
            <button
              type="button"
              onClick={() => setShowVerifyPassword(!showVerifyPassword)}
              className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
            >
              {showVerifyPassword ? (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.878 9.878L3 3m6.878 6.878L21 21" />
                </svg>
              ) : (
                <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                  <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                </svg>
              )}
            </button>
          </div>
          {errors.verifyPassword && (
            <p className="text-red-500 text-sm mt-1">{errors.verifyPassword}</p>
          )}
        </div>

        <button
          type="submit"
          disabled={resetPasswordMutation.isPending}
          className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-2 px-4 rounded-lg transition-all duration-200 disabled:opacity-50"
        >
          {resetPasswordMutation.isPending ? 'Đang đặt lại...' : 'Đặt lại mật khẩu'}
        </button>
      </form>
    </Modal>
  );
}