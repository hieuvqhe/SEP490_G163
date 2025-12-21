"use client";

import { IoIosSearch } from "react-icons/io";
import { useState, useEffect, useRef } from "react";
import Link from "next/link";
import Image from "next/image";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { getAllMovies } from "@/apis/movie.api";
import type { Movie } from "@/types/movie.type";
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
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

const Header = () => {
  const router = useRouter();
  const searchRef = useRef<HTMLDivElement>(null);
  const [isOpen, setIsOpen] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showLoginModal, setShowLoginModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] =
    useState(false);
  const [userEmail, setUserEmail] = useState("");
  const [isScrolled, setIsScrolled] = useState(false);
  const [searchQuery, setSearchQuery] = useState("");
  const [showSearchDropdown, setShowSearchDropdown] = useState(false);
  const { user, accessToken, isLoading, isHydrated, clearAuth } =
    useAuthStore();

  // Track scroll position for header background
  useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  // Search suggestions API call
  const { data: searchResults, isFetching: isSearching } = useQuery({
    queryKey: ["search-suggestions", searchQuery],
    queryFn: () => getAllMovies({
      search: searchQuery,
      limit: 5,
      status: "now_showing",
      sort_by: "average_rating",
      sort_order: "desc",
    }),
    enabled: searchQuery.trim().length > 0,
    staleTime: 1000 * 60,
  });

  const searchSuggestions = searchResults?.result?.movies || [];

  // Close dropdown when clicking outside
  useEffect(() => {
    const handleClickOutside = (event: MouseEvent) => {
      if (searchRef.current && !searchRef.current.contains(event.target as Node)) {
        setShowSearchDropdown(false);
      }
    };

    document.addEventListener("mousedown", handleClickOutside);
    return () => document.removeEventListener("mousedown", handleClickOutside);
  }, []);

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

    const role = data.result.role;

    // Chỉ redirect nếu là admin/partner/manager/cashier/managerstaff
    // User thường sẽ ở lại trang hiện tại
    if (role) {
      const roleLower = role.toLowerCase();
      
      switch (roleLower) {
        case "admin":
          window.location.href = "/admin";
          break;
        case "partner":
          window.location.href = "/partner";
          break;
        case "manager":
        case "managerstaff":
          window.location.href = "/manager";
          break;
        case "cashier":
          window.location.href = "/cashier";
          break;
        case "user":
        default:
          // Ở lại trang hiện tại, chỉ reload để cập nhật state
          window.location.reload();
          break;
      }
    } else {
      window.location.reload();
    }
  };

  const switchToLogin = () => {
    setShowRegisterModal(false);
    setShowLoginModal(true);
  };

  const switchToRegister = () => {
    setShowLoginModal(false);
    setShowRegisterModal(true);
  };

  const handleSearch = (e: React.KeyboardEvent<HTMLInputElement>) => {
    if (e.key === "Enter" && searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleSearchClick = () => {
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const handleSearchInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const value = e.target.value;
    setSearchQuery(value);
    setShowSearchDropdown(value.trim().length > 0);
  };

  const handleMovieClick = (movieId: number) => {
    setSearchQuery("");
    setShowSearchDropdown(false);
    router.push(`/movie/${movieId}`);
  };

  const handleViewAllResults = () => {
    if (searchQuery.trim()) {
      router.push(`/movies?search=${encodeURIComponent(searchQuery.trim())}`);
      setSearchQuery("");
      setShowSearchDropdown(false);
    }
  };

  const navigationItems = [
    { title: "Trang chủ", link: "/" },
    { title: "Lịch chiếu", link: "/showtimes" },
    // { title: "Điểm Thưởng", link: "/movies", requiresAuth: true },
    // { title: "Yêu Thích", link: "/movies", requiresAuth: true },
    { title: "Đang chiếu", link: "/movies" },
  ];

  return (
    <>
      <div
        className={`fixed top-0 left-0 right-0 z-50 
    flex items-center justify-between
    mx-5 mt-3 px-8 py-3
    rounded-full
    [box-shadow:var(--shadow-m-inner)]
    backdrop-blur-xl transition-all duration-500
    ${isScrolled 
      ? 'bg-zinc-800/90 border border-white/10' 
      : ' bg-zinc-800/30 border border-white/0'
    }`}
      >
        {/* Left Section: Logo + Search */}
        <div className="flex items-center gap-8">
          <Link href="/" className="flex items-center gap-2">
            <h1
              className={`${pacifico.className} text-xl font-bold text-white drop-shadow-lg`}
            >
              TicketXpress
            </h1>
          </Link>

          <div ref={searchRef} className="relative">
            <InputGroup
              className="hidden md:flex h-11 w-[20rem] xl:w-[28rem] rounded-full backdrop-blur-md 
        bg-white/10 border border-white/20 overflow-hidden 
        focus-within:border-blue-400 transition-all duration-300"
            >
              <InputGroupInput
                placeholder="Tìm tên phim"
                value={searchQuery}
                onChange={handleSearchInputChange}
                onKeyDown={handleSearch}
                onFocus={() => searchQuery.trim() && setShowSearchDropdown(true)}
                className="border-0 bg-transparent text-white placeholder:text-gray-400 
          focus:ring-0 focus:outline-none px-4"
              />
              <InputGroupAddon className="cursor-pointer" onClick={handleSearchClick}>
                <SearchIcon className="text-gray-300 hover:text-blue-400 transition-colors duration-300" />
              </InputGroupAddon>
            </InputGroup>

            {/* Search Dropdown */}
            {showSearchDropdown && searchQuery.trim() && (
             <div className="absolute top-full mt-2 w-full bg-black border border-white/20 rounded-2xl overflow-hidden shadow-2xl z-50">
                {isSearching ? (
                  <div className="p-4 text-center text-gray-400">
                    <div className="animate-spin w-5 h-5 border-2 border-primary border-t-transparent rounded-full mx-auto" />
                  </div>
                ) : searchSuggestions.length > 0 ? (
                  <>
                    <div className="max-h-[400px] overflow-y-auto">
                      {searchSuggestions.map((movie: Movie) => (
                        <div
                          key={movie.movieId}
                          onClick={() => handleMovieClick(movie.movieId)}
                          className="flex items-center gap-3 p-3 hover:bg-white/10 cursor-pointer transition-colors border-b border-white/5 last:border-b-0"
                        >
                          <img
                            src={movie.posterUrl}
                            alt={movie.title}
                            className="w-12 h-16 object-cover rounded"
                          />
                          <div className="flex-1 min-w-0">
                            <h4 className="text-white font-medium truncate">{movie.title}</h4>
                            <p className="text-xs text-gray-400 truncate">{movie.genre}</p>
                            <div className="flex items-center gap-2 mt-1">
                              <span className="text-xs text-yellow-400">⭐ {movie.averageRating?.toFixed(1)}</span>
                              <span className="text-xs text-gray-500">{movie.durationMinutes} phút</span>
                            </div>
                          </div>
                        </div>
                      ))}
                    </div>
                    <button
                      onClick={handleViewAllResults}
                      className="w-full p-3 text-center text-primary hover:bg-white/5 transition-colors font-medium text-sm"
                    >
                      Xem tất cả kết quả →
                    </button>
                  </>
                ) : (
                  <div className="p-4 text-center text-gray-400 text-sm">
                    Không tìm thấy phim nào
                  </div>
                )}
              </div>
            )}
          </div>
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

            {!user && (
              <Link
                href="/partner"
                className="px-5 py-2 rounded-full font-semibold text-sm bg-gradient-to-r from-[#F84565] to-[#FF7A45] text-white shadow-lg shadow-[#F84565]/40 transition-transform duration-300 hover:scale-105"
              >
                Đăng ký làm đối tác
              </Link>
            )}

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
