"use client";

import { memo, type ReactNode } from "react";
import { CalendarClock, Mail, MapPin, Phone, ScreenShare, ToggleLeft } from "lucide-react";
import Modal from "@/components/ui/modal";
import type { CinemaLike } from "../types";

interface CinemaDetailModalProps {
  open: boolean;
  cinema: CinemaLike | null;
  loading?: boolean;
  onClose: () => void;
}

const DetailRow = ({ label, value, icon }: { label: string; value?: string | number | null; icon?: ReactNode }) => (
  <div className="flex items-start gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3">
    <div className="mt-1 text-[#ff7a45]">{icon}</div>
    <div className="flex-1">
      <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">{label}</p>
      <p className="text-sm text-[#f5f5f5]">{value ?? "—"}</p>
    </div>
  </div>
);

const CinemaDetailModal = ({ open, cinema, loading, onClose }: CinemaDetailModalProps) => {
  const statusBadge = cinema?.isActive ? (
    <span className="inline-flex items-center gap-2 rounded-full border border-emerald-400/60 bg-emerald-500/20 px-3 py-1 text-xs font-semibold text-emerald-100">
      <span className="size-1.5 rounded-full bg-emerald-300" />
      Đang hoạt động
    </span>
  ) : (
    <span className="inline-flex items-center gap-2 rounded-full border border-rose-400/60 bg-rose-500/20 px-3 py-1 text-xs font-semibold text-rose-100">
      <span className="size-1.5 rounded-full bg-rose-300" />
      Ngừng hoạt động
    </span>
  );

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Thông tin chi tiết rạp"
      size="lg"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      {loading ? (
        <div className="space-y-4">
          {[...Array(6)].map((_, index) => (
            <div key={index} className="h-16 animate-pulse rounded-lg bg-[#1c1c1f]" />
          ))}
        </div>
      ) : cinema ? (
        <div className="space-y-5 text-[#f5f5f5]">
          <div className="rounded-xl border border-[#27272a] bg-[#1c1c1f] p-5 shadow-lg shadow-black/40">
            <div className="flex flex-col gap-3 text-[#f5f5f5] md:flex-row md:items-center md:justify-between">
              <div>
                <h3 className="text-xl font-semibold text-[#f5f5f5]">{cinema.cinemaName}</h3>
                <p className="text-xs text-[#9e9ea2]">#{cinema.cinemaId}</p>
              </div>
              {statusBadge}
            </div>
            {cinema.description && (
              <p className="mt-4 text-sm leading-relaxed text-[#f5f5f5]/80">{cinema.description}</p>
            )}
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailRow label="Địa chỉ" value={cinema.address} icon={<MapPin className="size-4" />} />
            <DetailRow label="Thành phố" value={cinema.city} icon={<MapPin className="size-4" />} />
            <DetailRow label="Quận / Huyện" value={cinema.district} icon={<MapPin className="size-4" />} />
            <DetailRow label="Email" value={cinema.email} icon={<Mail className="size-4" />} />
            <DetailRow label="Số điện thoại" value={cinema.phone} icon={<Phone className="size-4" />} />
            <DetailRow label="Tọa độ" value={`${cinema.latitude}, ${cinema.longitude}`} icon={<MapPin className="size-4" />} />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailRow
              label="Tổng số phòng chiếu"
              value={cinema.totalScreens}
              icon={<ScreenShare className="size-4" />}
            />
            <DetailRow
              label="Phòng chiếu đang hoạt động"
              value={cinema.activeScreens}
              icon={<ToggleLeft className="size-4" />}
            />
          </div>

          <div className="grid gap-4 md:grid-cols-2">
            <DetailRow
              label="Ngày tạo"
              value={cinema.createdAt ? new Date(cinema.createdAt).toLocaleString("vi-VN") : undefined}
              icon={<CalendarClock className="size-4" />}
            />
            <DetailRow
              label="Cập nhật lần cuối"
              value={cinema.updatedAt ? new Date(cinema.updatedAt).toLocaleString("vi-VN") : undefined}
              icon={<CalendarClock className="size-4" />}
            />
          </div>

          {cinema.logoUrl && (
            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4">
              <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Logo</p>
              <div className="mt-3 flex items-center justify-center rounded-lg bg-[#151518]/60 p-3">
                {/* eslint-disable-next-line @next/next/no-img-element */}
                <img
                  src={cinema.logoUrl}
                  alt={cinema.cinemaName}
                  className="h-24 w-24 rounded-lg border border-[#27272a] bg-[#151518] object-contain"
                />
              </div>
            </div>
          )}
        </div>
      ) : (
        <div className="text-center text-sm text-[#f5f5f5]">Không tìm thấy thông tin rạp.</div>
      )}
    </Modal>
  );
};

export default memo(CinemaDetailModal);
