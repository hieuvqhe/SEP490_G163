import { useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { screenTypeOptions } from "../constants";
import type { ScreenFormValues } from "../types";

interface ScreenFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: ScreenFormValues;
  onClose: () => void;
  onSubmit: (values: ScreenFormValues) => void;
  submitting?: boolean;
}

const ScreenFormModal = ({
  open,
  mode,
  initialValues,
  onClose,
  onSubmit,
  submitting,
}: ScreenFormModalProps) => {
  const [values, setValues] = useState<ScreenFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ScreenFormValues, string>>>({});

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);

  const handleChange = (
    field: keyof ScreenFormValues,
    value: string | boolean
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof ScreenFormValues, string>> = {};

    if (!values.screenName.trim()) nextErrors.screenName = "Vui lòng nhập tên phòng";
    if (!values.code.trim()) nextErrors.code = "Vui lòng nhập mã phòng";
    if (!values.capacity.trim()) nextErrors.capacity = "Vui lòng nhập sức chứa";
    if (!values.seatRows.trim()) nextErrors.seatRows = "Vui lòng nhập số hàng ghế";
    if (!values.seatColumns.trim()) nextErrors.seatColumns = "Vui lòng nhập số ghế mỗi hàng";

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "create" ? "Thêm phòng chiếu" : "Chỉnh sửa phòng chiếu"}
      size="lg"
      contentClassName="bg-[#111c3c] border border-[#243164] text-[#ccd0d7] [&>div>h3]:text-[#ff915f]"
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Tên phòng <span className="text-rose-400">*</span>
            </label>
            <Input
              value={values.screenName}
              onChange={(event) => handleChange("screenName", event.target.value)}
              className="bg-[#151e3c] border-[#243164] text-[#ccd0d7]"
            />
            {errors.screenName && (
              <p className="text-xs text-rose-400">{errors.screenName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Mã phòng <span className="text-rose-400">*</span>
            </label>
            <Input
              value={values.code}
              onChange={(event) => handleChange("code", event.target.value.toUpperCase())}
              className="bg-[#151e3c] border-[#243164] text-[#ccd0d7] uppercase"
            />
            {errors.code && (
              <p className="text-xs text-rose-400">{errors.code}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Loại phòng
            </label>
            <select
              value={values.screenType}
              onChange={(event) => handleChange("screenType", event.target.value)}
              className="h-9 rounded-md border border-[#243164] bg-[#151e3c] px-3 text-sm text-[#ccd0d7]"
            >
              {screenTypeOptions
                .filter((option) => option.value !== "all")
                .map((option) => (
                  <option key={option.value} value={option.value}>
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Hệ thống âm thanh
            </label>
            <Input
              value={values.soundSystem}
              onChange={(event) => handleChange("soundSystem", event.target.value)}
              className="bg-[#151e3c] border-[#243164] text-[#ccd0d7]"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Sức chứa <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={values.capacity}
              onChange={(event) => handleChange("capacity", event.target.value)}
              className="bg-[#151e3c] border-[#243164] text-[#ccd0d7]"
            />
            {errors.capacity && (
              <p className="text-xs text-rose-400">{errors.capacity}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Số hàng ghế <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={values.seatRows}
              onChange={(event) => handleChange("seatRows", event.target.value)}
              className="bg-[#151e3c] border-[#243164] text-[#ccd0d7]"
            />
            {errors.seatRows && (
              <p className="text-xs text-rose-400">{errors.seatRows}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
              Ghế mỗi hàng <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={values.seatColumns}
              onChange={(event) => handleChange("seatColumns", event.target.value)}
              className="bg-[#151e3c] border-[#243164] text-[#ccd0d7]"
            />
            {errors.seatColumns && (
              <p className="text-xs text-rose-400">{errors.seatColumns}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
            Mô tả chi tiết
          </label>
          <textarea
            value={values.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="min-h-[120px] w-full rounded-md border border-[#243164] bg-[#151e3c] p-3 text-sm text-[#ccd0d7] focus-visible:outline-none focus-visible:ring focus-visible:ring-orange-500/40"
            placeholder="Mô tả tiện ích, công nghệ, hoặc ghi chú nội bộ..."
          />
        </div>

        {mode === "edit" && (
          <label className="flex items-center gap-3 rounded-md border border-[#243164] bg-[#151e3c] px-4 py-3 text-sm text-[#ccd0d7]">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => handleChange("isActive", event.target.checked)}
              className="size-4 rounded border border-[#243164] bg-[#151e3c]"
            />
            <span>Kích hoạt phòng chiếu</span>
          </label>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border-[#3b4a6b] bg-[#243164] text-[#ccd0d7] hover:bg-[#2c3b6a]"
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#ff7a45] text-[#101828] hover:bg-[#ff915f] shadow-lg shadow-[#ff7a45]/40"
          >
            {submitting ? "Đang xử lý..." : mode === "create" ? "Thêm phòng" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScreenFormModal;
