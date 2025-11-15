import { useCallback } from "react";
import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";
import type { ShowtimeListItem } from "../types";
import { formatShowtimeDate, formatShowtimeTime } from "../utils";
import { Info } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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

  const handleStartGuide = useCallback(() => {
    const steps: {
      element: string;
      popover: {
        title: string;
        description: string;
        side: "bottom" | "right";
        align: "start";
      };
    }[] = [
      {
        element: "#showtime-delete-tour-message",
        popover: {
          title: "Xác nhận xoá suất chiếu",
          description:
            "Đọc kỹ thông tin phim và phòng chiếu trước khi xác nhận xoá. Hành động này không thể hoàn tác.",
          side: "bottom",
          align: "start",
        },
      },
    ];

    if (showtime) {
      steps.push({
        element: "#showtime-delete-tour-schedule",
        popover: {
          title: "Thời gian chiếu",
          description:
            "Kiểm tra ngày giờ suất chiếu để đảm bảo bạn đang thao tác đúng lịch cần loại bỏ.",
          side: "bottom",
          align: "start",
        },
      });
    }

    steps.push({
      element: "#showtime-delete-tour-actions",
      popover: {
        title: "Tuỳ chọn hành động",
        description: "Chọn Huỷ để giữ nguyên suất chiếu, hoặc Xoá suất chiếu để vô hiệu hoá lịch này.",
        side: "right",
        align: "start",
      },
    });

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [showtime]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Xoá suất chiếu"
      size="sm"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-4" id="showtime-delete-tour-container">
        <div className="flex items-start justify-between gap-3" id="showtime-delete-tour-message">
          <div className="space-y-2 text-sm text-[#f5f5f5]/85">
            <p>
              Bạn có chắc chắn muốn xoá suất chiếu của phim <span className="font-semibold text-[#ff7a45]">{movieTitle}</span> tại phòng <span className="font-semibold text-[#ff7a45]">{screenName}</span>?
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Hành động này sẽ vô hiệu hoá suất chiếu khỏi hệ thống quản lý đối tác.
            </p>
          </div>
          <Button
            variant="outline"
            size="icon"
            onClick={handleStartGuide}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
            id="showtime-delete-tour-guide-btn"
            aria-label="Hướng dẫn xoá suất chiếu"
          >
            <Info className="size-4" />
          </Button>
        </div>
        {showtime && (
          <div className="text-xs text-[#9e9ea2]" id="showtime-delete-tour-schedule">
            Thời gian: {formatShowtimeDate(showtime.startTime)} • {formatShowtimeTime(showtime.startTime)} - {formatShowtimeTime(showtime.endTime)}
          </div>
        )}
        <div className="flex justify-end gap-3" id="showtime-delete-tour-actions">
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
