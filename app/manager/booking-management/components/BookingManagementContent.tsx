"use client";

import { useState, useMemo } from "react";
import {
  Search,
  Filter,
  Calendar,
  DollarSign,
  RefreshCw,
  ChevronLeft,
  ChevronRight,
  Eye,
  User,
  ArrowUpDown,
  FileText,
} from "lucide-react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { cn } from "@/lib/utils";
import { useGetManagerBookings, useGetManagerBookingById, GetBookingsParams } from "@/apis/manager.booking.api";
import { useAuthStore } from "@/store/authStore";
import BookingDetailModal from "./BookingDetailModal";

dayjs.locale("vi");

type SortField = "booking_time" | "total_amount" | "created_at" | "customer_name";
type SortOrder = "asc" | "desc";

const statusOptions = [
  { value: "all", label: "Tất cả trạng thái" },
  { value: "COMPLETED", label: "Hoàn thành" },
  { value: "PENDING", label: "Đang chờ" },
  { value: "EXPIRED", label: "Hết hạn" },
  { value: "REFUNDED", label: "Hoàn tiền" },
];

const paymentStatusOptions = [
  { value: "all", label: "Tất cả" },
  { value: "PAID", label: "Đã thanh toán" },
  { value: "PENDING", label: "Chờ thanh toán" },
  { value: "FAILED", label: "Thất bại" },
  { value: "REFUNDED", label: "Hoàn tiền" },
];

const sortOptions: { value: SortField; label: string }[] = [
  { value: "booking_time", label: "Thời gian đặt" },
  { value: "total_amount", label: "Tổng tiền" },
  { value: "created_at", label: "Ngày tạo" },
  { value: "customer_name", label: "Tên khách hàng" },
];

