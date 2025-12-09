import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

export interface BookingCustomer {
  customerId: number;
  userId: number;
  fullname: string;
  email: string;
  phone: string;
}

export interface BookingShowtime {
  showtimeId: number;
  showDatetime: string;
  endTime: string;
  formatType: string;
  status: string;
}

export interface BookingCinema {
  cinemaId: number;
  cinemaName: string;
  address: string;
  city: string;
  district: string;
}

export interface BookingMovie {
  movieId: number;
  title: string;
  durationMinutes: number;
  posterUrl: string;
  genre: string;
}

export interface BookingTicket {
  ticketId: number;
  seatId: number;
  seatName: string;
  rowCode: string;
  seatNumber: number;
  price: number;
  status: string;
}

export interface BookingServiceOrder {
  orderId: number;
  serviceId: number;
  serviceName: string;
  serviceCode: string;
  quantity: number;
  unitPrice: number;
  subTotal: number;
}

export interface PartnerBooking {
  bookingId: number;
  bookingCode: string;
  bookingTime: string;
  totalAmount: number;
  status: string;
  state: string;
  paymentStatus: string;
  paymentProvider: string;
  paymentTxId: string;
  orderCode: string;
  createdAt: string;
  updatedAt: string;
  ticketCount: number;
  customer: BookingCustomer;
  showtime: BookingShowtime;
  cinema: BookingCinema;
  movie: BookingMovie;
}

export interface PartnerBookingDetail {
  bookingId: number;
  bookingCode: string;
  bookingTime: string;
  totalAmount: number;
  status: string;
  state: string;
  paymentStatus: string;
  paymentProvider: string;
  paymentTxId: string;
  orderCode: string;
  createdAt: string;
  updatedAt: string;
  customer: BookingCustomer;
  showtime: BookingShowtime;
  cinema: BookingCinema;
  movie: BookingMovie;
  voucher: unknown | null;
  tickets: BookingTicket[];
  serviceOrders: BookingServiceOrder[];
}

export interface GetPartnerBookingsResponse {
  message: string;
  result: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: PartnerBooking[];
  };
}

export interface GetPartnerBookingByIdResponse {
  message: string;
  result: PartnerBookingDetail;
}

