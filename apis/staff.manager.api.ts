import { BASE_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// ==================== Types ====================

export interface AssignedPartner {
  partnerId: number;
  partnerName: string;
  taxCode: string;
  address: string;
  status: string;
  assignedAt: string;
  assignedByUserId: number | null;
  assignedByEmail: string | null;
  assignedByName: string | null;
}

export interface ManagerGrantedPermission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  resourceType: string;
  actionType: string;
  description: string;
  partnerId: number;
  partnerName: string;
  grantedAt: string;
  grantedByUserId: number;
  grantedByEmail: string;
  grantedByName: string;
  isActive: boolean;
}

export interface ManagerStaffProfile {
  managerStaffId: number;
  fullName: string;
  email: string;
  phone: string | null;
  roleType: string;
  isActive: boolean;
  managerId: number;
  managerName: string;
  managerEmail: string;
  hireDate: string;
  assignedPartners: AssignedPartner[];
  grantedPermissions: ManagerGrantedPermission[];
}

export interface GetManagerStaffProfileResponse {
  message: string;
  result: ManagerStaffProfile;
}

export interface ManagerStaffApiError {
  message: string;
  errorInfo?: {
    name: string;
    message: string;
  };
}

// ==================== Service ====================

class ManagerStaffService {
  private baseURL = `${BASE_URL}/manager/staff`;

  /**
   * Lấy thông tin hồ sơ nhân viên hệ thống (Manager Staff)
   * GET /manager/staff/profile
   */
  async getManagerStaffProfile(accessToken: string): Promise<GetManagerStaffProfileResponse> {
    const response = await axios.get(`${this.baseURL}/profile`, {
      headers: {
        'Accept': 'application/json',
        'Authorization': `Bearer ${accessToken}`,
      },
    });
    return response.data;
  }
}

export const managerStaffService = new ManagerStaffService();

// ==================== React Query Hooks ====================

/**
 * Hook lấy thông tin hồ sơ nhân viên hệ thống
 */
