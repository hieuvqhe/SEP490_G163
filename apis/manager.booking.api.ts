import { BASE_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

// ==================== Types ====================

export interface BookingCustomer {
  customerId: number;
  userId: number;
  fullname: string;
  email: string;
  phone: string;
}

export interface BookingCustomerDetail extends BookingCustomer {
  username: string;
}

export interface BookingShowtime {
  showtimeId: number;
  showDatetime: string;
  endTime: string;
  formatType: string;
  status: string;
}

export interface BookingShowtimeDetail extends BookingShowtime {
  basePrice: number;
  availableSeats: number;
}

export interface BookingCinema {
  cinemaId: number;
  cinemaName: string;
  address: string;
  city: string;
  district: string;
}

export interface BookingCinemaDetail extends BookingCinema {
  code: string;
  isActive: boolean;
}

export interface BookingScreen {
  screenId: number;
  screenName: string;
  code: string;
  capacity: number;
  screenType: string;
  soundSystem: string;
}

export interface BookingPartner {
  partnerId: number;
  partnerName: string;
  taxCode: string;
}

export interface BookingPartnerDetail extends BookingPartner {
  status: string;
  commissionRate: number;
}

export interface BookingMovie {
  movieId: number;
  title: string;
  durationMinutes: number;
  posterUrl: string;
  genre: string;
}

export interface BookingMovieDetail extends BookingMovie {
  director: string;
  language: string;
  country: string;
  premiereDate: string;
  endDate: string;
}

export interface BookingTicket {
  ticketId: number;
  seatId: number;
  seatName: string;
  rowCode: string;
  seatNumber: number;
  seatTypeName: string;
  price: number;
  status: string;
}

export interface BookingServiceOrder {
  serviceOrderId: number;
  serviceName: string;
  quantity: number;
  unitPrice: number;
  totalPrice: number;
}

export interface BookingPayment {
  paymentId: number;
  amount: number;
  method: string;
  status: string;
  provider: string;
  transactionId: string;
  paidAt: string;
  signatureOk: boolean;
}

export interface BookingVoucher {
  voucherId: number;
  voucherCode: string;
  discountType: string;
  discountValue: number;
  maxDiscount: number | null;
}

export interface BookingPricingBreakdown {
  ticketsSubtotal: number;
  servicesSubtotal: number;
  subtotalBeforeVoucher: number;
  voucherDiscount: number;
  finalTotal: number;
  commissionAmount: number;
  commissionRate: number;
}

export interface BookingDetailInfo {
  bookingId: number;
  bookingCode: string;
  bookingTime: string;
  totalAmount: number;
  status: BookingStatus;
  state: BookingState;
  paymentProvider: string;
  paymentTxId: string;
  paymentStatus: PaymentStatus;
  orderCode: string;
  sessionId: string;
  createdAt: string;
  updatedAt: string;
}

export type BookingStatus = "PENDING" | "CONFIRMED" | "CANCELLED";
export type BookingState = "PENDING" | "COMPLETED" | "EXPIRED" | "REFUNDED";
export type PaymentStatus = "PENDING" | "PAID" | "FAILED" | "REFUNDED";

export interface BookingItem {
  bookingId: number;
  bookingCode: string;
  bookingTime: string;
  totalAmount: number;
  status: BookingStatus;
  state: BookingState;
  paymentStatus: PaymentStatus;
  paymentProvider: string;
  paymentTxId: string;
  orderCode: string;
  createdAt: string;
  updatedAt: string;
  ticketCount: number;
  customer: BookingCustomer;
  showtime: BookingShowtime;
  cinema: BookingCinema;
  partner: BookingPartner;
  movie: BookingMovie;
}

export interface GetBookingsParams {
  // Pagination
  page?: number;
  pageSize?: number;
  // Sorting
  sortBy?: "booking_time" | "total_amount" | "created_at" | "customer_name" | "partner_name" | "cinema_name";
  sortOrder?: "asc" | "desc";
  // ID filters (int32)
  partnerId?: number;
  cinemaId?: number;
  customerId?: number;
  movieId?: number;
  // Date range filters (date-time)
  fromDate?: string;
  toDate?: string;
  // Amount range filters (double)
  minAmount?: number;
  maxAmount?: number;
  // String filters
  status?: string;
  customerEmail?: string;
  bookingCode?: string;
  orderCode?: string;
}

export interface GetBookingsResponse {
  message: string;
  result: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: BookingItem[];
  };
}

