"use client";

import React, { useState, useEffect, useMemo } from "react";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Checkbox } from "@/components/ui/checkbox";
import { Skeleton } from "@/components/ui/skeleton";
import {
  Collapsible,
  CollapsibleContent,
  CollapsibleTrigger,
} from "@/components/ui/collapsible";
import {
  Shield,
  Building2,
  Monitor,
  LayoutGrid,
  Armchair,
  Coffee,
  Clock,
  Ticket,
  Loader2,
  Check,
  ChevronDown,
  AlertCircle,
  CheckCheck,
  X,
} from "lucide-react";
import { cn } from "@/lib/utils";
import { useToast } from "@/components/ToastProvider";
import {
  useGetPartnerPermissions,
  useGetEmployeePermissions,
  useGrantEmployeePermissions,
  useRevokeEmployeePermissions,
  getActionTypeColor,
  type Permission,
  type PermissionGroup,
  type ResourceType,
} from "@/apis/partner.permission.api";
import {
  useGetCinemaAssignments,
  type PartnerEmployee,
  type CinemaAssignment,
} from "@/apis/partner.decentralization.api";

interface EmployeePermissionModalProps {
  open: boolean;
  employee: PartnerEmployee;
  onClose: () => void;
}

// Icon mapping for resource types
const resourceIcons: Record<ResourceType, React.ReactNode> = {
  BOOKING: <Ticket className="h-4 w-4" />,
  CINEMA: <Building2 className="h-4 w-4" />,
  SCREEN: <Monitor className="h-4 w-4" />,
  SEAT_LAYOUT: <LayoutGrid className="h-4 w-4" />,
  SEAT_TYPE: <Armchair className="h-4 w-4" />,
  SERVICE: <Coffee className="h-4 w-4" />,
  SHOWTIME: <Clock className="h-4 w-4" />,
};

