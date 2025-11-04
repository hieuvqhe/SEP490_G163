"use client";

import { useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { X, Upload } from "lucide-react";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { partnerActorsService } from "@/apis/partner.movies.api";

interface AddActorPanelProps {
  open: boolean;
  onClose: () => void;
  onAdded?: () => void; // callback reload lại list sau khi thêm
}

export function AddActorPanel({ open, onClose, onAdded }: AddActorPanelProps) {
  const [name, setName] = useState("");
  const [image, setImage] = useState<string | null>(null);
  const [isChecking, setIsChecking] = useState(false);
  const [isDuplicate, setIsDuplicate] = useState(false);
  const [isSaving, setIsSaving] = useState(false);

  // chọn ảnh
  const handleSelectImage = () => {
    const input = document.createElement("input");
    input.type = "file";
    input.accept = "image/*";
    input.onchange = async (e: any) => {
      const file = e.target.files[0];
      if (file) {
        const url = URL.createObjectURL(file);
        setImage(url);
      }
    };
    input.click();
  };

  // kiểm tra tên diễn viên đã tồn tại
  const handleCheckDuplicate = async (value: string) => {
    setName(value);
    if (!value.trim()) {
      setIsDuplicate(false);
      return;
    }

    setIsChecking(true);
    try {
      const res = await partnerActorsService.getActors({
        search: value,
        page: 1,
        limit: 1,
      });
      const exists = res.result.actors.some(
        (a: any) => a.name.toLowerCase() === value.toLowerCase()
      );
      setIsDuplicate(exists);
    } catch (e) {
      console.error(e);
    } finally {
      setIsChecking(false);
    }
  };

  // lưu diễn viên
  const handleSave = async () => {
    if (!name.trim() || isDuplicate) return;
    setIsSaving(true);
    try {
      await partnerActorsService.createNewActor(200, {
        actorAvatarUrl: "",
        actorId: 499,
        actorName: "SonPham",
        role: "ádasd"
      });
      onAdded?.();
      setName("");
      setImage(null);
      onClose();
    } catch (err) {
      console.error(err);
    } finally {
      setIsSaving(false);
    }
  };

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          key="actorPanel"
          className="relative w-[35%] bg-zinc-800 border-l border-zinc-700 p-6"
          initial={{ x: "100%", opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          exit={{ x: "100%", opacity: 0 }}
          transition={{ type: "tween", duration: 0.3 }}
        >
          <button
            onClick={onClose}
            className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition"
          >
            <X className="h-5 w-5" />
          </button>

          <h3 className="text-lg font-semibold mb-6">Thêm diễn viên</h3>

          {/* Chọn ảnh */}
          <div
            className="flex flex-col items-center gap-3 cursor-pointer mb-6"
            onClick={handleSelectImage}
          >
            <Avatar className="h-24 w-24 border-2 border-zinc-600 hover:border-primary transition">
              {image ? (
                <AvatarImage src={image} alt="Preview" />
              ) : (
                <AvatarFallback className="bg-zinc-700 text-zinc-300 flex flex-col items-center justify-center">
                  <Upload className="h-5 w-5 mb-1" />
                  <span className="text-xs">Chọn ảnh</span>
                </AvatarFallback>
              )}
            </Avatar>
            <p className="text-xs text-zinc-400">
              Click để {image ? "đổi ảnh" : "thêm ảnh"}
            </p>
          </div>

          {/* Nhập tên diễn viên */}
          <div className="space-y-2">
            <Input
              placeholder="Tên diễn viên..."
              value={name}
              onChange={(e) => handleCheckDuplicate(e.target.value)}
              className="bg-zinc-900 border-zinc-700 text-zinc-100"
            />
            {isChecking ? (
              <p className="text-xs text-zinc-400 animate-pulse">
                Đang kiểm tra...
              </p>
            ) : isDuplicate ? (
              <p className="text-xs text-red-500">
                Diễn viên này đã tồn tại trong hệ thống.
              </p>
            ) : name.trim() ? (
              <p className="text-xs text-green-500">Tên hợp lệ.</p>
            ) : null}
          </div>

          <Button
            className="w-full mt-6"
            onClick={handleSave}
            disabled={!name.trim() || isDuplicate || isSaving}
          >
            {isSaving ? "Đang lưu..." : "Lưu diễn viên"}
          </Button>
        </motion.div>
      )}
    </AnimatePresence>
  );
}
