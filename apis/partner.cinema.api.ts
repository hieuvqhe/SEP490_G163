import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PartnerCinema {
  cinemaId: number;
  partnerId: number;
  cinemaName: string;
  address: string;
  phone: string;
  code: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  email: string;
  isActive: boolean;
  logoUrl: string | null;
  createdAt: string;
  updatedAt: string;
  totalScreens: number;
  activeScreens: number;
}

export type PartnerCinemaDetail = PartnerCinema;

export interface PartnerCinemasPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetPartnerCinemasResponse {
  message: string;
  result: {
    cinemas: PartnerCinema[];
    pagination: PartnerCinemasPagination;
  };
}

export interface GetPartnerCinemaByIdResponse {
  message: string;
  result: PartnerCinemaDetail;
}

export interface CreatePartnerCinemaRequest {
  cinemaName: string;
  address: string;
  phone: string;
  code: string;
  city: string;
  district: string;
  latitude: number;
  longitude: number;
  email: string;
  isActive?: boolean;
  logoUrl?: string | null;
  totalScreens?: number;
  activeScreens?: number;
}

export type UpdatePartnerCinemaRequest = Partial<CreatePartnerCinemaRequest>;

export interface CreatePartnerCinemaResponse {
  message: string;
  result: PartnerCinemaDetail;
}

export interface UpdatePartnerCinemaResponse {
  message: string;
  result: PartnerCinemaDetail;
}

export interface DeletePartnerCinemaResponse {
  message: string;
  result?: {
    cinemaId: number;
  };
}

export interface GetPartnerCinemasParams {
  page?: number;
  limit?: number;
  city?: string;
  district?: string;
  isActive?: boolean;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class PartnerCinemaApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerCinemaApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerCinemaRequest = () => {
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

const handlePartnerCinemaError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy danh sách rạp."
): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      (typeof data?.message === "string" && data?.message.trim() !== "")
        ? (data?.message as string)
        : status === 401 || status === 403
          ? "Xác thực thất bại"
          : fallbackMessage;
    const errors = (data?.errors && typeof data?.errors === "object")
      ? (data?.errors as Record<string, unknown>)
      : undefined;

    throw new PartnerCinemaApiError(message, status, errors);
  }

  throw new PartnerCinemaApiError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
};

class PartnerCinemaService {
  private readonly basePath = "/partners/cinemas";

  async getCinemas(params: GetPartnerCinemasParams = {}): Promise<GetPartnerCinemasResponse> {
    try {
      const client = createPartnerCinemaRequest();
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.city) queryParams.append("city", params.city);
      if (params.district) queryParams.append("district", params.district);
      if (params.isActive !== undefined) queryParams.append("isActive", String(params.isActive));
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const endpoint = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await client.get<GetPartnerCinemasResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerCinemaError(error);
    }
  }

  async getCinemaById(cinemaId: number): Promise<GetPartnerCinemaByIdResponse> {
    try {
      const client = createPartnerCinemaRequest();
      const response = await client.get<GetPartnerCinemaByIdResponse>(`${this.basePath}/${cinemaId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerCinemaError(error);
    }
  }

  async createCinema(data: CreatePartnerCinemaRequest): Promise<CreatePartnerCinemaResponse> {
    try {
      const client = createPartnerCinemaRequest();
      const response = await client.post<CreatePartnerCinemaResponse>(this.basePath, data);
      return response.data;
    } catch (error) {
      throw handlePartnerCinemaError(error);
    }
  }

  async updateCinema(cinemaId: number, data: UpdatePartnerCinemaRequest): Promise<UpdatePartnerCinemaResponse> {
    try {
      const client = createPartnerCinemaRequest();
      const response = await client.put<UpdatePartnerCinemaResponse>(`${this.basePath}/${cinemaId}`, data);
      return response.data;
    } catch (error) {
      throw handlePartnerCinemaError(error);
    }
  }

  async deleteCinema(cinemaId: number): Promise<DeletePartnerCinemaResponse> {
    try {
      const client = createPartnerCinemaRequest();
      const response = await client.delete<DeletePartnerCinemaResponse>(`${this.basePath}/${cinemaId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerCinemaError(error);
    }
  }
}

export const partnerCinemaService = new PartnerCinemaService();

export const useGetPartnerCinemas = (params: GetPartnerCinemasParams = {}) => {
  return useQuery({
    queryKey: ["partner-cinemas", params],
    queryFn: () => partnerCinemaService.getCinemas(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnerCinemaById = (cinemaId?: number) => {
  return useQuery({
    queryKey: ["partner-cinema", cinemaId],
    queryFn: () => partnerCinemaService.getCinemaById(cinemaId!),
    enabled: !!cinemaId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerCinemas = () => {
  const queryClient = useQueryClient();

  return (params: GetPartnerCinemasParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-cinemas", params],
      queryFn: () => partnerCinemaService.getCinemas(params),
    });
};

export const useInvalidatePartnerCinemas = () => {
  const queryClient = useQueryClient();

  return (params?: GetPartnerCinemasParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: ["partner-cinemas", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-cinemas"] });
    }
  };
};

export const useCreatePartnerCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerCinemaRequest) => partnerCinemaService.createCinema(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["partner-cinemas"] });
      if (response?.result?.cinemaId) {
        queryClient.setQueryData(["partner-cinema", response.result.cinemaId], response);
      }
    },
  });
};

export const useUpdatePartnerCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ cinemaId, payload }: { cinemaId: number; payload: UpdatePartnerCinemaRequest }) =>
      partnerCinemaService.updateCinema(cinemaId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partner-cinemas"] });
      if (variables?.cinemaId) {
        queryClient.invalidateQueries({ queryKey: ["partner-cinema", variables.cinemaId] });
        queryClient.setQueryData(["partner-cinema", variables.cinemaId], response);
      }
    },
  });
};

export const useDeletePartnerCinema = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (cinemaId: number) => partnerCinemaService.deleteCinema(cinemaId),
    onSuccess: (_, cinemaId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-cinemas"] });
      if (cinemaId !== undefined) {
        queryClient.removeQueries({ queryKey: ["partner-cinema", cinemaId] });
      }
    },
  });
};
