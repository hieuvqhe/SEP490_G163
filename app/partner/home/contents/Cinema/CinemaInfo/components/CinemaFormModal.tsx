"use client";

import { ChangeEvent, useEffect, useState } from "react";
import { XCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CinemaFormValues } from "../types";

interface CinemaFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: CinemaFormValues;
  submitting?: boolean;
  onSubmit: (values: CinemaFormValues) => void;
  onClose: () => void;
}

type TextFieldKey = Extract<keyof CinemaFormValues, string>;

interface FieldConfig {
  key: TextFieldKey;
  label: string;
  placeholder?: string;
  type?: string;
  required?: boolean;
  helper?: string;
}

const baseFieldConfig: FieldConfig[] = [
  {
    key: "cinemaName",
    label: "Tên rạp",
    placeholder: "",
    helper: "Nhập tên thương mại của rạp chiếu (ví dụ: CGV Long Biên).",
    required: true,
  },
  {
    key: "code",
    label: "Mã rạp",
    placeholder: "",
    helper: "Nhập mã nội bộ để nhận diện rạp, không dấu và không khoảng trắng.",
    required: true,
  },
  {
    key: "address",
    label: "Địa chỉ",
    placeholder: "",
    helper: "Địa chỉ chi tiết để khách hàng dễ dàng tìm thấy rạp.",
    required: true,
  },
  {
    key: "city",
    label: "Thành phố",
    placeholder: "",
    helper: "Tỉnh/Thành phố nơi rạp hoạt động.",
    required: true,
  },
  {
    key: "district",
    label: "Quận / Huyện",
    placeholder: "",
    helper: "Quận/Huyện nơi đặt rạp.",
    required: true,
  },
  {
    key: "phone",
    label: "Số điện thoại",
    placeholder: "",
    helper: "Số điện thoại liên hệ chính của rạp.",
  },
  {
    key: "email",
    label: "Email",
    placeholder: "",
    helper: "Email quản lý hoặc tiếp nhận liên hệ.",
    type: "email",
  },
  {
    key: "latitude",
    label: "Vĩ độ",
    placeholder: "",
    helper: "Nhập vĩ độ theo toạ độ Google Maps (ví dụ: 21.0278).",
    type: "number",
    required: true,
  },
  {
    key: "longitude",
    label: "Kinh độ",
    placeholder: "",
    helper: "Nhập kinh độ theo toạ độ Google Maps (ví dụ: 105.8342).",
    type: "number",
    required: true,
  },
];

const optionalFieldConfig: FieldConfig[] = [
  {
    key: "logoUrl",
    label: "Logo (URL)",
    placeholder: "",
    helper: "Đường dẫn ảnh logo của rạp (tùy chọn).",
  },
];

