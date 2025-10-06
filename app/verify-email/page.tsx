'use client';

import { Suspense } from 'react';
import VerifyEmailContent from './VerifyEmailContent';

export default function VerifyEmailPage() {
  return (
    <Suspense fallback={
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
    }>
      <VerifyEmailContent />
    </Suspense>
  );
}