import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
import TopRateMovies from "@/components/homepage/TopRateMovie/TopRateMovies";

const page = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <TopRateMovies />
    </main>
  );
};

export default page;
