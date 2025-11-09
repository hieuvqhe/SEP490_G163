"use client";

import { useMemo } from "react";
import Modal from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import type { PartnerCombo } from "@/apis/partner.combo.api";
import { formatCurrency } from "../utils";

interface ComboDetailModalProps {
  open: boolean;
  combo?: PartnerCombo | null;
  loading?: boolean;
  onClose: () => void;
}

const ComboDetailModal = ({ open, combo, loading, onClose }: ComboDetailModalProps) => {
  const statusBadge = useMemo(() => {
    if (!combo) return null;
    const active = combo.isAvailable;
    return (
      <Badge
        variant="outline"
        className={
          active
            ? "border-emerald-500/40 bg-emerald-500/10 text-emerald-200"
            : "border-rose-500/40 bg-rose-500/10 text-rose-200"
        }
      >
        {active ? "Đang bán" : "Tạm ngưng"}
      </Badge>
    );
  }, [combo]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Thông tin combo"
      size="md"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-5">
        {loading ? (
          <div className="space-y-3">
            {[...Array(4)].map((_, index) => (
              <div key={index} className="h-4 animate-pulse rounded bg-[#27272a]" />
            ))}
          </div>
        ) : combo ? (
          <div className="space-y-5">
            <div className="flex items-start justify-between gap-4">
              <div>
                <h3 className="text-xl font-semibold text-[#f5f5f5]">{combo.name}</h3>
                <p className="text-xs text-[#9e9ea2]">Mã combo: {combo.code}</p>
              </div>
              {statusBadge}
            </div>

            {combo.imageUrl ? (
              <div className="overflow-hidden rounded-lg border border-[#27272a] bg-[#1c1c1f]">
                <img
                  src={combo.imageUrl}
                  alt={combo.name}
                  className="max-h-64 w-full object-cover"
                />
              </div>
            ) : (
              <div className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] p-4 text-xs text-[#9e9ea2]">
                Combo chưa có ảnh minh hoạ.
              </div>
            )}

            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4">
              <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Giá bán</p>
              <p className="mt-2 text-xl font-semibold text-[#ff7a45]">{formatCurrency(combo.price)}</p>
            </div>

            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4">
              <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mô tả</p>
              <p className="mt-2 text-sm leading-6 text-[#d0d0d3]">
                {combo.description || "Không có mô tả"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2">
              <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4 text-sm text-[#9e9ea2]">
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Ngày tạo</p>
                <p className="mt-1 text-sm text-[#f5f5f5]">
                  {new Date(combo.createdAt).toLocaleString("vi-VN")}
                </p>
              </div>
              <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4 text-sm text-[#9e9ea2]">
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Cập nhật lần cuối</p>
                <p className="mt-1 text-sm text-[#f5f5f5]">
                  {new Date(combo.updatedAt).toLocaleString("vi-VN")}
                </p>
              </div>
            </div>

            <div className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] p-4 text-xs text-[#9e9ea2]">
              Link ảnh combo: {combo.imageUrl || "Chưa có"}
            </div>
          </div>
        ) : (
          <p className="text-sm text-[#9e9ea2]">Không tìm thấy thông tin combo.</p>
        )}
      </div>
    </Modal>
  );
};

export default ComboDetailModal;
