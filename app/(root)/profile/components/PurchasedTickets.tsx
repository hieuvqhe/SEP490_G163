"use client";

import { useEffect, useState } from "react";
import {
  Pagination,
  PaginationContent,
  PaginationItem,
  PaginationNext,
  PaginationPrevious,
} from "@/components/ui/pagination";
import { useGetUserTickets } from "@/apis/user.tickets.api";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog"; // <--- Import Dialog
import { cn } from "@/lib/utils";
import Image from "next/image";
import {
  Clock,
  MapPin,
  Armchair,
  Ticket,
  Calendar,
  CreditCard,
  QrCode,
} from "lucide-react";
import OrangeSpinner from "@/components/OrangeSpinner";
import { QRCodeCanvas } from "qrcode.react";

// ================== TYPES ==================
export type TicketStatusFilter = "upcoming" | "past" | "all";

export interface UserTicket {
  ticketId: number;
  price: number;
  status: string;
  checkInStatus: string;
  checkInTime: string | null;
  ticketQR: string;
  booking: {
    bookingId: number;
    bookingCode: string;
    paymentStatus: string;
  };
  movie: {
    movieId: number;
    title: string;
    durationMinutes: number;
    posterUrl: string;
    genre: string;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    address: string;
  };
  showtime: {
    showtimeId: number;
    showDatetime: string;
    endTime: string;
  };
  seat: {
    seatId: number;
    seatName: string;
    seatType: string;
  };
}

export interface GetUserTicketsParams {
  page: number;
  pageSize: number;
  type: TicketStatusFilter;
}

export function formatDate(datetime: string) {
  const date = new Date(datetime);
  return date.toLocaleDateString("vi-VN"); // ví dụ: 25/11/2025
}

export function formatTime(datetime: string) {
  const date = new Date(datetime);
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  }); // ví dụ: 20:00
}