const CinemaFormModal = ({
  open,
  mode,
  initialValues,
  submitting,
  onSubmit,
  onClose,
}: CinemaFormModalProps) => {
  const [values, setValues] = useState<CinemaFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CinemaFormValues, string>>>({});

  const baseInputClasses =
    "bg-[#151e3c] text-[#ccd0d7] border border-[#243164] placeholder:text-[#8a91a3] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30";
  const errorInputClasses =
    "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/40";
  const textareaClasses =
    "min-h-[120px]";
  const secondaryButtonClasses =
    "border border-[#3b4a6b] bg-[#243164] text-[#ccd0d7] hover:bg-[#2c3b6a]";
  const primaryButtonClasses =
    "bg-[#ff7a45] text-[#101828] hover:bg-[#ff915f] shadow-lg shadow-[#ff7a45]/40";
  const toggleButtonBase =
    "border border-[#3b4a6b] bg-[#243164] text-[#ccd0d7] hover:bg-[#2c3b6a]";
  const getInputClassName = (key: TextFieldKey) =>
    cn(baseInputClasses, errors[key] && errorInputClasses);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);

  const handleChange = (key: keyof CinemaFormValues, value: string | boolean) => {
    setValues((prev) => ({ ...prev, [key]: value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof CinemaFormValues, string>> = {};

    baseFieldConfig.forEach((field) => {
      if (field.required && !values[field.key]) {
        nextErrors[field.key] = `Vui lòng nhập ${field.label.toLowerCase()}`;
      }
    });

    if (values.email && !/^[\w-.]+@([\w-]+\.)+[\w-]{2,4}$/.test(values.email)) {
      nextErrors.email = "Email không hợp lệ";
    }

    if (values.phone && !/^[0-9+\s-]{6,}$/.test(values.phone)) {
      nextErrors.phone = "Số điện thoại không hợp lệ";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  const title = mode === "create" ? "Tạo rạp chiếu mới" : "Chỉnh sửa thông tin rạp";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="lg"
      contentClassName="bg-[#101828] text-[#ccd0d7] border border-[#243164] [&>div:first-child]:border-[#243164] [&>div:first-child]:bg-[#101828] [&>div:first-child>h3]:text-[#e2e6eb] [&>div:first-child>button]:text-[#ccd0d7] [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#151e3c]"
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {baseFieldConfig.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
                {field.label}
              </label>
              <Input
                type={field.type ?? "text"}
                value={values[field.key] as string}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(field.key, event.target.value)
                }
                placeholder={field.placeholder}
                className={getInputClassName(field.key)}
              />
              {field.helper && (
                <p className="text-xs text-[#97a0b8]">{field.helper}</p>
              )}
              {errors[field.key] && (
                <span className="text-xs text-rose-400">{errors[field.key]}</span>
              )}
            </div>
          ))}
        </div>

        <div className="grid gap-4">
          {optionalFieldConfig.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[#ccd0d7]">
                {field.label}
              </label>
              <Input
                type={field.type ?? "text"}
                value={values[field.key] as string}
                onChange={(event: ChangeEvent<HTMLInputElement>) =>
                  handleChange(field.key, event.target.value)
                }
                placeholder={field.placeholder}
                className={getInputClassName(field.key)}
              />
              {field.helper && (
                <p className="text-xs text-[#97a0b8]">{field.helper}</p>
              )}
            </div>
          ))}
        </div>

        {mode === "edit" ? (
          <div className="rounded-lg border border-[#243164] bg-[#151e3c] p-4 text-sm text-[#ccd0d7]">
            <h4 className="text-base font-medium text-[#f0f3f8]">Thông tin phòng chiếu</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-[#243164] bg-[#0b1224] p-3">
                <p className="text-xs uppercase tracking-wide text-[#97a0b8]">Tổng số phòng chiếu</p>
                <p className="text-lg font-semibold text-[#ccd0d7]">
                  {initialValues.totalScreens || "—"}
                </p>
              </div>
              <div className="rounded-md border border-[#243164] bg-[#0b1224] p-3">
                <p className="text-xs uppercase tracking-wide text-[#97a0b8]">Phòng chiếu đang hoạt động</p>
                <p className="text-lg font-semibold text-[#ccd0d7]">
                  {initialValues.activeScreens || "—"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#8f9ab6]">
              Các thông tin này được hệ thống cập nhật tự động từ dữ liệu phòng chiếu và không thể chỉnh sửa thủ công.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#243164] bg-[#151e3c] p-4 text-xs text-[#97a0b8]">
            Sau khi tạo rạp, hệ thống sẽ tự động tính toán tổng số phòng chiếu và số phòng đang hoạt động dựa trên cấu hình phòng chiếu của bạn.
          </div>
        )}

        <div className="rounded-lg border border-dashed border-[#243164] bg-[#151e3c] px-4 py-3 text-xs text-[#97a0b8]">
          Trạng thái hoạt động của rạp sẽ được hệ thống quản lý tự động. Khi tạo mới, rạp sẽ ở trạng thái hoạt động và sẽ được chuyển sang ngừng hoạt động khi bạn xoá rạp.
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className={secondaryButtonClasses}
          >
            Huỷ
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting}
            className={primaryButtonClasses}
          >
            {submitting ? "Đang xử lý..." : mode === "create" ? "Tạo mới" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default CinemaFormModal;
