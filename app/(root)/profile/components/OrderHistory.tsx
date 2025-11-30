"use client";

import React, { useState } from "react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Calendar as CalendarIcon, Eye, X } from "lucide-react";
import { DateRange } from "react-day-picker";

import { useGetAllUserOrders, useGetOrderById } from "@/apis/user.tickets.api";
import { cn } from "@/lib/utils";

// --- UI Components Imports (Giả định đường dẫn chuẩn của Shadcn) ---
import { Button } from "@/components/ui/button";
import { Calendar } from "@/components/ui/calendar";
import {
  Popover,
  PopoverContent,
  PopoverTrigger,
} from "@/components/ui/popover";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { Spinner } from "@/components/ui/spinner"; // Hoặc component loading của bạn
import Image from "next/image";

// --- TYPES (Từ code bạn cung cấp) ---
export interface OrderItem {
  bookingId: number;
  bookingCode: string;
  bookingTime: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "PAID";
  state: "PENDING" | "COMPLETED" | "CANCELLED" | "PAID";
  paymentStatus: "PENDING" | "COMPLETED" | "CANCELLED" | "PAID";
  totalAmount: number;
  ticketCount: number;
  showtime: {
    showtimeId: number;
    showDatetime: string;
    formatType: string;
  };
  movie: {
    movieId: number;
    title: string;
    durationMinutes: number;
    posterUrl: string;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    address: string;
    city: string;
    district: string;
  };
}

// --- HELPER COMPONENTS ---

// Badge hiển thị trạng thái đẹp mắt
const StatusBadge = ({ status }: { status: string }) => {
  const styles: Record<string, string> = {
    PAID: "bg-green-500/10 text-green-500 border-green-500/20",
    COMPLETED: "bg-green-500/10 text-green-500 border-green-500/20",
    PENDING: "bg-yellow-500/10 text-yellow-500 border-yellow-500/20",
    CANCELLED: "bg-red-500/10 text-red-500 border-red-500/20",
  };

  const defaultStyle = "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";

  return (
    <span
      className={cn(
        "px-2.5 py-0.5 rounded-full text-xs font-bold border uppercase",
        styles[status] || defaultStyle
      )}
    >
      {status === "PAID" || status === "COMPLETED"
        ? "Thành công"
        : status === "PENDING"
        ? "Chờ thanh toán"
        : "Đã hủy"}
    </span>
  );
};

