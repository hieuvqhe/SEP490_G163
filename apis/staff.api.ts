import { BASE_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

// ==================== Types ====================

export interface AssignedCinema {
  cinemaId: number;
  cinemaName: string;
  address: string;
  city: string;
  district: string;
  assignedAt: string;
  assignedByUserId: number;
  assignedByEmail: string;
  assignedByName: string;
}

export interface GrantedPermission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  resourceType: string;
  actionType: string;
  description: string;
  cinemaId: number;
  cinemaName: string;
  grantedAt: string;
  grantedByUserId: number;
  grantedByEmail: string;
  grantedByName: string;
  isActive: boolean;
}

export interface StaffProfile {
  employeeId: number;
  fullName: string;
  email: string;
  phone: string | null;
  roleType: string;
  isActive: boolean;
  partnerId: number;
  partnerName: string;
  assignedCinemas: AssignedCinema[];
  grantedPermissions: GrantedPermission[];
}

export interface GetStaffProfileResponse {
  message: string;
  result: StaffProfile;
}

export interface StaffApiError {
  message: string;
  errorInfo?: {
    name: string;
    message: string;
  };
}

// ==================== Service ====================

class StaffService {
  private baseURL = `${BASE_URL}/api/partners/staff`;

  /**
   * Lấy thông tin hồ sơ nhân viên
   * GET /partners/staff/profile
   */
  async getStaffProfile(accessToken: string): Promise<GetStaffProfileResponse> {
    try {
      const response = await fetch(`${this.baseURL}/profile`, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as StaffApiError;
      }

      return result;
    } catch (error: any) {
      if (error.name === 'TypeError') {
        throw { message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' } as StaffApiError;
      }
      throw error;
    }
  }
}

export const staffService = new StaffService();

// ==================== React Query Hooks ====================

/**
 * Hook lấy thông tin hồ sơ nhân viên
 */
export const useGetStaffProfile = (accessToken?: string) => {
  return useQuery({
    queryKey: ['staff-profile'],
    queryFn: () => staffService.getStaffProfile(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ==================== Utility Functions ====================

/**
 * Lấy danh sách quyền theo rạp
 */
export const getPermissionsByCinema = (permissions: GrantedPermission[]): Map<number, GrantedPermission[]> => {
  const permissionMap = new Map<number, GrantedPermission[]>();
  
  permissions.forEach(permission => {
    const existing = permissionMap.get(permission.cinemaId) || [];
    existing.push(permission);
    permissionMap.set(permission.cinemaId, existing);
  });
  
  return permissionMap;
};

/**
 * Lấy danh sách quyền theo loại resource
 */
export const getPermissionsByResourceType = (permissions: GrantedPermission[]): Map<string, GrantedPermission[]> => {
  const permissionMap = new Map<string, GrantedPermission[]>();
  
  permissions.forEach(permission => {
    const existing = permissionMap.get(permission.resourceType) || [];
    existing.push(permission);
    permissionMap.set(permission.resourceType, existing);
  });
  
  return permissionMap;
};

/**
 * Kiểm tra nhân viên có quyền cụ thể trên rạp không
 */
export const hasPermission = (
  permissions: GrantedPermission[],
  permissionCode: string,
  cinemaId: number
): boolean => {
  return permissions.some(
    p => p.permissionCode === permissionCode && 
         p.cinemaId === cinemaId && 
         p.isActive
  );
};

/**
 * Kiểm tra nhân viên có quyền trên bất kỳ rạp nào không
 */
export const hasAnyPermission = (
  permissions: GrantedPermission[],
  permissionCode: string
): boolean => {
  return permissions.some(
    p => p.permissionCode === permissionCode && p.isActive
  );
};

/**
 * Lấy danh sách rạp mà nhân viên có quyền cụ thể
 */
export const getCinemasWithPermission = (
  permissions: GrantedPermission[],
  permissionCode: string
): number[] => {
  return permissions
    .filter(p => p.permissionCode === permissionCode && p.isActive)
    .map(p => p.cinemaId);
};

/**
 * Lấy màu cho loại resource
 */
export const getResourceTypeColor = (resourceType: string): string => {
  const colors: Record<string, string> = {
    'CINEMA': 'bg-blue-500/20 text-blue-400 border-blue-500/30',
    'SCREEN': 'bg-purple-500/20 text-purple-400 border-purple-500/30',
    'SEAT_TYPE': 'bg-orange-500/20 text-orange-400 border-orange-500/30',
    'SEAT_LAYOUT': 'bg-green-500/20 text-green-400 border-green-500/30',
    'SHOWTIME': 'bg-pink-500/20 text-pink-400 border-pink-500/30',
    'SERVICE': 'bg-cyan-500/20 text-cyan-400 border-cyan-500/30',
    'BOOKING': 'bg-amber-500/20 text-amber-400 border-amber-500/30',
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
    'BULK_CREATE': 'bg-emerald-500/20 text-emerald-400',
    'BULK_DELETE': 'bg-rose-500/20 text-rose-400',
    'STATISTICS': 'bg-indigo-500/20 text-indigo-400',
  };
  return colors[actionType] || 'bg-gray-500/20 text-gray-400';
};

/**
 * Lấy tên hiển thị cho loại resource
 */
export const getResourceTypeDisplayName = (resourceType: string): string => {
  const names: Record<string, string> = {
    'CINEMA': 'Rạp chiếu',
    'SCREEN': 'Phòng chiếu',
    'SEAT_TYPE': 'Loại ghế',
    'SEAT_LAYOUT': 'Sơ đồ ghế',
    'SHOWTIME': 'Suất chiếu',
    'SERVICE': 'Dịch vụ/Combo',
    'BOOKING': 'Đơn đặt vé',
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
    'BULK_CREATE': 'Tạo hàng loạt',
    'BULK_DELETE': 'Xóa hàng loạt',
    'STATISTICS': 'Thống kê',
  };
  return names[actionType] || actionType;
};