export interface GetPartnerBookingsParams {
  cinemaId?: number;
  status?: string;
  paymentStatus?: string;
  fromDate?: string;
  toDate?: string;
  customerId?: number;
  customerEmail?: string;
  customerPhone?: string;
  bookingCode?: string;
  page?: number;
  pageSize?: number;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface GetPartnerBookingStatisticsParams {
  fromDate?: string;
  toDate?: string;
  cinemaId?: number;
  groupBy?: string;
  includeComparison?: boolean;
  topLimit?: number;
  page?: number;
  pageSize?: number;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CinemaRevenueItem {
  cinemaId: number;
  cinemaName: string;
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  averageOrderValue: number;
  city: string;
  district: string;
  address: string;
}

export interface MovieStatItem {
  movieId: number;
  title: string;
  genre: string;
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  showtimeCount: number;
}

export interface CustomerStatItem {
  customerId: number;
  userId: number;
  fullname: string;
  email: string;
  phone: string;
  totalSpent: number;
  totalBookings: number;
  totalTicketsPurchased: number;
  averageOrderValue: number;
  lastBookingDate: string;
}

export interface ServiceStatItem {
  serviceId: number;
  serviceName: string;
  totalQuantity: number;
  totalRevenue: number;
  bookingCount: number;
}

export interface SeatTypeStatItem {
  seatTypeId: number;
  seatTypeName: string;
  totalTicketsSold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface ShowtimeStatItem {
  showtimeId: number;
  showDatetime: string;
  formatType: string;
  movieTitle: string;
  cinemaName: string;
  totalRevenue: number;
  totalTicketsSold: number;
  occupancyRate: number;
}

export interface PaymentProviderItem {
  provider: string;
  bookingCount: number;
  totalAmount: number;
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
  bookingCount: number;
  ticketCount: number;
}

export interface TimeMetrics {
  bookings: number;
  revenue: number;
  tickets: number;
  customers: number;
}

export interface BookingStatisticsOverview {
  totalBookings: number;
  totalRevenue: number;
  totalPaidBookings: number;
  totalPendingBookings: number;
  totalCancelledBookings: number;
  totalTicketsSold: number;
  totalCustomers: number;
  averageOrderValue: number;
  bookingsByStatus: Record<string, number>;
  revenueByStatus: Record<string, number>;
  bookingsByPaymentStatus: Record<string, number>;
}

export interface CinemaRevenueStatistics {
  cinemaRevenueList: CinemaRevenueItem[];
  topCinemasByRevenue: CinemaRevenueItem[];
  comparison: {
    highestRevenueCinema: CinemaRevenueItem;
    lowestRevenueCinema: CinemaRevenueItem;
    averageRevenuePerCinema: number;
  };
  pagination: Pagination;
}

export interface MovieStatistics {
  topMoviesByRevenue: MovieStatItem[];
  topMoviesByTickets: MovieStatItem[];
  paginationByRevenue: Pagination;
  paginationByTickets: Pagination;
}

export interface TimeStatistics {
  today: TimeMetrics;
  yesterday: TimeMetrics;
  thisWeek: TimeMetrics;
  thisMonth: TimeMetrics;
  thisYear: TimeMetrics;
  revenueTrend: RevenueTrendItem[];
  periodComparison: unknown | null;
}

export interface TopCustomerStatistics {
  byRevenue: CustomerStatItem[];
  byBookingCount: CustomerStatItem[];
  paginationByRevenue: Pagination;
  paginationByBookingCount: Pagination;
}

export interface ServiceStatistics {
  totalServiceRevenue: number;
  totalServiceOrders: number;
  serviceRevenuePercentage: number;
  topServices: ServiceStatItem[];
}

export interface SeatStatistics {
  totalSeatsSold: number;
  totalSeatsAvailable: number;
  overallOccupancyRate: number;
  bySeatType: SeatTypeStatItem[];
}

export interface ShowtimeStatistics {
  totalShowtimes: number;
  showtimesWithBookings: number;
  showtimesWithoutBookings: number;
  topShowtimesByRevenue: ShowtimeStatItem[];
  pagination: Pagination;
}

export interface PaymentStatistics {
  paymentByProvider: PaymentProviderItem[];
  failedPaymentRate: number;
  pendingPaymentAmount: number;
}

export interface VoucherStatistics {
  totalVouchersUsed: number;
  totalVoucherDiscount: number;
  voucherUsageRate: number;
  mostUsedVouchers: unknown[];
}

export interface BookingStatisticsResult {
  overview: BookingStatisticsOverview;
  cinemaRevenue: CinemaRevenueStatistics;
  movieStatistics: MovieStatistics;
  timeStatistics: TimeStatistics;
  topCustomers: TopCustomerStatistics;
  serviceStatistics: ServiceStatistics;
  seatStatistics: SeatStatistics;
  showtimeStatistics: ShowtimeStatistics;
  paymentStatistics: PaymentStatistics;
  voucherStatistics: VoucherStatistics;
}

export interface GetPartnerBookingStatisticsResponse {
  message: string;
  result: BookingStatisticsResult;
}

export class PartnerBookingApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerBookingApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerBookingRequest = () => {
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

const handlePartnerBookingError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy danh sách đơn hàng."
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

    throw new PartnerBookingApiError(message, status, errors);
  }

  throw new PartnerBookingApiError(
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  );
};

class PartnerBookingService {
  private readonly basePath = "/partners/bookings";

  async getBookings(params: GetPartnerBookingsParams = {}): Promise<GetPartnerBookingsResponse> {
    try {
      const client = createPartnerBookingRequest();
      const queryParams = new URLSearchParams();

      if (params.cinemaId !== undefined) queryParams.append("cinemaId", params.cinemaId.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.paymentStatus) queryParams.append("paymentStatus", params.paymentStatus);
      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      if (params.customerId !== undefined) queryParams.append("customerId", params.customerId.toString());
      if (params.customerEmail) queryParams.append("customerEmail", params.customerEmail);
      if (params.customerPhone) queryParams.append("customerPhone", params.customerPhone);
      if (params.bookingCode) queryParams.append("bookingCode", params.bookingCode);
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const endpoint = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await client.get<GetPartnerBookingsResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerBookingError(error);
    }
  }

  async getBookingById(bookingId: number): Promise<GetPartnerBookingByIdResponse> {
    try {
      const client = createPartnerBookingRequest();
      const response = await client.get<GetPartnerBookingByIdResponse>(`${this.basePath}/${bookingId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerBookingError(error, "Không tìm thấy đơn đặt vé với ID đã cho.");
    }
  }

  async getStatistics(params: GetPartnerBookingStatisticsParams = {}): Promise<GetPartnerBookingStatisticsResponse> {
    try {
      const client = createPartnerBookingRequest();
      const queryParams = new URLSearchParams();

      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      if (params.cinemaId !== undefined) queryParams.append("cinemaId", params.cinemaId.toString());
      if (params.groupBy) queryParams.append("groupBy", params.groupBy);
      if (params.includeComparison !== undefined) queryParams.append("includeComparison", String(params.includeComparison));
      if (params.topLimit !== undefined) queryParams.append("topLimit", params.topLimit.toString());
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());

      const endpoint = `${this.basePath}/statistics${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await client.get<GetPartnerBookingStatisticsResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerBookingError(error, "Đã xảy ra lỗi hệ thống khi lấy thống kê đơn hàng.");
    }
  }
}

export const partnerBookingService = new PartnerBookingService();

export const useGetPartnerBookings = (params: GetPartnerBookingsParams = {}) => {
  return useQuery({
    queryKey: ["partner-bookings", params],
    queryFn: () => partnerBookingService.getBookings(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnerBookingById = (bookingId?: number) => {
  return useQuery({
    queryKey: ["partner-booking", bookingId],
    queryFn: () => partnerBookingService.getBookingById(bookingId!),
    enabled: !!bookingId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerBookings = () => {
  const queryClient = useQueryClient();

  return (params: GetPartnerBookingsParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-bookings", params],
      queryFn: () => partnerBookingService.getBookings(params),
    });
};

export const useInvalidatePartnerBookings = () => {
  const queryClient = useQueryClient();

  return (params?: GetPartnerBookingsParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: ["partner-bookings", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-bookings"] });
    }
  };
};

export const useGetPartnerBookingStatistics = (params: GetPartnerBookingStatisticsParams = {}) => {
  return useQuery({
    queryKey: ["partner-booking-statistics", params],
    queryFn: () => partnerBookingService.getStatistics(params),
    staleTime: 2 * 60 * 1000, // 2 minutes for statistics
    gcTime: 5 * 60 * 1000,
  });
};
