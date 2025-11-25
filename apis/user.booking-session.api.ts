import { getAccessToken } from "@/store/authStore";
import {
  createPublicRequest,
  handleShowtimeOverviewError,
} from "./user.catalog.api";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";
import { BASE_URL } from "@/constants";

interface BookingSessionRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    state: string;
    items: {
      seats: number[];
      combos: number[];
    };
    pricing: {
      subtotal: number;
      discount: number;
      fees: number;
      total: number;
      currency: string;
    };
    expiresAt: Date;
    version: number;
  };
}

interface GetBookingSessionDetailRes {
  message: string;
  result: {
    bookingSessionId: string; // GUID
    state: string;
    showtimeId: number;
    items: {
      seats: number[];
      combos: ComboItem[];
    };
    pricing: string; // tùy bạn define thêm
    expiresAt: string; // ISO date string
    version: number;
  };
}

interface DeleteBookingSessionRes {
  message: string;
  result: {
    bookingSessionId: string; // GUID
    showtimeId: number;
    releasedSeatIds: number[]; // array number
    state: string;
  };
}

export interface ComboItem {
  serviceId: number;
  name: string;
  code: string;
  price: number;
  imageUrl: string;
  description: string;
  isAvailable: boolean;
  priceAfterAutoDiscount: number;
  autoVoucherCode: string;
}

export interface VoucherItem {
  voucherId: number;
  voucherCode: string;
  discountType: string;
  discountVal: number;
  validFrom: string; // YYYY-MM-DD
  validTo: string; // YYYY-MM-DD
  usageLimit: number;
  usedCount: number;
  description: string;
  createdAt: string; // ISO datetime
  discountText: string;
  isExpired: boolean;
  isAvailable: boolean;
  remainingUses: number;
}

export type AutoVoucher = VoucherItem;

export interface GetBookingSessionCombosResult {
  bookingSessionId: string;
  showtimeId: number;
  partnerId: number;
  combos: ComboItem[];
  currency: string;
  selectionLimit: number;
  serverTime: string; // ISO datetime
  vouchers: VoucherItem[];
  autoVoucher: AutoVoucher | null; // phòng trường hợp null
}

export interface GetBookingSessionCombosRes {
  message: string;
  result: GetBookingSessionCombosResult;
}

export interface TouchBookingSessionRes {
  bookingSessionId: string;
  expiresAt: string;
  lockedSeatsExtended: number[];
}

interface UpsertBookingSessionCombosReq {
  id: string;
  items: { serviceId: number; quantity: number }[];
}

interface UpsertBookingSessionCombosRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    combos: {
      serviceId: number;
      name: string;
      code: string;
      price: number;
      quantity: number;
      imageUrl: string;
      isAvailable: boolean;
    }[];
    totalQuantity: number;
  };
}

interface UpdateBookingSessionCombosRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    totalUnits: number;
    comboIds: number[];
  };
}

interface QuickDeleteSessionCombosReq {
  id: string;
  serviceId: string;
}

interface QuickDeleteSessionCombosRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    removedServiceId: number;
    totalUnits: number;
    comboIds: number[];
  };
}

interface PostPricingPreviewReq {
  id: string;
  voucherCode: string;
}

export interface PostPricingPreviewRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    seatCount: number;
    comboCount: number;
    seatsSubtotal: number;
    combosSubtotal: number;
    currency: string;
    appliedVoucherCode: string | null; // tùy API có thể null
    discountAmount: number;
    total: number;
  };
}

interface PostApplyCouponRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    appliedVoucher: string;
    discountAmount: number;
    pricing: {
      seatsSubtotal: number;
      combosSubtotal: number;
      surchargeSubtotal: number;
      fees: number;
      discount: number;
      total: number;
      currency: string;
    };
    expiresAt: Date;
  };
}

interface PutSessionVoucherRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    voucherCode: string;
  };
}

interface DeleteSessionVoucherRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    message: string;
  };
}

interface CreateCheckoutReq {
  id: string;
  body: {
    provider: string;
    returnUrl: string;
    cancelUrl: string;
  };
}

interface CreateCheckoutRes {
  message: string;
  result: {
    bookingSessionId: string;
    showtimeId: number;
    state: string;
    orderId: string;
    paymentUrl: string;
    expiresAt: Date;
    message: string;
  };
}

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

const userApi = createAuthenticatedRequest();