// Permission Group Collapsible Component
function PermissionGroupCollapsible({
  group,
  resourceIcons,
  getPermissionStatus,
  togglePermission,
  selectAllGroupPermissions,
  deselectAllGroupPermissions,
  selectedCinemaCount,
}: {
  group: PermissionGroup;
  resourceIcons: Record<ResourceType, React.ReactNode>;
  getPermissionStatus: (code: string) => { granted: number; effectiveGranted: number; pending: "grant" | "revoke" | null };
  togglePermission: (code: string) => void;
  selectAllGroupPermissions: (permissionCodes: string[]) => void;
  deselectAllGroupPermissions: (permissionCodes: string[]) => void;
  selectedCinemaCount: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  // Sử dụng effectiveGranted để hiển thị số quyền (tính cả pending changes)
  const grantedCount = group.permissions.filter(
    (p) => getPermissionStatus(p.permissionCode).effectiveGranted === selectedCinemaCount
  ).length;

  const allGroupCodes = group.permissions.map((p) => p.permissionCode);
  const isAllGranted = grantedCount === group.permissions.length;

  return (
    <Collapsible
      open={isOpen}
      onOpenChange={setIsOpen}
      className="border border-zinc-700 rounded-lg overflow-hidden bg-zinc-800/50"
    >
      <div className="flex items-center justify-between px-4 py-3 hover:bg-zinc-800">
        <CollapsibleTrigger className="flex-1 flex items-center gap-3">
          <div className="w-8 h-8 rounded-lg bg-zinc-700 flex items-center justify-center text-orange-400">
            {resourceIcons[group.resourceType]}
          </div>
          <div className="text-left">
            <div className="font-medium">{group.resourceName}</div>
            <div className="text-xs text-zinc-400">
              {grantedCount} / {group.permissions.length} quyền (tất cả rạp)
            </div>
          </div>
        </CollapsibleTrigger>
        <div className="flex items-center gap-2">
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              selectAllGroupPermissions(allGroupCodes);
            }}
            className={cn(
              "h-7 text-xs",
              isAllGranted
                ? "text-zinc-500 cursor-not-allowed"
                : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
            )}
            disabled={isAllGranted}
          >
            <CheckCheck className="h-3 w-3 mr-1" />
            Chọn hết
          </Button>
          <Button
            variant="ghost"
            size="sm"
            onClick={(e) => {
              e.stopPropagation();
              deselectAllGroupPermissions(allGroupCodes);
            }}
            className={cn(
              "h-7 text-xs",
              grantedCount === 0
                ? "text-zinc-500 cursor-not-allowed"
                : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
            )}
            disabled={grantedCount === 0}
          >
            <X className="h-3 w-3 mr-1" />
            Bỏ hết
          </Button>
          <CollapsibleTrigger>
            <ChevronDown
              className={cn(
                "h-4 w-4 text-zinc-400 transition-transform",
                isOpen && "rotate-180"
              )}
            />
          </CollapsibleTrigger>
        </div>
      </div>
      <CollapsibleContent className="px-4 pb-4">
        <div className="space-y-2 pt-2">
          {group.permissions.map((permission) => {
            const status = getPermissionStatus(permission.permissionCode);
            // Sử dụng effectiveGranted để hiển thị trạng thái (tính cả pending changes)
            const isFullyGranted = status.effectiveGranted === selectedCinemaCount;
            const isPartiallyGranted = status.effectiveGranted > 0 && status.effectiveGranted < selectedCinemaCount;

            return (
              <div
                key={permission.permissionId}
                className={cn(
                  "flex items-center justify-between p-3 rounded-lg border transition-all cursor-pointer",
                  isFullyGranted
                    ? "bg-emerald-500/10 border-emerald-500/30"
                    : isPartiallyGranted
                    ? "bg-amber-500/10 border-amber-500/30"
                    : "bg-zinc-800 border-zinc-700",
                  status.pending && "ring-2 ring-orange-500/50"
                )}
                onClick={() => togglePermission(permission.permissionCode)}
              >
                <div className="flex items-center gap-3">
                  <div className="relative">
                    <Checkbox
                      checked={isFullyGranted}
                      className={cn(
                        "border-zinc-600",
                        isFullyGranted && "bg-emerald-500 border-emerald-500",
                        isPartiallyGranted && "bg-amber-500 border-amber-500"
                      )}
                    />
                    {isPartiallyGranted && (
                      <div className="absolute inset-0 flex items-center justify-center">
                        <div className="w-2 h-0.5 bg-white" />
                      </div>
                    )}
                  </div>
                  <div>
                    <div className="flex items-center gap-2">
                      <span className="font-medium text-sm">
                        {permission.permissionName}
                      </span>
                      <Badge
                        variant="outline"
                        className={cn(
                          "text-[10px] px-1.5 py-0",
                          getActionTypeColor(permission.actionType)
                        )}
                      >
                        {permission.actionType}
                      </Badge>
                    </div>
                    <p className="text-xs text-zinc-400 mt-0.5">
                      {permission.description}
                    </p>
                  </div>
                </div>
                <div className="flex items-center gap-2">
                  {isPartiallyGranted && (
                    <Badge variant="outline" className="text-xs bg-amber-500/20 text-amber-400 border-amber-500/30">
                      {status.effectiveGranted}/{selectedCinemaCount} rạp
                    </Badge>
                  )}
                  {status.pending && (
                    <Badge
                      variant="outline"
                      className={cn(
                        "text-xs",
                        status.pending === "grant"
                          ? "bg-emerald-500/20 text-emerald-400 border-emerald-500/30"
                          : "bg-red-500/20 text-red-400 border-red-500/30"
                      )}
                    >
                      {status.pending === "grant" ? "Sẽ cấp" : "Sẽ thu hồi"}
                    </Badge>
                  )}
                </div>
              </div>
            );
          })}
        </div>
      </CollapsibleContent>
    </Collapsible>
  );
}

