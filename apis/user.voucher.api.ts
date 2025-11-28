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

export const handleVoucherApiError = (error: unknown): Error => {
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

const userVoucherApi = createAuthenticatedRequest();

interface GetAllUserVouchersRes {
  message: string;
  result: {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountVal: number;
    validFrom: string;
    validTo: string;
    usageLimit: number;
    usedCount: number;
    description: string;
    createdAt: string;
    discountText: string;
    isExpired: boolean;
    isAvailable: boolean;
    remainingUses: number;
  }[];
}

interface VoucherDetail {
  message: string;
  result: {
    voucherId: number;
    voucherCode: string;
    discountType: string;
    discountVal: number;
    validFrom: string;
    validTo: string;
    usageLimit: number;
    usedCount: number;
    description: string;
    createdAt: string;
    discountText: string;
    isExpired: boolean;
    isAvailable: boolean;
    remainingUses: number;
  };
}

class UserVoucherApi {
  getAllUserVouchers = async (): Promise<GetAllUserVouchersRes> => {
    try {
      const res = await userVoucherApi.get(`${BASE_URL}/api/user/vouchers`);
      return res.data;
    } catch (error) {
      throw handleVoucherApiError(error);
    }
  };

  getVoucherByCode = async (voucherCode: string): Promise<VoucherDetail> => {
    try {
      const res = await userVoucherApi.get(
        `${BASE_URL}/api/user/vouchers/${voucherCode}`
      );
      return res.data;
    } catch (error) {
      throw handleVoucherApiError(error);
    }
  };
}

const userVoucherApiInstance = new UserVoucherApi();

export const useGetUserVouchers = () => {
  return useQuery({
    queryKey: ["user-vouchers"],
    queryFn: () => userVoucherApiInstance.getAllUserVouchers(),
  });
};

export const useGetUserVoucherByCode = (voucherCode: string) => {
  return useQuery({
    queryKey: ["user-vouchers", voucherCode],
    queryFn: () => userVoucherApiInstance.getVoucherByCode(voucherCode),
    enabled: !!voucherCode && voucherCode.trim().length > 0, // Chỉ gọi API khi có mã voucher
  });
};
