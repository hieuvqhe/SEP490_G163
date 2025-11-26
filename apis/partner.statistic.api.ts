import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useQuery, useQueryClient } from "@tanstack/react-query";

// ==================== INTERFACES ====================

export interface BookingStatisticsPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface BookingOverview {
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

export interface CinemaRevenueComparison {
  highestRevenueCinema: CinemaRevenueItem | null;
  lowestRevenueCinema: CinemaRevenueItem | null;
  averageRevenuePerCinema: number;
}

export interface CinemaRevenue {
  cinemaRevenueList: CinemaRevenueItem[];
  topCinemasByRevenue: CinemaRevenueItem[];
  comparison: CinemaRevenueComparison;
  pagination: BookingStatisticsPagination;
}

export interface MovieStatisticItem {
  movieId: number;
  title: string;
  genre: string;
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  showtimeCount: number;
}

export interface MovieStatistics {
  topMoviesByRevenue: MovieStatisticItem[];
  topMoviesByTickets: MovieStatisticItem[];
  paginationByRevenue: BookingStatisticsPagination;
  paginationByTickets: BookingStatisticsPagination;
}

export interface TimeStatisticPeriod {
  bookings: number;
  revenue: number;
  tickets: number;
  customers: number;
}

export interface RevenueTrendItem {
  date: string;
  revenue: number;
  bookingCount: number;
  ticketCount: number;
}

export interface PeriodComparison {
  currentPeriod: TimeStatisticPeriod;
  previousPeriod: TimeStatisticPeriod;
  revenueChange: number;
  revenueChangePercentage: number;
  bookingsChange: number;
  bookingsChangePercentage: number;
  ticketsChange: number;
  ticketsChangePercentage: number;
}

export interface TimeStatistics {
  today: TimeStatisticPeriod;
  yesterday: TimeStatisticPeriod;
  thisWeek: TimeStatisticPeriod;
  thisMonth: TimeStatisticPeriod;
  thisYear: TimeStatisticPeriod;
  revenueTrend: RevenueTrendItem[];
  periodComparison: PeriodComparison | null;
}

export interface CustomerStatisticItem {
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

export interface TopCustomers {
  byRevenue: CustomerStatisticItem[];
  byBookingCount: CustomerStatisticItem[];
  paginationByRevenue: BookingStatisticsPagination;
  paginationByBookingCount: BookingStatisticsPagination;
}

export interface ServiceStatisticItem {
  serviceId: number;
  serviceName: string;
  totalQuantity: number;
  totalRevenue: number;
  bookingCount: number;
}

export interface ServiceStatistics {
  totalServiceRevenue: number;
  totalServiceOrders: number;
  serviceRevenuePercentage: number;
  topServices: ServiceStatisticItem[];
}

export interface SeatTypeStatistic {
  seatTypeId: number;
  seatTypeName: string;
  totalTicketsSold: number;
  totalRevenue: number;
  averagePrice: number;
}

export interface SeatStatistics {
  totalSeatsSold: number;
  totalSeatsAvailable: number;
  overallOccupancyRate: number;
  bySeatType: SeatTypeStatistic[];
}

export interface ShowtimeStatisticItem {
  showtimeId: number;
  showDatetime: string;
  formatType: string;
  movieTitle: string;
  cinemaName: string;
  totalRevenue: number;
  totalTicketsSold: number;
  occupancyRate: number;
}

export interface ShowtimeStatistics {
  totalShowtimes: number;
  showtimesWithBookings: number;
  showtimesWithoutBookings: number;
  topShowtimesByRevenue: ShowtimeStatisticItem[];
  pagination: BookingStatisticsPagination;
}

export interface PaymentProviderStatistic {
  provider: string;
  bookingCount: number;
  totalAmount: number;
}

export interface PaymentStatistics {
  paymentByProvider: PaymentProviderStatistic[];
  failedPaymentRate: number;
  pendingPaymentAmount: number;
}

export interface VoucherUsageItem {
  voucherId: number;
  voucherCode: string;
  usageCount: number;
  totalDiscount: number;
}

export interface VoucherStatistics {
  totalVouchersUsed: number;
  totalVoucherDiscount: number;
  voucherUsageRate: number;
  mostUsedVouchers: VoucherUsageItem[];
}

export interface BookingStatisticsResult {
  overview: BookingOverview;
  cinemaRevenue: CinemaRevenue;
  movieStatistics: MovieStatistics;
  timeStatistics: TimeStatistics;
  topCustomers: TopCustomers;
  serviceStatistics: ServiceStatistics;
  seatStatistics: SeatStatistics;
  showtimeStatistics: ShowtimeStatistics;
  paymentStatistics: PaymentStatistics;
  voucherStatistics: VoucherStatistics;
}

export interface GetBookingStatisticsResponse {
  message: string;
  result: BookingStatisticsResult;
}

export interface GetBookingStatisticsParams {
  fromDate?: string;
  toDate?: string;
  cinemaId?: number;
  groupBy?: "day" | "week" | "month" | "year";
  includeComparison?: boolean;
  topLimit?: number;
  page?: number;
  pageSize?: number;
}

// ==================== STAFF PERFORMANCE INTERFACES ====================

export interface StaffPerformanceItem {
  employeeId: number;
  employeeName: string;
  email: string;
  roleType: "Staff" | "Marketing" | "Cashier";
  hireDate: string;
  isActive: boolean;
  totalBookings: number;
  totalRevenue: number;
  averageBookingValue: number;
  cinemaCount: number;
  cinemaIds: number[];
  cinemaNames: string[];
  totalTicketsSold: number;
  rank: number;
}

export interface StaffPerformanceSummary {
  totalStaff: number;
  totalBookings: number;
  totalRevenue: number;
  averageRevenuePerStaff: number;
  bestPerformer: StaffPerformanceItem | null;
}

export interface StaffPerformanceResult {
  staffPerformance: StaffPerformanceItem[];
  summary: StaffPerformanceSummary;
}

export interface GetStaffPerformanceResponse {
  message: string;
  result: StaffPerformanceResult;
}

export interface GetStaffPerformanceDetailResponse {
  message: string;
  result: StaffPerformanceItem;
}

export interface GetStaffPerformanceParams {
  fromDate?: string;
  toDate?: string;
  topLimit?: number;
}

export interface GetStaffPerformanceDetailParams {
  fromDate?: string;
  toDate?: string;
}

// ==================== ERROR HANDLING ====================

export class PartnerStatisticApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerStatisticApiError";
    this.status = status;
    this.errors = errors;
  }
}

