import { useEffect } from "react";
import { useCreditsStore } from "@/stores/useCreditsStore";

export function useCredits() {
  const { credits, tier, isLoading, fetchCredits } = useCreditsStore();

  useEffect(() => {
    fetchCredits();
  }, [fetchCredits]);

  return { credits, tier, isLoading, refetch: fetchCredits };
}