class BookingSessionsManagement {
  private BASE_URL = "/api/booking/sessions";

  createBookingSession = async (
    showtimeId: number
  ): Promise<BookingSessionRes> => {
    try {
      const response = await userApi.post(`${this.BASE_URL}`, { showtimeId });
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  getBookingSessionDetail = async (
    id: string
  ): Promise<GetBookingSessionDetailRes> => {
    try {
      const response = await userApi.get(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  deleteBookingSession = async (
    id: string
  ): Promise<DeleteBookingSessionRes> => {
    try {
      const response = await userApi.delete(`${this.BASE_URL}/${id}`);
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  touchBookingSession = async (id: string): Promise<TouchBookingSessionRes> => {
    try {
      const response = await userApi.post(`${this.BASE_URL}/${id}/touch`);
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  getBookingSessionCombos = async (
    id: string
  ): Promise<GetBookingSessionCombosRes> => {
    try {
      const response = await userApi.get(`${this.BASE_URL}/${id}/combos`);
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  upsertBookingSessionCombos = async ({
    id,
    items,
  }: UpsertBookingSessionCombosReq): Promise<UpsertBookingSessionCombosRes> => {
    try {
      const response = await userApi.post(`${this.BASE_URL}/${id}/combos`, {
        items,
      });
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  updateBookingSessionCombos = async ({
    id,
    items,
  }: UpsertBookingSessionCombosReq): Promise<UpdateBookingSessionCombosRes> => {
    try {
      const response = await userApi.put(`${this.BASE_URL}/${id}/combos`, {
        items,
      });
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  quickDeleteSessionCombos = async ({
    id,
    serviceId,
  }: QuickDeleteSessionCombosReq): Promise<QuickDeleteSessionCombosRes> => {
    try {
      const response = await userApi.delete(
        `${this.BASE_URL}/${id}/combos/${serviceId}`
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  postPricingPreview = async ({
    id,
    voucherCode,
  }: PostPricingPreviewReq): Promise<PostPricingPreviewRes> => {
    try {
      const response = await userApi.post(
        `${this.BASE_URL}/${id}/pricing/preview`,
        { voucherCode: voucherCode }
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  postApplyCoupon = async ({
    id,
    voucherCode,
  }: PostPricingPreviewReq): Promise<PostApplyCouponRes> => {
    try {
      const response = await userApi.post(
        `${this.BASE_URL}/${id}/pricing/apply-coupon`,
        { voucherCode }
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  putSessionVoucher = async ({
    id,
    voucherCode,
  }: PostPricingPreviewReq): Promise<PutSessionVoucherRes> => {
    try {
      const response = await userApi.put(`${this.BASE_URL}/${id}/voucher`, {
        voucherCode,
      });
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  deleteSessionVoucher = async (
    id: string
  ): Promise<DeleteSessionVoucherRes> => {
    try {
      const response = await userApi.delete(`${this.BASE_URL}/${id}/voucher`);
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  createCheckout = async ({
    id,
    body,
  }: CreateCheckoutReq): Promise<CreateCheckoutRes> => {
    try {
      const response = await userApi.post(
        `${this.BASE_URL}/${id}/checkout`,
        body
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };
}

interface LockSeatsReq {
  sessionId: string;
  selectedSeat: number[];
}

interface LockSeatsRes {
  bookingSessionId: string;
  showtimeId: number;
  lockedSeatIds: number[];
  lockedUntil: Date;
  currentSeatIds: number[];
}

class BookingSessionSeatsManagement {
  private BASE_URL = "/api/booking/sessions";

  lockSeats = async ({
    sessionId,
    selectedSeat,
  }: LockSeatsReq): Promise<LockSeatsRes> => {
    try {
      const response = await userApi.post(
        `${this.BASE_URL}/${sessionId}/seats`,
        { seatIds: selectedSeat }
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  releaseSeatsLock = async ({
    sessionId,
    selectedSeat, // array of seatIds
  }: LockSeatsReq): Promise<LockSeatsRes> => {
    try {
      const response = await userApi.delete(
        `${this.BASE_URL}/${sessionId}/seats`,
        {
          data: {
            seatIds: selectedSeat,
          },
        }
      );

      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  replaceSeats = async ({
    sessionId,
    selectedSeat,
  }: LockSeatsReq): Promise<LockSeatsRes> => {
    try {
      const response = await userApi.put(
        `${this.BASE_URL}/${sessionId}/seats`,
        {
          seatIds: selectedSeat,
        }
      );

      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };
}

export const bookingSessionServices = new BookingSessionsManagement();
export const seatActionsServices = new BookingSessionSeatsManagement();

// ---------- CREATE BOOKING SESSION ----------
export const useCreateBookingSession = () => {
  return useMutation({
    mutationFn: (showtimeId: number) =>
      bookingSessionServices.createBookingSession(showtimeId),
  });
};

// ---------- GET BOOKING SESSION DETAIL ----------
export const useGetBookingSessionDetail = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["booking-session", id],
    queryFn: () => bookingSessionServices.getBookingSessionDetail(id),
    enabled,
  });
};

// ---------- DELETE BOOKING SESSION ----------
export const useDeleteBookingSession = () => {
  return useMutation({
    mutationFn: (id: string) => bookingSessionServices.deleteBookingSession(id),
  });
};

// ---------- TOUCH BOOKING SESSION ----------
export const useTouchBookingSession = () => {
  return useMutation({
    mutationFn: (id: string) => bookingSessionServices.touchBookingSession(id),
  });
};

// ---------- GET BOOKING SESSION COMBOS ----------
export const useGetBookingSessionCombos = (id: string, enabled = true) => {
  return useQuery({
    queryKey: ["booking-session-combos", id],
    queryFn: () => bookingSessionServices.getBookingSessionCombos(id),
    enabled,
  });
};

// ---------- UPSERT COMBOS ----------
export const useUpsertBookingSessionCombos = () => {
  return useMutation({
    mutationFn: (data: UpsertBookingSessionCombosReq) =>
      bookingSessionServices.upsertBookingSessionCombos(data),
  });
};

// ---------- UPDATE COMBOS ----------
export const useUpdateBookingSessionCombos = () => {
  return useMutation({
    mutationFn: (data: UpsertBookingSessionCombosReq) =>
      bookingSessionServices.updateBookingSessionCombos(data),
  });
};

// ---------- QUICK DELETE COMBO ----------
export const useQuickDeleteSessionCombos = () => {
  return useMutation({
    mutationFn: (data: QuickDeleteSessionCombosReq) =>
      bookingSessionServices.quickDeleteSessionCombos(data),
  });
};

// ---------- PRICING PREVIEW ----------
export const usePostPricingPreview = () => {
  return useMutation({
    mutationFn: (data: PostPricingPreviewReq) =>
      bookingSessionServices.postPricingPreview(data),
  });
};

// ---------- APPLY COUPON ----------
export const usePostApplyCoupon = () => {
  return useMutation({
    mutationFn: (data: PostPricingPreviewReq) =>
      bookingSessionServices.postApplyCoupon(data),
  });
};

// ---------- PUT SESSION VOUCHER ----------
export const usePutSessionVoucher = () => {
  return useMutation({
    mutationFn: (data: PostPricingPreviewReq) =>
      bookingSessionServices.putSessionVoucher(data),
  });
};

// ---------- DELETE SESSION VOUCHER ----------
export const useDeleteSessionVoucher = () => {
  return useMutation({
    mutationFn: (id: string) => bookingSessionServices.deleteSessionVoucher(id),
  });
};

// ---------- CREATE CHECKOUT ----------
export const useCreateCheckout = () => {
  return useMutation({
    mutationFn: (data: CreateCheckoutReq) =>
      bookingSessionServices.createCheckout(data),
  });
};

// 🔒 Lock seats
export const useLockSeats = () => {
  return useMutation<LockSeatsRes, Error, LockSeatsReq>({
    mutationFn: (data: LockSeatsReq) => seatActionsServices.lockSeats(data),
  });
};

// 🔓 Release seat locks
export const useReleaseSeats = () => {
  return useMutation<LockSeatsRes, Error, LockSeatsReq>({
    mutationFn: (data: LockSeatsReq) =>
      seatActionsServices.releaseSeatsLock(data),
  });
};

// ♻️ Replace seats (unlock old + lock new)
export const useReplaceSeats = () => {
  return useMutation<LockSeatsRes, Error, LockSeatsReq>({
    mutationFn: (data: LockSeatsReq) => seatActionsServices.replaceSeats(data),
  });
};

export const useSeatActions = () => {
  const lock = useLockSeats();
  const release = useReleaseSeats();
  const replace = useReplaceSeats();

  return { lock, release, replace };
};
