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
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-4">
        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Tên phòng <span className="text-rose-400">*</span>
            </label>
            <Input
              value={values.screenName}
              onChange={(event) => handleChange("screenName", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.screenName && (
              <p className="text-xs text-rose-400">{errors.screenName}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Mã phòng <span className="text-rose-400">*</span>
            </label>
            <Input
              value={values.code}
              onChange={(event) => handleChange("code", event.target.value.toUpperCase())}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] uppercase focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.code && (
              <p className="text-xs text-rose-400">{errors.code}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Loại phòng
            </label>
            <select
              value={values.screenType}
              onChange={(event) => handleChange("screenType", event.target.value)}
              className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
            >
              {screenTypeOptions
                .filter((option) => option.value !== "all")
                .map((option) => (
                  <option key={option.value} value={option.value} className="bg-[#151518] text-[#f5f5f5]">
                    {option.label}
                  </option>
                ))}
            </select>
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Hệ thống âm thanh
            </label>
            <Input
              value={values.soundSystem}
              onChange={(event) => handleChange("soundSystem", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Sức chứa <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={values.capacity}
              onChange={(event) => handleChange("capacity", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.capacity && (
              <p className="text-xs text-rose-400">{errors.capacity}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Số hàng ghế <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={values.seatRows}
              onChange={(event) => handleChange("seatRows", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.seatRows && (
              <p className="text-xs text-rose-400">{errors.seatRows}</p>
            )}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Ghế mỗi hàng <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={1}
              value={values.seatColumns}
              onChange={(event) => handleChange("seatColumns", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.seatColumns && (
              <p className="text-xs text-rose-400">{errors.seatColumns}</p>
            )}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
            Mô tả chi tiết
          </label>
          <textarea
            value={values.description}
            onChange={(event) => handleChange("description", event.target.value)}
            className="min-h-[120px] w-full rounded-md border border-[#3a3a3d] bg-[#27272a] p-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring focus-visible:ring-[#ff7a45]/40"
            placeholder="Mô tả tiện ích, công nghệ, hoặc ghi chú nội bộ..."
          />
        </div>

        {mode === "edit" && (
          <label className="flex items-center gap-3 rounded-md border border-[#3a3a3d] bg-[#27272a] px-4 py-3 text-sm text-[#f5f5f5]">
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => handleChange("isActive", event.target.checked)}
              className="size-4 rounded border border-[#3a3a3d] bg-[#151518]"
            />
            <span>Kích hoạt phòng chiếu</span>
          </label>
        )}

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]"
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#ff7a45] text-[#151518] hover:bg-[#ff8d60] shadow-lg shadow-[#ff7a45]/40"
          >
            {submitting ? "Đang xử lý..." : mode === "create" ? "Thêm phòng" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ScreenFormModal;
