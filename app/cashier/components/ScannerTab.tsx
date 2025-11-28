"use client";

import { useState } from "react";
import { 
  IoQrCodeOutline,
  IoCheckmarkCircleOutline,
  IoInformationCircleOutline,
  IoRefreshOutline,
  IoTicketOutline,
  IoCalendarOutline,
  IoLocationOutline,
  IoFilmOutline,
  IoTimeOutline,
  IoCloseCircleOutline,
  IoWarningOutline,
} from "react-icons/io5";
import dynamic from "next/dynamic";
import { 
  useScanTicket,
  type ScanTicketResult,
} from "@/apis/cashier.api";

// Dynamic import QRScanner to avoid SSR issues
const QRScanner = dynamic(() => import("./QRScanner"), {
  ssr: false,
  loading: () => (
    <div className="flex items-center justify-center h-64">
      <div className="w-8 h-8 border-4 border-[#f84565]/30 border-t-[#f84565] rounded-full animate-spin" />
    </div>
  ),
});

interface ScannerTabProps {
  accessToken: string;
}

const ScannerTab = ({ accessToken }: ScannerTabProps) => {
  const [scanResult, setScanResult] = useState<ScanTicketResult | null>(null);
  const [scanError, setScanError] = useState<string | null>(null);
  const [isProcessing, setIsProcessing] = useState(false);

  const scanTicketMutation = useScanTicket();

  const formatDateTime = (dateString: string) => {
    const date = new Date(dateString);
    return date.toLocaleString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
      year: "numeric",
      hour: "2-digit",
      minute: "2-digit",
    });
  };

  const getCheckInStatusColor = (status: string) => {
    switch (status) {
      case "FULLY_CHECKED_IN":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "PARTIAL_CHECKED_IN":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
    }
  };

  const getCheckInStatusText = (status: string) => {
    switch (status) {
      case "FULLY_CHECKED_IN":
        return "Đã check-in đầy đủ";
      case "PARTIAL_CHECKED_IN":
        return "Check-in một phần";
      default:
        return "Chưa check-in";
    }
  };

  const handleScanSuccess = async (decodedText: string) => {
    if (!accessToken || isProcessing) return;

    setIsProcessing(true);
    setScanError(null);
    setScanResult(null);

    try {
      const response = await scanTicketMutation.mutateAsync({
        data: { qrCode: decodedText },
        accessToken,
      });

      setScanResult(response.result);
    } catch (error: unknown) {
      const apiError = error as { message?: string };
      setScanError(apiError?.message || "Có lỗi xảy ra khi quét vé");
    } finally {
      setIsProcessing(false);
    }
  };

  const handleScanError = (error: string) => {
    setScanError(error);
  };

  const handleReset = () => {
    setScanResult(null);
    setScanError(null);
  };

  return (
    <>
      {/* Title */}
      <div className="text-center mb-4">
        <h2 className="text-xl lg:text-2xl font-bold text-white mb-1 flex items-center justify-center gap-2">
          <IoQrCodeOutline className="text-[#f84565]" />
          Quét mã QR vé
        </h2>
        <p className="text-zinc-400 text-sm">
          Quét mã QR trên vé của khách hàng để xác nhận check-in
        </p>
      </div>

      {/* Split Layout */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-4 lg:gap-6">
        {/* Left Side - QR Scanner */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 lg:p-4">
          <div className="flex items-center gap-2 mb-3">
            <div className="w-7 h-7 bg-[#f84565]/20 rounded-lg flex items-center justify-center">
              <IoQrCodeOutline className="text-[#f84565]" size={16} />
            </div>
            <h3 className="text-base font-semibold text-white">Quét mã QR</h3>
          </div>
          
          <QRScanner
            onScanSuccess={handleScanSuccess}
            onScanError={handleScanError}
          />

          {isProcessing && (
            <div className="mt-3 p-2 bg-blue-500/10 border border-blue-500/30 rounded-lg flex items-center gap-2">
              <div className="w-4 h-4 border-2 border-blue-400/30 border-t-blue-400 rounded-full animate-spin" />
              <p className="text-blue-400 text-xs">Đang xử lý...</p>
            </div>
          )}

          {scanError && (
            <div className="mt-3 p-2 bg-red-500/10 border border-red-500/30 rounded-lg flex items-center gap-2">
              <IoCloseCircleOutline className="text-red-400 flex-shrink-0" size={16} />
              <p className="text-red-400 text-xs">{scanError}</p>
            </div>
          )}
        </div>

        {/* Right Side - Scan Result */}
        <div className="bg-zinc-800 border border-zinc-700 rounded-xl p-3 lg:p-4">
          <div className="flex items-center justify-between mb-3">
            <div className="flex items-center gap-2">
              <div className="w-7 h-7 bg-green-500/20 rounded-lg flex items-center justify-center">
                <IoCheckmarkCircleOutline className="text-green-500" size={16} />
              </div>
              <h3 className="text-base font-semibold text-white">Kết quả quét</h3>
            </div>
            {scanResult && (
              <button
                onClick={handleReset}
                className="flex items-center gap-1 px-2 py-1 text-xs bg-zinc-700 hover:bg-zinc-600 text-white rounded-lg transition-colors"
              >
                <IoRefreshOutline size={14} />
                Quét lại
              </button>
            )}
          </div>

          {!scanResult ? (
            <div className="flex flex-col items-center justify-center h-48 text-center">
              <div className="w-14 h-14 bg-zinc-700/50 rounded-full flex items-center justify-center mb-3">
                <IoTicketOutline className="text-zinc-500" size={28} />
              </div>
              <p className="text-zinc-400 text-sm mb-1">Chưa có dữ liệu</p>
              <p className="text-zinc-500 text-xs">
                Quét mã QR để xem thông tin vé
              </p>
            </div>
          ) : (
            /* Parsed Ticket Info from API */
            <div className="space-y-2">
              {/* Success/Warning Banner */}
              {scanResult.ticketInfo.isAlreadyCheckedIn ? (
                <div className="p-2 bg-yellow-500/10 border border-yellow-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-yellow-400">
                    <IoWarningOutline size={16} />
                    <span className="text-sm font-medium">Vé đã được check-in trước đó!</span>
                  </div>
                </div>
              ) : (
                <div className="p-2 bg-green-500/10 border border-green-500/30 rounded-lg">
                  <div className="flex items-center gap-2 text-green-400">
                    <IoCheckmarkCircleOutline size={16} />
                    <span className="text-sm font-medium">Check-in thành công!</span>
                  </div>
                </div>
              )}

              <div className="grid grid-cols-2 gap-2">
                {/* Movie */}
                <div className="flex items-start gap-2 p-2 bg-zinc-700/50 rounded-lg">
                  <IoFilmOutline className="text-[#f84565] mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-zinc-400 text-xs">Phim</p>
                    <p className="text-white text-sm font-medium truncate">{scanResult.ticketInfo.movieName}</p>
                  </div>
                </div>

                {/* Cinema */}
                <div className="flex items-start gap-2 p-2 bg-zinc-700/50 rounded-lg">
                  <IoLocationOutline className="text-[#f84565] mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-zinc-400 text-xs">Rạp chiếu</p>
                    <p className="text-white text-sm font-medium truncate">{scanResult.ticketInfo.cinemaName}</p>
                  </div>
                </div>

                {/* Showtime */}
                <div className="flex items-start gap-2 p-2 bg-zinc-700/50 rounded-lg">
                  <IoCalendarOutline className="text-[#f84565] mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-zinc-400 text-xs">Suất chiếu</p>
                    <p className="text-white text-sm font-medium">
                      {formatDateTime(scanResult.ticketInfo.showtimeStart)}
                    </p>
                  </div>
                </div>

                {/* Seat */}
                <div className="flex items-start gap-2 p-2 bg-zinc-700/50 rounded-lg">
                  <IoTicketOutline className="text-[#f84565] mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-zinc-400 text-xs">Ghế</p>
                    <p className="text-white text-sm font-medium">{scanResult.ticketInfo.seatName}</p>
                  </div>
                </div>

                {/* Booking Code */}
                <div className="flex items-start gap-2 p-2 bg-zinc-700/50 rounded-lg">
                  <IoQrCodeOutline className="text-[#f84565] mt-0.5 flex-shrink-0" size={16} />
                  <div className="min-w-0">
                    <p className="text-zinc-400 text-xs">Mã đặt vé</p>
                    <p className="text-white text-sm font-medium font-mono truncate">{scanResult.ticketInfo.bookingCode}</p>
                  </div>
                </div>

                {/* Check-in Time */}
                <div className="flex items-start gap-2 p-2 bg-zinc-700/50 rounded-lg">
                  <IoTimeOutline className="text-[#f84565] mt-0.5 flex-shrink-0" size={16} />
                  <div>
                    <p className="text-zinc-400 text-xs">Check-in</p>
                    <p className="text-white text-sm font-medium">
                      {formatDateTime(scanResult.ticketInfo.checkInTime)}
                    </p>
                  </div>
                </div>
              </div>

              {/* Booking Status Summary */}
              <div className="p-2 bg-[#f84565]/10 border border-[#f84565]/30 rounded-lg">
                <div className="flex items-center justify-between">
                  <span className={`px-2 py-0.5 rounded text-xs border ${getCheckInStatusColor(scanResult.bookingStatus.bookingStatus)}`}>
                    {getCheckInStatusText(scanResult.bookingStatus.bookingStatus)}
                  </span>
                  <span className="text-white text-sm">
                    <span className="text-green-400 font-bold">{scanResult.bookingStatus.checkedInTickets}</span>
                    <span className="text-zinc-400"> / </span>
                    <span className="font-bold">{scanResult.bookingStatus.totalTickets}</span>
                    <span className="text-zinc-400 text-xs ml-1">vé</span>
                  </span>
                </div>
              </div>
            </div>
          )}
        </div>
      </div>

      {/* Instructions */}
      <div className="mt-4 bg-zinc-800/50 border border-zinc-700 rounded-xl p-3 lg:p-4">
        <div className="flex items-center gap-2 mb-3">
          <IoInformationCircleOutline className="text-blue-400" size={18} />
          <h3 className="text-sm font-semibold text-white">Hướng dẫn quét mã QR</h3>
        </div>
        
        <div className="grid grid-cols-1 md:grid-cols-3 gap-3">
          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-[#f84565]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#f84565] text-xs font-bold">1</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Bắt đầu quét</p>
              <p className="text-zinc-400 text-xs">
                Nhấn nút để mở camera hoặc tải ảnh QR
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-[#f84565]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#f84565] text-xs font-bold">2</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Đưa mã QR vào khung</p>
              <p className="text-zinc-400 text-xs">
                Đặt mã QR vào vùng quét rõ ràng
              </p>
            </div>
          </div>

          <div className="flex items-start gap-2">
            <div className="w-6 h-6 bg-[#f84565]/20 rounded-full flex items-center justify-center flex-shrink-0">
              <span className="text-[#f84565] text-xs font-bold">3</span>
            </div>
            <div>
              <p className="text-white text-sm font-medium">Xác nhận check-in</p>
              <p className="text-zinc-400 text-xs">
                Hệ thống tự động check-in
              </p>
            </div>
          </div>
        </div>
      </div>
    </>
  );
};

export default ScannerTab;
