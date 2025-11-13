"use client";

import React, { useState, useMemo } from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import { IoIosArrowBack } from "react-icons/io";
import { Seat } from "@/apis/user.catalog.api";

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
  onClose?: () => void;
  onPurchase?: (selectedSeats: number[]) => void;
}

const SeatMap = ({
  seats,
  seatTypes,
  cinemaName = "CGV Vincom Center",
  movieTitle = "The Avengers: Endgame",
  basePrice = 100000,
  onClose,
  onPurchase,
}: SeatMapProps) => {
  const [selectedSeats, setSelectedSeats] = useState<number[]>([]);
  const MAX_SEATS = 8;

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

  const toggleSeat = (seat: Seat) => {
    const type = seatTypes?.find((t) => t.seatTypeId === seat.seatTypeId);
    if (!type || type.code === "DISABLE" || type.code === "BROKEN") return;

    setSelectedSeats((prev) => {
      if (prev.includes(seat.seatId)) {
        return prev.filter((id) => id !== seat.seatId);
      } else {
        if (prev.length >= MAX_SEATS) {
          alert(`Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`);
          return prev;
        }
        return [...prev, seat.seatId];
      }
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

  const totalPrice = useMemo(() => {
    return selectedSeats.reduce((total, seatId) => {
      const seat = seats?.find((s) => s.seatId === seatId);
      if (seat) {
        const surcharge = seatTypeSurcharge[seat.seatTypeId] || 0;
        return total + basePrice + surcharge;
      }
      return total;
    }, 0);
  }, [selectedSeats, seats, seatTypeSurcharge, basePrice]);

  const selectedSeatLabels = useMemo(() => {
    return selectedSeats
      .map((id) => {
        const s = seats?.find((seat) => seat.seatId === id);
        return s ? `${s.rowCode}${s.seatNumber}` : "";
      })
      .filter(Boolean)
      .join(", ");
  }, [selectedSeats, seats]);

  const handlePurchase = () => {
    if (selectedSeats.length === 0) {
      alert("Vui lòng chọn ít nhất một ghế");
      return;
    }
    if (onPurchase) {
      onPurchase(selectedSeats);
    } else {
      alert(
        `Xác nhận mua ${
          selectedSeats.length
        } vé với tổng giá: ${totalPrice.toLocaleString("vi-VN")}đ`
      );
    }
  };

  return (
    <div className="flex flex-col h-full bg-zinc-900 rounded-xl">
      {/* Header */}
      <div className="relative flex items-center justify-center gap-4 p-4 bg-zinc-800 border-b border-zinc-700 rounded-xl">
        {/* <button
          onClick={onClose}
          className="p-2 absolute left-1 hover:bg-zinc-700 rounded-lg transition-colors"
        >
          <IoIosArrowBack className="w-6 h-6 text-white" />
        </button> */}
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
                  wrapperClass="!w-full !h-[40vh]"
                  contentClass="!w-auto !h-auto"
                >
                  <div className="flex w-full flex-col items-center justify-center gap-2 p-8">
                    {/* Screen */}
                    <div className="flex w-full flex-col items-center pt-6 pb-6 select-none">
                      {/* Đường cong mô phỏng màn hình */}
                      <div className="relative w-2/4 h-2 bg-gradient-to-t from-zinc-400/70 to-transparent rounded-t-full" />

                      {/* Chữ "Màn hình" bên dưới */}
                      <span className="mt-3 text-gray-200 text-sm tracking-wide font-medium">
                        Màn hình
                      </span>
                    </div>
                    {rows.map(([rowCode, rowSeats]) => (
                      <div
                        key={rowCode}
                        className="flex items-center justify-center gap-2"
                      >
                        {/* <span className="text-sm w-8 text-right text-gray-300 font-semibold mr-4">
                          {rowCode}
                        </span> */}
                        {rowSeats.map((seat) => {
                          const color =
                            seatTypeColor[seat.seatTypeId] || "#ccc";
                          const isSelected = selectedSeats.includes(
                            seat.seatId
                          );
                          const type = seatTypes?.find(
                            (t) => t.seatTypeId === seat.seatTypeId
                          );
                          const isDisabled =
                            type?.code === "DISABLE" ||
                            type?.code === "BROKEN" ||
                            seat.status !== "AVAILABLE";

                          return (
                            <button
                              key={seat.seatId}
                              onClick={() => toggleSeat(seat)}
                              //   disabled={isDisabled}
                              className={`w-12 h-12 rounded-lg transition-all flex items-center justify-center text-xs font-bold
                                ${
                                  isSelected
                                    ? "ring-4 ring-yellow-400 scale-105"
                                    : ""
                                }
                                ${
                                  isDisabled
                                    ? "bg-zinc-900"
                                    : "hover:scale-110 cursor-pointer"
                                }
                              `}
                              style={{
                                backgroundColor: isDisabled ? "" : color,
                                color: isDisabled ? "#666" : "#000",
                              }}
                              title={`${rowCode}${seat.seatNumber} - ${type?.name}`}
                            >
                              {!isDisabled && rowCode + seat.seatNumber}
                            </button>
                          );
                        })}
                      </div>
                    ))}
                  </div>
                </TransformComponent>
              </>
            )}
          </TransformWrapper>
        </div>

        {/* Legend */}
        <div className="px-6 py-4 flex flex-wrap gap-4 justify-center">
          {seatTypes?.map((type) => (
            <div key={type.seatTypeId} className="flex items-center gap-2">
              <div
                className="w-6 h-6 rounded"
                style={{ backgroundColor: type.color }}
              />
              <span className="text-sm text-gray-300">{type.name}</span>
            </div>
          ))}
        </div>
      </div>

      {/* Bottom Info Section */}
      <div className="bg-zinc-800 border-t border-zinc-700 p-6 space-y-4 rounded-xl">
        {/* Cinema & Movie Info */}
        <div className="grid grid-cols-2 gap-4">
          <div>
            <p className="text-xs text-gray-400 mb-1">Rạp chiếu</p>
            <p className="text-white font-semibold">{cinemaName}</p>
          </div>
          <div>
            <p className="text-xs text-gray-400 mb-1">Phim</p>
            <p className="text-white font-semibold">{movieTitle}</p>
          </div>
        </div>

        {/* Selected Seats */}
        <div>
          <p className="text-xs text-gray-400 mb-1">Ghế đã chọn</p>
          <p className="text-white font-semibold">
            {selectedSeatLabels || "Chưa chọn ghế nào"}
          </p>
          <p className="text-xs text-gray-500 mt-1">
            {selectedSeats.length}/{MAX_SEATS} ghế
          </p>
        </div>

        {/* Total Price */}
        <div className="flex items-center justify-between pt-4 border-t border-zinc-700">
          <div>
            <p className="text-xs text-gray-400">Tổng tiền</p>
            <p className="text-2xl font-bold text-yellow-400">
              {totalPrice.toLocaleString("vi-VN")}đ
            </p>
          </div>
          <button
            onClick={handlePurchase}
            disabled={selectedSeats.length === 0}
            className="px-8 py-3 bg-red-600 hover:bg-red-700 disabled:bg-gray-600 disabled:cursor-not-allowed text-white font-bold rounded-lg transition-colors"
          >
            Mua vé
          </button>
        </div>
      </div>
    </div>
  );
};

export default SeatMap;
