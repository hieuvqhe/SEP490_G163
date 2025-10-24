import { BASE_URL } from "@/constants";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";

export interface GetContractsParams {
  page?: number;
  limit?: number;
  managerId?: number;
  partnerId?: number;
  status?: "draft" | "pending" | "pending_signature" | "active" | "expired";
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

export interface Contract {
  contractId: number;
  contractNumber: string;
  title: string;
  contractType: string;
  startDate: string;
  endDate: string;
  commissionRate: number;
  status: "draft" | "pending" | "pending_signature" | "active" | "expired";
  isLocked: boolean;
  createdAt: string;
  updatedAt: string;
  partnerId: number;
  partnerName: string;
  partnerEmail: string;
  partnerPhone: string | null;
  managerId: number;
  managerName: string;
}

export interface ContractsPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetContractsResponse {
  message: string;
  result: {
    contracts: Contract[];
    pagination: ContractsPagination;
  };
}

export interface ManagerApiError {
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

export interface GetPartnersWithoutContractsParams {
  page?: number;
  limit?: number;
  search?: string;
}

export interface PartnerWithoutContract {
  partnerId: number;
  partnerName: string;
}

export interface GetPartnersWithoutContractsResponse {
  message: string;
  result: {
    partners: PartnerWithoutContract[];
    pagination: ContractsPagination;
  };
}

export interface ContractDetail {
  contractId: number;
  managerId: number;
  partnerId: number;
  createdBy: string | null;
  contractNumber: string;
  contractType: string;
  title: string;
  description: string;
  termsAndConditions: string;
  startDate: string;
  endDate: string;
  commissionRate: number;
  minimumRevenue: number;
  status: "draft" | "pending" | "pending_signature" | "active" | "expired";
  isLocked: boolean;
  contractHash: string;
  partnerSignatureUrl: string;
  managerSignature: string;
  signedAt: string;
  partnerSignedAt: string;
  managerSignedAt: string;
  lockedAt: string;
  createdAt: string;
  updatedAt: string;
  partnerName: string;
  partnerAddress: string;
  partnerTaxCode: string;
  partnerRepresentative: string;
  partnerPosition: string;
  partnerEmail: string;
  partnerPhone: string;
  companyName: string;
  companyAddress: string;
  companyTaxCode: string;
  managerName: string;
  managerPosition: string;
  managerEmail: string;
  createdByName: string;
}

export interface GetContractByIdResponse {
  message: string;
  result: ContractDetail;
}

export interface CreateContractRequest {
  partnerId: number;
  contractNumber: string;
  contractType: string;
  title: string;
  description: string;
  termsAndConditions: string;
  startDate: string;
  endDate: string;
  commissionRate: number;
  minimumRevenue: number;
}

export interface CreateContractResponse {
  message: string;
  result: ContractDetail;
}

export interface SendContractPdfRequest {
  pdfUrl: string;
  notes?: string;
}

export interface SendContractPdfResponse {
  message: string;
  result: null;
}

export interface ActivateContractResponse {
  message: string;
  result: ContractDetail;
}

export interface FinalizeContractRequest {
  managerSignature: string;
  notes?: string;
}

export interface FinalizeContractResult {
  contractId: number;
  contractNumber: string;
  title: string;
  status: string;
  isLocked: boolean;
  managerSignature: string;
  managerSignedAt: string;
  lockedAt: string;
  partnerName: string;
  partnerEmail: string;
}

export interface FinalizeContractResponse {
  message: string;
  result: FinalizeContractResult;
}

// --- Generate upload SAS for PDF ---
export interface GenerateUploadSasRequest {
  fileName: string;
}

export interface GenerateUploadSasResult {
  sasUrl: string;
  blobUrl: string;
  expiresAt: string; // ISO timestamp
}

export interface GenerateUploadSasResponse {
  message: string;
  result: GenerateUploadSasResult;
}


class ManagerContractService {
  // Backend exposes manager routes under `${BASE_URL}/manager` (no extra `/api` prefix)
  private baseURL = `${BASE_URL}/manager`;

