"use client";

import { Movie } from "@/types/movie.type";
import React, { Dispatch, SetStateAction, useEffect, useState } from "react";
import Image from "next/image";
import { CiFolderOff, CiPlay1 } from "react-icons/ci";
import DateSelector from "./DateSelector";
import TheaterSelector from "./TheaterSelector";
import ShowtimeDetail from "./ShowtimeDetail";
import { Star, X } from "lucide-react";
import { useGetShowtimesOverview } from "@/apis/user.catalog.api";
import dayjs from "dayjs";
import { Spinner } from "@/components/ui/spinner";
import { TfiCommentAlt } from "react-icons/tfi";
import Comment from "./comment-review/Comment";

interface MovieProp {
  movie: Movie;
}

const MovieDetail = ({ movie }: MovieProp) => {
  useEffect(() => {
    if (movie) {
      localStorage.setItem("movieId", String(movie.movieId));
    }
  }, [movie.movieId]);

  const [trailerModal, setTrailerModal] = useState<boolean>(false);
  const [dateSelectorValue, setDateSelectorValue] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );

  const { data: showtimeOverviewRes, isLoading: showtimeOverviewLoading } =
    useGetShowtimesOverview({
      movieId: movie.movieId,
      Date: dateSelectorValue,
    });

  const bannerImageUrl =
    movie.bannerUrl ||
    movie.posterUrl ||
    "https://image.tmdb.org/t/p/original/4m0eLZzOr5W1BK9el9ASQrTwd0m.jpg";

  const showtimeOverviews = showtimeOverviewRes?.result;
  const [brandCodeSelect, setBrandCodeSelect] = useState<string>(
    showtimeOverviews?.brands[0]?.code ?? "CGV"
  );

  useEffect(() => {
    if (showtimeOverviews && showtimeOverviews?.brands?.length > 0) {
      setBrandCodeSelect(showtimeOverviews.brands[0].code);
    }
  }, [showtimeOverviews]);

  const [activeTab, setActiveTab] = useState<"comment" | "review">("comment");
  const [outDateShowtime, setOutDateShowtime] = useState<boolean>(false);

  // const [outDateShowtime, setOutDateShowtime] = useState(false);

  const handleOutDate = (id: number) => {
    setOutDateShowtime(true); // hoặc logic khác
  };

  // console.log(`Date selector: ${dateSelectorValue}`);
  // console.log(
  //   `Theater avaiable: ${showtimeOverviews?.cinemas.items.map(
  //     (i) => i.cinemaName
  //   )}`
  // );

  // console.log(showtimeOverviews?.brands);
  // console.log(showtimeOverviews?.brands.length);

  return (
    <div className="relative min-h-screen w-full bg-black">
      {/* Background Image with Gradient Overlay */}
      <div className="relative w-full h-[600px] overflow-hidden">
        <div
          className="absolute inset-0 bg-cover bg-center bg-no-repeat"
          style={{
            backgroundImage: `url(${bannerImageUrl})`,
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
            <div
              onClick={() => setTrailerModal(true)}
              className="relative w-full max-w-sm aspect-[2/3] group cursor-pointer"
            >
              {/* Poster Image */}
              <Image
                src={movie.posterUrl}
                alt={movie.title}
                fill
                className="rounded-lg shadow-2xl object-cover"
                priority
              />

              {/* Overlay hover */}
              <div className="absolute inset-0 bg-black/40 opacity-0 group-hover:opacity-100 transition-opacity duration-300 flex items-center justify-center rounded-lg">
                <CiPlay1 size={48} className="text-white drop-shadow-lg" />
              </div>
            </div>

            {/* Title & Genre */}
            <div className="space-y-2">
              <h1 className="text-4xl font-bold text-white">{movie.title}</h1>
              <p className="text-lg text-amber-400">{movie.genre}</p>
            </div>

            <div className="flex flex-wrap items-center gap-4">
              <button
                type="button"
                onClick={() => setTrailerModal(true)}
                className="inline-flex items-center justify-center rounded-full bg-amber-500 px-6 py-2 text-sm font-semibold text-black shadow-lg shadow-amber-500/30 transition hover:bg-amber-400 focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-amber-300"
              >
                Xem trailer
              </button>
              <button
                type="button"
                onClick={() => {}}
                className="group inline-flex items-center gap-2 rounded-full border border-white/20 bg-black px-6 py-2 text-sm font-semibold text-white transition hover:border-white hover:bg-white hover:text-black focus-visible:outline focus-visible:outline-2 focus-visible:outline-offset-2 focus-visible:outline-white"
              >
                <Star
                  className="h-4 w-4 text-white transition-colors duration-200 group-hover:text-amber-500"
                  fill="currentColor"
                />
                Xem review
              </button>
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
                  Ngôn ngữ
                </h3>
                <p className="text-sm text-gray-300">{movie.language}</p>
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
                <div className="flex flex-wrap gap-3">
                  {movie.actor.map((item) => (
                    <div
                      key={item.id}
                      className="flex items-center gap-2 bg-white/10 px-3 py-2 rounded-full"
                    >
                      <div className="relative h-10 w-10 overflow-hidden rounded-full">
                        <Image
                          src={
                            item.profileImage ||
                            "https://ui-avatars.com/api/?background=1f2937&color=fff&name=Actor"
                          }
                          alt={item.name}
                          fill
                          className="object-cover"
                          sizes="40px"
                        />
                      </div>
                      <span className="text-sm text-gray-100">{item.name}</span>
                    </div>
                  ))}
                </div>
              </div>
            </div>
          </div>

          {/* Right Section - Additional Content */}
          <div className="flex flex-col gap-3 lg:w-2/3 space-y-6 mt-10">
            {/* Add your right section content here */}
            <h2 className="text-3xl font-bold text-white mb-4">
              Chọn suất chiếu
            </h2>
            <div
              className="bg-white/5 w-full backdrop-blur-sm rounded-lg p-6 
            border border-white/10 flex flex-col items-baseline gap-10
            "
            >
              {/* Add showtimes or other content here */}
              <DateSelector setDate={setDateSelectorValue} />
              {showtimeOverviewLoading ? (
                <div className="flex w-full items-center justify-center">
                  <Spinner className="size-8" />
                </div>
              ) : !showtimeOverviews?.brands ||
                showtimeOverviews?.brands.length === 0  ? (
                <div className="w-full flex flex-col gap-4 h-[30vh] items-center justify-center">
                  <CiFolderOff size={100} />
                  <div className="flex flex-col gap-3 items-center justify-center">
                    <h1 className="font-bold text-2xl text-zinc-200">
                      Không có suất chiếu nào !
                    </h1>
                    <p className="text-md text-zinc-400">
                      Bạn thử đổi ngày khác xem nhé
                    </p>
                  </div>
                </div>
              ) : (
                <div className="w-full flex flex-col gap-10">
                  <TheaterSelector
                    brands={showtimeOverviews?.brands}
                    onSelect={setBrandCodeSelect}
                  />
                  {showtimeOverviews && brandCodeSelect && (
                    <ShowtimeDetail
                      brandCode={brandCodeSelect}
                      showtimeOverview={showtimeOverviews.cinemas.items}
                      onOutDate={handleOutDate}
                    />
                  )}
                </div>
              )}
            </div>

            <div className="flex items-center justify-baseline gap-5">
              <TfiCommentAlt size={25} />
              <h2 className="text-3xl font-bold text-white">Đánh giá phim</h2>
            </div>

            {/* Content */}
            <div>
              {activeTab === "comment" && <Comment movieId={movie.movieId} />}
              {/* {activeTab === "review" && <p>Nội dung tab Đánh giá...</p>} */}
            </div>
          </div>
        </div>
      </div>

      {trailerModal && (
        <TrailerModal
          setOpen={setTrailerModal}
          title={movie.title}
          trailerUrl={movie.trailerUrl}
        />
      )}
    </div>
  );
};

interface TrailerModalProps {
  trailerUrl: string;
  title: string;
  setOpen: Dispatch<SetStateAction<boolean>>;
}
const TrailerModal = ({ trailerUrl, setOpen, title }: TrailerModalProps) => {
  const getYouTubeEmbedUrl = (url: string) => {
    const regExp =
      /^.*(youtu.be\/|v\/|u\/\w\/|embed\/|watch\?v=|\&v=)([^#\&\?]*).*/;
    const match = url.match(regExp);
    return match && match[2] ? `https://www.youtube.com/embed/${match[2]}` : "";
  };
  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/40 backdrop-blur-xl p-4 sm:p-6">
      <div className="absolute inset-0 opacity-5">
        <div className="absolute inset-0 bg-[radial-gradient(circle_at_50%_50%,rgba(255,255,255,0.1),transparent_50%)]" />
      </div>

      <div className="absolute inset-0" onClick={() => setOpen(false)} />

      {/* Modal */}
      <div className="relative w-full max-w-6xl z-10 animate-in fade-in slide-in-from-bottom-4 duration-500">
        <div className="flex justify-between items-center mb-4 px-1">
          {title && (
            <h2 className="text-white text-xl sm:text-2xl font-bold drop-shadow-2xl">
              {title}
            </h2>
          )}
          <button
            onClick={() => setOpen(false)}
            className="ml-auto text-white/80 hover:text-white p-2.5 hover:bg-white/10 rounded-full transition-all duration-200 hover:scale-110 active:scale-95 backdrop-blur-sm bg-black/30 border border-white/10 group"
            aria-label="Close"
          >
            <X
              size={22}
              className="group-hover:rotate-90 transition-transform duration-300"
            />
          </button>
        </div>

        {/* Video Player */}
        <div className="relative w-full aspect-video rounded-2xl overflow-hidden shadow-2xl shadow-primary/20">
          <div className="absolute inset-0 bg-gradient-to-br from-primary/30 via-transparent to-purple-500/30 opacity-50 blur-xl -z-10" />
          <div className="absolute inset-0 ring-1 ring-white/10 rounded-2xl pointer-events-none" />

          <iframe
            className="w-full h-full bg-black"
            src={getYouTubeEmbedUrl(trailerUrl)}
            title={title || "Movie Trailer"}
            allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture; web-share"
            allowFullScreen
            loading="lazy"
          />
        </div>
      </div>
    </div>
  );
};

export default MovieDetail;
