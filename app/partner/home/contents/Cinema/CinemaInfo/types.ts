export type CinemaStatusFilter = "all" | "active" | "inactive";

export interface CinemaFilters {
  search: string;
  city: string;
  district: string;
  status: CinemaStatusFilter;
  sortBy: string;
  sortOrder: "asc" | "desc";
}

export interface CinemaFormValues {
  cinemaName: string;
  address: string;
  phone: string;
  code: string;
  city: string;
  district: string;
  latitude: string;
  longitude: string;
  email: string;
  isActive: boolean;
  logoUrl: string;
  totalScreens: string;
  activeScreens: string;
}

export type CinemaLike = {
  cinemaId?: number;
  partnerId?: number;
  cinemaName?: string;
  address?: string;
  phone?: string;
  code?: string;
  city?: string;
  district?: string;
  latitude?: number;
  longitude?: number;
  email?: string;
  isActive?: boolean;
  logoUrl?: string | null;
  description?: string | null;
  totalScreens?: number;
  activeScreens?: number;
  createdAt?: string;
  updatedAt?: string;
};
