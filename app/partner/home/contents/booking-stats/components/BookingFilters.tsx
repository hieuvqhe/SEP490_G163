import React from "react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Calendar } from "@/components/ui/calendar";
import { CalendarIcon, Filter, RefreshCw, X } from "lucide-react";
import { format } from "date-fns";
import { vi } from "date-fns/locale";
import { cn } from "@/lib/utils";
import { useGetPartnerCinemas } from "@/apis/partner.cinema.api";

interface BookingFiltersProps {
  filters: {
    fromDate: string;
    toDate: string;
    cinemaId: string;
    status: string;
    paymentStatus: string;
    customerEmail: string;
    customerPhone: string;
    bookingCode: string;
  };
  showFilters: boolean;
  onFilterChange: (key: string, value: string) => void;
  onClearFilters: () => void;
  onToggleFilters: () => void;
  onRefresh: () => void;
}

export function BookingFilters({
  filters,
  showFilters,
  onFilterChange,
  onClearFilters,
  onToggleFilters,
  onRefresh,
}: BookingFiltersProps) {
  const { data: cinemasData } = useGetPartnerCinemas({ limit: 100 });
  const cinemas = cinemasData?.result.cinemas || [];

  const handleDateSelect = (key: "fromDate" | "toDate", date: Date | undefined) => {
    if (date) {
      onFilterChange(key, format(date, "yyyy-MM-dd"));
    } else {
      onFilterChange(key, "");
    }
  };

  return (
    <div className="flex flex-col gap-4">
      <div className="flex flex-wrap items-center justify-between gap-4">
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onToggleFilters}
            className={cn("gap-2", showFilters && "bg-zinc-800 text-zinc-100")}
          >
            <Filter className="size-4" />
            Bộ lọc
          </Button>
          <Button variant="outline" size="sm" onClick={onRefresh} className="gap-2">
            <RefreshCw className="size-4" />
            Làm mới
          </Button>
          {(filters.fromDate ||
            filters.toDate ||
            filters.cinemaId ||
            filters.status ||
            filters.paymentStatus ||
            filters.customerEmail ||
            filters.customerPhone ||
            filters.bookingCode) && (
            <Button
              variant="ghost"
              size="sm"
              onClick={onClearFilters}
              className="gap-2 text-red-400 hover:text-red-300 hover:bg-red-950/20"
            >
              <X className="size-4" />
              Xóa bộ lọc
            </Button>
          )}
        </div>
      </div>

      {showFilters && (
        <div className="grid grid-cols-1 gap-4 rounded-lg border border-zinc-800 bg-zinc-900/50 p-4 sm:grid-cols-2 lg:grid-cols-4">
          {/* Date Range */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Từ ngày</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.fromDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {filters.fromDate ? (
                    format(new Date(filters.fromDate), "dd/MM/yyyy")
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
                <Calendar
                  mode="single"
                  selected={filters.fromDate ? new Date(filters.fromDate) : undefined}
                  onSelect={(date: Date | undefined) => handleDateSelect("fromDate", date)}
                  initialFocus
                  locale={vi}
                  className="bg-zinc-900"
                />
              </PopoverContent>
            </Popover>
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Đến ngày</label>
            <Popover>
              <PopoverTrigger asChild>
                <Button
                  variant="outline"
                  className={cn(
                    "w-full justify-start text-left font-normal",
                    !filters.toDate && "text-muted-foreground"
                  )}
                >
                  <CalendarIcon className="mr-2 size-4" />
                  {filters.toDate ? (
                    format(new Date(filters.toDate), "dd/MM/yyyy")
                  ) : (
                    <span>Chọn ngày</span>
                  )}
                </Button>
              </PopoverTrigger>
              <PopoverContent className="w-auto p-0 bg-zinc-900 border-zinc-700" align="start">
                <Calendar
                  mode="single"
                  selected={filters.toDate ? new Date(filters.toDate) : undefined}
                  onSelect={(date: Date | undefined) => handleDateSelect("toDate", date)}
                  initialFocus
                  locale={vi}
                  className="bg-zinc-900"
                />
              </PopoverContent>
            </Popover>
          </div>

          {/* Cinema Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Rạp chiếu</label>
            <Select
              value={filters.cinemaId}
              onValueChange={(value) => onFilterChange("cinemaId", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả rạp" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Tất cả rạp</SelectItem>
                {cinemas.map((cinema) => (
                  <SelectItem key={cinema.cinemaId} value={cinema.cinemaId.toString()}>
                    {cinema.cinemaName}
                  </SelectItem>
                ))}
              </SelectContent>
            </Select>
          </div>

          {/* Status Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Trạng thái</label>
            <Select
              value={filters.status}
              onValueChange={(value) => onFilterChange("status", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả trạng thái" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Tất cả trạng thái</SelectItem>
                <SelectItem value="PENDING">Đang chờ</SelectItem>
                <SelectItem value="CONFIRMED">Đã xác nhận</SelectItem>
                <SelectItem value="CANCELLED">Đã hủy</SelectItem>
                <SelectItem value="COMPLETED">Hoàn thành</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Payment Status Select */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Thanh toán</label>
            <Select
              value={filters.paymentStatus}
              onValueChange={(value) => onFilterChange("paymentStatus", value)}
            >
              <SelectTrigger>
                <SelectValue placeholder="Tất cả" />
              </SelectTrigger>
              <SelectContent className="bg-zinc-900 border-zinc-700">
                <SelectItem value="all">Tất cả</SelectItem>
                <SelectItem value="PENDING">Chưa thanh toán</SelectItem>
                <SelectItem value="PAID">Đã thanh toán</SelectItem>
                <SelectItem value="FAILED">Thất bại</SelectItem>
                <SelectItem value="REFUNDED">Đã hoàn tiền</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Search Inputs */}
          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Mã đặt vé</label>
            <Input
              placeholder="Nhập mã đặt vé..."
              value={filters.bookingCode}
              onChange={(e) => onFilterChange("bookingCode", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">Email khách hàng</label>
            <Input
              placeholder="Nhập email..."
              value={filters.customerEmail}
              onChange={(e) => onFilterChange("customerEmail", e.target.value)}
            />
          </div>

          <div className="space-y-2">
            <label className="text-xs font-medium text-zinc-400">SĐT khách hàng</label>
            <Input
              placeholder="Nhập số điện thoại..."
              value={filters.customerPhone}
              onChange={(e) => onFilterChange("customerPhone", e.target.value)}
            />
          </div>
        </div>
      )}
    </div>
  );
}
