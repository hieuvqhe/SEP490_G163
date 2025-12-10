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
  additionalDocumentsUrl?: string;
  managerStaffId?: number;
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

export interface GetTopCustomersParams {
  topLimit?: number;
  fromDate?: string;
  toDate?: string;
  partnerId?: number;
  cinemaId?: number;
  customerEmail?: string;
  customerName?: string;
  page?: number;
  pageSize?: number;
  sortOrder?: "asc" | "desc";
  sortBy?: "booking_count" | "total_spent";
  topByBookingCountSortOrder?: "asc" | "desc";
  topByTotalSpentSortOrder?: "asc" | "desc";
}

export interface CustomerBookingInfo {
  customerId: number;
  userId: number;
  fullname: string;
  username: string;
  email: string;
  phone: string | null;
  avatarUrl: string | null;
  totalBookings: number;
  totalSpent: number;
  totalTicketsPurchased: number;
  averageOrderValue: number;
  lastBookingDate: string;
  firstBookingDate: string;
}

export interface CustomersPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetTopCustomersResponse {
  message: string;
  result: {
    topCustomersByBookingCount: CustomerBookingInfo[];
    topCustomersByTotalSpent: CustomerBookingInfo[];
    fullCustomerList: {
      customers: CustomerBookingInfo[];
      pagination: CustomersPagination;
    };
    statistics: {
      maxBookings: number;
      minBookings: number;
      averageBookings: number;
      customerWithMostBookings: CustomerBookingInfo;
      customerWithLeastBookings: CustomerBookingInfo;
    };
    totalCustomers: number;
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

  async getTopCustomers(params: GetTopCustomersParams, accessToken: string): Promise<GetTopCustomersResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.topLimit !== undefined) queryParams.append("topLimit", params.topLimit.toString());
      if (params.fromDate) {
        // Remove timezone info (Z) from ISO string
        const fromDateWithoutZ = params.fromDate.replace(/Z$/, "");
        queryParams.append("fromDate", fromDateWithoutZ);
      }
      if (params.toDate) {
        // Remove timezone info (Z) from ISO string
        const toDateWithoutZ = params.toDate.replace(/Z$/, "");
        queryParams.append("toDate", toDateWithoutZ);
      }
      if (params.partnerId !== undefined) queryParams.append("partnerId", params.partnerId.toString());
      if (params.cinemaId !== undefined) queryParams.append("cinemaId", params.cinemaId.toString());
      if (params.customerEmail) queryParams.append("customerEmail", params.customerEmail);
      if (params.customerName) queryParams.append("customerName", params.customerName);
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.pageSize !== undefined) queryParams.append("pageSize", params.pageSize.toString());
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.topByBookingCountSortOrder) queryParams.append("topByBookingCountSortOrder", params.topByBookingCountSortOrder);
      if (params.topByTotalSpentSortOrder) queryParams.append("topByTotalSpentSortOrder", params.topByTotalSpentSortOrder);
      
      const url = `${this.baseURL}/customers/successful-bookings${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
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

export const useGetTopCustomers = (params: GetTopCustomersParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-top-customers", params],
    queryFn: () => managerRegisterService.getTopCustomers(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
