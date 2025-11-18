"use client";

import {
  PartnerSeatType,
  useGetPartnerSeatTypes,
} from "@/apis/partner.seat-type.api";
import {
  PartnerSeatLayoutSeat,
  PartnerSeatLayoutSeatType,
  PartnerSeatLayoutApiError,
  SavePartnerSeatLayoutRequest,
  useCreatePartnerSeatLayout,
  useGetPartnerSeatLayout,
  useInvalidatePartnerSeatLayout,
  useUpdatePartnerSeatLayout,
} from "@/apis/partner.seat-layout";

import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import {
  Dialog,
  DialogContent,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  Select,
  SelectContent,
  SelectGroup,
  SelectItem,
  SelectLabel,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import React, { useCallback, useEffect, useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Seat } from "./Seat";
import { PopularSeatLayoutSamples } from "./PopularSeatLayoutSamples";
import type { PopularSeatLayoutSample } from "./PopularSeatLayoutSamples";
import { usePartnerHomeStore } from "@/store/partnerHomeStore";
import { useToast } from "@/components/ToastProvider";
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

type SeatTypeOption = PartnerSeatType | PartnerSeatLayoutSeatType;

export interface SeatData {
  seatId?: number;
  row: string;
  column: number;
  seatTypeId: number;
  status: "Available" | "Blocked" | "Maintenance";
  colorCode: string;
  seatName?: string;
}

const STATUS_MAINTENANCE = [
  "disabled",
  "inactive",
  "unavailable",
  "maintenance",
];

const TEMPLATE_SEAT_TYPE_NAME = "Ghế mẫu";
const BLOCKED_SEAT_TYPE_NAME = "Không được chọn";
const SEAT_TYPE_ACTION_DEFAULT = "none";

const mapApiSeatStatusToLocal = (status?: string): SeatData["status"] => {
  const normalized = status?.toLowerCase() ?? "available";

  if (["booked", "reserved", "occupied", "blocked"].includes(normalized)) {
    return "Blocked";
  }

  if (STATUS_MAINTENANCE.includes(normalized)) {
    return "Maintenance";
  }

  return "Available";
};

const SeatLayout = () => {
  const seatLayoutContext = usePartnerHomeStore(
    (state) => state.seatLayoutContext
  );
  const setActiveTab = usePartnerHomeStore((state) => state.setActiveTab);
  const screenId = seatLayoutContext.screenId ?? undefined;

  const seatLayoutQuery = useGetPartnerSeatLayout(screenId);
  const createSeatLayoutMutation = useCreatePartnerSeatLayout();
  const updateSeatLayoutMutation = useUpdatePartnerSeatLayout();
  const invalidateSeatLayout = useInvalidatePartnerSeatLayout();
  const { showToast } = useToast();

  const handleStartGuide = useCallback(() => {
    const hasSelectedScreen = Boolean(screenId);
    const steps: GuideStep[] = [
      {
        element: "#seat-layout-tour-page",
        popover: {
          title: "Thiết kế sơ đồ ghế",
          description:
            "Tạo hoặc chỉnh sửa bố trí ghế cho từng phòng chiếu, áp dụng mẫu và lưu về hệ thống.",
          side: "bottom",
          align: "start",
        },
      },
    ];

    if (!hasSelectedScreen) {
      steps.push({
        element: "#seat-layout-tour-context",
        popover: {
          title: "Chưa chọn phòng",
          description:
            "Chọn phòng chiếu trong tab 'Phòng chiếu' để tải sơ đồ thực tế hoặc tiếp tục tạo sơ đồ mẫu tại đây.",
          side: "bottom",
          align: "start",
        },
      });
    } else {
      steps.push({
        element: "#seat-layout-tour-context",
        popover: {
          title: "Thông tin phòng",
          description:
            "Đang thao tác trên phòng đã chọn. Khi lưu, sơ đồ sẽ được cập nhật trực tiếp cho phòng chiếu này.",
          side: "bottom",
          align: "start",
        },
      });

      steps.push({
        element: "#seat-layout-tour-status",
        popover: {
          title: "Trạng thái dữ liệu",
          description:
            "Theo dõi quá trình tải sơ đồ: đang tải, lỗi hoặc đã có dữ liệu thực tế từ hệ thống.",
          side: "bottom",
          align: "start",
        },
      });
    }

    steps.push(
      {
        element: "#seat-layout-tour-samples",
        popover: {
          title: "Sơ đồ mẫu",
          description:
            "Áp dụng nhanh các mẫu bố trí tham khảo để tiết kiệm thời gian thiết kế.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#seat-layout-tour-form",
        popover: {
          title: "Tạo sơ đồ",
          description:
            "Nhập số hàng, số cột và chọn loại ghế mặc định trước khi tạo sơ đồ mới.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#seat-layout-tour-canvas",
        popover: {
          title: "Khu vực ghế",
          description:
            "Nhấp vào hàng/cột để chọn nhanh, kéo chuột để phóng to/thu nhỏ và xem bố cục tổng thể.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#seat-layout-tour-tools",
        popover: {
          title: "Thao tác ghế",
          description:
            "Chọn nhiều ghế để đổi trạng thái, đổi loại ghế, ẩn hiện ghế vô hiệu hoặc xem dữ liệu JSON.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#seat-layout-tour-legend",
        popover: {
          title: "Chú thích",
          description:
            "Danh sách loại ghế cùng màu sắc giúp bạn đối chiếu nhanh trong quá trình thiết kế.",
          side: "bottom",
          align: "start",
        },
      }
    );

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [screenId]);

  const [rows, setRows] = useState<number>(5);
  const [cols, setCols] = useState<number>(5);
  const [seats, setSeats] = useState<SeatData[]>([]);
  const [selectedSeats, setSelectedSeats] = useState<string[]>([]);
  const [isPreview, setIsPreview] = useState<boolean>(false);
  const [selectedSeatTypeId, setSelectedSeatTypeId] = useState<number | null>(
    null
  );
  const [seatTypeActionValue, setSeatTypeActionValue] = useState<string>(
    SEAT_TYPE_ACTION_DEFAULT
  );
  const [isSeatDataModalOpen, setIsSeatDataModalOpen] = useState(false);
  const [copyStatus, setCopyStatus] = useState<"idle" | "copied" | "error">(
    "idle"
  );

  const { data: partnerSeatTypeRes, isLoading } = useGetPartnerSeatTypes();
  const partnerSeatTypes = partnerSeatTypeRes?.result.seatTypes ?? [];

  const seatTypeOptions: SeatTypeOption[] = useMemo(() => {
    return seatLayoutQuery.data?.result.availableSeatTypes?.length
      ? seatLayoutQuery.data.result.availableSeatTypes
      : partnerSeatTypes;
  }, [seatLayoutQuery.data?.result.availableSeatTypes, partnerSeatTypes]);

  const apiSeatTypesById = useMemo(() => {
    const mapping = new Map<number, SeatTypeOption>();
    seatTypeOptions.forEach((type) => mapping.set(type.id, type));
    return mapping;
  }, [seatTypeOptions]);

  const templateSeatType = useMemo(
    () =>
      seatTypeOptions.find((type) => type.name === TEMPLATE_SEAT_TYPE_NAME) ??
      null,
    [seatTypeOptions]
  );

  const blockedSeatType = useMemo(
    () =>
      seatTypeOptions.find((type) => type.name === BLOCKED_SEAT_TYPE_NAME) ??
      null,
    [seatTypeOptions]
  );

  const selectedSeatType = useMemo(() => {
    if (!selectedSeatTypeId) return null;
    return (
      seatTypeOptions.find((type) => type.id === selectedSeatTypeId) ?? null
    );
  }, [selectedSeatTypeId, seatTypeOptions]);

  useEffect(() => {
    if (!selectedSeatTypeId && templateSeatType) {
      setSelectedSeatTypeId(templateSeatType.id);
    }
  }, [selectedSeatTypeId, templateSeatType]);

  useEffect(() => {
    if (
      !seatLayoutQuery.data?.result ||
      !seatLayoutQuery.data.result.seatMap?.hasLayout
    ) {
      return;
    }

    const {
      seatMap: { totalRows, totalColumns },
      seats: apiSeats,
    } = seatLayoutQuery.data.result;

    setRows(totalRows);
    setCols(totalColumns);

    const mappedSeats = apiSeats.map<SeatData>((seat) => ({
      seatId: seat.seatId,
      row: seat.row,
      column: seat.column,
      seatTypeId: seat.seatTypeId,
      status: mapApiSeatStatusToLocal(seat.status),
      colorCode:
        seat.seatTypeColor ||
        apiSeatTypesById.get(seat.seatTypeId)?.color ||
        "#64748b",
      seatName: seat.seatName,
    }));

    setSeats(mappedSeats);
    setSelectedSeats([]);
  }, [seatLayoutQuery.data?.result, apiSeatTypesById]);

  const handleGenSeat = (e: React.FormEvent) => {
    e.preventDefault();
    const alphabetRows = "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, rows);
    const fallbackSeatType =
      selectedSeatType ?? templateSeatType ?? seatTypeOptions[0] ?? null;
    const fallbackColor = fallbackSeatType?.color || "#FFFFFF";
    const fallbackSeatTypeId = fallbackSeatType?.id ?? 0;

    const newSeats: SeatData[] = [];

    alphabetRows.forEach((row) => {
      for (let c = 1; c <= cols; c++) {
        newSeats.push({
          row,
          column: c,
          seatTypeId: fallbackSeatTypeId,
          status: "Available",
          colorCode: fallbackColor,
        });
      }
    });

    setSeats(newSeats);
    setSelectedSeats([]);
    setSeatTypeActionValue(SEAT_TYPE_ACTION_DEFAULT);
    if (fallbackSeatType) {
      setSelectedSeatTypeId(fallbackSeatType.id);
    }
  };

  const toggleSelect = (row: string, column: number) => {
    const seatId = `${row}${column}`;
    setSelectedSeats((prev) =>
      prev.includes(seatId)
        ? prev.filter((id) => id !== seatId)
        : [...prev, seatId]
    );
  };

  const toggleRowSelect = (row: string) => {
    const rowSeats = seats.filter((s) => s.row === row);
    const rowIds = rowSeats.map((s) => `${s.row}${s.column}`);
    const allSelected = rowIds.every((id) => selectedSeats.includes(id));
    setSelectedSeats((prev) =>
      allSelected
        ? prev.filter((id) => !rowIds.includes(id))
        : [...prev, ...rowIds.filter((id) => !prev.includes(id))]
    );
  };

  const toggleColumnSelect = (column: number) => {
    const colSeats = seats.filter((s) => s.column === column);
    const colIds = colSeats.map((s) => `${s.row}${s.column}`);
    const allSelected = colIds.every((id) => selectedSeats.includes(id));
    setSelectedSeats((prev) =>
      allSelected
        ? prev.filter((id) => !colIds.includes(id))
        : [...prev, ...colIds.filter((id) => !prev.includes(id))]
    );
  };

  const toggleSelectAll = () => {
    if (selectedSeats.length === seats.length) {
      setSelectedSeats([]);
      return;
    }

    const allSeatIds = seats.map((seat) => `${seat.row}${seat.column}`);
    setSelectedSeats(allSeatIds);
  };

  interface UpdateSeatParams {
    status?: SeatData["status"];
    seatType?: SeatTypeOption | null;
    color?: string;
  }

  const handleUpdateSelected = ({
    status,
    seatType,
    color,
  }: UpdateSeatParams): boolean => {
    if (selectedSeats.length === 0) {
      showToast(
        "Vui lòng chọn ít nhất một ghế để cập nhật.",
        undefined,
        "info"
      );
      return false;
    }

    const selectedSeatObjects = seats.filter((seat) =>
      selectedSeats.includes(`${seat.row}${seat.column}`)
    );
    const selectedSeatIdSet = new Set(selectedSeats);

    const isTargetCoupleSeatType = Boolean(
      seatType &&
        ((seatType.code && seatType.code.toUpperCase() === "COUPLE") ||
          seatType.name.toLowerCase().includes("ghế đôi"))
    );

    if (isTargetCoupleSeatType) {
      const hasInvalidCount =
        selectedSeatObjects.length < 2 || selectedSeatObjects.length % 2 !== 0;

      const seatsByRow = selectedSeatObjects.reduce<Map<string, number[]>>(
        (acc, seat) => {
          const columnsForRow = acc.get(seat.row) ?? [];
          columnsForRow.push(seat.column);
          acc.set(seat.row, columnsForRow);
          return acc;
        },
        new Map()
      );

      let hasInvalidAdjacency = false;

      for (const [, columnsInRow] of seatsByRow.entries()) {
        columnsInRow.sort((a, b) => a - b);

        if (columnsInRow.length % 2 !== 0) {
          hasInvalidAdjacency = true;
          break;
        }

        for (let index = 0; index < columnsInRow.length; index += 2) {
          const firstColumn = columnsInRow[index];
          const secondColumn = columnsInRow[index + 1];

          if (secondColumn - firstColumn !== 1) {
            hasInvalidAdjacency = true;
            break;
          }
        }

        if (hasInvalidAdjacency) {
          break;
        }
      }

      if (hasInvalidCount || hasInvalidAdjacency) {
        showToast(
          "Ghế đôi phải gồm các cặp ghế kề nhau, số lượng ghế phải là số chẵn.",
          undefined,
          "error"
        );
        return false;
      }
    } else {
      const coupleSeatsInSelection = selectedSeatObjects.filter((seat) =>
        isCoupleSeatType(seat.seatTypeId)
      );

      if (coupleSeatsInSelection.length > 0) {
        const coupleSeatPartners = new Map<string, SeatData>();

        const coupleSeatsByRow = seats
          .filter((seat) => isCoupleSeatType(seat.seatTypeId))
          .reduce<Map<string, SeatData[]>>((acc, seat) => {
            const rowSeats = acc.get(seat.row) ?? [];
            rowSeats.push(seat);
            acc.set(seat.row, rowSeats);
            return acc;
          }, new Map());

        for (const rowSeats of coupleSeatsByRow.values()) {
          const sortedRowSeats = rowSeats
            .slice()
            .sort((a, b) => a.column - b.column);

          for (let index = 0; index < sortedRowSeats.length - 1; index += 2) {
            const firstSeat = sortedRowSeats[index];
            const secondSeat = sortedRowSeats[index + 1];

            if (secondSeat.column - firstSeat.column !== 1) {
              continue;
            }

            coupleSeatPartners.set(
              `${firstSeat.row}${firstSeat.column}`,
              secondSeat
            );
            coupleSeatPartners.set(
              `${secondSeat.row}${secondSeat.column}`,
              firstSeat
            );
          }
        }

        const hasPartialCouple = coupleSeatsInSelection.some((seat) => {
          const seatKey = `${seat.row}${seat.column}`;
          const partnerSeat = coupleSeatPartners.get(seatKey);

          if (!partnerSeat) {
            return true;
          }

          return !selectedSeatIdSet.has(
            `${partnerSeat.row}${partnerSeat.column}`
          );
        });

        if (hasPartialCouple) {
          showToast(
            "Ghế đôi chỉ có thể thay đổi khi chọn đủ 2 ghế kề nhau.",
            undefined,
            "error"
          );
          return false;
        }
      }
    }

    setSeats((prevSeats) =>
      prevSeats.map((seat) => {
        if (!selectedSeats.includes(`${seat.row}${seat.column}`)) {
          return seat;
        }

        const appliedSeatTypeId = seatType ? seatType.id : seat.seatTypeId;
        const appliedColor = seatType
          ? seatType.color
          : color ?? seat.colorCode;

        return {
          ...seat,
          status: status ?? seat.status,
          seatTypeId: appliedSeatTypeId,
          colorCode: appliedColor,
        };
      })
    );
    setSelectedSeats([]);
    return true;
  };

  const rowLabels = useMemo(() => {
    const letters = new Set<string>();
    seats.forEach((seat) => letters.add(seat.row));
    if (letters.size === 0) {
      return "ABCDEFGHIJKLMNOPQRSTUVWXYZ".split("").slice(0, rows);
    }
    return Array.from(letters).sort((a, b) => a.localeCompare(b, "vi"));
  }, [rows, seats]);

  const columns = useMemo(
    () => Array.from({ length: cols }, (_, index) => index + 1),
    [cols]
  );

  const seatLookup = useMemo(() => {
    const map = new Map<string, SeatData>();
    seats.forEach((seat) => {
      map.set(`${seat.row}-${seat.column}`, seat);
    });
    return map;
  }, [seats]);

  const isCoupleSeatType = React.useCallback(
    (seatTypeId: number) => {
      const seatType = apiSeatTypesById.get(seatTypeId);
      if (!seatType) return false;

      const normalizedName = seatType.name
        ?.trim()
        .toLowerCase()
        .normalize("NFC");
      const normalizedCode = seatType.code
        ?.trim()
        .toLowerCase()
        .normalize("NFC");

      const keywords = [
        "ghế đôi",
        "ghe doi",
        "đôi",
        "doi",
        "couple",
        "double",
        "COUPLE",
        "Ghế Đôi"
      ];

      return keywords.some(
        (keyword) =>
          normalizedName?.includes(keyword) || normalizedCode?.includes(keyword)
      );
    },
    [apiSeatTypesById]
  );

  const renderRowSeats = React.useCallback(
    (
      rowLabel: string,
      seatOrderRef: { current: number }
    ): React.ReactNode[] => {
      const nodes: React.ReactNode[] = [];

      const getSeatLabel = (seat: SeatData) => {
        if (seat.status === "Maintenance") {
          return "Z0";
        }
        seatOrderRef.current += 1;
        return `${seat.row}${seatOrderRef.current}`;
      };

      for (let index = 0; index < columns.length; ) {
        const column = columns[index];
        const seat = seatLookup.get(`${rowLabel}-${column}`);
        const seatKey = `${rowLabel}${column}`;

        if (!seat) {
          nodes.push(
            <div
              key={`${rowLabel}-${column}-empty`}
              className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-zinc-700/60 text-xs text-zinc-500"
            >
              —
            </div>
          );
          index += 1;
          continue;
        }

        const seatIsCouple = isCoupleSeatType(seat.seatTypeId);

        if (seatIsCouple) {
          const nextColumn = columns[index + 1];
          const isContinuousNext = nextColumn === column + 1;
          const nextSeat = isContinuousNext
            ? seatLookup.get(`${rowLabel}-${nextColumn}`)
            : undefined;

          if (
            nextSeat &&
            isCoupleSeatType(nextSeat.seatTypeId) &&
            isContinuousNext
          ) {
            const firstLabel = getSeatLabel(seat);
            const secondLabel = getSeatLabel(nextSeat);
            const nextSeatKey = `${rowLabel}${nextColumn}`;

            nodes.push(
              <div
                key={`${rowLabel}-${column}-couple`}
                className="inline-grid grid-cols-2 gap-0 w-max"
                style={{ gridColumn: "span 2" }}
              >
                <Seat
                  key={`${seat.row}-${seat.column}`}
                  data={seat}
                  isSelected={selectedSeats.includes(seatKey)}
                  onToggleSelect={() => toggleSelect(seat.row, seat.column)}
                  label={firstLabel}
                  isPreview={isPreview}
                  variant="coupleLeft"
                />
                <Seat
                  key={`${nextSeat.row}-${nextSeat.column}`}
                  data={nextSeat}
                  isSelected={selectedSeats.includes(nextSeatKey)}
                  onToggleSelect={() =>
                    toggleSelect(nextSeat.row, nextSeat.column)
                  }
                  label={secondLabel}
                  isPreview={isPreview}
                  variant="coupleRight"
                />
              </div>
            );

            index += 2;
            continue;
          }
        }

        const label = getSeatLabel(seat);

        nodes.push(
          <Seat
            key={`${seat.row}-${seat.column}`}
            data={seat}
            isSelected={selectedSeats.includes(seatKey)}
            onToggleSelect={() => toggleSelect(seat.row, seat.column)}
            label={label}
            isPreview={isPreview}
            variant="single"
          />
        );

        index += 1;
      }

      return nodes;
    },
    [columns, isCoupleSeatType, isPreview, seatLookup, selectedSeats, toggleSelect]
  );

  const sanitizedSeatData = (() => {
    const sortedSeats = seats.slice().sort((a, b) => {
      const rowCompare = a.row.localeCompare(b.row, "vi");

      if (rowCompare !== 0) return rowCompare;
      return a.column - b.column;
    });

    const seatCounters = new Map<string, number>();

    return sortedSeats.map(({ colorCode, ...rest }) => {
      const currentCount = seatCounters.get(rest.row) ?? 0;
      const isMaintenance = rest.status === "Maintenance";
      const nextCount = isMaintenance ? currentCount : currentCount + 1;
      seatCounters.set(rest.row, nextCount);

      const seatName = isMaintenance ? "Z0" : `${rest.row}${nextCount}`;

      return {
        ...rest,
        seatName,
      };
    });
  })();
  const seatLayoutData = {
    totalRows: rows,
    totalColumns: cols,
    seats: sanitizedSeatData,
  };
  const seatLayoutJson = JSON.stringify(seatLayoutData, null, 2);

  const handleSeatDataGuide = useCallback(() => {
    if (!isSeatDataModalOpen) return;

    const steps: GuideStep[] = [
      {
        element: "#seat-layout-data-tour-header",
        popover: {
          title: "Dữ liệu sơ đồ ghế",
          description:
            "Theo dõi JSON sơ đồ ghế để kiểm tra tổng quan trước khi gửi lên hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-layout-data-tour-preview",
        popover: {
          title: "Nội dung JSON",
          description:
            "Cuộn để xem từng ghế (seatName, seatTypeId, status...) và đảm bảo số hàng/cột khớp thực tế.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-layout-data-tour-actions",
        popover: {
          title: "Sao chép & đóng",
          description:
            "Sao chép dữ liệu vào clipboard, sau đó đóng hộp thoại khi đã kiểm tra xong.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
    ];

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [isSeatDataModalOpen]);

  const handleCopySeatLayout = async () => {
    if (!seatLayoutJson) return;

    try {
      await navigator.clipboard.writeText(seatLayoutJson);
      setCopyStatus("copied");
      setTimeout(() => setCopyStatus("idle"), 2000);
    } catch (error) {
      console.error("Copy seat layout failed", error);
      setCopyStatus("error");
    }
  };

  const hasExistingLayout =
    seatLayoutQuery.data?.result?.seatMap?.hasLayout ?? false;
  const isSaving =
    createSeatLayoutMutation.isPending || updateSeatLayoutMutation.isPending;

  const handleSaveSeatLayout = () => {
    if (!screenId) {
      showToast(
        "Vui lòng chọn phòng chiếu trước khi lưu sơ đồ.",
        undefined,
        "error"
      );
      return;
    }

    if (seats.length === 0) {
      showToast("Chưa có dữ liệu ghế để lưu.", undefined, "error");
      return;
    }

    const payload: SavePartnerSeatLayoutRequest = {
      totalRows: rows,
      totalColumns: cols,
      seats: sanitizedSeatData.map((seat) => ({
        seatId: seat.seatId,
        row: seat.row,
        column: seat.column,
        seatTypeId: seat.seatTypeId,
        status: seat.status,
        seatName: seat.seatName,
      })),
    };

    const hasInvalidSeatType = payload.seats.some((seat) => !seat.seatTypeId);
    if (hasInvalidSeatType) {
      showToast(
        "Một số ghế chưa được gán loại ghế hợp lệ. Vui lòng kiểm tra lại.",
        undefined,
        "error"
      );
      return;
    }

    const mutation = hasExistingLayout
      ? updateSeatLayoutMutation
      : createSeatLayoutMutation;

    mutation.mutate(
      { screenId, payload },
      {
        onSuccess: (data) => {
          showToast(
            data?.message ||
              (hasExistingLayout
                ? "Cập nhật sơ đồ ghế thành công."
                : "Tạo sơ đồ ghế thành công."),
            undefined,
            "success"
          );
          invalidateSeatLayout(screenId);
          seatLayoutQuery.refetch();
          setIsSeatDataModalOpen(false);
        },
        onError: (error) => {
          const message =
            error instanceof PartnerSeatLayoutApiError
              ? error.message
              : "Không thể lưu sơ đồ ghế. Vui lòng thử lại.";
          showToast(message, undefined, "error");
        },
      }
    );
  };

  const renderApiStatus = () => {
    if (!screenId) {
      return (
        <p className="text-xs text-slate-500">
          Bạn có thể tạo sơ đồ mẫu để tham khảo hoặc chọn một phòng chiếu từ tab
          Phòng chiếu.
        </p>
      );
    }

    if (seatLayoutQuery.isLoading) {
      return (
        <p className="text-xs text-slate-400">
          Đang tải sơ đồ ghế từ hệ thống...
        </p>
      );
    }

    if (seatLayoutQuery.isError) {
      const message =
        seatLayoutQuery.error instanceof Error
          ? seatLayoutQuery.error.message
          : "Không thể tải sơ đồ ghế. Bạn có thể tạo sơ đồ thủ công bên dưới.";
      return <p className="text-xs text-rose-300">{message}</p>;
    }

    if (seatLayoutQuery.data?.result?.seatMap?.hasLayout) {
      return (
        <p className="text-xs text-emerald-300">
          Đã tải sơ đồ ghế thực tế (cập nhật:{" "}
          {new Date(
            seatLayoutQuery.data.result.seatMap.updatedAt
          ).toLocaleString("vi-VN")}{" "}
          ).
        </p>
      );
    }

    return (
      <p className="text-xs text-slate-400">
        Phòng chưa có sơ đồ ghế trên hệ thống. Bạn có thể tự tạo mẫu bên dưới.
      </p>
    );
  };

  const normalizeText = (value?: string) =>
    value?.trim().toLowerCase().normalize("NFC") ?? "";

  const findSeatTypeByKeywords = (keywords: string[]): SeatTypeOption | null => {
    if (!keywords.length) return null;

    const normalizedKeywords = keywords.map((keyword) =>
      keyword.trim().toLowerCase().normalize("NFC")
    );

    return (
      seatTypeOptions.find((type) => {
        const normalizedName = normalizeText(type.name);
        const normalizedCode = normalizeText(type.code);
        return normalizedKeywords.some(
          (keyword) =>
            normalizedName.includes(keyword) || normalizedCode.includes(keyword)
        );
      }) ?? null
    );
  };

  const getRowLabel = (index: number) => {
    let label = "";
    let currentIndex = index;

    while (currentIndex >= 0) {
      label = String.fromCharCode((currentIndex % 26) + 65) + label;
      currentIndex = Math.floor(currentIndex / 26) - 1;
    }

    return label;
  };

  const handleApplySeatLayoutSample = (sample: PopularSeatLayoutSample) => {
    if (!seatTypeOptions.length) {
      showToast(
        "Chưa có dữ liệu loại ghế để áp dụng sơ đồ mẫu.",
        undefined,
        "error"
      );
      return;
    }

    const fallbackSeatType = templateSeatType ?? seatTypeOptions[0] ?? null;
    const standardSeatType =
      findSeatTypeByKeywords(["ghế thường", "thường", "standard", "regular"]) ??
      fallbackSeatType;
    const vipSeatType =
      findSeatTypeByKeywords(["vip"]) ?? standardSeatType ?? fallbackSeatType;
    const coupleSeatType =
      findSeatTypeByKeywords(["ghế đôi", "đôi", "couple"]) ??
      standardSeatType ??
      fallbackSeatType;

    const resolveSeat = (cell: string) => {
      switch (cell) {
        case "S":
          return { seatType: standardSeatType, status: "Available" as const };
        case "M":
          return { seatType: standardSeatType, status: "Maintenance" as const };
        case "V":
          return { seatType: vipSeatType, status: "Available" as const };
        case "C":
          return { seatType: coupleSeatType, status: "Available" as const };
        case "K":
          return { seatType: coupleSeatType, status: "Maintenance" as const };
        case "_":
        default:
          return null;
      }
    };

    const generatedSeats: SeatData[] = [];

    for (let rowIndex = 0; rowIndex < sample.rows; rowIndex += 1) {
      const rowPattern = sample.layout[rowIndex] ?? "";
      const rowLabel = getRowLabel(rowIndex);

      for (let colIndex = 0; colIndex < sample.cols; colIndex += 1) {
        const rawCell = rowPattern[colIndex] ?? "_";
        const cell = rawCell.toUpperCase();
        const result = resolveSeat(cell);

        if (!result) {
          continue;
        }

        const { seatType, status } = result;

        generatedSeats.push({
          row: rowLabel,
          column: colIndex + 1,
          seatTypeId: seatType?.id ?? 0,
          status,
          colorCode: seatType?.color ?? "#64748b",
        });
      }
    }

    setRows(sample.rows);
    setCols(sample.cols);
    setSeats(generatedSeats);
    setSelectedSeats([]);
    setSeatTypeActionValue(SEAT_TYPE_ACTION_DEFAULT);
    setSelectedSeatTypeId(standardSeatType?.id ?? null);
    setIsPreview(false);
    showToast(`Đã áp dụng ${sample.name}.`, undefined, "success");
  };

  return (
    <div className="space-y-6 p-6" id="seat-layout-tour-page">
      <div
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between
      rounded-xl border border-slate-800/60 bg-zinc-900/60 p-6 shadow-lg"
        id="seat-layout-tour-context"
      >
        <div>
          <h2 className="text-2xl font-semibold text-white">
            Thiết kế sơ đồ ghế
          </h2>
          {seatLayoutContext.screenName ? (
            <p className="text-sm text-slate-300">
              Đang xem phòng:{" "}
              <span className="font-medium text-orange-300">
                {seatLayoutContext.screenName}
              </span>
              {seatLayoutContext.cinemaName
                ? ` • ${seatLayoutContext.cinemaName}`
                : ""}
            </p>
          ) : (
            <p className="text-sm text-slate-400">
              Bạn có thể tự tạo sơ đồ ghế mẫu để tham khảo (chưa kết nối dữ
              liệu).
            </p>
          )}
          <div id="seat-layout-tour-status">{renderApiStatus()}</div>
        </div>
        <div className="flex flex-col items-stretch gap-2 sm:flex-row sm:items-center">
          <Button
            variant="outline"
            onClick={handleStartGuide}
            className="border-slate-700 bg-zinc-900/60 text-slate-100 transition hover:bg-zinc-800"
            id="seat-layout-tour-start-btn"
          >
            <Info className="mr-2 size-4" /> Hướng dẫn
          </Button>
          <Button variant="outline" onClick={() => setActiveTab("screen")}>
            Quay lại quản lý phòng chiếu
          </Button>
        </div>
      </div>

      <div id="seat-layout-tour-samples">
        <PopularSeatLayoutSamples onApplySample={handleApplySeatLayoutSample} />
      </div>

      <div className="flex flex-col gap-10 xl:flex-row">
        <div className="flex-1 space-y-8 w-full">
          <div
            className="rounded-xl border border-slate-800/60 w-4xl bg-zinc-900/60 p-6 shadow-lg"
            id="seat-layout-tour-form"
          >
            <div className="flex flex-col gap-6 md:flex-row md:items-start md:justify-between">
              <form onSubmit={handleGenSeat} className="flex-1 space-y-4">
                <div className="space-y-2">
                  <h3 className="text-lg font-semibold text-white">
                    Tạo sơ đồ ghế
                  </h3>
                  <p className="text-sm text-zinc-300/70">
                    Điều chỉnh số hàng, số cột và loại ghế mặc định trước khi
                    tạo sơ đồ.
                  </p>
                </div>

                <div className="grid gap-4 md:grid-cols-[2fr_1fr_1fr_1fr] md:items-end">
                  <div className="space-y-2">
                    <Label htmlFor="seatType">Loại ghế mặc định</Label>
                    <Select
                      value={
                        selectedSeatTypeId
                          ? String(selectedSeatTypeId)
                          : undefined
                      }
                      onValueChange={(value) => {
                        const numericValue = Number(value);
                        const type =
                          seatTypeOptions.find(
                            (item) => item.id === numericValue
                          ) ?? null;
                        setSelectedSeatTypeId(type ? type.id : null);
                      }}
                    >
                      <SelectTrigger className="bg-zinc-800 mb-0">
                        <SelectValue
                          placeholder={
                            isLoading ? "Đang tải..." : "Chọn loại ghế"
                          }
                        />
                      </SelectTrigger>
                      <SelectContent className="bg-zinc-800 text-zinc-100">
                        <SelectGroup>
                          <SelectLabel>Các kiểu ghế</SelectLabel>
                          {seatTypeOptions.map((seatType) => (
                            <SelectItem
                              key={seatType.id}
                              value={String(seatType.id)}
                            >
                              {seatType.name}
                            </SelectItem>
                          ))}
                        </SelectGroup>
                      </SelectContent>
                    </Select>
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="row">Số hàng</Label>
                    <Input
                      id="row"
                      type="number"
                      min={1}
                      max={26}
                      value={rows}
                      onChange={(event) => setRows(Number(event.target.value))}
                      className="bg-zinc-800"
                    />
                  </div>
                  <div className="space-y-2">
                    <Label htmlFor="col">Số cột</Label>
                    <Input
                      id="col"
                      type="number"
                      min={1}
                      value={cols}
                      onChange={(event) => setCols(Number(event.target.value))}
                      className="bg-zinc-800"
                    />
                  </div>
                  <div className="flex md:justify-end md:self-end">
                    <Button
                      type="submit"
                      className="w-full bg-zinc-200 text-zinc-900 hover:bg-zinc-200/80 md:w-auto"
                    >
                      Tạo sơ đồ ghế
                    </Button>
                  </div>
                </div>
              </form>

              {selectedSeatType && (
                <div className="w-full max-w-[220px] space-y-3 rounded-lg border border-zinc-800 bg-zinc-900/80 p-5 shadow">
                  <div className="flex items-center gap-3">
                    <div
                      className="h-10 w-10 rounded-md border border-zinc-700"
                      style={{ backgroundColor: selectedSeatType.color }}
                    />
                    <div>
                      <p className="text-sm text-zinc-400">Màu ghế</p>
                      <p className="font-medium text-zinc-100">
                        {selectedSeatType.color}
                      </p>
                    </div>
                  </div>
                  <div>
                    <p className="text-sm text-zinc-400">Tên loại ghế</p>
                    <p className="font-semibold text-zinc-100">
                      {selectedSeatType.name}
                    </p>
                  </div>
                </div>
              )}
            </div>
          </div>

          <div
            className="rounded-xl flex flex-col w-4xl h-fit items-center border overflow-hidden border-slate-800/60 bg-zinc-900/60 p-6 shadow-lg"
            id="seat-layout-tour-canvas"
          >
            <div className="mb-6 flex flex-col items-center gap-2 text-center text-slate-300">
              <span className="w-40 border-b border-dashed border-slate-500" />
              <p className="text-xs uppercase tracking-widest text-slate-500">
                Màn hình
              </p>
            </div>

            {seats.length === 0 ? (
              <div className="flex min-h-[320px] items-center justify-center rounded-lg border border-dashed border-slate-700/50 bg-slate-900/40 text-sm px-3 text-slate-400">
                {`Chưa có dữ liệu ghế. Bạn hãy nhập số hàng, số cột và bấm "Tạo ghế" hoặc tải sơ đồ từ hệ thống.`}
              </div>
            ) : (
              <div style={{}}>
                <TransformWrapper
                  minScale={0.5}
                  maxScale={2.5}
                  wheel={{ step: 0.5 }}
                  doubleClick={{ disabled: true }}
                  panning={{ velocityDisabled: true }}
                >
                  <TransformComponent
                    wrapperClass="w-full"
                    contentClass="w-full flex justify-center"
                  >
                    <div className="flex box w-full max-w-5xl flex-col items-center justify-center gap-4">
                      <div
                        className="grid gap-3 ml-12 text-sm font-semibold text-slate-400"
                        style={{
                          gridTemplateColumns: `repeat(${cols}, 2.5rem)`,
                        }}
                      >
                        {columns.map((column) => {
                          const isColumnSelected = seats.some((seat) =>
                            selectedSeats.includes(`${seat.row}${column}`)
                          );
                          return (
                            <div
                              key={column}
                              onClick={() => toggleColumnSelect(column)}
                              className={`cursor-pointer text-center ${
                                isColumnSelected
                                  ? "text-yellow-400"
                                  : "text-slate-400"
                              }`}
                            >
                              {column}
                            </div>
                          );
                        })}
                      </div>

                      {rowLabels.map((rowLabel) => {
                        const isRowSelected = seats.some((seat) =>
                          selectedSeats.includes(`${rowLabel}${seat.column}`)
                        );

                        const seatOrderRef = { current: 0 };

                        return (
                          <div
                            key={rowLabel}
                            className="flex w-full items-center gap-3"
                          >
                            <div
                              onClick={() => toggleRowSelect(rowLabel)}
                              className={`w-10 cursor-pointer text-center text-sm font-semibold ${
                                isRowSelected
                                  ? "text-yellow-400"
                                  : "text-slate-400"
                              }`}
                            >
                              <div className="w-3">{rowLabel}</div>
                            </div>
                            <div
                              className="grid gap-3"
                              style={{
                                gridTemplateColumns: `repeat(${cols}, 2.5rem)`,
                              }}
                            >
                              {renderRowSeats(rowLabel, seatOrderRef)}
                            </div>
                          </div>
                        );
                      })}
                    </div>
                  </TransformComponent>
                </TransformWrapper>
              </div>
            )}
          </div>
        </div>

        <div className="flex w-full max-w-xl flex-col gap-4">
          <div
            className="rounded-xl border border-zinc-700 bg-zinc-900/80 shadow-xl"
            id="seat-layout-tour-tools"
          >
            <div className="flex items-center justify-between border-b border-zinc-700 px-5 py-3">
              <h2 className="text-xs font-semibold uppercase tracking-wide text-zinc-200">
                Thao tác ghế
              </h2>
              <span className="text-xs text-zinc-400">
                {selectedSeats.length > 0
                  ? `${selectedSeats.length} ghế đã chọn`
                  : "Chưa chọn ghế"}
              </span>
            </div>

            <div className="flex h-[60vh] flex-col justify-between">
              <div className="space-y-6 overflow-y-auto px-5 py-4">
                <div className="flex items-center justify-between">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Chọn ghế
                  </p>
                  <Button
                    variant="outline"
                    size="sm"
                    onClick={toggleSelectAll}
                    className="border-zinc-700 bg-zinc-800 text-xs text-zinc-100 hover:bg-zinc-700"
                  >
                    {selectedSeats.length === seats.length && seats.length > 0
                      ? "Bỏ chọn tất cả"
                      : "Chọn tất cả"}
                  </Button>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Cập nhật trạng thái
                  </p>
                  <div className="grid grid-cols-2 gap-2">
                    <Button
                      onClick={() => {
                        if (!templateSeatType) {
                          showToast(
                            `Không tìm thấy loại ghế "${TEMPLATE_SEAT_TYPE_NAME}".`,
                            undefined,
                            "error"
                          );
                          return;
                        }
                        handleUpdateSelected({
                          status: "Available",
                          seatType: templateSeatType,
                        });
                      }}
                      disabled={!templateSeatType}
                      className="flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-700/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Mở
                    </Button>
                    <Button
                      onClick={() => {
                        if (!blockedSeatType) {
                          showToast(
                            `Không tìm thấy loại ghế "${BLOCKED_SEAT_TYPE_NAME}".`,
                            undefined,
                            "error"
                          );
                          return;
                        }
                        handleUpdateSelected({
                          status: "Maintenance",
                          seatType: blockedSeatType,
                        });
                      }}
                      disabled={!blockedSeatType}
                      className="flex items-center justify-center gap-2 rounded-md border border-zinc-700 bg-zinc-700/80 px-4 py-2 text-sm font-medium text-white transition hover:bg-zinc-600 disabled:cursor-not-allowed disabled:opacity-50"
                    >
                      Vô hiệu
                    </Button>
                  </div>
                </div>

                <div className="space-y-3">
                  <p className="text-xs font-medium uppercase tracking-wide text-zinc-400">
                    Đổi loại ghế
                  </p>
                  <Select
                    value={seatTypeActionValue}
                    onValueChange={(value) => {
                      setSeatTypeActionValue(value);
                      if (value === SEAT_TYPE_ACTION_DEFAULT) {
                        return;
                      }

                      const type = seatTypeOptions.find(
                        (item) => item.id === Number(value)
                      );
                      if (!type) {
                        showToast(
                          "Không tìm thấy loại ghế đã chọn.",
                          undefined,
                          "error"
                        );
                        setSeatTypeActionValue(SEAT_TYPE_ACTION_DEFAULT);
                        return;
                      }
                      handleUpdateSelected({
                        status: "Available",
                        seatType: type,
                      });
                      setSeatTypeActionValue(SEAT_TYPE_ACTION_DEFAULT);
                    }}
                  >
                    <SelectTrigger className="w-full bg-zinc-800 text-zinc-100">
                      <SelectValue />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-800 text-zinc-100">
                      <SelectGroup>
                        <SelectLabel>Các kiểu ghế</SelectLabel>
                        <SelectItem value={SEAT_TYPE_ACTION_DEFAULT}>
                          ---
                        </SelectItem>
                        {seatTypeOptions.map((seatType) => (
                          <SelectItem
                            key={seatType.id}
                            value={String(seatType.id)}
                          >
                            {seatType.name}
                          </SelectItem>
                        ))}
                      </SelectGroup>
                    </SelectContent>
                  </Select>
                </div>

                <div className="border-t border-zinc-700 pt-3">
                  <Button
                    onClick={() => setIsPreview((previous) => !previous)}
                    className="w-full rounded-md border border-zinc-700 bg-zinc-800 px-4 py-2 text-sm font-medium text-zinc-100 transition hover:bg-zinc-700"
                  >
                    {isPreview ? "Hiện ghế đã ẩn" : "Ẩn ghế bị vô hiệu"}
                  </Button>
                </div>
              </div>

              <div className="space-y-3 border-t border-zinc-700 px-5 py-4">
                <Button
                  onClick={() => setIsSeatDataModalOpen(true)}
                  disabled={seats.length === 0}
                  className="w-full rounded-lg bg-zinc-200 py-2.5 text-sm font-medium text-zinc-900 shadow hover:bg-zinc-200/80 disabled:cursor-not-allowed disabled:opacity-50"
                >
                  Xem dữ liệu sơ đồ ghế
                </Button>
                <Button
                  onClick={handleSaveSeatLayout}
                  disabled={isSaving || seats.length === 0 || !screenId}
                  className="w-full rounded-lg bg-blue-600 py-2.5 text-sm font-medium text-white shadow hover:bg-blue-500 disabled:cursor-not-allowed disabled:opacity-60"
                >
                  {isSaving
                    ? "Đang lưu sơ đồ ghế..."
                    : hasExistingLayout
                    ? "Cập nhật sơ đồ ghế"
                    : "Hoàn tất tạo sơ đồ ghế"}
                </Button>
              </div>
            </div>
          </div>

          <div
            className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-md"
            id="seat-layout-tour-legend"
          >
            <p className="text-xs font-semibold uppercase tracking-wide text-zinc-300">
              Chú thích loại ghế
            </p>
            <div className="mt-3 grid grid-cols-1 gap-3 sm:grid-cols-2">
              {seatTypeOptions.length > 0 ? (
                seatTypeOptions.map((seatType) => (
                  <div
                    key={seatType.id}
                    className="flex items-center gap-3 rounded-lg border border-zinc-800/60 bg-zinc-900/40 p-3"
                  >
                    <span
                      className="inline-flex h-4 w-4 shrink-0 rounded border border-white/20"
                      style={{ backgroundColor: seatType.color }}
                    />
                    <div className="space-y-0.5 overflow-hidden">
                      <p
                        className="text-sm font-medium text-zinc-100 truncate"
                        title={seatType.name}
                      >
                        {seatType.name}
                      </p>
                      {seatType.code && (
                        <p
                          className="text-xs uppercase tracking-wide text-zinc-500 truncate"
                          title={seatType.code}
                        >
                          {seatType.code}
                        </p>
                      )}
                    </div>
                  </div>
                ))
              ) : (
                <p className="text-sm text-zinc-500">
                  Chưa có dữ liệu loại ghế.
                </p>
              )}
            </div>
          </div>
        </div>
      </div>

      <Dialog open={isSeatDataModalOpen} onOpenChange={setIsSeatDataModalOpen}>
        <DialogContent className="max-w-3xl border border-zinc-800 bg-zinc-900 text-zinc-100">
          <DialogHeader id="seat-layout-data-tour-header">
            <DialogTitle>Dữ liệu sơ đồ ghế</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div
              className="max-h-96 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm font-mono"
              id="seat-layout-data-tour-preview"
            >
              {seatLayoutJson ? (
                <pre className="whitespace-pre-wrap break-words text-zinc-100">
                  {seatLayoutJson}
                </pre>
              ) : (
                <p className="text-zinc-400">Chưa có dữ liệu ghế.</p>
              )}
            </div>
            <div
              className="flex items-center justify-between gap-3"
              id="seat-layout-data-tour-actions"
            >
              <Button
                onClick={handleCopySeatLayout}
                className="bg-blue-500 text-white hover:bg-blue-500/80"
                disabled={!seatLayoutJson}
              >
                Sao chép dữ liệu
              </Button>
              {copyStatus === "copied" && (
                <span className="text-xs text-emerald-400">
                  Đã sao chép vào clipboard.
                </span>
              )}
              {copyStatus === "error" && (
                <span className="text-xs text-red-400">
                  Sao chép không thành công. Vui lòng thử lại.
                </span>
              )}
            </div>
          </div>
        </DialogContent>
      </Dialog>
    </div>
  );
};

export default SeatLayout;
