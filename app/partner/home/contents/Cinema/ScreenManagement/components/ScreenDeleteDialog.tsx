import { Button } from "@/components/ui/button";
import Modal from "@/components/ui/modal";

interface ScreenDeleteDialogProps {
  open: boolean;
  onClose: () => void;
  screenName: string;
  onConfirm: () => void;
  submitting?: boolean;
}

const ScreenDeleteDialog = ({
  open,
  onClose,
  screenName,
  onConfirm,
  submitting,
}: ScreenDeleteDialogProps) => (
  <Modal
    isOpen={open}
    onClose={onClose}
    title="Vô hiệu hoá phòng chiếu"
    size="sm"
      contentClassName="bg-[#111c3c] border border-[#243164] text-[#ccd0d7] [&>div>h3]:text-[#ff915f]"
  >
    <div className="space-y-4">
      <p className="text-sm text-[#ccd0d7]">
        Bạn có chắc chắn muốn vô hiệu hoá phòng <span className="font-semibold text-white">{screenName}</span>? Hành động này có thể được hoàn tác bằng cách kích hoạt lại phòng.
      </p>
      <div className="flex justify-end gap-3">
        <Button
          variant="outline"
          onClick={onClose}
          disabled={submitting}
          className="border-[#3b4a6b] bg-[#243164] text-[#ccd0d7] hover:bg-[#2c3b6a]"
        >
          Huỷ
        </Button>
        <Button
          onClick={onConfirm}
          disabled={submitting}
          className="border border-rose-500/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
        >
          {submitting ? "Đang xử lý..." : "Vô hiệu hoá"}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ScreenDeleteDialog;
