'use client';

import { Loader2 } from "lucide-react";

interface LoadingScreenProps {
  isVisible: boolean;
  message?: string;
}

export default function LoadingScreen({ isVisible, message = "Đang chuyển hướng..." }: LoadingScreenProps) {
  if (!isVisible) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center">
      {/* Backdrop với blur effect */}
      <div 
        className="absolute inset-0 backdrop-blur-sm"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, rgba(85, 66, 38, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, rgba(3, 22, 45, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, rgba(0, 32, 39, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 60% 30%, rgba(2, 2, 16, 0.8) 0%, transparent 50%),
            radial-gradient(ellipse at 90% 70%, rgba(2, 21, 42, 0.8) 0%, transparent 50%),
            linear-gradient(135deg, rgba(0, 63, 255, 0.9) 0%, rgba(0, 32, 39, 0.9) 50%, rgba(2, 2, 16, 0.9) 100%)
          `
        }}
      />
      
      {/* Loading content */}
      <div className="relative z-10 flex flex-col items-center justify-center text-white">
        {/* Animated logo/icon */}
        <div className="mb-6">
          <div className="relative">
            {/* Outer spinning ring */}
            <div className="w-20 h-20 border-4 border-white/20 border-t-white rounded-full animate-spin"></div>
            
            {/* Inner pulsing circle */}
            <div className="absolute inset-0 flex items-center justify-center">
              <div className="w-12 h-12 bg-white rounded-full animate-pulse opacity-80"></div>
            </div>
            
            {/* Center icon */}
            <div className="absolute inset-0 flex items-center justify-center">
              <Loader2 className="w-6 h-6 text-red-600 animate-spin" />
            </div>
          </div>
        </div>
        
        {/* Loading text */}
        <div className="text-center">
          <h3 className="text-xl font-semibold mb-2">Đăng nhập thành công!</h3>
          <p className="text-white/80 text-sm">{message}</p>
          
          {/* Animated dots */}
          <div className="flex justify-center mt-4 space-x-1">
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '0ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '150ms' }}></div>
            <div className="w-2 h-2 bg-white rounded-full animate-bounce" style={{ animationDelay: '300ms' }}></div>
          </div>
        </div>
        
        {/* Progress bar */}
        <div className="mt-8 w-64 h-1 bg-white/20 rounded-full overflow-hidden">
          <div className="h-full bg-gradient-to-r from-red-500 to-white rounded-full animate-progress"></div>
        </div>
      </div>
    </div>
  );
}