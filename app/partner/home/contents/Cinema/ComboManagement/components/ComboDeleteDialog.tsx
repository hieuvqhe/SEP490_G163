"use client";

import Modal from "@/components/ui/modal";
import { Button } from "@/components/ui/button";

interface ComboDeleteDialogProps {
  open: boolean;
  comboName: string;
  submitting?: boolean;
  onConfirm: () => void;
  onClose: () => void;
}

const ComboDeleteDialog = ({
  open,
  comboName,
  submitting,
  onConfirm,
  onClose,
}: ComboDeleteDialogProps) => {
  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title="Xác nhận xoá combo"
      size="sm"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-5 text-[#f5f5f5]">
        <p className="text-sm text-[#f5f5f5]/80">
          Bạn có chắc chắn muốn xoá combo
          <span className="font-semibold text-[#ff7a45]"> {comboName} </span>
          khỏi hệ thống? Hành động này không thể hoàn tác.
        </p>
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
