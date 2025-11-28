"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { 
  IoLogOutOutline, 
  IoQrCodeOutline,
  IoLocationOutline,
  IoListOutline,
} from "react-icons/io5";
import { useGetCashierCinema } from "@/apis/cashier.api";
import ScannerTab from "./components/ScannerTab";
import HistoryTab from "./components/HistoryTab";

type TabType = "scanner" | "history";

const CashierPage = () => {
  const router = useRouter();
  const { user, role, isHydrated, isLoading, logout, accessToken } = useAuthStore();
  const [activeTab, setActiveTab] = useState<TabType>("scanner");

  // API Hooks
  const { data: cinemaData, isLoading: isCinemaLoading } = useGetCashierCinema(accessToken || undefined);

  useEffect(() => {
    if (!isHydrated || isLoading) return;

    // Redirect nếu không đăng nhập hoặc không phải Cashier
    if (!user || !role) {
      router.push("/");
      return;
    }

    const roleLower = role.toLowerCase();
    if (roleLower !== "cashier") {
      switch (roleLower) {
        case "admin":
          router.push("/admin");
          break;
        case "partner":
          router.push("/partner");
          break;
        case "manager":
          router.push("/manager");
          break;
        default:
          router.push("/");
          break;
      }
    }
  }, [user, role, isHydrated, isLoading, router]);

  const handleLogout = () => {
    logout();
    router.push("/");
  };

  // Loading state
  if (!isHydrated || isLoading) {
    return (
      <div className="min-h-screen bg-zinc-900 flex items-center justify-center">
        <div className="flex flex-col items-center gap-4">
          <div className="w-10 h-10 border-4 border-[#f84565]/30 border-t-[#f84565] rounded-full animate-spin" />
          <p className="text-zinc-400">Đang tải...</p>
        </div>
      </div>
    );
  }

  // Not authorized
  if (!user || role?.toLowerCase() !== "cashier") {
    return null;
  }

  const cinema = cinemaData?.result;

  return (
    <div className="min-h-screen bg-zinc-900">
      {/* Header */}
      <header className="bg-zinc-800 border-b border-zinc-700 px-4 lg:px-6 py-4 sticky top-0 z-10">
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="w-10 h-10 bg-gradient-to-br from-[#f84565] to-[#ff6b8a] rounded-lg flex items-center justify-center">
              <span className="text-white font-bold text-lg">TX</span>
            </div>
            <div className="hidden sm:block">
              <h1 className="text-white font-bold text-xl">TicketXpress</h1>
              <p className="text-zinc-400 text-sm">Cashier - {user.fullname}</p>
            </div>
          </div>
          <Button
            variant="outline"
            onClick={handleLogout}
            className="flex items-center gap-2 bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
          >
            <IoLogOutOutline size={18} />
            <span className="hidden sm:inline">Đăng xuất</span>
          </Button>
        </div>
      </header>

      {/* Main Content */}
      <main className="max-w-7xl mx-auto px-4 lg:px-6 py-6 lg:py-10">
        {/* Cashier & Cinema Info */}
        <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-2xl p-4 lg:p-6">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <div className="flex items-center gap-4">
              {cinema?.logoUrl ? (
                <img 
                  src={cinema.logoUrl} 
                  alt={cinema.cinemaName}
                  className="w-16 h-16 rounded-xl object-cover border border-zinc-600"
                />
              ) : (
                <div className="w-16 h-16 bg-gradient-to-br from-[#f84565] to-[#ff6b8a] rounded-xl flex items-center justify-center">
                  <IoLocationOutline className="text-white" size={28} />
                </div>
              )}
              <div>
                <p className="text-zinc-400 text-sm">Thu ngân tại</p>
                {isCinemaLoading ? (
                  <div className="h-6 w-48 bg-zinc-700 animate-pulse rounded" />
                ) : cinema ? (
                  <>
                    <h2 className="text-xl font-bold text-white">{cinema.cinemaName}</h2>
                    <p className="text-zinc-400 text-sm">
                      {cinema.address}, {cinema.district}, {cinema.city}
                    </p>
                  </>
                ) : (
                  <p className="text-yellow-400">Chưa được phân công rạp</p>
                )}
              </div>
            </div>
            {cinema && (
              <div className="flex flex-wrap gap-3 text-sm">
                <div className="px-3 py-1.5 bg-zinc-700/50 rounded-lg">
                  <span className="text-zinc-400">Mã rạp: </span>
                  <span className="text-white font-medium">{cinema.code}</span>
                </div>
                {cinema.phone && (
                  <div className="px-3 py-1.5 bg-zinc-700/50 rounded-lg">
                    <span className="text-zinc-400">SĐT: </span>
                    <span className="text-white font-medium">{cinema.phone}</span>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>

        {/* Tabs */}
        <div className="flex gap-2 mb-6">
          <button
            onClick={() => setActiveTab("scanner")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === "scanner"
                ? "bg-[#f84565] text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <IoQrCodeOutline size={20} />
            Quét vé
          </button>
          <button
            onClick={() => setActiveTab("history")}
            className={`flex items-center gap-2 px-4 py-2.5 rounded-xl font-medium transition-colors ${
              activeTab === "history"
                ? "bg-[#f84565] text-white"
                : "bg-zinc-800 text-zinc-400 hover:bg-zinc-700 hover:text-white"
            }`}
          >
            <IoListOutline size={20} />
            Lịch sử quét vé
          </button>
        </div>

        {/* Tab Content */}
        {activeTab === "scanner" ? (
          <ScannerTab accessToken={accessToken || ""} />
        ) : (
          <HistoryTab accessToken={accessToken || ""} />
        )}
      </main>
    </div>
  );
};

export default CashierPage;
