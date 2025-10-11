"use client";

import { BsArrowRight } from "react-icons/bs";
import { useState } from "react";
import BlurCircle from "@/components/layout/BlurCircle";
import MovieCard from "../MovieCard";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie.type";
import { getAllMovies } from "@/apis/movie.api";

const FeaturedSection = () => {
  const {
    data: movies,
    isLoading,
    isError,
    error,
  } = useQuery<Movie[]>({
    queryKey: ["movies"],
    queryFn: getAllMovies,
    retry: 2,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });

  console.log('API Debug:', { 
    movies, 
    isLoading, 
    isError, 
    error: error?.message,
    moviesType: typeof movies,
    moviesLength: movies?.length 
  });

  const router = useRouter();
  const [pages, setPages] = useState(1);

  // const getShowingMovies = [
  //   {
  //     _id: "m001",
  //     title: "Deadpool & Wolverine",
  //     description:
  //       "Hai dị nhân lắm mồm và gắt gỏng buộc phải hợp tác trong một nhiệm vụ xuyên vũ trụ đầy hỗn loạn và hài hước.",
  //     genre: ["Hành động", "Hài", "Siêu anh hùng"],
  //     director: "Shawn Levy",
  //     cast: [
  //       { name: "Ryan Reynolds", role: "Deadpool" },
  //       { name: "Hugh Jackman", role: "Wolverine" },
  //       { name: "Emma Corrin", role: "Cassandra Nova" },
  //     ],
  //     duration: 128,
  //     release_date: "2025-10-15T00:00:00Z",
  //     poster_url:
  //       "https://tse2.mm.bing.net/th/id/OIP.Bk0iDDHjkEGa3PEFfn-PHAHaEK?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
  //     trailer_url: "https://youtu.be/3uwrL9unVek",
  //     average_rating: 8.6,
  //     ratings_count: 15432,
  //     language: "Tiếng Anh",
  //     is_featured: true,
  //     featured_order: 1,
  //     status: "now_showing",
  //     created_at: "2025-09-20T10:00:00Z",
  //     updated_at: "2025-10-05T09:30:00Z",
  //   },
  //   {
  //     _id: "m002",
  //     title: "Joker: Folie à Deux",
  //     description:
  //       "Arthur Fleck trở lại cùng Harley Quinn trong câu chuyện tình điên loạn, nơi ranh giới giữa thực và ảo hoàn toàn bị xoá nhoà.",
  //     genre: ["Tâm lý", "Nhạc kịch", "Hình sự"],
  //     director: "Todd Phillips",
  //     cast: [
  //       { name: "Joaquin Phoenix", role: "Arthur Fleck / Joker" },
  //       { name: "Lady Gaga", role: "Harley Quinn" },
  //     ],
  //     duration: 142,
  //     release_date: "2025-11-01T00:00:00Z",
  //     poster_url:
  //       "https://tse3.mm.bing.net/th/id/OIP.JfrfK2Ozyy2AOtltWjrF7AHaDt?cb=12&rs=1&pid=ImgDetMain&o=7&rm=3",
  //     trailer_url: "https://youtu.be/xy8aJw1vYHo",
  //     average_rating: 9.1,
  //     ratings_count: 22401,
  //     language: "Tiếng Anh",
  //     is_featured: true,
  //     featured_order: 2,
  //     status: "coming_soon",
  //     created_at: "2025-09-22T11:00:00Z",
  //     updated_at: "2025-09-30T15:00:00Z",
  //   },
  // ];

  const handleClick = () => {
    router.push("/movies");
    window.scrollTo(0, 0);
  };

  return (
    <div className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      <div>
        <div className="relative flex items-center justify-between pt-20 pb-10">
          <BlurCircle top={"0"} left={"-80px"} />
          <p className="text-gray-300 font-medium text-lg">Now Showing</p>
          <button
            onClick={() => handleClick}
            className="group flex items-center gap-2 text-sm text-gray-300 hover:text-gray-400 cursor-pointer"
          >
            View All
            <BsArrowRight
              className="group-hover:translate-x-0.5 transition
                w-4.5 h-4.5"
            />
          </button>
        </div>

        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-8">
          {isLoading ? (
            // Loading skeleton
            Array.from({ length: 8 }).map((_, index) => (
              <div key={index} className="animate-pulse">
                <div className="bg-gray-300 aspect-[2/3] rounded-lg mb-2"></div>
                <div className="bg-gray-300 h-4 rounded mb-1"></div>
                <div className="bg-gray-300 h-3 rounded w-3/4"></div>
              </div>
            ))
          ) : isError ? (
            // Error state
            <div className="col-span-full text-center py-8">
              <p className="text-red-400 mb-4">Không thể tải danh sách phim</p>
              <p className="text-gray-500 text-sm">
                {error instanceof Error ? error.message : 'Có lỗi xảy ra'}
              </p>
            </div>
          ) : movies && movies.length > 0 ? (
            // Success state with movies
            movies.map((movie) => (
              <MovieCard key={movie.movie_id} movie={movie} />
            ))
          ) : (
            // Empty state
            <div className="col-span-full text-center py-8">
              <p className="text-gray-400">Không có phim nào để hiển thị</p>
            </div>
          )}
        </div>

        <div className="flex justify-center mt-20">
          <button
            disabled={isLoading}
            onClick={() => setPages(pages + 1)}
            className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull
    transition rounded-md font-medium cursor-pointer disabled:opacity-50"
          >
            {isLoading ? "Loading..." : "Show more"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default FeaturedSection;
