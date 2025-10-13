import React from "react";
import HeroSection from "@/components/homepage/HeroSection";
import FeaturedSection from "@/components/homepage/FeaturedSection";
import TrendingSection from "@/components/homepage/TrendingSection";

const page = () => {
  return (
    <main>
      <HeroSection />
      {/* <TrendingSection /> */}
      <FeaturedSection />
    </main>
  );
};

export default page;
