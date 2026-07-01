import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

import {
  getAgreementStatus,
  getAgreements,
  updateMarketingAgreements,
} from "@/api/agreements/agreementsApi";
import { UpdateMarketingRequest } from "@/types/api/agreements/agreementsDTO";

import { queryKeys } from "./queryKeys";

export function useAgreementsQuery(enabled = true) {
  return useQuery({
    queryKey: queryKeys.agreements.list(),
    queryFn: getAgreements,
    enabled,
  });
}

export function useAgreementStatusQuery() {
  return useQuery({
    queryKey: queryKeys.agreements.status(),
    queryFn: getAgreementStatus,
  });
}

export function useUpdateMarketingAgreementsMutation() {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (items: UpdateMarketingRequest["marketingAgreements"]) =>
      updateMarketingAgreements(items),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: queryKeys.agreements.all });
    },
  });
}
