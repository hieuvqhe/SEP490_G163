import { BASE_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

// ==================== Types ====================

export interface GetAuditLogsParams {
  page?: number;
  limit?: number;
  userId?: number;
  role?: string;
  action?: string;
  tableName?: string;
  recordId?: number;
  from?: string; // datetime string
  to?: string; // datetime string
  search?: string;
  sortOrder?: "asc" | "desc";
}

export interface AuditLogMetadata {
  httpMethod?: string;
  path?: string;
  query?: Record<string, unknown>;
  routeValues?: Record<string, string>;
  statusCode?: number;
  [key: string]: unknown;
}

export interface AuditLog {
  logId: number;
  userId: number | null;
  role: string | null;
  action: string;
  tableName: string;
  recordId: number | null;
  timestamp: string;
  before: Record<string, unknown> | null;
  after: Record<string, unknown> | null;
  metadata: AuditLogMetadata | null;
  ipAddress: string | null;
  userAgent: string | null;
}

export interface GetAuditLogsResponse {
  message: string;
  result: {
    logs: AuditLog[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface GetAuditLogByIdResponse {
  message: string;
  result: AuditLog;
}

export interface AdminAuditLogApiError {
  message: string;
  errorInfo?: {
    name: string;
    message: string;
  };
}

// ==================== Service ====================

class AdminAuditLogService {
  private baseURL = `${BASE_URL}/api/admin/audit-logs`;

  /**
   * Lấy danh sách audit logs với các filter
   */
  async getAuditLogs(
    params: GetAuditLogsParams,
    accessToken: string
  ): Promise<GetAuditLogsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("Page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("Limit", params.limit.toString());
      if (params.userId !== undefined) queryParams.append("UserId", params.userId.toString());
      if (params.role) queryParams.append("Role", params.role);
      if (params.action) queryParams.append("Action", params.action);
      if (params.tableName) queryParams.append("TableName", params.tableName);
      if (params.recordId !== undefined) queryParams.append("RecordId", params.recordId.toString());
      if (params.from) queryParams.append("From", params.from);
      if (params.to) queryParams.append("To", params.to);
      if (params.search) queryParams.append("Search", params.search);
      if (params.sortOrder) queryParams.append("SortOrder", params.sortOrder);

      const url = `${this.baseURL}${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminAuditLogApiError;
      }

      return result;
    } catch (error: unknown) {
      // Handle network errors
      if (error instanceof TypeError) {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminAuditLogApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  /**
   * Lấy chi tiết audit log theo ID
   */
  async getAuditLogById(
    logId: number,
    accessToken: string
  ): Promise<GetAuditLogByIdResponse> {
    try {
      const url = `${this.baseURL}/${logId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminAuditLogApiError;
      }

      return result;
    } catch (error: unknown) {
      // Handle network errors
      if (error instanceof TypeError) {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminAuditLogApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }
}

export const adminAuditLogService = new AdminAuditLogService();

// ==================== React Query Hooks ====================

/**
 * Hook để lấy danh sách audit logs
 */
export const useGetAuditLogs = (
  params: GetAuditLogsParams,
  accessToken?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["admin-audit-logs", params],
    queryFn: () => adminAuditLogService.getAuditLogs(params, accessToken!),
    enabled: !!accessToken && options?.enabled !== false,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook để lấy chi tiết audit log theo ID
 */
export const useGetAuditLogById = (
  logId?: number,
  accessToken?: string,
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: ["admin-audit-log", logId],
    queryFn: () => adminAuditLogService.getAuditLogById(logId!, accessToken!),
    enabled: !!accessToken && !!logId && options?.enabled !== false,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

// ==================== Utility Functions ====================

/**
 * Lấy màu badge cho action type
 */
export const getActionColor = (action: string): string => {
  const actionLower = action.toLowerCase();
  
  if (actionLower.includes("create") || actionLower.includes("add")) {
    return "bg-green-500/20 text-green-400 border-green-500/30";
  }
  if (actionLower.includes("update") || actionLower.includes("edit")) {
    return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
  }
  if (actionLower.includes("delete") || actionLower.includes("remove")) {
    return "bg-red-500/20 text-red-400 border-red-500/30";
  }
  if (actionLower.includes("login") || actionLower.includes("auth")) {
    return "bg-blue-500/20 text-blue-400 border-blue-500/30";
  }
  if (actionLower.includes("logout")) {
    return "bg-purple-500/20 text-purple-400 border-purple-500/30";
  }
  if (actionLower.includes("ban")) {
    return "bg-orange-500/20 text-orange-400 border-orange-500/30";
  }
  
  return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
};

/**
 * Lấy màu badge cho role
 */
export const getRoleColor = (role: string | null): string => {
  if (!role) return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  
  const roleLower = role.toLowerCase();
  
  switch (roleLower) {
    case "admin":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "manager":
      return "bg-purple-500/20 text-purple-400 border-purple-500/30";
    case "partner":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    case "employee":
    case "staff":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "customer":
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
};

/**
 * Format timestamp để hiển thị
 */
export const formatAuditTimestamp = (timestamp: string): string => {
  const date = new Date(timestamp);
  return date.toLocaleString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
    hour: "2-digit",
    minute: "2-digit",
    second: "2-digit",
  });
};

/**
 * Lấy HTTP method color
 */
export const getHttpMethodColor = (method?: string): string => {
  if (!method) return "text-zinc-400";
  
  switch (method.toUpperCase()) {
    case "GET":
      return "text-green-400";
    case "POST":
      return "text-blue-400";
    case "PUT":
    case "PATCH":
      return "text-yellow-400";
    case "DELETE":
      return "text-red-400";
    default:
      return "text-zinc-400";
  }
};
