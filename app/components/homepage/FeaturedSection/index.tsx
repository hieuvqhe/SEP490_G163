"use client";

import { useEffect, useMemo, useState } from "react";
import BlurCircle from "@/components/layout/BlurCircle";
import MovieCard from "../MovieCard";
import { useRouter } from "next/navigation";
import { useQuery } from "@tanstack/react-query";
import { Movie } from "@/types/movie.type";
import {
  getAllMovies,
  getCommingSoonMovies,
  getShowingMovies,
} from "@/apis/movie.api";
import { Spinner } from "@/components/ui/spinner";
import { movieCategoryQuickAccess } from "@/constants";
import { ChevronDown, SearchIcon } from "lucide-react";
import { NavigationMenuDemo } from "./NavigationMenuDemo";

const FeaturedSection = () => {
  const router = useRouter();
  const { data: allMovies, isLoading } = useQuery<Movie[]>({
    queryKey: ["allMovies"],
    queryFn: getAllMovies,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const { data: showingMovies, isLoading: isLoadingShowingMovies } = useQuery<
    Movie[]
  >({
    queryKey: ["showing-movies"],
    queryFn: getShowingMovies,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const { data: commingSoonMovies, isLoading: isLoadingCommingSoon } = useQuery<
    Movie[]
  >({
    queryKey: ["comming-movies"],
    queryFn: getCommingSoonMovies,
    staleTime: 1000 * 60 * 5,
    retry: 1,
  });

  const [page, setPage] = useState(1);
  const [isLoadingMore, setIsLoadingMore] = useState(false);
  const [isMaxMovie, setIsMaxMovie] = useState(false);
  const [activeTitle, setActiveTitle] = useState("Đang Chiếu");
  const [movies, setMovies] = useState<Movie[]>(allMovies ?? []);

  const handleLoadMore = async () => {
    if (isLoadingMore || isMaxMovie) return;
    setIsLoadingMore(true);
    try {
      setTimeout(() => {
        setIsLoadingMore(false);
        setPage((prev) => prev + 1);
      }, 1000);
    } catch {
      setIsLoadingMore(false);
    }
  };

  const handleSetActiveTitle = (title: string) => {
    setActiveTitle(title);
    switch (title) {
      case "Đang Chiếu":
        setMovies(allMovies ?? []);
        break;
      case "Sắp Chiếu":
        setMovies(commingSoonMovies ?? []);
        break;
      default:
        break;
    }
  };

  useEffect(() => {
    setMovies(allMovies ?? []);
  }, [allMovies]);

  const handleSearch = (input: string) => {
    if (!input.trim()) {
      setMovies(allMovies ?? []);
    } else {
      const searchMovie = (allMovies ?? []).filter((movie) =>
        movie.title.toLowerCase().includes(input.toLowerCase())
      );
      setMovies(searchMovie);
    }
  };

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden">
      {/* <NavigationMenuDemo /> */}

      {/* header */}
      <header className="relative flex items-center pt-20 pb-10">
      <BlurCircle top="50px" left="-80px" />

      <div className="relative flex items-center justify-between w-full border-b-white border-b-2 pb-3">
        {/* category */}
        <div className="flex items-end gap-20">
          {movieCategoryQuickAccess.map((item) => (
            <div
              className="relative cursor-pointer pb-2"
              key={item.title}
              onClick={() => handleSetActiveTitle(item.title)}
            >
              {item.title === "Ngày" || item.title === "Danh Mục" ? (
                <div className="group flex gap-4 hover:text-[#F84565] transition-colors duration-300">
                  <h1>{item.title}</h1>
                  <ChevronDown className="transition-transform duration-300 group-hover:rotate-180" />
                </div>
              ) : (
                <h1 className="hover:text-[#F84565] transition-colors duration-300">
                  {item.title}
                </h1>
              )}

              {/* underline */}
              {activeTitle === item.title && (
                <div className="absolute bottom-[-14px] left-0 w-full border-b-4 border-[#F84565] transition-colors duration-300" />
              )}
            </div>
          ))}
        </div>

        <div className="flex items-center">
          <input
            type="text"
            placeholder="Search"
            onChange={(e) => handleSearch(e.target.value)}
          />
          <SearchIcon />
        </div>
      </div>
    </header>

      {isLoadingShowingMovies ? (
        <div className="flex items-center justify-center py-20">
          <Spinner />
        </div>
      ) : Array.isArray(movies) && movies.length > 0 ? (
        <div className="grid grid-cols-2 sm:grid-cols-2 md:grid-cols-4 gap-4 md:gap-6 lg:gap-8 mt-8">
          {movies.map((movie) => (
            <MovieCard key={movie.movie_id} movie={movie} />
          ))}
        </div>
      ) : (
        <p className="text-gray-400 text-center">No movies available</p>
      )}

      {/* button showmore */}
      <div className="flex justify-center mt-20">
        <button
          disabled={isLoadingMore || isMaxMovie}
          onClick={handleLoadMore}
          className="px-10 py-3 text-sm bg-primary hover:bg-primary-dull transition rounded-md font-medium disabled:opacity-50"
        >
          {isLoadingMore
            ? "Loading..."
            : isMaxMovie
            ? "No more movies"
            : "Show more"}
        </button>
      </div>
    </section>
  );
};

export default FeaturedSection;

