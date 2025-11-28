import { BASE_URL } from "@/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

// ==================== Types ====================

export interface CashierCinema {
  cinemaId: number;
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
  logoUrl: string;
  assignedAt: string;
  employeeId: number;
  employeeName: string;
}

export interface GetCashierCinemaResponse {
  message: string;
  result: CashierCinema;
}

// Booking Types
export interface BookingShowtime {
  showtimeId: number;
  showDatetime: string;
  endTime: string;
  formatType: string;
  status: string;
}

export interface BookingMovie {
  movieId: number;
  title: string;
  durationMinutes: number;
  posterUrl: string;
}

export interface BookingCustomer {
  customerId: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface CashierBooking {
  bookingId: number;
  bookingCode: string;
  orderCode: string;
  bookingTime: string;
  totalAmount: number;
  status: string;
  paymentStatus: string;
  paymentProvider: string;
  ticketCount: number;
  checkedInTicketCount: number;
  notCheckedInTicketCount: number;
  showtime: BookingShowtime;
  movie: BookingMovie;
  customer: BookingCustomer;
}

export interface GetCashierBookingsParams {
  page?: number;
  pageSize?: number;
  status?: 'PENDING' | 'CONFIRMED' | 'CANCELLED' | 'COMPLETED';
  paymentStatus?: 'PENDING' | 'PAID' | 'FAILED' | 'REFUNDED';
  fromDate?: string;
  toDate?: string;
  bookingCode?: string;
  orderCode?: string;
  showtimeId?: number;
  sortBy?: 'booking_time' | 'total_amount' | 'status';
  sortOrder?: 'asc' | 'desc';
}

export interface GetCashierBookingsResponse {
  message: string;
  result: {
    page: number;
    pageSize: number;
    totalItems: number;
    totalPages: number;
    items: CashierBooking[];
  };
}

// Booking Detail Types
export interface BookingDetailShowtime {
  showtimeId: number;
  showDatetime: string;
  movieName: string;
  cinemaName: string;
  screenName: string;
}

export interface BookingDetailCustomer {
  customerId: number;
  fullName: string;
  email: string;
  phone: string;
}

export interface BookingTicket {
  ticketId: number;
  seatId: number;
  seatName: string;
  price: number;
  status: 'VALID' | 'CHECKED_IN' | 'CANCELLED';
  checkInTime: string | null;
  checkedInByEmployeeName: string | null;
  checkInStatus: 'NOT_CHECKED_IN' | 'CHECKED_IN';
}

export interface CheckInSummary {
  totalTickets: number;
  checkedInTickets: number;
  notCheckedInTickets: number;
  bookingCheckInStatus: 'NOT_CHECKED_IN' | 'PARTIAL_CHECKED_IN' | 'FULLY_CHECKED_IN';
}

export interface BookingDetail {
  bookingId: number;
  bookingCode: string;
  orderCode: string;
  status: string;
  bookingTime: string;
  totalAmount: number;
  paymentProvider: string;
  paymentStatus: string;
  showtime: BookingDetailShowtime;
  customer: BookingDetailCustomer;
  tickets: BookingTicket[];
  checkInSummary: CheckInSummary;
}

export interface GetBookingDetailResponse {
  message: string;
  result: BookingDetail;
}

// Scan Ticket Types
export interface ScanTicketRequest {
  qrCode: string;
}

export interface ScannedTicketInfo {
  ticketId: number;
  seatId: number;
  seatName: string;
  orderCode: string;
  bookingId: number;
  bookingCode: string;
  showtimeId: number;
  showtimeStart: string;
  movieName: string;
  cinemaName: string;
  checkInTime: string;
  isAlreadyCheckedIn: boolean;
}

export interface ScanBookingStatus {
  bookingId: number;
  totalTickets: number;
  checkedInTickets: number;
  notCheckedInTickets: number;
  bookingStatus: 'NOT_CHECKED_IN' | 'PARTIAL_CHECKED_IN' | 'FULLY_CHECKED_IN';
}

export interface ScanTicketResult {
  success: boolean;
  message: string;
  ticketInfo: ScannedTicketInfo;
  bookingStatus: ScanBookingStatus;
}

export interface ScanTicketResponse {
  message: string;
  result: ScanTicketResult;
}

export interface CashierApiError {
  message: string;
  errors?: Record<string, string>;
  errorInfo?: {
    name: string;
    message: string;
  };
}

// ==================== Service ====================

class CashierService {
  private baseURL = `${BASE_URL}/api/cashier`;

