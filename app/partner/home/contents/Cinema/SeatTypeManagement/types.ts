export type SeatTypeSortField = "name" | "code" | "surcharge" | "createdAt" | "updatedAt";

export type SeatTypeStatusFilter = "all" | "active" | "inactive";

export interface SeatTypeFilters {
  search: string;
  code: string;
  minSurcharge: string;
  maxSurcharge: string;
  status: SeatTypeStatusFilter;
  sortBy: SeatTypeSortField;
  sortOrder: "asc" | "desc";
}

export interface SeatTypeFormValues {
  code: string;
  name: string;
  surcharge: string;
  color: string;
  description: string;
}
