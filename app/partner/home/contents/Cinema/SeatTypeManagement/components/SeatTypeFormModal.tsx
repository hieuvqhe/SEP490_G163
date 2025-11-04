"use client";

import { ChangeEvent, useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeatTypeFormValues } from "../types";
import { useAuthStore } from "@/store/authStore";

interface SeatTypeFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: SeatTypeFormValues;
  submitting?: boolean;
  onSubmit: (values: SeatTypeFormValues) => void;
  onClose: () => void;
}

type SeatTypeFieldKey = keyof SeatTypeFormValues;

const FIELD_CONFIG: {
  key: SeatTypeFieldKey;
  label: string;
  placeholder?: string;
  helper?: string;
  type?: string;
  disabledOnEdit?: boolean;
  required?: boolean;
}[] = [
  {
    key: "name",
    label: "Tên loại ghế",
    placeholder: "Ghế đang bảo trì",
    required: true,
  },
  {
    key: "surcharge",
    label: "Phụ thu (VND)",
    placeholder: "0",
    type: "number",
    helper: "Giá trị từ 0 đến 1.000.000",
    required: true,
  },
  {
    key: "color",
    label: "Màu sắc (HEX)",
    required: true,
  },
];

const COLOR_PRESETS = [
  "#ff7a45",
  "#ff9f45",
  "#ffd166",
  "#06d6a0",
  "#118ab2",
  "#073b4c",
  "#8b5cf6",
  "#ec4899",
  "#ef4444",
  "#f97316",
  "#84cc16",
  "#14b8a6",
];

const normalizeNameToCode = (value: string) => {
  const trimmed = value.trim();
  if (!trimmed) {
    console.log("[SeatTypeFormModal] normalizeNameToCode: empty after trim", { input: value });
    return "";
  }
  const withoutDiacritics = trimmed
    .normalize("NFD")
    .replace(/[\f-\u0012F\u001A\u001C\u001E\u001F\u001A\u001B]/g, "")
    .replace(/[\u0300-\u036f]/g, "");
  const generated = withoutDiacritics.replace(/[^a-zA-Z0-9]/g, "").toUpperCase();
  return generated;
};

