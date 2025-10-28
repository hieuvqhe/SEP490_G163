import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
import TopRateMovies from "@/components/homepage/TopRateMovie/TopRateMovies";
import SearchModal from "@/components/SearchModal";

const page = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <TopRateMovies />
      <SearchModal />
    </main>
  );
};

export default page;
