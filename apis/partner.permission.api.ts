import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== Types ====================

export type ActionType = 
  | "CREATE" 
  | "READ" 
  | "UPDATE" 
  | "DELETE" 
  | "BULK_CREATE" 
  | "BULK_DELETE";

export type ResourceType = 
  | "BOOKING" 
  | "CINEMA" 
  | "SCREEN" 
  | "SEAT_LAYOUT" 
  | "SEAT_TYPE" 
  | "SERVICE" 
  | "SHOWTIME";

export interface Permission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  resourceType: ResourceType;
  actionType: ActionType;
  description: string;
  isActive: boolean;
}

export interface PermissionGroup {
  resourceType: ResourceType;
  resourceName: string;
  permissions: Permission[];
}

export interface GetPermissionsResponse {
  message: string;
  result: {
    permissionGroups: PermissionGroup[];
  };
}

// ==================== Employee Permission Types ====================

export interface GrantEmployeePermissionsRequest {
  cinemaIds: number[];
  permissionCodes: string[];
}

export interface GrantEmployeePermissionsResponse {
  message: string;
  result: {
    success: boolean;
    message: string;
    affectedCount: number;
  };
}

export interface RevokeEmployeePermissionsRequest {
  cinemaIds: number[];
  permissionCodes: string[];
}

export interface RevokeEmployeePermissionsResponse {
  message: string;
  result: {
    success: boolean;
    message: string;
    affectedCount: number;
  };
}

// ==================== Employee Permission Detail Types ====================

export interface EmployeePermissionDetail {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  resourceType: ResourceType;
  actionType: ActionType;
  description: string;
  grantedAt: string;
  grantedByUserId: number;
  grantedByName: string;
  grantedByEmail: string;
  isActive: boolean;
  isGlobalPermission: boolean;
}

export interface CinemaPermission {
  cinemaId: number;
  cinemaName: string;
  address: string;
  city: string;
  district: string;
  permissions: EmployeePermissionDetail[];
}

export interface GetEmployeePermissionsParams {
  cinemaIds?: number[];
}

export interface GetEmployeePermissionsResponse {
  message: string;
  result: {
    employeeId: number;
    employeeName: string;
    cinemaPermissions: CinemaPermission[];
  };
}

// ==================== Error Handling ====================

export class PartnerPermissionApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerPermissionApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerPermissionRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
};

const handlePartnerPermissionError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi thao tác với quyền."
): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      typeof data?.message === "string" && data.message.trim() !== ""
        ? (data.message as string)
        : status === 401 || status === 403
          ? "Xác thực thất bại"
          : fallbackMessage;
    const errors = data?.errors && typeof data.errors === "object"
      ? (data.errors as Record<string, unknown>)
      : undefined;

    throw new PartnerPermissionApiError(message, status, errors);
  }

  throw new PartnerPermissionApiError(
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  );
};

// ==================== Service ====================

class PartnerPermissionService {
  private readonly basePath = "/partners/permissions";

  /**
   * Lấy danh sách tất cả quyền có sẵn (grouped by resource type)
   */
  async getPermissions(): Promise<GetPermissionsResponse> {
    try {
      const client = createPartnerPermissionRequest();
      const response = await client.get<GetPermissionsResponse>(this.basePath);
      return response.data;
    } catch (error) {
      throw handlePartnerPermissionError(error, "Đã xảy ra lỗi hệ thống khi lấy danh sách quyền.");
    }
  }

  /**
   * Lấy danh sách quyền phẳng (flat list) - tiện cho việc tìm kiếm
   */
  async getPermissionsFlat(): Promise<Permission[]> {
    const response = await this.getPermissions();
    return response.result.permissionGroups.flatMap(group => group.permissions);
  }

  /**
   * Lấy quyền theo resource type
   */
  async getPermissionsByResourceType(resourceType: ResourceType): Promise<PermissionGroup | undefined> {
    const response = await this.getPermissions();
    return response.result.permissionGroups.find(group => group.resourceType === resourceType);
  }

  /**
   * Cấp quyền cho nhân viên
   * @param employeeId - ID của nhân viên
   * @param data - Danh sách cinemaIds và permissionCodes
   */
  async grantEmployeePermissions(
    employeeId: number,
    data: GrantEmployeePermissionsRequest
  ): Promise<GrantEmployeePermissionsResponse> {
    try {
      const client = createPartnerPermissionRequest();
      const response = await client.post<GrantEmployeePermissionsResponse>(
        `/partners/employees/${employeeId}/permissions`,
        data
      );
      return response.data;
    } catch (error) {
      throw handlePartnerPermissionError(error, "Đã xảy ra lỗi hệ thống khi cấp quyền cho nhân viên.");
    }
  }