const SeatTypeFormModal = ({
  open,
  mode,
  initialValues,
  submitting,
  onSubmit,
  onClose,
}: SeatTypeFormModalProps) => {
  const [values, setValues] = useState<SeatTypeFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<SeatTypeFieldKey, string>>>({});
  const { user } = useAuthStore();

  const partnerId = useMemo(() => {
    if (!user || user.userId === undefined || user.userId === null) return "";
    return String(user.userId).trim();
  }, [user]);

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
    }
  }, [open, initialValues]);

  useEffect(() => {
    if (!open || mode !== "create") return;

    const normalizedName = normalizeNameToCode(values.name);
    if (!normalizedName || !partnerId) {
      setValues((prev) => (prev.code === "" ? prev : { ...prev, code: "" }));
      return;
    }

    const generated = `${normalizedName}_${partnerId}`;
    setValues((prev) => (prev.code === generated ? prev : { ...prev, code: generated }));
  }, [open, mode, partnerId, values.name]);

  const handleChange = (key: SeatTypeFieldKey, event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const validate = () => {
    const nextErrors: Partial<Record<SeatTypeFieldKey, string>> = {};
    const colorRegex = /^#([0-9a-fA-F]{3}|[0-9a-fA-F]{6})$/;

    FIELD_CONFIG.forEach((field) => {
      if (field.required && !values[field.key].trim()) {
        nextErrors[field.key] = `Vui lòng nhập ${field.label.toLowerCase()}`;
      }
    });

    if (mode === "create" && !values.code.trim()) {
      nextErrors.code = "Không thể tạo mã loại ghế, vui lòng kiểm tra lại tên loại ghế hoặc đăng nhập";
    }

    if (!values.color.trim()) {
      nextErrors.color = "Vui lòng chọn màu";
    }

    if (!nextErrors.surcharge) {
      const parsed = Number(values.surcharge.trim());
      if (Number.isNaN(parsed) || parsed < 0) {
        nextErrors.surcharge = "Phụ thu phải là số không âm";
      } else if (parsed > 1_000_000) {
        nextErrors.surcharge = "Phụ thu không được vượt quá 1.000.000";
      }
    }

    if (!nextErrors.color && values.color.trim() && !colorRegex.test(values.color.trim())) {
      nextErrors.color = "Màu sắc phải là mã HEX hợp lệ";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  const title = mode === "create" ? "Tạo loại ghế mới" : "Cập nhật loại ghế";

  const baseInputClasses =
    "bg-[#27272a] text-[#f5f5f5] border border-[#3a3a3d] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30";
  const errorInputClasses = "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/40";

  const getInputClassName = (key: SeatTypeFieldKey) => cn(baseInputClasses, errors[key] && errorInputClasses);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="md"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child] button:text-[#f5f5f5]/70 [&>div:first-child] button:hover:text-white [&>div:first-child] button:hover:bg-[#27272a]"
    >
      <div className="space-y-6">
        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mã loại ghế</label>
          <Input
            value={values.code}
            readOnly
            placeholder="Sẽ được tạo tự động"
            className={cn(
              getInputClassName("code"),
              "cursor-not-allowed select-all bg-[#1f1f23] text-[#f5f5f5]/90"
            )}
          />
          <p className="text-xs text-[#9e9ea2]">Mã được tạo từ tên loại ghế và ID đối tác, không thể chỉnh sửa.</p>
          {errors.code && <span className="text-xs text-rose-400">{errors.code}</span>}
        </div>

        <div className="grid gap-4">
          {FIELD_CONFIG.map((field) => (
            <div key={field.key} className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">{field.label}</label>
              <Input
                type={field.type ?? "text"}
                value={values[field.key]}
                onChange={(event) => handleChange(field.key, event)}
                placeholder={field.placeholder}
                className={getInputClassName(field.key)}
                disabled={field.disabledOnEdit && mode === "edit"}
              />
              {field.helper && <p className="text-xs text-[#9e9ea2]">{field.helper}</p>}
              {errors[field.key] && <span className="text-xs text-rose-400">{errors[field.key]}</span>}
            </div>
          ))}
        </div>

        <div className="space-y-3">
          <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Màu sắc</label>
          <div className="grid grid-cols-6 gap-2">
            {COLOR_PRESETS.map((preset) => {
              const isSelected = preset.toLowerCase() === values.color.trim().toLowerCase();
              return (
                <button
                  key={preset}
                  type="button"
                  onClick={() => setValues((prev) => ({ ...prev, color: preset }))}
                  className={cn(
                    "h-10 rounded-lg border transition-all",
                    isSelected ? "ring-2 ring-offset-2 ring-offset-[#151518] ring-[#ff7a45]" : "border-transparent",
                  )}
                  style={{ backgroundColor: preset }}
                  aria-label={`Chọn màu ${preset}`}
                />
              );
            })}
          </div>
          <div className="flex items-center gap-3">
            <input
              type="color"
              value={values.color || "#ffffff"}
              onChange={(event) => setValues((prev) => ({ ...prev, color: event.target.value }))}
              className="h-10 w-16 rounded border border-[#3a3a3d] bg-transparent"
            />
            <Input
              value={values.color}
              onChange={(event) => setValues((prev) => ({ ...prev, color: event.target.value.toUpperCase() }))}
              placeholder="#FFFFFF"
              className={getInputClassName("color")}
            />
          </div>
          {errors.color && <span className="text-xs text-rose-400">{errors.color}</span>}
          <p className="text-xs text-[#9e9ea2]">Chọn nhanh từ bảng màu hoặc tự tuỳ chỉnh bằng mã HEX.</p>
        </div>

        <div className="flex flex-col gap-2">
          <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mô tả</label>
          <Textarea
            value={values.description}
            onChange={(event) => handleChange("description", event)}
            placeholder="Mô tả chi tiết về loại ghế"
            className={getInputClassName("description")}
          />
          <p className="text-xs text-[#9e9ea2]">
            Mô tả giúp nhân viên hiểu rõ mục đích và lưu ý khi sử dụng loại ghế này.
          </p>
        </div>

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
            onClick={handleSubmit}
            disabled={submitting}
            className="bg-[#ff7a45] text-[#151518] hover:bg-[#ff8d60] shadow-lg shadow-[#ff7a45]/40"
          >
            {submitting ? "Đang xử lý..." : mode === "create" ? "Tạo mới" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default SeatTypeFormModal;
