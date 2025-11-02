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
    contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
  >
    <div className="space-y-4">
      <p className="text-sm text-[#f5f5f5]/85">
        Bạn có chắc chắn muốn vô hiệu hoá phòng <span className="font-semibold text-[#ff7a45]">{screenName}</span>? Hành động này có thể được hoàn tác bằng cách kích hoạt lại phòng.
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
          className="border border-rose-500/40 bg-rose-500/20 text-rose-200 hover:bg-rose-500/30"
        >
          {submitting ? "Đang xử lý..." : "Vô hiệu hoá"}
        </Button>
      </div>
    </div>
  </Modal>
);

export default ScreenDeleteDialog;
