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
import React, { useEffect, useMemo, useState } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Seat } from "./Seat";
import { usePartnerHomeStore } from "@/store/partnerHomeStore";
import { useToast } from "@/components/ToastProvider";

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

    const isCoupleSeatType = Boolean(
      seatType &&
        ((seatType.code && seatType.code.toUpperCase() === "COUPLE") ||
          seatType.name.toLowerCase().includes("ghế đôi"))
    );

    if (isCoupleSeatType) {
      const selectedSeatObjects = seats.filter((seat) =>
        selectedSeats.includes(`${seat.row}${seat.column}`)
      );

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

  return (
    <div className="space-y-6 p-6">
      <div
        className="flex flex-col gap-4 lg:flex-row lg:items-start lg:justify-between
      rounded-xl border border-slate-800/60 bg-zinc-900/60 p-6 shadow-lg"
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
          {renderApiStatus()}
        </div>
        <Button variant="outline" onClick={() => setActiveTab("screen")}>
          Quay lại quản lý phòng chiếu
        </Button>
      </div>

      <div className="flex flex-col gap-10 xl:flex-row">
        <div className="flex-1 space-y-8 w-full">
          <div className="rounded-xl border border-slate-800/60 w-4xl bg-zinc-900/60 p-6 shadow-lg">
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

          <div className="rounded-xl flex flex-col w-4xl h-fit items-center border overflow-hidden border-slate-800/60 bg-zinc-900/60 p-6 shadow-lg">
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

                        let seatOrder = 0;

                        return (
                          <div
                            key={rowLabel}
                            className="flex w-full items-center gap-3"
                          >
                            {/* <div className="w-10" /> */}
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
                              {columns.map((column) => {
                                const seat = seatLookup.get(
                                  `${rowLabel}-${column}`
                                );
                                const seatKey = `${rowLabel}${column}`;

                                if (!seat) {
                                  return (
                                    <div
                                      key={seatKey}
                                      className="flex h-10 w-10 items-center justify-center rounded-md border border-dashed border-zinc-700/60 text-xs text-zinc-500"
                                    >
                                      —
                                    </div>
                                  );
                                }

                                const isMaintenance =
                                  seat.status === "Maintenance";
                                const label = isMaintenance
                                  ? "Z0"
                                  : `${seat.row}${++seatOrder}`;

                                return (
                                  <Seat
                                    key={`${seat.row}-${seat.column}`}
                                    data={seat}
                                    isSelected={selectedSeats.includes(seatKey)}
                                    onToggleSelect={() =>
                                      toggleSelect(seat.row, seat.column)
                                    }
                                    label={label}
                                    isPreview={isPreview}
                                  />
                                );
                              })}
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
          <div className="rounded-xl border border-zinc-700 bg-zinc-900/80 shadow-xl">
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

          <div className="rounded-xl border border-zinc-700 bg-zinc-900/70 p-4 shadow-md">
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
                    <div className="space-y-0.5">
                      <p className="text-sm font-medium text-zinc-100">
                        {seatType.name}
                      </p>
                      {seatType.code && (
                        <p className="text-xs uppercase tracking-wide text-zinc-500">
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
          <DialogHeader>
            <DialogTitle>Dữ liệu sơ đồ ghế</DialogTitle>
          </DialogHeader>
          <div className="space-y-4">
            <div className="max-h-96 overflow-auto rounded-lg border border-zinc-800 bg-zinc-950/60 p-4 text-sm font-mono">
              {seatLayoutJson ? (
                <pre className="whitespace-pre-wrap break-words text-zinc-100">
                  {seatLayoutJson}
                </pre>
              ) : (
                <p className="text-zinc-400">Chưa có dữ liệu ghế.</p>
              )}
            </div>
            <div className="flex items-center justify-between gap-3">
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
