"use client";

import { useShowtimeSeat } from "@/hooks/useShowtimeSeatHub";
import { useEffect, useState } from "react";

export default function SeatPage() {
  const showtimeId = 67;
  const { seatMap, isConnected, lockSeat, releaseSeat } =
    useShowtimeSeat(showtimeId);

  const [isMounted, setIsMounted] = useState(false);

  useEffect(() => {
    setIsMounted(true);
  }, []);

  // Loading state với skeleton
  if (!isMounted || seatMap.length === 0) {
    return (
      <div>
        <h1>Showtime {showtimeId}</h1>
        <p className="text-gray-500">⏳ Đang tải dữ liệu ghế...</p>

        {/* Skeleton loading */}
        <div className="grid grid-cols-10 gap-2 mt-4">
          {Array.from({ length: 50 }).map((_, i) => (
            <div
              key={i}
              className="p-3 rounded bg-gray-200 animate-pulse h-12"
            />
          ))}
        </div>
      </div>
    );
  }

  return (
    <div>
      <h1 className="text-2xl font-bold mb-4">Showtime {showtimeId}</h1>

      <div className="mb-4 flex items-center gap-2">
        <span>Status:</span>
        <span className={isConnected ? "text-green-600" : "text-red-600"}>
          {isConnected ? "🟢 Connected" : "🔴 Disconnected"}
        </span>
      </div>

      {/* Legend */}
      <div className="flex gap-4 mb-4 text-sm">
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-green-500 rounded"></span>
          <span>Available</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-yellow-500 rounded"></span>
          <span>Locked</span>
        </div>
        <div className="flex items-center gap-2">
          <span className="w-4 h-4 bg-red-500 rounded"></span>
          <span>Sold</span>
        </div>
      </div>

      <div className="grid grid-cols-10 gap-2">
        {seatMap.map((seat) => (
          <button
            key={seat.SeatId}
            className={`p-3 rounded transition-all hover:scale-105 disabled:cursor-not-allowed ${
              seat.Status === "AVAILABLE"
                ? "bg-green-500 hover:bg-green-600"
                : seat.Status === "LOCKED"
                ? "bg-yellow-500 hover:bg-yellow-600"
                : "bg-red-500 cursor-not-allowed"
            } text-white font-semibold`}
            onClick={() =>
              seat.Status === "AVAILABLE"
                ? lockSeat(seat.SeatId)
                : seat.Status === "LOCKED"
                ? releaseSeat(seat.SeatId)
                : null
            }
            disabled={seat.Status === "SOLD" || !isConnected}
          >
            {seat.SeatId}
          </button>
        ))}
      </div>

      {!isConnected && (
        <p className="mt-4 text-amber-600 text-sm">
          ⚠️ Đang mất kết nối. Vui lòng đợi...
        </p>
      )}
    </div>
  );
}
