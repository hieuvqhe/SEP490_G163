"use client";

import { useEffect, useState } from "react";
import { useRouter } from "next/navigation";
import { useAuthStore } from "@/store/authStore";
import { Button } from "@/components/ui/button";
import { 
  IoLogOutOutline, 
  IoQrCodeOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoTicketOutline,
  IoPersonOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoFilmOutline,
  IoTimeOutline
} from "react-icons/io5";
import dynamic from "next/dynamic";

// Dynamic import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import("./components/QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#f84565]/30 border-t-[#f84565] rounded-full animate-spin" />
    </div>
  ),
});

interface TicketInfo {
  orderId?: string;
  movieTitle?: string;
  cinemaName?: string;
  screenName?: string;
  showtime?: string;
  seats?: string[];
  customerName?: string;
  customerEmail?: string;
  totalPrice?: number;
  status?: string;
  [key: string]: unknown;
}

const CashierPage = () => {
  const router = useRouter();
  const { user, role, isHydrated, isLoading, logout } = useAuthStore();
  const [scanResult, setScanResult] = useState<string | null>(null);
  const [ticketInfo, setTicketInfo] = useState<TicketInfo | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [scanHistory, setScanHistory] = useState<string[]>([]);

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

  const handleScanSuccess = (decodedText: string) => {
    setScanResult(decodedText);
    setScanError(null);
    
    // Add to history if not duplicate
    if (!scanHistory.includes(decodedText)) {
      setScanHistory(prev => [decodedText, ...prev].slice(0, 10));
    }

    // Try to parse as JSON (ticket info)
    try {
      const parsed = JSON.parse(decodedText);
      setTicketInfo(parsed);
    } catch {
      // If not JSON, just display raw text
      setTicketInfo(null);
    }
  };

  const handleScanError = (error: string) => {
    setScanError(error);
  };

  const handleReset = () => {
    setScanResult(null);
    setTicketInfo(null);
    setScanError(null);
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
        {/* Title */}
        <div className="text-center mb-8">
          <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
            <IoQrCodeOutline className="text-[#f84565]" />
            Quét mã QR vé
          </h2>
          <p className="text-zinc-400">
            Quét mã QR trên vé của khách hàng để xác nhận thông tin
          </p>
        </div>

        {/* Split Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-2 gap-6 lg:gap-8">
          {/* Left Side - QR Scanner */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 lg:p-6">
            <div className="flex items-center gap-2 mb-4">
              <div className="w-8 h-8 bg-[#f84565]/20 rounded-lg flex items-center justify-center">
                <IoQrCodeOutline className="text-[#f84565]" size={18} />
              </div>
              <h3 className="text-lg font-semibold text-white">Quét mã QR</h3>
            </div>
            
            <QRScanner
              onScanSuccess={handleScanSuccess}
              onScanError={handleScanError}
            />

            {scanError && (
              <div className="mt-4 p-3 bg-red-500/10 border border-red-500/30 rounded-xl">
                <p className="text-red-400 text-sm">{scanError}</p>
              </div>
            )}
          </div>

          {/* Right Side - Scan Result */}
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-4 lg:p-6">
            <div className="flex items-center justify-between mb-4">
              <div className="flex items-center gap-2">
                <div className="w-8 h-8 bg-green-500/20 rounded-lg flex items-center justify-center">
                  <IoCheckmarkCircleOutline className="text-green-500" size={18} />
                </div>
                <h3 className="text-lg font-semibold text-white">Kết quả quét</h3>
              </div>
              {scanResult && (
                <button
                  onClick={handleReset}
                  className="flex items-center gap-1 px-3 py-1.5 text-sm bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
                >
                  <IoRefreshOutline size={16} />
                  Quét lại
                </button>
              )}
            </div>

            {!scanResult ? (
              <div className="flex flex-col items-center justify-center h-64 lg:h-80 text-center">
                <div className="w-20 h-20 bg-zinc-700/50 rounded-full flex items-center justify-center mb-4">
                  <IoTicketOutline className="text-zinc-500" size={40} />
                </div>
                <p className="text-zinc-400 mb-2">Chưa có dữ liệu</p>
                <p className="text-zinc-500 text-sm">
                  Quét mã QR để xem thông tin vé
                </p>
              </div>
            ) : ticketInfo ? (
              /* Parsed Ticket Info */
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-green-400">
                    <IoCheckmarkCircleOutline size={20} />
                    <span className="font-medium">Quét thành công!</span>
                  </div>
                </div>

                <div className="grid gap-3">
                  {ticketInfo.orderId && (
                    <div className="flex items-start gap-3 p-3 bg-zinc-700/50 rounded-xl">
                      <IoTicketOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Mã đơn hàng</p>
                        <p className="text-white font-medium">{ticketInfo.orderId}</p>
                      </div>
                    </div>
                  )}

                  {ticketInfo.movieTitle && (
                    <div className="flex items-start gap-3 p-3 bg-zinc-700/50 rounded-xl">
                      <IoFilmOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Phim</p>
                        <p className="text-white font-medium">{ticketInfo.movieTitle}</p>
                      </div>
                    </div>
                  )}

                  {ticketInfo.cinemaName && (
                    <div className="flex items-start gap-3 p-3 bg-zinc-700/50 rounded-xl">
                      <IoLocationOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Rạp chiếu</p>
                        <p className="text-white font-medium">
                          {ticketInfo.cinemaName}
                          {ticketInfo.screenName && ` - ${ticketInfo.screenName}`}
                        </p>
                      </div>
                    </div>
                  )}

                  {ticketInfo.showtime && (
                    <div className="flex items-start gap-3 p-3 bg-zinc-700/50 rounded-xl">
                      <IoCalendarOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Suất chiếu</p>
                        <p className="text-white font-medium">{ticketInfo.showtime}</p>
                      </div>
                    </div>
                  )}

                  {ticketInfo.seats && ticketInfo.seats.length > 0 && (
                    <div className="flex items-start gap-3 p-3 bg-zinc-700/50 rounded-xl">
                      <IoTimeOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Ghế</p>
                        <p className="text-white font-medium">{ticketInfo.seats.join(", ")}</p>
                      </div>
                    </div>
                  )}

                  {ticketInfo.customerName && (
                    <div className="flex items-start gap-3 p-3 bg-zinc-700/50 rounded-xl">
                      <IoPersonOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Khách hàng</p>
                        <p className="text-white font-medium">{ticketInfo.customerName}</p>
                        {ticketInfo.customerEmail && (
                          <p className="text-zinc-400 text-sm">{ticketInfo.customerEmail}</p>
                        )}
                      </div>
                    </div>
                  )}

                  {ticketInfo.totalPrice !== undefined && (
                    <div className="flex items-start gap-3 p-3 bg-[#f84565]/10 border border-[#f84565]/30 rounded-xl">
                      <IoTicketOutline className="text-[#f84565] mt-0.5" size={20} />
                      <div>
                        <p className="text-zinc-400 text-sm">Tổng tiền</p>
                        <p className="text-[#f84565] font-bold text-lg">
                          {ticketInfo.totalPrice.toLocaleString("vi-VN")}đ
                        </p>
                      </div>
                    </div>
                  )}
                </div>

                {/* Show any other fields */}
                {Object.keys(ticketInfo).filter(key => 
                  !["orderId", "movieTitle", "cinemaName", "screenName", "showtime", "seats", "customerName", "customerEmail", "totalPrice", "status"].includes(key)
                ).length > 0 && (
                  <div className="mt-4 p-3 bg-zinc-700/30 rounded-xl">
                    <p className="text-zinc-400 text-sm mb-2">Thông tin khác:</p>
                    <pre className="text-xs text-zinc-300 overflow-x-auto">
                      {JSON.stringify(
                        Object.fromEntries(
                          Object.entries(ticketInfo).filter(([key]) => 
                            !["orderId", "movieTitle", "cinemaName", "screenName", "showtime", "seats", "customerName", "customerEmail", "totalPrice", "status"].includes(key)
                          )
                        ),
                        null,
                        2
                      )}
                    </pre>
                  </div>
                )}
              </div>
            ) : (
              /* Raw QR Data */
              <div className="space-y-4">
                <div className="p-4 bg-green-500/10 border border-green-500/30 rounded-xl">
                  <div className="flex items-center gap-2 text-green-400">
                    <IoCheckmarkCircleOutline size={20} />
                    <span className="font-medium">Quét thành công!</span>
                  </div>
                </div>

                <div className="p-4 bg-zinc-700/50 rounded-xl">
                  <p className="text-zinc-400 text-sm mb-2">Nội dung QR:</p>
                  <div className="p-3 bg-zinc-800 rounded-lg border border-zinc-600">
                    <p className="text-white break-all font-mono text-sm">{scanResult}</p>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>

        {/* Instructions */}
        <div className="mt-8 bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 lg:p-6">
          <div className="flex items-center gap-2 mb-4">
            <IoInformationCircleOutline className="text-blue-400" size={24} />
            <h3 className="text-lg font-semibold text-white">Hướng dẫn quét mã QR</h3>
          </div>
          
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#f84565]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#f84565] font-bold">1</span>
              </div>
              <div>
                <p className="text-white font-medium">Bắt đầu quét</p>
                <p className="text-zinc-400 text-sm">
                  Nhấn nút &quot;Bắt đầu quét&quot; để mở camera hoặc tải ảnh chứa mã QR
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#f84565]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#f84565] font-bold">2</span>
              </div>
              <div>
                <p className="text-white font-medium">Đưa mã QR vào khung</p>
                <p className="text-zinc-400 text-sm">
                  Đặt mã QR trên vé vào vùng quét của camera sao cho rõ ràng
                </p>
              </div>
            </div>

            <div className="flex items-start gap-3">
              <div className="w-8 h-8 bg-[#f84565]/20 rounded-full flex items-center justify-center flex-shrink-0">
                <span className="text-[#f84565] font-bold">3</span>
              </div>
              <div>
                <p className="text-white font-medium">Xác nhận thông tin</p>
                <p className="text-zinc-400 text-sm">
                  Kiểm tra thông tin vé hiển thị bên phải và xác nhận với khách hàng
                </p>
              </div>
            </div>
          </div>

          <div className="mt-4 p-3 bg-yellow-500/10 border border-yellow-500/30 rounded-xl">
            <p className="text-yellow-400 text-sm">
              <strong>Lưu ý:</strong> Đảm bảo ánh sáng đủ và mã QR không bị nhòe hoặc hư hỏng để quét chính xác.
            </p>
          </div>
        </div>

        {/* Scan History */}
        {scanHistory.length > 0 && (
          <div className="mt-6 bg-zinc-800/50 border border-zinc-700 rounded-2xl p-4 lg:p-6">
            <h3 className="text-lg font-semibold text-white mb-4">Lịch sử quét gần đây</h3>
            <div className="space-y-2 max-h-40 overflow-y-auto">
              {scanHistory.map((item, index) => (
                <div
                  key={index}
                  className="p-2 bg-zinc-700/30 rounded-lg text-sm text-zinc-300 truncate cursor-pointer hover:bg-zinc-700/50 transition-colors"
                  onClick={() => handleScanSuccess(item)}
                >
                  {item.length > 100 ? `${item.substring(0, 100)}...` : item}
                </div>
              ))}
            </div>
          </div>
        )}
      </main>
    </div>
  );
};

export default CashierPage;
