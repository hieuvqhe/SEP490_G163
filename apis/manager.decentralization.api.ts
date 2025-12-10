import { BASE_URL } from "@/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ============= Types =============

export interface AssignPartnerToStaffRequest {
  managerStaffId: number;
}

export interface AssignPartnerToStaffResponse {
  message: string;
  result: null;
}

export interface Permission {
  permissionId: number;
  permissionCode: string;
  permissionName: string;
  resourceType: string;
  actionType: string;
  description: string;
  isActive: boolean;
}

export interface PermissionGroup {
  resourceType: string;
  resourceName: string;
  permissions: Permission[];
}

export interface GetAvailablePermissionsResponse {
  message: string;
  result: {
    permissionGroups: PermissionGroup[];
  };
}

export interface GrantPermissionsRequest {
  partnerIds: number[];
  permissionCodes: string[];
}

export interface GrantPermissionsResponse {
  message: string;
  result: {
    success: boolean;
    message: string;
    affectedCount: number;
  };
}

export interface RevokePermissionsRequest {
  partnerIds: number[];
  permissionCodes: string[];
}

export interface RevokePermissionsResponse {
  message: string;
  result: {
    success: boolean;
    message: string;
    affectedCount: number;
  };
}

export interface GrantedPermission extends Permission {
  grantedAt: string;
  grantedByUserId: number;
  grantedByName: string;
  grantedByEmail: string;
  isGlobalPermission: boolean;
}

export interface PartnerPermission {
  partnerId: number;
  partnerName: string;
  taxCode: string;
  address: string;
  permissions: GrantedPermission[];
}

export interface GetStaffPermissionsParams {
  partnerIds?: number[];
}

export interface GetStaffPermissionsResponse {
  message: string;
  result: {
    managerStaffId: number;
    managerStaffName: string;
    partnerPermissions: PartnerPermission[];
  };
}

export interface GrantVoucherPermissionsRequest {
  permissionCodes: string[];
}

export interface GrantVoucherPermissionsResponse {
  message: string;
  result: {
    success: boolean;
    message: string;
    affectedCount: number;
  };
}

export interface GetCurrentVoucherManagerResponse {
  message: string;
  result: {
    managerStaffId: number;
  } | null;
}

export interface RevokeVoucherPermissionsRequest {
  permissionCodes: string[];
}

export interface RevokeVoucherPermissionsResponse {
  message: string;
  result: {
    success: boolean;
    message: string;
    affectedCount: number;
  };
}

// Voucher permission codes (all 5 permissions for complete voucher management)
export const VOUCHER_PERMISSION_CODES = [
  "VOUCHER_CREATE",
  "VOUCHER_READ",
  "VOUCHER_UPDATE",
  "VOUCHER_DELETE",
  "VOUCHER_SEND"
] as const;

// ============= Error Handling =============

export interface ManagerDecentralizationApiError {
  message: string;
  detail?: string;
  errors?: Record<string, unknown>;
  Errors?: Record<string, unknown>;
}

export class ManagerDecentralizationError extends Error {
  status?: number;
  detail?: string;
  errors?: Record<string, unknown>;

  constructor(
    message: string,
    options: { status?: number; detail?: string; errors?: Record<string, unknown> } = {}
  ) {
    super(message);
    this.name = "ManagerDecentralizationError";
    this.status = options.status;
    this.detail = options.detail;
    this.errors = options.errors;
  }
}

const toManagerDecentralizationError = (
  response: Response,
  payload: unknown
): ManagerDecentralizationError => {
  const data = (payload && typeof payload === "object" ? payload : {}) as Record<string, unknown>;
  const message =
    typeof data.message === "string" && data.message.trim() !== ""
      ? data.message
      : "Yêu cầu thất bại";
  const detail =
    typeof data.detail === "string" && data.detail.trim() !== ""
      ? data.detail
      : undefined;
  const errorsCandidate =
    (data.errors && typeof data.errors === "object" ? data.errors : undefined) ??
    (data.Errors && typeof data.Errors === "object" ? data.Errors : undefined);

  return new ManagerDecentralizationError(message, {
    status: response.status,
    detail,
    errors: errorsCandidate as Record<string, unknown> | undefined,
  });
};

// ============= Service =============

class ManagerDecentralizationService {
  private baseURL = `${BASE_URL}/manager`;

  async assignPartnerToStaff(
    partnerId: number,
    data: AssignPartnerToStaffRequest,
    accessToken: string
  ): Promise<AssignPartnerToStaffResponse> {
    try {
      const url = `${this.baseURL}/partners/${partnerId}/assign-staff`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw toManagerDecentralizationError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerDecentralizationError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerDecentralizationError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerDecentralizationError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerDecentralizationError("Yêu cầu thất bại");
    }
  }

