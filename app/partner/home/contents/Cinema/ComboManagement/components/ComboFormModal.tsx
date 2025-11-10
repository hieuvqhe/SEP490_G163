"use client";

import { ChangeEvent, useEffect, useMemo, useRef, useState } from "react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComboFormValues } from "../types";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";

interface ComboFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  initialValues: ComboFormValues;
  submitting?: boolean;
  onSubmit: (values: ComboFormValues) => void;
  onClose: () => void;
}

type ComboFormField = keyof ComboFormValues;

const REQUIRED_FIELDS: ComboFormField[] = ["name", "price"];

const ComboFormModal = ({
  open,
  mode,
  initialValues,
  submitting,
  onSubmit,
  onClose,
}: ComboFormModalProps) => {
  const [values, setValues] = useState<ComboFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<ComboFormField, string>>>({});
  const [imagePreview, setImagePreview] = useState<string>(initialValues.imageUrl);
  const [uploadError, setUploadError] = useState<string | null>(null);
  const fileInputRef = useRef<HTMLInputElement | null>(null);
  const uploadMutation = useUploadToCloudinary();

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
      setImagePreview(initialValues.imageUrl);
      setUploadError(null);
    }
  }, [open, initialValues]);

  useEffect(() => {
    if (!values.imageUrl || !values.imageUrl.startsWith("http")) {
      if (!uploadMutation.isPending) {
        setImagePreview(values.imageUrl ? values.imageUrl : "");
      }
      return;
    }
    setImagePreview(values.imageUrl);
  }, [values.imageUrl, uploadMutation.isPending]);

  const baseInputClasses =
    "bg-[#27272a] text-[#f5f5f5] border border-[#3a3a3d] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30";
  const errorInputClasses = "border-rose-500 focus-visible:border-rose-500 focus-visible:ring-rose-500/40";

  const getInputClassName = (key: ComboFormField) => cn(baseInputClasses, errors[key] && errorInputClasses);

  const handleTextChange = (
    key: Exclude<ComboFormField, "isAvailable">,
    event: ChangeEvent<HTMLInputElement | HTMLTextAreaElement>
  ) => {
    setValues((prev) => ({ ...prev, [key]: event.target.value }));
  };

  const toggleAvailability = (nextValue: boolean) => {
    setValues((prev) => ({ ...prev, isAvailable: nextValue }));
  };

  const handleTriggerFile = () => {
    setUploadError(null);
    fileInputRef.current?.click();
  };

  const handleFileChange = (event: ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    setUploadError(null);
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        const url = (data?.secure_url as string | undefined) ?? (data?.url as string | undefined);
        if (!url) {
          setUploadError("Không nhận được đường dẫn ảnh hợp lệ từ Cloudinary");
          return;
        }
        setValues((prev) => ({ ...prev, imageUrl: url }));
        setImagePreview(url);
      },
      onError: () => {
        setUploadError("Tải ảnh thất bại, vui lòng thử lại");
      },
    });
  };

  const handleRemoveImage = () => {
    setValues((prev) => ({ ...prev, imageUrl: "" }));
    setImagePreview("");
    setUploadError(null);
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const priceError = useMemo(() => {
    const trimmed = values.price.trim();
    if (trimmed === "") return "Vui lòng nhập giá combo";
    const parsed = Number(trimmed.replace(/,/g, ""));
    if (Number.isNaN(parsed) || parsed < 0) {
      return "Giá combo phải là số không âm";
    }
    return undefined;
  }, [values.price]);

  const validate = () => {
    const nextErrors: Partial<Record<ComboFormField, string>> = {};

    REQUIRED_FIELDS.forEach((field) => {
      if (!values[field].toString().trim()) {
        nextErrors[field] = `Vui lòng nhập ${field === "name" ? "tên combo" : "giá combo"}`;
      }
    });

    if (mode === "create" && !values.code.trim()) {
      nextErrors.code = "Vui lòng nhập mã combo";
    }

    if (!nextErrors.price && priceError) {
      nextErrors.price = priceError;
    }

    if (values.imageUrl && !/^https?:\/\//.test(values.imageUrl.trim())) {
      nextErrors.imageUrl = "Ảnh combo phải là URL hợp lệ";
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  const title = mode === "create" ? "Tạo combo mới" : "Cập nhật combo";

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={title}
      size="md"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-6">
        <div className="grid gap-4">
          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Tên combo</label>
            <Input
              value={values.name}
              onChange={(event) => handleTextChange("name", event)}
              placeholder="Combo Bắp + Nước"
              className={getInputClassName("name")}
            />
            {errors.name && <span className="text-xs text-rose-400">{errors.name}</span>}
          </div>

          <div className="grid gap-3 md:grid-cols-2">
            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mã combo</label>
              <Input
                value={values.code}
                onChange={(event) => handleTextChange("code", event)}
                placeholder="COMBO_POPCORN_DRINK"
                className={getInputClassName("code")}
                readOnly={mode === "edit"}
              />
              {mode === "edit" && (
                <p className="text-xs text-[#9e9ea2]">Mã combo không thể thay đổi sau khi tạo.</p>
              )}
              {errors.code && <span className="text-xs text-rose-400">{errors.code}</span>}
            </div>

            <div className="flex flex-col gap-2">
              <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Giá combo (VND)</label>
              <Input
                value={values.price}
                onChange={(event) => handleTextChange("price", event)}
                placeholder="79000"
                className={getInputClassName("price")}
              />
              <p className="text-xs text-[#9e9ea2]">Nhập giá bán lẻ của combo, đơn vị VNĐ.</p>
              {errors.price && <span className="text-xs text-rose-400">{errors.price}</span>}
            </div>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Mô tả</label>
            <Textarea
              value={values.description}
              onChange={(event) => handleTextChange("description", event)}
              placeholder="1 bắp lớn + 1 nước ngọt 22oz"
              className={cn(getInputClassName("description"), "min-h-[120px]")}
            />
            <p className="text-xs text-[#9e9ea2]">
              Mô tả chi tiết giúp nhân viên nắm rõ thành phần và ghi chú quan trọng của combo.
            </p>
          </div>

          <div className="flex flex-col gap-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">Ảnh combo (URL)</label>
            <div className="flex flex-col gap-3 md:flex-row md:items-center md:gap-4">
              <div className="flex-1 space-y-2">
                <Input
                  value={values.imageUrl}
                  onChange={(event) => handleTextChange("imageUrl", event)}
                  placeholder="https://cdn.example.com/images/combo.jpg"
                  className={getInputClassName("imageUrl")}
                />
                {errors.imageUrl && <span className="text-xs text-rose-400">{errors.imageUrl}</span>}
              </div>
              <div className="flex items-center gap-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept="image/*"
                  className="hidden"
                  onChange={handleFileChange}
                />
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleTriggerFile}
                  disabled={uploadMutation.isPending || submitting}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#27272a]"
                >
                  {uploadMutation.isPending ? "Đang tải..." : "Chọn ảnh"}
                </Button>
                {imagePreview && (
                  <Button
                    type="button"
                    variant="outline"
                    onClick={handleRemoveImage}
                    disabled={uploadMutation.isPending || submitting}
                    className="border border-rose-500/50 text-rose-300 hover:bg-rose-500/20"
                  >
                    Xoá ảnh
                  </Button>
                )}
              </div>
            </div>
            {uploadError && <span className="text-xs text-rose-400">{uploadError}</span>}
            {imagePreview ? (
              <div className="mt-3 overflow-hidden rounded-lg border border-[#27272a] bg-[#1c1c1f] p-3">
                <img
                  src={imagePreview}
                  alt="Combo preview"
                  className="max-h-48 w-full rounded-md object-cover"
                />
                <p className="mt-2 break-all text-xs text-[#9e9ea2]">{values.imageUrl}</p>
              </div>
            ) : (
              <p className="text-xs text-[#9e9ea2]">Chưa có ảnh hiển thị.</p>
            )}
          </div>
        </div>

        <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4">
          <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">Trạng thái kinh doanh</p>
          <div className="mt-3 flex gap-2">
            <Button
              type="button"
              variant="outline"
              className={cn(
                "border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#27272a]",
                values.isAvailable && "border-[#ff7a45] text-[#ff7a45]"
              )}
              onClick={() => toggleAvailability(true)}
              disabled={submitting}
            >
              Đang bán
            </Button>
            <Button
              type="button"
              variant="outline"
              className={cn(
                "border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#27272a]",
                !values.isAvailable && "border-[#f97373] text-[#f97373]"
              )}
              onClick={() => toggleAvailability(false)}
              disabled={submitting}
            >
              Tạm ngưng
            </Button>
          </div>
          <p className="mt-3 text-xs text-[#9e9ea2]">
            Bạn có thể tạm ngưng bán combo bất kỳ lúc nào. Khi tạm ngưng, combo sẽ không hiển thị trên kênh bán vé.
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

export default ComboFormModal;
