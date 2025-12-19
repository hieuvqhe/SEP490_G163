"use client";

import React, { useState, useMemo } from "react";
import { useGetFullMovies } from "@/hooks/useMovie";
import MovieCard from "./MovieCard";
import MovieCardSkeleton from "@/components/homepage/MovieCardSkeleton";
import { Button } from "@/components/ui/button";
import { ChevronLeft, ChevronRight } from "lucide-react";

interface MovieListProps {
  selectedGenre: string;
  selectedLanguage: string;
  searchQuery?: string;
}

export default function MovieList({ selectedGenre, selectedLanguage, searchQuery = "" }: MovieListProps) {
  const [page, setPage] = useState(1);
  const isSearchMode = !!searchQuery;
  const limit = 12; // Luôn hiển thị 12 phim mỗi trang

  // Reset page khi filter hoặc search thay đổi
  React.useEffect(() => {
    setPage(1);
  }, [selectedGenre, selectedLanguage, searchQuery]);

  const { data: movieResponse, isLoading } = useGetFullMovies({
    limit: limit,
    sort_order: "desc",
    sort_by: "average_rating",
    page: page,
    status: "now_showing",
    genre: !isSearchMode && selectedGenre !== "Tất cả" ? selectedGenre : undefined,
    language: !isSearchMode && selectedLanguage !== "Tất cả" ? selectedLanguage : undefined,
    search: searchQuery || undefined,
  });

  const movies = useMemo(
    () => movieResponse?.result.movies ?? [],
    [movieResponse?.result.movies]
  );

  const totalPages = movieResponse?.result.totalPages ?? 1;
  const totalMovies = movieResponse?.result.total ?? 0;

  const handlePrevPage = () => {
    if (page > 1) {
      setPage(page - 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  const handleNextPage = () => {
    if (page < totalPages) {
      setPage(page + 1);
      window.scrollTo({ top: 0, behavior: "smooth" });
    }
  };

  if (isLoading) {
    return (
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {[...Array(12)].map((_, index) => (
          <MovieCardSkeleton key={index} />
        ))}
      </div>
    );
  }

  if (movies.length === 0) {
    return (
      <div className="text-center py-20">
        <p className="text-gray-400 text-lg">
          {isSearchMode 
            ? `Không tìm thấy phim nào với từ khóa "${searchQuery}"` 
            : "Không có phim đang chiếu"}
        </p>
      </div>
    );
  }

  return (
    <>
      {isSearchMode && (
        <div className="mb-6">
          <p className="text-gray-400">
            Kết quả tìm kiếm cho: <span className="text-white font-semibold">"{searchQuery}"</span>
          </p>
          <p className="text-sm text-gray-500 mt-1">
            Tìm thấy {totalMovies} phim
          </p>
        </div>
      )}
      {/* Movie Grid */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-4 gap-6 mt-8">
        {movies.map((movie) => (
          <MovieCard key={movie.movieId} movie={movie} />
        ))}
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <div className="flex items-center justify-center gap-4 mt-12">
          <Button
            onClick={handlePrevPage}
            disabled={page === 1}
            variant="outline"
            className="flex items-center gap-2"
          >
            <ChevronLeft className="w-4 h-4" />
            Trang trước
          </Button>

          <div className="flex items-center gap-2">
            <span className="text-sm text-gray-400">
              Trang {page} / {totalPages}
            </span>
            <span className="text-sm text-gray-500">
              ({totalMovies} phim)
            </span>
          </div>

          <Button
            onClick={handleNextPage}
            disabled={page >= totalPages}
            variant="outline"
            className="flex items-center gap-2"
          >
            Trang sau
            <ChevronRight className="w-4 h-4" />
          </Button>
        </div>
      )}
    </>
  );
}
