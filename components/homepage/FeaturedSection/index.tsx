"use client";

import { useCallback, useMemo, useState } from "react";
import BlurCircle from "@/components/layout/BlurCircle";
import MovieCard from "../MovieCard";
import { useQuery } from "@tanstack/react-query";
import { GetMovieResponse } from "@/types/movie.type";
import { getMoviesByStatus } from "@/apis/movie.api";
import { Spinner } from "@/components/ui/spinner";
import { movieCategoryQuickAccess } from "@/constants";
import { ChevronDown, SearchIcon } from "lucide-react";

type MovieStatus = "now_showing" | "coming_soon" | "ended";

const FeaturedSection = () => {
  const [page, setPage] = useState(1);
  const [activeTitle, setActiveTitle] = useState("Đang Chiếu");
  const [status, setStatus] = useState<MovieStatus>("now_showing");
  const [searchQuery, setSearchQuery] = useState<string>("");

  const { data: movieResponse, isLoading } = useQuery<GetMovieResponse>({
    queryKey: ["movieResponse", page, status],
    queryFn: () => getMoviesByStatus(status, 4, page),
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const totalPages = movieResponse?.result.totalPages ?? 1;
  const isMaxMovie = page >= totalPages;
  const movies = movieResponse?.result.movies ?? [];

  const filteredMovies = useMemo(() => {
    if (!searchQuery.trim()) return movies;

    const query = searchQuery.toLowerCase();
    return movies.filter((movie) => movie.title.toLowerCase().includes(query));
  }, [movies, searchQuery]);

  const handleSearch = useCallback((input: string) => {
    setSearchQuery(input);
  }, []);

  const handleSetActiveTitle = useCallback((title: string) => {
    setPage(1);
    setSearchQuery("");

    const statusMap: Record<string, MovieStatus> = {
      "Đang Chiếu": "now_showing",
      "Sắp Chiếu": "coming_soon",
    };

    const newStatus = statusMap[title];
    if (newStatus) {
      setStatus(newStatus);
      setActiveTitle(title);
    }
  }, []);

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      {/* Header */}
      <header className="relative flex items-center pt-20 pb-10">
        <BlurCircle top="50px" left="-80px" />

        <div className="relative flex items-center justify-between w-full border-b-white border-b-2 pb-3">
          {/* Category Navigation */}
          <nav className="flex items-end gap-8 md:gap-20">
            {movieCategoryQuickAccess.map((item) => (
              <div
                className="relative cursor-pointer pb-2"
                key={item.title}
                onClick={() => handleSetActiveTitle(item.title)}
              >
                {item.title === "Ngày" || item.title === "Danh Mục" ? (
                  <div className="group flex gap-2 hover:text-[#F84565] transition-colors duration-300">
                    <h1>{item.title}</h1>
                    <ChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
                  </div>
                ) : (
                  <h1 className="hover:text-[#F84565] transition-colors duration-300">
                    {item.title}
                  </h1>
                )}

                {/* Active Underline */}
                {activeTitle === item.title && (
                  <div className="absolute bottom-[-18px] left-0 w-full border-b-4 border-[#F84565] transition-all duration-300" />
                )}
              </div>
            ))}
          </nav>

          {/* Search Input */}
          <div className="flex items-center gap-2 bg-white/10 rounded-lg px-4 py-2 hover:bg-white/20 transition-colors duration-300">
            <input
              type="text"
              placeholder="Search movies..."
              value={searchQuery}
              onChange={(e) => handleSearch(e.target.value)}
              className="bg-transparent outline-none placeholder:text-gray-400 text-white w-32 md:w-48"
            />
            <SearchIcon className="w-5 h-5 text-gray-400" />
          </div>
        </div>
      </header> 

      {/* Movie Grid */}
      {isLoading ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : filteredMovies.length > 0 ? (
        <>
          <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-8">
            {filteredMovies.map((movie) => (
              <MovieCard key={movie.movieId || movie.title} movie={movie} />
            ))}
          </div>

          {/* Load More Button */}
          {!searchQuery && (
            <div className="flex justify-center mt-12 md:mt-20">
              <button
                disabled={isMaxMovie || isLoading}
                onClick={() => setPage((prev) => prev + 1)}
                className="px-8 md:px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition-all duration-300 rounded-md font-medium disabled:opacity-50 disabled:cursor-not-allowed"
              >
                {isLoading
                  ? "Loading..."
                  : isMaxMovie
                  ? "No more movies"
                  : "Show more"}
              </button>
            </div>
          )}
        </>
      ) : (
        <div className="text-center py-20">
          <p className="text-gray-400 text-lg">
            {searchQuery
              ? `No movies found for "${searchQuery}"`
              : "No movies available"}
          </p>
        </div>
      )}
    </section>
  );
};

export default FeaturedSection;
