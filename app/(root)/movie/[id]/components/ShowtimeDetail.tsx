"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";
import { useState } from "react";
import SeatLayout from "./SeatLayout";
import {
  Dialog,
  DialogTrigger,
  DialogContent,
  DialogHeader,
  DialogTitle,
  DialogDescription,
  DialogFooter,
  DialogClose,
} from "@/components/ui/dialog";
import { useCreateBookingSession } from "@/apis/user.booking-session.api";

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
}

const ShowtimeDetail = ({ brandCode, showtimeOverview }: ShowtimeDetailReq) => {
  const showTimeByBrandCode = showtimeOverview.filter(
    (item) => item.brandCode === brandCode
  );

  return (
    <div className="w-full space-y-6">
      {showTimeByBrandCode.map((showtime) => (
        <ShowtimeDetailCard key={showtime.cinemaId} cinema={showtime} />
      ))}
    </div>
  );
};

interface ShowtimeDetailCardProps {
  cinema: ShowtimeOverviews;
}

const ShowtimeDetailCard = ({ cinema }: ShowtimeDetailCardProps) => {
  const { user } = useAuthStore();
  const [alertDialog, setAlertDialog] = useState<boolean>(false);
  const [lastShowtimeId, setLastShowtimeId] = useState<number>();
  const [seatLayoutContent, setSeatLayoutContent] = useState<boolean>(false);

  const createSessionMutate = useCreateBookingSession();

  // Tạo session booking mới nhưng dựa trên showtimeID, chỉ tạo session mới khi có showtimeID mới
  const handleCreateNewSession = (showtimeId: number) => {
    console.log(showtimeId);
    if (showtimeId === lastShowtimeId) return;

    setLastShowtimeId(showtimeId);

    createSessionMutate.mutate(showtimeId, {
      onSuccess: (res) => {
        setSeatLayoutContent(true);
        console.log("Create new session success: " + res.bookingSessionId);
      },
      onError: (err) => {
        console.error("Failed to create session:", err);
      },
    });
  };

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
        {cinema.screens.map((screen) => (
          <div key={screen.screenId} className="flex flex-col gap-2">
            <div className="flex items-center justify-between">
              <h3 className="text-white font-medium text-base">
                {screen.screenName}
              </h3>
              <p className="text-sm text-gray-400">{screen.soundSystem}</p>
            </div>

            <div className="flex flex-wrap gap-3">
              {screen.showtimes.map((st) => (
                <Dialog key={st.showtimeId}>
                  <DialogTrigger asChild>
                    <Button
                      variant="outline"
                      disabled={st.isSoldOut}
                      className={`text-sm rounded-lg px-4 py-2 ${
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
                      sessionId={
                        createSessionMutate.data?.bookingSessionId ?? ""
                      }
                    />
                  )}
                </Dialog>
              ))}
            </div>
          </div>
        ))}
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
