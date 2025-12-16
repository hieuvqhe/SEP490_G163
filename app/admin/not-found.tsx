'use client';

import { useEffect } from 'react';
import { useRouter } from 'next/navigation';

export default function AdminNotFound() {
  const router = useRouter();

  useEffect(() => {
    const timer = setTimeout(() => {
      router.push('/admin');
    }, 3000);

    return () => clearTimeout(timer);
  }, [router]);

  return (
    <div className="min-h-screen flex items-center justify-center bg-gradient-to-br from-gray-50 to-gray-100">
      <div className="max-w-md w-full px-6 py-8 bg-white rounded-2xl shadow-xl text-center">
        <div className="mb-6">
          <div className="text-8xl font-bold text-transparent bg-clip-text bg-gradient-to-r from-blue-500 to-indigo-600">
            404
          </div>
        </div>
        
        <h1 className="text-3xl font-bold text-gray-900 mb-4">
          Trang không tồn tại
        </h1>
        
        <p className="text-gray-600 mb-8">
          Trang admin bạn đang tìm kiếm không tồn tại.
          <br />
          Bạn sẽ được chuyển về trang admin sau 3 giây...
        </p>

        <button
          onClick={() => router.push('/admin')}
          className="inline-flex items-center justify-center px-6 py-3 bg-gradient-to-r from-blue-500 to-indigo-600 text-white font-semibold rounded-lg shadow-lg hover:from-blue-600 hover:to-indigo-700 transform hover:scale-105 transition-all duration-200"
        >
          Về trang admin
        </button>
      </div>
    </div>
  );
}
