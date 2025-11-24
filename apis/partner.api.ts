import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { BASE_URL } from "@/constants";

export class PartnerApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(
    message: string,
    status?: number,
    errors?: Record<string, unknown>
  ) {
    super(message);
    this.name = "PartnerApiError";
    this.status = status;
    this.errors = errors;
  }
}

// Create authenticated axios instance for staff requests
export const createPartnerRequest = () => {
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
export const handlePartnerError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;
    const errors = error.response?.data?.errors;

    if (status === 401) {
      throw new PartnerApiError(
        "Unauthorized. Please login as staff.",
        status,
        errors
      );
    } else if (status === 403) {
      throw new PartnerApiError(
        "Access denied. Staff privileges required.",
        status,
        errors
      );
    } else if (status === 404) {
      throw new PartnerApiError(
        message || "Resource not found.",
        status,
        errors
      );
    } else if (status === 400) {
      throw new PartnerApiError(
        message || "Invalid request data.",
        status,
        errors
      );
    } else if (status === 500) {
      throw new PartnerApiError(
        "Server error. Please try again later.",
        status,
        errors
      );
    } else {
      throw new PartnerApiError(message || "Request failed.", status, errors);
    }
  }
  throw new PartnerApiError("Network error. Please check your connection.");
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
  additionalDocumentsUrls: string[];
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
  description?: string;
  contractType: "partnership" | "service" | "other"; // có thể mở rộng
  termsAndConditions?: string;
  startDate: string; // ISO date string (vd: "2024-02-01")
  endDate: string;
  commissionRate: number;
  minimumRevenue: number;
  status: "active" | "inactive" | "terminated" | "pending"; // enum-like union
  isLocked: boolean;
  isActive?: boolean;
  contractHash?: string;
  partnerSignatureUrl: string;
  managerSignature: string;
  signedAt: string | null; // nếu chưa ký
  partnerSignedAt: string | null;
  managerSignedAt: string | null;
  lockedAt?: string | null;
  createdAt: string;
  updatedAt: string;
  partnerId: number;
  partnerName: string;
  partnerAddress?: string;
  partnerTaxCode?: string;
  partnerRepresentative?: string;
  partnerPosition?: string;
  partnerEmail: string;
  partnerPhone: string;
  managerId: number;
  managerName: string;
  managerPosition?: string;
  managerEmail: string;
  companyName?: string;
  companyAddress?: string;
  companyTaxCode?: string;
  createdBy?: number;
  createdByName?: string;
}

export interface GetContractsResponse {
  message: string;
  result: {
    contracts: [Contract];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasPrevious: boolean;
      hasNext: boolean;
    };
  };
}

export interface GetContractsByIdResponse {
  message: string;
  result: Contract;
}

export interface ContractQueryParams {
  page?: number;
  limit?: number;
  status?: "active" | "inactive" | "terminated" | "pending" | "all";
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
    if (params?.status && params.status !== "all") {
      queryParams.append("status", params.status);
    }
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

export interface GenerateSasSignatureRequest {
  fileName: string;
}

export interface GenerateSasSignatureResponse {
  message: string;
  result: {
    sasUrl: string;
    blobUrl: string;
    expiresAt: Date;
  };
}

export const generateSasSignature = async (
  payload: GenerateSasSignatureRequest
): Promise<GenerateSasSignatureResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.post(
      `/partners/contracts/generate-signature-upload-sas`,
      payload
    );
    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};
