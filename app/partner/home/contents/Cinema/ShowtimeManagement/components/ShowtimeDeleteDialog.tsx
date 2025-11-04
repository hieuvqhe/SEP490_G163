import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import type { ShowtimeListItem } from "../types";
import { formatShowtimeDate, formatShowtimeTime } from "../utils";

interface ShowtimeDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  showtime?: ShowtimeListItem | null;
  onConfirm: () => void;
  submitting?: boolean;
}

const ShowtimeDeleteDialog = ({
  open,
  onClose,
  showtime,
  onConfirm,
  submitting,
}: ShowtimeDeleteDialogProps) => {
  const movieTitle = showtime?.movie?.title ?? `Phim #${showtime?.movieId ?? "?"}`;
  const screenName = showtime?.screen?.name ?? `Phòng #${showtime?.screenId ?? "?"}`;

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Xoá suất chiếu"
      size="sm"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-4">
        <div className="space-y-2 text-sm text-[#f5f5f5]/85">
          <p>
            Bạn có chắc chắn muốn xoá suất chiếu của phim <span className="font-semibold text-[#ff7a45]">{movieTitle}</span> tại phòng <span className="font-semibold text-[#ff7a45]">{screenName}</span>?
          </p>
          {showtime && (
            <p className="text-xs text-[#9e9ea2]">
              Thời gian: {formatShowtimeDate(showtime.startTime)} • {formatShowtimeTime(showtime.startTime)} - {formatShowtimeTime(showtime.endTime)}
            </p>
          )}
          <p className="text-xs text-[#9e9ea2]">
            Hành động này sẽ vô hiệu hoá suất chiếu khỏi hệ thống quản lý đối tác.
          </p>
        </div>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]"
          >
            Huỷ
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="border border-rose-500/50 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
          >
            {submitting ? "Đang xử lý..." : "Xoá suất chiếu"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShowtimeDeleteDialog;
