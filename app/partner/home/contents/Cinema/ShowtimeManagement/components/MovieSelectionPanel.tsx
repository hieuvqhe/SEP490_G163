import { useMemo } from "react";
import type { Movie } from "@/types/movie.type";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Film, RefreshCw, Search } from "lucide-react";
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
  const filteredMovies = useMemo(() => {
    if (!searchTerm.trim()) return movies;
    const keyword = searchTerm.trim().toLowerCase();
    return movies.filter((movie) =>
      [movie.title, movie.genre, movie.language]
        .filter(Boolean)
        .some((value) => value?.toLowerCase().includes(keyword))
    );
  }, [movies, searchTerm]);

  const moviesToDisplay = useMemo(() => {
    return filteredMovies.slice(0, 5);
  }, [filteredMovies]);

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

      <div className="grid gap-3">
        {loading ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-[#9e9ea2]">
            Đang tải danh sách phim...
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 p-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : filteredMovies.length === 0 ? (
          <div className="flex min-h-[180px] items-center justify-center text-sm text-[#9e9ea2]">
            Không tìm thấy phim phù hợp.
          </div>
        ) : (
          moviesToDisplay.map((movie) => {
            const isSelected = movie.movieId === selectedMovieId;
            return (
              <button
                key={movie.movieId}
                type="button"
                onClick={() => onSelect(movie)}
                className={cn(
                  "flex items-center gap-4 rounded-lg border px-4 py-3 text-left transition",
                  "border-[#27272a] bg-[#151518] hover:border-[#ff7a45]/60 hover:bg-[#1c1c1f] shadow-lg shadow-black/20",
                  isSelected && "border-[#ff7a45]/70 bg-[#ff7a45]/10 shadow-lg shadow-[#ff7a45]/30"
                )}
              >
                <img
                  src={movie.posterUrl}
                  alt={movie.title}
                  className="size-16 rounded-md object-cover"
                  onError={(event) => {
                    event.currentTarget.src = "/placeholder-movie.jpg";
                  }}
                />
                <div className="flex-1">
                  <p className="font-semibold text-[#f5f5f5]">{movie.title}</p>
                  <p className="text-xs text-[#9e9ea2]">{movie.genre}</p>
                  <p className="text-xs text-[#9e9ea2]">
                    {movie.durationMinutes} phút • {movie.language}
                  </p>
                  <p className="text-xs text-[#9e9ea2]">
                    Khởi chiếu: {new Date(movie.premiereDate).toLocaleDateString("vi-VN")}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default MovieSelectionPanel;
