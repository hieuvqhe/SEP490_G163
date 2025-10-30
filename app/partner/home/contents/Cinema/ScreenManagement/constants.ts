import type { ScreenFilters, ScreenFormValues } from "./types";

export const screenTypeOptions: { label: string; value: string }[] = [
  { label: "Tất cả loại phòng", value: "all" },
  { label: "Standard", value: "standard" },
  { label: "IMAX", value: "imax" },
  { label: "Premium", value: "premium" },
  { label: "4DX", value: "4dx" },
  { label: "Dolby Atmos", value: "dolby" },
];

export const defaultScreenFilters: ScreenFilters = {
  search: "",
  screenType: "all",
  status: "all",
  sortBy: "screenName",
  sortOrder: "asc",
};

export const defaultScreenFormValues: ScreenFormValues = {
  screenName: "",
  code: "",
  description: "",
  screenType: "standard",
  soundSystem: "",
  capacity: "",
  seatRows: "",
  seatColumns: "",
  isActive: true,
};
