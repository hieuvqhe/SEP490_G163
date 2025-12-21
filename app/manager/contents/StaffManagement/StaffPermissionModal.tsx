"use client";

import { useState, useEffect, useMemo, useCallback } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import {
  X,
  Loader2,
  ShieldCheck,
  Building2,
  CheckCheck,
  Info,
  FileText,
  Users,
  AlertCircle,
  ChevronDown
} from 'lucide-react';
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

import { useGetStaffPermissions, useGrantPermissions, useRevokePermissions, useGetAvailablePermissions } from '@/apis/manager.decentralization.api';
import type { PartnerPermission, PermissionGroup } from '@/apis/manager.decentralization.api';
import { useToast } from '@/components/ToastProvider';
import { useAuthStore } from '@/store/authStore';
import { cn } from '@/lib/utils';

interface StaffPermissionModalProps {
  isOpen: boolean;
  onClose: () => void;
  staffId: number;
  staffName: string;
}

// Icon mapping for resource types
const resourceIcons: Record<string, React.ReactNode> = {
  CONTRACT: <FileText className="h-4 w-4" />,
  PARTNER: <Users className="h-4 w-4" />,
};

// Permission Group Collapsible Component
function PermissionGroupCollapsible({
  group,
  resourceIcons,
  getPermissionStatus,
  togglePermission,
  selectAllGroupPermissions,
  deselectAllGroupPermissions,
  selectedPartnerCount,
}: {
  group: PermissionGroup;
  resourceIcons: Record<string, React.ReactNode>;
  getPermissionStatus: (code: string) => { granted: number; effectiveGranted: number; pending: "grant" | "revoke" | null };
  togglePermission: (code: string) => void;
  selectAllGroupPermissions: (permissionCodes: string[]) => void;
  deselectAllGroupPermissions: (permissionCodes: string[]) => void;
  selectedPartnerCount: number;
}) {
  const [isOpen, setIsOpen] = useState(true);

  const grantedCount = group.permissions.filter(
    (p) => getPermissionStatus(p.permissionCode).effectiveGranted === selectedPartnerCount
  ).length;

  const allGroupCodes = group.permissions.map((p) => p.permissionCode);
  const isAllGranted = grantedCount === group.permissions.length;

  return (
    <div className="overflow-hidden rounded-lg border border-white/10 bg-white/5">
      <div className="flex items-center justify-between px-4 py-3 hover:bg-white/10">
        <button
          onClick={() => setIsOpen(!isOpen)}
          className="flex flex-1 items-center gap-3 text-left"
        >
          <div className="flex h-8 w-8 items-center justify-center rounded-lg bg-white/10 text-blue-400">
            {resourceIcons[group.resourceType] || <ShieldCheck className="h-4 w-4" />}
          </div>
          <div>
            <div className="font-medium text-white">{group.resourceName}</div>
            <div className="text-xs text-gray-400">
              {grantedCount} / {group.permissions.length} quyền (tất cả đối tác)
            </div>
          </div>
        </button>
        <div className="flex items-center gap-2">
          <button
            onClick={(e) => {
              e.stopPropagation();
              selectAllGroupPermissions(allGroupCodes);
            }}
            disabled={isAllGranted}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              isAllGranted
                ? "cursor-not-allowed text-gray-500"
                : "border border-emerald-500/30 bg-emerald-500/20 text-emerald-300 hover:bg-emerald-500/30"
            )}
          >
            <CheckCheck className="h-3 w-3" />
            Chọn hết
          </button>
          <button
            onClick={(e) => {
              e.stopPropagation();
              deselectAllGroupPermissions(allGroupCodes);
            }}
            disabled={grantedCount === 0}
            className={cn(
              "flex items-center gap-1 rounded-lg px-3 py-1.5 text-xs font-semibold transition",
              grantedCount === 0
                ? "cursor-not-allowed text-gray-500"
                : "border border-red-500/30 bg-red-500/20 text-red-300 hover:bg-red-500/30"
            )}
          >
            <X className="h-3 w-3" />
            Bỏ hết
          </button>
          <ChevronDown
            className={cn(
              "h-4 w-4 text-gray-400 transition-transform",
              isOpen && "rotate-180"
            )}
          />
        </div>
      </div>
      {isOpen && (
        <div className="space-y-2 px-4 pb-4 pt-2">
          {group.permissions.map((permission, index) => {
            const status = getPermissionStatus(permission.permissionCode);
            const isFullyGranted = status.effectiveGranted === selectedPartnerCount;
            const isPartiallyGranted = status.effectiveGranted > 0 && status.effectiveGranted < selectedPartnerCount;

            return (
              <div
                key={permission.permissionId}
                id={index === 0 ? "staff-permission-tour-permission-item" : undefined}
                className={cn(
                  "flex cursor-pointer items-center justify-between rounded-lg border p-3 transition-all",
                  isFullyGranted
                    ? "border-emerald-500/30 bg-emerald-500/10"
                    : isPartiallyGranted
                    ? "border-amber-500/30 bg-amber-500/10"
                    : "border-white/10 bg-white/5",
                  status.pending && "ring-2 ring-orange-500/50"
                )}
                onClick={() => togglePermission(permission.permissionCode)}
              >
                <div className="flex-1">
                  <div className="flex items-center gap-2">
                    <span className="font-medium text-white">{permission.permissionName}</span>
                    {status.pending && (
                      <span className="rounded-full border border-orange-500/30 bg-orange-500/20 px-2 py-0.5 text-xs font-semibold text-orange-300">
                        {status.pending === "grant" ? "Sẽ cấp" : "Sẽ thu hồi"}
                      </span>
                    )}
                  </div>
                  <p className="mt-1 text-xs text-gray-400">{permission.description}</p>
                  <div className="mt-2 flex items-center gap-2">
                    <span className="rounded border border-blue-500/30 bg-blue-500/20 px-2 py-0.5 text-xs text-blue-300">
                      {permission.actionType}
                    </span>
                    <span className="text-xs text-gray-500">
                      {permission.permissionCode}
                    </span>
                  </div>
                </div>
                <div className="ml-4 flex items-center gap-2">
                  {isFullyGranted ? (
                    <CheckCheck className="h-5 w-5 text-emerald-400" />
                  ) : isPartiallyGranted ? (
                    <div className="flex items-center gap-1">
                      <div className="h-5 w-5 rounded-full border-2 border-amber-400 bg-amber-500/20" />
                      <span className="text-xs text-amber-400">
                        {status.effectiveGranted}/{selectedPartnerCount}
                      </span>
                    </div>
                  ) : (
                    <div className="h-5 w-5 rounded-full border-2 border-white/20" />
                  )}
                </div>
              </div>
            );
          })}
        </div>
      )}
    </div>
  );
}

