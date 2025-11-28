"use client";

import React, { createContext, useContext, useMemo } from "react";
import { useAuthStore } from "@/store/authStore";
import { useGetStaffProfile, GrantedPermission } from "@/apis/staff.api";

// ==================== Permission Codes ====================

export const PERMISSION_CODES = {
  // Cinema
  CINEMA_CREATE: "CINEMA_CREATE",
  CINEMA_READ: "CINEMA_READ",
  CINEMA_UPDATE: "CINEMA_UPDATE",
  CINEMA_DELETE: "CINEMA_DELETE",

  // Screen
  SCREEN_CREATE: "SCREEN_CREATE",
  SCREEN_READ: "SCREEN_READ",
  SCREEN_UPDATE: "SCREEN_UPDATE",
  SCREEN_DELETE: "SCREEN_DELETE",

  // Seat Type
  SEAT_TYPE_CREATE: "SEAT_TYPE_CREATE",
  SEAT_TYPE_READ: "SEAT_TYPE_READ",
  SEAT_TYPE_UPDATE: "SEAT_TYPE_UPDATE",
  SEAT_TYPE_DELETE: "SEAT_TYPE_DELETE",

  // Seat Layout
  SEAT_LAYOUT_CREATE: "SEAT_LAYOUT_CREATE",
  SEAT_LAYOUT_READ: "SEAT_LAYOUT_READ",
  SEAT_LAYOUT_UPDATE: "SEAT_LAYOUT_UPDATE",
  SEAT_LAYOUT_DELETE: "SEAT_LAYOUT_DELETE",
  SEAT_LAYOUT_BULK_CREATE: "SEAT_LAYOUT_BULK_CREATE",
  SEAT_LAYOUT_BULK_DELETE: "SEAT_LAYOUT_BULK_DELETE",

  // Showtime
  SHOWTIME_CREATE: "SHOWTIME_CREATE",
  SHOWTIME_READ: "SHOWTIME_READ",
  SHOWTIME_UPDATE: "SHOWTIME_UPDATE",
  SHOWTIME_DELETE: "SHOWTIME_DELETE",

  // Service/Combo
  SERVICE_CREATE: "SERVICE_CREATE",
  SERVICE_READ: "SERVICE_READ",
  SERVICE_UPDATE: "SERVICE_UPDATE",
  SERVICE_DELETE: "SERVICE_DELETE",

  // Booking
  BOOKING_CREATE: "BOOKING_CREATE",
  BOOKING_READ: "BOOKING_READ",
  BOOKING_UPDATE: "BOOKING_UPDATE",
  BOOKING_DELETE: "BOOKING_DELETE",
  BOOKING_STATISTICS: "BOOKING_STATISTICS",
} as const;

export type PermissionCode = (typeof PERMISSION_CODES)[keyof typeof PERMISSION_CODES];

// ==================== Context Types ====================

interface PermissionContextValue {
  // User role
  isPartner: boolean;
  isStaff: boolean;
  
  // Loading state
  isLoading: boolean;
  
  // All permissions (for Staff)
  permissions: GrantedPermission[];
  
  // Check functions
  /**
   * Kiểm tra có quyền cụ thể (trên bất kỳ rạp nào)
   */
  hasPermission: (permissionCode: string) => boolean;
  
  /**
   * Kiểm tra có quyền cụ thể trên rạp cụ thể
   */
  hasPermissionForCinema: (permissionCode: string, cinemaId: number) => boolean;
  
  /**
   * Kiểm tra có bất kỳ quyền nào trong danh sách
   */
  hasAnyPermission: (...permissionCodes: string[]) => boolean;
  
  /**
   * Kiểm tra có tất cả quyền trong danh sách
   */
  hasAllPermissions: (...permissionCodes: string[]) => boolean;
  
  /**
   * Lấy danh sách cinemaIds mà user có quyền cụ thể
   */
  getCinemasWithPermission: (permissionCode: string) => number[];
  
  /**
   * Check nếu là Partner hoặc Staff có quyền
   * Partner luôn có full quyền
   */
  canPerform: (permissionCode: string, cinemaId?: number) => boolean;
}

const PermissionContext = createContext<PermissionContextValue | undefined>(undefined);

// ==================== Provider ====================

interface PermissionProviderProps {
  children: React.ReactNode;
}

