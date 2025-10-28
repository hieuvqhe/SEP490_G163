"use client"

import { getMoviesById } from "@/apis/movie.api";
import Image from "next/image";
import {
  BiComment,
  BiMoviePlay,
  BiShare,
} from "react-icons/bi";
import SelectService from "./RadioButton";

async function page({ params }: { params: Promise<{ id: string }> }) {
  const { id } = await params;
  if (!id) return null;
  const movieId = Number(id);
  if (Number.isNaN(movieId)) return null;

  const data = await getMoviesById(movieId);
  const movie = data?.result;
  if (!movie) return null;

  const options = [
    { icon: BiComment, text: "Comment", value: "comment" },
    { icon: BiMoviePlay, text: "Watch", value: "watch" },
    { icon: BiShare, text: "Share", value: "share" },
  ];

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background Image with Gradient Overlay */}
      <div className="relative w-full h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url("https://image.tmdb.org/t/p/original/4m0eLZzOr5W1BK9el9ASQrTwd0m.jpg")`,
          }}
        />
        <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-black/60" />
        <div className="absolute inset-0 bg-gradient-to-t from-black via-transparent to-transparent" />
      </div>

      {/* Content */}
      <div className="relative container mx-auto px-6 py-8 -mt-40">
        <div className="flex flex-col lg:flex-row gap-8 lg:gap-12">
          {/* Left Section - Poster & Info */}
          <div className="flex flex-col items-start lg:w-1/3 space-y-6">
            {/* Poster */}
            <div className="w-full max-w-sm relative aspect-[2/3]">
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="rounded-lg shadow-2xl object-cover"
                priority
              />
            </div>

            {/* Title & Genre */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
              <p className="text-lg text-amber-400">{movie.genre}</p>
            </div>

            {/* Movie Details */}
            <div className="w-full space-y-4">
              <div>
                <h2 className="text-lg font-semibold text-white mb-2">
                  Giới thiệu
                </h2>
                <p className="text-sm text-gray-300 leading-relaxed">
                  {movie.description}
                </p>
              </div>

              <div className="grid grid-cols-2 gap-4">
                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Thời lượng
                  </h3>
                  <p className="text-sm text-gray-300">
                    {movie.durationMinutes} phút
                  </p>
                </div>

                <div>
                  <h3 className="text-sm font-semibold text-white mb-1">
                    Quốc gia
                  </h3>
                  <p className="text-sm text-gray-300">{movie.country}</p>
                </div>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Sản xuất
                </h3>
                <p className="text-sm text-gray-300">{movie.createdBy}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Đạo diễn
                </h3>
                <p className="text-sm text-gray-300">{movie.director}</p>
              </div>

              <div>
                <h3 className="text-sm font-semibold text-white mb-1">
                  Diễn viên
                </h3>
                <div className="flex flex-wrap gap-2">
                  {movie.actor.map((item) => (
                    <span
                      key={item.id}
                      className="text-sm text-gray-300 bg-white/10 px-3 py-1 rounded-full"
                    >
                      {item.name}
                    </span>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Additional Content */}
          <div className="flex flex-col lg:w-2/3 space-y-6 mt-10">
            {/* Add your right section content here */}

            <div className="flex w-full justify-around gap-5 items-center">
              <button className="flex items-center gap-2 px-8 py-3 text-sm bg-primary hover:bg-primary-dull transition-all duration-300 rounded-full font-medium cursor-pointer max-w-fit text-white group">
                Buy Ticket
              </button>

              {/* <SelectService
                onChange={() => console.log("change")}
                options={options}
                selected={"comment"}
              /> */}

              <div className="rounded-md px-5 py-2 bg-[#4742EB]/40">
                <p>{movie.averageRating} IMDB</p>
              </div>
            </div>

            <div className="bg-white/5 backdrop-blur-sm rounded-lg p-6 border border-white/10">
              <h2 className="text-2xl font-bold text-white mb-4">
                Chọn suất chiếu
              </h2>
              {/* Add showtimes or other content here */}
            </div>
          </div>
        </div>
      </div>
    </div>
  );
}

export default page;
