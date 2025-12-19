import React, { Dispatch, SetStateAction, useState } from "react";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import {
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  CreateNewUserBody,
  useCreateNewUserMutate,
  useGetUsers,
} from "@/apis/admin.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";

// Interface cho Manager để hiển thị trong Select
export interface ManagerOption {
  id: number;
  fullName: string;
}

const initialUserState: CreateNewUserBody = {
  fullName: "",
  username: "",
  email: "",
  password: "",
  confirmPassword: "",
  phone: "",
  role: "user", // Default role
  managerId: 0,
  hireDate: new Date().toISOString().split("T")[0],
};

interface AddUserDialogProps {
  setIsOpen: Dispatch<SetStateAction<boolean>>;
}

const AddUserDialog = ({ setIsOpen }: AddUserDialogProps) => {
  const [newUser, setNewUser] = useState<CreateNewUserBody>(initialUserState);

  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  // State quản lý lỗi cho từng trường
  const [errors, setErrors] = useState<
    Partial<Record<keyof CreateNewUserBody, string>>
  >({});

  const { data: managerRes } = useGetUsers(
    { role: "manager" },
    accessToken ?? ""
  );
  const managers = managerRes?.result.users;
  const createUserMutate = useCreateNewUserMutate();

  const validate = () => {
    const newErrors: Partial<Record<keyof CreateNewUserBody, string>> = {};

    // Validate Username: 8-15 ký tự, chữ cái, số, dấu gạch dưới
    const usernameRegex = /^[a-zA-Z0-9_]{8,15}$/;
    if (!usernameRegex.test(newUser.username)) {
      newErrors.username = "Tên đăng nhập từ 8-15 ký tự (chỉ chứa chữ, số, _)";
    }

    // Validate Password: 6-12 ký tự, hoa, thường, số, đặc biệt
    // Biểu thức: ít nhất 1 chữ hoa, 1 chữ thường, 1 số, 1 ký tự đặc biệt, dài 6-12
    const passwordRegex =
      /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{6,12}$/;
    if (!passwordRegex.test(newUser.password)) {
      newErrors.password =
        "Mật khẩu 6-12 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt";
    }

    // Xác nhận mật khẩu
    if (newUser.password !== newUser.confirmPassword) {
      newErrors.confirmPassword = "Mật khẩu xác nhận không khớp";
    }

    // Email cơ bản
    if (!newUser.email.includes("@")) {
      newErrors.email = "Email không hợp lệ";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleInputChange = (field: keyof CreateNewUserBody, value: any) => {
    setNewUser((prev) => ({ ...prev, [field]: value }));
    // Xóa lỗi khi người dùng bắt đầu nhập lại
    if (errors[field]) {
      setErrors((prev) => ({ ...prev, [field]: undefined }));
    }
  };

  const handleCreateUser = () => {
    if (!validate()) return;

    console.log(newUser);

    // Call API
    createUserMutate.mutate(newUser as any, {
      onSuccess: () => {
        setIsOpen(false);
        setNewUser(initialUserState);
        showToast("Tạo người dùng thành công", "success");
      },
      onError: (error: any) => {
        showToast(error?.response?.data?.message || "Có lỗi xảy ra", "error");
      },
    });
  };
  return (
    <div>
      <DialogContent className="sm:max-w-[640px] bg-slate-900 text-white border border-slate-700 rounded-xl">
        <DialogHeader className="space-y-1">
          <DialogTitle className="text-xl font-semibold">
            Thêm người dùng mới
          </DialogTitle>
          <DialogDescription className="text-sm text-slate-400">
            Điền thông tin để tạo tài khoản mới trong hệ thống
          </DialogDescription>
        </DialogHeader>

        <div className="mt-6 space-y-5">
          {/* Họ tên + Username */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="fullName" className="text-xs text-slate-300">
                Họ và tên
              </Label>
              <Input
                id="fullName"
                placeholder="Nguyễn Văn A"
                className="bg-slate-800 border-slate-600 focus:border-blue-500"
                value={newUser.fullName}
                onChange={(e) => handleInputChange("fullName", e.target.value)}
              />
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="username" className="text-xs text-slate-300">
                Tên đăng nhập
              </Label>
              <Input
                id="username"
                placeholder="nguyenvana"
                className={`bg-slate-800 border-slate-600 focus:border-blue-500 ${
                  errors.username && "border-red-500"
                }`}
                value={newUser.username}
                onChange={(e) => handleInputChange("username", e.target.value)}
              />
              {errors.username && (
                <p className="text-[11px] text-red-400">{errors.username}</p>
              )}
            </div>
          </div>

          {/* Email + Phone */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="email" className="text-xs text-slate-300">
                Email
              </Label>
              <Input
                id="email"
                type="email"
                placeholder="user@example.com"
                className={`bg-slate-800 border-slate-600 focus:border-blue-500 ${
                  errors.email && "border-red-500"
                }`}
                value={newUser.email}
                onChange={(e) => handleInputChange("email", e.target.value)}
              />
              {errors.email && (
                <p className="text-[11px] text-red-400">{errors.email}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label htmlFor="phone" className="text-xs text-slate-300">
                Số điện thoại
              </Label>
              <Input
                id="phone"
                placeholder="0912345678"
                className="bg-slate-800 border-slate-600 focus:border-blue-500"
                value={newUser.phone}
                onChange={(e) => handleInputChange("phone", e.target.value)}
              />
            </div>
          </div>

          {/* Password */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label htmlFor="password" className="text-xs text-slate-300">
                Mật khẩu
              </Label>
              <Input
                id="password"
                type="password"
                className={`bg-slate-800 border-slate-600 focus:border-blue-500 ${
                  errors.password && "border-red-500"
                }`}
                value={newUser.password}
                onChange={(e) => handleInputChange("password", e.target.value)}
              />
              {errors.password && (
                <p className="text-[11px] text-red-400">{errors.password}</p>
              )}
            </div>

            <div className="space-y-1.5">
              <Label
                htmlFor="confirmPassword"
                className="text-xs text-slate-300"
              >
                Xác nhận mật khẩu
              </Label>
              <Input
                id="confirmPassword"
                type="password"
                className={`bg-slate-800 border-slate-600 focus:border-blue-500 ${
                  errors.confirmPassword && "border-red-500"
                }`}
                value={newUser.confirmPassword}
                onChange={(e) =>
                  handleInputChange("confirmPassword", e.target.value)
                }
              />
              {errors.confirmPassword && (
                <p className="text-[11px] text-red-400">
                  {errors.confirmPassword}
                </p>
              )}
            </div>
          </div>

          {/* Role + Manager */}
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div className="space-y-1.5">
              <Label className="text-xs text-slate-300">Vai trò</Label>
              <Select
                value={newUser.role}
                onValueChange={(value) => handleInputChange("role", value)}
              >
                <SelectTrigger className="bg-slate-800 border-slate-600">
                  <SelectValue placeholder="Chọn vai trò" />
                </SelectTrigger>
                <SelectContent className="bg-slate-800 border-slate-600 text-white">
                  <SelectItem value="User">Khách hàng (User)</SelectItem>
                  <SelectItem value="ManagerStaff">
                    Nhân viên (Staff)
                  </SelectItem>
                  <SelectItem value="Manager">Quản lý (Manager)</SelectItem>
                </SelectContent>
              </Select>
            </div>

            {newUser.role === "ManagerStaff" && (
              <div className="space-y-1.5">
                <Label className="text-xs text-slate-300">
                  Người quản lý trực tiếp
                </Label>
                <Select
                  value={newUser.managerId?.toString() || ""}
                  onValueChange={(value) =>
                    handleInputChange("managerId", parseInt(value))
                  }
                >
                  <SelectTrigger className="bg-slate-800 border-slate-600">
                    <SelectValue placeholder="Chọn quản lý" />
                  </SelectTrigger>
                  <SelectContent className="bg-slate-800 border-slate-600 text-white">
                    {managers?.length ? (
                      managers.map((m) => (
                        <SelectItem key={m.id} value={m.id.toString()}>
                          {m.username}
                        </SelectItem>
                      ))
                    ) : (
                      <div className="p-2 text-xs text-slate-400 text-center">
                        Không có dữ liệu
                      </div>
                    )}
                  </SelectContent>
                </Select>
              </div>
            )}
          </div>
        </div>

        <DialogFooter className="mt-6 flex justify-end gap-2">
          <Button
            variant="outline"
            onClick={() => setIsOpen(false)}
            className="border-slate-600 text-slate-200 hover:bg-slate-800"
          >
            Hủy
          </Button>
          <Button
            onClick={handleCreateUser}
            className="bg-blue-600 hover:bg-blue-700"
          >
            Xác nhận thêm
          </Button>
        </DialogFooter>
      </DialogContent>
    </div>
  );
};

export default AddUserDialog;
