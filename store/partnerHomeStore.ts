import { create } from "zustand";

interface SeatLayoutContextState {
  cinemaId: number | null;
  cinemaName: string | null;
  screenId: number | null;
  screenName: string | null;
}

interface PartnerHomeState {
  activeTab: string;
  setActiveTab: (tab: string) => void;
  seatLayoutContext: SeatLayoutContextState;
  setSeatLayoutContext: (context: Partial<SeatLayoutContextState>) => void;
  resetSeatLayoutContext: () => void;
}

const initialSeatLayoutContext: SeatLayoutContextState = {
  cinemaId: null,
  cinemaName: null,
  screenId: null,
  screenName: null,
};

export const usePartnerHomeStore = create<PartnerHomeState>((set) => ({
  activeTab: "overview",
  setActiveTab: (tab) =>
    set((state) => ({
      activeTab: tab,
      seatLayoutContext:
        tab === "seating-chart"
          ? state.seatLayoutContext
          : { ...initialSeatLayoutContext },
    })),
  seatLayoutContext: { ...initialSeatLayoutContext },
  setSeatLayoutContext: (context) =>
    set((state) => ({
      seatLayoutContext: { ...state.seatLayoutContext, ...context },
    })),
  resetSeatLayoutContext: () => set({ seatLayoutContext: { ...initialSeatLayoutContext } }),
}));

export type { SeatLayoutContextState };
