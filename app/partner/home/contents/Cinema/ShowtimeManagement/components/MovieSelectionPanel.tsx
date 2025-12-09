import { useMemo, useState } from "react";
import type { Movie } from "@/types/movie.type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Film, RefreshCw, Search, ChevronLeft, ChevronRight } from "lucide-react";
import { cn } from "@/lib/utils";

interface MovieSelectionPanelProps {
  movies: Movie[];
  loading: boolean;
  errorMessage?: string;
  searchTerm: string;
  onSearchChange: (value: string) => void;
  selectedMovieId: number | null;
  onSelect: (movie: Movie) => void;
  onRefresh: () => void;
}

const MovieSelectionPanel = ({
  movies,
  loading,
  errorMessage,
  searchTerm,
  onSearchChange,
  selectedMovieId,
  onSelect,
  onRefresh,
}: MovieSelectionPanelProps) => {
  const [currentPage, setCurrentPage] = useState(1);
  const itemsPerPage = 5; // 5 phim mỗi trang

  const filteredMovies = useMemo(() => {
    if (!searchTerm.trim()) return movies;
    const keyword = searchTerm.trim().toLowerCase();
    return movies.filter((movie) =>
      [movie.title, movie.genre, movie.language]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword))
    );
  }, [movies, searchTerm]);

  const totalPages = Math.ceil(filteredMovies.length / itemsPerPage);

  const moviesToDisplay = useMemo(() => {
    const startIndex = (currentPage - 1) * itemsPerPage;
    const endIndex = startIndex + itemsPerPage;
    return filteredMovies.slice(startIndex, endIndex);
  }, [filteredMovies, currentPage]);

  const handlePrevPage = () => {
    setCurrentPage((prev) => Math.max(1, prev - 1));
  };

  const handleNextPage = () => {
    setCurrentPage((prev) => Math.min(totalPages, prev + 1));
  };

  // Reset về trang 1 khi search term thay đổi
  useMemo(() => {
    setCurrentPage(1);
  }, [searchTerm]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#f5f5f5]/80">
          <Film className="size-5 text-[#ff7a45]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">
              Chọn phim đang chiếu
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Danh sách phim trạng thái <span className="font-semibold text-[#ff7a45]">Now Showing</span>
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      <div className="relative">
        <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
        <Input
          placeholder="Tìm phim theo tên, thể loại hoặc ngôn ngữ"
          className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      {loading ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#9e9ea2]">
          Đang tải danh sách phim...
        </div>
      ) : errorMessage ? (
        <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 p-4 text-sm text-rose-200">
          {errorMessage}
        </div>
      ) : filteredMovies.length === 0 ? (
        <div className="flex min-h-[280px] items-center justify-center text-sm text-[#9e9ea2]">
          Không tìm thấy phim phù hợp.
        </div>
      ) : (
        <>
          {/* Movie Grid */}
          <div className="flex flex-col gap-3">
            {moviesToDisplay.map((movie) => {
              const isSelected = movie.movieId === selectedMovieId;
              return (
                <button
                  key={movie.movieId}
                  type="button"
                  onClick={() => onSelect(movie)}
                  className={cn(
                    "group relative flex items-center gap-4 rounded-lg border px-4 py-3 text-left transition-all",
                    "border-[#27272a] bg-[#151518] hover:border-[#ff7a45]/60 hover:bg-[#1c1c1f] shadow-lg shadow-black/20",
                    isSelected && "border-[#ff7a45] bg-[#ff7a45]/10 shadow-lg shadow-[#ff7a45]/30"
                  )}
                >
                  {/* Poster */}
                  <div className="relative flex-shrink-0 w-16 h-20 overflow-hidden rounded-md bg-[#1c1c1f]">
                    <img
                      src={movie.posterUrl}
                      alt={movie.title}
                      className="h-full w-full object-cover transition-transform duration-300 group-hover:scale-105"
                      onError={(event) => {
                        event.currentTarget.src = "/placeholder-movie.jpg";
                      }}
                    />
                  </div>

                  {/* Info */}
                  <div className="flex-1 min-w-0">
                    <p className="font-semibold text-sm text-[#f5f5f5] truncate">
                      {movie.title}
                    </p>
                    <p className="text-xs text-[#9e9ea2] mt-0.5">{movie.genre}</p>
                    <p className="text-xs text-[#9e9ea2] mt-0.5">
                      {movie.durationMinutes} phút • {movie.language}
                    </p>
                    <p className="text-xs text-[#9e9ea2] mt-0.5">
                      Khởi chiếu: {new Date(movie.premiereDate).toLocaleDateString("vi-VN")}
                    </p>
                  </div>

                  {isSelected && (
                    <div className="flex-shrink-0 bg-[#ff7a45] text-white px-3 py-1 rounded-full text-xs font-semibold">
                      ✓ Đã chọn
                    </div>
                  )}
                </button>
              );
            })}
          </div>

          {/* Pagination */}
          {totalPages > 1 && (
            <div className="flex items-center justify-between pt-4 border-t border-[#27272a]">
              <p className="text-xs text-[#9e9ea2]">
                Trang {currentPage} / {totalPages} • {filteredMovies.length} phim
              </p>
              <div className="flex items-center gap-2">
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handlePrevPage}
                  disabled={currentPage === 1}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  <ChevronLeft className="size-4" />
                  Trước
                </Button>
                <Button
                  size="sm"
                  variant="outline"
                  onClick={handleNextPage}
                  disabled={currentPage === totalPages}
                  className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f] disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  Sau
                  <ChevronRight className="size-4" />
                </Button>
              </div>
            </div>
          )}
        </>
      )}
    </div>
  );
};

export default MovieSelectionPanel;