export interface GetBookingDetailResponse {
  message: string;
  result: {
    booking: BookingDetailInfo;
    customer: BookingCustomerDetail;
    showtime: BookingShowtimeDetail;
    cinema: BookingCinemaDetail;
    screen: BookingScreen;
    partner: BookingPartnerDetail;
    movie: BookingMovieDetail;
    tickets: BookingTicket[];
    serviceOrders: BookingServiceOrder[];
    payment: BookingPayment;
    voucher: BookingVoucher | null;
    pricingBreakdown: BookingPricingBreakdown;
  };
}

// ==================== Statistics Types ====================

export interface GetBookingStatisticsParams {
  // Date range filters (date-time)
  fromDate?: string;
  toDate?: string;
  // ID filters (int32)
  partnerId?: number;
  cinemaId?: number;
  movieId?: number;
  // Analysis config
  topLimit?: number;
  groupBy?: "day" | "week" | "month" | "year";
  includeComparison?: boolean;
  // Pagination (int32)
  page?: number;
  pageSize?: number;
}

export interface StatisticsOverview {
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
  partnerId: number;
  partnerName: string;
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  averageOrderValue: number;
  city: string;
  district: string;
  address: string;
}

export interface CinemaRevenueComparison {
  highestRevenueCinema: CinemaRevenueItem;
  lowestRevenueCinema: CinemaRevenueItem;
  averageRevenuePerCinema: number;
}

export interface StatisticsPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface CinemaRevenue {
  cinemaRevenueList: CinemaRevenueItem[];
  topCinemasByRevenue: CinemaRevenueItem[];
  comparison: CinemaRevenueComparison;
  pagination: StatisticsPagination;
}

export interface TopCustomerItem {
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
  byRevenue: TopCustomerItem[];
  byBookingCount: TopCustomerItem[];
}

export interface PartnerRevenueItem {
  partnerId: number;
  partnerName: string;
  taxCode: string;
  totalRevenue: number;
  totalBookings: number;
  totalCinemas: number;
  totalTicketsSold: number;
  averageRevenuePerCinema: number;
}

export interface PartnerRevenue {
  partnerRevenueList: PartnerRevenueItem[];
  topPartnersByRevenue: PartnerRevenueItem[];
  pagination: StatisticsPagination;
}

export interface MovieStatisticsItem {
  movieId: number;
  title: string;
  genre: string;
  totalRevenue: number;
  totalBookings: number;
  totalTicketsSold: number;
  showtimeCount: number;
}

export interface MovieStatistics {
  topMoviesByRevenue: MovieStatisticsItem[];
  topMoviesByTickets: MovieStatisticsItem[];
}

export interface TimePeriodStats {
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
  currentPeriod: {
    revenue: number;
    bookings: number;
    customers: number;
  };
  previousPeriod: {
    revenue: number;
    bookings: number;
    customers: number;
  };
  growth: {
    revenueGrowth: number;
    bookingGrowth: number;
    customerGrowth: number;
  };
}

export interface TimeStatistics {
  today: TimePeriodStats;
  yesterday: TimePeriodStats;
  thisWeek: TimePeriodStats;
  thisMonth: TimePeriodStats;
  thisYear: TimePeriodStats;
  revenueTrend: RevenueTrendItem[];
  periodComparison: PeriodComparison;
}

export interface MostUsedVoucherItem {
  voucherId: number;
  voucherCode: string;
  usageCount: number;
  totalDiscount: number;
}

export interface VoucherStatistics {
  totalVouchersUsed: number;
  totalVoucherDiscount: number;
  voucherUsageRate: number;
  mostUsedVouchers: MostUsedVoucherItem[];
}

export interface PaymentProviderStats {
  provider: string;
  bookingCount: number;
  totalAmount: number;
}

export interface PaymentStatistics {
  paymentByProvider: PaymentProviderStats[];
  failedPaymentRate: number;
  pendingPaymentAmount: number;
}

export interface GetBookingStatisticsResponse {
  message: string;
  result: {
    overview: StatisticsOverview;
    cinemaRevenue: CinemaRevenue;
    topCustomers: TopCustomers;
    partnerRevenue: PartnerRevenue;
    movieStatistics: MovieStatistics;
    timeStatistics: TimeStatistics;
    voucherStatistics: VoucherStatistics;
    paymentStatistics: PaymentStatistics;
  };
}

