"use client";

import { User, FileText, Film, DollarSign } from "lucide-react";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Skeleton } from "@/components/ui/skeleton";
import dayjs from "dayjs";
import "dayjs/locale/vi";
import { cn } from "@/lib/utils";

dayjs.locale("vi");

interface BookingDetailModalProps {
  bookingId: number | null;
  bookingDetail: any;
  isLoading: boolean;
  onClose: () => void;
}

const BookingDetailModal = ({ bookingId, bookingDetail, isLoading, onClose }: BookingDetailModalProps) => {
  if (!bookingId) return null;

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
    const config = statusMap[status] ?? { label: status, className: "bg-gray-500/20 text-gray-400" };
    return <Badge variant="outline" className={config.className}>{config.label}</Badge>;
  };

  // Extract data from nested structure
  const booking = bookingDetail?.booking;
  const customer = bookingDetail?.customer;
  const movie = bookingDetail?.movie;
  const cinema = bookingDetail?.cinema;
  const screen = bookingDetail?.screen;
  const showtime = bookingDetail?.showtime;
  const tickets = bookingDetail?.tickets ?? [];
  const serviceOrders = bookingDetail?.serviceOrders ?? [];
  const payment = bookingDetail?.payment;
  const voucher = bookingDetail?.voucher;
  const pricing = bookingDetail?.pricingBreakdown;

  return (
    <Dialog open={!!bookingId} onOpenChange={() => onClose()}>
      <DialogContent className="max-w-3xl max-h-[90vh] overflow-y-auto bg-zinc-900 border-zinc-700 text-white">
        <DialogHeader>
          <DialogTitle className="text-xl font-bold text-orange-400 flex items-center gap-2">
            <FileText className="w-5 h-5" />
            Chi Tiết Đơn Hàng
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="space-y-4">
            {Array.from({ length: 5 }).map((_, i) => (
              <Skeleton key={i} className="h-16 w-full bg-zinc-800" />
            ))}
          </div>
        ) : bookingDetail ? (
          <div className="space-y-6">
            {/* Basic Info */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400">Thông Tin Đơn Hàng</CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <span className="text-zinc-500 text-xs">Mã Booking</span>
                  <p className="text-orange-400 font-mono truncate" title={booking?.bookingCode}>{booking?.bookingCode ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <span className="text-zinc-500 text-xs">Order Code</span>
                  <p className="text-white font-mono truncate" title={booking?.orderCode}>{booking?.orderCode ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Thời Gian Đặt</span>
                  <p className="text-white">
                    {booking?.bookingTime
                      ? dayjs(booking.bookingTime).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Trạng Thái</span>
                  <div className="mt-1">{getStatusBadge(booking?.state ?? booking?.status ?? "")}</div>
                </div>
              </CardContent>
            </Card>

            {/* Customer Info */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <User className="w-4 h-4" />
                  Thông Tin Khách Hàng
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div>
                  <span className="text-zinc-500 text-xs">Tên Khách Hàng</span>
                  <p className="text-white">{customer?.fullname ?? "-"}</p>
                </div>
                <div className="min-w-0">
                  <span className="text-zinc-500 text-xs">Email</span>
                  <p className="text-white truncate" title={customer?.email}>{customer?.email ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Số Điện Thoại</span>
                  <p className="text-white">{customer?.phone ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Username</span>
                  <p className="text-white">{customer?.username ?? "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Movie & Cinema Info */}
            <Card className="bg-zinc-800/50 border-zinc-700">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-zinc-400 flex items-center gap-2">
                  <Film className="w-4 h-4" />
                  Thông Tin Phim & Suất Chiếu
                </CardTitle>
              </CardHeader>
              <CardContent className="grid grid-cols-2 gap-4">
                <div className="min-w-0">
                  <span className="text-zinc-500 text-xs">Tên Phim</span>
                  <p className="text-white truncate" title={movie?.title}>{movie?.title ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Thể loại</span>
                  <p className="text-white">{movie?.genre ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Rạp Chiếu</span>
                  <p className="text-white">{cinema?.cinemaName ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Phòng Chiếu</span>
                  <p className="text-white">{screen?.screenName ?? "-"}</p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Thời Gian Chiếu</span>
                  <p className="text-white">
                    {showtime?.showDatetime
                      ? dayjs(showtime.showDatetime).format("DD/MM/YYYY HH:mm")
                      : "-"}
                  </p>
                </div>
                <div>
                  <span className="text-zinc-500 text-xs">Định dạng</span>
                  <p className="text-white">{showtime?.formatType ?? "-"}</p>
                </div>
              </CardContent>
            </Card>

            {/* Tickets */}
            {tickets.length > 0 && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    Vé Đã Đặt ({tickets.length} vé)
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="flex flex-wrap gap-2">
                    {tickets.map((ticket: any, idx: number) => (
                      <Badge
                        key={idx}
                        variant="outline"
                        className="bg-orange-500/20 text-orange-300 border-orange-500/30"
                      >
                        {ticket.seatName ?? `${ticket.rowCode}${ticket.seatNumber}`} ({ticket.seatTypeName}) - {formatCurrency(ticket.price ?? 0)}
                      </Badge>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Service Orders (Combos) */}
            {serviceOrders.length > 0 && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    Dịch vụ đã đặt
                  </CardTitle>
                </CardHeader>
                <CardContent>
                  <div className="space-y-2">
                    {serviceOrders.map((service: any, idx: number) => (
                      <div key={idx} className="flex justify-between items-center">
                        <span className="text-white">
                          {service.serviceName} x{service.quantity}
                        </span>
                        <span className="text-green-400">{formatCurrency(service.totalPrice ?? 0)}</span>
                      </div>
                    ))}
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Voucher */}
            {voucher && (
              <Card className="bg-zinc-800/50 border-zinc-700">
                <CardHeader className="pb-2">
                  <CardTitle className="text-sm font-medium text-zinc-400">
                    Voucher đã áp dụng
                  </CardTitle>
                </CardHeader>
                <CardContent className="grid grid-cols-2 gap-4">
                  <div className="min-w-0">
                    <span className="text-zinc-500 text-xs">Mã voucher</span>
                    <p className="text-orange-400 font-mono truncate" title={voucher.voucherCode}>{voucher.voucherCode}</p>
                  </div>
                  <div>
                    <span className="text-zinc-500 text-xs">Giảm giá</span>
                    <p className="text-green-400">
                      {voucher.discountType === "PERCENTAGE" 
                        ? `${voucher.discountValue}%` 
                        : formatCurrency(voucher.discountValue)}
                    </p>
                  </div>
                </CardContent>
              </Card>
            )}

            {/* Payment Info */}
            <Card className="bg-gradient-to-br from-green-500/10 to-emerald-900/20 border-green-500/30">
              <CardHeader className="pb-2">
                <CardTitle className="text-sm font-medium text-green-400 flex items-center gap-2">
                  <DollarSign className="w-4 h-4" />
                  Thông Tin Thanh Toán
                </CardTitle>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Tổng tiền vé</span>
                  <span className="text-white">{formatCurrency(pricing?.ticketsSubtotal ?? 0)}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Tổng tiền dịch vụ</span>
                  <span className="text-white">{formatCurrency(pricing?.servicesSubtotal ?? 0)}</span>
                </div>
                {pricing?.voucherDiscount > 0 && (
                  <div className="flex justify-between items-center">
                    <span className="text-zinc-400">Giảm giá voucher</span>
                    <span className="text-red-400">-{formatCurrency(pricing.voucherDiscount)}</span>
                  </div>
                )}
                <div className="border-t border-zinc-700 pt-3 flex justify-between items-center">
                  <span className="text-white font-semibold">Tổng Thanh Toán</span>
                  <span className="text-green-400 font-bold text-xl">
                    {formatCurrency(pricing?.finalTotal ?? booking?.totalAmount ?? 0)}
                  </span>
                </div>
                <div className="flex justify-between items-center text-sm">
                  <span className="text-zinc-400">Trạng thái thanh toán</span>
                  <Badge
                    variant="outline"
                    className={cn(
                      payment?.status === "PAID"
                        ? "bg-green-500/20 text-green-400 border-green-500/30"
                        : "bg-yellow-500/20 text-yellow-400 border-yellow-500/30"
                    )}
                  >
                    {payment?.status === "PAID" ? "Đã thanh toán" : payment?.status ?? "-"}
                  </Badge>
                </div>
                {payment?.provider && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Phương thức</span>
                    <span className="text-white">{payment.provider}</span>
                  </div>
                )}
                {payment?.paidAt && (
                  <div className="flex justify-between items-center text-sm">
                    <span className="text-zinc-400">Thời gian thanh toán</span>
                    <span className="text-white">
                      {dayjs(payment.paidAt).format("DD/MM/YYYY HH:mm")}
                    </span>
                  </div>
                )}
              </CardContent>
            </Card>
          </div>
        ) : (
          <div className="py-12 text-center text-zinc-500">
            Không tìm thấy thông tin đơn hàng
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
};

export default BookingDetailModal;
