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

  // Helper cập nhật state (Dùng useCallback để stable reference)
  const updateSeatStatus = useCallback(
    (seatId: number, status: Seat["Status"], lockedUntil: string | null) => {
      setSeatMap((prev) =>
        prev.map((seat) =>
          seat.SeatId === seatId ? { ...seat, Status: status, LockedUntil: lockedUntil } : seat
        )
      );
    },
    []
  );

  // -------------------------------------------------------
  // STEP 2: Setup SignalR (Đã sửa lỗi stopped during negotiation)
  // -------------------------------------------------------
  useEffect(() => {
    if (!showtimeId) return;

    // Cờ để kiểm tra xem effect này đã bị cleanup chưa (do unmount hoặc showtimeId đổi)
    let isMounted = true;

    const connection = new signalR.HubConnectionBuilder()
      .withUrl(`${BASE_URL}/hubs/showtime-seat`)
      .withAutomaticReconnect()
      .configureLogging(signalR.LogLevel.Warning)
      .build();

    connectionRef.current = connection;

    // Đăng ký events
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
      if (isMounted) {
        setIsConnected(true);
        // Join lại nhóm khi reconnect thành công
        try {
          await connection.invoke("JoinShowtime", showtimeId);
        } catch (e) {
          console.error("JoinShowtime failed after reconnect", e);
        }
      }
    });

    connection.onreconnecting(() => isMounted && setIsConnected(false));
    connection.onclose(() => isMounted && setIsConnected(false));

    // Hàm khởi tạo async nội bộ
   const startConnection = async () => {
      try {
        await connection.start();
        
        // Chỉ thực hiện tiếp nếu component chưa bị unmount
        if (isMounted) {
          setIsConnected(true);
          await connection.invoke("JoinShowtime", showtimeId);
        } else {
          await connection.stop();
        }
      } catch (err: any) { // Thêm :any hoặc check type để truy cập .message
        // LOGIC SỬA LỖI Ở ĐÂY:
        // Kiểm tra nếu lỗi là do ngắt kết nối trong quá trình negotiation thì bỏ qua
        if (err?.message?.includes("stopped during negotiation")) {
            return; // Không log gì cả, đây là hành vi bình thường do React Strict Mode
        }

        // Chỉ log những lỗi thực sự nghiêm trọng
        console.error("SignalR connection error:", err);
        if (isMounted) setIsConnected(false);
      }
    };

    startConnection();

    // CLEANUP FUNCTION
    return () => {
      isMounted = false; // Đánh dấu là đã unmount

      // Rời nhóm trước khi ngắt (nếu đang connected)
      if (connection.state === signalR.HubConnectionState.Connected) {
        connection.invoke("LeaveShowtime", showtimeId).catch(() => {});
      }

      // Stop connection
      connection.stop().catch(() => {
        // Bắt lỗi "stopped during negotiation" để không rác console
        // Đây là hành vi bình thường khi người dùng chuyển trang nhanh
      });

      connectionRef.current = null;
    };
  }, [showtimeId, updateSeatStatus]);

  // -------------------------------------------------------
  // STEP 3: Public API actions (Thêm check state an toàn hơn)
  // -------------------------------------------------------
  const lockSeat = async (seatId: number) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("LockSeat", { seatId, showtimeId });
    } else {
      console.warn("Cannot lock seat: No SignalR connection");
    }
  };

  const releaseSeat = async (seatId: number) => {
    if (connectionRef.current?.state === signalR.HubConnectionState.Connected) {
      await connectionRef.current.invoke("ReleaseSeat", { seatId, showtimeId });
    }
  };

  return {
    seatMap,
    isConnected,
    lockSeat,
    releaseSeat,
  };
};