export function PermissionProvider({ children }: PermissionProviderProps) {
  const { user, accessToken } = useAuthStore();
  
  const normalizedRole = user?.role?.toLowerCase();
  const isPartner = normalizedRole === "partner";
  const isStaff = normalizedRole === "staff";
  
  // Chỉ fetch staff profile khi là Staff
  const { data: staffProfileData, isLoading: isLoadingStaffProfile } = useGetStaffProfile(
    isStaff && accessToken ? accessToken : undefined
  );
  
  const permissions = useMemo(() => {
    return staffProfileData?.result?.grantedPermissions ?? [];
  }, [staffProfileData]);
  
  // ==================== Helper Functions ====================
  
  const hasPermission = (permissionCode: string): boolean => {
    // Partner có full quyền
    if (isPartner) return true;
    
    // Staff check theo permissions
    return permissions.some(
      p => p.permissionCode === permissionCode && p.isActive
    );
  };
  
  const hasPermissionForCinema = (permissionCode: string, cinemaId: number): boolean => {
    // Partner có full quyền
    if (isPartner) return true;
    
    // Staff check theo permissions và cinemaId
    return permissions.some(
      p => p.permissionCode === permissionCode && 
           p.cinemaId === cinemaId && 
           p.isActive
    );
  };
  
  const hasAnyPermission = (...permissionCodes: string[]): boolean => {
    // Partner có full quyền
    if (isPartner) return true;
    
    return permissionCodes.some(code => hasPermission(code));
  };
  
  const hasAllPermissions = (...permissionCodes: string[]): boolean => {
    // Partner có full quyền
    if (isPartner) return true;
    
    return permissionCodes.every(code => hasPermission(code));
  };
  
  const getCinemasWithPermission = (permissionCode: string): number[] => {
    const cinemaIds = new Set<number>();
    permissions
      .filter(p => p.permissionCode === permissionCode && p.isActive)
      .forEach(p => cinemaIds.add(p.cinemaId));
    return Array.from(cinemaIds);
  };
  
  const canPerform = (permissionCode: string, cinemaId?: number): boolean => {
    // Partner có full quyền
    if (isPartner) return true;
    
    // Staff check theo permissions
    if (cinemaId !== undefined) {
      return hasPermissionForCinema(permissionCode, cinemaId);
    }
    return hasPermission(permissionCode);
  };
  
  // ==================== Context Value ====================
  
  const value: PermissionContextValue = {
    isPartner,
    isStaff,
    isLoading: isStaff && isLoadingStaffProfile,
    permissions,
    hasPermission,
    hasPermissionForCinema,
    hasAnyPermission,
    hasAllPermissions,
    getCinemasWithPermission,
    canPerform,
  };
  
  return (
    <PermissionContext.Provider value={value}>
      {children}
    </PermissionContext.Provider>
  );
}

// ==================== Hook ====================

export function usePermission() {
  const context = useContext(PermissionContext);
  if (context === undefined) {
    throw new Error("usePermission must be used within a PermissionProvider");
  }
  return context;
}

// ==================== Utility Components ====================

interface PermissionGateProps {
  children: React.ReactNode;
  /**
   * Permission code cần kiểm tra
   */
  permission?: string;
  /**
   * Danh sách permissions, cần ít nhất 1
   */
  anyPermission?: string[];
  /**
   * Danh sách permissions, cần tất cả
   */
  allPermissions?: string[];
  /**
   * Cinema ID để kiểm tra permission cụ thể cho rạp
   */
  cinemaId?: number;
  /**
   * Fallback component khi không có quyền
   */
  fallback?: React.ReactNode;
}

/**
 * Component để ẩn/hiện UI dựa trên permission
 * 
 * @example
 * // Chỉ hiển thị nếu có quyền SCREEN_CREATE
 * <PermissionGate permission="SCREEN_CREATE">
 *   <Button>Tạo phòng chiếu</Button>
 * </PermissionGate>
 * 
 * @example
 * // Hiển thị nếu có bất kỳ quyền nào
 * <PermissionGate anyPermission={["SCREEN_UPDATE", "SCREEN_DELETE"]}>
 *   <ActionMenu />
 * </PermissionGate>
 * 
 * @example
 * // Kiểm tra quyền trên rạp cụ thể
 * <PermissionGate permission="SCREEN_CREATE" cinemaId={8}>
 *   <Button>Tạo phòng chiếu cho rạp này</Button>
 * </PermissionGate>
 */
export function PermissionGate({
  children,
  permission,
  anyPermission,
  allPermissions,
  cinemaId,
  fallback = null,
}: PermissionGateProps) {
  const { canPerform, hasAnyPermission: checkAny, hasAllPermissions: checkAll, isPartner } = usePermission();
  
  // Partner luôn có quyền
  if (isPartner) {
    return <>{children}</>;
  }
  
  // Check single permission
  if (permission) {
    if (!canPerform(permission, cinemaId)) {
      return <>{fallback}</>;
    }
  }
  
  // Check any permission
  if (anyPermission && anyPermission.length > 0) {
    if (!checkAny(...anyPermission)) {
      return <>{fallback}</>;
    }
  }
  
  // Check all permissions
  if (allPermissions && allPermissions.length > 0) {
    if (!checkAll(...allPermissions)) {
      return <>{fallback}</>;
    }
  }
  
  return <>{children}</>;
}

// ==================== HOC ====================

/**
 * HOC để wrap component với permission check
 * 
 * @example
 * const ProtectedButton = withPermission(Button, "SCREEN_CREATE");
 */
export function withPermission<P extends object>(
  Component: React.ComponentType<P>,
  permissionCode: string
) {
  return function ProtectedComponent(props: P & { cinemaId?: number }) {
    const { canPerform } = usePermission();
    const { cinemaId, ...restProps } = props;
    
    if (!canPerform(permissionCode, cinemaId)) {
      return null;
    }
    
    return <Component {...(restProps as P)} />;
  };
}