  async getAvailablePermissions(accessToken: string): Promise<GetAvailablePermissionsResponse> {
    try {
      const url = `${BASE_URL}/api/manager/staff/permissions/available`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerDecentralizationApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as ManagerDecentralizationApiError;
      }
      throw error;
    }
  }

  async grantPermissions(
    staffId: number,
    data: GrantPermissionsRequest,
    accessToken: string
  ): Promise<GrantPermissionsResponse> {
    try {
      const url = `${BASE_URL}/api/manager/staff/${staffId}/permissions`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw toManagerDecentralizationError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerDecentralizationError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerDecentralizationError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerDecentralizationError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerDecentralizationError("Yêu cầu thất bại");
    }
  }

  async revokePermissions(
    staffId: number,
    data: RevokePermissionsRequest,
    accessToken: string
  ): Promise<RevokePermissionsResponse> {
    try {
      const url = `${BASE_URL}/api/manager/staff/${staffId}/permissions`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw toManagerDecentralizationError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerDecentralizationError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerDecentralizationError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerDecentralizationError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerDecentralizationError("Yêu cầu thất bại");
    }
  }

  async getStaffPermissions(
    staffId: number,
    params: GetStaffPermissionsParams,
    accessToken: string
  ): Promise<GetStaffPermissionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.partnerIds && params.partnerIds.length > 0) {
        params.partnerIds.forEach((id) => queryParams.append("partnerIds", id.toString()));
      }

      const url = `${BASE_URL}/api/manager/staff/${staffId}/permissions${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerDecentralizationApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as ManagerDecentralizationApiError;
      }
      throw error;
    }
  }

  async grantVoucherPermissions(
    staffId: number,
    accessToken: string
  ): Promise<GrantVoucherPermissionsResponse> {
    try {
      const url = `${BASE_URL}/api/manager/staff/${staffId}/voucher-permissions`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          permissionCodes: VOUCHER_PERMISSION_CODES
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw toManagerDecentralizationError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerDecentralizationError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerDecentralizationError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerDecentralizationError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerDecentralizationError("Yêu cầu thất bại");
    }
  }

  async getCurrentVoucherManager(accessToken: string): Promise<GetCurrentVoucherManagerResponse> {
    try {
      const url = `${BASE_URL}/api/manager/staff/voucher-permission/current`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerDecentralizationApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as ManagerDecentralizationApiError;
      }
      throw error;
    }
  }

  async revokeVoucherPermissions(
    staffId: number,
    accessToken: string
  ): Promise<RevokeVoucherPermissionsResponse> {
    try {
      const url = `${BASE_URL}/api/manager/staff/${staffId}/voucher-permissions`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({
          permissionCodes: VOUCHER_PERMISSION_CODES
        }),
      });
      const result = await response.json();
      if (!response.ok) {
        throw toManagerDecentralizationError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerDecentralizationError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerDecentralizationError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerDecentralizationError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerDecentralizationError("Yêu cầu thất bại");
    }
  }
}

export const managerDecentralizationService = new ManagerDecentralizationService();

// ============= React Query Hooks =============

export const useAssignPartnerToStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      partnerId,
      data,
      accessToken,
    }: {
      partnerId: number;
      data: AssignPartnerToStaffRequest;
      accessToken: string;
    }) => managerDecentralizationService.assignPartnerToStaff(partnerId, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staffs"] });
      queryClient.invalidateQueries({ queryKey: ["manager-partners"] });
    },
  });
};

export const useGetAvailablePermissions = (accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-available-permissions"],
    queryFn: () => managerDecentralizationService.getAvailablePermissions(accessToken!),
    enabled: !!accessToken,
    staleTime: 10 * 60 * 1000, // 10 minutes - permissions don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useGrantPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      data,
      accessToken,
    }: {
      staffId: number;
      data: GrantPermissionsRequest;
      accessToken: string;
    }) => managerDecentralizationService.grantPermissions(staffId, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staff-permissions"] });
    },
  });
};

export const useRevokePermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      data,
      accessToken,
    }: {
      staffId: number;
      data: RevokePermissionsRequest;
      accessToken: string;
    }) => managerDecentralizationService.revokePermissions(staffId, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staff-permissions"] });
    },
  });
};

export const useGetStaffPermissions = (
  staffId: number,
  params: GetStaffPermissionsParams,
  accessToken?: string
) => {
  return useQuery({
    queryKey: ["manager-staff-permissions", staffId, params],
    queryFn: () => managerDecentralizationService.getStaffPermissions(staffId, params, accessToken!),
    enabled: !!accessToken && !!staffId,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useGrantVoucherPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      accessToken,
    }: {
      staffId: number;
      accessToken: string;
    }) => managerDecentralizationService.grantVoucherPermissions(staffId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staff-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["manager-staffs"] });
      queryClient.invalidateQueries({ queryKey: ["manager-current-voucher-manager"] });
    },
  });
};

export const useGetCurrentVoucherManager = (accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-current-voucher-manager"],
    queryFn: () => managerDecentralizationService.getCurrentVoucherManager(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000,
  });
};

export const useRevokeVoucherPermissions = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      staffId,
      accessToken,
    }: {
      staffId: number;
      accessToken: string;
    }) => managerDecentralizationService.revokeVoucherPermissions(staffId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staff-permissions"] });
      queryClient.invalidateQueries({ queryKey: ["manager-staffs"] });
      queryClient.invalidateQueries({ queryKey: ["manager-current-voucher-manager"] });
    },
  });
};
