import { BASE_URL } from "@/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface GetManagerStaffsParams {
  page?: number;
  limit?: number;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface ManagerStaff {
  managerStaffId: number;
  userId: number;
  managerId: number;
  fullName: string;
  email: string;
  phone: string;
  roleType: "ManagerStaff";
  hireDate: string;
  isActive: boolean;
}

export interface StaffPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetManagerStaffsResponse {
  message: string;
  result: {
    managerStaffs: ManagerStaff[];
    pagination: StaffPagination;
  };
}

export interface GetManagerStaffByIdResponse {
  message: string;
  result: ManagerStaff;
}

export interface CreateManagerStaffRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleType: "ManagerStaff";
  hireDate: string;
}

export interface CreateManagerStaffResponse {
  message: string;
  result: ManagerStaff;
}

export interface UpdateManagerStaffRequest {
  fullName: string;
  phone: string;
  roleType: "ManagerStaff";
  isActive: boolean;
}

export interface UpdateManagerStaffResponse {
  message: string;
  result: ManagerStaff;
}

export interface DeleteManagerStaffResponse {
  message: string;
  result: null;
}

export interface ManagerStaffApiError {
  message: string;
  detail?: string;
  errors?: Record<string, unknown>;
  Errors?: Record<string, unknown>;
}

export class ManagerStaffError extends Error {
  status?: number;
  detail?: string;
  errors?: Record<string, unknown>;

  constructor(
    message: string,
    options: { status?: number; detail?: string; errors?: Record<string, unknown> } = {}
  ) {
    super(message);
    this.name = "ManagerStaffError";
    this.status = options.status;
    this.detail = options.detail;
    this.errors = options.errors;
  }
}

const toManagerStaffError = (
  response: Response,
  payload: unknown
): ManagerStaffError => {
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

  return new ManagerStaffError(message, {
    status: response.status,
    detail,
    errors: errorsCandidate as Record<string, unknown> | undefined,
  });
};

class ManagerStaffService {
  private baseURL = `${BASE_URL}/manager`;

  async getManagerStaffs(params: GetManagerStaffsParams, accessToken: string): Promise<GetManagerStaffsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.isActive !== undefined) queryParams.append("isActive", params.isActive.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${this.baseURL}/staff${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerStaffApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerStaffApiError;
      }
      throw error;
    }
  }

  async getManagerStaffById(staffId: number, accessToken: string): Promise<GetManagerStaffByIdResponse> {
    try {
      const url = `${this.baseURL}/staff/${staffId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerStaffApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerStaffApiError;
      }
      throw error;
    }
  }

  async createManagerStaff(data: CreateManagerStaffRequest, accessToken: string): Promise<CreateManagerStaffResponse> {
    try {
      const url = `${this.baseURL}/staff`;
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
        throw toManagerStaffError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerStaffError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerStaffError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerStaffError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerStaffError("Yêu cầu thất bại");
    }
  }

  async updateManagerStaff(staffId: number, data: UpdateManagerStaffRequest, accessToken: string): Promise<UpdateManagerStaffResponse> {
    try {
      const url = `${this.baseURL}/staff/${staffId}`;
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
        throw toManagerStaffError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerStaffError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerStaffError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        const errorsCandidate =
          (error.errors && typeof error.errors === "object" ? error.errors : undefined) ??
          (error.Errors && typeof error.Errors === "object" ? error.Errors : undefined);

        throw new ManagerStaffError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
          errors: errorsCandidate as Record<string, unknown> | undefined,
        });
      }

      throw new ManagerStaffError("Yêu cầu thất bại");
    }
  }

  async deleteManagerStaff(staffId: number, accessToken: string): Promise<DeleteManagerStaffResponse> {
    try {
      const url = `${this.baseURL}/staff/${staffId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw toManagerStaffError(response, result);
      }
      return result;
    } catch (error: any) {
      if (error instanceof ManagerStaffError) {
        throw error;
      }

      if (error?.name === "TypeError") {
        throw new ManagerStaffError(
          "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
          { status: undefined }
        );
      }

      if (error && typeof error.message === "string") {
        throw new ManagerStaffError(error.message, {
          detail: typeof error.detail === "string" ? error.detail : undefined,
        });
      }

      throw new ManagerStaffError("Yêu cầu thất bại");
    }
  }
}

export const managerStaffService = new ManagerStaffService();

// React Query Hooks
export const useGetManagerStaffs = (params: GetManagerStaffsParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-staffs", params],
    queryFn: () => managerStaffService.getManagerStaffs(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetManagerStaffById = (staffId: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-staff-detail", staffId],
    queryFn: () => managerStaffService.getManagerStaffById(staffId, accessToken!),
    enabled: !!accessToken && !!staffId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateManagerStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: CreateManagerStaffRequest; accessToken: string }) =>
      managerStaffService.createManagerStaff(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staffs"] });
    },
  });
};

export const useUpdateManagerStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, data, accessToken }: { staffId: number; data: UpdateManagerStaffRequest; accessToken: string }) =>
      managerStaffService.updateManagerStaff(staffId, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staffs"] });
      queryClient.invalidateQueries({ queryKey: ["manager-staff-detail"] });
    },
  });
};

export const useDeleteManagerStaff = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ staffId, accessToken }: { staffId: number; accessToken: string }) =>
      managerStaffService.deleteManagerStaff(staffId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-staffs"] });
    },
  });
};
