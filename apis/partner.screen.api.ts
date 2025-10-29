import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PartnerScreen {
  screenId: number;
  cinemaId: number;
  cinemaName: string;
  screenName: string;
  code: string;
  description: string;
  screenType: string;
  soundSystem: string;
  capacity: number;
  seatRows: number;
  seatColumns: number;
  isActive: boolean;
  hasSeatLayout: boolean;
  createdDate: string;
  updatedDate: string;
}

export interface PartnerScreensPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetPartnerScreensResponse {
  message: string;
  result: {
    screens: PartnerScreen[];
    pagination: PartnerScreensPagination;
  };
}

export interface GetPartnerScreenByIdResponse {
  message: string;
  result: PartnerScreen;
}

export interface CreatePartnerScreenRequest {
  screenName: string;
  code: string;
  description?: string;
  screenType: string;
  soundSystem: string;
  capacity: number;
  seatRows: number;
  seatColumns: number;
}

export interface UpdatePartnerScreenRequest extends Partial<CreatePartnerScreenRequest> {
  isActive?: boolean;
}

export interface CreatePartnerScreenResponse {
  message: string;
  result: PartnerScreen;
}

export interface UpdatePartnerScreenResponse {
  message: string;
  result: PartnerScreen;
}

export interface DeletePartnerScreenResponse {
  message: string;
  result?: {
    screenId: number;
    screenName?: string;
    message?: string;
    isActive?: boolean;
    updatedDate?: string;
  };
}

export interface GetPartnerScreensParams {
  page?: number;
  limit?: number;
  screenType?: string;
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class PartnerScreenApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerScreenApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerScreenRequest = () => {
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

const handlePartnerScreenError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy danh sách phòng."
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

    throw new PartnerScreenApiError(message, status, errors);
  }

  throw new PartnerScreenApiError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
};

class PartnerScreenService {
  private readonly partnerBasePath = "/partners";

  async getScreens(
    cinemaId: number,
    params: GetPartnerScreensParams = {}
  ): Promise<GetPartnerScreensResponse> {
    if (!cinemaId || cinemaId <= 0) {
      throw new PartnerScreenApiError("Vui lòng chọn rạp chiếu hợp lệ.");
    }

    try {
      const client = createPartnerScreenRequest();
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.screenType) queryParams.append("screen_type", params.screenType);
      if (params.isActive !== undefined) queryParams.append("is_active", String(params.isActive));
      if (params.sortBy) queryParams.append("sort_by", params.sortBy);
      if (params.sortOrder) queryParams.append("sort_order", params.sortOrder);

      const endpoint = `${this.partnerBasePath}/cinema/${cinemaId}/screens${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await client.get<GetPartnerScreensResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerScreenError(error);
    }
  }

  async getScreenById(screenId: number): Promise<GetPartnerScreenByIdResponse> {
    if (!screenId || screenId <= 0) {
      throw new PartnerScreenApiError("Vui lòng chọn phòng chiếu hợp lệ.");
    }

    try {
      const client = createPartnerScreenRequest();
      const response = await client.get<GetPartnerScreenByIdResponse>(
        `${this.partnerBasePath}/screens/${screenId}`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerScreenError(error, "Đã xảy ra lỗi hệ thống khi lấy thông tin phòng.");
    }
  }

  async createScreen(
    cinemaId: number,
    payload: CreatePartnerScreenRequest
  ): Promise<CreatePartnerScreenResponse> {
    if (!cinemaId || cinemaId <= 0) {
      throw new PartnerScreenApiError("Vui lòng chọn rạp chiếu hợp lệ.");
    }

    try {
      const client = createPartnerScreenRequest();
      const endpoint = `${this.partnerBasePath}/cinema/${cinemaId}/screens`;
      const response = await client.post<CreatePartnerScreenResponse>(endpoint, payload);
      return response.data;
    } catch (error) {
      throw handlePartnerScreenError(error, "Đã xảy ra lỗi hệ thống khi tạo phòng.");
    }
  }

  async updateScreen(
    screenId: number,
    payload: UpdatePartnerScreenRequest
  ): Promise<UpdatePartnerScreenResponse> {
    if (!screenId || screenId <= 0) {
      throw new PartnerScreenApiError("Vui lòng chọn phòng chiếu hợp lệ.");
    }

    try {
      const client = createPartnerScreenRequest();
      const response = await client.put<UpdatePartnerScreenResponse>(
        `${this.partnerBasePath}/screens/${screenId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw handlePartnerScreenError(error, "Đã xảy ra lỗi hệ thống khi cập nhật phòng.");
    }
  }

  async deleteScreen(screenId: number): Promise<DeletePartnerScreenResponse> {
    if (!screenId || screenId <= 0) {
      throw new PartnerScreenApiError("Vui lòng chọn phòng chiếu hợp lệ.");
    }

    try {
      const client = createPartnerScreenRequest();
      const response = await client.delete<DeletePartnerScreenResponse>(
        `${this.partnerBasePath}/screens/${screenId}`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerScreenError(error, "Đã xảy ra lỗi hệ thống khi vô hiệu hoá phòng.");
    }
  }
}

export const partnerScreenService = new PartnerScreenService();

export const useGetPartnerScreens = (
  cinemaId?: number,
  params: GetPartnerScreensParams = {}
) => {
  return useQuery({
    queryKey: ["partner-screens", cinemaId, params],
    queryFn: () => partnerScreenService.getScreens(cinemaId!, params),
    enabled: typeof cinemaId === "number" && cinemaId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnerScreenById = (screenId?: number) => {
  return useQuery({
    queryKey: ["partner-screen", screenId],
    queryFn: () => partnerScreenService.getScreenById(screenId!),
    enabled: typeof screenId === "number" && screenId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerScreens = () => {
  const queryClient = useQueryClient();

  return (cinemaId: number, params: GetPartnerScreensParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-screens", cinemaId, params],
      queryFn: () => partnerScreenService.getScreens(cinemaId, params),
    });
};

export const useInvalidatePartnerScreens = () => {
  const queryClient = useQueryClient();

  return (cinemaId?: number, params?: GetPartnerScreensParams) => {
    if (cinemaId !== undefined) {
      queryClient.invalidateQueries({ queryKey: ["partner-screens", cinemaId, params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-screens"] });
    }
  };
};

export const useCreatePartnerScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      cinemaId,
      payload,
    }: {
      cinemaId: number;
      payload: CreatePartnerScreenRequest;
    }) => partnerScreenService.createScreen(cinemaId, payload),
    onSuccess: (response, variables) => {
      const { cinemaId } = variables;
      queryClient.invalidateQueries({ queryKey: ["partner-screens", cinemaId], exact: false });
      if (response?.result?.screenId) {
        queryClient.setQueryData(
          ["partner-screen", response.result.screenId],
          response
        );
      }
    },
  });
};

export const useUpdatePartnerScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      screenId,
      payload,
    }: {
      screenId: number;
      payload: UpdatePartnerScreenRequest;
    }) => partnerScreenService.updateScreen(screenId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partner-screens"], exact: false });
      if (variables?.screenId) {
        queryClient.setQueryData(["partner-screen", variables.screenId], response);
      }
    },
  });
};

export const useDeletePartnerScreen = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (screenId: number) => partnerScreenService.deleteScreen(screenId),
    onSuccess: (_, screenId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-screens"], exact: false });
      if (screenId !== undefined) {
        queryClient.removeQueries({ queryKey: ["partner-screen", screenId] });
      }
    },
  });
};
