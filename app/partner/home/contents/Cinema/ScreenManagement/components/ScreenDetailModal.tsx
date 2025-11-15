import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import { Info } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import type { DetailedPartnerScreen } from "../types";

type NonNullableScreen = NonNullable<DetailedPartnerScreen>;

interface ScreenDetailModalProps {
  open: boolean;
  onClose: () => void;
  screen: DetailedPartnerScreen;
  loading: boolean;
  onViewSeatLayout?: (screen: NonNullableScreen) => void;
}

const ScreenDetailModal = ({ open, onClose, screen, loading, onViewSeatLayout }: ScreenDetailModalProps) => {
  const handleStartGuide = useCallback(() => {
    if (loading || !screen) return;

    const steps = [
      {
        element: "#screen-detail-tour-header",
        popover: {
          title: "Tổng quan phòng chiếu",
          description: "Theo dõi tên, mã phòng và trạng thái hoạt động của phòng này.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-detail-tour-basic",
        popover: {
          title: "Thông tin cơ bản",
          description: "Đối chiếu rạp, loại phòng và hệ thống âm thanh để đảm bảo dữ liệu chính xác.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-detail-tour-capacity",
        popover: {
          title: "Sức chứa & bố trí",
          description: "Kiểm tra tổng số ghế cùng bố cục hàng ghế nhằm quản lý sơ đồ hiệu quả.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-detail-tour-description",
        popover: {
          title: "Mô tả chi tiết",
          description: "Ghi chú các tiện ích nổi bật hoặc yêu cầu đặc biệt của phòng chiếu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-detail-tour-meta",
        popover: {
          title: "Nhật ký cập nhật",
          description: "Theo dõi thời điểm tạo và cập nhật cuối để nắm lịch sử thay đổi.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-detail-tour-actions",
        popover: {
          title: "Sơ đồ ghế",
          description: screen.hasSeatLayout
            ? "Mở sơ đồ ghế để kiểm tra hoặc chỉnh sửa bố trí ghế."
            : "Phòng chưa có sơ đồ ghế—hãy tạo mới từ trang Sơ đồ ghế.",
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
  }, [loading, screen]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Thông tin phòng chiếu"
      size="lg"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      {loading ? (
        <div className="flex items-center justify-center py-10 text-sm text-[#9e9ea2]">
          Đang tải dữ liệu phòng...
        </div>
      ) : !screen ? (
        <div className="flex items-center justify-center py-10 text-sm text-[#9e9ea2]">
          Không tìm thấy thông tin phòng chiếu.
        </div>
      ) : (
        <div className="space-y-4 text-sm text-[#f5f5f5]" id="screen-detail-tour-container">
          <div className="flex flex-col gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3 md:flex-row md:items-center md:justify-between" id="screen-detail-tour-header">
            <div className="space-y-1">
              <p className="text-base font-semibold text-[#f5f5f5]">{screen.screenName}</p>
              <p className="text-xs text-[#9e9ea2]">Mã phòng: {screen.code}</p>
            </div>
            <Button
              variant="outline"
              size="sm"
              onClick={handleStartGuide}
              className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
              id="screen-detail-tour-guide-btn"
            >
              <Info className="size-4" />
              Hướng dẫn
            </Button>
          </div>

          <div className="grid gap-4 md:grid-cols-2" id="screen-detail-tour-basic">
            <InfoRow label="Rạp" value={`${screen.cinemaName} (#${screen.cinemaId})`} />
            <InfoRow label="Loại phòng" value={screen.screenType} />
            <InfoRow label="Âm thanh" value={screen.soundSystem || "—"} />
            <InfoRow label="Trạng thái" value={screen.isActive ? "Đang hoạt động" : "Ngừng hoạt động"} />
          </div>

          <div className="grid gap-4 md:grid-cols-2" id="screen-detail-tour-capacity">
            <InfoRow label="Sức chứa" value={`${screen.capacity} ghế`} />
            <InfoRow label="Bố trí ghế" value={`${screen.seatRows} hàng × ${screen.seatColumns} ghế`} />
          </div>

          <div id="screen-detail-tour-description">
            <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mô tả</p>
            <p className="mt-1 text-sm text-[#f5f5f5]/80">{screen.description || "—"}</p>
          </div>

          <div className="grid gap-4 md:grid-cols-2" id="screen-detail-tour-meta">
            <InfoRow label="Ngày tạo" value={new Date(screen.createdDate).toLocaleString("vi-VN")}
            />
            <InfoRow label="Cập nhật" value={new Date(screen.updatedDate).toLocaleString("vi-VN")} />
          </div>

          <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#27272a] pt-4" id="screen-detail-tour-actions">
            <div className="text-xs text-[#9e9ea2]">
              {screen.hasSeatLayout
                ? "Nhấn nút bên cạnh để xem sơ đồ ghế chi tiết."
                : "Phòng này chưa có sơ đồ ghế khả dụng."}
            </div>
            <Button
              size="sm"
              disabled={!screen.hasSeatLayout || !onViewSeatLayout}
              onClick={() => screen && onViewSeatLayout?.(screen)}
              className="bg-[#ff7a45] text-[#151518] hover:bg-[#ff8d60] disabled:cursor-not-allowed disabled:bg-[#27272a] disabled:text-[#9e9ea2]"
            >
              Xem chi tiết sơ đồ ghế
            </Button>
          </div>
        </div>
      )}
    </Modal>
  );
};

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-3">
    <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">{label}</p>
    <p className="mt-1 text-sm text-[#f5f5f5]">{value}</p>
  </div>
);

export default ScreenDetailModal;
