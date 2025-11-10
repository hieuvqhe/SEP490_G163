"use client";

import { Movie } from "@/types/movie.type";
import { Badge } from "../ui/badge";
import Image from "next/image";
import { useRouter } from "next/navigation";
type MovieCardProps = {
  movie: Movie;
};

const MovieCard = ({ movie }: MovieCardProps) => {
  const router = useRouter();

  const handleClick = (movie: Movie) => {
    console.log(`/movie/${movie.movieId}`);

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
          className="object-cover border border-zinc-800 rounded-xl group-hover:opacity-60 transition-all duration-500"
        />

        {/* Badge độ tuổi */}
        <div className="absolute top-2 right-2">
          <Badge
            className="bg-red-600 text-white text-xs px-2 py-1 rounded-md shadow-md"
            variant="default"
          >
            {movie.averageRating}
          </Badge>
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
