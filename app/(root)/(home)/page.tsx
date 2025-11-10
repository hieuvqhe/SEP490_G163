import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
// import TopRateMovies from "@/components/homepage/TopRateMovie/TopRateMovies";
import SearchModal from "@/components/SearchModal";
import TheaterShowtime from "@/components/homepage/TheaterShowtime";

const page = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      {/* <TheaterShowtime /> */}
      {/* <TopRateMovies /> */}
      <SearchModal />
    </main>
  );
};

export default page;
