"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import BlurCircle from "@/components/layout/BlurCircle";
import { movieCategoryQuickAccess } from "@/constants";
import { ChevronDown, SearchIcon } from "lucide-react";
import { useGetFullMovies } from "@/hooks/useMovie";
import { Movie } from "@/types/movie.type";
import MovieEnhancedCarousel from "./MovieEnhancedCarousel";
import MovieCardSkeleton from "../MovieCardSkeleton";

type MovieStatus = "now_showing" | "coming_soon" | "ended";

const FeaturedSection = () => {
  const [page, setPage] = useState(1);
  const [status, setStatus] = useState<MovieStatus>("now_showing");
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [activeTitle, setActiveTitle] = useState("Đang Chiếu");

  const { data: movieResponse, isLoading } = useGetFullMovies({
    limit: 10,
    sort_order: "desc",
    sort_by: "average_rating",
    page: page,
    status: status,
    search: searchQuery,
  });

  const totalPages = movieResponse?.result.totalPages ?? 1;
  const isMaxMovie = page >= totalPages;

  const movies = useMemo(
    () => movieResponse?.result.movies ?? [],
    [movieResponse?.result.movies]
  );

  // Filter movies directly from API response
  const filteredMovies = useMemo(() => {
    let filtered = movies;
    
    // Filter by search query
    if (searchQuery.trim()) {
      filtered = filtered.filter((movie) =>
        movie.title.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }
    
    return filtered;
  }, [movies, searchQuery]);

  const handleSearch = useCallback((input: string) => {
    setSearchQuery(input);
    setPage(1);
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
      <h1 className="font-bold text-3xl mb-10 mt-20">Phim hay đang chờ đón</h1>

      {/* Header */}
      <header className="relative flex items-center pb-5">
        <BlurCircle top="50px" left="-80px" />
        <BlurCircle right="0px" top="400px" />

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

      {/* Movie Carousel */}
      {isLoading ? (
        <div className="flex gap-4 md:gap-6 overflow-x-auto mt-8 pb-4 scrollbar-hide">
          {[...Array(15)].map((_, index) => (
            <div key={index} className="min-w-[200px] md:min-w-[250px]">
              <MovieCardSkeleton />
            </div>
          ))}
        </div>
      ) : filteredMovies.length > 0 ? (
        <div className="mt-8">
          <MovieEnhancedCarousel movies={filteredMovies} />
        </div>
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
