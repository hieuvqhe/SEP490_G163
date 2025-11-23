import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
import SearchModal from "@/components/SearchModal";

const page = () => {
  return (
    <main>
      <HeroSection />
      <FeaturedSection />
      {/* <TheaterShowtime /> */}
      <SearchModal />
    </main>
  );
};

export default page;