  /**
   * Lấy thông tin rạp mà cashier được phân công
   * GET /api/cashier/my-cinema
   */
  async getMyCinema(accessToken: string): Promise<GetCashierCinemaResponse> {
    try {
      const url = `${this.baseURL}/my-cinema`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as CashierApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' } as CashierApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  /**
   * Lấy danh sách booking của rạp mà cashier quản lý
   * GET /api/cashier/bookings
   */
  async getBookings(params: GetCashierBookingsParams, accessToken: string): Promise<GetCashierBookingsResponse> {
    try {
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append('page', params.page.toString());
      if (params.pageSize !== undefined) queryParams.append('pageSize', params.pageSize.toString());
      if (params.status) queryParams.append('status', params.status);
      if (params.paymentStatus) queryParams.append('paymentStatus', params.paymentStatus);
      if (params.fromDate) queryParams.append('fromDate', params.fromDate);
      if (params.toDate) queryParams.append('toDate', params.toDate);
      if (params.bookingCode) queryParams.append('bookingCode', params.bookingCode);
      if (params.orderCode) queryParams.append('orderCode', params.orderCode);
      if (params.showtimeId !== undefined) queryParams.append('showtimeId', params.showtimeId.toString());
      if (params.sortBy) queryParams.append('sortBy', params.sortBy);
      if (params.sortOrder) queryParams.append('sortOrder', params.sortOrder);

      const url = `${this.baseURL}/bookings${queryParams.toString() ? '?' + queryParams.toString() : ''}`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as CashierApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' } as CashierApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  /**
   * Lấy chi tiết booking
   * GET /api/cashier/bookings/:bookingId/details
   */
  async getBookingDetail(bookingId: number, accessToken: string): Promise<GetBookingDetailResponse> {
    try {
      const url = `${this.baseURL}/bookings/${bookingId}/details`;

      const response = await fetch(url, {
        method: 'GET',
        headers: {
          'Accept': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as CashierApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' } as CashierApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  /**
   * Quét vé (check-in ticket)
   * POST /api/cashier/scan-ticket
   */
  async scanTicket(data: ScanTicketRequest, accessToken: string): Promise<ScanTicketResponse> {
    try {
      const url = `${this.baseURL}/scan-ticket`;

      const response = await fetch(url, {
        method: 'POST',
        headers: {
          'Accept': 'application/json',
          'Content-Type': 'application/json',
          'Authorization': `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as CashierApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === 'TypeError') {
        throw { message: 'Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.' } as CashierApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }
}

export const cashierService = new CashierService();

// ==================== React Query Hooks ====================

/**
 * Hook lấy thông tin rạp mà cashier được phân công
 */
export const useGetCashierCinema = (accessToken?: string) => {
  return useQuery({
    queryKey: ['cashier-cinema'],
    queryFn: () => cashierService.getMyCinema(accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

/**
 * Hook lấy danh sách booking của rạp mà cashier quản lý
 */
export const useGetCashierBookings = (params: GetCashierBookingsParams, accessToken?: string) => {
  return useQuery({
    queryKey: ['cashier-bookings', params],
    queryFn: () => cashierService.getBookings(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 1 * 60 * 1000, // 1 minute - bookings change frequently
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook lấy chi tiết booking
 */
export const useGetBookingDetail = (bookingId: number, accessToken?: string) => {
  return useQuery({
    queryKey: ['cashier-booking-detail', bookingId],
    queryFn: () => cashierService.getBookingDetail(bookingId, accessToken!),
    enabled: !!accessToken && !!bookingId,
    staleTime: 30 * 1000, // 30 seconds - detail may change when checking in
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

/**
 * Hook để invalidate cache của cashier cinema
 */
export const useInvalidateCashierCinema = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['cashier-cinema'] });
  };
};

/**
 * Hook để invalidate cache của cashier bookings
 */
export const useInvalidateCashierBookings = () => {
  const queryClient = useQueryClient();
  
  return () => {
    queryClient.invalidateQueries({ queryKey: ['cashier-bookings'] });
  };
};

/**
 * Hook để invalidate cache của booking detail
 */
export const useInvalidateBookingDetail = () => {
  const queryClient = useQueryClient();
  
  return (bookingId?: number) => {
    if (bookingId) {
      queryClient.invalidateQueries({ queryKey: ['cashier-booking-detail', bookingId] });
    } else {
      queryClient.invalidateQueries({ queryKey: ['cashier-booking-detail'] });
    }
  };
};

/**
 * Hook quét vé (check-in ticket)
 */
export const useScanTicket = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({ data, accessToken }: { data: ScanTicketRequest; accessToken: string }) =>
      cashierService.scanTicket(data, accessToken),
    onSuccess: (response) => {
      // Invalidate booking detail và bookings list sau khi scan thành công
      if (response.result?.ticketInfo?.bookingId) {
        queryClient.invalidateQueries({ 
          queryKey: ['cashier-booking-detail', response.result.ticketInfo.bookingId] 
        });
      }
      queryClient.invalidateQueries({ queryKey: ['cashier-bookings'] });
    },
  });
};
