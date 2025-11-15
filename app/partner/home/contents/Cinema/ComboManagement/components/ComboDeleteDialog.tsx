"use client";

import { useCallback } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import Modal from "@/components/ui/modal";
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

interface ComboDeleteDialogProps {
  open: boolean;
  comboName: string;
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ComboDeleteDialog = ({ open, comboName, submitting, onConfirm, onClose }: ComboDeleteDialogProps) => {
  const handleStartGuide = useCallback(() => {
    const steps: GuideStep[] = [
      {
        element: "#combo-delete-tour-header",
        popover: {
          title: "Xác nhận xoá combo",
          description:
            "Thông báo cảnh báo cho biết rõ tên combo sẽ bị xoá vĩnh viễn. Hãy đọc kỹ trước khi xác nhận thao tác.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-delete-tour-message",
        popover: {
          title: "Nội dung cảnh báo",
          description: "Đoạn mô tả nhấn mạnh hành động không thể hoàn tác và nhắc lại tên combo chuẩn bị xoá.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#combo-delete-tour-actions",
        popover: {
          title: "Tuỳ chọn thao tác",
          description: "Bạn có thể Huỷ để quay lại hoặc chọn Xoá combo để xác nhận hành động vĩnh viễn.",
          side: "top",
          align: "center",
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
  }, [comboName]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Xác nhận xoá combo"
      size="sm"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-5 text-[#f5f5f5]">
        <div className="flex items-start justify-between gap-3" id="combo-delete-tour-header">
          <div className="flex items-center gap-2 text-sm text-[#f5f5f5]/80">
            <Info className="size-4 text-[#ff7a45]" />
            <span>
              Bạn có chắc chắn muốn xoá combo
              <span className="font-semibold text-[#ff7a45]"> {comboName} </span>
              khỏi hệ thống?
            </span>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartGuide}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] transition hover:bg-[#27272a]"
            id="combo-delete-tour-guide-btn"
          >
            Hướng dẫn
          </Button>
        </div>

        <p className="text-sm text-[#f5f5f5]/80" id="combo-delete-tour-message">
          Hành động này không thể hoàn tác. Nếu tiếp tục, combo sẽ bị xoá hoàn toàn khỏi hệ thống đối tác.
        </p>

        <div className="flex justify-end gap-3" id="combo-delete-tour-actions">
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
            className="bg-[#f97373] text-[#151518] shadow-lg shadow-[#f97373]/40 hover:bg-[#ff8d8d]"
          >
            {submitting ? "Đang xoá..." : "Xoá combo"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ComboDeleteDialog;
