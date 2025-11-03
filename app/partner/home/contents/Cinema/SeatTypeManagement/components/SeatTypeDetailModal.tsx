"use client";

import { memo } from "react";
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

interface SeatTypeDetailModalProps {
  open: boolean;
  seatType: PartnerSeatTypeDetail | null;
  loading?: boolean;
  onClose: () => void;
}

const SeatTypeDetailModal = ({ open, seatType, loading, onClose }: SeatTypeDetailModalProps) => {
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
        <div className="space-y-5 text-[#f5f5f5]">
          <div className="rounded-xl border border-[#27272a] bg-[#1c1c1f] p-5 shadow-lg shadow-black/40">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#f5f5f5]">{seatType.name}</h3>
                <p className="text-xs text-[#9e9ea2]">#{seatType.id} • {seatType.code}</p>
              </div>
              {statusBadge}
            </div>
            {seatType.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#f5f5f5]/80">{seatType.description}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
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

          <div className="grid gap-4 md:grid-cols-3">
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

          <div className="grid gap-4 md:grid-cols-2">
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
