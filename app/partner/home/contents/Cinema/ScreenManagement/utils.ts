import {
  PartnerScreen,
  PartnerScreenApiError,
  type CreatePartnerScreenRequest,
  type UpdatePartnerScreenRequest,
} from "@/apis/partner.screen.api";
import type { ScreenFormValues } from "./types";
import { defaultScreenFormValues } from "./constants";

export const getScreenErrorMessage = (error: unknown): string => {
  if (error instanceof PartnerScreenApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};

export const mapScreenToFormValues = (screen: PartnerScreen | null): ScreenFormValues => {
  if (!screen) {
    return { ...defaultScreenFormValues };
  }

  return {
    screenName: screen.screenName ?? "",
    code: screen.code ?? "",
    description: screen.description ?? "",
    screenType: screen.screenType ?? "standard",
    soundSystem: screen.soundSystem ?? "",
    capacity: screen.capacity ? String(screen.capacity) : "",
    seatRows: screen.seatRows ? String(screen.seatRows) : "",
    seatColumns: screen.seatColumns ? String(screen.seatColumns) : "",
    isActive: !!screen.isActive,
  };
};

const parsePositiveInt = (value: string, field: string) => {
  const parsed = parseInt(value, 10);
  if (Number.isNaN(parsed) || parsed <= 0) {
    throw new Error(`${field} phải lớn hơn 0`);
  }
  return parsed;
};

export const mapFormValuesToCreatePayload = (
  values: ScreenFormValues,
): CreatePartnerScreenRequest => {
  const capacity = parsePositiveInt(values.capacity, "Sức chứa");
  const seatRows = parsePositiveInt(values.seatRows, "Số hàng ghế");
  const seatColumns = parsePositiveInt(values.seatColumns, "Số ghế mỗi hàng");

  return {
    screenName: values.screenName.trim(),
    code: values.code.trim(),
    description: values.description.trim(),
    screenType: values.screenType.trim(),
    soundSystem: values.soundSystem.trim(),
    capacity,
    seatRows,
    seatColumns,
  };
};

export const mapFormValuesToUpdatePayload = (
  values: ScreenFormValues,
): UpdatePartnerScreenRequest => ({
  ...mapFormValuesToCreatePayload(values),
  isActive: values.isActive,
});
