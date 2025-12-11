'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';
import { useAuthStore } from '@/store/authStore';

export default function NotFound() {
  const router = useRouter();
  const { role } = useAuthStore();

  useEffect(() => {
    // Determine home page based on role
    const getHomePage = () => {
      const roleLower = role?.toLowerCase();
      
      switch (roleLower) {
        case 'admin':
          return '/admin';
        case 'partner':
          return '/partner/home';
        case 'manager':
        case 'managerstaff':
          return '/manager';
        case 'cashier':
          return '/cashier';
        case 'user':
        default:
          return '/';
      }
    };

    // Auto redirect after 3 seconds
    const timer = setTimeout(() => {
      router.push(getHomePage());
    }, 3000);

    return () => clearTimeout(timer);
  }, [role, router]);

  const handleGoHome = () => {
    const roleLower = role?.toLowerCase();
    
    switch (roleLower) {
      case 'admin':
        router.push('/admin');
        break;
      case 'partner':
        router.push('/partner/home');
        break;
      case 'manager':
      case 'managerstaff':
        router.push('/manager');
        break;
      case 'cashier':
        router.push('/cashier');
        break;
      case 'user':
      default:
        router.push('/');
        break;
    }
  };

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="mb-6">
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-pink-500 to-purple-600">
            404
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Trang không tồn tại
        </h1>
        
        <p className="text-gray-600 mb-8">
          Trang bạn đang tìm kiếm không tồn tại hoặc đã bị di chuyển.
          <br />
          Bạn sẽ được chuyển hướng về trang chủ sau 3 giây...
        </p>

        <button
          onClick={handleGoHome}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-pink-500 to-purple-600 text-white font-semibold rounded-lg shadow-lg hover:from-pink-600 hover:to-purple-700 transform hover:scale-105 transition-all duration-200"
        >
          Về trang chủ ngay
        </button>
      </div>
    </div>
  );
}