// ================== MAIN ==================
export default function PurchasedTickets() {
  const [page, setPage] = useState(1);
  const [statusParams, setStatusParams] = useState<"upcoming" | "past" | "all">(
    "all"
  );

  const { data, isLoading } = useGetUserTickets({
    page: page,
    pageSize: 6, // Tăng pageSize lên chút cho đẹp
    type: statusParams,
  });

  const items = data?.result.items ?? [];
  const totalPages = data?.result.totalPages ?? 1;

  useEffect(() => {
    console.log(items);
  }, [])

  return (
    <div className="w-full h-full flex flex-col">
      {/* Header */}
      <div className="mb-6 flex justify-between items-baseline-last">
        <div>
          <h1 className="text-3xl font-bold mb-2 bg-gradient-to-r from-purple-400 to-pink-400 bg-clip-text text-transparent">
            Vé Của Tôi
          </h1>
          <p className="text-white/60 text-sm">
            Quản lý tất cả vé xem phim của bạn
          </p>
        </div>
        <div className="flex items-center gap-2">
          <span className="text-sm text-zinc-400">Trạng thái:</span>
          <Select
            value={statusParams}
            onValueChange={(value) =>
              setStatusParams(value as TicketStatusFilter)
            }
          >
            <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-200">
              <SelectValue placeholder="Tất cả" />
            </SelectTrigger>
            <SelectContent className="bg-zinc-800 border-zinc-700 text-zinc-200">
              <SelectItem value="all">Tất cả</SelectItem>
              <SelectItem value="upcoming">Sắp chiếu</SelectItem>
              <SelectItem value="past">Đã chiếu</SelectItem>
            </SelectContent>
          </Select>
        </div>
      </div>

      {/* List */}
      <div className="flex-1 overflow-y-auto space-y-3 pr-2 custom-scrollbar">
        {isLoading ? (
          <div className="flex flex-col h-full w-full justify-center items-center">
            <OrangeSpinner />
          </div>
        ) : items.length === 0 ? (
          <div className="flex flex-col items-center justify-center h-full text-white/40">
            {/* Nếu bạn có file ảnh này thì giữ nguyên, ko thì thay bằng icon */}
            <Ticket className="w-20 h-20 opacity-20 mb-4" />
            <p className="text-base">Không có vé nào</p>
          </div>
        ) : (
          items.map((ticket) => (
            <TicketCard key={ticket.ticketId} ticket={ticket} />
          ))
        )}
      </div>

      {/* Pagination */}
      
        <Pagination className="justify-end mt-4">
          <PaginationContent className="">
            <PaginationItem>
              <PaginationPrevious
                onClick={() => page > 1 && setPage(page - 1)}
                className={cn(
                  "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer",
                  page <= 1 &&
                    "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              />
            </PaginationItem>

            <span className="px-6 py-2 text-white/90 font-medium select-none">
              {page} / {totalPages}
            </span>

            <PaginationItem>
              <PaginationNext
                onClick={() => page < totalPages && setPage(page + 1)}
                className={cn(
                  "text-white/70 hover:text-white hover:bg-white/10 cursor-pointer",
                  page >= totalPages &&
                    "opacity-50 cursor-not-allowed pointer-events-none"
                )}
              />
            </PaginationItem>
          </PaginationContent>
        </Pagination>
    

      <style jsx global>{`
        .custom-scrollbar::-webkit-scrollbar {
          width: 6px;
        }
        .custom-scrollbar::-webkit-scrollbar-track {
          background: rgba(255, 255, 255, 0.05);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb {
          background: rgba(168, 85, 247, 0.4);
          border-radius: 10px;
        }
        .custom-scrollbar::-webkit-scrollbar-thumb:hover {
          background: rgba(168, 85, 247, 0.6);
        }
      `}</style>
    </div>
  );
}

// ================== TICKET CARD & DIALOG ==================
export function TicketCard({ ticket }: { ticket: UserTicket }) {
  const { movie, cinema, showtime, seat, booking } = ticket;

  const isExpired = new Date(showtime.endTime) < new Date();
  const isUsed = ticket.checkInStatus === "CHECKED_IN";

  // Hàm render trạng thái dùng chung
  const renderStatusBadge = () => {
    if (isUsed) {
      return (
        <div className="bg-green-500/20 text-green-400 border border-green-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Đã sử dụng
        </div>
      );
    }
    if (isExpired) {
      return (
        <div className="bg-red-500/20 text-red-400 border border-red-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
          Hết hạn
        </div>
      );
    }
    return (
      <div className="bg-blue-500/20 text-blue-400 border border-blue-500/30 text-[10px] font-bold px-2 py-0.5 rounded-full uppercase tracking-wider">
        Sẵn sàng
      </div>
    );
  };

  return (
    <Dialog>
      {/* Trigger: Chính là cái TicketCard cũ */}
      <DialogTrigger asChild>
        <div
          className={cn(
            "group relative flex items-stretch bg-zinc-900/50 backdrop-blur-md border border-white/10 rounded-2xl overflow-hidden transition-all duration-300 hover:bg-zinc-800/80 cursor-pointer"
          )}
        >
          {/* Decorative gradient overlay */}
          <div className="absolute inset-0 bg-gradient-to-r from-purple-500/5 via-transparent to-pink-500/5 opacity-0 group-hover:opacity-100 transition-opacity duration-300" />

          {/* Movie Poster (Small thumbnail) */}
          <div className="relative flex-shrink-0 w-24">
            <Image
              src={movie.posterUrl}
              alt={movie.title}
              width={96}
              height={140}
              className="h-full w-full object-cover"
            />
            {/* Status overlay on poster */}
            <div className="absolute top-2 left-2">{renderStatusBadge()}</div>
          </div>

          {/* Ticket Info Summary */}
          <div className="flex-1 p-3 flex flex-col justify-between relative z-10">
            {/* Title */}
            <div>
              <h3 className="text-base font-bold text-white mb-0.5 line-clamp-1">
                {movie.title}
              </h3>
              <p className="text-xs text-purple-300/80 font-medium">
                {movie.genre} • {movie.durationMinutes} phút
              </p>
            </div>

            {/* Details Grid (Compact) */}
            <div className="mt-2 grid grid-cols-2 gap-2 text-xs">
              <div className="flex items-center gap-1.5 text-white/80">
                <MapPin className="w-3 h-3 flex-shrink-0 text-purple-400" />
                <p className="font-semibold text-white/90 truncate">
                  {cinema.cinemaName}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-white/80">
                <Calendar className="w-3 h-3 flex-shrink-0 text-pink-400" />
                <p className="font-semibold text-white/90 truncate">
                  {formatDate(showtime.showDatetime)}
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-white/80">
                <Armchair className="w-3 h-3 flex-shrink-0 text-blue-400" />
                <p>
                  Ghế{" "}
                  <span className="font-semibold text-white/90">
                    {seat.seatName}
                  </span>
                </p>
              </div>

              <div className="flex items-center gap-1.5 text-white/80">
                <Clock className="w-3 h-3 flex-shrink-0 text-orange-400" />
                <p className="font-bold text-white/90">
                  {formatTime(showtime.showDatetime)}
                </p>
              </div>
            </div>
          </div>

          {/* Torn Edge Effect (Visual Only) */}
          <div
            className="w-4 h-full bg-transparent relative border-l border-dashed border-white/20"
            style={{
              backgroundImage:
                "radial-gradient(circle at 0 10px, transparent 0, transparent 4px, #18181b 4px)", // Màu nền hack cho giống rách
              backgroundSize: "100% 20px",
              backgroundPosition: "-10px 0",
            }}
          />
        </div>
      </DialogTrigger>

      {/* Content: Ticket Details Dialog */}
      <DialogContent className="!max-w-4xl !w-[95vw] p-0 gap-0 bg-zinc-900 border-zinc-800 text-white overflow-hidden rounded-2xl">
        <div className="flex flex-col md:flex-row h-full md:h-[500px]">
          {/* TAB BÊN TRÁI: Thông tin chi tiết */}
          <div className="flex-1 p-6 flex flex-col relative overflow-hidden">
            {/* Background Blur Image */}
            <div className="absolute inset-0 z-0">
              <Image
                src={movie.posterUrl}
                alt="bg"
                fill
                className="object-cover opacity-10 blur-xl"
              />
              <div className="absolute inset-0 bg-gradient-to-t from-zinc-900 via-zinc-900/90 to-zinc-900/60" />
            </div>

            <DialogHeader className="relative z-10 mb-6 flex-shrink-0 text-left">
              <div className="flex items-start gap-4">
                {/* Poster trong Dialog */}
                <div className="relative w-24 h-36 rounded-lg overflow-hidden shadow-2xl border border-white/10 flex-shrink-0 hidden sm:block">
                  <Image
                    src={movie.posterUrl}
                    alt={movie.title}
                    fill
                    className="object-cover"
                  />
                </div>
                <div>
                  <DialogTitle className="text-2xl md:text-3xl font-bold bg-gradient-to-r from-white to-white/70 bg-clip-text text-transparent mb-2">
                    {movie.title}
                  </DialogTitle>
                  <div className="flex flex-wrap gap-2 mb-3">
                    {renderStatusBadge()}
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-medium text-white/80 border border-white/5">
                      {movie.genre}
                    </span>
                    <span className="bg-white/10 px-2 py-0.5 rounded text-[11px] font-medium text-white/80 border border-white/5">
                      {movie.durationMinutes} phút
                    </span>
                  </div>
                  <div className="flex items-center text-sm text-zinc-400 gap-1">
                    <Ticket className="w-4 h-4 text-purple-400" /> Mã đặt vé:{" "}
                    <span className="text-white font-mono font-bold tracking-wider">
                      {booking.bookingCode}
                    </span>
                  </div>
                </div>
              </div>
            </DialogHeader>

            {/* Chi tiết vé */}
            <div className="relative z-10 grid grid-cols-2 gap-y-6 gap-x-4 flex-1 content-start">
              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <MapPin className="w-3 h-3" /> Rạp chiếu
                </span>
                <p className="font-medium text-lg text-white leading-tight">
                  {cinema.cinemaName}
                </p>
                <p className="text-xs text-zinc-400">{cinema.address}</p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Calendar className="w-3 h-3" /> Ngày giờ
                </span>
                <p className="font-medium text-lg text-white">
                  {formatTime(showtime.showDatetime)}
                </p>
                <p className="text-sm text-zinc-300 capitalize">
                  {formatDate(showtime.showDatetime)}
                </p>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <Armchair className="w-3 h-3" /> Vị trí ghế
                </span>
                <div className="flex items-baseline gap-2">
                  <p className="font-bold text-2xl text-purple-400">
                    {seat.seatName}
                  </p>
                  <span className="text-xs text-zinc-500 border border-zinc-700 px-1.5 rounded">
                    {seat.seatType}
                  </span>
                </div>
              </div>

              <div className="space-y-1">
                <span className="text-xs text-zinc-500 uppercase font-bold tracking-wider flex items-center gap-1.5">
                  <CreditCard className="w-3 h-3" /> Giá vé
                </span>
                <p className="font-medium text-lg text-white">
                  {ticket.price.toLocaleString()} đ
                </p>
              </div>
            </div>

            <div className="relative z-10 mt-auto pt-4 border-t border-white/10">
              <p className="text-[10px] text-zinc-500 text-center">
                Vui lòng đưa mã QR cho nhân viên soát vé khi vào rạp.
              </p>
            </div>
          </div>

          {/* Đường cắt vé (Visual separator) */}
          <div className="hidden md:flex flex-col relative w-8 items-center justify-center">
            <div className="absolute inset-y-0 left-1/2 w-[1px] border-l-2 border-dashed border-zinc-700"></div>
            <div className="absolute -top-4 w-8 h-8 rounded-full bg-zinc-950 z-20"></div>
            <div className="absolute -bottom-4 w-8 h-8 rounded-full bg-zinc-950 z-20"></div>
          </div>

          {/* TAB BÊN PHẢI: QR Code (Placeholder) */}
          <div className="w-full md:w-[35%] bg-black/40 border-l border-white/5 flex flex-col items-center justify-center gap-5 p-6 relative">
            <div className="absolute top-4 right-4 md:hidden"></div>
            <p className="text-zinc-400 text-sm font-medium text-center">
              Quét mã để vào rạp
            </p>
            <div className="bg-white p-4 rounded-xl shadow-lg mb-4 opacity-80">
              <div className="w-48 h-48 bg-zinc-200 flex items-center justify-center rounded text-zinc-400">
                {/* <QrCode className="w-12 h-12 opacity-50" /> */}
                {ticket.ticketQR && (
                  <QRCodeCanvas
                    value={ticket.ticketQR} // dữ liệu để mã QR hiển thị
                    size={200} // kích thước px
                    bgColor="#ffffff" // màu nền
                    fgColor="#000000" // màu QR
                    level="H" // mức độ sửa lỗi (L, M, Q, H)
                  />
                )}
              </div>
            </div>
          </div>
        </div>
      </DialogContent>
    </Dialog>
  );
}
