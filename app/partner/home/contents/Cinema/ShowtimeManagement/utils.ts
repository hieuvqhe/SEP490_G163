import {
  type CreatePartnerShowtimeRequest,
  PartnerShowtimeApiError,
  type PartnerShowtime,
  type PartnerShowtimeStatus,
  type UpdatePartnerShowtimeRequest,
} from "@/apis/partner.showtime.api";
import type { ShowtimeFormValues } from "./types";

export const getShowtimeErrorMessage = (error: unknown): string => {
  if (error instanceof PartnerShowtimeApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};

const toLocalInputValue = (isoValue?: string | null): string => {
  if (!isoValue) return "";
  const date = new Date(isoValue);
  if (Number.isNaN(date.getTime())) return "";
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}`;
};

export const mapShowtimeToFormValues = (showtime: PartnerShowtime | null): ShowtimeFormValues => {
  if (!showtime) {
    return {
      startTime: "",
      endTime: "",
      basePrice: "",
      availableSeats: "",
      formatType: "2D",
      status: "scheduled",
    };
  }

  return {
    startTime: toLocalInputValue(showtime.startTime),
    endTime: toLocalInputValue(showtime.endTime),
    basePrice: String(showtime.basePrice ?? ""),
    availableSeats: showtime.availableSeats ? String(showtime.availableSeats) : "",
    formatType: showtime.formatType?.toUpperCase() ?? "2D",
    status: showtime.status,
  };
};

const parsePositiveNumber = (value: string, field: string): number => {
  const parsed = Number(value);
  if (!Number.isFinite(parsed) || parsed <= 0) {
    throw new Error(`${field} phải lớn hơn 0`);
  }
  return parsed;
};

const normalizeFormatType = (value: string): string => {
  return value.trim() || "2D";
};

const normalizeDateTimeToISO = (localValue: string, field: string): string => {
  if (!localValue) {
    throw new Error(`${field} không được để trống`);
  }
  const date = new Date(localValue);
  if (Number.isNaN(date.getTime())) {
    throw new Error(`${field} không hợp lệ`);
  }
  const year = date.getFullYear();
  const month = String(date.getMonth() + 1).padStart(2, "0");
  const day = String(date.getDate()).padStart(2, "0");
  const hours = String(date.getHours()).padStart(2, "0");
  const minutes = String(date.getMinutes()).padStart(2, "0");
  const seconds = String(date.getSeconds()).padStart(2, "0");
  return `${year}-${month}-${day}T${hours}:${minutes}:${seconds}`;
};

export const mapFormValuesToCreatePayload = (
  values: ShowtimeFormValues,
  {
    movieId,
    cinemaId,
    screenId,
  }: { movieId: number; cinemaId: number; screenId: number }
): CreatePartnerShowtimeRequest => {
  const startTimeIso = normalizeDateTimeToISO(values.startTime, "Thời gian bắt đầu");
  const endTimeIso = normalizeDateTimeToISO(values.endTime, "Thời gian kết thúc");
  const basePrice = parsePositiveNumber(values.basePrice, "Giá cơ bản");
  const availableSeats = parsePositiveNumber(values.availableSeats, "Số ghế khả dụng");

  return {
    movieId,
    cinemaId,
    screenId,
    startTime: startTimeIso,
    endTime: endTimeIso,
    basePrice,
    availableSeats,
    formatType: normalizeFormatType(values.formatType),
    status: values.status,
  };
};

export const mapFormValuesToUpdatePayload = (
  values: ShowtimeFormValues,
  context: { movieId: number; cinemaId: number; screenId: number }
): UpdatePartnerShowtimeRequest => ({
  ...mapFormValuesToCreatePayload(values, context),
});

export const formatShowtimeDate = (iso: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleDateString("vi-VN", {
    year: "numeric",
    month: "2-digit",
    day: "2-digit",
  });
};

export const formatShowtimeTime = (iso: string): string => {
  if (!iso) return "";
  const date = new Date(iso);
  if (Number.isNaN(date.getTime())) return "";
  return date.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });
};

export const formatCurrency = (value: number | string): string => {
  const numericValue = typeof value === "string" ? Number(value) : value;
  if (!Number.isFinite(numericValue)) {
    return String(value);
  }
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
    maximumFractionDigits: 0,
  }).format(numericValue);
};
