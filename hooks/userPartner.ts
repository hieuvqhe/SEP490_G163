import { createPartner, PartnerCreateRequest } from "@/apis/partner.api";
import { useMutation } from "@tanstack/react-query";

export const useCreatePartner = () => {
  return useMutation({
    mutationFn: (partnerData: PartnerCreateRequest) =>
      createPartner(partnerData),
    onSuccess: (data) => {
      console.log("Create partner success:", data);
    },
    onError: (error) => {
      console.log("Create partner error:", error);
    },
  });
};
