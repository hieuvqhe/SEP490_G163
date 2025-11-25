"use client";

import React, { useState, useEffect } from "react";
import { Dialog, DialogContent, DialogTitle } from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Label } from "@/components/ui/label";
import { Checkbox } from "@/components/ui/checkbox";
import { Badge } from "@/components/ui/badge";
import { useToast } from "@/components/ToastProvider";
import { useQueries } from "@tanstack/react-query";
import {
  useGetCinemaAssignments,
  useAssignCinemaToEmployee,
  useUnassignCinemaFromEmployee,
  useGetPartnerEmployees,
  partnerEmployeeService,
  type PartnerEmployee,
} from "@/apis/partner.decentralization.api";
import { useGetPartnerCinemas } from "@/apis/partner.cinema.api";
import { MapPin, Check } from "lucide-react";
import { cn } from "@/lib/utils";

interface AssignCinemaModalProps {
  open: boolean;
  employee: PartnerEmployee;
  onClose: () => void;
}

export default function AssignCinemaModal({
  open,
  employee,
  onClose,
}: AssignCinemaModalProps) {
  const [selectedCinemaIds, setSelectedCinemaIds] = useState<Set<number>>(new Set());
  const [initialAssignments, setInitialAssignments] = useState<Set<number>>(new Set());

  const { showToast } = useToast();
  // Lấy assignments của nhân viên hiện tại
  const { data: assignmentsData, isLoading: loadingAssignments } = useGetCinemaAssignments(
    employee.employeeId
  );
  // Lấy danh sách TẤT CẢ nhân viên Staff active (để lấy assignments của họ)
  const { data: employeesData, isLoading: loadingEmployees } = useGetPartnerEmployees({
    roleType: "Staff",
    isActive: true,
    limit: 1000, // Lấy nhiều để đảm bảo có đủ
  });
  const { data: cinemasData, isLoading: loadingCinemas } = useGetPartnerCinemas({
    page: 1,
    limit: 100,
    isActive: true, // Chỉ lấy các rạp đang hoạt động
  });

  const assignMutation = useAssignCinemaToEmployee();
  const unassignMutation = useUnassignCinemaFromEmployee();

  const assignments = assignmentsData?.result || [];
  const cinemas = cinemasData?.result?.cinemas || [];
  const allEmployees = employeesData?.result?.employees || [];
  
  // Fetch assignments của TẤT CẢ nhân viên Staff khác (không phải nhân viên hiện tại)
  const otherEmployees = allEmployees.filter(emp => emp.employeeId !== employee.employeeId);
  
  // Sử dụng useQueries để fetch assignments của từng nhân viên khác một cách an toàn
  const otherAssignmentsQueries = useQueries({
    queries: otherEmployees.map(emp => ({
      queryKey: ["cinema-assignments", emp.employeeId],
      queryFn: () => partnerEmployeeService.getCinemaAssignments(emp.employeeId),
      staleTime: 5 * 60 * 1000,
      gcTime: 10 * 60 * 1000,
    })),
  });
  
  // Merge tất cả assignments của nhân viên khác
  const allOtherAssignments = otherAssignmentsQueries
    .flatMap(query => query.data?.result || [])
    .filter(a => a.isActive);

  // Tạo Set chứa các cinemaId đã được phân cho NHÂN VIÊN KHÁC
  const assignedToOthers = new Set(
    allOtherAssignments.map((a) => a.cinemaId)
  );
  


  useEffect(() => {
    if (assignments.length > 0) {
      const assigned = new Set(
        assignments.filter((a) => a.isActive).map((a) => a.cinemaId)
      );
      setSelectedCinemaIds(assigned);
      setInitialAssignments(assigned);
    }
  }, [assignments]);

  const handleToggleCinema = (cinemaId: number) => {
    // Không cho phép chọn rạp đã được phân cho nhân viên khác
    if (assignedToOthers.has(cinemaId)) {
      return;
    }
    
    setSelectedCinemaIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cinemaId)) {
        newSet.delete(cinemaId);
      } else {
        newSet.add(cinemaId);
      }
      return newSet;
    });
  };

  const handleSubmit = async () => {
    const toAssign = Array.from(selectedCinemaIds).filter(
      (id) => !initialAssignments.has(id)
    );
    const toUnassign = Array.from(initialAssignments).filter(
      (id) => !selectedCinemaIds.has(id)
    );

    try {
      if (toAssign.length > 0) {
        await assignMutation.mutateAsync({
          employeeId: employee.employeeId,
          cinemaIds: toAssign,
        });
      }

      if (toUnassign.length > 0) {
        await unassignMutation.mutateAsync({
          employeeId: employee.employeeId,
          cinemaIds: toUnassign,
        });
      }

      if (toAssign.length > 0 || toUnassign.length > 0) {
        showToast("Cập nhật phân rạp thành công", undefined, "success");
      }
      onClose();
    } catch (error: any) {
      showToast(
        "Cập nhật phân rạp thất bại",
        error?.message || "Vui lòng thử lại",
        "error"
      );
    }
  };

  const isLoading = loadingAssignments || loadingEmployees || loadingCinemas || otherAssignmentsQueries.some(q => q.isLoading);
  const isPending = assignMutation.isPending || unassignMutation.isPending;
  const hasChanges =
    selectedCinemaIds.size !== initialAssignments.size ||
    Array.from(selectedCinemaIds).some((id) => !initialAssignments.has(id));

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent
        className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl max-h-[80vh] overflow-y-auto"
        onInteractOutside={(e) => e.preventDefault()}
        onEscapeKeyDown={(e) => e.preventDefault()}
      >
        <DialogTitle className="text-xl font-semibold mb-4">
          Phân quyền rạp cho nhân viên
        </DialogTitle>

        {/* Employee Info */}
        <div className="bg-zinc-800/50 p-4 rounded-xl mb-4">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <p className="font-medium">{employee.fullName}</p>
              <p className="text-sm text-zinc-400">{employee.email}</p>
            </div>
          </div>
        </div>

        {/* Cinema List */}
        {isLoading ? (
          <div className="space-y-2">
            {[...Array(3)].map((_, i) => (
              <div
                key={i}
                className="h-20 bg-zinc-800/50 rounded-xl animate-pulse"
              />
            ))}
          </div>
        ) : cinemas.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">
            Chưa có rạp nào để phân quyền
          </div>
        ) : (
          <div className="space-y-3">
            <Label className="text-sm font-medium text-zinc-300">
              Chọn các rạp ({selectedCinemaIds.size} đã chọn)
            </Label>
            {cinemas.map((cinema) => {
              const isSelected = selectedCinemaIds.has(cinema.cinemaId);
              const isAssignedToOther = assignedToOthers.has(cinema.cinemaId);
              const assignedEmployee = isAssignedToOther 
                ? allOtherAssignments.find(a => a.cinemaId === cinema.cinemaId && a.isActive)
                : null;
              
              return (
                <div
                  key={cinema.cinemaId}
                  onClick={() => handleToggleCinema(cinema.cinemaId)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all",
                    isAssignedToOther
                      ? "bg-zinc-800/30 border-zinc-700/50 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
                      : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isAssignedToOther}
                    onCheckedChange={() => handleToggleCinema(cinema.cinemaId)}
                    className="data-[state=checked]:bg-emerald-600 data-[state=checked]:border-emerald-600"
                  />
                  <div className="flex-1">
                    <div className="flex items-center gap-2 flex-wrap">
                      <p className="font-medium">{cinema.cinemaName}</p>
                      {isSelected && (
                        <Badge className="bg-emerald-600 text-white text-xs">
                          <Check className="h-3 w-3 mr-1" />
                          Đã chọn
                        </Badge>
                      )}
                      {isAssignedToOther && assignedEmployee && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                          Đã phân cho {assignedEmployee.employeeName}
                        </Badge>
                      )}
                    </div>
                    <div className="flex items-center gap-2 text-sm text-zinc-400 mt-1">
                      <MapPin className="h-4 w-4" />
                      <span>
                        {cinema.address}, {cinema.city}
                      </span>
                    </div>
                  </div>
                </div>
              );
            })}
          </div>
        )}

        {/* Action Buttons */}
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-4">
          <Button
            type="button"
            variant="outline"
            onClick={onClose}
            disabled={isPending}
            className="bg-zinc-800 text-zinc-200 hover:bg-zinc-700 border-zinc-700 rounded-xl"
          >
            Hủy
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={isPending || !hasChanges || isLoading}
            className="bg-emerald-600 hover:bg-emerald-500 text-white rounded-xl"
          >
            {isPending ? "Đang lưu..." : "Lưu thay đổi"}
          </Button>
        </div>
      </DialogContent>
    </Dialog>
  );
}
