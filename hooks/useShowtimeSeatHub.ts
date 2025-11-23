import { useEffect, useRef, useState, useCallback } from "react";
import * as signalR from "@microsoft/signalr";
import { BASE_URL } from "@/constants";
import { useGetShowtimeSeat } from "@/apis/user.catalog.api";

interface SeatDeltaPayload {
  seatId: number;
  lockedUntil: string | null;
}

interface Seat {
  SeatId: number;
  RowCode: string;
  SeatNumber: number;
  SeatTypeId: number;
  Status: "AVAILABLE" | "LOCKED" | "SOLD" | string;
  LockedUntil: string | null;
}

// Step 2: import Seat API
import { Seat as ApiSeat } from "@/apis/user.catalog.api";

// Step 3: map API seat -> local seat
const mapApiSeat = (apiSeat: ApiSeat): Seat => ({
  SeatId: apiSeat.seatId,
  Status: apiSeat.status as "AVAILABLE" | "LOCKED" | "SOLD",
  LockedUntil: apiSeat.lockedUntil ?? null,
  RowCode: apiSeat.rowCode,
  SeatNumber: apiSeat.seatNumber,
  SeatTypeId: apiSeat.seatTypeId,
});

export const useShowtimeSeat = (showtimeId: number | null) => {
  const [seatMap, setSeatMap] = useState<Seat[]>([]);
  const [isConnected, setIsConnected] = useState(false);
  const connectionRef = useRef<signalR.HubConnection | null>(null);

  const { data: getShowtimeSeatRes } = useGetShowtimeSeat(showtimeId ?? 0);

  const showtimeSeatData = getShowtimeSeatRes?.result.seats;

  // -------------------------------------------------------
  // STEP 1: Load seat snapshot once the API returns data
  // -------------------------------------------------------
  useEffect(() => {
    if (showtimeSeatData) {
      const normalized = showtimeSeatData.map(mapApiSeat);
      setSeatMap(normalized);
    }
  }, [showtimeSeatData]);

  // Update UI state for seat changes
  const updateSeatStatus = useCallback(
    (seatId: number, status: Seat["Status"], lockedUntil: string | null) => {
      setSeatMap((prev) =>
        prev.map((seat) =>
          seat.SeatId === seatId ? { ...seat, status, lockedUntil } : seat
        )
      );
    },
    []
  );

  // -------------------------------------------------------
  // STEP 2: Setup SignalR (chỉ chạy khi showtimeId thay đổi)
  // -------------------------------------------------------
  useEffect(() => {
    if (!showtimeId) return;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/showtime-seat`)
      .withAutomaticReconnect()
      .build();

    connectionRef.current = connection;

    // Listen events
    connection.on("SeatLocked", (p: SeatDeltaPayload) =>
      updateSeatStatus(p.seatId, "LOCKED", p.lockedUntil)
    );

    connection.on("SeatReleased", (p: SeatDeltaPayload) =>
      updateSeatStatus(p.seatId, "AVAILABLE", null)
    );

    connection.on("SeatSold", (p: SeatDeltaPayload) =>
      updateSeatStatus(p.seatId, "SOLD", null)
    );

    connection.onreconnected(async () => {
      await connection.invoke("JoinShowtime", showtimeId);
    });

    connection
      .start()
      .then(async () => {
        setIsConnected(true);
        await connection.invoke("JoinShowtime", showtimeId);
      })
      .catch(console.error);

    return () => {
      if (connectionRef.current) {
        connectionRef.current.invoke("LeaveShowtime", showtimeId);
        connectionRef.current.stop();
      }
    };
  }, [showtimeId, updateSeatStatus]);

  // -------------------------------------------------------
  // STEP 3: Public API actions
  // -------------------------------------------------------
  const lockSeat = async (seatId: number) => {
    if (!connectionRef.current) return;
    await connectionRef.current.invoke("LockSeat", { seatId, showtimeId });
  };

  const releaseSeat = async (seatId: number) => {
    if (!connectionRef.current) return;
    await connectionRef.current.invoke("ReleaseSeat", { seatId, showtimeId });
  };

  return {
    seatMap,
    isConnected,
    lockSeat,
    releaseSeat,
  };
};
