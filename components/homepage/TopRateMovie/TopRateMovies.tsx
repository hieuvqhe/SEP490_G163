import React from "react";
import CarouselCards from "./Carousel";
import BlurCircle from "@/components/layout/BlurCircle";

const TopRateMovies = () => {
  return (
    <div className="w-full relative flex flex-col items-center gap-5">
      <BlurCircle top="50px" left="-50px" />
      <BlurCircle bottom="50px" right="50px" />
      <CarouselCards />
    </div>
  );
};

export default TopRateMovies;
