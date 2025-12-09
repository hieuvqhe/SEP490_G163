"use client";

import { ChangeEvent, useCallback, useEffect, useRef, useState } from "react";
import { Info } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CinemaFormValues } from "../types";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import { useToast } from "@/components/ToastProvider";
import LocationPicker from "./LocationPicker";

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

  const handleLocationChange = (lat: number, lng: number) => {
    setValues((prev) => ({
      ...prev,
      latitude: lat.toString(),
      longitude: lng.toString(),
    }));
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

  const handleStartGuide = useCallback(() => {
    const isCreate = mode === "create";
    const steps = [
      {
        element: "#cinema-form-tour-header",
        popover: {
          title: isCreate ? "Tạo rạp mới" : "Chỉnh sửa rạp",
          description: isCreate
            ? "Điền đầy đủ thông tin để thêm một rạp mới vào hệ thống đối tác. Các trường có dấu * là bắt buộc."
            : "Cập nhật thông tin rạp hiện có. Kiểm tra kỹ các trường quan trọng trước khi lưu thay đổi.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-form-tour-required",
        popover: {
          title: "Thông tin nhận diện",
          description: "Cung cấp tên rạp, mã nội bộ, địa chỉ và khu vực hoạt động để hệ thống quản lý chính xác.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-form-tour-location",
        popover: {
          title: "Chọn vị trí trên bản đồ",
          description: "Sử dụng bản đồ tương tác để chọn vị trí rạp chính xác. Bạn có thể click vào bản đồ, kéo marker hoặc tìm kiếm địa điểm.",
          side: "right" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-form-tour-phone",
        popover: {
          title: "Thông tin liên hệ",
          description: "Bổ sung số điện thoại và email để khách hàng và hệ thống gửi thông báo khi cần.",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-form-tour-logo",
        popover: {
          title: "Logo rạp",
          description: "Tải lên logo thương hiệu để hiển thị nhất quán trên các kênh bán vé của TicketXpress.",
          side: "right" as const,
          align: "start" as const,
        },
      },
    ];

    if (!isCreate) {
      steps.push({
        element: "#cinema-form-tour-summary",
        popover: {
          title: "Số liệu phòng chiếu",
          description: "Theo dõi tổng số phòng chiếu và số phòng đang hoạt động được đồng bộ tự động bởi hệ thống.",
          side: "left" as const,
          align: "start" as const,
        },
      });
    }

    steps.push({
      element: "#cinema-form-tour-status",
      popover: {
        title: "Chính sách trạng thái",
        description: "Trạng thái rạp được kích hoạt tự động khi tạo mới và sẽ chuyển sang ngừng hoạt động khi bạn xoá rạp.",
        side: "left" as const,
        align: "start" as const,
      },
    });

    steps.push({
      element: "#cinema-form-tour-actions",
      popover: {
        title: "Hoàn tất thao tác",
        description: "Sau khi kiểm tra, nhấn Lưu để xác nhận hoặc Huỷ để đóng biểu mẫu mà không thay đổi dữ liệu.",
        side: "left" as const,
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

  const validate = () => {
    const nextErrors: Partial<Record<keyof CinemaFormValues, string>> = {};

    baseFieldConfig.forEach((field) => {
      if (field.required && !values[field.key]) {
        nextErrors[field.key] = `Vui lòng nhập ${field.label.toLowerCase()}`;
      }
    });

    // Validate coordinates
    if (!values.latitude || values.latitude === "" || parseFloat(values.latitude as string) === 0) {
      nextErrors.latitude = "Vui lòng chọn vị trí rạp trên bản đồ";
    }

    if (!values.longitude || values.longitude === "" || parseFloat(values.longitude as string) === 0) {
      nextErrors.longitude = "Vui lòng chọn vị trí rạp trên bản đồ";
    }

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
      <div className="space-y-6" id="cinema-form-tour-container">
        <div
          className="flex flex-col gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3 text-sm text-[#f5f5f5] md:flex-row md:items-center md:justify-between"
          id="cinema-form-tour-header"
        >
          <div className="space-y-1">
            <p className="text-base font-semibold text-[#f5f5f5]">
              {mode === "create" ? "Thêm rạp đối tác mới" : "Điều chỉnh thông tin rạp"}
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Vui lòng chuẩn bị sẵn dữ liệu liên hệ và toạ độ Google Maps để thao tác nhanh chóng.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartGuide}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
            id="cinema-form-tour-guide-btn"
          >
            <Info className="size-4" />
            Hướng dẫn biểu mẫu
          </Button>
        </div>

        <div className="grid gap-4" id="cinema-form-tour-required">
          {baseFieldConfig.map((field) => (
            <div
              key={field.key}
              className="flex flex-col gap-2"
              id={`cinema-form-tour-${field.key}`}
            >
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

        <div className="space-y-2" id="cinema-form-tour-location">
          <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
            Vị trí rạp chiếu <span className="text-rose-400">*</span>
          </label>
          <LocationPicker
            latitude={values.latitude}
            longitude={values.longitude}
            onLocationChange={handleLocationChange}
          />
          {(errors.latitude || errors.longitude) && (
            <span className="text-xs text-rose-400">
              {errors.latitude || errors.longitude}
            </span>
          )}
        </div>

        <div className="grid gap-4" id="cinema-form-tour-optional">
          {optionalFieldConfig.map((field) => (
            <div
              key={field.key}
              className="flex flex-col gap-2"
              id={field.key === "logoUrl" ? "cinema-form-tour-logo" : undefined}
            >
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
          <div
            className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4 text-sm text-[#f5f5f5]"
            id="cinema-form-tour-summary"
          >
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

        <div
          className="rounded-lg border border-dashed border-[#27272a] bg-[#1c1c1f] px-4 py-3 text-xs text-[#9e9ea2]"
          id="cinema-form-tour-status"
        >
          Trạng thái hoạt động của rạp sẽ được hệ thống quản lý tự động. Khi tạo mới, rạp sẽ ở trạng thái hoạt động và sẽ được chuyển sang ngừng hoạt động khi bạn xoá rạp.
        </div>

        <div className="flex justify-end gap-3" id="cinema-form-tour-actions">
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
