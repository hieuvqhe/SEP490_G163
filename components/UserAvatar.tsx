"use client";

import React, { useState, useEffect, useRef, ReactNode } from "react";
import Image from 'next/image';
import Link from 'next/link';
import { useAuthStore } from '@/store/authStore';
import { useLogout } from '@/hooks/useAuth';
import { useToast } from '@/components/ToastProvider';

const User = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2" />
    <circle cx="12" cy="7" r="4" />
  </svg>
);
const Settings = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="3" />
    <path d="M12 1v6m0 6v6" />
    <path d="M1 12h6m6 0h6" />
  </svg>
);
const CreditCard = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <rect width="20" height="14" x="2" y="5" rx="2" />
    <line x1="2" x2="22" y1="10" y2="10" />
  </svg>
);
const HelpCircle = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <circle cx="12" cy="12" r="10" />
    <path d="M9.09 9a3 3 0 0 1 5.83 1c0 2-3 3-3 3" />
    <line x1="12" x2="12.01" y1="17" y2="17" />
  </svg>
);
const LogOut = (props: React.SVGProps<SVGSVGElement>) => (
  <svg xmlns="http://www.w3.org/2000/svg" width="16" height="16" viewBox="0 0 24 24" fill="none" stroke="currentColor" strokeWidth="2" strokeLinecap="round" strokeLinejoin="round" {...props}>
    <path d="M9 21H5a2 2 0 0 1-2-2V5a2 2 0 0 1 2-2h4" />
    <polyline points="16 17 21 12 16 7" />
    <line x1="21" x2="9" y1="12" y2="12" />
  </svg>
);

interface DropdownMenuProps {
  children: ReactNode;
  trigger: ReactNode;
}

const DropdownMenu = ({ children, trigger }: DropdownMenuProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);

  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (
        dropdownRef.current &&
        !dropdownRef.current.contains(event.target as Node)
      ) {
        setIsOpen(false);
      }
    };
    document.addEventListener("mousedown", handleClickOutside);
    return () => {
      document.removeEventListener("mousedown", handleClickOutside);
    };
  }, []);

  const handleTriggerClick = (e: React.MouseEvent) => {
    e.stopPropagation();
    setIsOpen(!isOpen);
  };

  return (
    <div className="relative inline-block text-left" ref={dropdownRef}>
      <div onClick={handleTriggerClick} className="cursor-pointer">
        {trigger}
      </div>
      {isOpen && (
        <div
          className="origin-top-right absolute right-0 mt-2 w-72 rounded-xl shadow-xl bg-white dark:bg-zinc-900 ring-1 ring-black ring-opacity-5 focus:outline-none z-50 animate-in fade-in-0 zoom-in-95 p-2"
          role="menu"
          aria-orientation="vertical"
        >
          {children}
        </div>
      )}
    </div>
  );
};

interface DropdownMenuItemProps {
  children: ReactNode;
  onClick?: () => void;
}

const DropdownMenuItem = ({ children, onClick }: DropdownMenuItemProps) => (
  <a
    href="#"
    onClick={(e: React.MouseEvent) => {
      e.preventDefault();
      if (onClick) onClick();
    }}
    className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150"
    role="menuitem"
  >
    {children}
  </a>
);

const DropdownMenuSeparator = () => (
  <div className="my-2 h-px bg-zinc-200 dark:bg-zinc-700" />
);

