"use client";
import React, { useState, useRef, useEffect } from "react";
import { Movie } from "@/types/movie.type";
import { useRouter } from "next/navigation";

const classNames = (
  ...classes: (string | boolean | undefined | null)[]
): string => {
  return classes.filter(Boolean).join(" ");
};

interface MovieImageCarouselProps {
  movies: Movie[];
}

function MovieImageCarousel({ movies }: MovieImageCarouselProps) {
  const [activeItem, setActiveItem] = useState(Math.floor(movies.length / 2));
  const wrapperRef = useRef<HTMLUListElement>(null);
  const timeoutRef = useRef<NodeJS.Timeout | null>(null);
  const router = useRouter();

  useEffect(() => {
    if (!wrapperRef.current) return;
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
    }

    wrapperRef.current.style.setProperty(
      "--transition",
      "600ms cubic-bezier(0.22, 0.61, 0.36, 1)"
    );

    timeoutRef.current = setTimeout(() => {
      wrapperRef.current?.style.removeProperty("--transition");
    }, 900);

    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, [activeItem]);

  const handleMovieClick = (movieId: number) => {
    router.push(`/movie/${movieId}`);
  };

  if (!movies || movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">No movies available</p>
      </div>
    );
  }

  return (
    <div className="w-full font-sans">
      <div className="w-full max-w-7xl mx-auto p-4 sm:p-6 md:p-8">
        <ul
          ref={wrapperRef}
          className="flex w-full flex-col gap-2 md:h-[640px] md:flex-row md:gap-[1.5%]"
        >
          {movies.map((movie, index) => (
            <li
              onClick={() => setActiveItem(index)}
              aria-current={activeItem === index}
              className={classNames(
                "relative group cursor-pointer transition-all duration-500 ease-in-out",
                "md:w-[8%]",
                "md:[&[aria-current='true']]:w-[48%]",
                "md:[transition:width_var(--transition,300ms_ease_in)]"
              )}
              key={movie.movieId}
            >
              <div className="relative h-full w-full overflow-hidden rounded-2xl bg-black shadow-2xl transition-transform duration-500 ease-in-out group-hover:scale-105 group-hover:z-10 transform-gpu">
                <img
                  className={classNames(
                    "absolute left-1/2 top-1/2 h-full w-auto max-w-none -translate-x-1/2 -translate-y-1/2 object-cover transition-all duration-500 ease-in-out",
                    activeItem === index
                      ? "scale-105 grayscale-0"
                      : "scale-100 grayscale"
                  )}
                  src={movie.posterUrl}
                  alt={movie.title}
                  width="590"
                  height="640"
                />
                <div
                  className={classNames(
                    "absolute inset-0 transition-opacity duration-500",
                    activeItem === index ? "opacity-100" : "opacity-0",
                    "bg-gradient-to-t from-black/70 via-black/30 to-transparent",
                    "md:absolute"
                  )}
                />
                <div
                  className={classNames(
                    "absolute bottom-0 left-0 w-full p-6 text-white transition-[transform,opacity] duration-700 ease-in-out md:p-8",
                    activeItem === index
                      ? "translate-y-0 opacity-100"
                      : "translate-y-8 opacity-0"
                  )}
                >
                  <p className="text-sm font-light uppercase tracking-widest text-gray-200 md:text-base mb-2">
                    {movie.genre}
                  </p>
                  <p
                    className="text-2xl font-bold tracking-tight md:text-5xl mb-4"
                    style={{ textShadow: "2px 2px 8px rgba(0,0,0,0.8)" }}
                  >
                    {movie.title}
                  </p>
                  <div className="flex items-center gap-4 text-sm text-gray-300 mb-4">
                    <span className="flex items-center gap-1">
                      ⭐ {movie.averageRating?.toFixed(1) || "N/A"}
                    </span>
                    <span>•</span>
                    <span>{movie.durationMinutes} phút</span>
                    <span>•</span>
                    <span>{movie.language}</span>
                  </div>
                  <button
                    onClick={(e) => {
                      e.stopPropagation();
                      handleMovieClick(movie.movieId);
                    }}
                    className="bg-primary hover:bg-primary-dull text-white px-6 py-2 rounded-full transition-all duration-300 transform hover:scale-105"
                  >
                    Đặt vé ngay
                  </button>
                </div>
              </div>
            </li>
          ))}
        </ul>
      </div>
    </div>
  );
}

export default MovieImageCarousel;
