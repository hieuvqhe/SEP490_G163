"use client";

import { useState } from "react";
import LocationSelector from "./LocationSelector";
import TheaterSelector from "./TheaterSelector";
import TheaterByName from "./TheaterByName";
import ShowtimeDetail from "./ShowtimeDetail";

const TheaterShowtime = () => {
  const [theaterLocation, setTheaterLocation] = useState("Hà Nội");

  return (
    <div className="relative px-6 md:px-16 lg:px-24 xl:px-44 flex flex-col items-baseline w-full overflow-hidden gap-10">
      {/* Title - Chọn nơi chiếu */}
      <div className="flex w-full justify-between items-center">
        <h1 className="font-bold text-3xl">
          Lịch chiếu - Suất chiếu các cụm rạp
        </h1>
        <LocationSelector
          location={theaterLocation}
          setTheaterLocation={setTheaterLocation}
        />
      </div>

      <TheaterSelector location={theaterLocation} />

      <div className="w-full flex gap-20">
        <TheaterByName />
        <ShowtimeDetail />
      </div>
    </div>
  );
};

export default TheaterShowtime;
