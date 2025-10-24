import { BASE_URL } from "@/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface GetPendingPartnersParams {
  page?: number;
  limit?: number;
  search?: string;
  sortBy?: "partner_name" | "email" | "phone" | "tax_code" | "created_at" | "updated_at";
  sortOrder?: "asc" | "desc";
}

export interface PendingPartner {
  partnerId: number;
  partnerName: string;
  taxCode: string;
  address: string;
  email: string;
  phone: string;
  commissionRate: number;
  status: string;
  createdAt: string;
  updatedAt: string;
  userId: number;
  fullname: string;
  userEmail: string;
  userPhone: string;
  businessRegistrationCertificateUrl: string;
  taxRegistrationCertificateUrl: string;
  identityCardUrl: string;
  theaterPhotosUrl: string;
}

export interface PendingPartnersPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
}

export interface GetPendingPartnersResponse {
  message: string;
  result: {
    partners: PendingPartner[];
    pagination: PendingPartnersPagination;
  };
}

export interface ManagerRegisterApiError {
  message: string;
  detail?: string;
  Errors?: {
    auth?: {
      Msg: string;
      Path: string;
      Location: string;
    };
  };
}

export interface ApprovePartnerResponse {
  message: string;
  result: {
    partnerId: number;
    partnerName: string;
    taxCode: string;
    status: string;
    commissionRate: number;
    approvedAt: string;
    approvedBy: number;
    managerName: string;
    userId: number;
    fullname: string;
    email: string;
    phone: string;
    isActive: boolean;
    emailConfirmed: boolean;
  };
}

export interface RejectPartnerRequest {
  rejectionReason: string;
}

export interface RejectPartnerResponse {
  message: string;
  result: {
    partnerId: number;
    partnerName: string;
    taxCode: string;
    status: string;
    rejectionReason: string;
    rejectedAt: string;
    rejectedBy: number;
    managerName: string;
    userId: number;
    fullname: string;
    email: string;
    phone: string;
    isActive: boolean;
    emailConfirmed: boolean;
  };
}

class ManagerRegisterService {
  // Backend exposes manager routes under `${BASE_URL}/manager` (no extra `/api` prefix)
  private baseURL = `${BASE_URL}/manager`;

  async getPendingPartners(params: GetPendingPartnersParams, accessToken: string): Promise<GetPendingPartnersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      const url = `${this.baseURL}/partners/pending${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerRegisterApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerRegisterApiError;
      }
      throw error;
    }
  }

  async approvePartner(partnerId: number, accessToken: string): Promise<ApprovePartnerResponse> {
    try {
      const url = `${this.baseURL}/partners/${partnerId}/approve`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerRegisterApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerRegisterApiError;
      }
      throw error;
    }
  }

  async rejectPartner(partnerId: number, data: RejectPartnerRequest, accessToken: string): Promise<RejectPartnerResponse> {
    try {
      const url = `${this.baseURL}/partners/${partnerId}/reject`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerRegisterApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerRegisterApiError;
      }
      throw error;
    }
  }
}

export const managerRegisterService = new ManagerRegisterService();

export const useGetPendingPartners = (params: GetPendingPartnersParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-pending-partners", params],
    queryFn: () => managerRegisterService.getPendingPartners(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useApprovePartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ partnerId, accessToken }: { partnerId: number; accessToken: string }) =>
      managerRegisterService.approvePartner(partnerId, accessToken),
    onSuccess: (_, { partnerId }) => {
      // Invalidate pending partners list after approval
      queryClient.invalidateQueries({ queryKey: ["manager-pending-partners"] });
      queryClient.invalidateQueries({ queryKey: ["manager-pending-partners", partnerId] });
    },
  });
};

export const useRejectPartner = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ partnerId, data, accessToken }: { partnerId: number; data: RejectPartnerRequest; accessToken: string }) =>
      managerRegisterService.rejectPartner(partnerId, data, accessToken),
    onSuccess: (_, { partnerId }) => {
      // Invalidate pending partners list after rejection
      queryClient.invalidateQueries({ queryKey: ["manager-pending-partners"] });
      queryClient.invalidateQueries({ queryKey: ["manager-pending-partners", partnerId] });
    },
  });
};
