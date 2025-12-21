"use client";

import React, {
  useState,
  useMemo,
  Dispatch,
  SetStateAction,
  useEffect,
  useCallback,
} from "react";
import { TransformWrapper, TransformComponent } from "react-zoom-pan-pinch";
import {
  useSeatActions,
  useValidateSelectionSeats,
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
import { useRouter } from "next/navigation";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Info } from "lucide-react";
import { Button } from "@/components/ui/button";

interface RealtimeSeat {
  SeatId: number;
  RowCode: string;
  SeatNumber: number;
  SeatName: string;
  SeatTypeId: number;
  Status: "AVAILABLE" | "LOCKED" | "SOLD" | string;
  LockedUntil: string | null;
  ColumnIndex?: number;
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
  setSeatLayoutContent?: Dispatch<SetStateAction<boolean>>;
  seatLayoutContent?: boolean;
  showtimeId?: number;
}

const SeatMap = ({
  seatTypes,
  cinemaName,
  movieTitle,
  basePrice,
  sessionId,
  setSeatLayoutContent,
  showtimeId,
}: SeatMapProps) => {
  // console.log(`showtimeId: ${showtimeId}`);

  const { showToast } = useToast();
  const router = useRouter();

  // ==================== COUNTDOWN TIMER STATE ====================
  const SESSION_DURATION = 10 * 60; // 10 minutes in seconds
  const [timeLeft, setTimeLeft] = useState(SESSION_DURATION);
  const [isSessionExpired, setIsSessionExpired] = useState(false);

  const formatTime = useCallback((seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins.toString().padStart(2, "0")}:${secs
      .toString()
      .padStart(2, "0")}`;
  }, []);

  // ==================== GAP VALIDATION LOGIC ====================

  // Helper: Lấy số ghế dạng Number (Bắt buộc phải parse ra số)
  const getSeatNum = (seat: RealtimeSeat | { seatTitle: string }) => {
    const title = "SeatNumber" in seat ? seat.SeatNumber : seat.seatTitle; // Handle both types
    // Dùng Regex lấy phần số: "A12" -> 12, "05" -> 5
    return typeof title === "number"
      ? title
      : parseInt(String(title).replace(/\D/g, "")) || 0;
  };

  // Helper: Sort ghế chuẩn xác (Kết hợp Column Index và Số ghế)
  const sortSeats = (seats: RealtimeSeat[]) => {
    return [...seats].sort((a, b) => {
      // Ưu tiên 1: Sort theo ColumnIndex (nếu API có trả về)
      if (a.ColumnIndex !== undefined && b.ColumnIndex !== undefined) {
        return a.ColumnIndex - b.ColumnIndex;
      }
      // Ưu tiên 2: Sort theo số ghế
      return getSeatNum(a) - getSeatNum(b);
    });
  };

  // Helper: Tìm các khoảng trống liên tiếp
  const findGaps = (blockState: boolean[]) => {
    const gaps: { length: number; isEdge: boolean }[] = [];
    let currentGap = 0;

    for (let i = 0; i < blockState.length; i++) {
      const isOccupied = blockState[i];

      if (!isOccupied) {
        currentGap++;
      } else {
        if (currentGap > 0) {
          // Kết thúc 1 gap, lưu lại
          gaps.push({
            length: currentGap,
            isEdge: i - currentGap === 0, // Gap chạm lề trái
          });
          currentGap = 0;
        }
      }
    }

    // Check gap cuối cùng (lề phải)
    if (currentGap > 0) {
      gaps.push({
        length: currentGap,
        isEdge: true, // Gap chạm lề phải
      });
    }

    return gaps;
  };

  // Parse seats into blocks (separated by Z0/DISABLE seats)
  const parseToBlocks = (rowSeats: RealtimeSeat[]) => {
    const blocks: RealtimeSeat[][] = [];
    let currentBlock: RealtimeSeat[] = [];

    rowSeats.forEach((seat) => {
      const type = seatTypes?.find((t) => t.seatTypeId === seat.SeatTypeId);

      // Z0 hoặc DISABLE là điểm ngăn cách blocks
      if (type?.code === "DISABLE") {
        if (currentBlock.length > 0) {
          blocks.push(currentBlock);
          currentBlock = [];
        }
      } else {
        currentBlock.push(seat);
      }
    });

    // Đẩy block cuối cùng
    if (currentBlock.length > 0) {
      blocks.push(currentBlock);
    }

    return blocks;
  };

  // Main validation function
  const validateSeatSelection = (
    rowSeats: RealtimeSeat[],
    selectingSeats: { seatId: number; seatTitle: string }[]
  ): { isValid: boolean; msg?: string } => {
    // FIX 1: SORT lại rowSeats trước khi chia block
    const sortedRowSeats = sortSeats(rowSeats);
    const blocks = parseToBlocks(sortedRowSeats);

    for (const block of blocks) {
      // Map trạng thái cho block
      const blockState = block.map((seat) => {
        const isSelected = selectingSeats.some((s) => s.seatId === seat.SeatId);
        const isSoldOrBusy = seat.Status === "SOLD" || seat.Status === "LOCKED";
        return isSelected || isSoldOrBusy; // true = Occupied
      });

      // Tính các khoảng trống
      const gaps = findGaps(blockState);
      const totalEmptySeats = blockState.filter((occupied) => !occupied).length;

      // Validate từng gap
      for (const gap of gaps) {
        if (gap.length === 1) {
          if (gap.isEdge) {
            // Rule 2: Lề chỉ được trống 1 nếu đó là ghế trống duy nhất
            if (totalEmptySeats !== 1) {
              return {
                isValid: false,
                msg: "Không được để trống 1 ghế ở đầu/cuối hàng",
              };
            }
          } else {
            // Rule 1: Ở giữa tuyệt đối không được trống 1
            return {
              isValid: false,
              msg: "Không được để trống 1 ghế ở giữa",
            };
          }
        }
      }
    }

    return { isValid: true };
  };

  // Validate deselect: Check if removing a seat breaks connectivity or creates invalid gaps
  const checkCanDeselect = (
    seatToRemove: RealtimeSeat,
    currentSelectedSeats: { seatId: number; seatTitle: string }[],
    rowSeats: RealtimeSeat[]
  ): { canDeselect: boolean; msg?: string } => {
    // FIX 1: Sort dữ liệu đầu vào ngay lập tức
    const sortedRowSeats = sortSeats(rowSeats);

    // ---------------------------------------------------------
    // BƯỚC 1: CHECK LIỀN KỀ (Không được đục lỗ ở giữa)
    // ---------------------------------------------------------

    // Lấy các ghế đang chọn thuộc hàng này
    const sameRowSelectedSeats = currentSelectedSeats
      .map((s) => sortedRowSeats.find((rs) => rs.SeatId === s.seatId))
      .filter(
        (s): s is RealtimeSeat =>
          s !== undefined && s.RowCode === seatToRemove.RowCode
      );

    // Tìm nhóm ghế liền kề (Cluster) chứa ghế muốn bỏ
    // Ví dụ chọn: [A1, A2] ... [A5, A6, A7]. Bỏ A6. Nhóm là [A5, A6, A7]
    const findConnectedCluster = (
      allSelected: RealtimeSeat[],
      target: RealtimeSeat
    ) => {
      const sortedSel = sortSeats(allSelected);
      const targetIdx = sortedSel.findIndex((s) => s.SeatId === target.SeatId);

      if (targetIdx === -1) return [];

      // Loang sang trái
      let left = targetIdx;
      while (
        left > 0 &&
        getSeatNum(sortedSel[left]) - getSeatNum(sortedSel[left - 1]) === 1
      ) {
        left--;
      }
      // Loang sang phải
      let right = targetIdx;
      while (
        right < sortedSel.length - 1 &&
        getSeatNum(sortedSel[right + 1]) - getSeatNum(sortedSel[right]) === 1
      ) {
        right++;
      }
      return sortedSel.slice(left, right + 1);
    };

    const cluster = findConnectedCluster(sameRowSelectedSeats, seatToRemove);

    // Nếu nhóm có > 1 ghế, bắt buộc phải bỏ từ 2 đầu của nhóm đó
    if (cluster.length > 1) {
      const isFirst = cluster[0].SeatId === seatToRemove.SeatId;
      const isLast = cluster[cluster.length - 1].SeatId === seatToRemove.SeatId;

      if (!isFirst && !isLast) {
        return {
          canDeselect: false,
          msg: "Vui lòng bỏ ghế lần lượt theo thứ tự từ ngoài vào trong.",
        };
      }
    }

    // ---------------------------------------------------------
    // BƯỚC 2: CHECK HỆ QUẢ (Dùng logic validate chung)
    // ---------------------------------------------------------

    // Giả lập trạng thái SAU KHI bỏ ghế
    const tempSelectedSeats = currentSelectedSeats.filter(
      (s) => s.seatId !== seatToRemove.SeatId
    );

    // Gọi hàm validate chính (Lưu ý: truyền sortedRowSeats)
    const validation = validateSeatSelection(sortedRowSeats, tempSelectedSeats);

    if (!validation.isValid) {
      // Tùy chỉnh thông báo lỗi cho dễ hiểu hơn với người dùng
      if (validation.msg?.includes("đầu/cuối")) {
        return {
          canDeselect: false,
          msg: "Không được bỏ ghế này vì sẽ tạo ra ghế trống đơn lẻ ở đầu/cuối hàng.",
        };
      }
      return { canDeselect: false, msg: validation.msg };
    }

    return { canDeselect: true };
  };

  const handleStartGuide = useCallback(() => {
    const steps = [
      {
        element: "#seat-map-tour-timer",
        popover: {
          title: "Thời gian giữ ghế",
          description: "Bạn có 10 phút để chọn ghế và hoàn tất thanh toán. Hãy nhanh tay!",
          side: "left" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-map-tour-screen",
        popover: {
          title: "Màn hình chiếu",
          description: "Đây là vị trí màn hình chiếu. Chọn ghế phù hợp với tầm nhìn của bạn.",
          side: "bottom" as const,
          align: "center" as const,
        },
      },
      {
        element: "#seat-map-tour-seats",
        popover: {
          title: "Sơ đồ ghế",
          description: "Click vào ghế để chọn. Ghế màu xanh là ghế bạn đang chọn, ghế có sọc chéo là ghế đã được đặt.",
          side: "top" as const,
          align: "center" as const,
        },
      },
      {
        element: "#seat-map-tour-legend",
        popover: {
          title: "Chú thích loại ghế",
          description: "Xem màu sắc và ý nghĩa của từng loại ghế. Mỗi loại có giá khác nhau.",
          side: "top" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-map-tour-selected",
        popover: {
          title: "Ghế đã chọn",
          description: "Xem danh sách ghế bạn đã chọn và tổng tiền tạm tính.",
          side: "top" as const,
          align: "start" as const,
        },
      },
      {
        element: "#seat-map-tour-checkout",
        popover: {
          title: "Thanh toán",
          description: "Sau khi chọn xong ghế, nhấn nút này để tiếp tục chọn combo và thanh toán.",
          side: "top" as const,
          align: "end" as const,
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
  }, []);

  // Tự động mở hướng dẫn khi mới vào modal chọn ghế
  useEffect(() => {
    const hasSeenTour = localStorage.getItem(`seat-map-tour-${showtimeId}`);
    if (!hasSeenTour && showtimeId) {
      const timer = setTimeout(() => {
        handleStartGuide();
        localStorage.setItem(`seat-map-tour-${showtimeId}`, "true");
      }, 1000);
      return () => clearTimeout(timer);
    }
  }, [showtimeId, handleStartGuide]);

  // ==================== END GAP VALIDATION LOGIC ====================
  const {
    seatMap: realtimeSeats,
    // isConnected,
    // lockSeat,
    // releaseSeat,
  } = useShowtimeSeat(showtimeId ?? 0);

  const [selectedSeats, setSelectedSeats] = useState<
    { seatId: number; seatTitle: string }[]
  >([]);

  const [isMutating, setIsMutating] = useState(false);

  const MAX_SEATS = 8;
  const mutateSeatActions = useSeatActions();

  // ==================== COUNTDOWN TIMER EFFECT ====================
  useEffect(() => {
    if (timeLeft <= 0 && !isSessionExpired) {
      setIsSessionExpired(true);
      showToast(
        "Hết thời gian giữ ghế",
        "Phiên chọn ghế đã hết hạn. Vui lòng thử lại.",
        "warning"
      );
      // Release all seats before redirecting
      const seats = selectedSeats.map((s) => s.seatId);
      if (seats.length > 0) {
        mutateSeatActions.release.mutate(
          {
            selectedSeat: seats,
            sessionId: sessionId ?? "",
          },
          {
            onSuccess: () => console.log("Release seats on session expired"),
            onError: (error) => console.log("Failed to release seats:", error),
          }
        );
      }
      router.push("/");
      return;
    }

    const timer = setInterval(() => {
      setTimeLeft((prev) => prev - 1);
    }, 1000);

    return () => clearInterval(timer);
  }, [
    timeLeft,
    isSessionExpired,
    selectedSeats,
    sessionId,
    router,
    showToast,
    mutateSeatActions,
  ]);
  // ==================== END COUNTDOWN TIMER EFFECT ====================

  useEffect(() => {
    console.log(`SessionId: ${sessionId} ---- ShowtimeId: ${showtimeId}`);
  }, []);

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
            setSeatLayoutContent!(false);
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
      // || type.code === "SOLD"
      //   type.code === "BROKEN" ||
      //   seat.Status !== "AVAILABLE"
    )
      return;

    const existing = selectedSeats.some(
      (sSeat) => seat.SeatId === sSeat.seatId
    );

    // Tìm row của ghế này
    const rowSeats = realtimeSeats.filter((s) => s.RowCode === seat.RowCode);

    // Simulate selection mới
    let newSelectedSeats: { seatId: number; seatTitle: string }[];

    if (existing) {
      // DESELECT: Tạm thời bỏ qua validation gap logic
      // const deselectCheck = checkCanDeselect(seat, selectedSeats, rowSeats);
      // if (!deselectCheck.canDeselect) {
      //   showToast(
      //     "Không thể bỏ ghế",
      //     deselectCheck.msg || "Vi phạm quy tắc bỏ ghế",
      //     "warning"
      //   );
      //   return;
      // }
      newSelectedSeats = selectedSeats.filter(
        (sSeat) => sSeat.seatId !== seat.SeatId
      );
    } else {
      // SELECT: Kiểm tra max seats
      if (selectedSeats.length >= MAX_SEATS) {
        showToast(
          "Thông báo",
          `Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`,
          "warning"
        );
        return;
      }
      newSelectedSeats = [...selectedSeats, { seatId: seat.SeatId, seatTitle }];

      // Tạm thời bỏ qua validation gap rules khi chọn ghế mới
      // const validation = validateSeatSelection(rowSeats, newSelectedSeats);
      // if (!validation.isValid) {
      //   showToast(
      //     "Không thể chọn ghế",
      //     validation.msg || "Vi phạm quy tắc chọn ghế",
      //     "warning"
      //   );
      //   return;
      // }
    }

    // Nếu hợp lệ, cập nhật state
    setSelectedSeats(newSelectedSeats);
    handleLockReleaseSeat({ isSeatExist: existing, lockSeat: seat });
  };

  const toggleCoupleSeat = (seat1: RealtimeSeat, seat2: RealtimeSeat) => {
    const type = seatTypes?.find((t) => t.seatTypeId === seat1.SeatTypeId);
    if (!type || type.code === "DISABLE") return;

    const hasSeat1 = selectedSeats.some((s) => s.seatId === seat1.SeatId);
    const hasSeat2 = selectedSeats.some((s) => s.seatId === seat2.SeatId);

    const isBothSelected = hasSeat1 && hasSeat2;

    // Tìm row của ghế này
    const rowSeats = realtimeSeats.filter((s) => s.RowCode === seat1.RowCode);

    // Simulate selection mới
    let newSelectedSeats: { seatId: number; seatTitle: string }[];

    if (isBothSelected) {
      // DESELECT: Tạm thời bỏ qua validation gap logic cho ghế đôi
      // const deselectCheck1 = checkCanDeselect(seat1, selectedSeats, rowSeats);
      // const deselectCheck2 = checkCanDeselect(seat2, selectedSeats, rowSeats);

      // // Nếu một trong hai không được phép bỏ, báo lỗi
      // if (!deselectCheck1.canDeselect) {
      //   showToast(
      //     "Không thể bỏ ghế đôi",
      //     deselectCheck1.msg || "Vi phạm quy tắc bỏ ghế",
      //     "warning"
      //   );
      //   return;
      // }
      // if (!deselectCheck2.canDeselect) {
      //   showToast(
      //     "Không thể bỏ ghế đôi",
      //     deselectCheck2.msg || "Vi phạm quy tắc bỏ ghế",
      //     "warning"
      //   );
      //   return;
      // }

      // Unselect cả đôi
      newSelectedSeats = selectedSeats.filter(
        (s) => s.seatId !== seat1.SeatId && s.seatId !== seat2.SeatId
      );
    } else {
      // SELECT: Chọn cả đôi
      const newPrev = selectedSeats.filter(
        (s) => s.seatId !== seat1.SeatId && s.seatId !== seat2.SeatId
      );

      if (newPrev.length + 2 > MAX_SEATS) {
        showToast(
          "Thông báo",
          `Bạn chỉ có thể chọn tối đa ${MAX_SEATS} ghế`,
          "warning"
        );
        return;
      }

      newSelectedSeats = [
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

      // Tạm thời bỏ qua validation gap rules khi chọn ghế đôi
      // const validation = validateSeatSelection(rowSeats, newSelectedSeats);
      // if (!validation.isValid) {
      //   showToast(
      //     "Không thể chọn ghế",
      //     validation.msg || "Vi phạm quy tắc chọn ghế",
      //     "warning"
      //   );
      //   return;
      // }
    }

    // Nếu hợp lệ, cập nhật state
    setSelectedSeats(newSelectedSeats);

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

  const validateSeatsMutation = useValidateSelectionSeats();

  const handlePurchase = () => {
    setCombosDialog(false);
    validateSeatsMutation.mutate(sessionId ?? "", {
      onSuccess: (res) => {
        if (res.result.isValid) {
          requestAnimationFrame(() => {
            setCombosDialog(true);
          });
        } else {
          setCombosDialog(false);
          showToast(`${res.result.errors[0].message}`);
          return;
        }
      },
    });
  };

  const renderSeats = (rowCode: string, rowSeats: RealtimeSeat[]) => {
    const elements: React.ReactNode[] = [];
    let i = 0;
    let index = 1;

    while (i < rowSeats.length) {
      const seat = rowSeats[i];
      const type = seatTypes?.find((t) => t.seatTypeId === seat.SeatTypeId);

      const isSeatDisabled =
        type?.code === "DISABLE" ||
        type?.code === "DISABLE_2" ||
        seat.SeatName === "Z0";
      const isSeatLocked = seat.Status === "LOCKED";
      const isSeatSoled = seat.Status === "SOLD";

      const color = seatTypeColor[seat.SeatTypeId] || "#ccc";
      const isSelected = selectedSeats.some((s) => s.seatId === seat.SeatId);
      const seatDisplayTitle = `${rowCode}${index}`;
      const isLockedAndSelected = isSeatLocked && isSelected;

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
          const isCoupleBooked =
            seat.Status === "SOLD" ||
            nextSeat.Status === "SOLD" ||
            (seat.Status === "LOCKED" &&
              !selectedSeats.some((s) => s.seatId === seat.SeatId)) ||
            (nextSeat.Status === "LOCKED" &&
              !selectedSeats.some((s) => s.seatId === nextSeat.SeatId));
          const isCoupleDisabled = isSeatDisabled || isCoupleBooked;
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
              disabled={isMutating || isCoupleBooked}
              className={`
                w-26 h-12 rounded-lg text-white transition-all flex items-center justify-center text-xs font-bold relative
                ${isSelected ? "couple-seat-selected cursor-pointer" : ""}
                ${isCoupleBooked && !isSelected ? "couple-seat-booked" : ""}
                ${
                  !isSelected && !isCoupleBooked && !isSeatDisabled
                    ? "hover:scale-110 hover:brightness-110 cursor-pointer"
                    : ""
                }
                ${
                  isSeatDisabled
                    ? "bg-zinc-900 cursor-default pointer-events-none"
                    : ""
                }
              `}
              style={{
                backgroundColor: isSelected
                  ? undefined // CSS class handles this
                  : isCoupleBooked
                  ? undefined // CSS class handles this
                  : isSeatDisabled
                  ? undefined
                  : color,
              }}
              title={`${rowCode}${seat.SeatNumber} - ${rowCode}${nextSeat.SeatNumber} - ${type?.name}`}
            >
              {!isSeatDisabled && !isCoupleBooked
                ? `${rowCode}${index1} - ${rowCode}${index2}`
                : null}
            </button>
          );

          if (!isSeatDisabled) index += 2;
          i += 2;
          continue;
        }
      }

      // Check if seat is booked (sold or locked by others)
      const isSeatBooked = isSeatSoled || (isSeatLocked && !isSelected);

      // normal seat
      elements.push(
        <button
          key={seat.SeatId}
          onClick={() => toggleSeat(seat, seatDisplayTitle)}
          disabled={isMutating || isSeatBooked}
          className={`
            w-12 h-12 rounded-lg text-white transition-all flex items-center justify-center text-xs font-bold relative
            ${isSelected ? "seat-selected cursor-pointer" : ""}
            ${isSeatBooked && !isSelected ? "seat-booked" : ""}
            ${
              !isSelected && !isSeatBooked && !isSeatDisabled
                ? "hover:scale-110 hover:brightness-110 cursor-pointer"
                : ""
            }
            ${
              isSeatDisabled
                ? "bg-zinc-900 cursor-default pointer-events-none"
                : ""
            }
          `}
          style={{
            backgroundColor: isSelected
              ? undefined // CSS class handles this
              : isSeatBooked
              ? undefined // CSS class handles this
              : isSeatDisabled
              ? undefined
              : color,
          }}
          title={`${rowCode}${seat.SeatNumber} - ${type?.name}`}
        >
          {!isSeatDisabled && !isSeatBooked ? `${rowCode}${index}` : null}
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

  const seatTypeTitle = useMemo(() => {
    const map: Record<number, string> = {};
    seatTypes?.forEach((type) => {
      map[type.seatTypeId] = type.name;
    });
    return map;
  }, [seatTypes]);

  const uniqueSeatTypes = Array.from(
    new Map(realtimeSeats.map((seat) => [seat.SeatTypeId, seat])).values()
  );

  const seatFilterDisable = uniqueSeatTypes.filter(
    (seat) => seat.SeatTypeId !== 7
  ); // assuming 7 is the ID for DISABLE seat type

  const actionLegendTitle = [
    {
      title: "Ghế đã bán",
      className: "seat-booked-legend",
      style: {
        background: `repeating-linear-gradient(45deg, #374151, #374151 2px, #1f2937 2px, #1f2937 4px)`,
        opacity: 0.7,
      },
    },
    {
      title: "Ghế đang chọn",
      className: "seat-selected-legend",
      style: {
        backgroundColor: "#00E676",
        boxShadow: "0 0 6px 1px rgba(0, 230, 118, 0.6)",
        border: "1px solid white",
      },
    },
  ];

  useEffect(() => {
    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      if (selectedSeats.length == 0) return;
      e.preventDefault();
      e.returnValue = "";
    };

    window.addEventListener("beforeunload", handleBeforeUnload);
    return () => window.removeEventListener("beforeunload", handleBeforeUnload);
  }, [selectedSeats.length > 0]);

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

          {/* Guide Button */}
          <Button
            variant="outline"
            size="sm"
            onClick={handleStartGuide}
            className="absolute left-12 inline-flex items-center gap-2 rounded-lg border border-zinc-600 bg-zinc-700/50 px-3 py-1.5 text-xs font-semibold text-white transition hover:border-amber-500 hover:bg-amber-500/10 hover:text-amber-500"
          >
            <Info className="h-3.5 w-3.5" />
            Hướng dẫn
          </Button>

          {/* Countdown Timer */}
          <div
            id="seat-map-tour-timer"
            className={`absolute right-3 flex items-center gap-2 px-3 py-1.5 rounded-lg border ${
              timeLeft <= 60
                ? "bg-red-500/20 border-red-500/50 animate-pulse"
                : timeLeft <= 180
                ? "bg-yellow-500/20 border-yellow-500/50"
                : "bg-zinc-700/50 border-zinc-600"
            }`}
          >
            {/* Thời gian chọn ghế */}
            <svg
              className={`w-4 h-4 ${
                timeLeft <= 60
                  ? "text-red-400"
                  : timeLeft <= 180
                  ? "text-yellow-400"
                  : "text-gray-400"
              }`}
              fill="none"
              stroke="currentColor"
              viewBox="0 0 24 24"
            >
              <path
                strokeLinecap="round"
                strokeLinejoin="round"
                strokeWidth={2}
                d="M12 8v4l3 3m6-3a9 9 0 11-18 0 9 9 0 0118 0z"
              />
            </svg>
            <span
              className={`font-mono font-bold text-sm ${
                timeLeft <= 60
                  ? "text-red-400"
                  : timeLeft <= 180
                  ? "text-yellow-400"
                  : "text-white"
              }`}
            >
              {formatTime(timeLeft)}
            </span>
          </div>
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
                  <div id="seat-map-tour-seats" className="flex w-full flex-col items-center justify-center gap-2 p-8">
                    {/* Screen */}
                    <div id="seat-map-tour-screen" className="flex w-full flex-col items-center pt-6 pb-6 select-none">
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
          <div id="seat-map-tour-legend" className="px-3 py-2 flex flex-wrap gap-2 justify-center">
            {seatFilterDisable?.map((seat) => (
              <div key={seat.SeatId} className="flex items-center gap-2">
                <div
                  className="w-3 h-3 rounded"
                  style={{ backgroundColor: seatTypeColor[seat.SeatTypeId] }}
                />
                <span className="text-xs text-gray-300">
                  {seatTypeTitle[seat.SeatTypeId]}
                </span>
              </div>
            ))}
            {actionLegendTitle.map((item) => (
              <div key={item.title} className="flex items-center gap-2">
                <div
                  className={`w-3 h-3 rounded ${item.className}`}
                  style={item.style}
                />
                <span className="text-xs text-gray-300">{item.title}</span>
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

          <div id="seat-map-tour-selected" className="pt-2">
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
              <DialogTrigger asChild id="seat-map-tour-checkout">
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
                  showtimeId={showtimeId}
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
