"use client";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface CinemaDeleteDialogProps {
  open: boolean;
  cinemaName: string;
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const CinemaDeleteDialog = ({
  open,
  cinemaName,
  submitting,
  onConfirm,
  onClose,
}: CinemaDeleteDialogProps) => {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Xác nhận xoá rạp"
      size="sm"
      contentClassName="bg-[#101828] text-[#ccd0d7] border border-[#243164] [&>div:first-child]:border-[#243164] [&>div:first-child]:bg-[#101828] [&>div:first-child>h3]:text-[#e2e6eb] [&>div:first-child>button]:text-[#ccd0d7] [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#151e3c]"
    >
      <div className="space-y-5 text-[#ccd0d7]">
        <p className="text-sm text-[#ccd0d7]/90">
          Bạn có chắc chắn muốn xoá rạp
          <span className="font-semibold text-[#ff7a45]"> {cinemaName} </span>
          khỏi hệ thống? Hành động này không thể hoàn tác.
        </p>
        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border border-[#3b4a6b] bg-[#243164] text-[#ccd0d7] hover:bg-[#2c3b6a]"
          >
            Huỷ
          </Button>
          <Button
            onClick={onConfirm}
            disabled={submitting}
            className="bg-[#f97373] hover:bg-[#ff8d8d] text-[#101828] shadow-lg shadow-[#f97373]/40"
          >
            {submitting ? "Đang xoá..." : "Xoá rạp"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CinemaDeleteDialog;
