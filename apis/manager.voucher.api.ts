import { BASE_URL } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type DiscountType = "percent" | "fixed";

export interface CreateVoucherRequest {
  voucherCode: string;
  discountType: DiscountType;
  discountVal: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  description?: string;
  isActive: boolean;
}

export interface VoucherDetail {
  voucherId: number;
  voucherCode: string;
  discountType: DiscountType;
  discountVal: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  description?: string | null;
  isActive: boolean;
  createdAt: string;
  updatedAt: string | null;
  managerId: number;
  managerName: string;
}

export interface VoucherSummary {
  voucherId: number;
  voucherCode: string;
  discountType: DiscountType;
  discountVal: number;
  validFrom: string;
  validTo: string;
  usageLimit: number;
  usedCount: number;
  isActive: boolean;
  createdAt: string;
  managerName: string;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CreateVoucherResponse {
  message: string;
  result: VoucherDetail;
}

export type UpdateVoucherRequest = CreateVoucherRequest;

export interface UpdateVoucherResponse {
  message: string;
  result: VoucherDetail;
}

export interface GetVouchersResponse {
  message: string;
  result: {
    vouchers: VoucherSummary[];
    pagination: Pagination;
  };
}

export interface GetVoucherByIdResponse {
  message: string;
  result: VoucherDetail;
}

export interface DeleteVoucherResponse {
  message: string;
  result: null;
}

export interface ToggleVoucherStatusResponse {
  message: string;
  result: null;
}

export type VoucherStatusFilter = "active" | "inactive";

export type VoucherSortBy =
  | "createdat"
  | "voucherId"
  | "voucherCode"
  | "discountVal"
  | "validFrom"
  | "validTo"
  | "usageLimit"
  | "usedCount";

export interface GetVouchersParams {
  page?: number;
  limit?: number;
  search?: string;
  status?: VoucherStatusFilter;
  sortBy?: VoucherSortBy;
  sortOrder?: "asc" | "desc";
}

export interface ManagerVoucherApiFieldError {
  msg: string;
  path: string;
  location: string;
}

export interface ManagerVoucherApiError {
  message: string;
  errors?: Record<string, ManagerVoucherApiFieldError>;
  detail?: string;
}

export interface SendVoucherToAllUsersRequest {
  subject: string;
  customMessage: string;
}

export interface SendVoucherToSpecificUsersRequest extends SendVoucherToAllUsersRequest {
  userIds: number[];
}

export interface VoucherSendResult {
  userEmail: string;
  userName: string;
  success: boolean;
  errorMessage: string | null;
  sentAt: string;
}

export interface SendVoucherResponse {
  message: string;
  result: {
    totalSent: number;
    totalFailed: number;
    results: VoucherSendResult[];
  };
}

export interface VoucherEmailHistoryItem {
  id: number;
  userEmail: string;
  userName: string;
  sentAt: string;
  status: string;
}

export interface GetVoucherEmailHistoryResponse {
  message: string;
  result: VoucherEmailHistoryItem[];
}

class ManagerVoucherService {
  // Backend exposes manager routes under `${BASE_URL}/api/manager`
  private baseURL = `${BASE_URL}/api/manager`;

