"use client";

import React, { useState, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { Seat } from "@/apis/user.catalog.api";
import { useLockSeats, useSeatActions } from "@/apis/user.booking-session.api";

interface SeatType {
  seatTypeId: number;
  code: string;
  name: string;
  color: string;
  surcharge: number;
}

interface SeatMapProps {
  totalRows?: number;
  totalColumns?: number;
  seats?: Seat[];
  seatTypes?: SeatType[];
  cinemaName?: string;
  movieTitle?: string;
  basePrice?: number;
  sessionId?: string;
  onPurchase?: (selectedSeats: number[]) => void;
}

const SeatMap = ({
  seats,
  seatTypes,
  cinemaName,
  movieTitle,
  basePrice,
  sessionId,
  onPurchase,
}: SeatMapProps) => {
  const [selectedSeats, setSelectedSeats] = useState<
    { seatId: number; seatTitle: string }[]
  >([]);
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

  const toggleSeat = (seat: Seat, seatTitle: string) => {
    console.log(seat.seatId);

    const type = seatTypes?.find((t) => t.seatTypeId === seat.seatTypeId);
    if (
      !type ||
      type.code === "DISABLE" ||
      type.code === "BROKEN" ||
      seat.status !== "AVAILABLE"
    )
      return;

    const existing = selectedSeats.some(
      (sSeat) => seat.seatId === sSeat.seatId
    );

    setSelectedSeats((prev) => {
      if (existing) {
        return prev.filter((sSeat) => sSeat.seatId !== seat.seatId);
      } else {
        if (prev.length >= MAX_SEATS) {
          alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
          return prev;
        }

        const newSeats = prev.filter((sSeat) => sSeat.seatId !== seat.seatId);

        return [...newSeats, { seatId: seat.seatId, seatTitle }];
      }
    });

    // if (existing) {
    //   // release
    //   mutateSeatActions.release.mutate({
    //     selectedSeat: [seat.seatId],
    //     sessionId: sessionId ?? "",
    //   });
    // } else {
    //   // lock
    //   mutateSeatActions.lock.mutate({
    //     selectedSeat: [seat.seatId],
    //     sessionId: sessionId ?? "",
    //   });
    // }
  };

  const toggleCoupleSeat = (seat1: Seat, seat2: Seat, seatTitle: string) => {
    const type = seatTypes?.find((t) => t.seatTypeId === seat1.seatTypeId);
    if (!type || type.code === "DISABLE" || type.code === "BROKEN") return;
    if (seat1.status !== "AVAILABLE" || seat2.status !== "AVAILABLE") return;

    setSelectedSeats((prev) => {
      const hasSeat1 = prev.some((sSeat) => seat1.seatId === sSeat.seatId);
      const hasSeat2 = prev.some((sSeat) => seat2.seatId === sSeat.seatId);

      // Nếu cả 2 đều được chọn, bỏ chọn cả 2
      if (hasSeat1 && hasSeat2) {
        return prev.filter(
          (sSeat) =>
            sSeat.seatId !== seat1.seatId && sSeat.seatId !== seat2.seatId
        );
      }

      // Nếu chưa chọn hoặc chỉ chọn 1, chọn cả 2
      const newSeats = prev.filter(
        (sSeat) =>
          sSeat.seatId !== seat1.seatId && sSeat.seatId !== seat2.seatId
      );
      if (newSeats.length + 2 > MAX_SEATS) {
        alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
        return prev;
      }
      return [
        ...newSeats,
        { seatId: seat1.seatId, seatTitle },
        { seatId: seat2.seatId, seatTitle: "" },
      ];
    });
  };

  const rows = useMemo(() => {
    const grouped: Record<string, Seat[]> = {};
    seats?.forEach((seat) => {
      if (!grouped[seat.rowCode]) grouped[seat.rowCode] = [];
      grouped[seat.rowCode].push(seat);
    });

    Object.values(grouped).forEach((row) =>
      row.sort((a, b) => a.seatNumber - b.seatNumber)
    );

    return Object.entries(grouped).sort(([a], [b]) => a.localeCompare(b));
  }, [seats]);

  const safeBasePrice = basePrice ?? 0;

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, sSeat) => {
      const seat = seats?.find((s) => s.seatId === sSeat.seatId);
      if (seat) {
        const surcharge = seatTypeSurcharge[seat.seatTypeId] || 0;
        return total + safeBasePrice + surcharge;
      }
      return total;
    }, 0);
  }, [selectedSeats, seats, seatTypeSurcharge, safeBasePrice]);

  const selectedSeatLabels = useMemo(() => {
    return selectedSeats
      .map((sSeat) => {
        return sSeat.seatTitle;
      })
      .filter(Boolean)
      .join(", ");
  }, [selectedSeats]);

  const handlePurchase = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế");
      return;
    }
    if (onPurchase) {
      const newSelectedSeats = selectedSeats.map((item) => item.seatId);
      onPurchase(newSelectedSeats);
    } else {
      alert(
        `Xác nhận mua ${
          selectedSeats.length
        } vé với tổng giá: ${totalPrice.toLocaleString("vi-VN")}đ`
      );
    }
  };

  const renderSeats = (rowCode: string, rowSeats: Seat[]) => {
    const elements = [];
    let i = 0;
    let index = 1;

    while (i < rowSeats.length) {
      const seat = rowSeats[i];
      const type = seatTypes?.find((t) => t.seatTypeId === seat.seatTypeId);

      const isSeatDisabled =
        type?.code === "DISABLE" ||
        type?.code === "BROKEN" ||
        seat.status !== "AVAILABLE";

      // =========================
      // HANDLE COUPLE SEAT
      // =========================
      if (type?.code === "COUPLE" && i + 1 < rowSeats.length) {
        const nextSeat = rowSeats[i + 1];
        const nextType = seatTypes?.find(
          (t) => t.seatTypeId === nextSeat.seatTypeId
        );

        if (
          nextType?.code === "COUPLE" &&
          nextSeat.seatNumber === seat.seatNumber + 1
        ) {
          const isCoupleDisabled =
            isSeatDisabled || nextSeat.status !== "AVAILABLE";

          const color = seatTypeColor[seat.seatTypeId] || "#ccc";
          const isSelected =
            selectedSeats.some((sSeat) => seat.seatId === sSeat.seatId) &&
            selectedSeats.some((sSeat) => nextSeat.seatId === sSeat.seatId);

          const index1 = index;
          const index2 = index + 1;

          elements.push(
            <button
              key={`${seat.seatId}-${nextSeat.seatId}`}
              onClick={() =>
                toggleCoupleSeat(
                  seat,
                  nextSeat,
                  `${rowCode}${index1} - ${rowCode}${index2}`
                )
              }
              className={`w-26 h-12 rounded-lg text-white/80 transition-all flex items-center justify-center text-xs font-bold
              ${isSelected ? "ring-2 ring-yellow-400 scale-105" : ""}
              ${
                isCoupleDisabled
                  ? "bg-zinc-900 cursor-not-allowed"
                  : "hover:scale-105 cursor-pointer"
              }
            `}
              style={{
                backgroundColor: isCoupleDisabled ? "" : color,
              }}
              title={`${rowCode}${seat.seatNumber} - ${rowCode}${nextSeat.seatNumber} - ${type?.name}`}
            >
              {!isCoupleDisabled && `${rowCode}${index1} - ${rowCode}${index2}`}
            </button>
          );

          // Couple seat dùng chung 1 index
          if (!isCoupleDisabled) index += 2;

          i += 2;
          continue;
        }
      }

      // =========================
      // NORMAL SEAT
      // =========================

      const color = seatTypeColor[seat.seatTypeId] || "#ccc";
      const isSelected = selectedSeats.some((s) => s.seatId === seat.seatId);
      const seatDisplayTitle = `${rowCode}${index}`;

      elements.push(
        <button
          key={seat.seatId}
          onClick={() => toggleSeat(seat, seatDisplayTitle)}
          className={`w-12 h-12 rounded-lg text-white opacity-90 transition-all flex items-center justify-center text-xs font-bold
          ${isSelected ? "ring-2 ring-yellow-400 scale-105" : ""}
          ${isSeatDisabled ? "bg-zinc-900" : "hover:scale-110 cursor-pointer"}
        `}
          style={{
            backgroundColor: isSeatDisabled ? "" : color,
          }}
          title={`${rowCode}${index} - ${type?.name}`}
        >
          {!isSeatDisabled && `${rowCode}${index}`}
        </button>
      );

      if (!isSeatDisabled) index += 1;

      i++;
    }

    return elements;
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl">
      {/* Header */}
      <div className="relative flex items-center justify-center gap-4 p-4 bg-zinc-800 border-b border-zinc-700 rounded-xl">
        <h2 className="text-xl font-bold text-white">Buy Movie Tickets</h2>
      </div>

      <div className="flex-1 overflow-auto">
        {/* Seat Map with Zoom/Pan */}
        <div className="px-4">
          <TransformWrapper
            initialScale={1}
            minScale={0.5}
            maxScale={3}
            centerOnInit={true}
          >
            {() => (
              <>
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
                    {rows.map(([rowCode, rowSeats]) => (
                      <div
                        key={rowCode}
                        className="flex items-center justify-center gap-2"
                      >
                        {renderSeats(rowCode, rowSeats)}
                      </div>
                    ))}
                  </div>
                </TransformComponent>
              </>
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

      {/* Bottom Info Section */}
      <div className="bg-zinc-800/90 border border-zinc-700/60 rounded-2xl shadow-lg p-3 backdrop-blur-md">
        {/* Header: Movie & Cinema Info */}
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

        {/* Selected Seats */}
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
                {selectedSeatLabels}
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

        {/* Total Price & Action */}
        <div className="flex flex-col sm:flex-row sm:items-center sm:justify-between gap-2 pt-5 mt-4 border-t border-zinc-700/70">
          <div>
            <p className="text-xs text-gray-400 uppercase tracking-wider">
              Tổng tiền
            </p>
            <p className="text-3xl font-bold text-yellow-400 drop-shadow-sm">
              {totalPrice.toLocaleString("vi-VN")}đ
            </p>
          </div>
          <button
            onClick={handlePurchase}
            disabled={selectedSeats.length === 0}
            className="w-full sm:w-auto px-8 py-3 rounded-xl font-bold text-white transition-all duration-200
        bg-gradient-to-r from-[#f84565] to-[#d92d52]
        hover:from-[#ff5a77] hover:to-[#f84565]
        disabled:from-gray-700 disabled:to-gray-700 disabled:cursor-not-allowed shadow-md"
          >
            Mua vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
