"use client";

import { useState } from "react";
import { Button } from "@/components/ui/button";
import { 
  IoTicketOutline,
  IoPersonOutline,
  IoLocationOutline,
  IoFilmOutline,
  IoListOutline,
  IoChevronDownOutline,
  IoChevronUpOutline,
  IoSearchOutline,
  IoCheckmarkCircleOutline,
} from "react-icons/io5";
import { 
  useGetCashierBookings, 
  useGetBookingDetail,
  type CashierBooking,
  type GetCashierBookingsParams,
} from "@/apis/cashier.api";

interface HistoryTabProps {
  accessToken: string;
}

const HistoryTab = ({ accessToken }: HistoryTabProps) => {
  const [historyParams, setHistoryParams] = useState<GetCashierBookingsParams>({
    page: 1,
    pageSize: 10,
    sortBy: 'booking_time',
    sortOrder: 'desc',
  });
  const [searchCode, setSearchCode] = useState("");
  const [expandedBookingId, setExpandedBookingId] = useState<number | null>(null);

  // API Hooks
  const { data: bookingsData, isLoading: isBookingsLoading } = useGetCashierBookings(historyParams, accessToken);
  const { data: bookingDetailData, isLoading: isDetailLoading } = useGetBookingDetail(
    expandedBookingId || 0, 
    accessToken
  );

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

  const formatCurrency = (amount: number) => {
    return amount.toLocaleString("vi-VN") + "đ";
  };

  const getStatusColor = (status: string) => {
    switch (status.toUpperCase()) {
      case "CONFIRMED":
      case "COMPLETED":
        return "text-green-400 bg-green-500/10 border-green-500/30";
      case "PENDING":
        return "text-yellow-400 bg-yellow-500/10 border-yellow-500/30";
      case "CANCELLED":
        return "text-red-400 bg-red-500/10 border-red-500/30";
      default:
        return "text-zinc-400 bg-zinc-500/10 border-zinc-500/30";
    }
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

  const handleSearch = () => {
    setHistoryParams(prev => ({
      ...prev,
      page: 1,
      bookingCode: searchCode || undefined,
      orderCode: searchCode || undefined,
    }));
  };

  const handleClearSearch = () => {
    setSearchCode("");
    setHistoryParams(prev => ({
      ...prev,
      page: 1,
      bookingCode: undefined,
      orderCode: undefined,
    }));
  };

  const handlePageChange = (newPage: number) => {
    setHistoryParams(prev => ({ ...prev, page: newPage }));
    setExpandedBookingId(null);
  };

  const toggleBookingDetail = (bookingId: number) => {
    setExpandedBookingId(expandedBookingId === bookingId ? null : bookingId);
  };

  return (
    <>
      {/* Title */}
      <div className="text-center mb-8">
        <h2 className="text-2xl lg:text-3xl font-bold text-white mb-2 flex items-center justify-center gap-3">
          <IoListOutline className="text-[#f84565]" />
          Lịch sử quét vé
        </h2>
        <p className="text-zinc-400">
          Xem danh sách các vé đã quét tại rạp
        </p>
      </div>

      {/* Search Bar */}
      <div className="mb-6 bg-zinc-800 border border-zinc-700 rounded-xl p-4">
        <div className="flex flex-col sm:flex-row gap-3">
          <div className="flex-1 relative">
            <IoSearchOutline className="absolute left-3 top-1/2 -translate-y-1/2 text-zinc-400" size={20} />
            <input
              type="text"
              value={searchCode}
              onChange={(e) => setSearchCode(e.target.value)}
              onKeyDown={(e) => e.key === 'Enter' && handleSearch()}
              placeholder="Tìm theo mã đặt vé hoặc mã đơn hàng..."
              className="w-full pl-10 pr-4 py-2.5 bg-zinc-700 border border-zinc-600 rounded-lg text-white placeholder:text-zinc-400 focus:outline-none focus:border-[#f84565]"
            />
          </div>
          <div className="flex gap-2">
            <Button
              onClick={handleSearch}
              className="bg-[#f84565] hover:bg-[#f84565]/90 text-white"
            >
              <IoSearchOutline size={18} className="mr-1" />
              Tìm kiếm
            </Button>
            {(historyParams.bookingCode || historyParams.orderCode) && (
              <Button
                variant="outline"
                onClick={handleClearSearch}
                className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white"
              >
                Xóa lọc
              </Button>
            )}
          </div>
        </div>
      </div>

      {/* Bookings List */}
      <div className="space-y-4">
        {isBookingsLoading ? (
          <div className="flex items-center justify-center py-12">
            <div className="w-8 h-8 border-4 border-[#f84565]/30 border-t-[#f84565] rounded-full animate-spin" />
          </div>
        ) : !bookingsData?.result?.items?.length ? (
          <div className="bg-zinc-800 border border-zinc-700 rounded-2xl p-8 text-center">
            <div className="w-20 h-20 bg-zinc-700/50 rounded-full flex items-center justify-center mx-auto mb-4">
              <IoTicketOutline className="text-zinc-500" size={40} />
            </div>
            <p className="text-zinc-400 mb-2">Không có dữ liệu</p>
            <p className="text-zinc-500 text-sm">
              {historyParams.bookingCode || historyParams.orderCode
                ? "Không tìm thấy đơn hàng phù hợp"
                : "Chưa có đơn hàng nào được quét"}
            </p>
          </div>
        ) : (
          <>
            {bookingsData.result.items.map((booking: CashierBooking) => (
              <div
                key={booking.bookingId}
                className="bg-zinc-800 border border-zinc-700 rounded-2xl overflow-hidden"
              >
                {/* Booking Header */}
                <div
                  className="p-4 cursor-pointer hover:bg-zinc-700/50 transition-colors"
                  onClick={() => toggleBookingDetail(booking.bookingId)}
                >
                  <div className="flex flex-col md:flex-row md:items-center justify-between gap-3">
                    <div className="flex items-center gap-4">
                      {booking.movie.posterUrl ? (
                        <img
                          src={booking.movie.posterUrl}
                          alt={booking.movie.title}
                          className="w-16 h-20 rounded-lg object-cover"
                        />
                      ) : (
                        <div className="w-16 h-20 bg-zinc-700 rounded-lg flex items-center justify-center">
                          <IoFilmOutline className="text-zinc-500" size={24} />
                        </div>
                      )}
                      <div>
                        <h4 className="text-white font-semibold">{booking.movie.title}</h4>
                        <p className="text-zinc-400 text-sm">
                          Mã: <span className="font-mono">{booking.bookingCode}</span>
                        </p>
                        <p className="text-zinc-400 text-sm">
                          {formatDateTime(booking.showtime.showDatetime)}
                        </p>
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="flex items-center gap-2 justify-end mb-1">
                          <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(booking.status)}`}>
                            {booking.status}
                          </span>
                          <span className={`px-2 py-0.5 rounded text-xs border ${getStatusColor(booking.paymentStatus)}`}>
                            {booking.paymentStatus}
                          </span>
                        </div>
                        <p className="text-zinc-400 text-sm">
                          <span className="text-green-400">{booking.checkedInTicketCount}</span>
                          /{booking.ticketCount} vé đã check-in
                        </p>
                        <p className="text-white font-semibold">{formatCurrency(booking.totalAmount)}</p>
                      </div>
                      <div className="text-zinc-400">
                        {expandedBookingId === booking.bookingId ? (
                          <IoChevronUpOutline size={20} />
                        ) : (
                          <IoChevronDownOutline size={20} />
                        )}
                      </div>
                    </div>
                  </div>
                </div>

                {/* Booking Detail (Expanded) */}
                {expandedBookingId === booking.bookingId && (
                  <div className="border-t border-zinc-700 p-4 bg-zinc-800/50">
                    {isDetailLoading ? (
                      <div className="flex items-center justify-center py-8">
                        <div className="w-6 h-6 border-3 border-[#f84565]/30 border-t-[#f84565] rounded-full animate-spin" />
                      </div>
                    ) : bookingDetailData?.result ? (
                      <div className="space-y-4">
                        {/* Customer Info */}
                        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                          <div className="p-3 bg-zinc-700/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <IoPersonOutline className="text-[#f84565]" size={18} />
                              <span className="text-zinc-400 text-sm">Khách hàng</span>
                            </div>
                            <p className="text-white font-medium">{bookingDetailData.result.customer.fullName}</p>
                            <p className="text-zinc-400 text-sm">{bookingDetailData.result.customer.email}</p>
                            <p className="text-zinc-400 text-sm">{bookingDetailData.result.customer.phone}</p>
                          </div>
                          <div className="p-3 bg-zinc-700/50 rounded-xl">
                            <div className="flex items-center gap-2 mb-2">
                              <IoLocationOutline className="text-[#f84565]" size={18} />
                              <span className="text-zinc-400 text-sm">Phòng chiếu</span>
                            </div>
                            <p className="text-white font-medium">{bookingDetailData.result.showtime.screenName}</p>
                            <p className="text-zinc-400 text-sm">{bookingDetailData.result.showtime.cinemaName}</p>
                          </div>
                        </div>

                        {/* Check-in Summary */}
                        <div className={`p-3 rounded-xl border ${getCheckInStatusColor(bookingDetailData.result.checkInSummary.bookingCheckInStatus)}`}>
                          <div className="flex items-center justify-between">
                            <span className="font-medium">
                              {getCheckInStatusText(bookingDetailData.result.checkInSummary.bookingCheckInStatus)}
                            </span>
                            <span>
                              <span className="font-bold">{bookingDetailData.result.checkInSummary.checkedInTickets}</span>
                              <span className="text-zinc-400"> / </span>
                              <span className="font-bold">{bookingDetailData.result.checkInSummary.totalTickets}</span>
                              <span className="text-zinc-400 text-sm ml-1">vé</span>
                            </span>
                          </div>
                        </div>

                        {/* Tickets */}
                        <div>
                          <h5 className="text-white font-medium mb-3">Danh sách vé</h5>
                          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-2">
                            {bookingDetailData.result.tickets.map((ticket) => (
                              <div
                                key={ticket.ticketId}
                                className={`p-3 rounded-xl border ${
                                  ticket.checkInStatus === 'CHECKED_IN'
                                    ? 'bg-green-500/10 border-green-500/30'
                                    : 'bg-zinc-700/50 border-zinc-600'
                                }`}
                              >
                                <div className="flex items-center justify-between mb-1">
                                  <span className="text-white font-medium">Ghế {ticket.seatName}</span>
                                  {ticket.checkInStatus === 'CHECKED_IN' ? (
                                    <IoCheckmarkCircleOutline className="text-green-400" size={18} />
                                  ) : (
                                    <div className="w-4 h-4 rounded-full border-2 border-zinc-500" />
                                  )}
                                </div>
                                <p className="text-zinc-400 text-sm">{formatCurrency(ticket.price)}</p>
                                {ticket.checkInTime && (
                                  <p className="text-green-400 text-xs mt-1">
                                    Check-in: {formatDateTime(ticket.checkInTime)}
                                  </p>
                                )}
                                {ticket.checkedInByEmployeeName && (
                                  <p className="text-zinc-500 text-xs">
                                    Bởi: {ticket.checkedInByEmployeeName}
                                  </p>
                                )}
                              </div>
                            ))}
                          </div>
                        </div>
                      </div>
                    ) : (
                      <p className="text-zinc-400 text-center py-4">Không thể tải chi tiết</p>
                    )}
                  </div>
                )}
              </div>
            ))}

            {/* Pagination */}
            {bookingsData.result.totalPages > 1 && (
              <div className="flex items-center justify-center gap-2 mt-6">
                <Button
                  variant="outline"
                  size="sm"
                  disabled={historyParams.page === 1}
                  onClick={() => handlePageChange((historyParams.page || 1) - 1)}
                  className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white disabled:opacity-50"
                >
                  Trước
                </Button>
                <span className="text-zinc-400 text-sm px-4">
                  Trang {historyParams.page} / {bookingsData.result.totalPages}
                </span>
                <Button
                  variant="outline"
                  size="sm"
                  disabled={historyParams.page === bookingsData.result.totalPages}
                  onClick={() => handlePageChange((historyParams.page || 1) + 1)}
                  className="bg-zinc-700 border-zinc-600 hover:bg-zinc-600 text-white disabled:opacity-50"
                >
                  Sau
                </Button>
              </div>
            )}
          </>
        )}
      </div>
    </>
  );
};

export default HistoryTab;
