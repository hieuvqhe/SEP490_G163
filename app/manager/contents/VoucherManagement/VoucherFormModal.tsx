"use client";

import { useEffect, useMemo, useState } from "react";
import {
  type CreateVoucherRequest,
  type DiscountType,
  type VoucherDetail,
} from "@/apis/manager.voucher.api";
import { Loader2 } from "lucide-react";

interface VoucherFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  voucher?: VoucherDetail;
  onClose: () => void;
  onSubmit: (payload: CreateVoucherRequest) => Promise<void>;
  isLoading?: boolean;
  isVoucherLoading?: boolean;
}

interface FormState {
  voucherCode: string;
  discountType: DiscountType;
  discountVal: number | "";
  validFrom: string;
  validTo: string;
  usageLimit: number | "";
  description: string;
  isActive: boolean;
}

interface FormErrors {
  voucherCode?: string;
  discountVal?: string;
  validFrom?: string;
  validTo?: string;
  usageLimit?: string;
}

const defaultFormState: FormState = {
  voucherCode: "",
  discountType: "percent",
  discountVal: "",
  validFrom: "",
  validTo: "",
  usageLimit: "",
  description: "",
  isActive: true,
};

const VoucherFormModal = ({
  open,
  mode,
  voucher,
  onClose,
  onSubmit,
  isLoading,
  isVoucherLoading,
}: VoucherFormModalProps) => {
  const [formState, setFormState] = useState<FormState>(defaultFormState);
  const [errors, setErrors] = useState<FormErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);

  const isEdit = mode === "edit";

  useEffect(() => {
    if (!open) return;

    if (isEdit && voucher) {
      setFormState({
        voucherCode: voucher.voucherCode || "",
        discountType: voucher.discountType,
        discountVal: voucher.discountVal,
        validFrom: formatDateInput(voucher.validFrom),
        validTo: formatDateInput(voucher.validTo),
        usageLimit: voucher.usageLimit,
        description: voucher.description || "",
        isActive: voucher.isActive,
      });
      setErrors({});
      setGeneralError(null);
    } else if (!isEdit) {
      setFormState(defaultFormState);
      setErrors({});
      setGeneralError(null);
    }
  }, [open, isEdit, voucher]);

  const isSubmitDisabled = useMemo(() => {
    return Boolean(isLoading || isVoucherLoading);
  }, [isLoading, isVoucherLoading]);

  if (!open) return null;

  const handleChange = (field: keyof FormState, value: string | number | boolean) => {
    setFormState((prev) => ({
      ...prev,
      [field]: value,
    }));
  };

  const validate = (): boolean => {
    const nextErrors: FormErrors = {};

    if (!formState.voucherCode.trim()) {
      nextErrors.voucherCode = "Vui lòng nhập mã voucher";
    }

    const discountValNumber = typeof formState.discountVal === "number" ? formState.discountVal : Number(formState.discountVal);
    if (Number.isNaN(discountValNumber) || discountValNumber <= 0) {
      nextErrors.discountVal = "Giá trị giảm phải lớn hơn 0";
    } else if (formState.discountType === "percent" && discountValNumber > 100) {
      nextErrors.discountVal = "Giá trị phần trăm không được vượt quá 100";
    }

    const usageLimitNumber = typeof formState.usageLimit === "number" ? formState.usageLimit : Number(formState.usageLimit);
    if (Number.isNaN(usageLimitNumber) || usageLimitNumber <= 0) {
      nextErrors.usageLimit = "Giới hạn sử dụng phải lớn hơn 0";
    }

    if (!formState.validFrom) {
      nextErrors.validFrom = "Vui lòng chọn ngày bắt đầu";
    }

    if (!formState.validTo) {
      nextErrors.validTo = "Vui lòng chọn ngày kết thúc";
    }

    if (formState.validFrom && formState.validTo) {
      const start = new Date(formState.validFrom);
      const end = new Date(formState.validTo);
      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        nextErrors.validTo = "Ngày kết thúc phải sau ngày bắt đầu";
      }
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setGeneralError(null);

    if (!validate()) return;

    const payload: CreateVoucherRequest = {
      voucherCode: formState.voucherCode.trim(),
      discountType: formState.discountType,
      discountVal: Number(formState.discountVal),
      validFrom: formState.validFrom,
      validTo: formState.validTo,
      usageLimit: Number(formState.usageLimit),
      description: formState.description.trim() || undefined,
      isActive: Boolean(formState.isActive),
    };

    try {
      await onSubmit(payload);
    } catch (error) {
      setGeneralError("Không thể lưu voucher. Vui lòng thử lại.");
    }
  };

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="mx-4 w-full max-w-3xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">
              {isEdit ? "Chỉnh sửa voucher" : "Tạo voucher mới"}
            </h2>
            <p className="mt-1 text-sm text-gray-300">
              {isEdit
                ? "Cập nhật thông tin voucher hiện có."
                : "Điền thông tin để tạo voucher mới cho người dùng."}
            </p>
          </div>
          <button
            onClick={onClose}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/10"
            type="button"
            disabled={isSubmitDisabled}
          >
            Đóng
          </button>
        </div>

        {isEdit && isVoucherLoading ? (
          <div className="flex items-center justify-center gap-2 py-20 text-sm text-gray-300">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải thông tin voucher...
          </div>
        ) : (
          <form className="space-y-6" onSubmit={handleSubmit}>
            <div className="grid gap-5 md:grid-cols-2">
              <Field label="Mã voucher" error={errors.voucherCode}>
                <input
                  value={formState.voucherCode}
                  onChange={(event) => handleChange("voucherCode", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                  placeholder="Ví dụ: SUMMER2025"
                />
              </Field>

              <Field label="Loại giảm giá">
                <select
                  value={formState.discountType}
                  onChange={(event) => handleChange("discountType", event.target.value as DiscountType)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                >
                  <option value="percent" className="bg-slate-900 text-white">Giảm theo %</option>
                  <option value="fixed" className="bg-slate-900 text-white">Giảm theo số tiền</option>
                </select>
              </Field>

              <Field label="Giá trị giảm" error={errors.discountVal}>
                <input
                  type="number"
                  value={formState.discountVal}
                  onChange={(event) =>
                    handleChange("discountVal", event.target.value === "" ? "" : Number(event.target.value))
                  }
                  min={0}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                  placeholder="Ví dụ: 15"
                />
              </Field>

              <Field label="Giới hạn sử dụng" error={errors.usageLimit}>
                <input
                  type="number"
                  min={1}
                  value={formState.usageLimit}
                  onChange={(event) =>
                    handleChange("usageLimit", event.target.value === "" ? "" : Number(event.target.value))
                  }
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                  placeholder="Ví dụ: 1000"
                />
              </Field>

              <Field label="Ngày bắt đầu" error={errors.validFrom}>
                <input
                  type="date"
                  value={formState.validFrom}
                  onChange={(event) => handleChange("validFrom", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                />
              </Field>

              <Field label="Ngày kết thúc" error={errors.validTo}>
                <input
                  type="date"
                  value={formState.validTo}
                  onChange={(event) => handleChange("validTo", event.target.value)}
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                />
              </Field>
            </div>

            <div>
              <label className="mb-2 block text-sm font-medium text-gray-200">Mô tả (không bắt buộc)</label>
              <textarea
                value={formState.description}
                onChange={(event) => handleChange("description", event.target.value)}
                className="min-h-[120px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                placeholder="Nhập mô tả chi tiết"
              />
            </div>

            <div className="flex items-center gap-3">
              <input
                id="voucher-active-toggle"
                type="checkbox"
                checked={formState.isActive}
                onChange={(event) => handleChange("isActive", event.target.checked)}
                className="h-4 w-4 rounded border border-white/20 bg-white/10"
              />
              <label htmlFor="voucher-active-toggle" className="text-sm text-gray-200">
                Kích hoạt voucher sau khi lưu
              </label>
            </div>

            {generalError && (
              <p className="text-sm text-red-300">{generalError}</p>
            )}

            <div className="flex items-center justify-end gap-3">
              <button
                type="button"
                onClick={onClose}
                className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                disabled={isSubmitDisabled}
              >
                Huỷ
              </button>
              <button
                type="submit"
                className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
                disabled={isSubmitDisabled}
              >
                {isSubmitDisabled && <Loader2 className="h-4 w-4 animate-spin" />}
                {isEdit ? "Lưu thay đổi" : "Tạo voucher"}
              </button>
            </div>
          </form>
        )}
      </div>
    </div>
  );
};

interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
}

const Field = ({ label, children, error }: FieldProps) => {
  return (
    <div className="space-y-2">
      <label className="block text-sm font-medium text-gray-200">{label}</label>
      {children}
      {error && <p className="text-xs text-red-300">{error}</p>}
    </div>
  );
};

const formatDateInput = (value?: string | null) => {
  if (!value) return "";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "";
  return date.toISOString().split("T")[0];
};

export default VoucherFormModal;
