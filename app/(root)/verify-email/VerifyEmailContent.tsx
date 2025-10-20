'use client';

import { useEffect, useState } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import ConfirmationMessage from '@/components/confirmation-message';
import { useVerifyEmail } from '@/hooks/useAuth';

export default function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'verifying' | 'success' | 'error'>('verifying');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch by only rendering after component mounts
  useEffect(() => {
    setMounted(true);
  }, []);

  // Get token from search params
  const token = searchParams.get('token');

  // Use the verify email hook
  const verifyEmailMutation = useVerifyEmail(token || '', {
    onSuccess: () => {
      setStatus('success');
      setMessage('Xác minh email thành công!');

      // Redirect to home after 3 seconds
      setTimeout(() => {
        router.push('/');
      }, 3000);
    },
    onError: (errorMessage) => {
      setStatus('error');
      setMessage(errorMessage);
    }
  });

  useEffect(() => {
    if (!mounted) return;

    if (!token) {
      setStatus('error');
      setMessage('Token xác minh không hợp lệ.');
      return;
    }

    // Trigger verification
    verifyEmailMutation.mutate();
  }, [token, router, mounted, verifyEmailMutation]);

  // Don't render anything until component is mounted to prevent hydration mismatch
  if (!mounted) {
    return (
      <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
        <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-2">Đang tải...</h1>
          <p className="text-gray-600">Vui lòng đợi trong giây lát.</p>
        </div>
      </div>
    );
  }

  const getIcon = () => {
    if (verifyEmailMutation.isPending) {
      return (
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
          <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
            <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
            <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
          </svg>
        </div>
      );
    }

    if (status === 'success') {
      return (
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
          <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
          </svg>
        </div>
      );
    }

    if (status === 'error') {
      return (
        <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
          <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
            <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
          </svg>
        </div>
      );
    }

    return null;
  };

  const getTitle = () => {
    if (verifyEmailMutation.isPending) {
      return 'Đang xác minh email...';
    }

    if (status === 'success') {
      return 'Xác minh thành công!';
    }

    if (status === 'error') {
      return 'Xác minh thất bại';
    }

    return 'Đang xác minh email...';
  };

  const getDescription = () => {
    if (verifyEmailMutation.isPending) {
      return 'Vui lòng đợi trong giây lát.';
    }

    if (status === 'success') {
      return 'Tài khoản của bạn đã được kích hoạt. Bạn sẽ được chuyển hướng về trang chủ để đăng nhập.';
    }

    if (status === 'error') {
      return message;
    }

    return 'Vui lòng đợi trong giây lát.';
  };

  return (
    <>
      {status === 'success' ? (
        <ConfirmationMessage
          successMessage="Xác Minh Email Thành Công!"
          labelName="ExpressTicket"
          labelMessage="Tài khoản của bạn đã được xác minh thành công! Bạn có thể đăng nhập và sử dụng tất cả các tính năng của hệ thống."
          backgroundClassName="from-green-100 to-emerald-300"
        />
      ) : (
        <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
          <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
            {getIcon()}
            
            <h1 className="text-2xl font-bold text-gray-900 mb-2">
              {getTitle()}
            </h1>
            
            <p className="text-gray-600 mb-6">
              {getDescription()}
            </p>

            {status === 'error' && (
              <div className="space-y-4">
                <button
                  onClick={() => router.push('/')}
                  className="w-full bg-pink-500 hover:bg-pink-600 text-white font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-pink-500 focus:ring-offset-2"
                  style={{ backgroundColor: '#F84565' }}
                >
                  Về Trang Chủ
                </button>
                
                <button
                  onClick={() => window.location.reload()}
                  className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
                >
                  Thử Lại
                </button>
              </div>
            )}
          </div>
        </div>
      )}
    </>
  );
}