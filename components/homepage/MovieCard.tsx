"use client";

import { redirect } from "next/navigation";
import { Movie } from "@/types/movie.type";
import Image from "next/image";
import { HeartIcon, Tags } from "lucide-react";

type MovieCardProps = {
  movie: Movie;
};

const MovieCard = ({ movie }: MovieCardProps) => {
  return (
    <div
      className="relative group overflow-hidden rounded-2xl sm:rounded-3xl 
    bg-zinc-800 [box-shadow:var(--shadow-m)] transition-all 
    duration-300 hover:-translate-y-1 w-full font-space-grotesk"
      onClick={() => {
        redirect(`/movie/${movie.movieId}`);
      }}
    >
      <div className="relative p-2 sm:p-2.5">
        {/* Card Image Section */}
        <div className="relative">
          <Image
            src={movie.posterUrl}
            alt={movie.title}
            width={500} // you must specify width & height in Next.js
            height={500}
            className="w-full h-auto rounded-xl sm:rounded-2xl object-cover aspect-square"
          />

          <button className="absolute top-2 right-2 sm:top-4 sm:right-4 bg-black/70 dark:bg-black/70 text-white p-1.5 sm:p-2.5 rounded-full transition-colors hover:text-red-500 backdrop-blur-sm border border-white/20">
            <HeartIcon className="w-4 h-4 sm:w-6 sm:h-6" />
          </button>
        </div>

        {/* Card Content Section */}
        <div className="mt-3 sm:mt-4 px-1 sm:px-1.5 pb-2 sm:pb-3 pt-1 sm:pt-2">
          <div className="h-16">
            <div className="flex justify-between items-center">
              <h3
                className="text-base sm:text-xl font-bold text-zinc-50 dark:text-white truncate pr-2"
                title={movie.title}
              >
                {movie.title}
              </h3>
              <Tags className="w-5 h-5 sm:w-6 sm:h-6 text-gray-500 dark:text-gray-400 flex-shrink-0" />
            </div>

            <p className="text-xs sm:text-sm text-zinc-50/50 dark:text-gray-400 mt-1">
              {movie.genre} | {new Date(movie.endDate).getFullYear()}
            </p>
          </div>
          <div className="w-full flex items-center justify-end">
            <div
              className="mt-3 sm:mt-4 flex items-center 
          justify-center w-fit px-6 py-2 rounded-full bg-zinc-700/50 [box-shadow:var(--shadow-m)] cursor-pointer
          hover:bg-primary/10 transition-colors duration-300"
            >
              <p className="text-sm sm:text-lg font-bold text-primary dark:text-cyan-400">
                Buy
              </p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default MovieCard;
