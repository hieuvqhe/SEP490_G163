import React from "react";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { PartnerBooking } from "@/apis/partner.bookings.api";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { Eye, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingsTableProps {
  bookings?: PartnerBooking[];
  isLoading: boolean;
  currentPage: number;
  pageSize: number;
  onPageChange: (page: number) => void;
  onViewDetails: (bookingId: number) => void;
}

export function BookingsTable({
  bookings,
  isLoading,
  currentPage,
  pageSize,
  onPageChange,
  onViewDetails,
}: BookingsTableProps) {
  if (isLoading) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
        Đang tải dữ liệu...
      </div>
    );
  }

  if (!bookings || bookings.length === 0) {
    return (
      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 p-8 text-center text-zinc-400">
        Không tìm thấy đơn đặt vé nào.
      </div>
    );
  }

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "COMPLETED":
        return "bg-blue-500/10 text-blue-500 border-blue-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const getPaymentStatusColor = (status: string) => {
    switch (status) {
      case "PAID":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "FAILED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      case "REFUNDED":
        return "bg-purple-500/10 text-purple-500 border-purple-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  return (
    <div className="space-y-4">
      <div className="rounded-md border border-zinc-800 bg-zinc-900/50 overflow-hidden">
        <Table>
          <TableHeader>
            <TableRow className="border-zinc-800 hover:bg-zinc-800/50">
              <TableHead className="text-zinc-400">Mã Booking</TableHead>
              <TableHead className="text-zinc-400">Khách Hàng</TableHead>
              <TableHead className="text-zinc-400">Phim / Rạp</TableHead>
              <TableHead className="text-zinc-400">Suất Chiếu</TableHead>
              <TableHead className="text-zinc-400 text-right">Tổng Tiền</TableHead>
              <TableHead className="text-zinc-400 text-center">Trạng Thái</TableHead>
              <TableHead className="text-zinc-400 text-center">Thanh Toán</TableHead>
              <TableHead className="text-zinc-400 text-right">Thao Tác</TableHead>
            </TableRow>
          </TableHeader>
          <TableBody>
            {bookings.map((booking, index) => (
              <TableRow 
                key={booking.bookingId} 
                className="border-zinc-800 hover:bg-zinc-800/50"
                id={index === 0 ? "booking-stats-table-row" : undefined}
              >
                <TableCell className="font-medium text-zinc-200">
                  {booking.bookingCode}
                  <div className="text-xs text-zinc-500">
                    {format(new Date(booking.bookingTime), "dd/MM/yyyy HH:mm")}
                  </div>
                </TableCell>
                <TableCell>
                  <div className="text-zinc-200">{booking.customer.fullname}</div>
                  <div className="text-xs text-zinc-500">{booking.customer.phone}</div>
                </TableCell>
                <TableCell>
                  <div className="text-zinc-200 font-medium">{booking.movie.title}</div>
                  <div className="text-xs text-zinc-500">{booking.cinema.cinemaName}</div>
                </TableCell>
                <TableCell>
                  <div className="text-zinc-200">
                    {format(new Date(booking.showtime.showDatetime), "HH:mm")}
                  </div>
                  <div className="text-xs text-zinc-500">
                    {format(new Date(booking.showtime.showDatetime), "dd/MM/yyyy")}
                  </div>
                </TableCell>
                <TableCell className="text-right font-medium text-zinc-200">
                  {formatCurrency(booking.totalAmount)}
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn("whitespace-nowrap", getStatusColor(booking.status))}
                  >
                    {booking.status}
                  </Badge>
                </TableCell>
                <TableCell className="text-center">
                  <Badge
                    variant="outline"
                    className={cn("whitespace-nowrap", getPaymentStatusColor(booking.paymentStatus))}
                  >
                    {booking.paymentStatus}
                  </Badge>
                </TableCell>
                <TableCell className="text-right">
                  <Button
                    variant="ghost"
                    size="icon"
                    onClick={() => onViewDetails(booking.bookingId)}
                    className="hover:bg-zinc-700 hover:text-zinc-100"
                  >
                    <Eye className="size-4" />
                  </Button>
                </TableCell>
              </TableRow>
            ))}
          </TableBody>
        </Table>
      </div>

      {/* Pagination */}
      <div className="flex items-center justify-end gap-2" id="booking-stats-pagination">
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1}
          className="h-8 w-8 p-0"
        >
          <ChevronLeft className="size-4" />
        </Button>
        <div className="text-sm text-zinc-400">Trang {currentPage}</div>
        <Button
          variant="outline"
          size="sm"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={bookings.length < pageSize}
          className="h-8 w-8 p-0"
        >
          <ChevronRight className="size-4" />
        </Button>
      </div>
    </div>
  );
}
