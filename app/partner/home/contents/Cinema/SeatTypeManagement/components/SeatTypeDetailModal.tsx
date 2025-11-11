"use client";

import { memo, useCallback } from "react";
import {
  CalendarClock,
  Info,
  Palette,
  ShieldCheck,
  ShieldOff,
  Ticket,
  Tickets,
} from "lucide-react";
import Modal from "@/components/ui/modal";
import type { PartnerSeatTypeDetail } from "@/apis/partner.seat-type.api";
import { formatCurrency, formatDateTime } from "@/utils/format";
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface SeatTypeDetailModalProps {
  open: boolean;
  seatType: PartnerSeatTypeDetail | null;
  loading?: boolean;
  onClose: () => void;
}

const SeatTypeDetailModal = ({ open, seatType, loading, onClose }: SeatTypeDetailModalProps) => {
  const handleStartGuide = useCallback(() => {
    if (loading || !seatType) return;

    const steps = [
      {
        element: "#seat-type-detail-tour-header",
        popover: {
          title: "Tổng quan loại ghế",
          description: "Quan sát tên, mã và trạng thái hoạt động để nắm thông tin chính.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-type-detail-tour-pricing",
        popover: {
          title: "Phụ thu & màu sắc",
          description: "Theo dõi mức phụ thu và màu đại diện sẽ hiển thị trên sơ đồ ghế.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-type-detail-tour-stats",
        popover: {
          title: "Thống kê sử dụng",
          description: "Số lượng ghế tổng, đang hoạt động và tạm ngưng giúp kiểm soát phân bổ.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-type-detail-tour-description",
        popover: {
          title: "Mô tả chi tiết",
          description: "Đọc ghi chú để hiểu mục đích và cách áp dụng loại ghế này trong vận hành.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-type-detail-tour-meta",
        popover: {
          title: "Nhật ký cập nhật",
          description: "Nắm thời điểm tạo và chỉnh sửa cuối để quản lý lịch sử thay đổi.",
          side: "bottom" as const,
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
  }, [loading, seatType]);

  const statusBadge = seatType?.status ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
      <ShieldCheck className="size-3" />
      Đang hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-100">
      <ShieldOff className="size-3" />
      Ngừng hoạt động
    </span>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Chi tiết loại ghế"
      size="md"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child] button:text-[#f5f5f5]/70 [&>div:first-child] button:hover:text-white [&>div:first-child] button:hover:bg-[#27272a]"
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-[#1c1c1f]" />
          ))}
        </div>
      ) : seatType ? (
        <div className="space-y-5 text-[#f5f5f5]" id="seat-type-detail-tour-container">
          <div
            className="rounded-xl border border-[#27272a] bg-[#1c1c1f] p-5 shadow-lg shadow-black/40"
            id="seat-type-detail-tour-header"
          >
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#f5f5f5]">{seatType.name}</h3>
                <p className="text-xs text-[#9e9ea2]">#{seatType.id} • {seatType.code}</p>
              </div>
              <div className="flex items-center gap-3">
                {statusBadge}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartGuide}
                  className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
                  id="seat-type-detail-tour-guide-btn"
                >
                  <Info className="size-4" />
                  Hướng dẫn
                </Button>
              </div>
            </div>
            {seatType.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#f5f5f5]/80" id="seat-type-detail-tour-description">
                {seatType.description}
              </p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2" id="seat-type-detail-tour-pricing">
            <div className="flex items-start gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <Info className="mt-1 size-4 text-[#ff7a45]" />
              <div>
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Phụ thu</p>
                <p className="text-sm text-[#f5f5f5]">{formatCurrency(seatType.surcharge)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <Palette className="mt-1 size-4 text-[#ff7a45]" />
              <div>
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Màu sắc</p>
                <div className="flex items-center gap-2 text-sm text-[#f5f5f5]">
                  <span
                    className="size-5 rounded-full border border-[#3a3a3d]"
                    style={{ backgroundColor: seatType.color }}
                    aria-hidden
                  />
                  {seatType.color}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3" id="seat-type-detail-tour-stats">
            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#9e9ea2]">
                <Tickets className="size-4 text-[#ff7a45]" /> Tổng ghế
              </p>
              <p className="mt-2 text-lg font-semibold text-[#f5f5f5]">{seatType.totalSeats}</p>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#9e9ea2]">
                <ShieldCheck className="size-4 text-[#ff7a45]" /> Đang hoạt động
              </p>
              <p className="mt-2 text-lg font-semibold text-[#f5f5f5]">{seatType.activeSeats}</p>
            </div>
            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-[#9e9ea2]">
                <ShieldOff className="size-4 text-[#ff7a45]" /> Ngừng hoạt động
              </p>
              <p className="mt-2 text-lg font-semibold text-[#f5f5f5]">{seatType.inactiveSeats}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2" id="seat-type-detail-tour-meta">
            <div className="flex items-start gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <CalendarClock className="mt-1 size-4 text-[#ff7a45]" />
              <div>
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Ngày tạo</p>
                <p className="text-sm text-[#f5f5f5]">{formatDateTime(seatType.createdAt, { includeTime: true })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
              <CalendarClock className="mt-1 size-4 text-[#ff7a45]" />
              <div>
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Cập nhật lần cuối</p>
                <p className="text-sm text-[#f5f5f5]">{formatDateTime(seatType.updatedAt, { includeTime: true })}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-[#f5f5f5]">Không tìm thấy thông tin loại ghế.</div>
      )}
    </Modal>
  );
};

export default memo(SeatTypeDetailModal);
