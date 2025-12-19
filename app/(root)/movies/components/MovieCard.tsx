"use client";

import React from "react";
import { Movie } from "@/types/movie.type";
import { useRouter } from "next/navigation";
import { Star, Clock } from "lucide-react";
import { motion } from "framer-motion";

interface MovieCardProps {
  movie: Movie;
}

export default function MovieCard({ movie }: MovieCardProps) {
  const router = useRouter();

  const handleClick = () => {
    router.push(`/movie/${movie.movieId}`);
  };

  return (
    <motion.div
      onClick={handleClick}
      className="group relative cursor-pointer rounded-lg overflow-hidden bg-white/5 backdrop-blur-sm border border-white/10 hover:border-primary/50 transition-all duration-300"
      whileHover={{ y: -8, scale: 1.02 }}
      whileTap={{ scale: 0.98 }}
    >
      {/* Poster Image */}
      <div className="relative aspect-[2/3] overflow-hidden">
        <img
          src={movie.posterUrl}
          alt={movie.title}
          className="w-full h-full object-cover group-hover:scale-110 transition-transform duration-500"
        />
        
        {/* Gradient Overlay */}
        <div className="absolute inset-0 bg-gradient-to-t from-black via-black/50 to-transparent opacity-0 group-hover:opacity-100 transition-opacity duration-300" />
        
        {/* Rating Badge */}
        <div className="absolute top-2 right-2 bg-black/70 backdrop-blur-sm rounded-full px-2 py-1 flex items-center gap-1">
          <Star className="w-3 h-3 text-yellow-400 fill-yellow-400" />
          <span className="text-xs font-semibold text-white">
            {movie.averageRating?.toFixed(1) || "N/A"}
          </span>
        </div>

        {/* Status Badge */}
        <div className="absolute top-2 left-2 bg-primary/90 backdrop-blur-sm rounded-full px-3 py-1">
          <span className="text-xs font-semibold text-white">
            Đang chiếu
          </span>
        </div>
      </div>

      {/* Movie Info */}
      <div className="p-4">
        <h3 className="font-bold text-lg mb-2 line-clamp-2 group-hover:text-primary transition-colors">
          {movie.title}
        </h3>
        
        <div className="space-y-2">
          {/* Genre */}
          <p className="text-sm text-gray-400 line-clamp-1">
            {movie.genre}
          </p>
          
          {/* Duration and Language */}
          <div className="flex items-center justify-between text-sm text-gray-500">
            <div className="flex items-center gap-1">
              <Clock className="w-4 h-4" />
              <span>{movie.durationMinutes} phút</span>
            </div>
            <span className="text-xs bg-white/5 px-2 py-1 rounded">
              {movie.language}
            </span>
          </div>
        </div>

        {/* Hover Action */}
        <div className="mt-3 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
          <div className="text-center text-sm bg-auto font-semibold text-primary">
        Đặt vé ngay
          </div>
        </div>
      </div>
    </motion.div>
  );
}
