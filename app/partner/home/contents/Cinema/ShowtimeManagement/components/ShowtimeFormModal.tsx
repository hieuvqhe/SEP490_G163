import { useCallback, useEffect, useMemo, useState } from "react";
import Modal from "@/components/ui/modal";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import type { ShowtimeFormValues } from "../types";
import { showtimeStatusOptions } from "../constants";
import type { Movie } from "@/types/movie.type";
import type { PartnerCinema } from "@/apis/partner.cinema.api";
import type { PartnerScreen } from "@/apis/partner.screen.api";
import type { PartnerShowtime } from "@/apis/partner.showtime.api";
import { Info } from "lucide-react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

type GuideStep = {
  element: string;
  popover: {
    title: string;
    description: string;
    side: "bottom" | "right";
    align: "start";
  };
};

interface ShowtimeFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  values: ShowtimeFormValues;
  onClose: () => void;
  onSubmit: (values: ShowtimeFormValues) => void;
  onBulkCreate?: (showtimes: ShowtimeFormValues[]) => Promise<void> | void;
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
  onBulkCreate,
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
  const [bulkStartTime, setBulkStartTime] = useState("");
  const [bulkEndTime, setBulkEndTime] = useState("");
  const [bulkCleanupMinutes, setBulkCleanupMinutes] = useState("10");
  const [bulkError, setBulkError] = useState<string | null>(null);
  const [generatedBulkShowtimes, setGeneratedBulkShowtimes] = useState<
    { startTime: string; endTime: string }[]
  >([]);

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

  const formatDateDMY = (date: Date): string => {
    const day = String(date.getDate()).padStart(2, "0");
    const month = String(date.getMonth() + 1).padStart(2, "0");
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const formatBulkSlotLabel = (startValue: string, endValue: string): string => {
    const startDate = parseInputDate(startValue);
    const endDate = parseInputDate(endValue);
    if (!startDate || !endDate) {
      return `${startValue} → ${endValue}`;
    }
    const timeFormatter = new Intl.DateTimeFormat("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    const sameDay = startDate.toDateString() === endDate.toDateString();
    if (sameDay) {
      return `${formatDateDMY(startDate)} • ${timeFormatter.format(startDate)} - ${timeFormatter.format(endDate)}`;
    }
    return `${formatDateDMY(startDate)} ${timeFormatter.format(startDate)} → ${formatDateDMY(endDate)} ${timeFormatter.format(endDate)}`;
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
      setBulkStartTime("");
      setBulkEndTime("");
      setBulkCleanupMinutes("10");
      setBulkError(null);
      setGeneratedBulkShowtimes([]);
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
    // Validate basePrice to prevent negative values
    if (field === "basePrice" && typeof value === "string") {
      const numValue = parseFloat(value);
      if (value !== "" && numValue < 0) {
        setErrors((prev) => ({ 
          ...prev, 
          basePrice: "Giá cơ bản không được âm" 
        }));
        return;
      }
    }
    
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

  const validateBulkCommonFields = () => {
    const nextErrors: Partial<Record<keyof ShowtimeFormValues, string>> = {};

    if (!values.basePrice.trim()) {
      nextErrors.basePrice = "Vui lòng nhập giá cơ bản";
    } else {
      const priceValue = parseFloat(values.basePrice);
      if (isNaN(priceValue) || priceValue < 0) {
        nextErrors.basePrice = "Giá cơ bản không được âm";
      }
    }
    if (!values.availableSeats.trim()) nextErrors.availableSeats = "Vui lòng nhập số ghế khả dụng";
    if (!values.formatType.trim()) nextErrors.formatType = "Vui lòng nhập định dạng";

    setErrors((prev) => ({ ...prev, ...nextErrors }));

    return Object.keys(nextErrors).length === 0;
  };

  const handleBulkGenerate = () => {
    setBulkError(null);

    if (!durationMinutes) {
      setBulkError("Không thể tạo hàng loạt vì chưa có thời lượng phim.");
      return;
    }

    const startDate = parseInputDate(bulkStartTime ?? "");
    const endDate = parseInputDate(bulkEndTime ?? "");
    const cleanup = Number.parseInt(bulkCleanupMinutes, 10);

    if (!startDate || !endDate) {
      setBulkError("Vui lòng nhập đầy đủ thời gian bắt đầu và kết thúc.");
      return;
    }

    if (endDate <= startDate) {
      setBulkError("Thời gian kết thúc phải sau thời gian bắt đầu.");
      return;
    }

    if (!Number.isFinite(cleanup) || cleanup < 0) {
      setBulkError("Thời gian nghỉ phải là số phút không âm.");
      return;
    }

    const generated: { startTime: string; endTime: string }[] = [];
    const generatedRanges: { start: Date; end: Date }[] = [];

    let currentStart = new Date(startDate);
    let safetyCounter = 0;
    const safetyLimit = 500;

    while (currentStart < endDate && safetyCounter < safetyLimit) {
      const slotStart = new Date(currentStart);
      const slotEnd = new Date(currentStart);
      slotEnd.setMinutes(slotEnd.getMinutes() + durationMinutes);

      if (slotEnd > endDate) {
        break;
      }

      const hasConflictWithExisting = isOverlappingRange(slotStart, slotEnd);
      const hasConflictWithGenerated = generatedRanges.some((range) => slotStart < range.end && slotEnd > range.start);

      if (hasConflictWithExisting) {
        setBulkError("Khoảng thời gian sinh ra bị trùng với suất chiếu đã có. Vui lòng điều chỉnh.");
        setGeneratedBulkShowtimes([]);
        return;
      }

      if (hasConflictWithGenerated) {
        setBulkError("Khoảng thời gian sinh ra bị trùng nhau. Vui lòng kiểm tra dữ liệu.");
        setGeneratedBulkShowtimes([]);
        return;
      }

      generated.push({
        startTime: formatDateToInputValue(slotStart),
        endTime: formatDateToInputValue(slotEnd),
      });
      generatedRanges.push({ start: slotStart, end: slotEnd });

      currentStart = new Date(slotEnd);
      currentStart.setMinutes(currentStart.getMinutes() + cleanup);
      safetyCounter += 1;
    }

    if (safetyCounter >= safetyLimit) {
      setBulkError("Không thể sinh lịch. Vui lòng kiểm tra lại thông tin đầu vào.");
      setGeneratedBulkShowtimes([]);
      return;
    }

    if (!generated.length) {
      setBulkError("Không tạo được suất chiếu nào trong khoảng thời gian đã chọn.");
      setGeneratedBulkShowtimes([]);
      return;
    }

    setGeneratedBulkShowtimes(generated);
  };

  const handleBulkApply = async () => {
    if (!onBulkCreate) {
      setBulkError("Chức năng tạo hàng loạt chưa khả dụng.");
      return;
    }

    if (!generatedBulkShowtimes.length) {
      setBulkError("Vui lòng sinh danh sách suất chiếu trước khi tạo.");
      return;
    }

    if (!validateBulkCommonFields()) {
      setBulkError("Vui lòng hoàn tất thông tin cơ bản trước khi tạo hàng loạt.");
      return;
    }

    setBulkError(null);

    const payloads = generatedBulkShowtimes.map((item) => ({
      ...values,
      startTime: item.startTime,
      endTime: item.endTime,
    }));

    try {
      await onBulkCreate(payloads);
    } catch (error) {
      if (error instanceof Error) {
        setBulkError(error.message);
      } else {
        setBulkError("Không thể tạo hàng loạt suất chiếu. Vui lòng thử lại.");
      }
    }
  };

  const validate = () => {
    const nextErrors: Partial<Record<keyof ShowtimeFormValues, string>> = {};

    if (!values.startTime) nextErrors.startTime = "Vui lòng chọn thời gian bắt đầu";
    if (!values.endTime) nextErrors.endTime = "Vui lòng chọn thời gian kết thúc";
    if (!values.basePrice.trim()) {
      nextErrors.basePrice = "Vui lòng nhập giá cơ bản";
    } else {
      const priceValue = parseFloat(values.basePrice);
      if (isNaN(priceValue) || priceValue < 0) {
        nextErrors.basePrice = "Giá cơ bản không được âm";
      }
    }
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

  const handleStartGuide = useCallback(() => {
    const steps: GuideStep[] = [
      {
        element: "#showtime-form-tour-header",
        popover: {
          title: mode === "create" ? "Tạo suất chiếu mới" : "Chỉnh sửa suất chiếu",
          description:
            mode === "create"
              ? "Xác định thời gian, giá vé và trạng thái cho suất chiếu mới trước khi đưa vào lịch hoạt động."
              : "Kiểm tra thông tin hiện có, cập nhật các trường cần thiết và lưu lại thay đổi.",
          side: "bottom",
          align: "start",
        },
      },
    ];

    if (summary) {
      steps.push({
        element: "#showtime-form-tour-context",
        popover: {
          title: "Bối cảnh suất chiếu",
          description:
            "Hiển thị phim, rạp và phòng chiếu đang thao tác. Hãy chắc chắn thông tin này chính xác trước khi lưu.",
          side: "bottom",
          align: "start",
        },
      });
    }

    steps.push(
      {
        element: "#showtime-form-tour-schedule",
        popover: {
          title: "Thiết lập thời gian",
          description:
            "Chọn thời gian bắt đầu và kết thúc. Hệ thống tự gợi ý giờ kết thúc dựa trên thời lượng phim và thời gian nghỉ.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#showtime-form-tour-pricing",
        popover: {
          title: "Giá và sức chứa",
          description:
            "Nhập giá cơ bản, số ghế khả dụng và định dạng chiếu để phục vụ tính doanh thu và hiển thị đặt vé.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#showtime-form-tour-status",
        popover: {
          title: "Trạng thái suất chiếu",
          description:
            "Chuyển sang 'Đã chiếu' khi lịch đã hoàn tất hoặc giữ 'Sắp diễn ra' trong giai đoạn chuẩn bị.",
          side: "bottom",
          align: "start",
        },
      }
    );

    if (mode === "create" && onBulkCreate) {
      steps.push({
        element: "#showtime-form-tour-bulk",
        popover: {
          title: "Tạo hàng loạt",
          description:
            "Nhập khoảng thời gian phục vụ và thời gian nghỉ để hệ thống sinh ra nhiều suất liên tiếp tự động.",
          side: "bottom",
          align: "start",
        },
      });

      if (generatedBulkShowtimes.length > 0) {
        steps.push({
          element: "#showtime-form-tour-bulk-preview",
          popover: {
            title: "Danh sách suất đã sinh",
            description:
              "Kiểm tra từng suất, bao gồm thời gian chiếu và phút nghỉ giữa các suất trước khi xác nhận tạo hàng loạt.",
            side: "bottom",
            align: "start",
          },
        });
      }
    }

    steps.push({
      element: "#showtime-form-tour-actions",
      popover: {
        title: "Hoàn tất",
        description: "Nhấn Lưu để xác nhận, hoặc Đóng nếu bạn muốn rời khỏi biểu mẫu mà không thay đổi dữ liệu.",
        side: "bottom",
        align: "start",
      },
    });

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [generatedBulkShowtimes.length, mode, onBulkCreate, summary]);

  return (
    <Modal
      isOpen={open}
      onClose={onClose}
      title={mode === "create" ? "Thêm suất chiếu" : "Chỉnh sửa suất chiếu"}
      size="lg"
      contentClassName="bg-[#151518] text-[#f5f5f5] border border-[#27272a] [&>div:first-child]:border-[#27272a] [&>div:first-child]:bg-[#151518] [&>div:first-child>h3]:text-[#f5f5f5] [&>div:first-child>button]:text-[#f5f5f5]/70 [&>div:first-child>button:hover]:text-white [&>div:first-child>button:hover]:bg-[#27272a]"
    >
      <div className="space-y-5" id="showtime-form-tour-container">
        <div
          className="flex flex-col gap-3 rounded-lg border border-[#27272a] bg-[#1c1c1f] px-4 py-3 md:flex-row md:items-center md:justify-between"
          id="showtime-form-tour-header"
        >
          <div className="space-y-1 text-sm">
            <p className="text-base font-semibold text-[#f5f5f5]">
              {mode === "create" ? "Khai báo suất chiếu mới" : "Cập nhật thông tin suất chiếu"}
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Đảm bảo các khung giờ không trùng lặp và thông tin giá vé phản ánh đúng chính sách vận hành.
            </p>
          </div>
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartGuide}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
            id="showtime-form-tour-guide-btn"
          >
            <Info className="size-4" /> Hướng dẫn
          </Button>
        </div>

        {summary && (
          <div
            className="rounded-lg border border-[#27272a] bg-[#1c1c1f] p-4 text-sm text-[#9e9ea2]"
            id="showtime-form-tour-context"
          >
            <p className="text-xs uppercase tracking-wide text-[#f5f5f5]/70">Bối cảnh suất chiếu</p>
            <p className="mt-1 text-[#f5f5f5]">{summary}</p>
            {durationMinutes ? (
              <p className="mt-1 text-xs text-[#9e9ea2]">Thời lượng phim: {durationMinutes} phút</p>
            ) : null}
          </div>
        )}

        <div className="grid gap-4 md:grid-cols-2" id="showtime-form-tour-schedule">
          <div className="space-y-2">
            <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
              Thời gian bắt đầu <span className="text-rose-400">*</span>
            </label>
            <Input
              type="datetime-local"
              value={values.startTime}
              onChange={(event) => handleStartTimeChange(event.target.value)}
              lang="vi"
              placeholder="dd/mm/yyyy hh:mm"
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
              lang="vi"
              placeholder="dd/mm/yyyy hh:mm"
              className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            />
            {errors.endTime && <p className="text-xs text-rose-400">{errors.endTime}</p>}
          </div>
        </div>

        <div className="grid gap-4 md:grid-cols-2" id="showtime-form-tour-pricing">
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
          {/* <div className="space-y-2">
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
          </div> */}
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

        <div className="space-y-2" id="showtime-form-tour-status">
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

        {mode === "create" && onBulkCreate ? (
          <div className="space-y-3 rounded-lg border border-[#27272a] bg-[#1b1b1f] p-4" id="showtime-form-tour-bulk">
            <div className="space-y-1">
              <p className="text-sm font-semibold text-[#f5f5f5]">Tạo hàng loạt suất chiếu</p>
              <p className="text-xs text-[#9e9ea2]">
                Nhập khoảng thời gian hoạt động, thời gian nghỉ giữa các suất và hệ thống sẽ sinh lịch chiếu liên tục.
              </p>
            </div>

            <div className="grid gap-3 md:grid-cols-3">
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
                  Bắt đầu từ <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={bulkStartTime}
                  onChange={(event) => setBulkStartTime(event.target.value)}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
                  Kết thúc lúc <span className="text-rose-400">*</span>
                </label>
                <Input
                  type="datetime-local"
                  value={bulkEndTime}
                  onChange={(event) => setBulkEndTime(event.target.value)}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
                />
              </div>
              <div className="space-y-2">
                <label className="text-xs uppercase tracking-wide text-[#9e9ea2]">
                  Nghỉ (phút)
                </label>
                <Input
                  type="number"
                  min={0}
                  value={bulkCleanupMinutes}
                  onChange={(event) => setBulkCleanupMinutes(event.target.value)}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
                />
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3 text-xs text-[#9e9ea2]">
              <div>
                {durationMinutes ? (
                  <span>Thời lượng phim: {durationMinutes} phút</span>
                ) : (
                  <span className="text-rose-400">Không có dữ liệu thời lượng phim, vui lòng kiểm tra trước khi tạo.</span>
                )}
              </div>
              <div className="flex gap-2">
                <Button
                  type="button"
                  variant="outline"
                  onClick={handleBulkGenerate}
                  disabled={!durationMinutes || submitting}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#232326]"
                >
                  Sinh suất chiếu
                </Button>
                <Button
                  type="button"
                  onClick={handleBulkApply}
                  disabled={submitting || !generatedBulkShowtimes.length}
                  className="bg-[#ff7a45] text-[#151518] hover:bg-[#ff8d60] shadow-lg shadow-[#ff7a45]/40"
                >
                  Tạo {generatedBulkShowtimes.length} suất chiếu
                </Button>
              </div>
            </div>

            {bulkError ? <p className="text-xs text-rose-400">{bulkError}</p> : null}

            {generatedBulkShowtimes.length ? (
              <div
                className="max-h-48 space-y-2 overflow-y-auto rounded-md border border-dashed border-[#3a3a3d] p-3"
                id="showtime-form-tour-bulk-preview"
              >
                <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">
                  Danh sách suất chiếu ({generatedBulkShowtimes.length})
                </p>
                <div className="space-y-1 text-sm text-[#f5f5f5]">
                  {generatedBulkShowtimes.map((item, index) => (
                    <div key={`${item.startTime}-${index}`} className="flex items-center justify-between gap-3">
                      <span>{formatBulkSlotLabel(item.startTime, item.endTime)}</span>
                      <span className="text-xs text-[#9e9ea2]">
                        +{Number.parseInt(bulkCleanupMinutes, 10) || 0} phút nghỉ
                      </span>
                    </div>
                  ))}
                </div>
              </div>
            ) : null}
          </div>
        ) : null}

        <div className="flex justify-end gap-3" id="showtime-form-tour-actions">
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
