import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { BASE_URL } from "@/constants";

// Create authenticated axios instance for staff requests
const createPartnerRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Handle Partner API errors
const handlePartnerError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login as staff.");
    } else if (status === 403) {
      throw new Error("Access denied. Staff privileges required.");
    } else if (status === 404) {
      throw new Error(message || "Resource not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

// ===============================
// THEATER TYPES
// ===============================
export interface Partner {
  userId: number;
  email: string;
  phone: string;
  fullName: string;
  avatarUrl: string;
  partnerId: number;
  partnerName: string;
  taxCode: string;
  address: string;
  commissionRate: number;
  businessRegistrationCertificateUrl: string;
  taxRegistrationCertificateUrl: string;
  identityCardUrl: string;
  theaterPhotosUrls: [string];
  status: "approve" | "pending" | "reject";
  createdAt: Date;
  updatedAt: Date;
}

export interface PartnerResponse {
  message: string;
  result: Partner;
}

export interface PartnerCreateRequest {
  email: string;
  password: string;
  confirmPassword: string;
  fullName: string;
  phone: string;
  partnerName: string;
  taxCode: string;
  address: string;
  commissionRate: number;
  businessRegistrationCertificateUrl: string;
  taxRegistrationCertificateUrl: string;
  identityCardUrl: string;
  theaterPhotosUrls: string[];
}

export interface PartnerCreateResponse {
  message: string;
  result: {
    partnerId: number;
    status: "pending" | "success" | "error";
    createdAt: Date;
  };
}

export interface PartnerUpdateResponse {
  message: string;
  result: Partner;
}

export interface Contract {
  contractId: number;
  contractNumber: string;
  title: string;
  contractType: "partnership" | "service" | "other"; // có thể mở rộng
  startDate: string; // ISO date string (vd: "2024-02-01")
  endDate: string;
  commissionRate: number;
  minimumRevenue: number;
  status: "active" | "inactive" | "terminated" | "pending"; // enum-like union
  isLocked: boolean;
  isActive: boolean;
  partnerSignatureUrl: string;
  managerSignature: string;
  signedAt: string | null; // nếu chưa ký
  partnerSignedAt: string | null;
  managerSignedAt: string | null;
  createdAt: string;
  updatedAt: string;
  partnerId: number;
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string;
  managerId: number;
  managerName: string;
  managerEmail: string;
}

export interface GetContractsResponse {
  message: string;
  result: {
    contracts: [Contract];
  };
}

export interface GetContractsByIdResponse {
  message: string;
  result: Contract;
}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "terminated" | "pending";
  contractType?: "partnership" | "service" | "other";
  search?: string;
  sortBy: "asc" | "desc";
  sortOrder?: "asc" | "desc";
}

// eslint-disable-next-line @typescript-eslint/no-empty-object-type
export interface PartnerUpdateRequest extends PartnerCreateRequest {}

export interface UploadSignaturesRequest {
  signatureImageUrl: string;
  notes: string;
}

export interface UploadSignaturesResponse {
  message: string;
  result: {
    contractId: number;
    contractNumber: string;
    title: string;
    status: "pending" | "success" | "error";
    partnerSignatureUrl: string;
    partnerSignedAt: Date;
    updatedAt: Date;
  };
}

// ===============================
// THEATER MANAGEMENT APIS
// ===============================

export const createPartner = async (
  partnerData: PartnerCreateRequest
): Promise<PartnerCreateResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.post("/partners/register", partnerData);
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};

export const updatePartnerProfile = async (
  partnerId: string,
  partnerData: PartnerUpdateRequest
): Promise<PartnerUpdateResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.patch("/partners/profile", partnerData);
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};

export const getPartnerProfile = async (): Promise<PartnerResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.get("/partners/profile");
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};

export const getPartnersContract = async (
  params?: ContractQueryParams
): Promise<GetContractsResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.status) queryParams.append("status", params.status);
    if (params?.contractType)
      queryParams.append("contractType", params.contractType);
    if (params?.search) queryParams.append("search", params.search);
    if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
    if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

    const url = `/partners/contracts${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await partnerApi.get<GetContractsResponse>(url);
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};

export const getPartnersContractById = async (
  contractId: string
): Promise<GetContractsByIdResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.get(`/partners/contracts/${contractId}`);
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};

export const uploadSignaturesImage = async (
  contractId: string,
  signaturesData: UploadSignaturesRequest
): Promise<UploadSignaturesResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.post(
      `/partners/contracts/${contractId}/upload-signature`,
      signaturesData
    );
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};
