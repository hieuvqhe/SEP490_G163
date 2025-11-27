"use client";

import React, { useState } from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import {
  Dialog,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import { Search, UserPlus } from "lucide-react";
import {
  useGetPartnerEmployees,
  useDeletePartnerEmployee,
  useGetCinemaAssignments,
  type PartnerEmployee,
} from "@/apis/partner.decentralization.api";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import CreateEmployeeModal from "./CreateEmployeeModal";
import EditEmployeeModal from "./EditEmployeeModal";
import AssignCinemaModal from "./AssignCinemaModal";
import EmployeePermissionModal from "./EmployeePermissionModal";
import EmployeeCard from "./EmployeeCard";

import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";

export default function EmployeeManagement() {
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState("");
  const [roleFilter, setRoleFilter] = useState<"all" | "Staff" | "Marketing" | "Cashier">("all");
  const [statusFilter, setStatusFilter] = useState<"all" | "active" | "inactive">("all");
  const [isCreateModalOpen, setIsCreateModalOpen] = useState(false);
  const [editingEmployee, setEditingEmployee] = useState<PartnerEmployee | null>(null);
  const [assigningEmployee, setAssigningEmployee] = useState<PartnerEmployee | null>(null);
  const [permissionEmployee, setPermissionEmployee] = useState<PartnerEmployee | null>(null);
  const [deletingEmployee, setDeletingEmployee] = useState<PartnerEmployee | null>(null);
  const [checkingEmployee, setCheckingEmployee] = useState<number | null>(null);

  const { showToast } = useToast();
  const deleteEmployeeMutation = useDeletePartnerEmployee();
  
  // Kiểm tra assignments của nhân viên đang chuẩn bị delete
  const { data: deletingAssignmentsData } = useGetCinemaAssignments(
    checkingEmployee || undefined,
    { enabled: checkingEmployee !== null }
  );

  const { data: employeesData, isLoading } = useGetPartnerEmployees({
    page,
    limit: 8,
    search: search || undefined,
    roleType: roleFilter !== "all" ? roleFilter : undefined,
    isActive: statusFilter === "all" ? undefined : statusFilter === "active",
    sortBy: "fullName",
    sortOrder: "asc",
  });

  const employees = employeesData?.result?.employees || [];
  const totalPages = employeesData?.result?.pagination?.totalPages || 1;

  const handleDeleteClick = async (employee: PartnerEmployee) => {
    // Nếu là Staff, kiểm tra xem có đang quản lý rạp không
    if (employee.roleType === "Staff") {
      setCheckingEmployee(employee.employeeId);
      // Đợi một chút để fetch assignments
      setTimeout(() => {
        setCheckingEmployee(null);
      }, 100);
    }
    setDeletingEmployee(employee);
  };

  const handleDeleteEmployee = async () => {
    if (!deletingEmployee) return;

    try {
      await deleteEmployeeMutation.mutateAsync(deletingEmployee.employeeId);
      showToast("Tạm dừng nhân viên thành công", undefined, "success");
      setDeletingEmployee(null);
    } catch (error: any) {
      showToast(
        "Tạm dừng nhân viên thất bại",
        error?.message || "Vui lòng thử lại",
        "error"
      );
    }
  };

  // Kiểm tra xem nhân viên có đang quản lý rạp không
  const hasActiveCinemas = deletingEmployee?.roleType === "Staff" 
    ? (deletingAssignmentsData?.result?.filter(a => a.isActive).length || 0) > 0
    : false;

  const getRoleBadge = (role: string) => {
    const roleConfig = {
      Staff: { label: "Nhân viên", color: "bg-blue-500/10 text-blue-400 border-blue-500/20" },
      Marketing: { label: "Marketing", color: "bg-purple-500/10 text-purple-400 border-purple-500/20" },
      Cashier: { label: "Thu ngân", color: "bg-green-500/10 text-green-400 border-green-500/20" },
    };
    const config = roleConfig[role as keyof typeof roleConfig] || roleConfig.Staff;
    return (
      <Badge variant="outline" className={cn("text-xs", config.color)}>
        {config.label}
      </Badge>
    );
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="min-h-[85vh] text-zinc-100 rounded-xl border border-[#27272a] bg-[#151518] p-6 shadow-lg shadow-black/40">
      {/* Header */}
      <div className="flex justify-between items-center mb-6">
        <div>
          <h1 className="text-2xl font-semibold">Quản lý nhân viên</h1>
          <p className="text-sm text-zinc-400 mt-1">
            Tổng: {employeesData?.result?.pagination?.totalCount || 0} nhân viên
          </p>
        </div>
        <Button
          onClick={() => setIsCreateModalOpen(true)}
          className="rounded-xl bg-emerald-600 hover:bg-emerald-500 flex items-center gap-2"
        >
          <UserPlus className="h-4 w-4" />
          Thêm nhân viên mới
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-wrap gap-4 items-center mb-6">
        <div className="relative flex-1 max-w-sm">
          <Search className="absolute left-3 top-2.5 text-zinc-500" size={18} />
          <Input
            placeholder="Tìm kiếm theo tên, email..."
            value={search}
            onChange={(e) => {
              setSearch(e.target.value);
              setPage(1);
            }}
            className="pl-10 bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl"
          />
        </div>

        <Select
          value={roleFilter}
          onValueChange={(value: any) => {
            setRoleFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl">
            <SelectValue placeholder="Vai trò" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Tất cả vai trò</SelectItem>
            <SelectItem value="Staff">Nhân viên</SelectItem>
            <SelectItem value="Marketing">Marketing</SelectItem>
            <SelectItem value="Cashier">Thu ngân</SelectItem>
          </SelectContent>
        </Select>

        <Select
          value={statusFilter}
          onValueChange={(value: any) => {
            setStatusFilter(value);
            setPage(1);
          }}
        >
          <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="bg-zinc-800 border-zinc-700">
            <SelectItem value="all">Tất cả</SelectItem>
            <SelectItem value="active">Đang làm</SelectItem>
            <SelectItem value="inactive">Ngừng làm</SelectItem>
          </SelectContent>
        </Select>
      </div>

      {/* Employee Grid */}
      {isLoading ? (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {[...Array(8)].map((_, i) => (
            <Card key={i} className="bg-zinc-800/50 border-zinc-700 animate-pulse">
              <CardContent className="p-4">
                <div className="h-20 bg-zinc-700 rounded mb-4" />
                <div className="h-4 bg-zinc-700 rounded mb-2" />
                <div className="h-4 bg-zinc-700 rounded w-2/3" />
              </CardContent>
            </Card>
          ))}
        </div>
      ) : employees.length === 0 ? (
        <div className="flex flex-col items-center justify-center py-20">
          <p className="text-zinc-400">Không tìm thấy nhân viên nào</p>
        </div>
      ) : (
        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
          {employees.map((employee) => (
            <EmployeeCard
              key={employee.employeeId}
              employee={employee}
              onEdit={setEditingEmployee}
              onAssign={setAssigningEmployee}
              onPermission={setPermissionEmployee}
              onDelete={handleDeleteClick}
              getRoleBadge={getRoleBadge}
              formatDate={formatDate}
            />
          ))}
        </div>
      )}

      {/* Pagination */}
      <div className="mt-6">
        <CustomPagination
          totalPages={totalPages}
          currentPage={page}
          onPageChange={setPage}
        />
      </div>

      {/* Modals */}
      <CreateEmployeeModal
        open={isCreateModalOpen}
        onClose={() => setIsCreateModalOpen(false)}
      />

      {editingEmployee && (
        <EditEmployeeModal
          open={!!editingEmployee}
          employee={editingEmployee}
          onClose={() => setEditingEmployee(null)}
        />
      )}

      {assigningEmployee && (
        <AssignCinemaModal
          open={!!assigningEmployee}
          employee={assigningEmployee}
          onClose={() => setAssigningEmployee(null)}
        />
      )}

      {permissionEmployee && (
        <EmployeePermissionModal
          open={!!permissionEmployee}
          employee={permissionEmployee}
          onClose={() => setPermissionEmployee(null)}
        />
      )}

      {/* Delete Confirmation */}
      <AlertDialog open={!!deletingEmployee} onOpenChange={() => setDeletingEmployee(null)}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-zinc-100">Xác nhận tạm dừng làm việc nhân viên</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              {hasActiveCinemas ? (
                <div className="space-y-2">
                  <div className="text-amber-400 font-semibold">
                    ⚠️ Không thể tạm dừng nhân viên này!
                  </div>
                  <div>
                    Nhân viên{" "}
                    <span className="font-semibold text-zinc-200">{deletingEmployee?.fullName}</span>{" "}
                    hiện đang quản lý {deletingAssignmentsData?.result?.filter(a => a.isActive).length} rạp chiếu.
                  </div>
                  <div>
                    Vui lòng hủy phân quyền tất cả các rạp trước khi tạm dừng nhân viên.
                  </div>
                </div>
              ) : (
                <>
                  Bạn có chắc chắn muốn tạm dừng làm việc nhân viên{" "}
                  <span className="font-semibold text-zinc-200">{deletingEmployee?.fullName}</span>?
                  Hành động này sẽ vô hiệu hóa tài khoản của nhân viên.
                </>
              )}
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700">
              {hasActiveCinemas ? "Đóng" : "Hủy"}
            </AlertDialogCancel>
            {!hasActiveCinemas && (
              <AlertDialogAction
                onClick={handleDeleteEmployee}
                className="bg-red-600 hover:bg-red-700 text-white"
                disabled={deleteEmployeeMutation.isPending}
              >
                {deleteEmployeeMutation.isPending ? "Đang xử lý..." : "Tạm dừng"}
              </AlertDialogAction>
            )}
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </div>
  );
}
