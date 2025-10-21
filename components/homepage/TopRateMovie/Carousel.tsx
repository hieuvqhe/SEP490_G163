"use client";
import React, { useState, useRef, useEffect, useCallback } from "react";
import { motion } from "framer-motion";
import { useGetTopRateMovie } from "@/hooks/useMovie";

interface TopRateMovie {
  movieId: number;
  title: string;
  genre: string;
  posterUrl: string;
  premiereDate: Date;
  endDate: Date;
  status: "comming-soon" | "now-showing" | "end";
  averageRating: number;
  totalRatings: number;
}

const StoryCard = ({ movie, onImageLoad }: { movie: TopRateMovie; onImageLoad: () => void }) => {
  return (
    <motion.div
      className="relative w-72 h-96 flex-shrink-0 rounded-lg overflow-hidden shadow-xl group"
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
      onDoubleClick={() => console.log(movie.title)}
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
        onLoad={onImageLoad}
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <h3 className="font-bold text-2xl tracking-wide">{movie.title}</h3>
      </div>
    </motion.div>
  );
};

export default function CarouselCards() {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  const { data } = useGetTopRateMovie({
    limit: 10,
    time_period: "all",
  });

  const topRateMovies = data?.result;

  const calculateConstraints = useCallback(() => {
    if (!containerRef.current || !trackRef.current) return;
    const containerWidth = containerRef.current.offsetWidth;
    const trackWidth = trackRef.current.scrollWidth;
    const delta = containerWidth - trackWidth;
    // Clamp to 0 when content does not overflow, negative when it does
    setDragConstraint(delta < 0 ? delta : 0);
  }, []);

  useEffect(() => {
    calculateConstraints();
    const handleResize = () => calculateConstraints();
    window.addEventListener("resize", handleResize);

    // Observe changes in the track size (e.g., images loading)
    let resizeObserver: ResizeObserver | undefined;
    const observedEl = trackRef.current;
    if (typeof ResizeObserver !== "undefined" && observedEl) {
      resizeObserver = new ResizeObserver(() => calculateConstraints());
      resizeObserver.observe(observedEl);
    }

    return () => {
      window.removeEventListener("resize", handleResize);
      if (resizeObserver) resizeObserver.disconnect();
    };
  }, [calculateConstraints]);

  // Recalculate when data arrives or changes in count
  useEffect(() => {
    if (!topRateMovies?.length) return;
    // Defer to next frame to ensure DOM is updated
    const id = requestAnimationFrame(() => calculateConstraints());
    return () => cancelAnimationFrame(id);
  }, [topRateMovies, calculateConstraints]);

  return (
    <div className="font-sans w-full py-12 md:py-20 flex flex-col items-center justify-center">
      <div className="w-full max-w-7xl mx-auto px-4">
        <header className="text-center mb-12">
          <h1 className="text-4xl md:text-5xl font-bold text-white dark:text-white ">
            Khám phá phim hay
          </h1>
          <p className="mt-4 text-lg text-gray-400">
            Kéo thẻ phim để tận hưởng và Double-Click để xem chi tiết nhé !
          </p>
        </header>

        <motion.div
          ref={containerRef}
          className="overflow-hidden cursor-grab"
          whileTap={{ cursor: "grabbing" }}
        >
          <motion.div
            ref={trackRef}
            className="flex space-x-6 pb-6 px-4"
            drag="x"
            dragConstraints={{
              right: 0,
              // Only allow dragging left when content overflows
              left: dragConstraint < 0 ? dragConstraint - 32 : 0,
            }}
            dragElastic={0.15}
          >
            {topRateMovies?.map((movie) => (
              <StoryCard key={movie.movieId} movie={movie} onImageLoad={calculateConstraints} />
            ))}
          </motion.div>
        </motion.div>

        <div className="mt-10 flex items-center justify-center">
          <a
            href="#"
            className="text-gray-300 font-semibold hover:text-white transition-colors duration-300 group"
          >
            Discover More
            <span className="inline-block transition-transform duration-300 group-hover:translate-x-1 ml-1">
              &rarr;
            </span>
          </a>
        </div>
      </div>
    </div>
  );
}
