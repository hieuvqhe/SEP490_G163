import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import { useQuery } from "@tanstack/react-query";
import axios from "axios";

// Tạo axios instance với Authorization header
const createAuthenticatedRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};

export const handleApiError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Yêu cầu đăng nhập để lấy danh sách voucher.");
    } else if (status === 500) {
      throw new Error("Đã xảy ra lỗi hệ thống khi lấy danh sách voucher");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

const userTicketsApi = createAuthenticatedRequest();

export interface GetAllOrdersParams {
  status?: string;
  fromDate?: string;
  toDate?: string;
  page?: number;
  pageSize?: number;
}

export interface OrderItem {
  bookingId: number;
  bookingCode: string;
  bookingTime: string;
  status: "PENDING" | "COMPLETED" | "CANCELLED" | "PAID";
  state: "PENDING" | "COMPLETED" | "CANCELLED" | "PAID";
  paymentStatus: "PENDING" | "COMPLETED" | "CANCELLED" | "PAID";
  totalAmount: number;
  ticketCount: number;
  showtime: {
    showtimeId: number;
    showDatetime: string;
    formatType: string;
  };
  movie: {
    movieId: number;
    title: string;
    durationMinutes: number;
    posterUrl: string;
  };
  cinema: {
    cinemaId: number;
    cinemaName: string;
    address: string;
    city: string;
    district: string;
  };
}

export interface GetAllUserOrdersRes {
  message: string;
  result: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: OrderItem[];
  };
}

export interface GetOrderByIdRes {
  message: string;
  result: {
    booking: {
      bookingId: number;
      bookingCode: string;
      bookingTime: string;
      totalAmount: number;
      ticketsTotal: number;
      combosTotal: number;
      status: string;
      state: string;
      paymentStatus: string;
      paymentProvider: string;
      paymentTxId: string;
      voucherId: number | null;
      orderCode: string;
      sessionId: string;
      createdAt: string;
      updatedAt: string;
    };

    showtime: {
      showtimeId: number;
      showDatetime: string;
      endTime: string;
      status: string;
      basePrice: number;
      formatType: string;
    };

    movie: {
      movieId: number;
      title: string;
      genre: string;
      durationMinutes: number;
      language: string;
      director: string;
      country: string;
      posterUrl: string;
      bannerUrl: string;
      description: string;
    };

    cinema: {
      cinemaId: number;
      cinemaName: string;
      address: string;
      city: string;
      district: string;
      phone: string;
      email: string;
    };

    tickets: {
      ticketId: number;
      price: number;
      status: string;
      checkInStatus: string;
      checkInTime: string | null;
      seat: {
        seatId: number;
        rowCode: string;
        seatNumber: number;
        seatName: string;
        seatTypeName: string;
      };
    }[];

    combos: {
      serviceId: number;
      serviceName: string;
      quantity: number;
      unitPrice: number;
      subTotal: number;
    }[];

    voucher?: {
      voucherId: number;
      voucherCode: string;
      discountType: "percent" | "fixed" | string;
      discountVal: number;
    } | null;
  };
}

export interface GetUserTicketsParams {
  type?: "upcoming" | "past" | "all";
  page?: number;
  pageSize?: number;
}

export interface GetUserTicketsRes {
  message: string;
  result: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: {
      ticketId: number;
      price: number;
      status: string;
      checkInStatus: string;
      checkInTime: string | null;
      ticketQR: string;

      booking: {
        bookingId: number;
        bookingCode: string;
        paymentStatus: string;
      };

      movie: {
        movieId: number;
        title: string;
        durationMinutes: number;
        posterUrl: string;
        genre: string;
      };

      cinema: {
        cinemaId: number;
        cinemaName: string;
        address: string;
        city: string;
        district: string;
      };

      showtime: {
        showtimeId: number;
        showDatetime: string;
        endTime: string;
        formatType: string;
        status: string;
      };

      seat: {
        seatId: number;
        rowCode: string;
        seatNumber: number;
        seatName: string;
        seatTypeName: string;
      };
    }[];
  };
}

class UserTicketsApi {
  getAllUserOrders = async (
    params?: GetAllOrdersParams
  ): Promise<GetAllUserOrdersRes> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        if (params.status) queryParams.append("status", params.status);
        if (params.fromDate) queryParams.append("fromDate", params.fromDate);
        if (params.toDate) queryParams.append("toDate", params.toDate);
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.pageSize)
          queryParams.append("pageSize", params.pageSize.toString());
      }

      const url = `/api/User/orders?${queryParams.toString()}`;
      const res = await userTicketsApi.get(url);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  getOrderById = async (bookingId: number): Promise<GetOrderByIdRes> => {
    try {
      const res = await userTicketsApi.get(`/api/User/orders/${bookingId}`);
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };

  getUserTickets = async (
    params: GetUserTicketsParams
  ): Promise<GetUserTicketsRes> => {
    try {
      const queryParams = new URLSearchParams();
      if (params) {
        if (params.type) queryParams.append("type", params.type.toString());
        if (params.page) queryParams.append("page", params.page.toString());
        if (params.pageSize)
          queryParams.append("pageSize", params.pageSize.toString());
      }

      const url = `/api/User/tickets?${queryParams.toString()}`;
      const res = await userTicketsApi.get(url);
      
      return res.data;
    } catch (error) {
      throw handleApiError(error);
    }
  };
}

const userTicketsService = new UserTicketsApi();

export const useGetAllUserOrders = (params?: GetAllOrdersParams) => {
  return useQuery<GetAllUserOrdersRes>({
    queryKey: ["user-orders", params],
    queryFn: () => userTicketsService.getAllUserOrders(params),
    placeholderData: (previousData) => previousData,
  });
};

export const useGetOrderById = (bookingId?: number) => {
  return useQuery<GetOrderByIdRes>({
    queryKey: ["order-detail", bookingId],
    queryFn: () => userTicketsService.getOrderById(bookingId!),
    enabled: !!bookingId, // chỉ gọi khi có bookingId
  });
};

export const useGetUserTickets = (params: GetUserTicketsParams) => {
  return useQuery<GetUserTicketsRes>({
    queryKey: ["user-tickets", params],
    queryFn: () => userTicketsService.getUserTickets(params),
    placeholderData: (previousData) => previousData,
  });
};
