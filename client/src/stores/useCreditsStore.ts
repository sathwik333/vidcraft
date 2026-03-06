import { create } from "zustand";
import api from "@/lib/api";

interface CreditsStore {
  credits: number;
  tier: string;
  isLoading: boolean;
  fetchCredits: () => Promise<void>;
}

export const useCreditsStore = create<CreditsStore>()((set) => ({
  credits: 0,
  tier: "free",
  isLoading: false,

  fetchCredits: async () => {
    set({ isLoading: true });
    try {
      const { data } = await api.get("/credits");
      set({ credits: data.credits, tier: data.tier, isLoading: false });
    } catch {
      set({ isLoading: false });
    }
  },
}));
