"use client";

import { IoIosSearch } from "react-icons/io";
import { FaTimes } from "react-icons/fa";
import { useState, useEffect } from "react";
import { FaBars } from "react-icons/fa";
import Link from "next/link";
import Image from "next/image";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SearchIcon } from "lucide-react";
import RegisterModal from "@/components/RegisterModal";
import LoginModal from "@/components/LoginModal";
import EmailVerificationModal from "@/components/EmailVerificationModal";
import UserAvatar from "@/components/UserAvatar";
import { useAuthStore } from "@/store/authStore";
import { useGetUserInfo } from "@/hooks/useAuth";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { user, accessToken, isLoading, isHydrated, setTokens, clearAuth } = useAuthStore();

  // Handle case when there's no data in localStorage
  useEffect(() => {
    if (isHydrated && !accessToken && !user && isLoading) {
      // If hydrated but no data and still loading, set loading to false
      clearAuth(); // This will set isLoading to false
    }
  }, [isHydrated, accessToken, user, isLoading, clearAuth]);

  // Only fetch user info if we have accessToken but no user data (first time login)
  // This prevents unnecessary API calls when user info is already available in localStorage
  const shouldFetchUserInfo = accessToken && !user && !isLoading;
  
  useGetUserInfo(shouldFetchUserInfo ? accessToken : null, {
    onSuccess: (data) => {
      console.log('User info fetched successfully:', data);
    },
    onError: (error) => {
      console.error('Failed to fetch user info:', error);
      // If fetching user info fails, clear the tokens as they might be invalid
      clearAuth();
    }
  });

  const handleRegistrationSuccess = (data: { user?: { email: string }; email?: string }) => {
    setUserEmail(data.user?.email || data.email || "");
    setShowRegisterModal(false);
    setShowEmailVerificationModal(true);
  };

  const handleLoginSuccess = (data: { data: { accessToken: string; refreshToken: string; fullName: string } }) => {
    console.log('Login successful:', data);
    setShowLoginModal(false);
    
    // Store tokens - AuthStore will handle localStorage automatically
    setTokens(data.data.accessToken, data.data.refreshToken);
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const navigationItems = [
    { title: "Xem Ngay", link: "/" },
    { title: "Điểm Thưởng", link: "/movies" },
    { title: "Yêu Thích", link: "/movies" },
    { title: "Đang chiếu", link: "/movies" },
  ];

  return (
    <>
      <div className="md:hidden fixed top-4 right-4 z-50 flex gap-40 items-center">
        <div className="relative">
          {isOpen ? (
            <IoIosSearch
              className="w-6 h-6 cursor-pointer transition-colors duration-300 hover:text-orange-500"
            />
          ) : (
            <></>
          )}
        </div>

        <button
          onClick={() => setIsOpen(!isOpen)}
          className="p-2 rounded-md bg-gray-800 text-white transition-all duration-300"
        >
          {isOpen ? <FaTimes /> : <FaBars />}
        </button>
      </div>

      <div
        className={`fixed inset-x-0 top-4 z-50 h-16 border-none transition-all duration-700
        sm:inset-x-6 flex items-center justify-between px-4 max-md:hidden`}
      >
        <div className="flex items-center gap-10">
          <Link href={"/"} className="max-md:flex-1">
            <Image
              src={"/logo.png"}
              alt=""
              className={`transition-all duration-300`}
              width={60}
              height={60}
            />
          </Link>

          <InputGroup
            className="h-11 w-xs lg:w-md  rounded-full backdrop-blur bg-gray-400/20 
          border-gray-300/20 overflow-hidden 
          transition-[width] duration-300"
          >
            <InputGroupInput
              placeholder="Tìm tên phim, diễn viên"
              className="border-0 focus:border-0 focus:ring-0 focus-visible:ring-0 focus:outline-none"
            />
            <InputGroupAddon>
              <SearchIcon />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div>
          <div className="flex items-center gap-4">
            {navigationItems.map((item, index) => (
              <Link
                key={index}
                className="nav-hover-btn"
                href={item.link}
                onClick={() => setIsOpen(!isOpen)}
              >
                {item.title}
              </Link>
            ))}
            
            {/* Show user avatar if logged in, otherwise show login/register buttons */}
            {isLoading ? (
              // Show loading skeleton while initializing
              <div className="flex items-center gap-4">
                <div className="w-20 h-9 bg-gray-300/20 rounded-lg animate-pulse"></div>
                <div className="w-20 h-9 bg-gray-300/20 rounded-lg animate-pulse"></div>
              </div>
            ) : user ? (
              <UserAvatar />
            ) : (
              <>
                {/* Login button */}
                <button 
                  onClick={() => setShowLoginModal(true)}
                  className="px-4 py-2 rounded-lg font-medium outline-none text-sm border transition-all duration-300 hover:bg-gray-50" 
                  style={{backgroundColor:"transparent", color:"#FFFFFF", borderColor:"#FFFFFF"}}
                >
                  Đăng Nhập
                </button>

                {/* Register button */}
                <button 
                  onClick={() => setShowRegisterModal(true)}
                  className="px-4 py-2 rounded-lg font-medium outline-none text-sm border relative overflow-hidden group transition-all duration-300" 
                  style={{backgroundColor:"#F84565", color:"#FFFFFF", borderColor:"#F84565"}}
                >
                  <span 
                    className="absolute -inset-1 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out rounded-lg" 
                    style={{zIndex:1}}
                  ></span>
                  <span 
                    className="relative transition-colors duration-300 text-white group-hover:text-[#F84565]" 
                    style={{zIndex:2}}
                  >
                    Đăng Ký
                  </span>
                </button>
              </>
            )}
          </div>
          
          {/* User button */}
        </div>
      </div>

      {/* Login Modal */}
      <LoginModal
        isOpen={showLoginModal}
        onClose={() => setShowLoginModal(false)}
        onSuccess={handleLoginSuccess}
        onSwitchToRegister={switchToRegister}
      />

      {/* Register Modal */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegistrationSuccess}
        onSwitchToLogin={switchToLogin}
      />

      {/* Email Verification Modal */}
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        userEmail={userEmail}
      />
    </>
  );
};

export default Header;
