"use client";
import React, { useState, useRef, useEffect } from "react";
import { motion } from "framer-motion";
import { Movie } from "@/types/movie.type";
import { useRouter } from "next/navigation";

interface MovieEnhancedCarouselProps {
  movies: Movie[];
}

// Track drag state globally for the carousel
const dragState = {
  isDragging: false,
  startX: 0,
  startY: 0,
};

const MovieCard = ({ movie }: { movie: Movie }) => {
  const router = useRouter();

  const handleClick = (e: React.MouseEvent) => {
    // Prevent navigation if user was dragging
    if (dragState.isDragging) {
      e.preventDefault();
      e.stopPropagation();
      return;
    }
    router.push(`/movie/${movie.movieId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="relative w-72 h-96 flex-shrink-0 rounded-lg overflow-hidden shadow-xl group cursor-pointer"
      whileHover={{ y: -8, transition: { type: "spring", stiffness: 300 } }}
    >
      <img
        src={movie.posterUrl}
        alt={movie.title}
        className="absolute inset-0 w-full h-full object-cover group-hover:scale-110 transition-transform duration-700 pointer-events-none"
      />
      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/20 to-transparent"></div>
      <div className="relative z-10 flex flex-col justify-end h-full p-6 text-white">
        <div className="mb-2">
          <span className="inline-block bg-primary px-3 py-1 rounded-full text-xs font-medium mb-2">
            {movie.genre}
          </span>
        </div>
        <h3 className="font-bold text-2xl tracking-wide mb-2">{movie.title}</h3>
        <div className="flex items-center gap-3 text-sm text-gray-300">
          <span className="flex items-center gap-1">
            ⭐ {movie.averageRating?.toFixed(1) || "N/A"}
          </span>
          <span>•</span>
          <span>{movie.durationMinutes} phút</span>
        </div>
      </div>
    </motion.div>
  );
};

export default function MovieEnhancedCarousel({
  movies,
}: MovieEnhancedCarouselProps) {
  const trackRef = useRef<HTMLDivElement>(null);
  const containerRef = useRef<HTMLDivElement>(null);
  const [dragConstraint, setDragConstraint] = useState(0);

  useEffect(() => {
    const calculateConstraints = () => {
      if (containerRef.current && trackRef.current) {
        const containerWidth = containerRef.current.offsetWidth;
        const trackWidth = trackRef.current.scrollWidth;
        setDragConstraint(containerWidth - trackWidth);
      }
    };

    calculateConstraints();
    window.addEventListener("resize", calculateConstraints);

    return () => window.removeEventListener("resize", calculateConstraints);
  }, [movies]);

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No movies available</p>
      </div>
    );
  }

  return (
    <div className="font-sans w-full py-8 flex flex-col items-center justify-center">
      <div className="w-full mx-auto">
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
              left: dragConstraint - 32,
            }}
            dragElastic={0.15}
            onDragStart={(e, info) => {
              dragState.isDragging = false;
              dragState.startX = info.point.x;
              dragState.startY = info.point.y;
            }}
            onDrag={(e, info) => {
              const dx = Math.abs(info.point.x - dragState.startX);
              const dy = Math.abs(info.point.y - dragState.startY);
              // If moved more than 5px, consider it a drag
              if (dx > 5 || dy > 5) {
                dragState.isDragging = true;
              }
            }}
            onDragEnd={() => {
              // Reset drag state after a short delay to allow click event to check it
              setTimeout(() => {
                dragState.isDragging = false;
              }, 100);
            }}
          >
            {movies.map((movie) => (
              <MovieCard key={movie.movieId} movie={movie} />
            ))}
          </motion.div>
        </motion.div>
      </div>
    </div>
  );
}
