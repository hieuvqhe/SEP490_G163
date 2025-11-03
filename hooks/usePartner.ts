import {
  ContractQueryParams,
  createPartner,
  generateSasSignature,
  GenerateSasSignatureResponse,
  getPartnersContract,
  PartnerApiError,
  PartnerCreateRequest,
  PartnerCreateResponse,
} from "@/apis/partner.api";
import { useMutation, useQuery } from "@tanstack/react-query";

interface UseCreatePartnerOptions {
  onSuccess?: (response: PartnerCreateResponse) => void;
  onError?: (message: string, fieldErrors?: Record<string, string>) => void;
}

const normalizeFieldName = (field: string): string => {
  const normalized = field.toLowerCase();

  switch (normalized) {
    case "password_digit":
      return "password";
    default:
      return normalized;
  }
};

const extractErrorMessage = (value: unknown): string | undefined => {
  if (!value) return undefined;
  if (typeof value === "string") return value;

  if (Array.isArray(value) && value.length > 0) {
    const first = value[0];
    if (typeof first === "string") return first;
    if (first && typeof first === "object") {
      const candidate =
        (first as { msg?: string; message?: string; error?: string }).msg ||
        (first as { msg?: string; message?: string; error?: string }).message ||
        (first as { msg?: string; message?: string; error?: string }).error;
      if (candidate) return candidate;
      return JSON.stringify(first);
    }
    return String(first);
  }

  if (typeof value === "object") {
    const obj = value as {
      msg?: string;
      message?: string;
      error?: string;
      detail?: string;
    };
    return (
      obj.msg || obj.message || obj.error || obj.detail || JSON.stringify(value)
    );
  }

  return String(value);
};

export const useCreatePartner = (options: UseCreatePartnerOptions = {}) => {
  return useMutation<
    PartnerCreateResponse,
    PartnerApiError,
    PartnerCreateRequest
  >({
    mutationFn: (partnerData: PartnerCreateRequest) =>
      createPartner(partnerData),
    onSuccess: (data) => {
      console.log("Create partner success:", data);
      options.onSuccess?.(data);
    },
    onError: (error) => {
      console.log("Create partner error:", error);

      const message =
        typeof error.message === "string" && error.message.trim() !== ""
          ? error.message
          : "Đăng ký thất bại. Vui lòng thử lại.";

      let fieldErrors: Record<string, string> | undefined;

      if (error.errors && typeof error.errors === "object") {
        const normalized: Record<string, string> = {};

        Object.entries(error.errors).forEach(([field, value]) => {
          const messageForField = extractErrorMessage(value);
          if (!messageForField) return;

          normalized[normalizeFieldName(field)] = messageForField;
        });

        if (Object.keys(normalized).length > 0) {
          fieldErrors = normalized;
        }
      }

      options.onError?.(message, fieldErrors);
    },
  });
};

export const useGenerateSasSignature = () => {
  return useMutation<GenerateSasSignatureResponse, PartnerApiError, string>({
    mutationFn: (fileName: string) => generateSasSignature(fileName),
  });
};

export const useGetPartnersContract = (params?: ContractQueryParams) => {
  return useQuery({
    queryKey: ["partners-contract", params],
    queryFn: () => getPartnersContract(params),
    staleTime: 1000 * 60 * 1,
  });
};
