export type ComboStatusFilter = "all" | "available" | "unavailable";

export type ComboSortField = "createdAt" | "updatedAt" | "price";

export interface ComboFilters {
  search: string;
  status: ComboStatusFilter;
  sortBy: ComboSortField;
  sortOrder: "asc" | "desc";
}

export interface ComboFormValues {
  name: string;
  code: string;
  price: string;
  description: string;
  imageUrl: string;
  isAvailable: boolean;
}