export default function StaffPermissionModal({
  isOpen,
  onClose,
  staffId,
  staffName,
}: StaffPermissionModalProps) {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const [selectedPartnerIds, setSelectedPartnerIds] = useState<Set<number>>(new Set());
  const [pendingGrants, setPendingGrants] = useState<Set<string>>(new Set());
  const [pendingRevokes, setPendingRevokes] = useState<Set<string>>(new Set());
  const [isSaving, setIsSaving] = useState(false);

  // Fetch available permissions
  const { data: permissionsData, isLoading: isLoadingPermissions } =
    useGetAvailablePermissions(accessToken ?? undefined);

  // Fetch staff's current permissions for all selected partners
  const {
    data: staffPermissionsData,
    isLoading: isLoadingStaffPermissions,
    refetch: refetchStaffPermissions,
  } = useGetStaffPermissions(
    staffId,
    selectedPartnerIds.size > 0 ? { partnerIds: Array.from(selectedPartnerIds) } : {},
    accessToken ?? undefined
  );

  // Mutations
  const grantMutation = useGrantPermissions();
  const revokeMutation = useRevokePermissions();

  const handleStartTour = useCallback(() => {
    const steps = [
      {
        element: "#staff-permission-tour-modal",
        popover: {
          title: "Phân quyền cho Staff Hệ thống",
          description: "Modal này cho phép bạn cấp hoặc thu hồi quyền quản lý Partner cho Staff hệ thống. Quyền được chia theo nhóm chức năng.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#staff-permission-tour-partner-selection",
        popover: {
          title: "Chọn đối tác áp dụng",
          description: "Chọn một hoặc nhiều đối tác để cấp quyền quản lý. Chỉ những đối tác mà Staff này đang quản lý mới hiển thị.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
    ];

    if (selectedPartnerIds.size > 0) {
      steps.push(
        {
          element: "#staff-permission-tour-quick-select",
          popover: {
            title: "Công cụ chọn nhanh",
            description: "Dùng 'Chọn tất cả quyền' để cấp toàn bộ quyền hoặc 'Bỏ tất cả quyền' để thu hồi. Tiết kiệm thời gian khi cấp quyền hàng loạt.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: "#staff-permission-tour-permission-groups",
          popover: {
            title: "Nhóm quyền",
            description: "Quyền được nhóm theo chức năng (Hợp đồng, Đối tác...). Mỗi nhóm có nút 'Chọn hết' và 'Bỏ hết' để quản lý nhanh.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: "#staff-permission-tour-permission-item",
          popover: {
            title: "Quyền cụ thể",
            description: "Mỗi quyền có mô tả chi tiết và loại hành động (VIEW, CREATE, UPDATE, DELETE). Click để chọn/bỏ chọn. Badge màu cam = đang chờ lưu.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: "#staff-permission-tour-pending-count",
          popover: {
            title: "Thay đổi chưa lưu",
            description: "Hiển thị số quyền sẽ cấp (+) và thu hồi (-). Thay đổi chỉ có hiệu lực sau khi nhấn 'Lưu thay đổi'.",
            side: "bottom" as const,
            align: "start" as const,
          },
        }
      );
    } else {
      steps.push({
        element: "#staff-permission-tour-partner-selection",
        popover: {
          title: "Hãy chọn đối tác trước",
          description: "Vui lòng chọn ít nhất một đối tác để xem và quản lý quyền. Sau khi chọn đối tác, bạn có thể chạy lại hướng dẫn để xem đầy đủ các bước.",
          side: "bottom" as const,
          align: "start" as const,
        },
      });
    }

    steps.push({
      element: "#staff-permission-tour-actions",
      popover: {
        title: "Lưu thay đổi",
        description: "Nhấn 'Lưu thay đổi' để áp dụng, 'Đặt lại' để hủy thay đổi chưa lưu, hoặc 'Đóng' để thoát.",
        side: "bottom" as const,
        align: "start" as const,
      },
    });

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [selectedPartnerIds.size]);

  // Reset when modal opens
  useEffect(() => {
    if (isOpen) {
      setSelectedPartnerIds(new Set());
      setPendingGrants(new Set());
      setPendingRevokes(new Set());
    }
  }, [isOpen, staffId]);

  // Reset pending changes when partner selection changes
  useEffect(() => {
    setPendingGrants(new Set());
    setPendingRevokes(new Set());
  }, [selectedPartnerIds.size]);

  // Get managed partners
  const managedPartners = staffPermissionsData?.result?.partnerPermissions || [];

  // Toggle partner selection
  const togglePartner = (partnerId: number) => {
    setSelectedPartnerIds((prev) => {
      const next = new Set(prev);
      if (next.has(partnerId)) {
        next.delete(partnerId);
      } else {
        next.add(partnerId);
      }
      return next;
    });
  };

  // Select all partners
  const selectAllPartners = () => {
    setSelectedPartnerIds(new Set(managedPartners.map((p) => p.partnerId)));
  };

  // Deselect all partners
  const deselectAllPartners = () => {
    setSelectedPartnerIds(new Set());
  };

  // Get permission status across selected partners
  const getPermissionStatus = (permissionCode: string): { granted: number; effectiveGranted: number; pending: "grant" | "revoke" | null } => {
    let grantedCount = 0;

    for (const partnerPerms of managedPartners) {
      if (selectedPartnerIds.has(partnerPerms.partnerId)) {
        const hasPermission = partnerPerms.permissions.some(
          (p) => p.permissionCode === permissionCode
        );
        if (hasPermission) grantedCount++;
      }
    }

    let pending: "grant" | "revoke" | null = null;
    if (pendingGrants.has(permissionCode)) pending = "grant";
    if (pendingRevokes.has(permissionCode)) pending = "revoke";

    let effectiveGranted = grantedCount;
    if (pending === "grant") {
      effectiveGranted = selectedPartnerIds.size;
    } else if (pending === "revoke") {
      effectiveGranted = 0;
    }

    return { granted: grantedCount, effectiveGranted, pending };
  };

  // Toggle permission for all selected partners
  const togglePermission = (permissionCode: string) => {
    const status = getPermissionStatus(permissionCode);
    const isFullyGranted = status.granted === selectedPartnerIds.size;

    if (isFullyGranted) {
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

  const hasPendingChanges = pendingGrants.size > 0 || pendingRevokes.size > 0;

  // Save changes
  const handleSave = async () => {
    if (selectedPartnerIds.size === 0 || !hasPendingChanges) return;

    setIsSaving(true);
    try {
      const partnerIds = Array.from(selectedPartnerIds);

      if (pendingGrants.size > 0) {
        await grantMutation.mutateAsync({
          staffId,
          data: {
            partnerIds,
            permissionCodes: Array.from(pendingGrants),
          },
          accessToken: accessToken!,
        });
      }

      if (pendingRevokes.size > 0) {
        await revokeMutation.mutateAsync({
          staffId,
          data: {
            partnerIds,
            permissionCodes: Array.from(pendingRevokes),
          },
          accessToken: accessToken!,
        });
      }

      showToast(
        "Cập nhật quyền thành công",
        `Đã cập nhật quyền cho ${partnerIds.length} đối tác`,
        "success"
      );
      setPendingGrants(new Set());
      setPendingRevokes(new Set());
      refetchStaffPermissions();
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

  // Select all permissions in a group
  const selectAllGroupPermissions = (permissionCodes: string[]) => {
    setPendingGrants((prev) => {
      const next = new Set(prev);
      for (const code of permissionCodes) {
        const status = getPermissionStatus(code);
        if (status.granted !== selectedPartnerIds.size) {
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

  // Deselect all permissions in a group
  const deselectAllGroupPermissions = (permissionCodes: string[]) => {
    setPendingRevokes((prev) => {
      const next = new Set(prev);
      for (const code of permissionCodes) {
        const status = getPermissionStatus(code);
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

  // Select all permissions
  const selectAllPermissions = () => {
    const allCodes = permissionGroups.flatMap((g) =>
      g.permissions.map((p) => p.permissionCode)
    );
    selectAllGroupPermissions(allCodes);
  };

  // Deselect all permissions
  const deselectAllPermissions = () => {
    const allCodes = permissionGroups.flatMap((g) =>
      g.permissions.map((p) => p.permissionCode)
    );
    deselectAllGroupPermissions(allCodes);
  };

  // Filter out VOUCHER permissions (managed centrally, not by multiple staff)
  const permissionGroups = (permissionsData?.result?.permissionGroups || [])
    .filter((group) => group.resourceType !== "VOUCHER");

  const totalPermissions = permissionGroups.reduce(
    (sum, g) => sum + g.permissions.length,
    0
  );
  const totalGranted = permissionGroups.reduce(
    (sum, g) =>
      sum +
      g.permissions.filter(
        (p) =>
          getPermissionStatus(p.permissionCode).effectiveGranted === selectedPartnerIds.size
      ).length,
    0
  );

  const isLoading = isLoadingPermissions || isLoadingStaffPermissions;

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={onClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            id="staff-permission-tour-modal"
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 flex max-h-[90vh] w-full max-w-5xl -translate-x-1/2 -translate-y-1/2 flex-col overflow-hidden rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 to-gray-800/95 shadow-2xl backdrop-blur-xl"
          >
            {/* Header */}
            <div className="flex items-center justify-between border-b border-white/10 px-6 py-4">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <ShieldCheck size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Phân quyền cho Staff Hệ thống
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Nhân viên: <span className="font-medium text-white">{staffName}</span>
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-2">
                <button
                  onClick={handleStartTour}
                  className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white transition hover:bg-white/10"
                >
                  <Info size={16} />
                  Hướng dẫn
                </button>
                <button
                  onClick={onClose}
                  className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white"
                >
                  <X size={20} />
                </button>
              </div>
            </div>

            {isLoading ? (
              <div className="flex items-center justify-center p-12">
                <div className="flex flex-col items-center gap-3">
                  <Loader2 className="h-12 w-12 animate-spin text-blue-400" />
                  <p className="text-sm text-gray-400">Đang tải dữ liệu...</p>
                </div>
              </div>
            ) : managedPartners.length === 0 ? (
              <div className="flex flex-col items-center justify-center py-12">
                <AlertCircle className="h-12 w-12 text-amber-400 mb-4" />
                <p className="text-center text-gray-400">
                  Staff này chưa được phân quản lý đối tác nào.
                  <br />
                  Vui lòng phân đối tác cho Staff trước khi cấp quyền.
                </p>
              </div>
            ) : (
              <div className="flex flex-1 flex-col overflow-hidden">
                {/* Partner Selection */}
                <div id="staff-permission-tour-partner-selection" className="border-b border-white/10 px-6 py-4">
                  <div className="mb-3 flex items-center justify-between">
                    <h4 className="font-semibold text-white">
                      Chọn đối tác ({selectedPartnerIds.size} / {managedPartners.length})
                    </h4>
                    <div className="flex gap-2">
                      <button
                        onClick={selectAllPartners}
                        disabled={selectedPartnerIds.size === managedPartners.length}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                          selectedPartnerIds.size === managedPartners.length
                            ? "cursor-not-allowed border-white/10 bg-white/5 text-gray-500"
                            : "border-blue-500/30 bg-blue-500/20 text-blue-300 hover:bg-blue-500/30"
                        )}
                      >
                        Chọn tất cả
                      </button>
                      <button
                        onClick={deselectAllPartners}
                        disabled={selectedPartnerIds.size === 0}
                        className={cn(
                          "rounded-lg border px-3 py-1.5 text-xs font-semibold transition",
                          selectedPartnerIds.size === 0
                            ? "cursor-not-allowed border-white/10 bg-white/5 text-gray-500"
                            : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                        )}
                      >
                        Bỏ chọn
                      </button>
                    </div>
                  </div>
                  <div className="max-h-[200px] overflow-y-auto rounded-lg border border-white/10 bg-white/5 p-2">
                    <div className="grid grid-cols-1 gap-2 md:grid-cols-2 lg:grid-cols-3">
                      {managedPartners.map((partner) => (
                        <button
                          key={partner.partnerId}
                          onClick={() => togglePartner(partner.partnerId)}
                          className={cn(
                            "flex items-center gap-2 rounded-lg border px-3 py-2.5 text-sm transition",
                            selectedPartnerIds.has(partner.partnerId)
                              ? "border-blue-500/50 bg-blue-500/20 text-blue-200"
                              : "border-white/10 bg-white/5 text-gray-300 hover:bg-white/10"
                          )}
                        >
                          <Building2 size={16} className="flex-shrink-0" />
                          <div className="flex-1 text-left min-w-0">
                            <div className="font-medium truncate">{partner.partnerName}</div>
                            <div className="text-xs text-gray-400">
                              {partner.permissions.length} quyền
                            </div>
                          </div>
                          {selectedPartnerIds.has(partner.partnerId) && (
                            <CheckCheck size={16} className="flex-shrink-0 text-blue-400" />
                          )}
                        </button>
                      ))}
                    </div>
                  </div>
                  {selectedPartnerIds.size > 0 && (
                    <div className="mt-3 flex flex-wrap gap-2">
                      <span className="text-xs text-gray-400">Đã chọn:</span>
                      {managedPartners
                        .filter((p) => selectedPartnerIds.has(p.partnerId))
                        .map((partner) => (
                          <span
                            key={partner.partnerId}
                            className="inline-flex items-center gap-1 rounded-full border border-blue-500/30 bg-blue-500/20 px-2 py-1 text-xs text-blue-300"
                          >
                            {partner.partnerName}
                            <button
                              onClick={() => togglePartner(partner.partnerId)}
                              className="ml-1 hover:text-blue-100"
                            >
                              <X size={12} />
                            </button>
                          </span>
                        ))}
                    </div>
                  )}
                </div>

                {/* Permissions List */}
                <div className="flex flex-1 flex-col overflow-hidden">
                  {selectedPartnerIds.size === 0 ? (
                    <div className="flex flex-1 items-center justify-center p-12">
                      <p className="text-gray-400">
                        Vui lòng chọn ít nhất một đối tác để xem quyền
                      </p>
                    </div>
                  ) : (
                    <>
                      <div id="staff-permission-tour-quick-select" className="flex items-center justify-between border-b border-white/10 px-6 py-3">
                        <div className="text-sm text-gray-400">
                          <span className="font-semibold text-white">{totalGranted}</span> / {totalPermissions} quyền được cấp
                        </div>
                        <div className="flex gap-2">
                          <button
                            onClick={selectAllPermissions}
                            className="flex items-center gap-2 rounded-lg border border-emerald-500/30 bg-emerald-500/20 px-3 py-1.5 text-xs font-semibold text-emerald-300 transition hover:bg-emerald-500/30"
                          >
                            <CheckCheck size={14} />
                            Chọn tất cả quyền
                          </button>
                          <button
                            onClick={deselectAllPermissions}
                            className="flex items-center gap-2 rounded-lg border border-red-500/30 bg-red-500/20 px-3 py-1.5 text-xs font-semibold text-red-300 transition hover:bg-red-500/30"
                          >
                            <X size={14} />
                            Bỏ tất cả quyền
                          </button>
                        </div>
                      </div>

                      <div id="staff-permission-tour-permission-groups" className="flex-1 space-y-3 overflow-y-auto p-6">
                        {permissionGroups.map((group) => (
                          <PermissionGroupCollapsible
                            key={group.resourceType}
                            group={group}
                            resourceIcons={resourceIcons}
                            getPermissionStatus={getPermissionStatus}
                            togglePermission={togglePermission}
                            selectAllGroupPermissions={selectAllGroupPermissions}
                            deselectAllGroupPermissions={deselectAllGroupPermissions}
                            selectedPartnerCount={selectedPartnerIds.size}
                          />
                        ))}
                      </div>
                    </>
                  )}
                </div>

                {/* Footer */}
                <div id="staff-permission-tour-actions" className="flex items-center justify-between border-t border-white/10 bg-gray-900/50 px-6 py-4">
                  <div id="staff-permission-tour-pending-count" className="flex items-center gap-4 text-sm">
                    {pendingGrants.size > 0 && (
                      <span className="text-emerald-400">
                        +{pendingGrants.size} quyền sẽ cấp
                      </span>
                    )}
                    {pendingRevokes.size > 0 && (
                      <span className="text-red-400">
                        -{pendingRevokes.size} quyền sẽ thu hồi
                      </span>
                    )}
                    {!hasPendingChanges && (
                      <span className="text-gray-400">Không có thay đổi</span>
                    )}
                  </div>
                  <div className="flex gap-3">
                    <button
                      onClick={handleReset}
                      disabled={!hasPendingChanges || isSaving}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Đặt lại
                    </button>
                    <button
                      onClick={onClose}
                      disabled={isSaving}
                      className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Đóng
                    </button>
                    <button
                      onClick={handleSave}
                      disabled={!hasPendingChanges || isSaving || selectedPartnerIds.size === 0}
                      className="flex items-center gap-2 rounded-lg bg-blue-500 px-4 py-2 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      {isSaving ? (
                        <>
                          <Loader2 size={16} className="animate-spin" />
                          Đang lưu...
                        </>
                      ) : (
                        "Lưu thay đổi"
                      )}
                    </button>
                  </div>
                </div>
              </div>
            )}
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
}
