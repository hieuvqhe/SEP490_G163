"use client";

import React, { useState, useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { useGetPartnerBookings, useGetPartnerBookingStatistics, useGetPartnerBookingById } from "@/apis/partner.bookings.api";
import { LoadingSkeleton } from "./components/LoadingSkeleton";
import { BookingFilters } from "./components/BookingFilters";
import { BookingStatsOverview } from "./components/BookingStatsOverview";
import { BookingsTable } from "./components/BookingsTable";
import { BookingDetailsDialog } from "./components/BookingDetailsDialog";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

export default function BookingStatsPage() {
  const [filters, setFilters] = useState({
    fromDate: "",
    toDate: "",
    cinemaId: "",
    status: "",
    paymentStatus: "",
    customerEmail: "",
    customerPhone: "",
    bookingCode: "",
    page: 1,
    pageSize: 20,
    sortBy: "booking_time",
    sortOrder: "desc" as "asc" | "desc",
  });

  const [showFilters, setShowFilters] = useState(false);
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);
  const [showDetailsDialog, setShowDetailsDialog] = useState(false);

  // Fetch statistics
  const { data: statsData, isLoading: isStatsLoading, refetch: refetchStats } = useGetPartnerBookingStatistics({
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    cinemaId: filters.cinemaId ? parseInt(filters.cinemaId) : undefined,
    groupBy: "day",
    includeComparison: true,
    topLimit: 10,
    page: 1,
    pageSize: 20,
  });

  // Fetch bookings list
  const { data: bookingsData, isLoading: isBookingsLoading, refetch: refetchBookings } = useGetPartnerBookings({
    fromDate: filters.fromDate || undefined,
    toDate: filters.toDate || undefined,
    cinemaId: filters.cinemaId ? parseInt(filters.cinemaId) : undefined,
    status: filters.status || undefined,
    paymentStatus: filters.paymentStatus || undefined,
    customerEmail: filters.customerEmail || undefined,
    customerPhone: filters.customerPhone || undefined,
    bookingCode: filters.bookingCode || undefined,
    page: filters.page,
    pageSize: filters.pageSize,
    sortBy: filters.sortBy || undefined,
    sortOrder: filters.sortOrder,
  });

  // Fetch booking details when a booking is selected
  const { data: bookingDetailsData, isLoading: isDetailsLoading } = useGetPartnerBookingById(selectedBookingId || undefined);
  const bookingDetails = bookingDetailsData?.result;

  const stats = statsData?.result;
  const bookings = bookingsData?.result;

  const handleFilterChange = (key: string, value: string) => {
    setFilters((prev) => ({ ...prev, [key]: value, page: 1 }));
  };

  const handlePageChange = (newPage: number) => {
    setFilters((prev) => ({ ...prev, page: newPage }));
  };

  const handleRefresh = () => {
    refetchStats();
    refetchBookings();
  };

  const handleClearFilters = () => {
    setFilters({
      fromDate: "",
      toDate: "",
      cinemaId: "",
      status: "",
      paymentStatus: "",
      customerEmail: "",
      customerPhone: "",
      bookingCode: "",
      page: 1,
      pageSize: 20,
      sortBy: "booking_time",
      sortOrder: "desc",
    });
  };

  const handleViewDetails = (bookingId: number) => {
    setSelectedBookingId(bookingId);
    setShowDetailsDialog(true);
  };

  const handleCloseDialog = () => {
    setShowDetailsDialog(false);
    setSelectedBookingId(null);
  };

  // Driver.js guide
  const handleStartGuide = useCallback(() => {
    const hasBookings = bookings?.items && bookings.items.length > 0;

    const steps = [
      {
        element: "#booking-stats-page",
        popover: {
          title: "Trang Thống Kê Booking",
          description: "Đây là trang quản lý và theo dõi tất cả đơn đặt vé của hệ thống. Bạn có thể xem thống kê, lọc và tìm kiếm booking.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-stats-header",
        popover: {
          title: "Tiêu đề & Hướng dẫn",
          description: "Nhấn nút 'Hướng dẫn' bất cứ lúc nào để xem lại hướng dẫn sử dụng trang này.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-stats-overview",
        popover: {
          title: "Tổng quan thống kê",
          description: "Các thẻ thống kê hiển thị tổng số booking, doanh thu, tỷ lệ hoàn thành và các chỉ số quan trọng khác.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-stats-filters",
        popover: {
          title: "Bộ lọc tìm kiếm",
          description: "Sử dụng bộ lọc để tìm kiếm booking theo ngày, rạp, trạng thái, email hoặc mã booking. Nhấn 'Bộ lọc' để mở rộng các tùy chọn.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-stats-table",
        popover: {
          title: "Bảng danh sách booking",
          description: "Danh sách tất cả booking hiển thị mã đơn, khách hàng, phim, suất chiếu, tổng tiền và trạng thái. Nhấn biểu tượng mắt để xem chi tiết.",
          side: "top" as const,
          align: "start" as const,
        },
      },
    ];

    if (hasBookings) {
      steps.push({
        element: "#booking-stats-table-row",
        popover: {
          title: "Chi tiết từng booking",
          description: "Mỗi hàng hiển thị thông tin cơ bản của booking. Nhấn biểu tượng mắt ở cột 'Thao Tác' để xem chi tiết đầy đủ.",
          side: "bottom" as const,
          align: "start" as const,
        },
      });
    }

    steps.push({
      element: "#booking-stats-pagination",
      popover: {
        title: "Phân trang",
        description: "Sử dụng các nút điều hướng để chuyển giữa các trang booking.",
        side: "top" as const,
        align: "start" as const,
      },
    });

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [bookings?.items]);

  // Driver.js guide for detail modal
  const handleStartDetailGuide = useCallback(() => {
    const steps = [
      {
        element: "#booking-detail-header",
        popover: {
          title: "Thông tin đơn hàng",
          description: "Hiển thị mã đơn hàng và trạng thái hiện tại của booking (Đã xác nhận, Đang chờ, Đã hủy...).",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-detail-customer",
        popover: {
          title: "Thông tin khách hàng",
          description: "Xem họ tên, email và số điện thoại của khách hàng đã đặt vé.",
          side: "right" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-detail-movie",
        popover: {
          title: "Thông tin phim & rạp",
          description: "Chi tiết về phim, rạp chiếu, suất chiếu và phòng chiếu của booking.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-detail-tickets",
        popover: {
          title: "Danh sách vé",
          description: "Liệt kê các ghế đã đặt cùng loại vé và giá của từng vé.",
          side: "top" as const,
          align: "start" as const,
        },
      },
      {
        element: "#booking-detail-payment",
        popover: {
          title: "Thông tin thanh toán",
          description: "Xem phương thức thanh toán, trạng thái và tổng số tiền của đơn hàng.",
          side: "top" as const,
          align: "start" as const,
        },
      },
    ];

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, []);

  return (
    <div className="flex flex-1 flex-col gap-6 p-4 lg:p-6" id="booking-stats-page">
      {/* Header */}
      <div className="flex flex-col gap-4 sm:flex-row sm:items-center sm:justify-between" id="booking-stats-header">
        <div className="flex flex-col gap-2">
          <h1 className="text-3xl font-bold text-zinc-100">Thống Kê Booking</h1>
          <p className="text-zinc-400">Quản lý và theo dõi tất cả đơn đặt vé</p>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartGuide}
          className="w-fit border border-zinc-700 bg-zinc-800/70 text-zinc-100 transition hover:bg-zinc-800 gap-2"
        >
          <Info className="size-4" />
          Hướng dẫn
        </Button>
      </div>

      {/* Statistics Cards */}
      <div id="booking-stats-overview">
        {isStatsLoading ? (
          <LoadingSkeleton />
        ) : (
          <BookingStatsOverview stats={stats?.overview} isLoading={isStatsLoading} />
        )}
      </div>

      {/* Filter Section */}
      <div id="booking-stats-filters">
        <BookingFilters
          filters={filters}
          showFilters={showFilters}
          onFilterChange={handleFilterChange}
          onClearFilters={handleClearFilters}
          onToggleFilters={() => setShowFilters(!showFilters)}
          onRefresh={handleRefresh}
        />
      </div>

      {/* Bookings Table */}
      <div id="booking-stats-table">
        <BookingsTable
          bookings={bookings?.items}
          isLoading={isBookingsLoading}
          currentPage={filters.page}
          pageSize={filters.pageSize}
          onPageChange={handlePageChange}
          onViewDetails={handleViewDetails}
        />
      </div>

      {/* Booking Details Dialog */}
      <BookingDetailsDialog
        open={showDetailsDialog}
        onOpenChange={setShowDetailsDialog}
        bookingDetails={bookingDetails}
        isLoading={isDetailsLoading}
        onStartGuide={handleStartDetailGuide}
      />
    </div>
  );
}