export default function EmployeePermissionModal({
  open,
  employee,
  onClose,
}: EmployeePermissionModalProps) {
  const { showToast } = useToast();
  const [selectedCinemaIds, setSelectedCinemaIds] = useState<Set<number>>(new Set());
  const [pendingGrants, setPendingGrants] = useState<Set<string>>(new Set());
  const [pendingRevokes, setPendingRevokes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch available permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useGetPartnerPermissions();

  // Fetch cinema assignments for employee
  const { data: assignmentsData, isLoading: isLoadingAssignments } =
    useGetCinemaAssignments(employee.employeeId);

  // Get active cinema assignments
  const activeCinemas = useMemo(() => {
    return assignmentsData?.result?.filter((a) => a.isActive) || [];
  }, [assignmentsData]);

  // Fetch employee's current permissions for all selected cinemas
  const {
    data: employeePermissionsData,
    isLoading: isLoadingEmployeePermissions,
    refetch: refetchEmployeePermissions,
  } = useGetEmployeePermissions(
    employee.employeeId,
    selectedCinemaIds.size > 0 ? { cinemaIds: Array.from(selectedCinemaIds) } : undefined,
    { enabled: selectedCinemaIds.size > 0 }
  );

  // Mutations
  const grantMutation = useGrantEmployeePermissions();
  const revokeMutation = useRevokeEmployeePermissions();

  // Reset selected cinemas when modal opens with new employee
  useEffect(() => {
    if (open) {
      // Không tự động chọn rạp nào, để người dùng tự chọn
      setSelectedCinemaIds(new Set());
      setPendingGrants(new Set());
      setPendingRevokes(new Set());
    }
  }, [open, employee.employeeId]);

  // Reset pending changes when cinema selection changes
  useEffect(() => {
    setPendingGrants(new Set());
    setPendingRevokes(new Set());
  }, [selectedCinemaIds.size]);

  // Toggle cinema selection
  const toggleCinema = (cinemaId: number) => {
    setSelectedCinemaIds((prev) => {
      const next = new Set(prev);
      if (next.has(cinemaId)) {
        next.delete(cinemaId);
      } else {
        next.add(cinemaId);
      }
      return next;
    });
  };

  // Select all cinemas
  const selectAllCinemas = () => {
    setSelectedCinemaIds(new Set(activeCinemas.map((c) => c.cinemaId)));
  };

  // Deselect all cinemas
  const deselectAllCinemas = () => {
    setSelectedCinemaIds(new Set());
  };

  // Get permission status across selected cinemas
  // effectiveGranted: số quyền sau khi áp dụng pending changes (dùng để hiển thị UI)
  // granted: số quyền hiện tại từ server (dùng để tính pending)
  const getPermissionStatus = (permissionCode: string): { granted: number; effectiveGranted: number; pending: "grant" | "revoke" | null } => {
    // Count how many selected cinemas have this permission (from server data)
    let grantedCount = 0;
    
    if (employeePermissionsData?.result?.cinemaPermissions) {
      for (const cinemaPerms of employeePermissionsData.result.cinemaPermissions) {
        if (selectedCinemaIds.has(cinemaPerms.cinemaId)) {
          const hasPermission = cinemaPerms.permissions.some(
            (p) => p.permissionCode === permissionCode
          );
          if (hasPermission) grantedCount++;
        }
      }
    }

    // Check pending status
    let pending: "grant" | "revoke" | null = null;
    if (pendingGrants.has(permissionCode)) pending = "grant";
    if (pendingRevokes.has(permissionCode)) pending = "revoke";

    // Calculate effective granted count (after pending changes)
    let effectiveGranted = grantedCount;
    if (pending === "grant") {
      // Will grant to all selected cinemas that don't have it
      effectiveGranted = selectedCinemaIds.size;
    } else if (pending === "revoke") {
      // Will revoke from all selected cinemas
      effectiveGranted = 0;
    }

    return { granted: grantedCount, effectiveGranted, pending };
  };

  // Toggle permission for all selected cinemas
  const togglePermission = (permissionCode: string) => {
    const status = getPermissionStatus(permissionCode);
    const isFullyGranted = status.granted === selectedCinemaIds.size;

    if (isFullyGranted) {
      // All cinemas have this permission - toggle revoke
      if (pendingRevokes.has(permissionCode)) {
        setPendingRevokes((prev) => {
          const next = new Set(prev);
          next.delete(permissionCode);
          return next;
        });
      } else {
        setPendingRevokes((prev) => new Set(prev).add(permissionCode));
        setPendingGrants((prev) => {
          const next = new Set(prev);
          next.delete(permissionCode);
          return next;
        });
      }
    } else {
      // Not all cinemas have this permission - toggle grant
      if (pendingGrants.has(permissionCode)) {
        setPendingGrants((prev) => {
          const next = new Set(prev);
          next.delete(permissionCode);
          return next;
        });
      } else {
        setPendingGrants((prev) => new Set(prev).add(permissionCode));
        setPendingRevokes((prev) => {
          const next = new Set(prev);
          next.delete(permissionCode);
          return next;
        });
      }
    }
  };

  // Check if there are pending changes
  const hasPendingChanges = pendingGrants.size > 0 || pendingRevokes.size > 0;

  // Save changes
  const handleSave = async () => {
    if (selectedCinemaIds.size === 0 || !hasPendingChanges) return;

    setIsSaving(true);
    try {
      const cinemaIds = Array.from(selectedCinemaIds);

      // Process grants
      if (pendingGrants.size > 0) {
        await grantMutation.mutateAsync({
          employeeId: employee.employeeId,
          payload: {
            cinemaIds,
            permissionCodes: Array.from(pendingGrants),
          },
        });
      }

      // Process revokes
      if (pendingRevokes.size > 0) {
        await revokeMutation.mutateAsync({
          employeeId: employee.employeeId,
          payload: {
            cinemaIds,
            permissionCodes: Array.from(pendingRevokes),
          },
        });
      }

      showToast(
        "Cập nhật quyền thành công",
        `Đã cập nhật quyền cho ${cinemaIds.length} rạp`,
        "success"
      );
      setPendingGrants(new Set());
      setPendingRevokes(new Set());
      refetchEmployeePermissions();
    } catch (error: any) {
      showToast(
        "Cập nhật quyền thất bại",
        error?.message || "Vui lòng thử lại",
        "error"
      );
    } finally {
      setIsSaving(false);
    }
  };

  // Reset changes
  const handleReset = () => {
    setPendingGrants(new Set());
    setPendingRevokes(new Set());
  };

  // Select all permissions in a group (for all selected cinemas)
  const selectAllGroupPermissions = (permissionCodes: string[]) => {
    setPendingGrants((prev) => {
      const next = new Set(prev);
      for (const code of permissionCodes) {
        const status = getPermissionStatus(code);
        // Only add if not fully granted
        if (status.granted !== selectedCinemaIds.size) {
          next.add(code);
        }
      }
      return next;
    });
    setPendingRevokes((prev) => {
      const next = new Set(prev);
      for (const code of permissionCodes) {
        next.delete(code);
      }
      return next;
    });
  };

  // Deselect all permissions in a group (for all selected cinemas)
  const deselectAllGroupPermissions = (permissionCodes: string[]) => {
    setPendingRevokes((prev) => {
      const next = new Set(prev);
      for (const code of permissionCodes) {
        const status = getPermissionStatus(code);
        // Only add to revokes if at least one cinema has this permission
        if (status.granted > 0) {
          next.add(code);
        }
      }
      return next;
    });
    setPendingGrants((prev) => {
      const next = new Set(prev);
      for (const code of permissionCodes) {
        next.delete(code);
      }
      return next;
    });
  };

  // Select all permissions across all groups
  const selectAllPermissions = () => {
    const allCodes = permissionGroups.flatMap((g) =>
      g.permissions.map((p) => p.permissionCode)
    );
    selectAllGroupPermissions(allCodes);
  };

  // Deselect all permissions across all groups
  const deselectAllPermissions = () => {
    const allCodes = permissionGroups.flatMap((g) =>
      g.permissions.map((p) => p.permissionCode)
    );
    deselectAllGroupPermissions(allCodes);
  };

  // Get permission groups
  const permissionGroups = permissionsData?.result?.permissionGroups || [];

  // Calculate total granted permissions (tính cả pending changes)
  const totalPermissions = permissionGroups.reduce(
    (sum, g) => sum + g.permissions.length,
    0
  );
  const totalGranted = permissionGroups.reduce(
    (sum, g) =>
      sum +
      g.permissions.filter(
        (p) =>
          getPermissionStatus(p.permissionCode).effectiveGranted === selectedCinemaIds.size
      ).length,
    0
  );

  // Loading state
  const isLoading = isLoadingPermissions || isLoadingAssignments;

  return (
    <Dialog open={open} onOpenChange={onClose}>
      <DialogContent className="max-w-4xl max-h-[90vh] bg-zinc-900 border-zinc-700 text-zinc-100 p-0 overflow-hidden">
        <DialogHeader className="px-6 pt-6 pb-4 border-b border-zinc-800">
          <DialogTitle className="text-xl font-semibold flex items-center gap-3">
            <div className="w-10 h-10 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <div>Phân quyền cho {employee.fullName}</div>
              <div className="text-sm font-normal text-zinc-400">
                Chọn rạp và cấp quyền cho nhân viên
              </div>
            </div>
          </DialogTitle>
        </DialogHeader>

        {isLoading ? (
          <div className="p-6 space-y-4">
            <Skeleton className="h-10 w-full bg-zinc-800" />
            <Skeleton className="h-64 w-full bg-zinc-800" />
          </div>
        ) : activeCinemas.length === 0 ? (
          <div className="p-6 flex flex-col items-center justify-center py-12">
            <AlertCircle className="h-12 w-12 text-amber-400 mb-4" />
            <p className="text-zinc-400 text-center">
              Nhân viên chưa được phân quyền rạp nào.
              <br />
              Vui lòng phân rạp cho nhân viên trước khi cấp quyền.
            </p>
          </div>
        ) : (
          <div className="flex flex-col h-[calc(90vh-180px)]">
            {/* Cinema Selection */}
            <div className="px-6 pt-4 pb-2 border-b border-zinc-800">
              <div className="flex items-center justify-between mb-3">
                <div className="text-sm font-medium text-zinc-300 flex items-center gap-2">
                  <Building2 className="h-4 w-4 text-orange-400" />
                  Chọn rạp áp dụng ({selectedCinemaIds.size}/{activeCinemas.length})
                </div>
                <div className="flex gap-2">
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={selectAllCinemas}
                    className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
                    disabled={selectedCinemaIds.size === activeCinemas.length}
                  >
                    <CheckCheck className="h-3 w-3 mr-1" />
                    Chọn tất cả
                  </Button>
                  <Button
                    variant="ghost"
                    size="sm"
                    onClick={deselectAllCinemas}
                    className="h-7 text-xs text-zinc-400 hover:text-zinc-100"
                    disabled={selectedCinemaIds.size === 0}
                  >
                    <X className="h-3 w-3 mr-1" />
                    Bỏ chọn
                  </Button>
                </div>
              </div>
              <div className="flex flex-wrap gap-2 max-h-24 overflow-y-auto">
                {activeCinemas.map((cinema) => {
                  const isSelected = selectedCinemaIds.has(cinema.cinemaId);
                  return (
                    <div
                      key={cinema.cinemaId}
                      onClick={() => toggleCinema(cinema.cinemaId)}
                      className={cn(
                        "flex items-center gap-2 px-3 py-1.5 rounded-lg border text-sm transition-all cursor-pointer",
                        isSelected
                          ? "bg-orange-500/20 border-orange-500/50 text-orange-300"
                          : "bg-zinc-800 border-zinc-700 text-zinc-400 hover:border-zinc-600"
                      )}
                    >
                      <div
                        className={cn(
                          "h-3.5 w-3.5 rounded border flex items-center justify-center",
                          isSelected
                            ? "bg-orange-500 border-orange-500"
                            : "border-zinc-600 bg-transparent"
                        )}
                      >
                        {isSelected && <Check className="h-2.5 w-2.5 text-white" />}
                      </div>
                      {cinema.cinemaName}
                    </div>
                  );
                })}
              </div>
            </div>

            {/* Permissions List */}
            <div className="flex-1 flex flex-col overflow-hidden">
              {selectedCinemaIds.size === 0 ? (
                <div className="flex-1 flex flex-col items-center justify-center py-12">
                  <AlertCircle className="h-10 w-10 text-zinc-500 mb-3" />
                  <p className="text-zinc-500 text-center">
                    Vui lòng chọn ít nhất một rạp để quản lý quyền
                  </p>
                </div>
              ) : isLoadingEmployeePermissions ? (
                <div className="p-6 space-y-4">
                  {[1, 2, 3].map((i) => (
                    <Skeleton key={i} className="h-20 w-full bg-zinc-800" />
                  ))}
                </div>
              ) : (
                <>
                  {/* Quick Select All Header */}
                  <div className="px-6 py-3 border-b border-zinc-800 flex items-center justify-between bg-zinc-800/30">
                    <div className="text-sm text-zinc-300 flex items-center gap-2">
                      <Shield className="h-4 w-4 text-orange-400" />
                      <span>Tổng: {totalGranted}/{totalPermissions} quyền</span>
                    </div>
                    <div className="flex gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={selectAllPermissions}
                        className={cn(
                          "h-7 text-xs",
                          totalGranted === totalPermissions
                            ? "text-zinc-500 cursor-not-allowed"
                            : "text-emerald-400 hover:text-emerald-300 hover:bg-emerald-500/10"
                        )}
                        disabled={totalGranted === totalPermissions}
                      >
                        <CheckCheck className="h-3 w-3 mr-1" />
                        Chọn tất cả quyền
                      </Button>
                      <Button
                        variant="ghost"
                        size="sm"
                        onClick={deselectAllPermissions}
                        className={cn(
                          "h-7 text-xs",
                          totalGranted === 0
                            ? "text-zinc-500 cursor-not-allowed"
                            : "text-red-400 hover:text-red-300 hover:bg-red-500/10"
                        )}
                        disabled={totalGranted === 0}
                      >
                        <X className="h-3 w-3 mr-1" />
                        Bỏ tất cả quyền
                      </Button>
                    </div>
                  </div>
                  {/* Permission Groups */}
                  <div className="flex-1 px-6 py-4 overflow-y-auto space-y-2">
                    {permissionGroups.map((group) => (
                      <PermissionGroupCollapsible
                        key={group.resourceType}
                        group={group}
                        resourceIcons={resourceIcons}
                        getPermissionStatus={getPermissionStatus}
                        togglePermission={togglePermission}
                        selectAllGroupPermissions={selectAllGroupPermissions}
                        deselectAllGroupPermissions={deselectAllGroupPermissions}
                        selectedCinemaCount={selectedCinemaIds.size}
                      />
                    ))}
                  </div>
                </>
              )}
            </div>

            {/* Footer */}
            <div className="px-6 py-4 border-t border-zinc-800 flex items-center justify-between bg-zinc-900">
              <div className="text-sm text-zinc-400">
                {hasPendingChanges ? (
                  <span className="text-orange-400">
                    {pendingGrants.size > 0 && `+${pendingGrants.size} cấp`}
                    {pendingGrants.size > 0 && pendingRevokes.size > 0 && ", "}
                    {pendingRevokes.size > 0 && `-${pendingRevokes.size} thu hồi`}
                    {" "}cho {selectedCinemaIds.size} rạp
                  </span>
                ) : selectedCinemaIds.size > 0 ? (
                  "Chọn quyền để cập nhật"
                ) : (
                  "Chọn rạp để bắt đầu"
                )}
              </div>
              <div className="flex gap-2">
                {hasPendingChanges && (
                  <Button
                    variant="outline"
                    onClick={handleReset}
                    className="border-zinc-700 hover:bg-zinc-800"
                    disabled={isSaving}
                  >
                    Đặt lại
                  </Button>
                )}
                <Button
                  variant="outline"
                  onClick={onClose}
                  className="border-zinc-700 hover:bg-zinc-800"
                  disabled={isSaving}
                >
                  Đóng
                </Button>
                <Button
                  onClick={handleSave}
                  disabled={!hasPendingChanges || selectedCinemaIds.size === 0 || isSaving}
                  className="bg-orange-500 hover:bg-orange-600 text-white"
                >
                  {isSaving ? (
                    <>
                      <Loader2 className="h-4 w-4 mr-2 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Check className="h-4 w-4 mr-2" />
                      Lưu thay đổi
                    </>
                  )}
                </Button>
              </div>
            </div>
          </div>
        )}
      </DialogContent>
    </Dialog>
  );
}
