import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PartnerSeatType {
  id: number;
  code: string;
  name: string;
  surcharge: number;
  color: string;
  description: string;
  status: boolean;
  createdAt: string;
  updatedAt: string;
}

export interface PartnerSeatTypeDetail extends PartnerSeatType {
  totalSeats: number;
  activeSeats: number;
  inactiveSeats: number;
}

export interface CreatePartnerSeatTypeRequest {
  code: string;
  name: string;
  surcharge: number;
  color: string;
  description?: string;
}

export interface UpdatePartnerSeatTypeRequest {
  name?: string;
  surcharge?: number;
  color?: string;
  description?: string;
}

export interface PartnerSeatTypesPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetPartnerSeatTypesResponse {
  message: string;
  result: {
    seatTypes: PartnerSeatType[];
    pagination: PartnerSeatTypesPagination;
  };
}

export interface GetPartnerSeatTypeByIdResponse {
  message: string;
  result: PartnerSeatTypeDetail;
}

export interface CreatePartnerSeatTypeResponse {
  message: string;
  result: PartnerSeatTypeDetail & { message?: string };
}

export interface UpdatePartnerSeatTypeResponse {
  message: string;
  result: PartnerSeatTypeDetail & { message?: string };
}

export interface DeletePartnerSeatTypeResponse {
  message: string;
  result?: PartnerSeatTypeDetail & { message?: string };
}

export interface GetPartnerSeatTypesParams {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  code?: string;
  search?: string;
  minSurcharge?: number;
  maxSurcharge?: number;
}

export class PartnerSeatTypeApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerSeatTypeApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerSeatTypeRequest = () => {
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

const handlePartnerSeatTypeError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy danh sách loại ghế."
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
    const errors =
      data?.errors && typeof data.errors === "object"
        ? (data.errors as Record<string, unknown>)
        : undefined;

    throw new PartnerSeatTypeApiError(message, status, errors);
  }

  throw new PartnerSeatTypeApiError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
};

class PartnerSeatTypeService {
  private readonly basePath = "/partners/seat-types";

  async getSeatTypes(params: GetPartnerSeatTypesParams = {}): Promise<GetPartnerSeatTypesResponse> {
    try {
      const client = createPartnerSeatTypeRequest();
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.code) queryParams.append("code", params.code);
      if (params.search) queryParams.append("search", params.search);
      if (params.minSurcharge !== undefined) queryParams.append("minSurcharge", params.minSurcharge.toString());
      if (params.maxSurcharge !== undefined) queryParams.append("maxSurcharge", params.maxSurcharge.toString());

      const endpoint = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await client.get<GetPartnerSeatTypesResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerSeatTypeError(error);
    }
  }

  async getSeatTypeById(seatTypeId: number): Promise<GetPartnerSeatTypeByIdResponse> {
    if (!seatTypeId || seatTypeId <= 0) {
      throw new PartnerSeatTypeApiError("Vui lòng chọn loại ghế hợp lệ.");
    }

    try {
      const client = createPartnerSeatTypeRequest();
      const response = await client.get<GetPartnerSeatTypeByIdResponse>(`${this.basePath}/${seatTypeId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerSeatTypeError(error, "Đã xảy ra lỗi hệ thống khi lấy thông tin loại ghế.");
    }
  }

  async createSeatType(payload: CreatePartnerSeatTypeRequest): Promise<CreatePartnerSeatTypeResponse> {
    try {
      const client = createPartnerSeatTypeRequest();
      const response = await client.post<CreatePartnerSeatTypeResponse>(this.basePath, payload);
      return response.data;
    } catch (error) {
      throw handlePartnerSeatTypeError(error, "Đã xảy ra lỗi hệ thống khi tạo loại ghế.");
    }
  }

  async updateSeatType(
    seatTypeId: number,
    payload: UpdatePartnerSeatTypeRequest
  ): Promise<UpdatePartnerSeatTypeResponse> {
    if (!seatTypeId || seatTypeId <= 0) {
      throw new PartnerSeatTypeApiError("Vui lòng chọn loại ghế hợp lệ.");
    }

    try {
      const client = createPartnerSeatTypeRequest();
      const response = await client.put<UpdatePartnerSeatTypeResponse>(
        `${this.basePath}/${seatTypeId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw handlePartnerSeatTypeError(error, "Đã xảy ra lỗi hệ thống khi cập nhật loại ghế.");
    }
  }

  async deleteSeatType(seatTypeId: number): Promise<DeletePartnerSeatTypeResponse> {
    if (!seatTypeId || seatTypeId <= 0) {
      throw new PartnerSeatTypeApiError("Vui lòng chọn loại ghế hợp lệ.");
    }

    try {
      const client = createPartnerSeatTypeRequest();
      const response = await client.delete<DeletePartnerSeatTypeResponse>(`${this.basePath}/${seatTypeId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerSeatTypeError(error, "Đã xảy ra lỗi hệ thống khi vô hiệu hoá loại ghế.");
    }
  }
}

export const partnerSeatTypeService = new PartnerSeatTypeService();

export const useGetPartnerSeatTypes = (params: GetPartnerSeatTypesParams = {}) => {
  return useQuery({
    queryKey: ["partner-seat-types", params],
    queryFn: () => partnerSeatTypeService.getSeatTypes(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnerSeatTypeById = (seatTypeId?: number) => {
  return useQuery({
    queryKey: ["partner-seat-type", seatTypeId],
    queryFn: () => partnerSeatTypeService.getSeatTypeById(seatTypeId!),
    enabled: typeof seatTypeId === "number" && seatTypeId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerSeatTypes = () => {
  const queryClient = useQueryClient();

  return (params: GetPartnerSeatTypesParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-seat-types", params],
      queryFn: () => partnerSeatTypeService.getSeatTypes(params),
    });
};

export const useInvalidatePartnerSeatTypes = () => {
  const queryClient = useQueryClient();

  return (params?: GetPartnerSeatTypesParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-types", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-types"] });
    }
  };
};

export const useCreatePartnerSeatType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerSeatTypeRequest) =>
      partnerSeatTypeService.createSeatType(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-types"], exact: false });
      if (response?.result?.id) {
        queryClient.setQueryData(["partner-seat-type", response.result.id], {
          message: response.message,
          result: response.result,
        });
      }
    },
  });
};

export const useUpdatePartnerSeatType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      seatTypeId,
      payload,
    }: {
      seatTypeId: number;
      payload: UpdatePartnerSeatTypeRequest;
    }) => partnerSeatTypeService.updateSeatType(seatTypeId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-types"], exact: false });
      if (variables?.seatTypeId) {
        queryClient.setQueryData(["partner-seat-type", variables.seatTypeId], response);
      }
    },
  });
};

export const useDeletePartnerSeatType = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (seatTypeId: number) => partnerSeatTypeService.deleteSeatType(seatTypeId),
    onSuccess: (_, seatTypeId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-types"], exact: false });
      if (seatTypeId !== undefined) {
        queryClient.removeQueries({ queryKey: ["partner-seat-type", seatTypeId] });
      }
    },
  });
};
