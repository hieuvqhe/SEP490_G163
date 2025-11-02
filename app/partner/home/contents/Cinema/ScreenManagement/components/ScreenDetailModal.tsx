import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import type { DetailedPartnerScreen } from "../types";

type NonNullableScreen = NonNullable<DetailedPartnerScreen>;

interface ScreenDetailModalProps {
  open: boolean;
  onClose: () => void;
  screen: DetailedPartnerScreen;
  loading: boolean;
  onViewSeatLayout?: (screen: NonNullableScreen) => void;
}

const ScreenDetailModal = ({ open, onClose, screen, loading, onViewSeatLayout }: ScreenDetailModalProps) => (
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
      <div className="space-y-4 text-sm text-[#f5f5f5]">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Tên phòng chiếu" value={screen.screenName} />
          <InfoRow label="Mã phòng" value={screen.code} />
          <InfoRow label="Rạp" value={`${screen.cinemaName} (#${screen.cinemaId})`} />
          <InfoRow label="Loại phòng" value={screen.screenType} />
          <InfoRow label="Âm thanh" value={screen.soundSystem || "—"} />
          <InfoRow label="Trạng thái" value={screen.isActive ? "Đang hoạt động" : "Ngừng hoạt động"} />
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Sức chứa" value={`${screen.capacity} ghế`} />
          <InfoRow label="Bố trí ghế" value={`${screen.seatRows} hàng × ${screen.seatColumns} ghế`} />
        </div>
        <div>
          <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mô tả</p>
          <p className="mt-1 text-sm text-[#f5f5f5]/80">{screen.description || "—"}</p>
        </div>
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow
            label="Ngày tạo"
            value={new Date(screen.createdDate).toLocaleString("vi-VN")}
          />
          <InfoRow
            label="Cập nhật"
            value={new Date(screen.updatedDate).toLocaleString("vi-VN")}
          />
        </div>
        <div className="flex flex-wrap items-center justify-between gap-3 border-t border-[#27272a] pt-4">
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

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-3">
    <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">{label}</p>
    <p className="mt-1 text-sm text-[#f5f5f5]">{value}</p>
  </div>
);

export default ScreenDetailModal;