export const useGetManagerStaffProfile = (accessToken?: string) => {
  return useQuery({
    queryKey: ['manager-staff-profile', accessToken],
    queryFn: () => managerStaffService.getManagerStaffProfile(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ==================== Utility Functions ====================

/**
 * Lấy danh sách unique permission codes
 */
export const getUniquePermissionCodes = (permissions: ManagerGrantedPermission[]): string[] => {
  const codes = new Set<string>();
  permissions.forEach(permission => {
    if (permission.isActive) {
      codes.add(permission.permissionCode);
    }
  });
  return Array.from(codes);
};

/**
 * Kiểm tra nhân viên có quyền cụ thể không
 */
export const hasPermission = (
  permissions: ManagerGrantedPermission[],
  permissionCode: string
): boolean => {
  return permissions.some(
    p => p.permissionCode === permissionCode && p.isActive
  );
};

/**
 * Kiểm tra nhân viên có bất kỳ quyền nào trong danh sách không
 */
export const hasAnyPermission = (
  permissions: ManagerGrantedPermission[],
  permissionCodes: string[]
): boolean => {
  return permissionCodes.some(code => hasPermission(permissions, code));
};

/**
 * Lấy danh sách partner mà nhân viên có quyền cụ thể
 */
export const getPartnersWithPermission = (
  permissions: ManagerGrantedPermission[],
  permissionCode: string
): number[] => {
  const partnerIds = new Set<number>();
  permissions
    .filter(p => p.permissionCode === permissionCode && p.isActive && p.partnerId !== 0)
    .forEach(p => partnerIds.add(p.partnerId));
  return Array.from(partnerIds);
};

/**
 * Kiểm tra có quyền global (partnerId = 0) không
 */
export const hasGlobalPermission = (
  permissions: ManagerGrantedPermission[],
  permissionCode: string
): boolean => {
  return permissions.some(
    p => p.permissionCode === permissionCode && p.partnerId === 0 && p.isActive
  );
};

/**
 * Nhóm permissions theo resource type
 */
export const groupPermissionsByResourceType = (
  permissions: ManagerGrantedPermission[]
): Map<string, ManagerGrantedPermission[]> => {
  const map = new Map<string, ManagerGrantedPermission[]>();
  permissions.forEach(p => {
    const existing = map.get(p.resourceType) || [];
    existing.push(p);
    map.set(p.resourceType, existing);
  });
  return map;
};

/**
 * Lấy màu cho loại resource
 */
export const getResourceTypeColor = (resourceType: string): string => {
  const colors: Record<string, string> = {
    'CONTRACT': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'PARTNER': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'VOUCHER': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
  };
  return colors[resourceType] || 'bg-gray-500/20 text-gray-400 border-gray-500/30';
};

/**
 * Lấy màu cho loại action
 */
export const getActionTypeColor = (actionType: string): string => {
  const colors: Record<string, string> = {
    'CREATE': 'bg-green-500/20 text-green-400',
    'READ': 'bg-blue-500/20 text-blue-400',
    'UPDATE': 'bg-yellow-500/20 text-yellow-400',
    'DELETE': 'bg-red-500/20 text-red-400',
    'APPROVE': 'bg-emerald-500/20 text-emerald-400',
    'REJECT': 'bg-rose-500/20 text-rose-400',
    'SEND': 'bg-indigo-500/20 text-indigo-400',
  };
  return colors[actionType] || 'bg-gray-500/20 text-gray-400';
};

/**
 * Lấy tên hiển thị cho loại resource
 */
export const getResourceTypeDisplayName = (resourceType: string): string => {
  const names: Record<string, string> = {
    'CONTRACT': 'Hợp đồng',
    'PARTNER': 'Đối tác',
    'VOUCHER': 'Voucher',
  };
  return names[resourceType] || resourceType;
};

/**
 * Lấy tên hiển thị cho loại action
 */
export const getActionTypeDisplayName = (actionType: string): string => {
  const names: Record<string, string> = {
    'CREATE': 'Tạo mới',
    'READ': 'Xem',
    'UPDATE': 'Cập nhật',
    'DELETE': 'Xóa',
    'APPROVE': 'Phê duyệt',
    'REJECT': 'Từ chối',
    'SEND': 'Gửi',
  };
  return names[actionType] || actionType;
};

/**
 * Kiểm tra có quyền truy cập module CONTRACT
 */
export const hasContractAccess = (permissions: ManagerGrantedPermission[]): boolean => {
  return permissions.some(p => p.resourceType === 'CONTRACT' && p.isActive);
};

/**
 * Kiểm tra có quyền truy cập module PARTNER
 */
export const hasPartnerAccess = (permissions: ManagerGrantedPermission[]): boolean => {
  return permissions.some(p => p.resourceType === 'PARTNER' && p.isActive);
};

/**
 * Kiểm tra có quyền truy cập module VOUCHER
 */
export const hasVoucherAccess = (permissions: ManagerGrantedPermission[]): boolean => {
  return permissions.some(p => p.resourceType === 'VOUCHER' && p.isActive);
};

/**
 * Lấy tất cả resource types có quyền
 */
export const getAccessibleResourceTypes = (permissions: ManagerGrantedPermission[]): string[] => {
  const resourceTypes = new Set<string>();
  permissions.forEach(p => {
    if (p.isActive) {
      resourceTypes.add(p.resourceType);
    }
  });
  return Array.from(resourceTypes);
};

/**
 * Kiểm tra có quyền CRUD đầy đủ trên resource type
 */
export const hasFullCRUDAccess = (
  permissions: ManagerGrantedPermission[],
  resourceType: string
): boolean => {
  const requiredActions = ['CREATE', 'READ', 'UPDATE', 'DELETE'];
  return requiredActions.every(action => {
    const permissionCode = `${resourceType}_${action}`;
    return hasPermission(permissions, permissionCode);
  });
};
