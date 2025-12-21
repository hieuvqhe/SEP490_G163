"use client";

import { Button } from "@/components/ui/button";
import Image from "next/image";
import { useEffect, useState } from "react";
import SeatLayout from "./SeatLayout";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import {
  useCreateBookingSession,
  useDeleteBookingSession,
  useGetBookingSessionDetail,
} from "@/apis/user.booking-session.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";

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
  latitude: number;
  longitude: number;
  screens: Screen[];
}

interface ShowtimeDetailReq {
  brandCode: string;
  showtimeOverview: ShowtimeOverviews[];
  onOutDate: (cinemaId: number) => void;
}

const LS_KEY = "booking-session";

const ShowtimeDetail = ({
  brandCode,
  showtimeOverview,
  onOutDate,
}: ShowtimeDetailReq) => {
  const showTimeByBrandCode = showtimeOverview.filter(
    (item) => item.brandCode === brandCode
  );

  return (
    <div className="w-full space-y-6">
      {showTimeByBrandCode.map((showtime) => (
        <ShowtimeDetailCard
          key={showtime.cinemaId}
          cinema={showtime}
          onOutDate={onOutDate}
        />
      ))}
    </div>
  );
};

interface ShowtimeDetailCardProps {
  cinema: ShowtimeOverviews;
  onOutDate: (cinemaId: number) => void;
}

const ShowtimeDetailCard = ({ cinema, onOutDate }: ShowtimeDetailCardProps) => {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const [seatLayoutContent, setSeatLayoutContent] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStillOnTime, setSessionStillOnTime] = useState(false);
  const [showtimeId, setShowtimeId] = useState<number>(0);

  const deleteSessionMutate = useDeleteBookingSession();
  const createSessionMutate = useCreateBookingSession();
  const getSessionDetailQuery = useGetBookingSessionDetail(
    currentSessionId ?? "",
    Boolean(currentSessionId)
  );

  useEffect(() => {
    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved); // { id, expiresAt, showtimeId }

    if (parsed.showtimeId !== showtimeId) {
      localStorage.removeItem(LS_KEY);
      return;
    }

    if (Date.now() < new Date(parsed.expiresAt).getTime()) {
      setCurrentSessionId(parsed.id);
      setSessionStillOnTime(true);
    } else {
      // Hết hạn → xóa session cũ
      deleteSessionMutate.mutate(parsed.id);
      localStorage.removeItem(LS_KEY);
    }
  }, [showtimeId]);

  // ---- Theo dõi expiresAt từ server ----
  useEffect(() => {
    const expiresAt = getSessionDetailQuery.data?.result.expiresAt;
    if (!expiresAt) return;

    const end = new Date(expiresAt).getTime();
    setSessionStillOnTime(Date.now() < end);

    // Lưu lại vào localStorage
    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        id: currentSessionId,
        expiresAt,
        showtimeId,
      })
    );
  }, [currentSessionId, getSessionDetailQuery.data]);

  // Tạo session booking mới nhưng dựa trên showtimeID, chỉ tạo session mới khi có showtimeID mới
  const handleCreateNewSession = (showtimeId: number) => {
    // if (user) {
      setShowtimeId(showtimeId); // rất quan trọng

      if (currentSessionId && sessionStillOnTime) {
        setSeatLayoutContent(true);
        return;
      } // Session còn hạn → không tạo mới

      createSessionMutate.mutate(showtimeId, {
        onSuccess: (res) => {
          const newId = res.result.bookingSessionId;
          const newExpires = res.result.expiresAt;

          setCurrentSessionId(newId);
          setSessionStillOnTime(true);
          setSeatLayoutContent(true);

          localStorage.setItem(
            LS_KEY,
            JSON.stringify({
              id: newId,
              expiresAt: newExpires,
              showtimeId,
            })
          );
        },
        onError: (err) => {
          console.error("Create new session failed", err);
        },
      });
    // } else {
    //   showToast("Bạn cần đăng nhập để thực hiện tính năng này", "", "warning");
    // }
  };

  const isOutDate = cinema.screens.every((screen) => {
    const now = Date.now();
    const showtimeFilter = screen.showtimes.filter((item) => {
      const start = new Date(item.startTime).getTime();
      return start >= now;
    });
    return showtimeFilter.length === 0;
  });

  useEffect(() => {
    if (isOutDate) {
      onOutDate(cinema.cinemaId);
    }
  }, [isOutDate]);

  const handleOpenGoogleMaps = () => {
    const url = `https://www.google.com/maps/search/?api=1&query=${cinema.latitude},${cinema.longitude}`;
    window.open(url, "_blank");
  };

  return (
    <div className="w-full bg-white/5 border border-white/10 rounded-xl p-5 flex flex-col gap-5 hover:bg-white/10 transition-all duration-200">
      {/* Header */}
      <div className="flex items-center justify-between gap-4">
        <div className="flex items-center gap-4">
          {cinema.logoUrl && (
            <div className="relative w-14 h-14 rounded-md overflow-hidden bg-white/10 flex-shrink-0">
              <Image
                src={cinema.logoUrl}
                alt={cinema.cinemaName}
                fill
                className="object-contain p-2"
                unoptimized
              />
            </div>
          )}
          {!cinema.logoUrl && (
            <div className="w-14 h-14 rounded-md bg-white/10 flex-shrink-0 flex items-center justify-center">
              <span className="text-xs font-bold text-white/40">
                {cinema.cinemaName.substring(0, 2).toUpperCase()}
              </span>
            </div>
          )}
          <div>
            <h2 className="font-semibold text-lg text-white">
              {cinema.cinemaName}
            </h2>
            <p className="text-sm text-gray-400">
              {cinema.address}, {cinema.district}, {cinema.city}
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          onClick={handleOpenGoogleMaps}
          className="text-sm rounded-lg px-4 py-2 hover:bg-primary hover:text-white flex items-center gap-2 flex-shrink-0"
        >
          <svg
            xmlns="http://www.w3.org/2000/svg"
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            stroke="currentColor"
            strokeWidth="2"
            strokeLinecap="round"
            strokeLinejoin="round"
          >
            <path d="M21 10c0 7-9 13-9 13s-9-6-9-13a9 9 0 0 1 18 0z" />
            <circle cx="12" cy="10" r="3" />
          </svg>
          Xem bản đồ
        </Button>
      </div>

      {/* Screens and Showtimes */}
      <div className="space-y-4">
        {cinema.screens.map((screen) => {
          const now = Date.now();

          const showtimeFilter = screen.showtimes.filter((item) => {
            const start = new Date(item.startTime).getTime();
            return start >= now;
          });

          return (
            <div key={screen.screenId} className="flex flex-col gap-2">
              <div className="flex items-center justify-between">
                <h3 className="text-white font-medium text-base">
                  {screen.screenName}
                </h3>
                <p className="text-sm text-gray-400">{screen.soundSystem}</p>
              </div>

              <div className="flex flex-wrap gap-3">
                {showtimeFilter.length === 0 ? (
                  <div className="flex items-center">
                    <p className="text-sm text-gray-400">
                      Các suất chiếu đã hết hạn - Quý khách vui lòng chọn ngày
                      khác.
                    </p>
                  </div>
                ) : (
                  showtimeFilter.map((st) => (
                    <Dialog key={st.showtimeId}>
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
                          seatLayoutContent={seatLayoutContent}
                          setSeatLayoutContent={setSeatLayoutContent}
                        />
                      )}
                    </Dialog>
                  ))
                )}
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
