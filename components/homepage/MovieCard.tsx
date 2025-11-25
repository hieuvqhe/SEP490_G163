"use client";

import { Movie } from "@/types/movie.type";
import Image from "next/image";
import { useRouter } from "next/navigation";

type MovieCardProps = {
  movie: Movie;
  index: number;
};

const MovieCard = ({ movie, index }: MovieCardProps) => {
  const router = useRouter();

  const handleClick = (movie: Movie) => {
    router.push(`/movie/${movie.movieId}`);
  };

  return (
    <div
      className="relative rounded-xl w-full cursor-pointer group"
      onClick={() => handleClick(movie)}
    >
      {/* Ảnh phim */}
      <div className="aspect-[2/3] w-full relative">
        <Image
          src={movie.posterUrl}
          alt={movie.title}
          fill
            sizes="(max-width: 640px) 50vw, (max-width: 1024px) 33vw, 25vw"
          className="object-cover border border-zinc-800 rounded-xl group-hover:opacity-60 transition-all duration-500"
        />

        {/* Number badge - TOP */}
        <div className="absolute -top-3 -right-3 z-20 bg-gradient-to-br from-red-500/40 to-red-600/40 border-2 border-white/20 text-white rounded-full w-10 h-10 flex items-center justify-center font-bold text-sm group-hover:scale-110 transition-transform duration-300">
          #{index + 1}
        </div>
      </div>

      {/* Thông tin phim */}
      <div className="p-3">
        <h3 className="text-sm font-semibold text-white line-clamp-1">
          {movie.title}
        </h3>
        <p className="text-xs text-zinc-400 line-clamp-1">{movie.genre}</p>
      </div>
    </div>
  );
};

export default MovieCard;