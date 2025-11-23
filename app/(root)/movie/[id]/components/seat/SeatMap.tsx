"use client";

import React, { useState, useMemo, Dispatch, SetStateAction } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  useGetBookingSessionDetail,
  useSeatActions,
} from "@/apis/user.booking-session.api";
import {
  Dialog,
  DialogClose,
  DialogContent,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import CombosDialog from "../CombosDialog";
import { IoChevronBackOutline } from "react-icons/io5";
// import { RealtimeSeat, useSeatRealtime } from "@/hooks/useRealTimeSeatStream";
import { Spinner } from "@/components/ui/spinner";
import { useShowtimeSeat } from "@/hooks/useShowtimeSeatHub";
import { useToast } from "@/components/ToastProvider";

interface RealtimeSeat {
  SeatId: number;
  RowCode: string;
  SeatNumber: number;
  SeatTypeId: number;
  Status: "AVAILABLE" | "LOCKED" | "SOLD" | string;
  LockedUntil: string | null;
}

interface SeatType {
  seatTypeId: number;
  code: string;
  name: string;
  color: string;
  surcharge: number;
}

interface SeatMapProps {
  seatTypes?: SeatType[];
  cinemaName?: string;
  movieTitle?: string;
  basePrice?: number;
  sessionId?: string;
  onPurchase?: (selectedSeats: number[]) => void;
  setSeatLayoutContent?: Dispatch<SetStateAction<boolean>>;
}

const SeatMap = ({
  seatTypes,
  cinemaName,
  movieTitle,
  basePrice,
  sessionId,
  onPurchase,
  setSeatLayoutContent,
}: SeatMapProps) => {
  const { data: sessionDetailRes } = useGetBookingSessionDetail(
    sessionId ?? "",
    true
  );

  const showtimeId = sessionDetailRes?.result?.showtimeId;
  const { showToast } = useToast();

  // const { seats: realtimeSeats } = useSeatRealtime(
  //   showtimeId ? Number(showtimeId) : 0
  // );

  console.log(`SessionId: ${sessionId} ---- ShowtimeId: ${showtimeId}`);

  const {
    seatMap: realtimeSeats,
    isConnected,
    lockSeat,
    releaseSeat,
  } = useShowtimeSeat(showtimeId ?? 0);

  const [selectedSeats, setSelectedSeats] = useState<
    { seatId: number; seatTitle: string }[]
  >([]);

  const [isMutating, setIsMutating] = useState(false);

  const MAX_SEATS = 8;
  const mutateSeatActions = useSeatActions();

  const seatTypeColor = useMemo(() => {
    const map: Record<number, string> = {};
    seatTypes?.forEach((type) => {
      map[type.seatTypeId] = type.color;
    });
    return map;
  }, [seatTypes]);

  const seatTypeSurcharge = useMemo(() => {
    const map: Record<number, number> = {};
    seatTypes?.forEach((type) => {
      map[type.seatTypeId] = type.surcharge;
    });
    return map;
  }, [seatTypes]);

  const handleLockReleaseSeat = async ({
    isSeatExist,
    lockSeat,
  }: {
    isSeatExist: boolean;
    lockSeat: RealtimeSeat;
  }) => {
    if (isMutating) return;
    setIsMutating(true);
    const seatIds = [lockSeat.SeatId];
    if (isSeatExist) {
      // release
      mutateSeatActions.release.mutate(
        {
          selectedSeat: seatIds,
          sessionId: sessionId ?? "",
        },
        {
          onSuccess: (res) => {
            console.log("release ghế thành công:", res?.currentSeatIds);
            setIsMutating(false);
          },
          onError: (error) => {
            showToast(error.message, "", "warning");
            setSeatLayoutContent!(false);
            console.error("Không release được ghế:", error);
            setIsMutating(false);
          },
        }
      );
    } else {
      // lock
      mutateSeatActions.lock.mutate(
        {
          sessionId: sessionId ?? "",
          selectedSeat: seatIds,
        },
        {
          onSuccess: (res) => {
            console.log("Lock ghế thành công:", res?.currentSeatIds);
            setIsMutating(false);
          },
          onError: (error) => {
            showToast(error.message, "", "warning");
            setSelectedSeats((prev) =>
              prev.filter((s) => s.seatId !== lockSeat.SeatId)
            );
            console.error("Không lock được ghế:", error);
            setIsMutating(false);
          },
        }
      );
    }
  };

  const handleLockReleaseCoupleSeat = async ({
    isSeatExist,
    lockSeat1,
    lockSeat2,
  }: {
    isSeatExist: boolean;
    lockSeat1: RealtimeSeat;
    lockSeat2: RealtimeSeat;
  }) => {
    if (isMutating) return;
    setIsMutating(true);
    const seatIds = [lockSeat1.SeatId, lockSeat2.SeatId];

    if (isSeatExist) {
      mutateSeatActions.release.mutate(
        {
          selectedSeat: seatIds,
          sessionId: sessionId ?? "",
        },
        {
          onSuccess: () => {
            console.log(`Release ghế: ${seatIds.join(", ")}`);
            setIsMutating(false);
          },
          onError: (err) => {
            showToast(err.message, "", "warning");
            setSeatLayoutContent!(false);
            console.error("Không release được ghế:", err);
            setIsMutating(false);
          },
        }
      );
    } else {
      mutateSeatActions.lock.mutate(
        {
          selectedSeat: seatIds,
          sessionId: sessionId ?? "",
        },
        {
          onSuccess: (res) => {
            console.log("Lock ghế thành công:", res?.currentSeatIds);
            setIsMutating(false);
          },
          onError: (err) => {
            showToast(err.message, "", "warning");
            setSeatLayoutContent!(false);
            console.error("Không lock được ghế:", err);
            setIsMutating(false);
          },
        }
      );
    }
  };

  const toggleSeat = (seat: RealtimeSeat, seatTitle: string) => {
    const type = seatTypes?.find((t) => t.seatTypeId === seat.SeatTypeId);
    if (
      !type ||
      type.code === "DISABLE"
      //   type.code === "BROKEN" ||
      //   seat.Status !== "AVAILABLE"
    )
      return;

    const existing = selectedSeats.some(
      (sSeat) => seat.SeatId === sSeat.seatId
    );

    console.log(seat);

    setSelectedSeats((prev) => {
      if (existing) {
        return prev.filter((sSeat) => sSeat.seatId !== seat.SeatId);
      } else {
        if (prev.length >= MAX_SEATS) {
          // alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
          return prev;
        }
        const newSeats = prev.filter((sSeat) => sSeat.seatId !== seat.SeatId);
        return [...newSeats, { seatId: seat.SeatId, seatTitle }];
      }
    });

    handleLockReleaseSeat({ isSeatExist: existing, lockSeat: seat });
  };

  const toggleCoupleSeat = (seat1: RealtimeSeat, seat2: RealtimeSeat) => {
    const type = seatTypes?.find((t) => t.seatTypeId === seat1.SeatTypeId);
    if (!type || type.code === "DISABLE") return;

    const hasSeat1 = selectedSeats.some((s) => s.seatId === seat1.SeatId);
    const hasSeat2 = selectedSeats.some((s) => s.seatId === seat2.SeatId);

    const isBothSelected = hasSeat1 && hasSeat2;

    setSelectedSeats((prev) => {
      // Nếu đang selected cả đôi -> unselect cả đôi
      if (isBothSelected) {
        return prev.filter(
          (s) => s.seatId !== seat1.SeatId && s.seatId !== seat2.SeatId
        );
      }

      // Chưa chọn đủ -> chọn cả đôi
      const newPrev = prev.filter(
        (s) => s.seatId !== seat1.SeatId && s.seatId !== seat2.SeatId
      );

      if (newPrev.length + 2 > MAX_SEATS) {
        alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
        return prev;
      }

      return [
        ...newPrev,
        {
          seatId: seat1.SeatId,
          seatTitle: `${seat1.RowCode}${seat1.SeatNumber}`,
        },
        {
          seatId: seat2.SeatId,
          seatTitle: `${seat2.RowCode}${seat2.SeatNumber}`,
        },
      ];
    });

    // Call lock / release
    handleLockReleaseCoupleSeat({
      isSeatExist: isBothSelected,
      lockSeat1: seat1,
      lockSeat2: seat2,
    });
  };

  // group rows
  const rows = useMemo(() => {
    const grouped: Record<string, RealtimeSeat[]> = {};
    realtimeSeats?.forEach((seat) => {
      if (!grouped[seat.RowCode]) grouped[seat.RowCode] = [];
      grouped[seat.RowCode].push(seat);
    });
    Object.values(grouped).forEach((row) =>
      row.sort((a, b) => a.SeatNumber - b.SeatNumber)
    );
    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [realtimeSeats]);

  // const safeBasePrice = basePrice ?? 0;

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, sSeat) => {
      const seat = realtimeSeats?.find((s) => s.SeatId === sSeat.seatId);
      const newBasePrice = basePrice ?? 0;
      if (seat) {
        const surcharge = seatTypeSurcharge[seat.SeatTypeId] || 0;
        return total + newBasePrice + surcharge;
      }
      return total;
    }, 0);
  }, [selectedSeats, realtimeSeats, seatTypeSurcharge, basePrice]);

  const selectedSeatLabels = useMemo(() => {
    return selectedSeats
      .map((sSeat) => sSeat.seatTitle)
      .filter(Boolean)
      .join(", ");
  }, [selectedSeats]);

  const [combosDialog, setCombosDialog] = useState<boolean>(false);

  const handlePurchase = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế");
      return;
    }
    if (onPurchase) {
      const newSelectedSeats = selectedSeats.map((item) => item.seatId);
      onPurchase(newSelectedSeats);
      setCombosDialog(true);
    } else {
      alert(
        `Xác nhận mua ${
          selectedSeats.length
        } vé với tổng giá: ${totalPrice.toLocaleString("vi-VN")}đ`
      );
    }
  };

  const renderSeats = (rowCode: string, rowSeats: RealtimeSeat[]) => {
    const elements: React.ReactNode[] = [];
    let i = 0;
    let index = 1;

    while (i < rowSeats.length) {
      const seat = rowSeats[i];
      const type = seatTypes?.find((t) => t.seatTypeId === seat.SeatTypeId);

      const isSeatDisabled = type?.code === "DISABLE";
      // type?.code === "BROKEN" ||
      // seat.Status !== "AVAILABLE";

      const isSeatLocked = seat.Status === "LOCKED";

      // handle couple
      if (type?.code === "COUPLE" && i + 1 < rowSeats.length) {
        const nextSeat = rowSeats[i + 1];
        const nextType = seatTypes?.find(
          (t) => t.seatTypeId === nextSeat.SeatTypeId
        );

        if (
          nextType?.code === "COUPLE" &&
          nextSeat.SeatNumber === seat.SeatNumber + 1
        ) {
          const isCoupleDisabled =
            isSeatDisabled || nextSeat.Status !== "AVAILABLE";
          const color = seatTypeColor[seat.SeatTypeId] || "#ccc";
          const isSelected =
            selectedSeats.some((sSeat) => seat.SeatId === sSeat.seatId) &&
            selectedSeats.some((sSeat) => nextSeat.SeatId === sSeat.seatId);

          const index1 = index;
          const index2 = index + 1;

          elements.push(
            <button
              key={`${seat.SeatId}-${nextSeat.SeatId}`}
              onClick={() => toggleCoupleSeat(seat, nextSeat)}
              disabled={isMutating}
              className={`w-26 h-12 rounded-lg text-white/80 transition-all flex items-center justify-center text-xs font-bold
              ${isSelected ? "ring-2 ring-yellow-400 scale-105" : ""}
              ${
                isCoupleDisabled
                  ? "bg-zinc-900 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer"
              }
            `}
              style={{
                backgroundColor: isCoupleDisabled ? undefined : color,
              }}
              title={`${rowCode}${seat.SeatNumber} - ${rowCode}${nextSeat.SeatNumber} - ${type?.name}`}
            >
              {!isCoupleDisabled
                ? `${rowCode}${index1} - ${rowCode}${index2}`
                : null}
            </button>
          );

          if (!isCoupleDisabled) index += 2;
          i += 2;
          continue;
        }
      }

      // normal seat
      const color = seatTypeColor[seat.SeatTypeId] || "#ccc";
      const isSelected = selectedSeats.some((s) => s.seatId === seat.SeatId);
      const seatDisplayTitle = `${rowCode}${index}`;

      const isLockedAndSelected = isSeatLocked && isSelected;

      elements.push(
        <button
          key={seat.SeatId}
          onClick={() => toggleSeat(seat, seatDisplayTitle)}
          disabled={isMutating}
          className={`
      w-12 h-12 rounded-lg text-white opacity-90 transition-all flex items-center justify-center text-xs font-bold

      ${
        isLockedAndSelected
          ? "ring-2 ring-white scale-105 hover:scale-110 cursor-pointer"
          : ""
      }

      ${
        isSelected && !isLockedAndSelected
          ? "scale-105 ring-2 ring-amber-400 hover:scale-110 cursor-pointer"
          : ""
      }

      /* Disabled seat */
      ${
        !isSelected && isSeatDisabled
          ? "bg-zinc-900 cursor-default pointer-events-none"
          : ""
      }

      /* Locked by others (chưa chọn) */
      ${
        !isSelected && !isLockedAndSelected && isSeatLocked
          ? "bg-red-900 cursor-default pointer-events-none"
          : ""
      }

      /* Normal seat */
      ${
        !isSelected && !isSeatDisabled && !isSeatLocked
          ? "hover:scale-110 cursor-pointer"
          : ""
      }
    `}
          style={{
            backgroundColor: isSeatDisabled
              ? undefined
              : isLockedAndSelected
              ? "#007bff" // màu xanh khi vừa locked vừa selected
              : isSeatLocked || isSelected
              ? "#7f1d1d"
              : color,
          }}
          title={`${rowCode}${seat.SeatNumber} - ${type?.name}`}
        >
          {!isSeatDisabled ? `${rowCode}${index}` : null}
        </button>
      );

      if (!isSeatDisabled) index += 1;
      i += 1;
    }

    return elements;
  };

  const handleReleaseSeats = () => {
    const seats = selectedSeats.map((s) => s.seatId);

    mutateSeatActions.release.mutate(
      {
        selectedSeat: seats ?? [],
        sessionId: sessionId ?? "",
      },
      {
        onSuccess: () => console.log("release toàn bộ ghế thành công"),
        onError: (error) => console.log("Không release được ghế: ", error),
      }
    );
  };

  return (
    <DialogContent
      className="!max-w-[98vw] !w-[60vw] !h-fit bg-white/5 border 
    border-white/10 rounded-xl p-0 flex flex-col gap-5 
    transition-all duration-200 [&>button]:hidden"
      onInteractOutside={(e) => e.preventDefault()}
      onEscapeKeyDown={(e) => e.preventDefault()}
    >
      <DialogTitle className="sr-only">Seat Selection</DialogTitle>
      <div className="flex flex-col h-full bg-zinc-900 rounded-xl">
        {/* Header */}
        <div className="relative flex items-center justify-center gap-4 p-4 bg-zinc-800 border-b border-zinc-700 rounded-xl">
          <h2 className="text-xl font-bold text-white">Buy Movie Tickets</h2>
          <DialogClose className="absolute left-1">
            <IoChevronBackOutline
              onClick={handleReleaseSeats}
              className="cursor-pointer hover:scale-125 duration-150 transition-all"
              size={20}
            />
          </DialogClose>
        </div>

        <div className="flex-1 overflow-auto">
          <div className="px-4">
            <TransformWrapper
              initialScale={1}
              minScale={0.5}
              maxScale={3}
              centerOnInit={true}
            >
              {() => (
                <TransformComponent
                  wrapperClass="!w-full !h-[50vh]"
                  contentClass="!w-auto !h-auto"
                >
                  <div className="flex w-full flex-col items-center justify-center gap-2 p-8">
                    {/* Screen */}
                    <div className="flex w-full flex-col items-center pt-6 pb-6 select-none">
                      <div className="relative w-2/4 h-2 bg-gradient-to-t from-zinc-400/70 to-transparent rounded-t-full" />
                      <span className="mt-3 text-gray-200 text-sm tracking-wide font-medium">
                        Màn hình
                      </span>
                    </div>
                    {realtimeSeats.length > 0 ? (
                      rows.map(([rowCode, rowSeats]) => (
                        <div
                          key={rowCode}
                          className="flex items-center justify-center gap-2"
                        >
                          {renderSeats(rowCode, rowSeats)}
                        </div>
                      ))
                    ) : (
                      <div className="flex flex-col items-center justify-center">
                        <Spinner />
                        Đang tải sơ đồ rạp...
                      </div>
                    )}
                  </div>
                </TransformComponent>
              )}
            </TransformWrapper>
          </div>

          {/* Legend */}
          <div className="px-3 py-2 flex flex-wrap gap-2 justify-center">
            {seatTypes?.map((type) => (
              <div key={type.seatTypeId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: type.color }}
                />
                <span className="text-xs text-gray-300">{type.name}</span>
              </div>
            ))}
          </div>
        </div>

        {/* Bottom Info */}
        <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-2xl shadow-lg p-3 backdrop-blur-md">
          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pb-2 border-b border-zinc-700/70">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Rạp chiếu
              </p>
              <p className="text-white font-semibold text-base">{cinemaName}</p>
            </div>
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
                Phim
              </p>
              <p className="text-white font-semibold text-base">{movieTitle}</p>
            </div>
          </div>

          <div className="pt-2">
            <p className="text-xs text-gray-400 uppercase tracking-wider mb-1">
              Ghế đã chọn
            </p>
            <div className="flex items-center justify-between">
              <div>
                <p
                  className={`font-semibold ${
                    selectedSeats.length > 0
                      ? "text-white"
                      : "text-gray-500 italic"
                  }`}
                >
                  {selectedSeatLabels || "Chưa chọn ghế"}
                </p>
                <p className="text-xs text-gray-500 mt-1">
                  {selectedSeats.length}/{MAX_SEATS} ghế
                </p>
              </div>
              {selectedSeats.length > 0 && (
                <div className="text-xs text-gray-400 bg-zinc-700/60 rounded-lg px-3 py-1">
                  Đang chọn
                </div>
              )}
            </div>
          </div>

          <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-5 mt-4 border-t border-zinc-700/70">
            <div>
              <p className="text-xs text-gray-400 uppercase tracking-wider">
                Tổng tiền
              </p>
              <p className="text-3xl font-bold text-yellow-400 drop-shadow-sm">
                {totalPrice.toLocaleString("vi-VN")}đ
              </p>
            </div>
            <Dialog>
              <DialogTrigger asChild>
                <button
                  onClick={handlePurchase}
                  disabled={selectedSeats.length === 0}
                  className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all duration-200 bg-gradient-to-r from-[#f84565] to-[#d92d52] hover:from-[#ff5a77] hover:to-[#f84565] disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed shadow-md"
                >
                  Tiếp tục
                </button>
              </DialogTrigger>
              {combosDialog && (
                <CombosDialog
                  sessionId={sessionId}
                  selectedSeats={selectedSeats}
                />
              )}
            </Dialog>
          </div>
        </div>
      </div>
    </DialogContent>
  );
};

export default SeatMap;
