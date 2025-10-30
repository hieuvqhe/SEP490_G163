import Modal from "@/components/ui/modal";
import type { DetailedPartnerScreen } from "../types";

interface ScreenDetailModalProps {
  open: boolean;
  onClose: () => void;
  screen: DetailedPartnerScreen;
  loading: boolean;
}

const ScreenDetailModal = ({ open, onClose, screen, loading }: ScreenDetailModalProps) => (
  <Modal
    isOpen={open}
    onClose={onClose}
    title="Thông tin phòng chiếu"
    size="lg"
      contentClassName="bg-[#111c3c] border border-[#243164] text-[#ccd0d7] [&>div>h3]:text-[#ff915f]"
  >
    {loading ? (
      <div className="flex items-center justify-center py-10 text-sm text-slate-300">
        Đang tải dữ liệu phòng...
      </div>
    ) : !screen ? (
      <div className="flex items-center justify-center py-10 text-sm text-slate-400">
        Không tìm thấy thông tin phòng chiếu.
      </div>
    ) : (
      <div className="space-y-4 text-sm text-[#ccd0d7]">
        <div className="grid gap-4 md:grid-cols-2">
          <InfoRow label="Tên phòng" value={screen.screenName} />
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
          <p className="text-xs uppercase tracking-wide text-[#97a0b8]">Mô tả</p>
          <p className="mt-1 text-sm text-[#ccd0d7]">{screen.description || "—"}</p>
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
      </div>
    )}
  </Modal>
);

const InfoRow = ({ label, value }: { label: string; value: string }) => (
  <div className="rounded-lg border border-[#243164] bg-[#151e3c] p-3">
    <p className="text-xs uppercase tracking-wide text-[#97a0b8]">{label}</p>
    <p className="mt-1 text-sm text-[#f0f3f8]">{value}</p>
  </div>
);

export default ScreenDetailModal;
