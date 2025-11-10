"use client";

import { ChangeEvent, useEffect, useRef, useState } from "react";
import { XCircle } from "lucide-react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Textarea } from "@/components/ui/textarea";
import { cn } from "@/lib/utils";
import type { CinemaFormValues } from "../types";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import { useToast } from "@/components/ToastProvider";

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
  const { showToast } = useToast();
  const uploadMutation = useUploadToCloudinary();
  const [values, setValues] = useState<CinemaFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof CinemaFormValues, string>>>({});
  const fileInputRef = useRef<HTMLInputElement | null>(null);

  const baseInputClasses =
    "bg-[#27272a] text-[#f5f5f5] border border-[#3a3a3d] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30";
  const errorInputClasses =
    "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/40";
  const textareaClasses = "min-h-[120px]";
  const secondaryButtonClasses =
    "border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]";
  const primaryButtonClasses =
    "bg-[#ff7a45] text-[#151518] hover:bg-[#ff8d60] shadow-lg shadow-[#ff7a45]/40";
  const toggleButtonBase =
    "border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]";
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

  const handleLogoUpload = async (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result?.secure_url) {
        setValues((prev) => ({ ...prev, logoUrl: result.secure_url }));
        showToast("Tải logo thành công", undefined, "success");
      }
    } catch (error) {
      console.error(error);
      showToast("Tải logo thất bại", "Vui lòng thử lại sau", "error");
    } finally {
      if (fileInputRef.current) {
        fileInputRef.current.value = "";
      }
    }
  };

  const handleTriggerUpload = () => {
    fileInputRef.current?.click();
  };

  const handleRemoveLogo = () => {
    setValues((prev) => ({ ...prev, logoUrl: "" }));
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
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
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          {baseFieldConfig.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
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
                <p className="text-xs text-[#9e9ea2]">{field.helper}</p>
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
                <p className="text-xs text-[#9e9ea2]">{field.helper}</p>
              )}

              {field.key === "logoUrl" && (
                <div className="mt-2 space-y-3">
                  <div className="flex flex-wrap items-center gap-3">
                    <Button
                      type="button"
                      variant="outline"
                      className={`${secondaryButtonClasses} flex items-center gap-2 border-dashed border-[#3a3a3d] bg-transparent hover:bg-[#27272a]`}
                      onClick={handleTriggerUpload}
                      disabled={uploadMutation.isPending || submitting}
                    >
                      {uploadMutation.isPending ? "Đang tải..." : "Tải ảnh từ máy"}
                    </Button>
                    <input
                      ref={fileInputRef}
                      type="file"
                      accept="image/*"
                      className="hidden"
                      onChange={handleLogoUpload}
                    />
                    {values.logoUrl && (
                      <span className="text-xs text-[#9e9ea2]">
                        Ảnh đã chọn sẽ được hiển thị dưới đây.
                      </span>
                    )}
                  </div>

                  {values.logoUrl && (
                    <div className="flex items-center gap-4">
                      <div className="h-20 w-20 overflow-hidden rounded-lg border border-[#27272a] bg-[#151518]">
                        {/* eslint-disable-next-line @next/next/no-img-element */}
                        <img
                          src={values.logoUrl}
                          alt="Logo preview"
                          className="h-full w-full object-contain"
                        />
                      </div>
                      <Button
                        type="button"
                        variant="outline"
                        className={`${secondaryButtonClasses} text-rose-300 hover:text-rose-200`}
                        onClick={handleRemoveLogo}
                        disabled={uploadMutation.isPending || submitting}
                      >
                        Xoá logo
                      </Button>
                    </div>
                  )}
                </div>
              )}
            </div>
          ))}
        </div>

        {mode === "edit" ? (
          <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4 text-sm text-[#f5f5f5]">
            <h4 className="text-base font-medium text-[#f5f5f5]">Thông tin phòng chiếu</h4>
            <div className="mt-3 grid gap-3 md:grid-cols-2">
              <div className="rounded-md border border-[#27272a] bg-[#151518] p-3">
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Tổng số phòng chiếu</p>
                <p className="text-lg font-semibold text-[#f5f5f5]">
                  {initialValues.totalScreens || "—"}
                </p>
              </div>
              <div className="rounded-md border border-[#27272a] bg-[#151518] p-3">
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Phòng chiếu đang hoạt động</p>
                <p className="text-lg font-semibold text-[#f5f5f5]">
                  {initialValues.activeScreens || "—"}
                </p>
              </div>
            </div>
            <p className="mt-3 text-xs text-[#9e9ea2]">
              Các thông tin này được hệ thống cập nhật tự động từ dữ liệu phòng chiếu và không thể chỉnh sửa thủ công.
            </p>
          </div>
        ) : (
          <div className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] p-4 text-xs text-[#9e9ea2]">
            Sau khi tạo rạp, hệ thống sẽ tự động tính toán tổng số phòng chiếu và số phòng đang hoạt động dựa trên cấu hình phòng chiếu của bạn.
          </div>
        )}

        <div className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] px-4 py-3 text-xs text-[#9e9ea2]">
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
