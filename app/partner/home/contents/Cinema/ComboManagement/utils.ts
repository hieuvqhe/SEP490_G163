import type { ComboFilters, ComboFormValues, ComboSortField } from "./types";
import { COMBO_SORT_FIELD_MAP } from "./constants";
import type { PartnerCombosPagination, PartnerCombo } from "@/apis/partner.combo.api";
import { PartnerComboApiError } from "@/apis/partner.combo.api";

export const mapComboToFormValues = (combo?: PartnerCombo | null): ComboFormValues => ({
  name: combo?.name ?? "",
  code: combo?.code ?? "",
  price: combo?.price !== undefined ? String(combo.price) : "",
  description: combo?.description ?? "",
  imageUrl: combo?.imageUrl ?? "",
  isAvailable: combo?.isAvailable ?? true,
});

const parsePrice = (value: string): number => {
  const trimmed = value.trim();
  if (trimmed === "") {
    throw new Error("Vui lòng nhập giá combo");
  }

  const parsed = Number(trimmed.replace(/,/g, ""));
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error("Giá combo phải là số không âm");
  }

  return Math.round(parsed);
};

export const mapFormValuesToCreatePayload = (values: ComboFormValues) => {
  const price = parsePrice(values.price);

  return {
    name: values.name.trim(),
    code: values.code.trim(),
    price,
    description: values.description.trim(),
    imageUrl: values.imageUrl.trim(),
  };
};

export const mapFormValuesToUpdatePayload = (values: ComboFormValues) => {
  const payload: {
    name: string;
    price: number;
    description: string;
    imageUrl: string;
    isAvailable: boolean;
  } = {
    name: values.name.trim(),
    price: parsePrice(values.price),
    description: values.description.trim(),
    imageUrl: values.imageUrl.trim(),
    isAvailable: values.isAvailable,
  };

  return payload;
};

export const mapSortFieldToApi = (field: ComboSortField): string => COMBO_SORT_FIELD_MAP[field] ?? field;

export const getComboErrorMessage = (error: unknown): string => {
  if (error instanceof PartnerComboApiError) {
    return error.message;
  }

  if (error instanceof Error) {
    return error.message;
  }

  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};

export const formatCurrency = (value: number) =>
  new Intl.NumberFormat("vi-VN", { style: "currency", currency: "VND" }).format(value);

export const mapStatusFilterToBoolean = (status: ComboFilters["status"]): boolean | undefined => {
  if (status === "all") return undefined;
  return status === "available";
};

export const normalizePaginationInfo = (
  pagination?: PartnerCombosPagination
): { currentPage: number; totalPages: number } => ({
  currentPage: pagination?.currentPage ?? 1,
  totalPages: pagination?.totalPages ?? 1,
});
