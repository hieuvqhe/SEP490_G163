"use client";

import * as React from "react";
import { IoIosCalendar } from "react-icons/io";
import { GoClock } from "react-icons/go";
import { BsArrowRight } from "react-icons/bs";
import { motion, AnimatePresence } from "framer-motion";
import { useQuery } from "@tanstack/react-query";
import { getTopRateMovies } from "@/apis/movie.api";
import { ChevronLeft, ChevronRight } from "lucide-react";
import Image from "next/image";

interface TopRatedMovie {
  movieId: number;
  title: string;
  genre: string;
  posterUrl: string;
  bannerUrl: string;
  premiereDate: string;
  endDate: string;
  status: "comming-soon" | "now-showing" | "end";
  averageRating: number;
  totalRatings: number;
}

const formatDate = (dateString?: string) => {
  if (!dateString) return "N/A";
  return new Date(dateString).toLocaleDateString("en-US", {
    year: "numeric",
    month: "short",
    day: "numeric",
  });
};

const getStatusDisplay = (status: string) => {
  switch (status) {
    case "now-showing":
      return "Now Showing";
    case "comming-soon":
      return "Coming Soon";
    case "end":
      return "Ended";
    default:
      return status;
  }
};

export function CarouselDemo() {
  const [currentIndex, setCurrentIndex] = React.useState(0);
  const [direction, setDirection] = React.useState<"left" | "right">("right");
  
  const { data, isLoading, isError } = useQuery({
    queryKey: ["top-rated-banners"],
    queryFn: () =>
      getTopRateMovies({
        limit: 5,
        min_ratings_count: 1,
        time_period: "all",
      }),
    staleTime: 1000 * 60 * 5,
  });

  const sliderBanners = data?.result || [];

  const handleNext = React.useCallback(() => {
    setDirection("right");
    setCurrentIndex((prevIndex) =>
      prevIndex + 1 === sliderBanners.length ? 0 : prevIndex + 1
    );
  }, [sliderBanners.length]);

  const handlePrevious = React.useCallback(() => {
    setDirection("left");
    setCurrentIndex((prevIndex) =>
      prevIndex - 1 < 0 ? sliderBanners.length - 1 : prevIndex - 1
    );
  }, [sliderBanners.length]);

  React.useEffect(() => {
    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.key === "ArrowRight") {
        handleNext();
      } else if (event.key === "ArrowLeft") {
        handlePrevious();
      }
    };

    window.addEventListener("keydown", handleKeyDown);
    const interval = setInterval(() => {
      handleNext();
    }, 60000);

    return () => {
      window.removeEventListener("keydown", handleKeyDown);
      clearInterval(interval);
    };
  }, [handleNext, handlePrevious]);

  // Slide variants for left/right animation
  const slideVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? "100%" : "-100%",
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? "-100%" : "100%",
      opacity: 0,
    }),
  };

  // Content variants for text animation
  const contentVariants = {
    enter: (direction: "left" | "right") => ({
      x: direction === "right" ? 100 : -100,
      opacity: 0,
    }),
    center: {
      x: 0,
      opacity: 1,
    },
    exit: (direction: "left" | "right") => ({
      x: direction === "right" ? -100 : 100,
      opacity: 0,
    }),
  };

  if (isLoading) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          className="text-center text-white"
        >
          <div className="animate-spin rounded-full h-16 w-16 border-t-2 border-b-2 border-primary mx-auto mb-4"></div>
          <p className="text-lg">Loading banners...</p>
        </motion.div>
      </div>
    );
  }

  if (isError || !sliderBanners || sliderBanners.length === 0) {
    return (
      <div className="h-screen flex items-center justify-center bg-gradient-to-r from-gray-900 via-gray-800 to-gray-900">
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          className="text-center text-white max-w-md px-6"
        >
          <h2 className="text-2xl font-bold mb-4">No banners available</h2>
          <p className="text-gray-300 mb-6">Check back later for exciting content!</p>
          <motion.button
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            onClick={() => (window.location.href = "/movies")}
            className="flex items-center gap-2 px-6 py-3 bg-primary hover:bg-primary-dull text-white rounded-full font-medium mx-auto transition-colors duration-200"
          >
            Explore Movies
            <BsArrowRight className="w-4 h-4" />
          </motion.button>
        </motion.div>
      </div>
    );
  }

  const currentBanner = sliderBanners[currentIndex];

  return (
    <div className="relative w-full h-screen overflow-hidden bg-black">
      {/* Background Image with Slide Animation */}
      <AnimatePresence initial={false} custom={direction} mode="popLayout">
        <motion.div
          key={currentIndex}
          custom={direction}
          variants={slideVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.4 },
          }}
          className="absolute inset-0"
        >
          {/* Background Image */}
          <div className="absolute inset-0">
            <Image
              src={currentBanner.bannerUrl}
              alt={currentBanner.title}
              fill
              className="object-cover"
              priority
            />
            {/* Overlay */}
            <div className="absolute inset-0 bg-black/60" />
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Content with Slide Animation */}
      <AnimatePresence initial={false} custom={direction} mode="wait">
        <motion.div
          key={`content-${currentIndex}`}
          custom={direction}
          variants={contentVariants}
          initial="enter"
          animate="center"
          exit="exit"
          transition={{
            x: { type: "spring", stiffness: 300, damping: 30 },
            opacity: { duration: 0.3 },
          }}
          className="relative z-10 flex items-center h-full w-full px-6 md:px-16 lg:px-36"
        >
          <div className="flex flex-col gap-4 max-w-2xl">
            {/* Badge Row */}
            <motion.div
              initial={{ opacity: 0, y: -20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.1 }}
              className="flex items-center gap-2 mb-2 flex-wrap"
            >
              <span className="bg-orange-500/20 border border-orange-500/30 text-orange-400 px-2 py-1 rounded-full text-xs font-medium">
                #{currentIndex + 1}
              </span>
              <span className="text-gray-400 text-xs">
                Top Rated {currentIndex + 1} of {sliderBanners.length}
              </span>
              <span className="bg-yellow-500/20 border border-yellow-500/30 text-yellow-400 px-2 py-1 rounded-full text-xs font-medium flex items-center gap-1">
                ⭐ {currentBanner.averageRating.toFixed(1)}
                <span className="text-gray-400">({currentBanner.totalRatings})</span>
              </span>
            </motion.div>

            {/* Title */}
            <motion.h1
              initial={{ opacity: 0, y: 30 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.15, duration: 0.5 }}
              className="text-4xl md:text-6xl lg:text-7xl font-bold text-white leading-tight"
            >
              {currentBanner.title}
            </motion.h1>

            {/* Info Row */}
            <motion.div
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.2, duration: 0.4 }}
              className="flex items-center gap-4 text-gray-300 flex-wrap"
            >
              <span className="bg-primary px-3 py-1 rounded-full text-sm font-medium">
                {getStatusDisplay(currentBanner.status)}
              </span>
              <span className="text-sm text-gray-400">{currentBanner.genre}</span>
              {currentBanner.premiereDate && (
                <div className="flex items-center gap-1">
                  <IoIosCalendar className="w-4 h-4" />
                  <span className="text-sm">
                    From {formatDate(currentBanner.premiereDate.toString())}
                  </span>
                </div>
              )}
              {currentBanner.endDate && (
                <div className="flex items-center gap-1">
                  <GoClock className="w-4 h-4" />
                  <span className="text-sm">
                    Until {formatDate(currentBanner.endDate.toString())}
                  </span>
                </div>
              )}
            </motion.div>

            {/* Description */}
            <motion.p
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.25, duration: 0.4 }}
              className="text-lg text-gray-200 leading-relaxed"
            >
              Một trong những bộ phim được đánh giá cao nhất với{" "}
              {currentBanner.totalRatings} lượt đánh giá và điểm trung bình{" "}
              {currentBanner.averageRating.toFixed(1)}/5 sao. Thể loại:{" "}
              {currentBanner.genre}.
            </motion.p>

            {/* CTA Button */}
            <motion.button
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              transition={{ delay: 0.3, duration: 0.4 }}
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
              onClick={() => (window.location.href = `/movie/${currentBanner.movieId}`)}
              className="flex items-center gap-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition-all duration-300 rounded-full font-medium cursor-pointer max-w-fit text-white group"
            >
              Đặt vé ngay
              <BsArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform duration-200" />
            </motion.button>

            {/* Top Rated Badge */}
            <motion.div
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ delay: 0.4 }}
              className="mt-4 text-xs text-gray-400 opacity-70"
            >
              <span className="text-yellow-400">⭐ Top Rated Movie</span>
            </motion.div>
          </div>
        </motion.div>
      </AnimatePresence>

      {/* Slide Indicators */}
      <div className="absolute bottom-8 left-1/2 -translate-x-1/2 z-20 flex gap-2">
        {sliderBanners.map((_, index) => (
          <button
            key={index}
            onClick={() => {
              setDirection(index > currentIndex ? "right" : "left");
              setCurrentIndex(index);
            }}
            className={`w-2 h-2 rounded-full transition-all duration-300 ${
              index === currentIndex
                ? "bg-primary w-8"
                : "bg-white/40 hover:bg-white/60"
            }`}
            aria-label={`Go to slide ${index + 1}`}
          />
        ))}
      </div>

      {/* Navigation Buttons */}
      <button
        onClick={handlePrevious}
        className="absolute left-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
        aria-label="Previous banner"
      >
        <ChevronLeft className="w-6 h-6" />
      </button>

      <button
        onClick={handleNext}
        className="absolute right-4 top-1/2 -translate-y-1/2 z-20 bg-black/50 hover:bg-black/70 text-white p-3 rounded-full transition-all duration-300 backdrop-blur-sm border border-white/20 hover:scale-110"
        aria-label="Next banner"
      >
        <ChevronRight className="w-6 h-6" />
      </button>
    </div>
  );
}