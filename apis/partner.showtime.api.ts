import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type PartnerShowtimeStatus = "scheduled" | "finished";

export interface PartnerShowtimeMovie {
  movieId: number;
  title: string;
  description?: string;
  posterUrl?: string;
  duration?: number;
  genre?: string;
  language?: string;
  releaseDate?: string;
  endDate?: string;
}

export interface PartnerShowtimeCinema {
  cinemaId: number;
  name: string;
  address?: string;
  city?: string;
  district?: string;
  email?: string;
}

export interface PartnerShowtimeScreen {
  screenId: number;
  name: string;
  screenType?: string;
  soundSystem?: string;
  description?: string;
  seatRows?: number;
  seatColumns?: number;
  capacity?: number;
}

export interface PartnerShowtime {
  showtimeId: number;
  movieId: number;
  screenId: number;
  cinemaId: number;
  startTime: string;
  endTime: string;
  basePrice: number | string;
  formatType: string;
  availableSeats: number;
  status: PartnerShowtimeStatus;
  movie?: PartnerShowtimeMovie;
  cinema?: PartnerShowtimeCinema;
  screen?: PartnerShowtimeScreen;
}

export interface PartnerShowtimesPagination {
  total: number;
  page: number;
  limit: number;
  totalPages: number;
}

export interface GetPartnerShowtimesResponse {
  message: string;
  result: {
    showtimes: PartnerShowtime[];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface GetPartnerShowtimeByIdResponse {
  message: string;
  result: PartnerShowtime;
}

export interface CreatePartnerShowtimeRequest {
  movieId: number;
  screenId: number;
  cinemaId: number;
  startTime: string;
  endTime: string;
  basePrice: number;
  availableSeats: number;
  formatType: string;
  status: PartnerShowtimeStatus;
}

export interface CreatePartnerShowtimeResponse {
  message: string;
  result: {
    showtimeId: number;
  };
}

export interface UpdatePartnerShowtimeRequest extends CreatePartnerShowtimeRequest {}

export interface UpdatePartnerShowtimeResponse {
  message: string;
  result: {
    showtimeId: number;
  };
}

export interface DeletePartnerShowtimeResponse {
  message: string;
  result?: {
    showtimeId: number;
  };
}

export interface GetPartnerShowtimesParams {
  page?: number;
  limit?: number;
  movieId?: number;
  cinemaId?: number;
  screenId?: number;
  date?: string;
  status?: PartnerShowtimeStatus;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export class PartnerShowtimeApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerShowtimeApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerShowtimeRequest = () => {
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

const handlePartnerShowtimeError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy danh sách suất chiếu."
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

    throw new PartnerShowtimeApiError(message, status, errors);
  }

  throw new PartnerShowtimeApiError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
};

class PartnerShowtimeService {
  private readonly partnerBasePath = "/partners";

  async getShowtimes(params: GetPartnerShowtimesParams = {}): Promise<GetPartnerShowtimesResponse> {
    try {
      const client = createPartnerShowtimeRequest();
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.movieId !== undefined) queryParams.append("movie_id", params.movieId.toString());
      if (params.cinemaId !== undefined) queryParams.append("cinema_id", params.cinemaId.toString());
      if (params.screenId !== undefined) queryParams.append("screen_id", params.screenId.toString());
      if (params.date) queryParams.append("date", params.date);
      if (params.status) queryParams.append("status", params.status);
      if (params.sortBy) queryParams.append("sort_by", params.sortBy);
      if (params.sortOrder) queryParams.append("sort_order", params.sortOrder);

      const endpoint = `${this.partnerBasePath}/showtimes${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await client.get<GetPartnerShowtimesResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerShowtimeError(error);
    }
  }

  async getShowtimeById(showtimeId: number): Promise<GetPartnerShowtimeByIdResponse> {
    if (!showtimeId || showtimeId <= 0) {
      throw new PartnerShowtimeApiError("Vui lòng chọn suất chiếu hợp lệ.");
    }

    try {
      const client = createPartnerShowtimeRequest();
      const response = await client.get<GetPartnerShowtimeByIdResponse>(
        `${this.partnerBasePath}/showtimes/${showtimeId}`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerShowtimeError(error, "Đã xảy ra lỗi hệ thống khi lấy thông tin suất chiếu.");
    }
  }

  async createShowtime(payload: CreatePartnerShowtimeRequest): Promise<CreatePartnerShowtimeResponse> {
    try {
      const client = createPartnerShowtimeRequest();
      const response = await client.post<CreatePartnerShowtimeResponse>(
        `${this.partnerBasePath}/showtimes`,
        payload
      );
      return response.data;
    } catch (error) {
      throw handlePartnerShowtimeError(error, "Đã xảy ra lỗi hệ thống khi tạo suất chiếu.");
    }
  }

  async updateShowtime(
    showtimeId: number,
    payload: UpdatePartnerShowtimeRequest
  ): Promise<UpdatePartnerShowtimeResponse> {
    if (!showtimeId || showtimeId <= 0) {
      throw new PartnerShowtimeApiError("Vui lòng chọn suất chiếu hợp lệ.");
    }

    try {
      const client = createPartnerShowtimeRequest();
      const response = await client.put<UpdatePartnerShowtimeResponse>(
        `${this.partnerBasePath}/showtimes/${showtimeId}`,
        payload
      );
      return response.data;
    } catch (error) {
      throw handlePartnerShowtimeError(error, "Đã xảy ra lỗi hệ thống khi cập nhật suất chiếu.");
    }
  }

  async deleteShowtime(showtimeId: number): Promise<DeletePartnerShowtimeResponse> {
    if (!showtimeId || showtimeId <= 0) {
      throw new PartnerShowtimeApiError("Vui lòng chọn suất chiếu hợp lệ.");
    }

    try {
      const client = createPartnerShowtimeRequest();
      const response = await client.delete<DeletePartnerShowtimeResponse>(
        `${this.partnerBasePath}/showtimes/${showtimeId}`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerShowtimeError(error, "Đã xảy ra lỗi hệ thống khi xoá suất chiếu.");
    }
  }
}

export const partnerShowtimeService = new PartnerShowtimeService();

export const useGetPartnerShowtimes = (
  params: GetPartnerShowtimesParams = {},
  options?: { enabled?: boolean }
) => {
  return useQuery({
    queryKey: [
      "partner-showtimes",
      params.page ?? null,
      params.limit ?? null,
      params.movieId ?? null,
      params.cinemaId ?? null,
      params.screenId ?? null,
      params.date ?? null,
      params.status ?? null,
      params.sortBy ?? null,
      params.sortOrder ?? null,
    ],
    queryFn: () => partnerShowtimeService.getShowtimes(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
    enabled: options?.enabled ?? true,
  });
};

export const useGetPartnerShowtimeById = (showtimeId?: number) => {
  return useQuery({
    queryKey: ["partner-showtime", showtimeId],
    queryFn: () => partnerShowtimeService.getShowtimeById(showtimeId!),
    enabled: typeof showtimeId === "number" && showtimeId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerShowtimes = () => {
  const queryClient = useQueryClient();

  return (params: GetPartnerShowtimesParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: [
        "partner-showtimes",
        params.page ?? null,
        params.limit ?? null,
        params.movieId ?? null,
        params.cinemaId ?? null,
        params.screenId ?? null,
        params.date ?? null,
        params.status ?? null,
        params.sortBy ?? null,
        params.sortOrder ?? null,
      ],
      queryFn: () => partnerShowtimeService.getShowtimes(params),
    });
};

export const useInvalidatePartnerShowtimes = () => {
  const queryClient = useQueryClient();

  return (params?: GetPartnerShowtimesParams) => {
    if (params) {
      queryClient.invalidateQueries({
        queryKey: [
          "partner-showtimes",
          params.page ?? null,
          params.limit ?? null,
          params.movieId ?? null,
          params.cinemaId ?? null,
          params.screenId ?? null,
          params.date ?? null,
          params.status ?? null,
          params.sortBy ?? null,
          params.sortOrder ?? null,
        ],
      });
      return;
    }

    queryClient.invalidateQueries({ queryKey: ["partner-showtimes"] });
  };
};

export const useCreatePartnerShowtime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerShowtimeRequest) =>
      partnerShowtimeService.createShowtime(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["partner-showtimes"], exact: false });
      if (response?.result?.showtimeId) {
        queryClient.invalidateQueries({ queryKey: ["partner-showtime", response.result.showtimeId] });
      }
    },
  });
};

export const useUpdatePartnerShowtime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      showtimeId,
      payload,
    }: {
      showtimeId: number;
      payload: UpdatePartnerShowtimeRequest;
    }) => partnerShowtimeService.updateShowtime(showtimeId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partner-showtimes"], exact: false });
      if (variables?.showtimeId) {
        queryClient.invalidateQueries({ queryKey: ["partner-showtime", variables.showtimeId] });
      }
      if (response?.result?.showtimeId) {
        queryClient.invalidateQueries({ queryKey: ["partner-showtime", response.result.showtimeId] });
      }
    },
  });
};

export const useDeletePartnerShowtime = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (showtimeId: number) => partnerShowtimeService.deleteShowtime(showtimeId),
    onSuccess: (_, showtimeId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-showtimes"], exact: false });
      if (showtimeId !== undefined) {
        queryClient.removeQueries({ queryKey: ["partner-showtime", showtimeId] });
      }
    },
  });
};
