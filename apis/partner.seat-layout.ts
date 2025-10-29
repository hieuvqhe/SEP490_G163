import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface PartnerSeatLayoutSeatMap {
  seatMapId: number;
  screenId: number;
  totalRows: number;
  totalColumns: number;
  updatedAt: string;
  hasLayout: boolean;
}

export interface PartnerSeatLayoutSeat {
  seatId: number;
  row: string;
  column: number;
  seatTypeId: number;
  seatTypeCode: string;
  seatTypeName: string;
  seatTypeColor: string;
  status: string;
}

export interface PartnerSeatLayoutSeatType {
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

export interface GetPartnerSeatLayoutResponse {
  message: string;
  result: {
    seatMap: PartnerSeatLayoutSeatMap;
    seats: PartnerSeatLayoutSeat[];
    availableSeatTypes: PartnerSeatLayoutSeatType[];
  };
}

export class PartnerSeatLayoutApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerSeatLayoutApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerSeatLayoutRequest = () => {
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

const handlePartnerSeatLayoutError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy layout ghế."
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

    throw new PartnerSeatLayoutApiError(message, status, errors);
  }

  throw new PartnerSeatLayoutApiError(
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  );
};

class PartnerSeatLayoutService {
  private readonly partnerBasePath = "/partners";

  async getSeatLayout(screenId: number): Promise<GetPartnerSeatLayoutResponse> {
    if (!screenId || screenId <= 0) {
      throw new PartnerSeatLayoutApiError("Vui lòng chọn phòng chiếu hợp lệ.");
    }

    try {
      const client = createPartnerSeatLayoutRequest();
      const response = await client.get<GetPartnerSeatLayoutResponse>(
        `${this.partnerBasePath}/screens/${screenId}/seat-layout`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerSeatLayoutError(
        error,
        "Không tìm thấy phòng chiếu với ID này hoặc không thuộc quyền quản lý của bạn"
      );
    }
  }
}

export const partnerSeatLayoutService = new PartnerSeatLayoutService();

export const useGetPartnerSeatLayout = (screenId?: number) => {
  return useQuery({
    queryKey: ["partner-seat-layout", screenId],
    queryFn: () => partnerSeatLayoutService.getSeatLayout(screenId!),
    enabled: typeof screenId === "number" && screenId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerSeatLayout = () => {
  const queryClient = useQueryClient();

  return (screenId: number) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-seat-layout", screenId],
      queryFn: () => partnerSeatLayoutService.getSeatLayout(screenId),
    });
};

export const useInvalidatePartnerSeatLayout = () => {
  const queryClient = useQueryClient();

  return (screenId?: number) => {
    if (screenId !== undefined) {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-layout", screenId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-seat-layout"] });
    }
  };
};
