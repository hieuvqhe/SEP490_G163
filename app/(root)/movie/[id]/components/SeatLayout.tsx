import React, { Dispatch, SetStateAction } from "react";
import { Showtime } from "./ShowtimeDetail";
import { useGetShowtimeSeat } from "@/apis/user.catalog.api";
import SeatMap from "./seat/SeatMap";
import { DialogContent, DialogTitle } from "@/components/ui/dialog";

interface SeatLayoutReq {
  showtime: Showtime;
  sessionId: string;
  setSeatLayoutContent?: Dispatch<SetStateAction<boolean>>
  seatLayoutContent?: boolean;
}

const SeatLayout = ({ showtime, sessionId, setSeatLayoutContent, seatLayoutContent }: SeatLayoutReq) => {
  const { data: showtimeSeatRes, isLoading } = useGetShowtimeSeat(
    showtime.showtimeId
  );

  const showtimeData = showtimeSeatRes?.result;

  return (
    // <DialogContent className="!max-w-[98vw] !w-[60vw] !h-fit p-0 overflow-hidden flex flex-col bg-zinc-800">
    <DialogContent
      className="!max-w-[98vw] !w-[60vw] !h-fit bg-white/5 border 
    border-white/10 rounded-xl p-0 flex flex-col gap-5 
    transition-all duration-200 [&>button]:hidden"
    >
      <DialogTitle className="sr-only">Seat Selection</DialogTitle>

      {isLoading ? (
        <div className="flex items-center justify-center h-full">
          <div className="text-white">Đang tải...</div>
        </div>
      ) : (
        <SeatMap
          seatTypes={showtimeData?.seatTypes}
          cinemaName={showtimeData?.cinema.cinemaName}
          movieTitle={showtimeData?.movie.title}
          basePrice={showtime.basePrice}
          sessionId={sessionId}
          onPurchase={(selectedSeats) => {
            console.log("Purchasing seats:", selectedSeats);
          }}
          setSeatLayoutContent={setSeatLayoutContent}
          seatLayoutContent={seatLayoutContent}
          showtimeId={showtime.showtimeId}
        />
      )}
    </DialogContent>
  );
};

export default SeatLayout;
