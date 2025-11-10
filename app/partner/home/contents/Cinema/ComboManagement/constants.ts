import type { ComboFilters, ComboFormValues, ComboSortField } from "./types";

export const DEFAULT_COMBO_FILTERS: ComboFilters = {
  search: "",
  status: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

export const DEFAULT_COMBO_FORM_VALUES: ComboFormValues = {
  name: "",
  code: "",
  price: "",
  description: "",
  imageUrl: "",
  isAvailable: true,
};

export const COMBO_SORT_FIELD_MAP: Record<ComboSortField, string> = {
  createdAt: "created_at",
  updatedAt: "updated_at",
  price: "price",
};