  /**
   * Thu hồi quyền của nhân viên
   * @param employeeId - ID của nhân viên
   * @param data - Danh sách cinemaIds và permissionCodes cần thu hồi
   */
  async revokeEmployeePermissions(
    employeeId: number,
    data: RevokeEmployeePermissionsRequest
  ): Promise<RevokeEmployeePermissionsResponse> {
    try {
      const client = createPartnerPermissionRequest();
      
      // Build query params for DELETE request to avoid CORS/OPTIONS issues with body
      const queryParams = new URLSearchParams();
      data.cinemaIds.forEach((id) => queryParams.append("cinemaIds", id.toString()));
      data.permissionCodes.forEach((code) => queryParams.append("permissionCodes", code));
      
      const endpoint = `/partners/employees/${employeeId}/permissions?${queryParams.toString()}`;
      const response = await client.delete<RevokeEmployeePermissionsResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerPermissionError(error, "Đã xảy ra lỗi hệ thống khi thu hồi quyền của nhân viên.");
    }
  }

  /**
   * Lấy danh sách quyền của nhân viên theo rạp
   * @param employeeId - ID của nhân viên
   * @param params - Params chứa cinemaIds (optional)
   */
  async getEmployeePermissions(
    employeeId: number,
    params?: GetEmployeePermissionsParams
  ): Promise<GetEmployeePermissionsResponse> {
    try {
      const client = createPartnerPermissionRequest();
      const queryParams = new URLSearchParams();

      // Hỗ trợ truyền nhiều cinemaIds
      if (params?.cinemaIds && params.cinemaIds.length > 0) {
        params.cinemaIds.forEach((id) => queryParams.append("cinemaIds", id.toString()));
      }

      const endpoint = `/partners/employees/${employeeId}/permissions${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await client.get<GetEmployeePermissionsResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerPermissionError(error, "Đã xảy ra lỗi hệ thống khi lấy danh sách quyền của nhân viên.");
    }
  }
}

export const partnerPermissionService = new PartnerPermissionService();

// ==================== React Query Hooks ====================

/**
 * Hook để lấy danh sách quyền (grouped)
 */
export const useGetPartnerPermissions = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["partner-permissions"],
    queryFn: () => partnerPermissionService.getPermissions(),
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000, // 30 phút - permissions ít thay đổi
    gcTime: 60 * 60 * 1000, // 1 giờ
  });
};

/**
 * Hook để lấy danh sách quyền phẳng (flat list)
 */
export const useGetPartnerPermissionsFlat = (options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["partner-permissions-flat"],
    queryFn: () => partnerPermissionService.getPermissionsFlat(),
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * Hook để lấy quyền theo resource type
 */
export const useGetPartnerPermissionsByResourceType = (
  resourceType: ResourceType,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["partner-permissions", resourceType],
    queryFn: () => partnerPermissionService.getPermissionsByResourceType(resourceType),
    enabled: options?.enabled !== false,
    staleTime: 30 * 60 * 1000,
    gcTime: 60 * 60 * 1000,
  });
};

/**
 * Hook để prefetch permissions
 */
export const usePrefetchPartnerPermissions = () => {
  const queryClient = useQueryClient();

  return () =>
    queryClient.prefetchQuery({
      queryKey: ["partner-permissions"],
      queryFn: () => partnerPermissionService.getPermissions(),
    });
};

/**
 * Hook để invalidate permissions cache
 */
export const useInvalidatePartnerPermissions = () => {
  const queryClient = useQueryClient();

  return () => {
    queryClient.invalidateQueries({ queryKey: ["partner-permissions"] });
    queryClient.invalidateQueries({ queryKey: ["partner-permissions-flat"] });
  };
};

/**
 * Hook để cấp quyền cho nhân viên
 */
export const useGrantEmployeePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: number;
      payload: GrantEmployeePermissionsRequest;
    }) => partnerPermissionService.grantEmployeePermissions(employeeId, payload),
    onSuccess: (_, variables) => {
      // Invalidate employee permissions cache
      queryClient.invalidateQueries({ queryKey: ["employee-permissions", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["partner-employee", variables.employeeId] });
    },
  });
};

/**
 * Hook để thu hồi quyền của nhân viên
 */
export const useRevokeEmployeePermissions = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: number;
      payload: RevokeEmployeePermissionsRequest;
    }) => partnerPermissionService.revokeEmployeePermissions(employeeId, payload),
    onSuccess: (_, variables) => {
      // Invalidate employee permissions cache
      queryClient.invalidateQueries({ queryKey: ["employee-permissions", variables.employeeId] });
      queryClient.invalidateQueries({ queryKey: ["partner-employee", variables.employeeId] });
    },
  });
};

/**
 * Hook để lấy danh sách quyền của nhân viên
 */
export const useGetEmployeePermissions = (
  employeeId?: number,
  params?: GetEmployeePermissionsParams,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["employee-permissions", employeeId, params?.cinemaIds],
    queryFn: () => partnerPermissionService.getEmployeePermissions(employeeId!, params),
    enabled: !!employeeId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 phút
    gcTime: 10 * 60 * 1000, // 10 phút
  });
};

/**
 * Hook để prefetch quyền của nhân viên
 */
export const usePrefetchEmployeePermissions = () => {
  const queryClient = useQueryClient();

  return (employeeId: number, params?: GetEmployeePermissionsParams) =>
    queryClient.prefetchQuery({
      queryKey: ["employee-permissions", employeeId, params?.cinemaIds],
      queryFn: () => partnerPermissionService.getEmployeePermissions(employeeId, params),
    });
};

/**
 * Hook để invalidate employee permissions cache
 */
export const useInvalidateEmployeePermissions = () => {
  const queryClient = useQueryClient();

  return (employeeId?: number) => {
    if (employeeId) {
      queryClient.invalidateQueries({ queryKey: ["employee-permissions", employeeId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["employee-permissions"] });
    }
  };
};

// ==================== Utility Functions ====================

/**
 * Lấy tên hiển thị của resource type
 */
export const getResourceTypeName = (resourceType: ResourceType): string => {
  const names: Record<ResourceType, string> = {
    BOOKING: "Quản lý đặt vé",
    CINEMA: "Quản lý rạp chiếu",
    SCREEN: "Quản lý phòng chiếu",
    SEAT_LAYOUT: "Quản lý sơ đồ ghế",
    SEAT_TYPE: "Quản lý loại ghế",
    SERVICE: "Quản lý dịch vụ/combo",
    SHOWTIME: "Quản lý suất chiếu",
  };
  return names[resourceType] ?? resourceType;
};

/**
 * Lấy tên hiển thị của action type
 */
export const getActionTypeName = (actionType: ActionType): string => {
  const names: Record<ActionType, string> = {
    CREATE: "Tạo mới",
    READ: "Xem",
    UPDATE: "Cập nhật",
    DELETE: "Xóa",
    BULK_CREATE: "Tạo hàng loạt",
    BULK_DELETE: "Xóa hàng loạt",
  };
  return names[actionType] ?? actionType;
};

/**
 * Lấy màu badge cho action type
 */
export const getActionTypeColor = (actionType: ActionType): string => {
  const colors: Record<ActionType, string> = {
    CREATE: "bg-green-500/20 text-green-400 border-green-500/30",
    READ: "bg-blue-500/20 text-blue-400 border-blue-500/30",
    UPDATE: "bg-yellow-500/20 text-yellow-400 border-yellow-500/30",
    DELETE: "bg-red-500/20 text-red-400 border-red-500/30",
    BULK_CREATE: "bg-emerald-500/20 text-emerald-400 border-emerald-500/30",
    BULK_DELETE: "bg-orange-500/20 text-orange-400 border-orange-500/30",
  };
  return colors[actionType] ?? "bg-gray-500/20 text-gray-400 border-gray-500/30";
};

/**
 * Lấy icon cho resource type (trả về tên icon để sử dụng với lucide-react)
 */
export const getResourceTypeIcon = (resourceType: ResourceType): string => {
  const icons: Record<ResourceType, string> = {
    BOOKING: "Ticket",
    CINEMA: "Building2",
    SCREEN: "Monitor",
    SEAT_LAYOUT: "LayoutGrid",
    SEAT_TYPE: "Armchair",
    SERVICE: "Coffee",
    SHOWTIME: "Clock",
  };
  return icons[resourceType] ?? "Shield";
};