  async createVoucher(data: CreateVoucherRequest, accessToken: string): Promise<CreateVoucherResponse> {
    try {
      const url = `${this.baseURL}/vouchers`;
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
        throw result as ManagerVoucherApiError;
      }
      return result as CreateVoucherResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async getVouchers(params: GetVouchersParams, accessToken: string): Promise<GetVouchersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.status) queryParams.append("status", params.status);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = `${this.baseURL}/vouchers${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerVoucherApiError;
      }
      return result as GetVouchersResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async getVoucherById(voucherId: number, accessToken: string): Promise<GetVoucherByIdResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerVoucherApiError;
      }
      return result as GetVoucherByIdResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async updateVoucher(
    voucherId: number,
    data: UpdateVoucherRequest,
    accessToken: string,
  ): Promise<UpdateVoucherResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}`;
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
        throw result as ManagerVoucherApiError;
      }
      return result as UpdateVoucherResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async deleteVoucher(voucherId: number, accessToken: string): Promise<DeleteVoucherResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerVoucherApiError;
      }
      return result as DeleteVoucherResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async toggleVoucherStatus(voucherId: number, accessToken: string): Promise<ToggleVoucherStatusResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}/toggle-status`;
      const response = await fetch(url, {
        method: "PATCH",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerVoucherApiError;
      }
      return result as ToggleVoucherStatusResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async sendVoucherToAllUsers(
    voucherId: number,
    data: SendVoucherToAllUsersRequest,
    accessToken: string,
  ): Promise<SendVoucherResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}/send-to-all-users`;
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
        throw result as ManagerVoucherApiError;
      }
      return result as SendVoucherResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async sendVoucherToSpecificUsers(
    voucherId: number,
    data: SendVoucherToSpecificUsersRequest,
    accessToken: string,
  ): Promise<SendVoucherResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}/send-to-specific-users`;
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
        throw result as ManagerVoucherApiError;
      }
      return result as SendVoucherResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }

  async getVoucherEmailHistory(
    voucherId: number,
    accessToken: string,
  ): Promise<GetVoucherEmailHistoryResponse> {
    try {
      const url = `${this.baseURL}/vouchers/${voucherId}/email-history`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerVoucherApiError;
      }
      return result as GetVoucherEmailHistoryResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerVoucherApiError;
      }
      throw error;
    }
  }
}

export const managerVoucherService = new ManagerVoucherService();

export const useGetVouchers = (params: GetVouchersParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-vouchers", params],
    queryFn: () => managerVoucherService.getVouchers(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetVoucherById = (voucherId?: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-voucher", voucherId],
    queryFn: () => managerVoucherService.getVoucherById(voucherId as number, accessToken!),
    enabled: !!accessToken && typeof voucherId === "number" && voucherId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: CreateVoucherRequest; accessToken: string }) =>
      managerVoucherService.createVoucher(data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-vouchers"] });
    },
  });
};

export const useUpdateVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      voucherId,
      data,
      accessToken,
    }: {
      voucherId: number;
      data: UpdateVoucherRequest;
      accessToken: string;
    }) => managerVoucherService.updateVoucher(voucherId, data, accessToken),
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["manager-voucher", voucherId] });
    },
  });
};

export const useDeleteVoucher = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ voucherId, accessToken }: { voucherId: number; accessToken: string }) =>
      managerVoucherService.deleteVoucher(voucherId, accessToken),
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["manager-voucher", voucherId] });
    },
  });
};

export const useToggleVoucherStatus = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ voucherId, accessToken }: { voucherId: number; accessToken: string }) =>
      managerVoucherService.toggleVoucherStatus(voucherId, accessToken),
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-vouchers"] });
      queryClient.invalidateQueries({ queryKey: ["manager-voucher", voucherId] });
    },
  });
};

export const useSendVoucherToAllUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      voucherId,
      data,
      accessToken,
    }: {
      voucherId: number;
      data: SendVoucherToAllUsersRequest;
      accessToken: string;
    }) => managerVoucherService.sendVoucherToAllUsers(voucherId, data, accessToken),
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-voucher-email-history", voucherId] });
    },
  });
};

export const useSendVoucherToSpecificUsers = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      voucherId,
      data,
      accessToken,
    }: {
      voucherId: number;
      data: SendVoucherToSpecificUsersRequest;
      accessToken: string;
    }) => managerVoucherService.sendVoucherToSpecificUsers(voucherId, data, accessToken),
    onSuccess: (_, { voucherId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-voucher-email-history", voucherId] });
    },
  });
};

export const useGetVoucherEmailHistory = (voucherId?: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-voucher-email-history", voucherId],
    queryFn: () => managerVoucherService.getVoucherEmailHistory(voucherId as number, accessToken!),
    enabled: !!accessToken && typeof voucherId === "number" && voucherId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
