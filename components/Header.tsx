"use client";

import { IoIosSearch } from "react-icons/io";
import { useState, useEffect } from "react";
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
import { redirect } from "next/navigation";

const Header = () => {
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [userEmail, setUserEmail] = useState("");
  const { user, accessToken, isLoading, isHydrated, clearAuth } =
    useAuthStore();

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
      console.log("User info fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to fetch user info:", error);
      // If fetching user info fails, clear the tokens as they might be invalid
      clearAuth();
    },
  });

  const handleRegistrationSuccess = (data: {
    result?: { email: string };
    email?: string;
  }) => {
    setUserEmail(data.result?.email || data.email || "");
    setShowRegisterModal(false);
    setShowEmailVerificationModal(true);
  };

  const handleLoginSuccess = (data: {
    result: {
      accessToken: string;
      refreshToken: string;
      fullName: string;
      role: string;
    };
  }) => {
    console.log("Login successful:", data);
    setShowLoginModal(false);

    // Tokens đã được set trong useLogin hook
    // Redirect ngay lập tức dựa trên role từ response
    const role = data.result.role;
    console.log("Redirecting with role from response:", role);

    if (!role) {
      window.location.href = "/";
      return;
    }

    const roleLower = role.toLowerCase();
    let targetPath = "/";

    switch (roleLower) {
      case "admin":
        targetPath = "/admin";
        break;
      case "partner":
        targetPath = "/partner";
        break;
      case "manager":
        targetPath = "/manager";
        break;
      case "user":
      default:
        targetPath = "/";
        break;
    }

    console.log("Redirecting to:", targetPath);
    window.location.href = targetPath;
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
    { title: "Điểm Thưởng", link: "/movies", requiresAuth: true },
    { title: "Yêu Thích", link: "/movies", requiresAuth: true },
    { title: "Đang chiếu", link: "/movies" },
  ];

  return (
    <>
      <div className="">
        <div className="relative">
          {isOpen ? (
            <IoIosSearch className="w-6 h-6 cursor-pointer transition-colors duration-300 hover:text-orange-500" />
          ) : (
            <></>
          )}
        </div>
      </div>

      <div
        className={`fixed top-0 left-0 right-0 z-50 
    flex items-center justify-between
    mx-5 mt-3 px-8 py-3
    bg-zinc-800/80 rounded-full
    [box-shadow:var(--shadow-m)]
    backdrop-blur-xl transition-all duration-300`}
      >
        {/* Left Section: Logo + Search */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <Image
              src="/logo.png"
              alt="TicketXpress Logo"
              width={55}
              height={55}
              className="transition-transform duration-300 hover:scale-105"
            />
          </Link>

          <InputGroup
            className="hidden md:flex h-11 w-[20rem] xl:w-[28rem] rounded-full backdrop-blur-md 
      bg-white/10 border border-white/20 overflow-hidden 
      focus-within:border-blue-400 transition-all duration-300 [box-shadow:var(--shadow-s)]"
          >
            <InputGroupInput
              placeholder="Tìm tên phim, diễn viên..."
              className="border-0 bg-transparent text-white placeholder:text-gray-400 
        focus:ring-0 focus:outline-none px-4"
            />
            <InputGroupAddon>
              <SearchIcon className="text-gray-300 hover:text-blue-400 transition-colors duration-300" />
            </InputGroupAddon>
          </InputGroup>
        </div>
        <div>
          <div className="flex items-center gap-4">
            {navigationItems
              .filter((item) => !item.requiresAuth || !!user)
              .map((item, index) => (
                <Link
                  key={index}
                  className="nav-hover-btn"
                  href={item.link}
                  onClick={() => setIsOpen(!isOpen)}
                >
                  {item.title}
                </Link>
              ))}

            <Link
              href="/partner"
              className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-[#F84565] to-[#FF7A45] text-white shadow-lg shadow-[#F84565]/40 transition-transform duration-300 hover:scale-105"
            >
              Đăng ký làm đối tác
            </Link>

            {/* Loading or User or Auth Buttons */}
            {isLoading ? (
              <div className="flex items-center gap-3">
                <div className="w-20 h-9 bg-gray-500/20 rounded-lg animate-pulse" />
                <div className="w-20 h-9 bg-gray-500/20 rounded-lg animate-pulse" />
              </div>
            ) : user ? (
              <UserAvatar />
            ) : (
              <div className="flex items-center gap-3">
                <div className="flex items-center gap-2">
                  <button
                    onClick={() => setShowLoginModal(true)}
                    className="px-5 py-2 rounded-lg text-sm font-medium border border-white/30 
            text-white hover:bg-white/10 transition-all duration-300 hover:scale-105"
                  >
                    Đăng Nhập
                  </button>
                  <button
                    onClick={() => setShowRegisterModal(true)}
                    className="px-5 py-2 rounded-lg text-sm font-medium bg-gradient-to-r 
            from-pink-500 to-red-500 text-white shadow-md hover:shadow-pink-500/30 
            transition-all duration-300 hover:scale-105"
                  >
                    Đăng Ký
                  </button>
                </div>
              </div>
            )}
          </div>
        </div>
      </div>

      {/* Login Modal */}
      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
          onSwitchToRegister={switchToRegister}
        />
      )}

      {/* Register Modal */}
      {showRegisterModal && (
        <RegisterModal
          isOpen={showRegisterModal}
          onClose={() => setShowRegisterModal(false)}
          onSuccess={handleRegistrationSuccess}
          onSwitchToLogin={switchToLogin}
        />
      )}

      {/* Email Verification Modal */}
      {showEmailVerificationModal && (
        <EmailVerificationModal
          isOpen={showEmailVerificationModal}
          onClose={() => setShowEmailVerificationModal(false)}
          userEmail={userEmail}
        />
      )}
    </>
  );
};

export default Header;