// --- MAIN COMPONENT ---
const OrderHistory = () => {
  // 1. STATE MANAGEMENT
  const [page, setPage] = useState(1);
  const [dateRange, setDateRange] = useState<DateRange | undefined>();
  const [statusFilter, setStatusFilter] = useState<string>("ALL");

  // State cho Detail Dialog
  const [selectedBookingId, setSelectedBookingId] = useState<number | null>(
    null
  );
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  // 2. DATA FETCHING
  // Convert date sang string format YYYY-MM-DD cho API
  const fromDateStr = dateRange?.from
    ? format(dateRange.from, "yyyy-MM-dd")
    : undefined;
  const toDateStr = dateRange?.to
    ? format(dateRange.to, "yyyy-MM-dd")
    : undefined;

  const { data: getAllOrdersRes, isLoading: allOrdersLoad } =
    useGetAllUserOrders({
      page: page,
      pageSize: 5,
      status: statusFilter === "ALL" ? undefined : statusFilter,
      fromDate: fromDateStr,
      toDate: toDateStr,
    });

  // Fetch chi tiết khi user click vào item (chỉ fetch khi có selectedBookingId)
  const { data: getOrderByIdRes, isLoading: orderDetailLoad } = useGetOrderById(
    selectedBookingId || undefined // Pass undefined nếu null để tránh fetch lỗi
  );

  const items = getAllOrdersRes?.result.items || [];
  const totalPages = getAllOrdersRes?.result.totalPages || 1;

  // 3. HANDLERS
  const handlePageChange = (newPage: number) => {
    if (newPage > 0 && newPage <= totalPages) {
      setPage(newPage);
    }
  };

  const handleOpenDetail = (id: number) => {
    setSelectedBookingId(id);
    setIsDetailOpen(true);
  };

  const handleClearFilters = () => {
    setDateRange(undefined);
    setStatusFilter("ALL");
    setPage(1);
  };

  return (
    <div className="w-full space-y-6 p-1">
      {/* HEADER & FILTERS */}
      <div className="flex flex-col gap-4 md:flex-row md:items-center md:justify-between">
        <div>
          <h2 className="text-2xl font-bold tracking-tight text-white">
            Lịch sử giao dịch
          </h2>
          <p className="text-sm text-zinc-400">
            Quản lý và xem lại các vé đã đặt
          </p>
        </div>

        <div className="flex flex-col gap-2 sm:flex-row sm:items-center">
          {/* Status Filter */}
          <Select
            value={statusFilter}
            onValueChange={(v) => {
              setStatusFilter(v);
              setPage(1); // Reset về trang 1 khi filter
            }}
          >
            <SelectTrigger className="w-full sm:w-[150px] bg-zinc-800 border-zinc-700 text-zinc-200">
              <SelectValue placeholder="Trạng thái" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
              <SelectItem value="ALL">Tất cả</SelectItem>
              <SelectItem value="PAID">Thành công</SelectItem>
              <SelectItem value="PENDING">Chờ thanh toán</SelectItem>
              <SelectItem value="CANCELLED">Đã hủy</SelectItem>
            </SelectContent>
          </Select>

          {/* Date Range Picker */}
          <Popover>
            <PopoverTrigger asChild>
              <Button
                id="date"
                variant={"outline"}
                className={cn(
                  "w-full sm:w-[200px] justify-start text-left font-normal bg-zinc-800 border-zinc-700 text-zinc-200",
                  !dateRange && "text-muted-foreground"
                )}
              >
                <CalendarIcon className="mr-2 h-4 w-4" />
                {dateRange?.from ? (
                  dateRange.to ? (
                    <>
                      {format(dateRange.from, "dd/MM/yyyy")} -{" "}
                      {format(dateRange.to, "dd/MM/yyyy")}
                    </>
                  ) : (
                    format(dateRange.from, "dd/MM/yyyy")
                  )
                ) : (
                  <span>Chọn khoảng ngày</span>
                )}
              </Button>
            </PopoverTrigger>
            <PopoverContent
              className="w-auto p-0 bg-zinc-800 border-zinc-700 text-zinc-200"
              align="end"
            >
              <Calendar
                initialFocus
                mode="range"
                defaultMonth={dateRange?.from}
                selected={dateRange}
                onSelect={(range) => {
                  setDateRange(range);
                  setPage(1);
                }}
                numberOfMonths={2}
                locale={vi}
              />
            </PopoverContent>
          </Popover>

          {/* Clear Filter Button */}
          {(statusFilter !== "ALL" || dateRange) && (
            <Button
              variant="ghost"
              size="icon"
              onClick={handleClearFilters}
              title="Xóa bộ lọc"
            >
              <X className="h-4 w-4" />
            </Button>
          )}
        </div>
      </div>

      {/* TABLE LIST */}
      <div className="w-full h-[45vh]">
        <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
          <Table>
            <TableHeader className="bg-zinc-900">
              <TableRow className="border-zinc-800 hover:bg-zinc-900">
                <TableHead className="text-zinc-400">Mã đơn</TableHead>
                <TableHead className="text-zinc-400">Phim</TableHead>
                <TableHead className="text-zinc-400">Thời gian đặt</TableHead>
                <TableHead className="text-zinc-400">Rạp</TableHead>
                <TableHead className="text-zinc-400">Tổng tiền</TableHead>
                <TableHead className="text-zinc-400">Trạng thái</TableHead>
                <TableHead className="text-right text-zinc-400">
                  Thao tác
                </TableHead>
              </TableRow>
            </TableHeader>
            <TableBody>
              {allOrdersLoad ? (
                <TableRow>
                  <TableCell colSpan={7} className="h-24 text-center">
                    <div className="flex justify-center">
                      <Spinner />
                    </div>
                  </TableCell>
                </TableRow>
              ) : items.length === 0 ? (
                <TableRow>
                  <TableCell
                    colSpan={7}
                    className="h-24 text-center text-zinc-500"
                  >
                    Không tìm thấy giao dịch nào.
                  </TableCell>
                </TableRow>
              ) : (
                items.map((item) => (
                  <TableRow
                    key={item.bookingId}
                    className="border-zinc-800 hover:bg-zinc-800/50 transition-colors"
                  >
                    <TableCell className="font-medium font-mono text-zinc-300">
                      {item.bookingCode}
                    </TableCell>
                    <TableCell>
                      <div className="flex flex-col">
                        <span className="font-medium text-white line-clamp-1">
                          {item.movie.title}
                        </span>
                        <span className="text-xs text-zinc-500">
                          {item.showtime.formatType}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      {format(new Date(item.bookingTime), "HH:mm dd/MM/yyyy")}
                    </TableCell>
                    <TableCell className="text-zinc-400 text-sm">
                      <div className="flex flex-col">
                        <span>{item.cinema.cinemaName}</span>
                        <span className="text-[10px] text-zinc-600">
                          {item.cinema.city}
                        </span>
                      </div>
                    </TableCell>
                    <TableCell className="text-white font-medium">
                      {item.totalAmount.toLocaleString()}đ
                    </TableCell>
                    <TableCell>
                      <StatusBadge status={item.paymentStatus} />
                    </TableCell>
                    <TableCell className="text-right">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={() => handleOpenDetail(item.bookingId)}
                        className="hover:bg-zinc-700 text-zinc-300 hover:text-white"
                      >
                        <Eye className="w-4 h-4 mr-1" /> Chi tiết
                      </Button>
                    </TableCell>
                  </TableRow>
                ))
              )}
            </TableBody>
          </Table>
        </div>
      </div>

      {/* PAGINATION */}
      {totalPages > 1 && (
        <Pagination className="justify-end">
          <PaginationContent>
            <PaginationItem>
              <PaginationPrevious
                onClick={() => handlePageChange(page - 1)}
                className={cn(
                  "cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800",
                  page <= 1 && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
            <PaginationItem>
              <span className="text-sm px-4 text-zinc-400">
                Trang {page} / {totalPages}
              </span>
            </PaginationItem>
            <PaginationItem>
              <PaginationNext
                onClick={() => handlePageChange(page + 1)}
                className={cn(
                  "cursor-pointer text-zinc-400 hover:text-white hover:bg-zinc-800",
                  page >= totalPages && "pointer-events-none opacity-50"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
      )}

      {/* DETAIL DIALOG */}
      <Dialog open={isDetailOpen} onOpenChange={setIsDetailOpen}>
        <DialogContent className="bg-zinc-900 border-zinc-800 text-white max-w-2xl max-h-[90vh] overflow-y-auto">
          <DialogHeader>
            <DialogTitle>Chi tiết đơn hàng</DialogTitle>
            <DialogDescription className="text-zinc-400">
              Mã đơn:{" "}
              <span className="font-mono text-zinc-200">
                {getOrderByIdRes?.result?.booking.bookingCode}
              </span>
            </DialogDescription>
          </DialogHeader>

          {orderDetailLoad || !getOrderByIdRes ? (
            <div className="flex items-center justify-center py-8">
              <Spinner />
            </div>
          ) : (
            <div className="grid gap-6 py-4">
              {/* Thông tin Phim & Rạp */}
              <div className="flex gap-4 p-4 bg-zinc-950/50 rounded-lg border border-zinc-800">
                <div className="relative w-24 h-36 shrink-0 rounded overflow-hidden">
                  <Image
                    src={getOrderByIdRes.result.movie.posterUrl}
                    alt="Poster"
                    fill
                    className="object-cover"
                  />
                </div>
                <div className="space-y-2">
                  <h3 className="font-bold text-lg text-purple-400">
                    {getOrderByIdRes.result.movie.title}
                  </h3>
                  <div className="text-sm text-zinc-300">
                    <p>
                      <span className="text-zinc-500">Rạp:</span>{" "}
                      {getOrderByIdRes.result.cinema.cinemaName}
                    </p>
                    <p>
                      <span className="text-zinc-500">Suất chiếu:</span>{" "}
                      {format(
                        new Date(getOrderByIdRes.result.showtime.showDatetime),
                        "HH:mm - dd/MM/yyyy"
                      )}
                    </p>
                    <p>
                      <span className="text-zinc-500">Định dạng:</span>{" "}
                      {getOrderByIdRes.result.showtime.formatType}
                    </p>
                    <p>
                      <span className="text-zinc-500">Thời lượng:</span>{" "}
                      {getOrderByIdRes.result.movie.durationMinutes} phút
                    </p>
                  </div>
                </div>
              </div>

              {/* Thông tin chi tiết thanh toán & Item */}
              <div className="grid grid-cols-2 gap-4 text-sm">
                {/* 4 Box thông tin cơ bản (Cũ) */}
                <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                  <span className="block text-zinc-500 text-xs uppercase mb-1">
                    Số lượng vé
                  </span>
                  <span className="font-bold text-lg">
                    {getOrderByIdRes.result.tickets.length}
                  </span>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                  <span className="block text-zinc-500 text-xs uppercase mb-1">
                    Tổng thanh toán
                  </span>
                  <span className="font-bold text-lg text-green-400">
                    {getOrderByIdRes.result.booking.totalAmount.toLocaleString()}
                    đ
                  </span>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                  <span className="block text-zinc-500 text-xs uppercase mb-1">
                    Ngày giao dịch
                  </span>
                  <span>
                    {format(
                      new Date(getOrderByIdRes.result.booking.bookingTime),
                      "HH:mm:ss dd/MM/yyyy"
                    )}
                  </span>
                </div>
                <div className="p-3 bg-zinc-800/50 rounded border border-zinc-700/50 flex flex-col items-start justify-center">
                  <span className="block text-zinc-500 text-xs uppercase mb-1">
                    Trạng thái
                  </span>
                  <StatusBadge
                    status={getOrderByIdRes.result.booking.paymentStatus}
                  />
                </div>

                {/* === MỚI: DANH SÁCH GHẾ === */}
                <div className="col-span-2 p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                  <span className="block text-zinc-500 text-xs uppercase mb-2">
                    Danh sách ghế
                  </span>
                  <div className="flex flex-wrap gap-2">
                    {getOrderByIdRes.result.tickets.map(
                      (ticket, index: number) => (
                        <span
                          key={index}
                          className="px-2.5 py-1 bg-purple-500/20 text-purple-300 border border-purple-500/30 rounded text-xs font-bold"
                        >
                          {ticket.seat.seatName}
                        </span>
                      )
                    )}
                  </div>
                </div>

                {/* === MỚI: DANH SÁCH COMBO (Chỉ hiện nếu có combo) === */}
                {getOrderByIdRes.result.combos &&
                  getOrderByIdRes.result.combos.length > 0 && (
                    <div className="col-span-2 p-3 bg-zinc-800/50 rounded border border-zinc-700/50">
                      <span className="block text-zinc-500 text-xs uppercase mb-2">
                        Combo bạn có
                      </span>
                      <div className="space-y-2">
                        {getOrderByIdRes.result.combos.map(
                          (combo, index: number) => (
                            <div
                              key={index}
                              className="flex items-center justify-between text-zinc-300 bg-zinc-900/50 px-3 py-2 rounded"
                            >
                              <span className="font-medium">
                                {combo.serviceName}
                              </span>
                              <span className="font-mono font-bold text-white bg-zinc-700 px-2 py-0.5 rounded text-xs">
                                x{combo.quantity}
                              </span>
                            </div>
                          )
                        )}
                      </div>
                    </div>
                  )}
              </div>
            </div>
          )}
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default OrderHistory;
