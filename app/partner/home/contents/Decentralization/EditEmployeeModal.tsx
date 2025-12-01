"use client";

import React, { useState, useEffect, useCallback } from "react";
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
import { Switch } from "@/components/ui/switch";
import {
  useUpdatePartnerEmployee,
  useGetCinemaAssignments,
  type PartnerEmployee,
} from "@/apis/partner.decentralization.api";
import { useToast } from "@/components/ToastProvider";
import { Info } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

interface EditEmployeeModalProps {
  open: boolean;
  employee: PartnerEmployee;
  onClose: () => void;
}

export default function EditEmployeeModal({
  open,
  employee,
  onClose,
}: EditEmployeeModalProps) {
  const [formData, setFormData] = useState({
    fullName: employee.fullName,
    phone: employee.phone,
    roleType: employee.roleType,
    isActive: employee.isActive,
  });
  const [errors, setErrors] = useState<Record<string, string>>({});

  const { showToast } = useToast();
  const updateMutation = useUpdatePartnerEmployee();
  
  // Kiểm tra xem nhân viên có đang quản lý rạp không (chỉ kiểm tra nếu là Staff)
  const { data: assignmentsData } = useGetCinemaAssignments(
    employee.roleType === "Staff" ? employee.employeeId : undefined,
    { enabled: employee.roleType === "Staff" && open }
  );
  
  const hasActiveCinemas = employee.roleType === "Staff" 
    ? (assignmentsData?.result?.filter(a => a.isActive).length || 0) > 0
    : false;

  const handleStartTour = useCallback(() => {
    const steps = [
      {
        element: "#edit-employee-tour-modal",
        popover: {
          title: "Chỉnh sửa thông tin nhân viên",
          description: "Form này cho phép bạn cập nhật thông tin nhân viên, thay đổi vai trò và trạng thái làm việc.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#edit-employee-tour-readonly-info",
        popover: {
          title: "Thông tin cố định",
          description: "Email và ngày vào làm là thông tin cố định, không thể chỉnh sửa sau khi tạo nhân viên.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#edit-employee-tour-fullname",
        popover: {
          title: "Họ và tên",
          description: "Cập nhật họ tên đầy đủ của nhân viên. Thông tin này sẽ được hiển thị trong hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#edit-employee-tour-phone",
        popover: {
          title: "Số điện thoại",
          description: "Cập nhật số điện thoại liên hệ của nhân viên. Yêu cầu 10 chữ số.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#edit-employee-tour-role",
        popover: {
          title: "Vai trò nhân viên",
          description: hasActiveCinemas 
            ? "⚠️ Nhân viên đang quản lý rạp nên không thể đổi vai trò. Vui lòng hủy phân quyền rạp trước."
            : "Thay đổi vai trò: Nhân viên (quản lý rạp), Marketing (quản lý khuyến mãi), Thu ngân (bán vé).",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#edit-employee-tour-status",
        popover: {
          title: "Trạng thái làm việc",
          description: hasActiveCinemas
            ? "⚠️ Nhân viên đang quản lý rạp nên không thể tạm dừng. Vui lòng hủy phân quyền rạp trước."
            : "Chọn 'Đang làm việc' để kích hoạt tài khoản hoặc 'Ngừng làm việc' để tạm dừng truy cập hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#edit-employee-tour-actions",
        popover: {
          title: "Cập nhật thông tin",
          description: "Nhấn 'Cập nhật' để lưu các thay đổi, hoặc 'Hủy' để đóng mà không lưu.",
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
  }, [hasActiveCinemas]);

  useEffect(() => {
    setFormData({
      fullName: employee.fullName,
      phone: employee.phone,
      roleType: employee.roleType,
      isActive: employee.isActive,
    });
    setErrors({});
  }, [employee]);

  const handleChange = (field: string, value: any) => {
    // Nếu đang cố gắng set isActive = false nhưng nhân viên đang quản lý rạp
    if (field === "isActive" && value === false && hasActiveCinemas) {
      showToast(
        "Không thể tạm dừng nhân viên",
        "Vui lòng hủy phân quyền tất cả các rạp trước khi tạm dừng nhân viên.",
        "error"
      );
      return;
    }
    
    // Nếu đang cố gắng đổi role từ Staff sang vai trò khác khi đang quản lý rạp
    if (field === "roleType" && value !== "Staff" && employee.roleType === "Staff" && hasActiveCinemas) {
      showToast(
        "Không thể đổi vai trò",
        "Vui lòng hủy phân quyền tất cả các rạp trước khi đổi vai trò nhân viên.",
        "error"
      );
      return;
    }
    
    setFormData((prev) => ({ ...prev, [field]: value }));
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

    if (!formData.phone.trim()) {
      newErrors.phone = "Vui lòng nhập số điện thoại";
    } else if (!/^[0-9]{10}$/.test(formData.phone)) {
      newErrors.phone = "Số điện thoại phải có 10 chữ số";
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
      await updateMutation.mutateAsync({
        employeeId: employee.employeeId,
        payload: formData,
      });
      showToast("Cập nhật nhân viên thành công", undefined, "success");
      onClose();
    } catch (error: any) {
      showToast(
        "Cập nhật nhân viên thất bại",
        error?.message || "Vui lòng thử lại",
        "error"
      );
    }
  };

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
        id="edit-employee-tour-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-xl font-semibold">
            Chỉnh sửa thông tin nhân viên
          </DialogTitle>
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
          {/* Employee Info (Read-only) */}
          <div className="bg-zinc-800/50 p-4 rounded-xl space-y-2" id="edit-employee-tour-readonly-info">
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400">Email:</span>
              <span className="text-zinc-200">{employee.email}</span>
            </div>
            <div className="flex items-center gap-2 text-sm">
              <span className="text-zinc-400">Ngày vào làm:</span>
              <span className="text-zinc-200">
                {new Date(employee.hireDate).toLocaleDateString("vi-VN")}
              </span>
            </div>
          </div>

          {/* Full Name */}
          <div className="space-y-2" id="edit-employee-tour-fullname">
            <Label htmlFor="fullName" className="text-sm font-medium">
              Họ và tên <span className="text-red-500">*</span>
            </Label>
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

          {/* Phone */}
          <div className="space-y-2" id="edit-employee-tour-phone">
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

          {/* Role Type */}
          <div className="space-y-2" id="edit-employee-tour-role">
            <Label htmlFor="roleType" className="text-sm font-medium">
              Vai trò <span className="text-red-500">*</span>
            </Label>
            {hasActiveCinemas && employee.roleType === "Staff" && (
              <p className="text-xs text-amber-400">
                ⚠️ Nhân viên đang quản lý {assignmentsData?.result?.filter(a => a.isActive).length} rạp. Vui lòng hủy phân quyền trước khi đổi vai trò.
              </p>
            )}
            <Select
              value={formData.roleType}
              onValueChange={(value: any) => handleChange("roleType", value)}
              disabled={hasActiveCinemas && employee.roleType === "Staff"}
            >
              <SelectTrigger className="bg-zinc-800 border-zinc-700 text-zinc-100 rounded-xl disabled:opacity-50 disabled:cursor-not-allowed">
                <SelectValue />
              </SelectTrigger>
              <SelectContent className="bg-zinc-800 border-zinc-700">
                <SelectItem value="Staff">Nhân viên</SelectItem>
                <SelectItem value="Marketing">Marketing</SelectItem>
                <SelectItem value="Cashier">Thu ngân</SelectItem>
              </SelectContent>
            </Select>
          </div>

          {/* Is Active */}
          <div className="space-y-2" id="edit-employee-tour-status">
            <Label htmlFor="isActive" className="text-sm font-medium">
              Trạng thái làm việc <span className="text-red-500">*</span>
            </Label>
            {hasActiveCinemas && formData.isActive && (
              <p className="text-xs text-amber-400">
                ⚠️ Nhân viên đang quản lý {assignmentsData?.result?.filter(a => a.isActive).length} rạp. Vui lòng hủy phân quyền trước khi tạm dừng.
              </p>
            )}
            <div className="flex gap-3">
              <Button
                type="button"
                onClick={() => handleChange("isActive", true)}
                className={`flex-1 rounded-xl ${
                  formData.isActive
                    ? "bg-emerald-600 hover:bg-emerald-500 text-white"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700"
                }`}
              >
                Đang làm việc
              </Button>
              <Button
                type="button"
                onClick={() => handleChange("isActive", false)}
                disabled={hasActiveCinemas && formData.isActive}
                className={`flex-1 rounded-xl ${
                  !formData.isActive
                    ? "bg-zinc-700 hover:bg-zinc-600 text-white"
                    : hasActiveCinemas && formData.isActive
                    ? "bg-zinc-800/50 text-zinc-500 border border-zinc-700 cursor-not-allowed opacity-50"
                    : "bg-zinc-800 hover:bg-zinc-700 text-zinc-400 border border-zinc-700"
                }`}
              >
                Ngừng làm việc
              </Button>
            </div>
          </div>

          {/* Action Buttons */}
          <div className="flex justify-end gap-3 pt-4" id="edit-employee-tour-actions">
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
              disabled={updateMutation.isPending}
              className="bg-blue-600 hover:bg-blue-500 text-white rounded-xl"
            >
              {updateMutation.isPending ? "Đang cập nhật..." : "Cập nhật"}
            </Button>
          </div>
        </form>
      </DialogContent>
    </Dialog>
  );
}
