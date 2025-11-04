import { useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ShowtimeFormValues } from "../types";
import { showtimeStatusOptions } from "../constants";
import type { Movie } from "@/types/movie.type";
import type { PartnerCinema } from "@/apis/partner.cinema.api";
import type { PartnerScreen } from "@/apis/partner.screen.api";
import type { PartnerShowtime } from "@/apis/partner.showtime.api";

interface ShowtimeFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  values: ShowtimeFormValues;
  onClose: () => void;
  onSubmit: (values: ShowtimeFormValues) => void;
  submitting?: boolean;
  movie?: Movie | null;
  cinema?: PartnerCinema | null;
  screen?: PartnerScreen | null;
  existingShowtimes?: PartnerShowtime[];
  editingShowtimeId?: number | null;
}

const ShowtimeFormModal = ({
  open,
  mode,
  values: initialValues,
  onClose,
  onSubmit,
  submitting,
  movie,
  cinema,
  screen,
  existingShowtimes = [],
  editingShowtimeId = null,
}: ShowtimeFormModalProps) => {
  const [values, setValues] = useState<ShowtimeFormValues>(initialValues);
  const [errors, setErrors] = useState<Partial<Record<keyof ShowtimeFormValues, string>>>({});
  const [hasTimeConflict, setHasTimeConflict] = useState(false);

  const durationMinutes = movie?.durationMinutes ?? null;
  const cleanupBufferMinutes = 15;

  const existingRanges = useMemo(
    () =>
      existingShowtimes
        .map((item) => {
          const start = new Date(item.startTime);
          const end = new Date(item.endTime);
          if (Number.isNaN(start.getTime()) || Number.isNaN(end.getTime())) {
            return null;
          }
          return { id: item.showtimeId, start, end };
        })
        .filter((range): range is { id: number; start: Date; end: Date } => Boolean(range)),
    [existingShowtimes]
  );

  const formatDateToInputValue = (date: Date): string => {
    const year = date.getFullYear();
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const day = String(date.getDate()).padStart(2, "0");
    const hours = String(date.getHours()).padStart(2, "0");
    const minutes = String(date.getMinutes()).padStart(2, "0");
    return `${year}-${month}-${day}T${hours}:${minutes}`;
  };

  const parseInputDate = (value: string): Date | null => {
    if (!value) return null;
    const date = new Date(value);
    if (Number.isNaN(date.getTime())) return null;
    return date;
  };

  const computeEndTimeValue = (startValue: string): string | null => {
    if (!durationMinutes) return null;
    const startDate = parseInputDate(startValue);
    if (!startDate) return null;
    const endDate = new Date(startDate);
    const totalMinutes = durationMinutes + cleanupBufferMinutes;
    endDate.setMinutes(endDate.getMinutes() + totalMinutes);
    return formatDateToInputValue(endDate);
  };

  const isOverlappingRange = (start: Date, end: Date) => {
    return existingRanges.some((range) => {
      if (editingShowtimeId && range.id === editingShowtimeId) {
        return false;
      }
      return start < range.end && end > range.start;
    });
  };

  useEffect(() => {
    if (open) {
      setValues(initialValues);
      setErrors({});
      setHasTimeConflict(false);
    }
  }, [open, initialValues]);

  const summary = useMemo(() => {
    const infos = [
      movie ? `${movie.title}` : null,
      cinema ? `${cinema.cinemaName}` : null,
      screen ? `${screen.screenName}` : null,
    ].filter(Boolean);
    return infos.join(" • ");
  }, [movie, cinema, screen]);

  const handleChange = (
    field: keyof ShowtimeFormValues,
    value: string | ShowtimeFormValues["status"]
  ) => {
    setValues((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: undefined }));
  };

  const handleStartTimeChange = (value: string) => {
    const autoEnd = computeEndTimeValue(value);
    const nextValues = {
      ...values,
      startTime: value,
      endTime: autoEnd ?? values.endTime,
    };

    const startDate = parseInputDate(nextValues.startTime);
    const endDate = parseInputDate(nextValues.endTime);

    setValues(nextValues);

    if (startDate && endDate && isOverlappingRange(startDate, endDate)) {
      setErrors((prev) => ({
        ...prev,
        startTime: "Khoảng thời gian này đã có suất chiếu khác trong phòng",
      }));
      setHasTimeConflict(true);
      return;
    }

    setErrors((prev) => ({
      ...prev,
      startTime: undefined,
      endTime: undefined,
    }));
    setHasTimeConflict(false);
  };

  const handleEndTimeChange = (value: string) => {
    const nextValues = {
      ...values,
      endTime: value,
    };

    const startDate = parseInputDate(nextValues.startTime);
    const endDate = parseInputDate(value);

    setValues(nextValues);

    if (startDate && endDate) {
      if (endDate <= startDate) {
        setErrors((prev) => ({
          ...prev,
          endTime: "Thời gian kết thúc phải sau thời gian bắt đầu",
        }));
        setHasTimeConflict(false);
        return;
      }

      if (isOverlappingRange(startDate, endDate)) {
        setErrors((prev) => ({
          ...prev,
          endTime: "Khoảng thời gian này đã có suất chiếu khác trong phòng",
        }));
        setHasTimeConflict(true);
        return;
      }
    }

    setErrors((prev) => ({
      ...prev,
      startTime: undefined,
      endTime: undefined,
    }));
    setHasTimeConflict(false);
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof ShowtimeFormValues, string>> = {};

    if (!values.startTime) nextErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    if (!values.endTime) nextErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    if (!values.basePrice.trim()) nextErrors.basePrice = "Vui lòng nhập giá cơ bản";
    if (!values.availableSeats.trim()) nextErrors.availableSeats = "Vui lòng nhập số ghế khả dụng";
    if (!values.formatType.trim()) nextErrors.formatType = "Vui lòng nhập định dạng";

    const startDate = parseInputDate(values.startTime);
    const endDate = parseInputDate(values.endTime);

    if (startDate && endDate) {
      if (endDate <= startDate) {
        nextErrors.endTime = nextErrors.endTime ?? "Thời gian kết thúc phải sau thời gian bắt đầu";
      } else if (isOverlappingRange(startDate, endDate)) {
        nextErrors.startTime =
          nextErrors.startTime ?? "Phòng chiếu đã có suất chiếu trong khoảng thời gian này";
        setHasTimeConflict(true);
      }
    }

    if (!nextErrors.startTime && !nextErrors.endTime) {
      setHasTimeConflict(false);
    }

    setErrors(nextErrors);
    return Object.keys(nextErrors).length === 0;
  };

  const handleSubmit = () => {
    if (!validate()) return;
    onSubmit(values);
  };

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "create" ? "Thêm suất chiếu" : "Chỉnh sửa suất chiếu"}
      size="lg"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-5">
        {summary && (
          <div className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4 text-sm text-[#9e9ea2]">
            <p className="text-xs uppercase tracking-wide text-[#f5f5f5]/70">Bối cảnh suất chiếu</p>
            <p className="mt-1 text-[#f5f5f5]">{summary}</p>
            {durationMinutes ? (
              <p className="mt-1 text-xs text-[#9e9ea2]">Thời lượng phim: {durationMinutes} phút</p>
            ) : null}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Thời gian bắt đầu <span className="text-rose-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={values.startTime}
              onChange={(event) => handleStartTimeChange(event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.startTime && <p className="text-xs text-rose-400">{errors.startTime}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Thời gian kết thúc <span className="text-rose-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={values.endTime}
              onChange={(event) => handleEndTimeChange(event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.endTime && <p className="text-xs text-rose-400">{errors.endTime}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-3">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Giá cơ bản (VND) <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={0}
              value={values.basePrice}
              onChange={(event) => handleChange("basePrice", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.basePrice && <p className="text-xs text-rose-400">{errors.basePrice}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Ghế khả dụng <span className="text-rose-400">*</span>
            </label>
            <Input
              type="number"
              min={0}
              value={values.availableSeats}
              onChange={(event) => handleChange("availableSeats", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.availableSeats && <p className="text-xs text-rose-400">{errors.availableSeats}</p>}
          </div>
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Định dạng chiếu <span className="text-rose-400">*</span>
            </label>
            <Input
              value={values.formatType}
              onChange={(event) => handleChange("formatType", event.target.value)}
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] uppercase focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.formatType && <p className="text-xs text-rose-400">{errors.formatType}</p>}
          </div>
        </div>

        <div className="space-y-2">
          <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
            Trạng thái suất chiếu
          </label>
          <select
            value={values.status}
            onChange={(event) => handleChange("status", event.target.value as ShowtimeFormValues["status"])}
            className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
          >
            {showtimeStatusOptions
              .filter((option) => option.value !== "all")
              .map((option) => (
                <option key={option.value} value={option.value} className="bg-[#151518] text-[#f5f5f5]">
                  {option.label}
                </option>
              ))}
          </select>
        </div>

        <div className="flex justify-end gap-3">
          <Button
            variant="outline"
            onClick={onClose}
            disabled={submitting}
            className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]"
          >
            Đóng
          </Button>
          <Button
            onClick={handleSubmit}
            disabled={submitting || hasTimeConflict}
            className="bg-[#ff7a45] text-[#151518] hover:bg-[#ff8d60] shadow-lg shadow-[#ff7a45]/40"
          >
            {submitting ? "Đang xử lý..." : mode === "create" ? "Thêm suất chiếu" : "Cập nhật"}
          </Button>
        </div>
      </div>
    </Modal>
  );
};

export default ShowtimeFormModal;