const BookingManagementContent = () => {
  const { accessToken } = useAuthStore();
  
  // Filter states
  const [page, setPage] = useState(1);
  const [pageSize, setPageSize] = useState(10);
  const [sortBy, setSortBy] = useState<SortField>("booking_time");
  const [sortOrder, setSortOrder] = useState<SortOrder>("desc");

  // Search filters
  const [searchEmail, setSearchEmail] = useState("");
  const [searchBookingCode, setSearchBookingCode] = useState("");
  const [searchOrderCode, setSearchOrderCode] = useState("");

  // Date range
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");

  // Amount range
  const [minAmount, setMinAmount] = useState("");
  const [maxAmount, setMaxAmount] = useState("");

  // Status
  const [status, setStatus] = useState("all");

  // Show filters
  const [showFilters, setShowFilters] = useState(false);

  // Detail modal
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(null);

  // Build query params
  const queryParams = useMemo<GetBookingsParams>(() => {
    const params: GetBookingsParams = {
      page,
      pageSize,
      sortBy,
      sortOrder,
    };

    if (searchEmail.trim()) params.customerEmail = searchEmail.trim();
    if (searchBookingCode.trim()) params.bookingCode = searchBookingCode.trim();
    if (searchOrderCode.trim()) params.orderCode = searchOrderCode.trim();
    if (fromDate) params.fromDate = fromDate;
    if (toDate) params.toDate = toDate;
    if (minAmount && !isNaN(Number(minAmount))) params.minAmount = Number(minAmount);
    if (maxAmount && !isNaN(Number(maxAmount))) params.maxAmount = Number(maxAmount);
    if (status !== "all") params.status = status;

    return params;
  }, [page, pageSize, sortBy, sortOrder, searchEmail, searchBookingCode, searchOrderCode, fromDate, toDate, minAmount, maxAmount, status]);

  // API calls
  const { data: bookingsData, isLoading, refetch, isFetching } = useGetManagerBookings(queryParams, accessToken ?? undefined);
  const { data: bookingDetail, isLoading: isLoadingDetail } = useGetManagerBookingById(selectedBookingId ?? undefined, accessToken ?? undefined);

  const bookings = bookingsData?.result?.items ?? [];
  const totalItems = bookingsData?.result?.totalItems ?? 0;
  const totalPages = bookingsData?.result?.totalPages ?? 1;

  // Handlers
  const handleResetFilters = () => {
    setPage(1);
    setSearchEmail("");
    setSearchBookingCode("");
    setSearchOrderCode("");
    setFromDate("");
    setToDate("");
    setMinAmount("");
    setMaxAmount("");
    setStatus("all");
    setSortBy("booking_time");
    setSortOrder("desc");
  };

  const handleSearch = () => {
    setPage(1);
    refetch();
  };

  const toggleSortOrder = () => {
    setSortOrder((prev) => (prev === "asc" ? "desc" : "asc"));
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      COMPLETED: { label: "Hoàn thành", className: "bg-green-500/20 text-green-400 border-green-500/30" },
      PENDING: { label: "Đang chờ", className: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30" },
      CONFIRMED: { label: "Đã xác nhận", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
      CANCELLED: { label: "Đã hủy", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      EXPIRED: { label: "Hết hạn", className: "bg-gray-500/20 text-gray-400 border-gray-500/30" },
      REFUNDED: { label: "Hoàn tiền", className: "bg-purple-500/20 text-purple-400 border-purple-500/30" },
    };
    const config = statusMap[status] ?? { label: status, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  const getPaymentStatusBadge = (status: string) => {
    const statusMap: Record<string, { label: string; className: string }> = {
      PAID: { label: "Đã TT", className: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30" },
      PENDING: { label: "Chờ TT", className: "bg-amber-500/20 text-amber-400 border-amber-500/30" },
      FAILED: { label: "Thất bại", className: "bg-red-500/20 text-red-400 border-red-500/30" },
      REFUNDED: { label: "Hoàn tiền", className: "bg-blue-500/20 text-blue-400 border-blue-500/30" },
    };
    const config = statusMap[status] ?? { label: status, className: "bg-gray-500/20 text-gray-400 border-gray-500/30" };
    return <Badge variant="outline" className={cn("text-xs", config.className)}>{config.label}</Badge>;
  };

  return (
    <div className="space-y-6">
      {/* Search & Filter Bar */}
      <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-sm">
        <CardHeader className="pb-4">
          <div className="flex flex-col md:flex-row md:items-center md:justify-between gap-4">
            <CardTitle className="text-lg font-semibold text-white flex items-center gap-2">
              <Search className="w-5 h-5 text-orange-400" />
              Tìm Kiếm & Lọc
            </CardTitle>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setShowFilters(!showFilters)}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              >
                <Filter className="w-4 h-4 mr-2" />
                {showFilters ? "Ẩn bộ lọc" : "Hiện bộ lọc"}
              </Button>
              <Button
                variant="outline"
                size="sm"
                onClick={handleResetFilters}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
              >
                <RefreshCw className="w-4 h-4 mr-2" />
                Reset
              </Button>
              <Button
                size="sm"
                onClick={() => refetch()}
                disabled={isFetching}
                className="bg-gradient-to-r from-orange-500 to-yellow-500 hover:from-orange-600 hover:to-yellow-600 text-white"
              >
                {isFetching ? <RefreshCw className="w-4 h-4 animate-spin" /> : <Search className="w-4 h-4" />}
              </Button>
            </div>
          </div>
        </CardHeader>
        <CardContent className="space-y-4">
          {/* Quick Search */}
          <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
            <div className="relative">
              <User className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Email khách hàng..."
                value={searchEmail}
                onChange={(e) => setSearchEmail(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
              />
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Mã booking..."
                value={searchBookingCode}
                onChange={(e) => setSearchBookingCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
              />
            </div>
            <div className="relative">
              <FileText className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
              <Input
                placeholder="Order code..."
                value={searchOrderCode}
                onChange={(e) => setSearchOrderCode(e.target.value)}
                onKeyDown={(e) => e.key === "Enter" && handleSearch()}
                className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500 focus:border-orange-500"
              />
            </div>
          </div>

          {/* Extended Filters */}
          {showFilters && (
            <div className="space-y-4">
                {/* Date Range */}
                <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Từ ngày</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        type="date"
                        value={fromDate}
                        onChange={(e) => setFromDate(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Đến ngày</label>
                    <div className="relative">
                      <Calendar className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        type="date"
                        value={toDate}
                        onChange={(e) => setToDate(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Số tiền từ</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        type="number"
                        placeholder="0"
                        value={minAmount}
                        onChange={(e) => setMinAmount(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Số tiền đến</label>
                    <div className="relative">
                      <DollarSign className="absolute left-3 top-1/2 -translate-y-1/2 w-4 h-4 text-zinc-500" />
                      <Input
                        type="number"
                        placeholder="10,000,000"
                        value={maxAmount}
                        onChange={(e) => setMaxAmount(e.target.value)}
                        className="pl-10 bg-zinc-800 border-zinc-700 text-white placeholder:text-zinc-500"
                      />
                    </div>
                  </div>
                </div>

                {/* Status & Sort */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Trạng thái đơn</label>
                    <Select value={status} onValueChange={setStatus}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {statusOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-zinc-800">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Sắp xếp theo</label>
                    <Select value={sortBy} onValueChange={(v) => setSortBy(v as SortField)}>
                      <SelectTrigger className="bg-zinc-800 border-zinc-700 text-white">
                        <SelectValue />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-900 border-zinc-700">
                        {sortOptions.map((opt) => (
                          <SelectItem key={opt.value} value={opt.value} className="text-white hover:bg-zinc-800">
                            {opt.label}
                          </SelectItem>
                        ))}
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <label className="text-sm text-zinc-400">Thứ tự</label>
                    <Button
                      variant="outline"
                      onClick={toggleSortOrder}
                      className="w-full justify-between bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700"
                    >
                      {sortOrder === "desc" ? "Giảm dần" : "Tăng dần"}
                      <ArrowUpDown className="w-4 h-4" />
                    </Button>
                  </div>
                </div>
            </div>
          )}
        </CardContent>
      </Card>

      {/* Stats Summary */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-4">
        <Card className="bg-gradient-to-br from-orange-500/20 to-orange-900/20 border-orange-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-orange-300">Tổng đơn hàng</div>
            <div className="text-2xl font-bold text-white">{totalItems.toLocaleString()}</div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-green-500/20 to-green-900/20 border-green-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-green-300">Hoàn thành</div>
            <div className="text-2xl font-bold text-white">
              {bookings.filter((b) => b.state === "COMPLETED").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-yellow-500/20 to-yellow-900/20 border-yellow-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-yellow-300">Đang chờ</div>
            <div className="text-2xl font-bold text-white">
              {bookings.filter((b) => b.state === "PENDING").length}
            </div>
          </CardContent>
        </Card>
        <Card className="bg-gradient-to-br from-purple-500/20 to-purple-900/20 border-purple-500/30">
          <CardContent className="p-4">
            <div className="text-sm text-purple-300">Tổng doanh thu (trang)</div>
            <div className="text-lg font-bold text-white truncate">
              {formatCurrency(bookings.reduce((sum, b) => sum + (b.totalAmount ?? 0), 0))}
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Bookings Table */}
      <Card className="bg-zinc-900/80 border-zinc-800 backdrop-blur-sm overflow-hidden">
        <CardHeader className="pb-0">
          <div className="flex items-center justify-between">
            <CardTitle className="text-lg font-semibold text-white">
              Danh Sách Đơn Hàng
            </CardTitle>
            <div className="flex items-center gap-2">
              <Select value={pageSize.toString()} onValueChange={(v) => { setPageSize(Number(v)); setPage(1); }}>
                <SelectTrigger className="w-[100px] bg-zinc-800 border-zinc-700 text-white">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-900 border-zinc-700">
                  {[10, 20, 50, 100].map((size) => (
                    <SelectItem key={size} value={size.toString()} className="text-white hover:bg-zinc-800">
                      {size} / trang
                    </SelectItem>
                  ))}
                </SelectContent>
              </Select>
            </div>
          </div>
        </CardHeader>
        <CardContent className="p-0">
          <div className="overflow-x-auto">
            <table className="w-full">
              <thead className="bg-zinc-800/50">
                <tr>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Mã Booking
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Khách Hàng
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Phim
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Rạp
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Thời Gian
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Tổng Tiền
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Trạng Thái
                  </th>
                  <th className="px-4 py-3 text-left text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Thanh Toán
                  </th>
                  <th className="px-4 py-3 text-center text-xs font-medium text-zinc-400 uppercase tracking-wider">
                    Thao Tác
                  </th>
                </tr>
              </thead>
              <tbody className="divide-y divide-zinc-800">
                {isLoading ? (
                  // Loading skeleton
                  Array.from({ length: pageSize }).map((_, i) => (
                    <tr key={i} className="hover:bg-zinc-800/30">
                      {Array.from({ length: 9 }).map((_, j) => (
                        <td key={j} className="px-4 py-3">
                          <Skeleton className="h-4 w-full bg-zinc-700" />
                        </td>
                      ))}
                    </tr>
                  ))
                ) : bookings.length === 0 ? (
                  <tr>
                    <td colSpan={9} className="px-4 py-12 text-center text-zinc-500">
                      Không tìm thấy đơn hàng nào
                    </td>
                  </tr>
                ) : (
                  bookings.map((booking) => (
                    <tr
                      key={booking.bookingId}
                      className="hover:bg-zinc-800/30 transition-colors"
                    >
                      <td className="px-4 py-3">
                        <span className="text-orange-400 font-mono text-sm">{booking.bookingCode}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white text-sm font-medium">{booking.customer?.fullname ?? "-"}</span>
                          <span className="text-zinc-500 text-xs">{booking.customer?.email ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-white text-sm line-clamp-1">{booking.movie?.title ?? "-"}</span>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white text-sm">{booking.cinema?.cinemaName ?? "-"}</span>
                          <span className="text-zinc-500 text-xs">{booking.partner?.partnerName ?? "-"}</span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <div className="flex flex-col">
                          <span className="text-white text-sm">
                            {booking.bookingTime ? dayjs(booking.bookingTime).format("DD/MM/YYYY") : "-"}
                          </span>
                          <span className="text-zinc-500 text-xs">
                            {booking.bookingTime ? dayjs(booking.bookingTime).format("HH:mm") : "-"}
                          </span>
                        </div>
                      </td>
                      <td className="px-4 py-3">
                        <span className="text-green-400 font-semibold text-sm">
                          {formatCurrency(booking.totalAmount ?? 0)}
                        </span>
                      </td>
                      <td className="px-4 py-3">{getStatusBadge(booking.state ?? booking.status ?? "")}</td>
                      <td className="px-4 py-3">{getPaymentStatusBadge(booking.paymentStatus ?? "")}</td>
                      <td className="px-4 py-3">
                        <div className="flex items-center justify-center">
                          <Button
                            size="sm"
                            variant="ghost"
                            onClick={() => setSelectedBookingId(booking.bookingId)}
                            className="text-orange-400 hover:text-orange-300 hover:bg-orange-500/10"
                          >
                            <Eye className="w-4 h-4" />
                          </Button>
                        </div>
                      </td>
                    </tr>
                  ))
                )}
              </tbody>
            </table>
          </div>

          {/* Pagination */}
          <div className="flex items-center justify-between px-4 py-4 border-t border-zinc-800">
            <div className="text-sm text-zinc-400">
              Hiển thị {bookings.length} / {totalItems} đơn hàng
            </div>
            <div className="flex items-center gap-2">
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.max(1, p - 1))}
                disabled={page === 1 || isLoading}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
              >
                <ChevronLeft className="w-4 h-4" />
              </Button>
              <div className="flex items-center gap-1">
                {Array.from({ length: Math.min(5, totalPages) }, (_, i) => {
                  let pageNum: number;
                  if (totalPages <= 5) {
                    pageNum = i + 1;
                  } else if (page <= 3) {
                    pageNum = i + 1;
                  } else if (page >= totalPages - 2) {
                    pageNum = totalPages - 4 + i;
                  } else {
                    pageNum = page - 2 + i;
                  }
                  return (
                    <Button
                      key={pageNum}
                      variant={page === pageNum ? "default" : "outline"}
                      size="sm"
                      onClick={() => setPage(pageNum)}
                      className={cn(
                        "w-8 h-8",
                        page === pageNum
                          ? "bg-orange-500 text-white hover:bg-orange-600"
                          : "bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700"
                      )}
                    >
                      {pageNum}
                    </Button>
                  );
                })}
              </div>
              <Button
                variant="outline"
                size="sm"
                onClick={() => setPage((p) => Math.min(totalPages, p + 1))}
                disabled={page === totalPages || isLoading}
                className="bg-zinc-800 border-zinc-700 text-zinc-300 hover:bg-zinc-700 disabled:opacity-50"
              >
                <ChevronRight className="w-4 h-4" />
              </Button>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Booking Detail Modal */}
      <BookingDetailModal
        bookingId={selectedBookingId}
        bookingDetail={bookingDetail?.result}
        isLoading={isLoadingDetail}
        onClose={() => setSelectedBookingId(null)}
      />
    </div>
  );
};

export default BookingManagementContent;
