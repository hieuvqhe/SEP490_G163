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
      contentClassName="bg-[#101828] text-[#ccd0d7] border border-[#243164] [&>div:first-child]:border-[#243164] [&>div:first-child]:bg-[#101828] [&>div:first-child] h3:text-[#ccd0d7] [&>div:first-child] button:text-[#ccd0d7] [&>div:first-child] button:hover:text-white [&>div:first-child] button:hover:bg-[#151e3c]"
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(5)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-[#151e3c]" />
          ))}
        </div>
      ) : seatType ? (
        <div className="space-y-5 text-[#ccd0d7]">
          <div className="rounded-xl border border-[#243164] bg-[#151e3c] p-5 shadow-lg shadow-black/40">
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#f0f3f8]">{seatType.name}</h3>
                <p className="text-xs text-[#97a0b8]">#{seatType.id} • {seatType.code}</p>
              </div>
              {statusBadge}
            </div>
            {seatType.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#ccd0d7] opacity-90">{seatType.description}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <Info className="mt-1 size-4 text-orange-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300">Phụ thu</p>
                <p className="text-sm text-slate-100">{formatCurrency(seatType.surcharge)}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <Palette className="mt-1 size-4 text-orange-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300">Màu sắc</p>
                <div className="flex items-center gap-2 text-sm text-slate-100">
                  <span
                    className="size-5 rounded-full border border-slate-700"
                    style={{ backgroundColor: seatType.color }}
                    aria-hidden
                  />
                  {seatType.color}
                </div>
              </div>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-3">
            <div className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <Tickets className="size-4 text-orange-300" /> Tổng ghế
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">{seatType.totalSeats}</p>
            </div>
            <div className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <ShieldCheck className="size-4 text-orange-300" /> Đang hoạt động
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">{seatType.activeSeats}</p>
            </div>
            <div className="rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <p className="flex items-center gap-2 text-xs uppercase tracking-wide text-slate-300">
                <ShieldOff className="size-4 text-orange-300" /> Ngừng hoạt động
              </p>
              <p className="mt-2 text-lg font-semibold text-slate-100">{seatType.inactiveSeats}</p>
            </div>
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <div className="flex items-start gap-3 rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <CalendarClock className="mt-1 size-4 text-orange-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300">Ngày tạo</p>
                <p className="text-sm text-slate-100">{formatDateTime(seatType.createdAt, { includeTime: true })}</p>
              </div>
            </div>
            <div className="flex items-start gap-3 rounded-lg border border-slate-600/60 bg-slate-800/80 px-4 py-3">
              <CalendarClock className="mt-1 size-4 text-orange-300" />
              <div>
                <p className="text-xs uppercase tracking-wide text-slate-300">Cập nhật lần cuối</p>
                <p className="text-sm text-slate-100">{formatDateTime(seatType.updatedAt, { includeTime: true })}</p>
              </div>
            </div>
          </div>
        </div>
      ) : (
        <div className="text-center text-sm text-[#ccd0d7]">Không tìm thấy thông tin loại ghế.</div>
      )}
    </Modal>
  );
};

export default memo(SeatTypeDetailModal);
