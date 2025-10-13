'use client';

import { useEffect, useState, Suspense } from 'react';
import { useSearchParams, useRouter } from 'next/navigation';
import { BASE_URL } from '@/constants';

function VerifyEmailContent() {
  const searchParams = useSearchParams();
  const router = useRouter();
  const [status, setStatus] = useState<'loading' | 'verifying' | 'success' | 'error'>('loading');
  const [message, setMessage] = useState('');
  const [mounted, setMounted] = useState(false);

  // Fix hydration mismatch
  useEffect(() => {
    setMounted(true);
  }, []);

  useEffect(() => {
    if (!mounted) return;

    const token = searchParams.get('token');
    
    if (!token) {
      setStatus('error');
      setMessage('Token xác minh không hợp lệ.');
      return;
    }

    setStatus('verifying');

    // Call verify email API
    const verifyEmail = async (token: string) => {
      try {
        const response = await fetch(`${BASE_URL}/api/Auth/verify-email?token=${token}`, {
          method: 'GET',
          headers: {
            'Accept': 'application/json',
          }
        });

        const result = await response.json();
        
        if (response.ok) {
          setStatus('success');
          setMessage('Xác minh email thành công!');
          
          // Redirect to home after 3 seconds
          setTimeout(() => {
            router.push('/');
          }, 3000);
        } else {
          setStatus('error');
          setMessage(result.message || result.error || 'Có lỗi xảy ra trong quá trình xác minh email.');
        }
        
      } catch {
        setStatus('error');
        setMessage('Không thể kết nối đến server. Vui lòng thử lại.');
      }
    };

    verifyEmail(token);
  }, [mounted, searchParams, router]);

  // Don't render anything until mounted
  if (!mounted) {
    return null;
  }

  const getIcon = () => {
    switch (status) {
      case 'loading':
      case 'verifying':
        return (
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-blue-100 mb-4">
            <svg className="animate-spin w-8 h-8 text-blue-500" fill="none" viewBox="0 0 24 24">
              <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4" />
              <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z" />
            </svg>
          </div>
        );
      case 'success':
        return (
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-green-100 mb-4">
            <svg className="w-8 h-8 text-green-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M5 13l4 4L19 7" />
            </svg>
          </div>
        );
      case 'error':
        return (
          <div className="mx-auto flex items-center justify-center w-16 h-16 rounded-full bg-red-100 mb-4">
            <svg className="w-8 h-8 text-red-500" fill="none" stroke="currentColor" viewBox="0 0 24 24">
              <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M6 18L18 6M6 6l12 12" />
            </svg>
          </div>
        );
    }
  };

  const getTitle = () => {
    switch (status) {
      case 'loading':
        return 'Đang tải...';
      case 'verifying':
        return 'Đang xác minh email...';
      case 'success':
        return 'Xác minh thành công!';
      case 'error':
        return 'Xác minh thất bại';
    }
  };

  const getDescription = () => {
    switch (status) {
      case 'loading':
        return 'Vui lòng đợi trong giây lát.';
      case 'verifying':
        return 'Vui lòng đợi trong giây lát.';
      case 'success':
        return 'Tài khoản của bạn đã được kích hoạt. Bạn sẽ được chuyển hướng về trang chủ để đăng nhập.';
      case 'error':
        return message;
    }
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-pink-50 to-purple-50 flex items-center justify-center p-4">
      <div className="bg-white rounded-xl shadow-2xl w-full max-w-md p-8 text-center">
        {getIcon()}
        
        <h1 className="text-2xl font-bold text-gray-900 mb-2">
          {getTitle()}
        </h1>
        
        <p className="text-gray-600 mb-6">
          {getDescription()}
        </p>

        {status === 'success' && (
          <div className="mb-6">
            <div className="bg-green-50 border border-green-200 rounded-lg p-4">
              <p className="text-green-800 text-sm">
                🎉 Chúc mừng! Tài khoản của bạn đã được xác minh thành công.
                <br />
                Đang chuyển hướng về trang chủ...
              </p>
            </div>
          </div>
        )}

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

        {status === 'success' && (
          <button
            onClick={() => router.push('/')}
            className="w-full border border-gray-300 hover:bg-gray-50 text-gray-700 font-medium py-3 px-4 rounded-lg transition-colors focus:outline-none focus:ring-2 focus:ring-gray-500 focus:ring-offset-2"
          >
            Đi Ngay Không Chờ
          </button>
        )}
      </div>
    </div>
  );
}

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
      <div className="min-h-screen bg-gray-50 flex items-center justify-center px-4">
        <div className="max-w-md w-full bg-white rounded-xl shadow-lg p-8 text-center">
          <div className="w-20 h-20 bg-blue-100 rounded-full flex items-center justify-center mx-auto mb-6">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-600"></div>
          </div>
          <h1 className="text-2xl font-bold text-gray-900 mb-4">
            Đang tải...
          </h1>
        </div>
      </div>
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}