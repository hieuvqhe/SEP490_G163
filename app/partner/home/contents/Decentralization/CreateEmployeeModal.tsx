"use client";

import React, { useState, useCallback } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { useCreatePartnerEmployee } from "@/apis/partner.decentralization.api";
import { useToast } from "@/components/ToastProvider";
import { Eye, EyeOff, Info } from "lucide-react";
import { HelpIcon } from "./HelpIcon";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface CreateEmployeeModalProps {
  open: boolean;
  onClose: () => void;
}

export default function CreateEmployeeModal({ open, onClose }: CreateEmployeeModalProps) {
  const [formData, setFormData] = useState({
    fullName: "",
    email: "",
    phone: "",
    password: "",
    confirmPassword: "",
    roleType: "Staff" as "Staff" | "Marketing" | "Cashier",
    hireDate: new Date().toISOString().split("T")[0],
  });
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const createMutation = useCreatePartnerEmployee();

  const handleStartTour = useCallback(() => {
    const steps = [
      {
        element: "#create-employee-tour-modal",
        popover: {
          title: "Thêm nhân viên mới",
          description: "Form này giúp bạn tạo tài khoản cho nhân viên mới. Nhân viên sẽ nhận thông tin đăng nhập qua email.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-fullname",
        popover: {
          title: "Họ và tên",
          description: "Nhập họ tên đầy đủ của nhân viên. Thông tin này sẽ hiển thị trong hệ thống và trên thẻ nhân viên.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-email",
        popover: {
          title: "Email",
          description: "Địa chỉ email dùng để đăng nhập và nhận thông báo. Email phải hợp lệ và chưa được sử dụng.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-phone",
        popover: {
          title: "Số điện thoại",
          description: "Số điện thoại liên hệ của nhân viên. Yêu cầu 10 chữ số.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-password",
        popover: {
          title: "Mật khẩu",
          description: "Tạo mật khẩu cho tài khoản nhân viên. Yêu cầu tối thiểu 6 ký tự. Nhân viên sẽ dùng mật khẩu này để đăng nhập lần đầu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-confirm-password",
        popover: {
          title: "Xác nhận mật khẩu",
          description: "Nhập lại mật khẩu để đảm bảo chính xác. Mật khẩu phải trùng khớp với trường mật khẩu ở trên.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-role",
        popover: {
          title: "Vai trò nhân viên",
          description: "Chọn vai trò: Nhân viên (quản lý rạp), Marketing (quản lý khuyến mãi), Thu ngân (bán vé). Vai trò quyết định quyền truy cập trong hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-hire-date",
        popover: {
          title: "Ngày vào làm",
          description: "Chọn ngày nhân viên chính thức bắt đầu làm việc. Mặc định là ngày hiện tại.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#create-employee-tour-actions",
        popover: {
          title: "Hành động",
          description: "Nhấn 'Thêm nhân viên' để tạo tài khoản mới, hoặc 'Hủy' để đóng form mà không lưu thông tin.",
          side: "top" as const,
          align: "end" as const,
        },
      },
    ];

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, []);

  const handleChange = (field: string, value: string) => {
    setFormData((prev) => ({ ...prev, [field]: value }));
    // Clear error when user types
    if (errors[field]) {
      setErrors((prev) => {
        const newErrors = { ...prev };
        delete newErrors[field];
        return newErrors;
      });
    }
  };

  const validateForm = () => {
    const newErrors: Record<string, string> = {};

    if (!formData.fullName.trim()) {
      newErrors.fullName = "Vui lòng nhập họ tên";
    }

    if (!formData.email.trim()) {
      newErrors.email = "Vui lòng nhập email";
    } else if (!/^[^\s@]+@[^\s@]+\.[^\s@]+$/.test(formData.email)) {
      newErrors.email = "Email không hợp lệ";
    }

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
    }

    if (!formData.password) {
      newErrors.password = "Vui lòng nhập mật khẩu";
    } else if (formData.password.length < 6) {
      newErrors.password = "Mật khẩu phải có ít nhất 6 ký tự";
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = "Vui lòng xác nhận mật khẩu";
    } else if (formData.password !== formData.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      return;
    }

    try {
      await createMutation.mutateAsync(formData);
      showToast("Thêm nhân viên thành công", undefined, "success");
      onClose();
      // Reset form
      setFormData({
        fullName: "",
        email: "",
        phone: "",
        password: "",
        confirmPassword: "",
        roleType: "Staff",
        hireDate: new Date().toISOString().split("T")[0],
      });
      setErrors({});
    } catch (error: any) {
      showToast(
        "Thêm nhân viên thất bại",
        error?.message || "Vui lòng thử lại",
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[90vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        id="create-employee-tour-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-xl font-semibold">Thêm nhân viên mới</DialogTitle>
          <Button
            type="button"
            variant="outline"
            size="sm"
            onClick={handleStartTour}
            className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700 rounded-xl"
          >
            <Info className="mr-1 size-4" /> Hướng dẫn
          </Button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5">
          {/* Full Name */}
          <div className="space-y-2" id="create-employee-tour-fullname">
            <div className="flex items-center gap-2">
              <Label htmlFor="fullName" className="text-sm font-medium">
                Họ và tên <span className="text-red-500">*</span>
              </Label>
              <HelpIcon
                title="Họ và tên"
                description="Nhập họ tên đầy đủ của nhân viên. Thông tin này sẽ hiển thị trong hệ thống và trên thẻ nhân viên."
              />
            </div>
            <Input
              id="fullName"
              value={formData.fullName}
              onChange={(e) => handleChange("fullName", e.target.value)}
              placeholder="Nguyễn Văn A"
              className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl"
            />
            {errors.fullName && (
              <p className="text-xs text-red-400">{errors.fullName}</p>
            )}
          </div>

          {/* Email and Phone */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2" id="create-employee-tour-email">
              <Label htmlFor="email" className="text-sm font-medium">
                Email <span className="text-red-500">*</span>
              </Label>
              <Input
                id="email"
                type="email"
                value={formData.email}
                onChange={(e) => handleChange("email", e.target.value)}
                placeholder="email@example.com"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl"
              />
              {errors.email && (
                <p className="text-xs text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-2" id="create-employee-tour-phone">
              <Label htmlFor="phone" className="text-sm font-medium">
                Số điện thoại <span className="text-red-500">*</span>
              </Label>
              <Input
                id="phone"
                value={formData.phone}
                onChange={(e) => handleChange("phone", e.target.value)}
                placeholder="0123456789"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl"
              />
              {errors.phone && (
                <p className="text-xs text-red-400">{errors.phone}</p>
              )}
            </div>
          </div>

          {/* Password */}
          <div className="space-y-2" id="create-employee-tour-password">
            <div className="flex items-center gap-2">
              <Label htmlFor="password" className="text-sm font-medium">
                Mật khẩu <span className="text-red-500">*</span>
              </Label>
              <HelpIcon
                title="Mật khẩu"
                description="Tạo mật khẩu cho tài khoản nhân viên. Yêu cầu tối thiểu 6 ký tự. Nhân viên sẽ dùng mật khẩu này để đăng nhập lần đầu."
              />
            </div>
            <div className="relative">
              <Input
                id="password"
                type={showPassword ? "text" : "password"}
                value={formData.password}
                onChange={(e) => handleChange("password", e.target.value)}
                placeholder="Tối thiểu 6 ký tự"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
              >
                {showPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.password && (
              <p className="text-xs text-red-400">{errors.password}</p>
            )}
          </div>

          {/* Confirm Password */}
          <div className="space-y-2" id="create-employee-tour-confirm-password">
            <Label htmlFor="confirmPassword" className="text-sm font-medium">
              Xác nhận mật khẩu <span className="text-red-500">*</span>
            </Label>
            <div className="relative">
              <Input
                id="confirmPassword"
                type={showConfirmPassword ? "text" : "password"}
                value={formData.confirmPassword}
                onChange={(e) => handleChange("confirmPassword", e.target.value)}
                placeholder="Nhập lại mật khẩu"
                className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl pr-10"
              />
              <button
                type="button"
                onClick={() => setShowConfirmPassword(!showConfirmPassword)}
                className="absolute right-3 top-1/2 -translate-y-1/2 text-zinc-400 hover:text-zinc-300"
              >
                {showConfirmPassword ? <EyeOff size={18} /> : <Eye size={18} />}
              </button>
            </div>
            {errors.confirmPassword && (
              <p className="text-xs text-red-400">{errors.confirmPassword}</p>
            )}
          </div>

          {/* Role Type and Hire Date */}
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2" id="create-employee-tour-role">
              <div className="flex items-center gap-2">
                <Label htmlFor="roleType" className="text-sm font-medium">
                  Vai trò <span className="text-red-500">*</span>
                </Label>
                <HelpIcon
                  title="Vai trò nhân viên"
                  description="Chọn vai trò: Nhân viên (quản lý rạp), Marketing (quản lý khuyến mãi), Thu ngân (bán vé). Vai trò quyết định quyền truy cập trong hệ thống."
                  side="left"
                />
              </div>
              <Select
                value={formData.roleType}
                onValueChange={(value: any) => handleChange("roleType", value)}
              >
                <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl">
                  <SelectValue />
                </SelectTrigger>
                <SelectContent className="bg-zinc-800 border-zinc-700">
                  <SelectItem value="Staff">Nhân viên</SelectItem>
                  <SelectItem value="Marketing">Marketing</SelectItem>
                  <SelectItem value="Cashier">Thu ngân</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="space-y-2" id="create-employee-tour-hire-date">
              <Label htmlFor="hireDate" className="text-sm font-medium">
                Ngày vào làm
              </Label>
              <Input
                id="hireDate"
                type="date"
                value={formData.hireDate}
                onChange={(e) => handleChange("hireDate", e.target.value)}
                className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl"
              />
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4" id="create-employee-tour-actions">
            <Button
              type="button"
              variant="outline"
              onClick={onClose}
              className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700 rounded-xl"
            >
              Hủy
            </Button>
            <Button
              type="submit"
              disabled={createMutation.isPending}
              className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
            >
              {createMutation.isPending ? "Đang thêm..." : "Thêm nhân viên"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