const UserAvatar = () => {
  const [isDropdownOpen, setIsDropdownOpen] = useState(false);
  const dropdownRef = useRef<HTMLDivElement>(null);
  const { user, refreshToken, accessToken, clearAuth } = useAuthStore();
  const { showToast } = useToast();

  const logoutMutation = useLogout({
    onSuccess: (data) => {
      showToast(data.message || 'Đăng xuất thành công', '', 'success');
      // User already cleared in handleLogout
    },
    onError: (error) => {
      showToast('Lỗi', error, 'error');
      // User already cleared in handleLogout, so don't need to clear again
    }
  });

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (dropdownRef.current && !dropdownRef.current.contains(event.target as Node)) {
        setIsDropdownOpen(false);
      }
    };

    if (isDropdownOpen) {
      document.addEventListener('mousedown', handleClickOutside);
    }

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
    };
  }, [isDropdownOpen]);

  const handleLogout = () => {
    // Close dropdown immediately
    setIsDropdownOpen(false);
    
    if (refreshToken && accessToken) {
      // Clear user immediately before API call to prevent UI flicker
      clearAuth();
      
      logoutMutation.mutate({
        data: { refreshToken },
        accessToken
      });
    } else {
      // If no tokens, just clear local storage
      clearAuth();
      showToast('Đăng xuất thành công', '', 'success');
    }
  };

  // Removed duplicate useUser and useToast hooks and logoutMutation

  if (!user) return null;

  // Lấy tên viết tắt
  const getInitials = (name: string) => {
    return name
      .split(' ')
      .map((n) => n[0])
      .join('')
      .toUpperCase();
  };

  return (
    <DropdownMenu
      trigger={
        <button className="flex items-center space-x-3 p-2 rounded-lg bg-white/10 backdrop-blur-md border border-white/20 hover:bg-white/20 dark:bg-zinc-900/20 dark:border-zinc-700/30 dark:hover:bg-zinc-800/30 transition-all duration-300">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.fullname}
              width={32}
              height={32}
              className="w-8 h-8 rounded-full object-cover border"
            />
          ) : (
            <div className="w-8 h-8 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold text-sm">
              {getInitials(user.fullname)}
            </div>
          )}
          <div className="text-left hidden md:block">
            <div className="text-sm font-medium text-white-900 dark:text-zinc-100">
              {user.fullname}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </div>
          </div>
        </button>
      }
    >
      <div className="px-3 py-3 border-b border-zinc-200 dark:border-zinc-700">
        <div className="flex items-center space-x-3">
          {user.avatarUrl ? (
            <Image
              src={user.avatarUrl}
              alt={user.fullname}
              width={40}
              height={40}
              className="w-10 h-10 rounded-full object-cover border"
            />
          ) : (
            <div className="w-10 h-10 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white font-semibold">
              {getInitials(user.fullname)}
            </div>
          )}
          <div>
            <div className="text-sm font-semibold text-zinc-900 dark:text-zinc-100">
              {user.fullname}
            </div>
            <div className="text-xs text-zinc-500 dark:text-zinc-400">
              {user.email}
            </div>
            {/* <div className="text-xs text-blue-600 dark:text-blue-400 font-medium">Pro Plan</div> */}
          </div>
        </div>
      </div>
      <div className="py-1">
        <Link href="/profile" className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150" role="menuitem">
          <User className="mr-3 h-4 w-4 text-zinc-500" />
          Hồ sơ cá nhân
        </Link>
        <Link href="/settings" className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150" role="menuitem">
          <Settings className="mr-3 h-4 w-4 text-zinc-500" />
          Cài đặt
        </Link>
        <Link href="/billing" className="text-zinc-700 dark:text-zinc-300 group flex items-center px-3 py-2.5 text-sm rounded-lg hover:bg-zinc-100 dark:hover:bg-zinc-800 transition-colors duration-150" role="menuitem">
          <CreditCard className="mr-3 h-4 w-4 text-zinc-500" />
          Thanh toán & Gói dịch vụ
        </Link>
      </div>
      <DropdownMenuSeparator />
      <div className="py-1">
        <DropdownMenuItem onClick={() => window.location.href = '/help'}>
          <HelpCircle className="mr-3 h-4 w-4 text-zinc-500" />
          Hỗ trợ
        </DropdownMenuItem>
        <DropdownMenuItem
          onClick={() => {
            handleLogout();
          }}
        >
          <LogOut className="mr-3 h-4 w-4 text-zinc-500" />
          {logoutMutation.isPending ? 'Đang đăng xuất...' : 'Đăng xuất'}
        </DropdownMenuItem>
      </div>
    </DropdownMenu>
  );
};

export default UserAvatar;