export interface ManagerBookingApiError {
  message: string;
  errors?: {
    [key: string]: {
      msg: string;
      path: string;
      location: string;
    };
  };
}

// ==================== Service ====================

class ManagerBookingService {
  private baseURL = `${BASE_URL}/manager`;

  async getBookings(params: GetBookingsParams, accessToken: string): Promise<GetBookingsResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Pagination
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());

      // Sorting
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      // ID filters (int32)
      if (params.partnerId !== undefined) queryParams.append("partnerId", params.partnerId.toString());
      if (params.cinemaId !== undefined) queryParams.append("cinemaId", params.cinemaId.toString());
      if (params.customerId !== undefined) queryParams.append("customerId", params.customerId.toString());
      if (params.movieId !== undefined) queryParams.append("movieId", params.movieId.toString());

      // Date range filters (date-time)
      if (params.fromDate) {
        const fromDateWithoutZ = params.fromDate.replace(/Z$/, "");
        queryParams.append("fromDate", fromDateWithoutZ);
      }
      if (params.toDate) {
        const toDateWithoutZ = params.toDate.replace(/Z$/, "");
        queryParams.append("toDate", toDateWithoutZ);
      }

      // Amount range filters (double)
      if (params.minAmount !== undefined) queryParams.append("minAmount", params.minAmount.toString());
      if (params.maxAmount !== undefined) queryParams.append("maxAmount", params.maxAmount.toString());

      // String filters
      if (params.status) queryParams.append("status", params.status);
      if (params.customerEmail) queryParams.append("customerEmail", params.customerEmail);
      if (params.bookingCode) queryParams.append("bookingCode", params.bookingCode);
      if (params.orderCode) queryParams.append("orderCode", params.orderCode);

      const queryString = queryParams.toString();
      const url = `${this.baseURL}/bookings${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ManagerBookingApiError;
      }

      return result as GetBookingsResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as ManagerBookingApiError;
      }
      throw error;
    }
  }

  async getBookingById(bookingId: number, accessToken: string): Promise<GetBookingDetailResponse> {
    try {
      const url = `${this.baseURL}/bookings/${bookingId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ManagerBookingApiError;
      }

      return result as GetBookingDetailResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as ManagerBookingApiError;
      }
      throw error;
    }
  }

  async getBookingStatistics(
    params: GetBookingStatisticsParams,
    accessToken: string
  ): Promise<GetBookingStatisticsResponse> {
    try {
      const queryParams = new URLSearchParams();

      // Date range filters (date-time)
      if (params.fromDate) {
        const fromDateWithoutZ = params.fromDate.replace(/Z$/, "");
        queryParams.append("fromDate", fromDateWithoutZ);
      }
      if (params.toDate) {
        const toDateWithoutZ = params.toDate.replace(/Z$/, "");
        queryParams.append("toDate", toDateWithoutZ);
      }

      // ID filters (int32)
      if (params.partnerId !== undefined) queryParams.append("partnerId", params.partnerId.toString());
      if (params.cinemaId !== undefined) queryParams.append("cinemaId", params.cinemaId.toString());
      if (params.movieId !== undefined) queryParams.append("movieId", params.movieId.toString());

      // Analysis config
      if (params.topLimit !== undefined) queryParams.append("topLimit", params.topLimit.toString());
      if (params.groupBy) queryParams.append("groupBy", params.groupBy);
      if (params.includeComparison !== undefined) queryParams.append("includeComparison", params.includeComparison.toString());

      // Pagination (int32)
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());

      const queryString = queryParams.toString();
      const url = `${this.baseURL}/bookings/statistics${queryString ? `?${queryString}` : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as ManagerBookingApiError;
      }

      return result as GetBookingStatisticsResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw {
          message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as ManagerBookingApiError;
      }
      throw error;
    }
  }
}

export const managerBookingService = new ManagerBookingService();

// ==================== React Query Hooks ====================

export const useGetManagerBookings = (params: GetBookingsParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-bookings", params],
    queryFn: () => managerBookingService.getBookings(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetManagerBookingById = (bookingId?: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-booking", bookingId],
    queryFn: () => managerBookingService.getBookingById(bookingId as number, accessToken!),
    enabled: !!accessToken && typeof bookingId === "number" && bookingId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetManagerBookingStatistics = (
  params: GetBookingStatisticsParams,
  accessToken?: string
) => {
  return useQuery({
    queryKey: ["manager-booking-statistics", params],
    queryFn: () => managerBookingService.getBookingStatistics(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
