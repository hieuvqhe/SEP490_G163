"use client";

import { useEffect, useMemo, useState } from "react";
import { AnimatePresence, motion } from "framer-motion";
import Image from "next/image";
import { X, Upload } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import { cn } from "@/lib/utils";

interface CreateActorModalProps {
  open: boolean;
  onClose: () => void;
  onCreate: (actor: {
    name: string;
    avatarUrl: string;
    role: string;
  }) => void;
}

const defaultForm = {
  name: "",
  role: "",
  avatarUrl: "",
};

export function CreateActorModal({ open, onClose, onCreate }: CreateActorModalProps) {
  const [form, setForm] = useState(defaultForm);
  const [errors, setErrors] = useState<Record<keyof typeof form, string>>({
    name: "",
    role: "",
    avatarUrl: "",
  });
  const { mutateAsync, isPending } = useUploadToCloudinary();

  useEffect(() => {
    if (!open) {
      setForm(defaultForm);
      setErrors({ name: "", role: "", avatarUrl: "" });
    }
  }, [open]);

  const isValid = useMemo(() => {
    return !!form.name.trim() && !!form.role.trim() && !!form.avatarUrl.trim();
  }, [form]);

  const handleChange = <K extends keyof typeof form>(key: K, value: typeof form[K]) => {
    setForm((prev) => ({ ...prev, [key]: value }));
    setErrors((prev) => ({ ...prev, [key]: "" }));
  };

  const validate = () => {
    const nextErrors: Record<keyof typeof form, string> = {
      name: "",
      role: "",
      avatarUrl: "",
    };

    if (!form.name.trim()) nextErrors.name = "Vui lòng nhập tên diễn viên.";
    if (!form.role.trim()) nextErrors.role = "Vui lòng nhập tên vai diễn.";
    if (!form.avatarUrl.trim()) nextErrors.avatarUrl = "Vui lòng chọn ảnh.";

    setErrors(nextErrors);
    return Object.values(nextErrors).every((value) => !value);
  };

  const handleUpload = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;
    try {
      const result = await mutateAsync(file);
      if (result?.secure_url) {
        handleChange("avatarUrl", result.secure_url);
      }
    } catch (error) {
      setErrors((prev) => ({ ...prev, avatarUrl: "Không thể tải ảnh. Vui lòng thử lại." }));
    }
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onCreate({
      name: form.name.trim(),
      avatarUrl: form.avatarUrl.trim(),
      role: form.role.trim(),
    });
    onClose();
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-[60] flex items-center justify-center bg-black/60 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="relative w-full max-w-lg rounded-2xl border border-zinc-800 bg-zinc-900 p-6 text-zinc-100 shadow-xl"
            initial={{ scale: 0.95, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.95, opacity: 0, y: 30 }}
            onClick={(event) => event.stopPropagation()}
          >
            <button
              className="absolute right-4 top-4 text-zinc-400 transition hover:text-zinc-200"
              onClick={onClose}
              type="button"
            >
              <X className="h-5 w-5" />
            </button>

            <div className="space-y-6">
              <div>
                <h3 className="text-xl font-semibold">Tạo diễn viên mới</h3>
                <p className="mt-1 text-sm text-zinc-400">
                  Thêm diễn viên mới cho yêu cầu phim của bạn.
                </p>
              </div>

              <div className="flex flex-col items-center gap-3">
                <div
                  className={cn(
                    "relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/60 transition hover:border-primary",
                    errors.avatarUrl && "border-red-500"
                  )}
                >
                  {form.avatarUrl ? (
                    <Image
                      src={form.avatarUrl}
                      alt="Ảnh diễn viên"
                      width={160}
                      height={160}
                      className="h-full w-full object-cover"
                      unoptimized
                    />
                  ) : (
                    <div className="flex flex-col items-center justify-center gap-2 text-xs text-zinc-400">
                      <Upload className="h-5 w-5" />
                      <span>Tải ảnh đại diện</span>
                    </div>
                  )}

                  <input
                    type="file"
                    accept="image/*"
                    className="absolute inset-0 cursor-pointer opacity-0"
                    onChange={handleUpload}
                  />
                </div>
                {errors.avatarUrl && (
                  <p className="text-xs text-red-500">{errors.avatarUrl}</p>
                )}
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="actor-name">
                    Tên diễn viên
                  </label>
                  <Input
                    id="actor-name"
                    placeholder="Ví dụ: Kate Winslet"
                    value={form.name}
                    onChange={(event) => handleChange("name", event.target.value)}
                    className={cn(errors.name && "border-red-500")}
                  />
                  {errors.name && <p className="text-xs text-red-500">{errors.name}</p>}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="actor-role">
                    Tên trong phim (Role)
                  </label>
                  <Input
                    id="actor-role"
                    placeholder="Ví dụ: Nữ chính"
                    value={form.role}
                    onChange={(event) => handleChange("role", event.target.value)}
                    className={cn(errors.role && "border-red-500")}
                  />
                  {errors.role && <p className="text-xs text-red-500">{errors.role}</p>}
                </div>
              </div>

              <Button
                className="w-full"
                onClick={handleSubmit}
                disabled={!isValid || isPending}
              >
                {isPending ? "Đang tải ảnh..." : "Thêm diễn viên"}
              </Button>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
