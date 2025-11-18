// hooks/useRealTimeSeatStream.ts
import { BASE_URL } from "@/constants";
import { useEffect, useRef, useState } from "react";

export type RealtimeSeat = {
  SeatId: number;
  RowCode: string;
  SeatNumber: number;
  SeatTypeId: number;
  Status: "AVAILABLE" | "LOCKED" | "SOLD" | string;
  LockedUntil: string | null;
};

export function useSeatRealtime(showtimeId: number) {
  const [seats, setSeats] = useState<RealtimeSeat[]>([]);
  const [isConnected, setIsConnected] = useState(false);

  const esRef = useRef<EventSource | null>(null);
  const reconnectRef = useRef<number | null>(null);
  const backoffRef = useRef<number>(1000);

  useEffect(() => {
    if (!showtimeId) return;

    let mounted = true;

    const fetchSnapshotOnce = async () => {
      try {
        const res = await fetch(
          `${BASE_URL}/api/cinema/showtimes/${showtimeId}/seats`
        );
        if (!res.ok) return;
        const json = await res.json();
        if (!mounted) return;
        const initial = (json?.Seats ?? []) as RealtimeSeat[];
        setSeats(initial);
      } catch (err) {
        // swallow
      }
    };

    const connect = () => {
      // clear old ES if exists
      esRef.current?.close();
      const url = `${BASE_URL}/api/cinema/showtimes/${showtimeId}/seats/stream`;
      const es = new EventSource(url);
      esRef.current = es;

      es.onopen = () => {
        backoffRef.current = 1000; // reset backoff
        setIsConnected(true);
      };

      es.onerror = () => {
        setIsConnected(false);
        try {
          es.close();
        } catch {}
        // reconnect with exponential backoff capped
        const delay = Math.min(backoffRef.current, 30_000);
        backoffRef.current = Math.min(backoffRef.current * 1.8, 30_000);
        reconnectRef.current = window.setTimeout(connect, delay);
      };

      // snapshot
      es.addEventListener("snapshot", (e) => {
        try {
          const data = JSON.parse((e as MessageEvent).data);
          setSeats((data?.Seats ?? []) as RealtimeSeat[]);
        } catch (err) {
          // ignore
        }
      });

      // seat locked
      es.addEventListener("seat_locked", (e) => {
        try {
          const seat: RealtimeSeat = JSON.parse((e as MessageEvent).data);
          setSeats((prev) =>
            prev.map((s) =>
              s.SeatId === seat.SeatId
                ? { ...s, Status: "LOCKED", LockedUntil: seat.LockedUntil }
                : s
            )
          );
        } catch {}
      });

      // seat released
      es.addEventListener("seat_released", (e) => {
        try {
          const seat: RealtimeSeat = JSON.parse((e as MessageEvent).data);
          setSeats((prev) =>
            prev.map((s) =>
              s.SeatId === seat.SeatId
                ? { ...s, Status: "AVAILABLE", LockedUntil: null }
                : s
            )
          );
        } catch {}
      });

      // seat sold
      es.addEventListener("seat_sold", (e) => {
        try {
          const seat: RealtimeSeat = JSON.parse((e as MessageEvent).data);
          setSeats((prev) =>
            prev.map((s) =>
              s.SeatId === seat.SeatId
                ? { ...s, Status: "SOLD", LockedUntil: null }
                : s
            )
          );
        } catch {}
      });

      // When connection opens, if we still have no seats, fetch snapshot once as fallback
      // (some servers don't send snapshot automatically)
      setTimeout(() => {
        if (mounted && (!es || !isConnected) && seats.length === 0) {
          fetchSnapshotOnce();
        }
      }, 700);
    };

    connect();

    return () => {
      mounted = false;
      if (reconnectRef.current) {
        clearTimeout(reconnectRef.current);
      }
      esRef.current?.close();
      esRef.current = null;
      setIsConnected(false);
    };
  }, [showtimeId]);

  return { seats, isConnected };
}
