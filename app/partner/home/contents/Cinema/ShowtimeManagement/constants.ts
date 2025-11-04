import type { ShowtimeFilters, ShowtimeFormValues } from "./types";

export const showtimeStatusOptions: { label: string; value: ShowtimeFilters["status"] }[] = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Sắp diễn ra", value: "scheduled" },
  { label: "Đã chiếu", value: "finished" },
];

export const showtimeSortByOptions: { label: string; value: ShowtimeFilters["sortBy"] }[] = [
  { label: "Thời gian bắt đầu", value: "start_time" },
  { label: "Thời gian kết thúc", value: "end_time" },
  { label: "Giá cơ bản", value: "base_price" },
];

export const defaultShowtimeFilters: ShowtimeFilters = {
  status: "all",
  date: "",
  sortBy: "start_time",
  sortOrder: "asc",
};

export const defaultShowtimeFormValues: ShowtimeFormValues = {
  startTime: "",
  endTime: "",
  basePrice: "",
  availableSeats: "",
  formatType: "2D",
  status: "scheduled",
};
