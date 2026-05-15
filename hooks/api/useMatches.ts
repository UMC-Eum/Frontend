import { useQuery } from "@tanstack/react-query";

import { getMatchCount } from "@/api/matches/matchesApi";

import { queryKeys } from "./queryKeys";

export function useMatchCountQuery() {
  return useQuery({
    queryKey: queryKeys.matches.count(),
    queryFn: getMatchCount,
  });
}
