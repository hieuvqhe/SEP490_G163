import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PartnerCombo {
  serviceId: number;
  partnerId: number;
  name: string;
  code: string;
  price: number;
  isAvailable: boolean;
  description: string;
  imageUrl: string;
  createdAt: string;
  updatedAt: string;
}

export type PartnerComboDetail = PartnerCombo;

export interface PartnerCombosPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetPartnerCombosResponse {
  message: string;
  result: {
    services: PartnerCombo[];
    pagination: PartnerCombosPagination;
  };
}

export interface GetPartnerComboByIdResponse {
  message: string;
  result: PartnerComboDetail;
}

export interface CreatePartnerComboRequest {
  name: string;
  code: string;
  price: number;
  description: string;
  imageUrl: string;
}

export interface CreatePartnerComboResponse {
  message: string;
  result: PartnerComboDetail;
}

export interface UpdatePartnerComboRequest {
  name?: string;
  price?: number;
  description?: string;
  imageUrl?: string;
  isAvailable?: boolean;
}

export interface UpdatePartnerComboResponse {
  message: string;
  result: PartnerComboDetail;
}

export interface DeletePartnerComboResponse {
  message: string;
  result?: {
    serviceId: number;
    message?: string;
    isAvailable: boolean;
    updatedAt: string;
  };
}

export interface GetPartnerCombosParams {
  page?: number;
  limit?: number;
  isAvailable?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export class PartnerComboApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerComboApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerComboRequest = () => {
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

const handlePartnerComboError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy danh sách combo."
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

    throw new PartnerComboApiError(message, status, errors);
  }

  throw new PartnerComboApiError(
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  );
};

class PartnerComboService {
  private readonly basePath = "/partners/services";

  async getCombos(params: GetPartnerCombosParams = {}): Promise<GetPartnerCombosResponse> {
    try {
      const client = createPartnerComboRequest();
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.isAvailable !== undefined)
        queryParams.append("is_available", String(params.isAvailable));
      if (params.sortBy) queryParams.append("sort_by", params.sortBy);
      if (params.sortOrder) queryParams.append("sort_order", params.sortOrder);
      if (params.search) queryParams.append("search", params.search);

      const endpoint = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await client.get<GetPartnerCombosResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerComboError(error);
    }
  }

  async getComboById(serviceId: number): Promise<GetPartnerComboByIdResponse> {
    try {
      const client = createPartnerComboRequest();
      const response = await client.get<GetPartnerComboByIdResponse>(`${this.basePath}/${serviceId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerComboError(error);
    }
  }

  async createCombo(data: CreatePartnerComboRequest): Promise<CreatePartnerComboResponse> {
    try {
      const client = createPartnerComboRequest();
      const response = await client.post<CreatePartnerComboResponse>(this.basePath, data);
      return response.data;
    } catch (error) {
      throw handlePartnerComboError(error);
    }
  }

  async updateCombo(
    serviceId: number,
    data: UpdatePartnerComboRequest
  ): Promise<UpdatePartnerComboResponse> {
    try {
      const client = createPartnerComboRequest();
      const response = await client.put<UpdatePartnerComboResponse>(`${this.basePath}/${serviceId}`, data);
      return response.data;
    } catch (error) {
      throw handlePartnerComboError(error, "Đã xảy ra lỗi hệ thống khi cập nhật combo.");
    }
  }

  async deleteCombo(serviceId: number): Promise<DeletePartnerComboResponse> {
    try {
      const client = createPartnerComboRequest();
      const response = await client.delete<DeletePartnerComboResponse>(`${this.basePath}/${serviceId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerComboError(error, "Đã xảy ra lỗi hệ thống khi xóa combo.");
    }
  }
}

export const partnerComboService = new PartnerComboService();

export const useGetPartnerCombos = (params: GetPartnerCombosParams = {}) => {
  return useQuery({
    queryKey: ["partner-combos", params],
    queryFn: () => partnerComboService.getCombos(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnerComboById = (serviceId?: number) => {
  return useQuery({
    queryKey: ["partner-combo", serviceId],
    queryFn: () => partnerComboService.getComboById(serviceId!),
    enabled: !!serviceId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerCombos = () => {
  const queryClient = useQueryClient();

  return (params: GetPartnerCombosParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-combos", params],
      queryFn: () => partnerComboService.getCombos(params),
    });
};

export const useInvalidatePartnerCombos = () => {
  const queryClient = useQueryClient();

  return (params?: GetPartnerCombosParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: ["partner-combos", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-combos"] });
    }
  };
};

export const useCreatePartnerCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerComboRequest) => partnerComboService.createCombo(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["partner-combos"] });
      if (response?.result?.serviceId) {
        queryClient.setQueryData(["partner-combo", response.result.serviceId], response);
      }
    },
  });
};

export const useUpdatePartnerCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      serviceId,
      payload,
    }: {
      serviceId: number;
      payload: UpdatePartnerComboRequest;
    }) => partnerComboService.updateCombo(serviceId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partner-combos"] });
      if (variables?.serviceId) {
        queryClient.invalidateQueries({ queryKey: ["partner-combo", variables.serviceId] });
        queryClient.setQueryData(["partner-combo", variables.serviceId], response);
      }
    },
  });
};

export const useDeletePartnerCombo = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (serviceId: number) => partnerComboService.deleteCombo(serviceId),
    onSuccess: (_, serviceId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-combos"] });
      if (serviceId !== undefined) {
        queryClient.removeQueries({ queryKey: ["partner-combo", serviceId] });
      }
    },
  });
};
