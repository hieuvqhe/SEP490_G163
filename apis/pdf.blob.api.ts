import { useMutation } from "@tanstack/react-query";

import { createPartnerRequest, handlePartnerError, PartnerApiError } from "./partner.api";

export interface GenerateReadSasRequest {
  blobUrl: string;
  expiryInDays?: number;
}

export interface GenerateReadSasResponse {
  message: string;
  result: {
    readSasUrl: string;
    expiresAt: string;
  };
}

export const generateReadSasUrl = async (
  payload: GenerateReadSasRequest
): Promise<GenerateReadSasResponse> => {
  try {
    const partnerApi = createPartnerRequest();
    const response = await partnerApi.post<GenerateReadSasResponse>(
      "/api/files/generate-read-sas",
      {
        blobUrl: payload.blobUrl,
        expiryInDays: payload.expiryInDays ?? 7,
      }
    );

    return response.data;
  } catch (error) {
    throw handlePartnerError(error);
  }
};

export const useGenerateReadSasUrl = () => {
  return useMutation<GenerateReadSasResponse, PartnerApiError, GenerateReadSasRequest>({
    mutationFn: (payload) => generateReadSasUrl(payload),
  });
};
