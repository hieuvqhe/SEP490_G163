"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { Dispatch, SetStateAction, useEffect, useState } from "react";
import SeatLayout from "./SeatLayout";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  useCreateBookingSession,
  useGetBookingSessionDetail,
  useSeatActions,
} from "@/apis/user.booking-session.api";

export interface Showtime {
  showtimeId: number;
  startTime: string;
  endTime: string;
  formatType: string;
  basePrice: number;
  availableSeats: number;
  isSoldOut: boolean;
  label: string;
}

interface Screen {
  screenId: number;
  screenName: string;
  screenType: string;
  soundSystem: string;
  capacity: number;
  showtimes: Showtime[];
}

interface ShowtimeOverviews {
  cinemaId: number;
  cinemaName: string;
  address: string;
  city: string;
  district: string;
  brandCode: string;
  logoUrl: string;
  screens: Screen[];
}

interface ShowtimeDetailReq {
  brandCode: string;
  showtimeOverview: ShowtimeOverviews[];
  setOutDateShowtime: Dispatch<SetStateAction<boolean>>;
}

const ShowtimeDetail = ({
  brandCode,
  showtimeOverview,
  setOutDateShowtime,
}: ShowtimeDetailReq) => {
  const showTimeByBrandCode = showtimeOverview.filter(
    (item) => item.brandCode === brandCode
  );

  return (
    <div className="w-full space-y-6">
      {showTimeByBrandCode.map((showtime) => (
        <ShowtimeDetailCard key={showtime.cinemaId} cinema={showtime} setOutDateShowtime={setOutDateShowtime} />
      ))}
    </div>
  );
};

interface ShowtimeDetailCardProps {
  cinema: ShowtimeOverviews;
  setOutDateShowtime: Dispatch<SetStateAction<boolean>>;
}

const ShowtimeDetailCard = ({ cinema, setOutDateShowtime }: ShowtimeDetailCardProps) => {
  const [lastShowtimeId, setLastShowtimeId] = useState<number>();
  const [seatLayoutContent, setSeatLayoutContent] = useState<boolean>(false);
  const [currentSessionId, setcurrentSessionId] = useState<string>();
  const [sessionStillOnTime, setSessionStillOnTime] = useState<boolean>(false);

  const createSessionMutate = useCreateBookingSession();
  const getSessionDetailQuery = useGetBookingSessionDetail(
    currentSessionId ?? "",
    Boolean(currentSessionId) 
  );

  useEffect(() => {
    const expiresAt = getSessionDetailQuery.data?.result.expiresAt;
    if (!expiresAt) return;

    const end = new Date(expiresAt).getTime();
    const now = Date.now();

    setSessionStillOnTime(now < end);
  }, [currentSessionId, getSessionDetailQuery.data]);

  // Tạo session booking mới nhưng dựa trên showtimeID, chỉ tạo session mới khi có showtimeID mới
  const handleCreateNewSession = (showtimeId: number) => {
    console.log(showtimeId);
    if (showtimeId === lastShowtimeId && !sessionStillOnTime) {
      console.log("session da duoc tao: " + currentSessionId);
      return;
    }

    setLastShowtimeId(showtimeId);

    createSessionMutate.mutate(showtimeId, {
      onSuccess: (res) => {
        setSeatLayoutContent(true);
        setcurrentSessionId(res.result.bookingSessionId);
        console.log(
          "Create new session success: " + res.result.bookingSessionId
        );
      },
      onError: (err) => {
        setSeatLayoutContent(false);
        console.error("Failed to create session:", err);
      },
    });
  };

  const mutateSeatActions = useSeatActions();

  const handleReleaseSeats = () => {
    console.log(currentSessionId);
    console.log(
      "SEATS KHI GỌI handleReleaseSeats:",
      getSessionDetailQuery.data?.result.items.seats
    );

    const seats = getSessionDetailQuery.data?.result.items.seats;

    mutateSeatActions.release.mutate(
      {
        selectedSeat: seats ?? [],
        sessionId: currentSessionId ?? "",
      },
      {
        onSuccess: () => console.log("release toàn bộ ghế thành công"),
        onError: (error) => console.log("Không release được ghế: ", error),
      }
    );
  };

  // const releaseOnUnload = () => {
  //   try {
  //     const seats = getSessionDetailQuery.data?.result.items.seats ?? [];

  //     if (!currentSessionId || seats.length === 0) {
  //       return; // Không có gì để release
  //     }

  //     const payload = JSON.stringify({
  //       seatIds: seats, // 👈 API của bạn yêu cầu seatIds
  //     });

  //     const url = `${BASE_URL}/${currentSessionId}/seats`;

  //     navigator.sendBeacon(
  //       url,
  //       new Blob([payload], { type: "application/json" })
  //     );
  //   } catch (err) {
  //     console.log("Không thể release ghế khi unload:", err);
  //   }
  // };

  // useEffect(() => {
  //   window.addEventListener("beforeunload", releaseOnUnload);
  //   return () => window.removeEventListener("beforeunload", releaseOnUnload);
  // }, [currentSessionId, getSessionDetailQuery.data]);

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-5 hover:bg-white/10 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center gap-4">
        <div className="relative w-14 h-14 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
          <Image
            src={""}
            alt={cinema.cinemaName}
            fill
            className="object-contain p-2"
          />
        </div>
        <div>
          <h2 className="font-semibold text-lg text-white">
            {cinema.cinemaName}
          </h2>
          <p className="text-sm text-gray-400">
            {cinema.address}, {cinema.district}, {cinema.city}
          </p>
        </div>
      </div>

      {/* Screens and Showtimes */}
      <div className="space-y-4">
        {cinema.screens.map((screen) => {
          const now = Date.now();

          const showtimeFilter = screen.showtimes.filter((item) => {
            const start = new Date(item.startTime).getTime();
            return start >= now;
          });

          if (showtimeFilter.length === 0) {
            setOutDateShowtime(true);
            return <div key={screen.screenId} className=""></div>;
          }

          return (
            <div key={screen.screenId} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-base">
                  {screen.screenName}
                </h3>
                <p className="text-sm text-gray-400">{screen.soundSystem}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {showtimeFilter.map((st) => (
                  <Dialog
                    onOpenChange={(open) => {
                      if (!open) {
                        console.log("Dialog đã bị tắt");
                        handleReleaseSeats();
                      }
                    }}
                    key={st.showtimeId}
                  >
                    <DialogTrigger asChild>
                      <Button
                        variant="outline"
                        disabled={st.isSoldOut}
                        className={`text-sm rounded-lg w-[10vw] px-4 py-2 ${
                          st.isSoldOut
                            ? "opacity-50 cursor-not-allowed"
                            : "hover:bg-primary hover:text-white"
                        }`}
                        onClick={() => handleCreateNewSession(st.showtimeId)}
                      >
                        {formatTime(st.startTime)} ~ {formatTime(st.endTime)}
                      </Button>
                    </DialogTrigger>
                    {seatLayoutContent && (
                      <SeatLayout
                        showtime={st}
                        sessionId={currentSessionId ?? ""}
                      />
                    )}
                  </Dialog>
                ))}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

const formatTime = (timeString: string): string => {
  if (!timeString) return "--:--";

  try {
    // Cắt thẳng từ chuỗi ISO thay vì dùng new Date() để tránh lệch timezone
    const timePart = timeString.split("T")[1]?.substring(0, 5);
    return timePart || "--:--";
  } catch {
    return "--:--";
  }
};

export default ShowtimeDetail;
