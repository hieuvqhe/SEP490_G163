import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import { useMutation, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const createPaymentRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

export const handlePaymentError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data;

    const message =
      data?.message || data?.error || "Thanh toán thất bại. Vui lòng thử lại.";

    // Các lỗi phổ biến khi thanh toán PayOS
    switch (status) {
      case 400:
        return new Error("Dữ liệu gửi lên không hợp lệ. " + message);

      case 401:
      case 403:
        return new Error("Không có quyền thực hiện thanh toán. " + message);

      case 404:
        return new Error("Không tìm thấy Order hoặc API. " + message);

      case 408:
        return new Error("Hết thời gian kết nối đến PayOS. Vui lòng thử lại.");

      case 409:
        return new Error("Order đã thanh toán hoặc đang được xử lý.");

      case 410:
        return new Error("Liên kết thanh toán đã hết hạn.");

      case 429:
        return new Error("Quá nhiều yêu cầu. Vui lòng thử lại sau.");

      case 500:
        return new Error("Lỗi hệ thống thanh toán PayOS. " + message);

      case 502:
      case 503:
      case 504:
        return new Error(
          "Hệ thống PayOS đang quá tải hoặc bảo trì. Vui lòng thử lại sau."
        );

      default:
        return new Error(message || "Thanh toán thất bại.");
    }
  }

  return new Error("Không thể kết nối mạng. Vui lòng kiểm tra internet.");
};

const paymentApi = createPaymentRequest();

// Tạo yêu cầu PayOS
export interface CreatePayOSPayload {
  orderId: string;
  returnUrl: string;
  cancelUrl: string;
}

// Return URL từ PayOS → FE gọi lên BE
export interface PayOSReturnQuery {
  id: string;
  orderCode: string;
  code: string;
  status: string;
}

// Status theo order_id
export interface PayOSStatusParam {
  orderId: string;
}

interface CreatePayOSRes {
  message: string;
  result: {
    orderId: string;
    checkoutUrl: string;
    providerRef: string;
    qrCode: string;
    expiresAt: string;
  };
}

interface CheckPayOSRes {
  message: string;
  result: {
    orderId: string;
    status: string;
    paymentLink: string;
    qrCode: string;
    paidAt: string;
    expiresAt: string;
    providerRef: string;
  };
}

class PaymentManagement {
  private BASE_URL = "/api/payments/payos";

  createPayOSRequest = async (
    payload: CreatePayOSPayload
  ): Promise<CreatePayOSRes> => {
    try {
      const res = await paymentApi.post(`${this.BASE_URL}/create`, payload);
      return res.data;
    } catch (error) {
      throw handlePaymentError(error);
    }
  };

  // 2. Return từ PayOS (FE redirect về BE handler)
  getPayOSReturn = async (query: PayOSReturnQuery) => {
    try {
      const res = await paymentApi.get(`${this.BASE_URL}/return`, {
        params: query,
      });
      return res.data;
    } catch (error) {
      throw handlePaymentError(error);
    }
  };

  // 3. Lấy trạng thái Order
  getPayOSStatus = async (orderId: string) => {
    try {
      const res = await paymentApi.get(`${this.BASE_URL}/status/${orderId}`);
      return res.data;
    } catch (error) {
      throw handlePaymentError(error);
    }
  };

  // 4. Kiểm tra & cập nhật trạng thái Order sau khi thanh toán
  checkPayOSOrder = async (orderId: string): Promise<CheckPayOSRes> => {
    try {
      const res = await paymentApi.post(`${this.BASE_URL}/check/${orderId}`);
      return res.data;
    } catch (error) {
      throw handlePaymentError(error);
    }
  };

  // 5. Đánh dấu một order đã hết hạn
  setExpiredOrder = async (orderId: string) => {
    try {
      const res = await paymentApi.post(
        `${BASE_URL}/api/orders/${orderId}/expire`
      );
      return res.data;
    } catch (error) {
      throw handlePaymentError(error);
    }
  };
}

export const paymentManagement = new PaymentManagement();

export const useCreatePayOS = () => {
  return useMutation({
    mutationFn: paymentManagement.createPayOSRequest,
  });
};

export const usePayOSReturn = (query?: PayOSReturnQuery, enable = false) => {
  return useQuery({
    queryKey: ["payos-return", query],
    queryFn: () => paymentManagement.getPayOSReturn(query!),
    enabled: enable && !!query,
  });
};

export const usePayOSStatus = (orderId?: string, enable = false) => {
  return useQuery({
    queryKey: ["payos-status", orderId],
    queryFn: () => paymentManagement.getPayOSStatus(orderId!),
    enabled: enable && !!orderId,
  });
};

export const useCheckPayOSOrder = () => {
  return useMutation({
    mutationFn: paymentManagement.checkPayOSOrder,
  });
};

export const useSetExpiredOrder = () => {
  return useMutation({
    mutationFn: paymentManagement.setExpiredOrder,
  });
};
