import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
import { TheaterSchedule } from "@/components/homepage/TheaterShowtime";
import SearchModal from "@/components/SearchModal";

const page = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      <TheaterSchedule />
      <SearchModal />
    </main>
  );
};

export default page;
