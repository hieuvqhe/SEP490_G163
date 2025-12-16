"use client";

import React, { useState, useEffect, useCallback, useMemo } from "react";
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
import { MapPin, Check, Info } from "lucide-react";
import { cn } from "@/lib/utils";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

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
  const [selectedCity, setSelectedCity] = useState<string>("all");
  const [selectedDistrict, setSelectedDistrict] = useState<string>("all");

  const { showToast } = useToast();

  // 1. Fetch specific assignments for THIS employee (to correctly show what they currently have)
  const { data: employeeAssignmentsData, isLoading: loadingEmployeeAssignments } = 
    useGetCinemaAssignments(employee.employeeId);

  // 2. Fetch ALL employees to check their assignments
  const { data: employeesData, isLoading: loadingEmployees } = useGetPartnerEmployees({
    limit: 50, // Limit to 50 as requested
    isActive: true,
  });

  // 3. Filter out the current employee from the list
  const otherEmployees = useMemo(() => {
    return (employeesData?.result?.employees || []).filter(
      (emp) => String(emp.employeeId) !== String(employee.employeeId)
    );
  }, [employeesData, employee.employeeId]);

  // 4. Fetch assignments for ALL OTHER employees
  const otherAssignmentsQueries = useQueries({
    queries: otherEmployees.map((emp) => ({
      queryKey: ["cinema-assignments", emp.employeeId],
      queryFn: () => partnerEmployeeService.getCinemaAssignments(emp.employeeId),
      staleTime: 5 * 60 * 1000, // Cache for 5 minutes
      gcTime: 10 * 60 * 1000,
    })),
  });

  // 5. Aggregate assignments from other employees with SAME role type
  // 1 rạp có thể có 1 staff VÀ 1 cashier
  // => Chỉ filter ra các rạp đã có nhân viên CÙNG role
  const assignedToOthers = useMemo(() => {
    const assigned = new Set<number>();
    const assignmentMap = new Map<number, string>(); // cinemaId -> employeeName

    otherAssignmentsQueries.forEach((query, index) => {
      if (query.data?.result) {
        const otherEmployee = otherEmployees[index];
        const empName = otherEmployee?.fullName || "Unknown";
        
        // Chỉ kiểm tra assignments của nhân viên CÙNG role type
        if (otherEmployee?.roleType === employee.roleType) {
          query.data.result.forEach((assignment) => {
            if (assignment.isActive) {
              assigned.add(assignment.cinemaId);
              assignmentMap.set(assignment.cinemaId, empName);
            }
          });
        }
      }
    });

    return { set: assigned, map: assignmentMap };
  }, [otherAssignmentsQueries, otherEmployees, employee.roleType]);
  
  const { data: cinemasData, isLoading: loadingCinemas } = useGetPartnerCinemas({
    page: 1,
    limit: 100,
    isActive: true, // Chỉ lấy các rạp đang hoạt động
  });

  const assignMutation = useAssignCinemaToEmployee();
  const unassignMutation = useUnassignCinemaFromEmployee();

  const handleStartTour = useCallback(() => {
    const steps = [
      {
        element: "#assign-cinema-tour-modal",
        popover: {
          title: "Phân quyền rạp cho nhân viên",
          description: "Tại đây bạn có thể phân quyền quản lý rạp cho nhân viên. Nhân viên sẽ có quyền truy cập các rạp được phân quyền.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#assign-cinema-tour-employee-info",
        popover: {
          title: "Thông tin nhân viên",
          description: "Hiển thị thông tin nhân viên đang được phân quyền, bao gồm tên và email.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#assign-cinema-tour-selection-label",
        popover: {
          title: "Quy tắc chọn rạp",
          description: employee.roleType === "Cashier" 
            ? "Cashier chỉ được phân quyền quản lý 1 rạp duy nhất. Nhân viên và Marketing có thể quản lý nhiều rạp."
            : "Nhân viên và Marketing có thể được phân quyền quản lý nhiều rạp. Cashier chỉ được phân 1 rạp.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#assign-cinema-tour-cinema-list",
        popover: {
          title: "Danh sách rạp",
          description: "Chọn các rạp muốn phân quyền. Rạp đã được phân cho nhân viên khác sẽ bị vô hiệu hóa và hiển thị tên nhân viên được phân.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#assign-cinema-tour-actions",
        popover: {
          title: "Lưu thay đổi",
          description: "Nhấn 'Lưu thay đổi' để xác nhận phân quyền, hoặc 'Hủy' để đóng mà không lưu.",
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
  }, [employee.roleType]);

  const cinemas = cinemasData?.result?.cinemas || [];

  // Get unique cities and districts from cinemas
  const cities = useMemo(() => {
    const uniqueCities = new Set(cinemas.map((c) => c.city));
    return Array.from(uniqueCities).sort();
  }, [cinemas]);

  const districts = useMemo(() => {
    if (selectedCity === "all") {
      const uniqueDistricts = new Set(cinemas.map((c) => c.district));
      return Array.from(uniqueDistricts).sort();
    }
    const filteredCinemas = cinemas.filter((c) => c.city === selectedCity);
    const uniqueDistricts = new Set(filteredCinemas.map((c) => c.district));
    return Array.from(uniqueDistricts).sort();
  }, [cinemas, selectedCity]);

  // Filter cinemas based on selected city and district
  const filteredCinemas = useMemo(() => {
    let filtered = cinemas;
    if (selectedCity !== "all") {
      filtered = filtered.filter((c) => c.city === selectedCity);
    }
    if (selectedDistrict !== "all") {
      filtered = filtered.filter((c) => c.district === selectedDistrict);
    }
    return filtered;
  }, [cinemas, selectedCity, selectedDistrict]);

  // Reset district when city changes
  useEffect(() => {
    setSelectedDistrict("all");
  }, [selectedCity]);
  
  // Initialize selection from employee's specific assignments
  useEffect(() => {
    if (employeeAssignmentsData?.result) {
      const assigned = new Set(
        employeeAssignmentsData.result
          .filter((a) => a.isActive)
          .map((a) => a.cinemaId)
      );
      setSelectedCinemaIds(assigned);
      setInitialAssignments(assigned);
    }
  }, [employeeAssignmentsData]);

  // Check if current employee is Cashier
  const isCashier = employee.roleType === "Cashier";

  const handleToggleCinema = (cinemaId: number) => {
    const isSelected = selectedCinemaIds.has(cinemaId);
    const isAssignedToOther = assignedToOthers.set.has(cinemaId);

    // Không cho phép chọn rạp đã được phân cho nhân viên khác (trừ khi rạp đó đang được chọn bởi nhân viên hiện tại - trường hợp conflict)
    if (isAssignedToOther && !isSelected) {
      return;
    }
    
    setSelectedCinemaIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(cinemaId)) {
        newSet.delete(cinemaId);
      } else {
        // Nếu là Cashier, chỉ cho phép chọn 1 rạp duy nhất
        if (isCashier) {
          newSet.clear(); // Xóa tất cả lựa chọn trước đó
        }
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

  const isLoading = loadingEmployeeAssignments || loadingEmployees || loadingCinemas;
  // Note: We don't block UI on otherAssignmentsQueries loading, but we might show loading state for individual items if needed.
  // Or we can just let them pop in. For now, let's not block the whole modal.
  
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
        id="assign-cinema-tour-modal"
      >
        <div className="flex items-center justify-between mb-4">
          <DialogTitle className="text-xl font-semibold">
            Phân quyền rạp cho nhân viên
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

        {/* Employee Info */}
        <div className="bg-zinc-800/50 p-4 rounded-xl mb-4" id="assign-cinema-tour-employee-info">
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

        {/* Filter Section */}
        {!isLoading && cinemas.length > 0 && (
          <div className="grid grid-cols-2 gap-3 mb-4">
            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Thành phố</Label>
              <select
                value={selectedCity}
                onChange={(e) => setSelectedCity(e.target.value)}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500"
              >
                <option value="all">Tất cả thành phố</option>
                {cities.map((city) => (
                  <option key={city} value={city}>
                    {city}
                  </option>
                ))}
              </select>
            </div>

            <div className="space-y-2">
              <Label className="text-sm text-zinc-400">Quận/Huyện</Label>
              <select
                value={selectedDistrict}
                onChange={(e) => setSelectedDistrict(e.target.value)}
                disabled={selectedCity === "all"}
                className="w-full px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-xl text-zinc-200 focus:outline-none focus:ring-2 focus:ring-emerald-500 disabled:opacity-50 disabled:cursor-not-allowed"
              >
                <option value="all">Tất cả quận/huyện</option>
                {districts.map((district) => (
                  <option key={district} value={district}>
                    {district}
                  </option>
                ))}
              </select>
            </div>
          </div>
        )}

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
        ) : filteredCinemas.length === 0 ? (
          <div className="text-center py-10 text-zinc-400">
            Không tìm thấy rạp phù hợp với bộ lọc
          </div>
        ) : (
          <div className="space-y-3" id="assign-cinema-tour-cinema-list">
            <Label className="text-sm font-medium text-zinc-300" id="assign-cinema-tour-selection-label">
              {isCashier 
                ? `Chọn rạp (Cashier chỉ được phân 1 rạp) - ${filteredCinemas.length} rạp` 
                : `Chọn các rạp (${selectedCinemaIds.size} đã chọn) - ${filteredCinemas.length} rạp`
              }
            </Label>
            {filteredCinemas.map((cinema) => {
              const isSelected = selectedCinemaIds.has(cinema.cinemaId);
              const isAssignedToOther = assignedToOthers.set.has(cinema.cinemaId);
              const assignedEmployeeName = assignedToOthers.map.get(cinema.cinemaId);
              
              return (
                <div
                  key={cinema.cinemaId}
                  onClick={() => handleToggleCinema(cinema.cinemaId)}
                  className={cn(
                    "flex items-center gap-3 p-4 rounded-xl border transition-all",
                    isAssignedToOther && !isSelected
                      ? "bg-zinc-800/30 border-zinc-700/50 opacity-50 cursor-not-allowed"
                      : isSelected
                      ? "bg-emerald-500/10 border-emerald-500/30 cursor-pointer"
                      : "bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 cursor-pointer"
                  )}
                >
                  <Checkbox
                    checked={isSelected}
                    disabled={isAssignedToOther && !isSelected}
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
                      {isAssignedToOther && (
                        <Badge variant="outline" className="bg-amber-500/10 text-amber-400 border-amber-500/20 text-xs">
                          Đã phân cho {assignedEmployeeName}
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
        <div className="flex justify-end gap-3 pt-4 border-t border-zinc-800 mt-4" id="assign-cinema-tour-actions">
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
