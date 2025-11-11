"use client";

import { useCallback, useMemo } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import Modal from "@/components/ui/modal";
import { Badge } from "@/components/ui/badge";
import type { PartnerCombo } from "@/apis/partner.combo.api";
import { formatCurrency } from "../utils";
import { Button } from "@/components/ui/button";
import { Info } from "lucide-react";

type GuideStep = {
  element: string;
  popover: {
    title: string;
    description: string;
    side: "top" | "bottom" | "left" | "right";
    align: "start" | "center";
  };
};

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

  const handleStartGuide = useCallback(() => {
    const steps: GuideStep[] = [
      {
        element: "#combo-detail-tour-header",
        popover: {
          title: "Thông tin combo",
          description:
            "Xem nhanh tên, mã và trạng thái kinh doanh của combo. Sử dụng nút hướng dẫn để xem lại tour bất cứ lúc nào.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-detail-tour-image",
        popover: {
          title: "Ảnh minh hoạ",
          description: "Hình ảnh và link đi kèm giúp bạn xác nhận đúng combo đang xem và hỗ trợ truyền thông.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-detail-tour-price",
        popover: {
          title: "Giá bán",
          description: "Giá lẻ hiển thị với định dạng tiền tệ chuẩn, dùng để tham chiếu khi cập nhật hoặc báo cáo.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-detail-tour-description",
        popover: {
          title: "Mô tả chi tiết",
          description: "Nội dung mô tả giúp nhân viên nắm rõ thành phần combo và ghi chú quan trọng khi phục vụ.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-detail-tour-meta",
        popover: {
          title: "Lịch sử cập nhật",
          description: "Theo dõi thời điểm tạo và chỉnh sửa gần nhất để quản lý vòng đời combo hiệu quả.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-detail-tour-link",
        popover: {
          title: "Liên kết ảnh",
          description: "Giữ lại link ảnh gốc để tiện thay thế hoặc tái sử dụng cho các chiến dịch khác.",
          side: "bottom",
          align: "start",
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
  }, []);

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
            <div className="flex items-start justify-between gap-4" id="combo-detail-tour-header">
              <div>
                <h3 className="text-xl font-semibold text-[#f5f5f5]">{combo.name}</h3>
                <p className="text-xs text-[#9e9ea2]">Mã combo: {combo.code}</p>
              </div>
              <div className="flex items-center gap-2">
                {statusBadge}
                <Button
                  variant="outline"
                  size="sm"
                  onClick={handleStartGuide}
                  className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] transition hover:bg-[#27272a]"
                  id="combo-detail-tour-guide-btn"
                >
                  <Info className="mr-1 size-4" /> Hướng dẫn
                </Button>
              </div>
            </div>

            {combo.imageUrl ? (
              <div className="overflow-hidden rounded-lg border border-[#27272a] bg-[#1c1c1f]" id="combo-detail-tour-image">
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

            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4" id="combo-detail-tour-price">
              <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Giá bán</p>
              <p className="mt-2 text-xl font-semibold text-[#ff7a45]">{formatCurrency(combo.price)}</p>
            </div>

            <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4" id="combo-detail-tour-description">
              <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mô tả</p>
              <p className="mt-2 text-sm leading-6 text-[#d0d0d3]">
                {combo.description || "Không có mô tả"}
              </p>
            </div>

            <div className="grid gap-4 md:grid-cols-2" id="combo-detail-tour-meta">
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

            <div className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] p-4 text-xs text-[#9e9ea2]" id="combo-detail-tour-link">
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