  async getContracts(params: GetContractsParams, accessToken: string): Promise<GetContractsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.managerId !== undefined) queryParams.append("managerId", params.managerId.toString());
      if (params.partnerId !== undefined) queryParams.append("partnerId", params.partnerId.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${this.baseURL}/contracts${queryParams.toString() ? "?" + queryParams.toString() : ""}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async getPartnersWithoutContracts(params: GetPartnersWithoutContractsParams, accessToken: string): Promise<GetPartnersWithoutContractsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      const url = `${this.baseURL}/partners/without-contracts${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async getContractById(contractId: number, accessToken: string): Promise<GetContractByIdResponse> {
    try {
      const url = `${this.baseURL}/contracts/${contractId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async createContract(data: CreateContractRequest, accessToken: string): Promise<CreateContractResponse> {
    try {
      const url = `${this.baseURL}/contracts`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async sendContractPdf(contractId: number, data: SendContractPdfRequest, accessToken: string): Promise<SendContractPdfResponse> {
    try {
      const url = `${this.baseURL}/contracts/${contractId}/send-pdf`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async activateContract(contractId: number, accessToken: string): Promise<ActivateContractResponse> {
    try {
      const url = `${this.baseURL}/contracts/${contractId}/activate`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify({}),
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async finalizeContract(contractId: number, data: FinalizeContractRequest, accessToken: string): Promise<FinalizeContractResponse> {
    try {
      const url = `${this.baseURL}/contracts/${contractId}/finalize`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }

  async generateUploadSas(data: GenerateUploadSasRequest, accessToken: string): Promise<GenerateUploadSasResponse> {
    try {
      const url = `${this.baseURL}/contracts/generate-upload-sas`;
      const response = await fetch(url, {
        method: "POST",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerApiError;
      }
      return result as GenerateUploadSasResponse;
    } catch (error: any) {
      if (error.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerApiError;
      }
      throw error;
    }
  }
}

export const managerContractService = new ManagerContractService();

export const useGetContracts = (params: GetContractsParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-contracts", params],
    queryFn: () => managerContractService.getContracts(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnersWithoutContracts = (params: GetPartnersWithoutContractsParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-partners-without-contracts", params],
    queryFn: () => managerContractService.getPartnersWithoutContracts(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetContractById = (contractId: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-contract-detail", contractId],
    queryFn: () => managerContractService.getContractById(contractId, accessToken!),
    enabled: !!accessToken && !!contractId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useCreateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: CreateContractRequest; accessToken: string }) =>
      managerContractService.createContract(data, accessToken),
    onSuccess: () => {
      // Invalidate contracts list after creating new contract
      queryClient.invalidateQueries({ queryKey: ["manager-contracts"] });
    },
  });
};

export const useSendContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, data, accessToken }: { contractId: number; data: SendContractPdfRequest; accessToken: string }) =>
      managerContractService.sendContractPdf(contractId, data, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-contracts"] });
    },
  });
};

export const useActivateContract = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ contractId, accessToken }: { contractId: number; accessToken: string }) =>
      managerContractService.activateContract(contractId, accessToken),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["manager-contracts"] });
    },
  });
};

export const useFinalizeContract = () => {
  return useMutation({
    mutationFn: ({ contractId, data, accessToken }: { contractId: number; data: FinalizeContractRequest; accessToken: string }) =>
      managerContractService.finalizeContract(contractId, data, accessToken),
  });
};

export const useGenerateUploadSas = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: GenerateUploadSasRequest; accessToken: string }) =>
      managerContractService.generateUploadSas(data, accessToken),
    onSuccess: (res) => {
      // Optionally invalidate related queries if needed (contracts list or details)
      queryClient.invalidateQueries({ queryKey: ["manager-contracts"] });
    },
  });
};
