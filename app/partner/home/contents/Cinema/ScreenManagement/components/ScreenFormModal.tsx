import { useCallback, useEffect, useState } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import Modal from "@/components/ui/modal";
import { Info } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
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

  const handleStartGuide = useCallback(() => {
    const isCreate = mode === "create";
    const steps = [
      {
        element: "#screen-form-tour-header",
        popover: {
          title: isCreate ? "Thêm phòng chiếu" : "Chỉnh sửa phòng",
          description: isCreate
            ? "Điền các thông tin bắt buộc để tạo phòng chiếu mới cho rạp đã chọn."
            : "Cập nhật thông tin phòng hiện có và kiểm tra lại trước khi lưu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-form-tour-required",
        popover: {
          title: "Thông tin nhận diện",
          description: "Tên phòng và mã nội bộ giúp định danh phòng chiếu trên hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-form-tour-type",
        popover: {
          title: "Loại & âm thanh",
          description: "Chọn loại phòng và mô tả hệ thống âm thanh để hỗ trợ hiển thị cho khách hàng.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-form-tour-capacity",
        popover: {
          title: "Sức chứa & bố trí ghế",
          description: "Nhập tổng số ghế, số hàng và số ghế mỗi hàng để hệ thống tạo sơ đồ phù hợp.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#screen-form-tour-description",
        popover: {
          title: "Mô tả tiện ích",
          description: "Ghi chú công nghệ, trang thiết bị hoặc thông tin nổi bật của phòng chiếu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
    ];

    if (!isCreate) {
      steps.push({
        element: "#screen-form-tour-status",
        popover: {
          title: "Trạng thái hoạt động",
          description: "Kích hoạt hoặc vô hiệu hoá phòng khi cần điều chỉnh lịch chiếu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      });
    }

    steps.push({
      element: "#screen-form-tour-actions",
      popover: {
        title: "Hoàn tất thao tác",
        description: "Nhấn Lưu để xác nhận hoặc Đóng để thoát mà không thay đổi dữ liệu.",
        side: "bottom" as const,
        align: "start" as const,
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
  }, [mode]);

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
      <div className="space-y-4" id="screen-form-tour-container">
        <div
          className="flex flex-col gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3 text-sm text-[#f5f5f5] md:flex-row md:items-center md:justify-between"
          id="screen-form-tour-header"
        >
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#f5f5f5]">
              {mode === "create" ? "Tạo phòng chiếu mới" : "Điều chỉnh thông tin phòng"}
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Chuẩn bị sẵn sức chứa và bố trí ghế để hoàn tất biểu mẫu nhanh chóng.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartGuide}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
            id="screen-form-tour-guide-btn"
          >
            <Info className="size-4" />
            Hướng dẫn biểu mẫu
          </Button>
        </div>

        <div className="grid gap-4 md:grid-cols-2" id="screen-form-tour-required">
          <div className="space-y-2" id="screen-form-tour-name">
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
          <div className="space-y-2" id="screen-form-tour-code">
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
          <div className="space-y-2" id="screen-form-tour-type">
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

        <div className="grid gap-4 md:grid-cols-3" id="screen-form-tour-capacity">
          <div className="space-y-2" id="screen-form-tour-capacity-total">
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
          <div className="space-y-2" id="screen-form-tour-seat-rows">
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
          <div className="space-y-2" id="screen-form-tour-seat-columns">
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

        <div className="space-y-2" id="screen-form-tour-description">
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
          <label
            className="flex items-center gap-3 rounded-md border border-[#3a3a3d] bg-[#27272a] px-4 py-3 text-sm text-[#f5f5f5]"
            id="screen-form-tour-status"
          >
            <input
              type="checkbox"
              checked={values.isActive}
              onChange={(event) => handleChange("isActive", event.target.checked)}
              className="size-4 rounded border border-[#3a3a3d] bg-[#151518]"
            />
            <span>Kích hoạt phòng chiếu</span>
          </label>
        )}

        <div className="flex justify-end gap-3" id="screen-form-tour-actions">
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
