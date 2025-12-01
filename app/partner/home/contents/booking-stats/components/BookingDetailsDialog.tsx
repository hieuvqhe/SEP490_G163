import React from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
} from "@/components/ui/dialog";
import {
  Table,
  TableBody,
  TableCell,
  TableHead,
  TableHeader,
  TableRow,
} from "@/components/ui/table";
import { Badge } from "@/components/ui/badge";
import { Separator } from "@/components/ui/separator";
import { Button } from "@/components/ui/button";
import { PartnerBookingDetail } from "@/apis/partner.bookings.api";
import { format } from "date-fns";
import { User, Calendar, MapPin, Film, CreditCard, Ticket, Utensils, Info } from "lucide-react";
import { cn } from "@/lib/utils";

interface BookingDetailsDialogProps {
  open: boolean;
  onOpenChange: (open: boolean) => void;
  bookingDetails?: PartnerBookingDetail;
  isLoading: boolean;
  onStartGuide?: () => void;
}

export function BookingDetailsDialog({
  open,
  onOpenChange,
  bookingDetails,
  isLoading,
  onStartGuide,
}: BookingDetailsDialogProps) {
  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case "CONFIRMED":
        return "bg-green-500/10 text-green-500 border-green-500/20";
      case "PENDING":
        return "bg-yellow-500/10 text-yellow-500 border-yellow-500/20";
      case "CANCELLED":
        return "bg-red-500/10 text-red-500 border-red-500/20";
      default:
        return "bg-zinc-500/10 text-zinc-500 border-zinc-500/20";
    }
  };

  return (
    <Dialog open={open} onOpenChange={onOpenChange}>
      <DialogContent className="max-w-3xl bg-zinc-900 border-zinc-800 text-zinc-100 max-h-[90vh] overflow-y-auto">
        <DialogHeader id="booking-detail-header">
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-bold flex items-center gap-2">
              Chi Tiết Đơn Đặt Vé
              {bookingDetails && (
                <Badge
                  variant="outline"
                  className={cn("ml-2", getStatusColor(bookingDetails.status))}
                >
                  {bookingDetails.status}
                </Badge>
              )}
            </DialogTitle>
            {onStartGuide && (
              <Button
                variant="ghost"
                size="sm"
                onClick={onStartGuide}
                className="text-zinc-400 hover:text-zinc-100 gap-1"
              >
                <Info className="size-4" />
                <span className="hidden sm:inline">Hướng dẫn</span>
              </Button>
            )}
          </div>
          <DialogDescription className="text-zinc-400">
            Mã đơn hàng: {bookingDetails?.bookingCode}
          </DialogDescription>
        </DialogHeader>

        {isLoading ? (
          <div className="py-8 text-center text-zinc-400">Đang tải thông tin chi tiết...</div>
        ) : bookingDetails ? (
          <div className="space-y-6">
            {/* Customer & Movie Info Grid */}
            <div className="grid grid-cols-1 md:grid-cols-2 gap-6" id="booking-detail-info">
              {/* Customer Info */}
              <div className="space-y-3" id="booking-detail-customer">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <User className="size-4 text-blue-500" />
                  Thông Tin Khách Hàng
                </h3>
                <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Họ tên:</span>
                    <span className="font-medium">{bookingDetails.customer.fullname}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Email:</span>
                    <span>{bookingDetails.customer.email}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">SĐT:</span>
                    <span>{bookingDetails.customer.phone}</span>
                  </div>
                </div>
              </div>

              {/* Movie Info */}
              <div className="space-y-3" id="booking-detail-movie">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Film className="size-4 text-purple-500" />
                  Thông Tin Phim & Rạp
                </h3>
                <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4 space-y-2 text-sm">
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phim:</span>
                    <span className="font-medium text-right">{bookingDetails.movie.title}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Rạp:</span>
                    <span className="text-right">{bookingDetails.cinema.cinemaName}</span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Suất chiếu:</span>
                    <span>
                      {format(new Date(bookingDetails.showtime.showDatetime), "HH:mm dd/MM/yyyy")}
                    </span>
                  </div>
                  <div className="flex justify-between">
                    <span className="text-zinc-400">Phòng chiếu:</span>
                    <span>{bookingDetails.tickets[0]?.seatName.split("-")[0] || "N/A"}</span>
                  </div>
                </div>
              </div>
            </div>

            <Separator className="bg-zinc-800" />

            {/* Tickets */}
            <div className="space-y-3" id="booking-detail-tickets">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <Ticket className="size-4 text-green-500" />
                Danh Sách Vé ({bookingDetails.tickets.length})
              </h3>
              <div className="rounded-lg border border-zinc-800 overflow-hidden">
                <Table>
                  <TableHeader>
                    <TableRow className="border-zinc-800 bg-zinc-800/50">
                      <TableHead className="text-zinc-400">Ghế</TableHead>
                      <TableHead className="text-zinc-400">Loại vé</TableHead>
                      <TableHead className="text-zinc-400 text-right">Giá vé</TableHead>
                    </TableRow>
                  </TableHeader>
                  <TableBody>
                    {bookingDetails.tickets.map((ticket) => (
                      <TableRow key={ticket.ticketId} className="border-zinc-800">
                        <TableCell className="font-medium">{ticket.seatName}</TableCell>
                        <TableCell>Vé thường</TableCell>
                        <TableCell className="text-right">{formatCurrency(ticket.price)}</TableCell>
                      </TableRow>
                    ))}
                  </TableBody>
                </Table>
              </div>
            </div>

            {/* Service Orders (Concessions) */}
            {bookingDetails.serviceOrders && bookingDetails.serviceOrders.length > 0 && (
              <div className="space-y-3" id="booking-detail-services">
                <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                  <Utensils className="size-4 text-orange-500" />
                  Dịch Vụ Ăn Uống
                </h3>
                <div className="rounded-lg border border-zinc-800 overflow-hidden">
                  <Table>
                    <TableHeader>
                      <TableRow className="border-zinc-800 bg-zinc-800/50">
                        <TableHead className="text-zinc-400">Tên dịch vụ</TableHead>
                        <TableHead className="text-zinc-400 text-center">Số lượng</TableHead>
                        <TableHead className="text-zinc-400 text-right">Đơn giá</TableHead>
                        <TableHead className="text-zinc-400 text-right">Thành tiền</TableHead>
                      </TableRow>
                    </TableHeader>
                    <TableBody>
                      {bookingDetails.serviceOrders.map((order) => (
                        <TableRow key={order.orderId} className="border-zinc-800">
                          <TableCell className="font-medium">{order.serviceName}</TableCell>
                          <TableCell className="text-center">{order.quantity}</TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.unitPrice)}
                          </TableCell>
                          <TableCell className="text-right">
                            {formatCurrency(order.subTotal)}
                          </TableCell>
                        </TableRow>
                      ))}
                    </TableBody>
                  </Table>
                </div>
              </div>
            )}

            <Separator className="bg-zinc-800" />

            {/* Payment Info */}
            <div className="space-y-3" id="booking-detail-payment">
              <h3 className="text-sm font-semibold text-zinc-300 flex items-center gap-2">
                <CreditCard className="size-4 text-yellow-500" />
                Thông Tin Thanh Toán
              </h3>
              <div className="rounded-lg border border-zinc-800 bg-zinc-800/30 p-4 space-y-2 text-sm">
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Phương thức thanh toán:</span>
                  <span className="font-medium">{bookingDetails.paymentProvider}</span>
                </div>
                <div className="flex justify-between items-center">
                  <span className="text-zinc-400">Trạng thái thanh toán:</span>
                  <Badge variant="outline" className="bg-zinc-900">
                    {bookingDetails.paymentStatus}
                  </Badge>
                </div>
                <div className="flex justify-between items-center text-base pt-2 border-t border-zinc-700 mt-2">
                  <span className="font-bold text-zinc-200">Tổng tiền:</span>
                  <span className="font-bold text-green-500 text-lg">
                    {formatCurrency(bookingDetails.totalAmount)}
                  </span>
                </div>
              </div>
            </div>
          </div>
        ) : (
          <div className="py-8 text-center text-zinc-400">Không tìm thấy thông tin đơn hàng.</div>
        )}
      </DialogContent>
    </Dialog>
  );
}
