import React from "react";
import { Film, Clock, User, CalendarDays, Star } from "lucide-react";
import Image from "next/image";
import { Movie } from "@/types/movie.type";

interface MovieReq {
  key: string | number;
  movie: Movie;
}

const ModernMovieCard = (props: MovieReq) => {
  return (
    <div className="w-full max-w-sm ">
      <div className=" group relative overflow-hidden rounded-3xl bg-gradient-to-br from-zinc-900 to-zinc-950 border border-zinc-800 shadow-2xl hover:shadow-purple-500/20 transition-all duration-500 hover:-translate-y-2">
        {/* Poster Image với Overlay Gradient */}
        <div className="relative  w-full h-80 overflow-hidden">
          <Image
            src={props.movie.posterUrl}
            alt={props.movie.title}
            // fill
            width={400}
            height={600}
            className="object-cover  object-[center_10%] transition-all duration-700 group-hover:scale-110 group-hover:rotate-1"
          />

          {/* Gradient Overlay */}
          <div className="absolute inset-0 bg-gradient-to-t from-black via-black/60 to-transparent opacity-90" />

          {/* Status Badge với Glow Effect */}
          <div className="absolute top-4 left-4">
            <div className="relative">
              <div className="absolute inset-0 bg-purple-500 blur-md opacity-50 rounded-lg" />
              <span className="relative bg-gradient-to-r from-purple-500 to-pink-500 text-white text-xs font-bold px-3 py-1.5 rounded-lg shadow-lg backdrop-blur-sm">
                {props.movie.status}
              </span>
            </div>
          </div>

          {/* Rating Badge */}
          <div className="absolute top-4 right-4">
            <div className="flex items-center gap-1 bg-black/60 backdrop-blur-md px-2.5 py-1.5 rounded-lg border border-yellow-500/30">
              <Star className="h-4 w-4 text-yellow-500 fill-yellow-500" />
              <span className="text-white text-sm font-bold">
                {props.movie.averageRating}
              </span>
            </div>
          </div>

          {/* Title Overlay */}
          <div className="absolute bottom-0 left-0 right-0 p-6">
            <h3 className="text-2xl font-bold text-white mb-2 drop-shadow-2xl line-clamp-2">
              {props.movie.title}
            </h3>
          </div>
        </div>

        {/* Content Section */}
        <div className="p-6 space-y-4">
          {/* Genre & Duration */}
          <div className="flex items-center gap-3 flex-wrap">
            <div className="flex items-center gap-1.5 bg-zinc-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-700/50 hover:border-purple-500/50 transition-colors">
              <Film className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-sm text-zinc-300">{props.movie.genre}</span>
            </div>
            <div className="flex items-center gap-1.5 bg-zinc-800/50 backdrop-blur-sm px-3 py-1.5 rounded-full border border-zinc-700/50 hover:border-purple-500/50 transition-colors">
              <Clock className="h-3.5 w-3.5 text-purple-400" />
              <span className="text-sm text-zinc-300">
                {props.movie.durationMinutes}m
              </span>
            </div>
          </div>

          {/* Divider */}
          <div className="h-px bg-gradient-to-r from-transparent via-zinc-700 to-transparent" />

          {/* Details */}
          <div className="space-y-3">
            <div className="flex items-center gap-2 group/item">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 group-hover/item:border-purple-500/50 transition-colors">
                <User className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-0.5">Director</p>
                <p className="text-sm text-zinc-200 font-medium truncate">
                  {props.movie.director}
                </p>
              </div>
            </div>

            <div className="flex items-center gap-2 group/item">
              <div className="flex items-center justify-center w-8 h-8 rounded-lg bg-zinc-800/50 border border-zinc-700/50 group-hover/item:border-purple-500/50 transition-colors">
                <CalendarDays className="h-4 w-4 text-purple-400" />
              </div>
              <div className="flex-1">
                <p className="text-xs text-zinc-500 mb-0.5">Premiere</p>
                <p className="text-sm text-zinc-200 font-medium">
                  {new Date(props.movie.premiereDate).toLocaleDateString(
                    "vi-VN"
                  )}
                </p>
              </div>
            </div>
          </div>

          {/* Action Button */}
          <button className="w-full mt-4 bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 text-white font-semibold py-3 rounded-xl transition-all duration-300 transform hover:scale-[1.02] active:scale-[0.98] shadow-lg hover:shadow-purple-500/50">
            Đặt vé ngay
          </button>
        </div>

        {/* Decorative Glow Effect */}
        <div className="absolute -inset-0.5 bg-gradient-to-r from-purple-600 to-pink-600 rounded-3xl blur opacity-0 group-hover:opacity-20 transition-opacity duration-500 -z-10" />
      </div>
    </div>
  );
};

export default ModernMovieCard;