// ==================== REQUEST HELPER ====================

const createPartnerStatisticRequest = () => {
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

const handlePartnerStatisticError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi lấy thống kê."
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

    throw new PartnerStatisticApiError(message, status, errors);
  }

  throw new PartnerStatisticApiError("Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.");
};

// ==================== SERVICE CLASS ====================

class PartnerStatisticService {
  private readonly partnerBasePath = "/partners";

  async getBookingStatistics(
    params: GetBookingStatisticsParams = {}
  ): Promise<GetBookingStatisticsResponse> {
    try {
      const client = createPartnerStatisticRequest();
      const queryParams = new URLSearchParams();

      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      if (params.cinemaId !== undefined) queryParams.append("cinemaId", params.cinemaId.toString());
      if (params.groupBy) queryParams.append("groupBy", params.groupBy);
      if (params.includeComparison !== undefined)
        queryParams.append("includeComparison", String(params.includeComparison));
      if (params.topLimit !== undefined) queryParams.append("topLimit", params.topLimit.toString());
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());

      const endpoint = `${this.partnerBasePath}/bookings/statistics${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await client.get<GetBookingStatisticsResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerStatisticError(error, "Đã xảy ra lỗi hệ thống khi lấy thống kê đơn hàng.");
    }
  }

  async getStaffPerformance(
    params: GetStaffPerformanceParams = {}
  ): Promise<GetStaffPerformanceResponse> {
    try {
      const client = createPartnerStatisticRequest();
      const queryParams = new URLSearchParams();

      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);
      if (params.topLimit !== undefined) queryParams.append("topLimit", params.topLimit.toString());

      const endpoint = `${this.partnerBasePath}/statistics/staff-performance${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await client.get<GetStaffPerformanceResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerStatisticError(error, "Đã xảy ra lỗi hệ thống khi lấy thống kê hiệu suất nhân viên.");
    }
  }

  async getStaffPerformanceDetail(
    employeeId: number,
    params: GetStaffPerformanceDetailParams = {}
  ): Promise<GetStaffPerformanceDetailResponse> {
    try {
      const client = createPartnerStatisticRequest();
      const queryParams = new URLSearchParams();

      if (params.fromDate) queryParams.append("fromDate", params.fromDate);
      if (params.toDate) queryParams.append("toDate", params.toDate);

      const endpoint = `${this.partnerBasePath}/statistics/staff-performance/${employeeId}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;
      const response = await client.get<GetStaffPerformanceDetailResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerStatisticError(error, "Đã xảy ra lỗi hệ thống khi lấy thống kê chi tiết nhân viên.");
    }
  }
}

export const partnerStatisticService = new PartnerStatisticService();

// ==================== REACT QUERY HOOKS ====================

export const useGetBookingStatistics = (params: GetBookingStatisticsParams = {}) => {
  return useQuery({
    queryKey: ["partner-booking-statistics", params],
    queryFn: () => partnerStatisticService.getBookingStatistics(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchBookingStatistics = () => {
  const queryClient = useQueryClient();

  return (params: GetBookingStatisticsParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-booking-statistics", params],
      queryFn: () => partnerStatisticService.getBookingStatistics(params),
    });
};

export const useInvalidateBookingStatistics = () => {
  const queryClient = useQueryClient();

  return (params?: GetBookingStatisticsParams) => {
    if (params !== undefined) {
      queryClient.invalidateQueries({ queryKey: ["partner-booking-statistics", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-booking-statistics"] });
    }
  };
};

// ==================== STAFF PERFORMANCE HOOKS ====================

export const useGetStaffPerformance = (params: GetStaffPerformanceParams = {}) => {
  return useQuery({
    queryKey: ["partner-staff-performance", params],
    queryFn: () => partnerStatisticService.getStaffPerformance(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetStaffPerformanceDetail = (
  employeeId: number | undefined,
  params: GetStaffPerformanceDetailParams = {}
) => {
  return useQuery({
    queryKey: ["partner-staff-performance-detail", employeeId, params],
    queryFn: () => partnerStatisticService.getStaffPerformanceDetail(employeeId!, params),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchStaffPerformance = () => {
  const queryClient = useQueryClient();

  return (params: GetStaffPerformanceParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-staff-performance", params],
      queryFn: () => partnerStatisticService.getStaffPerformance(params),
    });
};

export const useInvalidateStaffPerformance = () => {
  const queryClient = useQueryClient();

  return (params?: GetStaffPerformanceParams) => {
    if (params !== undefined) {
      queryClient.invalidateQueries({ queryKey: ["partner-staff-performance", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-staff-performance"] });
    }
    // Also invalidate detail queries
    queryClient.invalidateQueries({ queryKey: ["partner-staff-performance-detail"] });
  };
};
