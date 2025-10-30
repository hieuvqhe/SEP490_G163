import type { PartnerScreen } from "@/apis/partner.screen.api";

export interface ScreenFilters {
  search: string;
  screenType: string;
  status: "all" | "active" | "inactive";
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface ScreenFormValues {
  screenName: string;
  code: string;
  description: string;
  screenType: string;
  soundSystem: string;
  capacity: string;
  seatRows: string;
  seatColumns: string;
  isActive: boolean;
}

export type DetailedPartnerScreen = PartnerScreen | null;
