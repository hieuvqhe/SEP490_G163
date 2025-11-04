import type { PartnerShowtime, PartnerShowtimeStatus } from "@/apis/partner.showtime.api";
import type { Movie } from "@/types/movie.type";
import type { PartnerCinema } from "@/apis/partner.cinema.api";
import type { PartnerScreen } from "@/apis/partner.screen.api";

export interface ShowtimeFilters {
  status: "all" | PartnerShowtimeStatus;
  date: string;
  sortBy: "start_time" | "end_time" | "base_price";
  sortOrder: "asc" | "desc";
}

export interface ShowtimePaginationState {
  page: number;
  limit: number;
}

export interface ShowtimeFormValues {
  startTime: string;
  endTime: string;
  basePrice: string;
  availableSeats: string;
  formatType: string;
  status: PartnerShowtimeStatus;
}

export interface SelectedContext {
  movie: Movie | null;
  cinema: PartnerCinema | null;
  screen: PartnerScreen | null;
}

export interface ShowtimeListItem extends PartnerShowtime {}

export type ShowtimeTableSortField = ShowtimeFilters["sortBy"];
