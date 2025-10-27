"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import {
  type Movie,
  type MovieQueryParams,
} from "@/types/movie.type";
import { getAllMovies } from "@/apis/movie.api";
import {
  type CreateMovieRequest,
  type ManagerMovieApiError,
  useCreateMovie,
  useUpdateMovie,
  useDeleteMovie,
} from "@/apis/manager.movie.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import {
  Eye,
  Loader2,
  Pencil,
  Plus,
  RefreshCcw,
  Search,
  Trash2,
} from "lucide-react";
import clsx from "clsx";
import MovieFormModal from "./MovieFormModal";
import MovieDetailModal from "./MovieDetailModal";

const MOVIE_QUERY_DEFAULT: MovieQueryParams = {
  page: 1,
  limit: 10,
};

const ManageMovie = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [movieEditing, setMovieEditing] = useState<Movie | null>(null);
  const [movieViewing, setMovieViewing] = useState<Movie | null>(null);
  const [movieDeleting, setMovieDeleting] = useState<Movie | null>(null);

  useEffect(() => {
    const handler = setTimeout(() => {
      setDebouncedSearch(searchTerm.trim());
    }, 400);

    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryParams = useMemo((): MovieQueryParams => {
    return {
      ...MOVIE_QUERY_DEFAULT,
      search: debouncedSearch || undefined,
    };
  }, [debouncedSearch]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useQuery({
    queryKey: ["manager-movies", queryParams],
    queryFn: () => getAllMovies(queryParams),
  });

  useEffect(() => {
    if (isError) {
      const err = error as Error | undefined;
      showToast(
        "Không thể tải danh sách phim",
        err?.message || "Đã xảy ra lỗi khi lấy dữ liệu phim",
        "error"
      );
    }
  }, [isError, error, showToast]);

  const movies: Movie[] = Array.isArray(data?.result?.movies)
    ? (data?.result?.movies as Movie[])
    : [];

  const createMovieMutation = useCreateMovie();
  const updateMovieMutation = useUpdateMovie();
  const deleteMovieMutation = useDeleteMovie();

  const handleOpenCreate = () => {
    setFormMode("create");
    setMovieEditing(null);
    setIsFormOpen(true);
  };

  const handleOpenEdit = (movie: Movie) => {
    setFormMode("edit");
    setMovieEditing(movie);
    setIsFormOpen(true);
  };

  const handleViewMovie = (movie: Movie) => {
    setMovieViewing(movie);
  };

  const handleCloseDetail = () => setMovieViewing(null);

  const closeForm = () => {
    setIsFormOpen(false);
    setMovieEditing(null);
  };

  const handleCreateMovie = (payload: CreateMovieRequest) => {
    return new Promise<void>((resolve, reject) => {
      if (!accessToken) {
        showToast(
          "Yêu cầu đăng nhập",
          "Vui lòng đăng nhập để thực hiện thao tác này",
          "error"
        );
        reject(new Error("Thiếu accessToken"));
        return;
      }

      createMovieMutation.mutate(
        { data: payload, accessToken },
        {
          onSuccess: () => {
            showToast("Tạo phim thành công", undefined, "success");
            closeForm();
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerMovieApiError | undefined;
            showToast(
              apiError?.message || "Tạo phim thất bại",
              undefined,
              "error"
            );
            reject(err as Error);
          },
        }
      );
    });
  };

  const handleUpdateMovie = (movieId: number, payload: CreateMovieRequest) => {
    return new Promise<void>((resolve, reject) => {
      if (!accessToken) {
        showToast(
          "Yêu cầu đăng nhập",
          "Vui lòng đăng nhập để thực hiện thao tác này",
          "error"
        );
        reject(new Error("Thiếu accessToken"));
        return;
      }

      updateMovieMutation.mutate(
        { movieId, data: payload, accessToken },
        {
          onSuccess: () => {
            showToast("Cập nhật phim thành công", undefined, "success");
            closeForm();
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerMovieApiError | undefined;
            showToast(
              apiError?.message || "Cập nhật phim thất bại",
              undefined,
              "error"
            );
            reject(err as Error);
          },
        }
      );
    });
  };

  const handleConfirmDelete = (movie: Movie) => {
    setMovieDeleting(movie);
  };

  const handleDeleteMovie = () => {
    if (!movieDeleting) return;

    if (!accessToken) {
      showToast(
        "Yêu cầu đăng nhập",
        "Vui lòng đăng nhập để thực hiện thao tác này",
        "error"
      );
      return;
    }

    deleteMovieMutation.mutate(
      { movieId: movieDeleting.movieId, accessToken },
      {
        onSuccess: () => {
          showToast("Xoá phim thành công", undefined, "success");
          setMovieDeleting(null);
        },
        onError: (err) => {
          const apiError = err as ManagerMovieApiError | undefined;
          showToast(
            apiError?.message || "Xoá phim thất bại",
            undefined,
            "error"
          );
        },
      }
    );
  };

  const isMutating =
    createMovieMutation.isPending ||
    updateMovieMutation.isPending ||
    deleteMovieMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="flex flex-wrap items-center justify-between gap-3 rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-xl">
        <div>
          <h2 className="text-2xl font-semibold">Quản lý phim</h2>
          <p className="mt-1 text-sm text-gray-300">
            Theo dõi danh sách phim, chỉnh sửa thông tin và quản lý dàn diễn viên.
          </p>
        </div>
        <div className="flex flex-wrap items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm theo tên phim"
              className="w-64 rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
            />
          </div>
          <button
            onClick={() => refetch()}
            className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
            disabled={isFetching}
          >
            {isFetching ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
            Làm mới
          </button>
          <button
            onClick={handleOpenCreate}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Tạo phim mới
          </button>
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg">
        {isLoading ? (
          <div className="flex items-center justify-center gap-2 p-10 text-sm text-gray-200">
            <Loader2 className="h-5 w-5 animate-spin" />
            Đang tải danh sách phim...
          </div>
        ) : movies.length === 0 ? (
          <div className="p-10 text-center text-sm text-gray-300">
            Không tìm thấy phim nào phù hợp.
          </div>
        ) : (
          <div className="overflow-x-auto">
            <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
              <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
                <tr>
                  <th className="px-6 py-3">Poster</th>
                  <th className="px-6 py-3">Tiêu đề</th>
                  <th className="px-6 py-3">Thể loại</th>
                  <th className="px-6 py-3">Trạng thái</th>
                  <th className="px-6 py-3">Ngày khởi chiếu</th>
                  <th className="px-6 py-3">Thời lượng</th>
                  <th className="px-6 py-3 text-right">Hành động</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-white/5">
                {movies.map((movie) => (
                  <tr
                    key={movie.movieId}
                    className="transition hover:bg-white/10"
                  >
                    <td className="px-6 py-4">
                      {movie.posterUrl ? (
                        <img
                          src={movie.posterUrl}
                          alt={movie.title}
                          className="h-16 w-12 rounded-md object-cover"
                        />
                      ) : (
                        <div className="flex h-16 w-12 items-center justify-center rounded-md border border-dashed border-white/20 bg-white/5 text-xs text-gray-400">
                          Không có
                        </div>
                      )}
                    </td>
                    <td className="px-6 py-4 font-medium text-white">
                      <div className="flex flex-col gap-1">
                        <span>{movie.title}</span>
                        <span className="text-xs text-gray-400">ID: {movie.movieId}</span>
                      </div>
                    </td>
                    <td className="px-6 py-4 capitalize text-gray-300">{movie.genre || "-"}</td>
                    <td className="px-6 py-4">
                      <span
                        className={clsx(
                          "inline-flex items-center rounded-full px-3 py-1 text-xs font-medium",
                          getStatusBadgeClass(movie.status)
                        )}
                      >
                        {getStatusLabel(movie.status)}
                      </span>
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {formatDateDisplay(movie.premiereDate)}
                    </td>
                    <td className="px-6 py-4 text-gray-300">
                      {movie.durationMinutes ? `${movie.durationMinutes} phút` : "-"}
                    </td>
                    <td className="px-6 py-4">
                      <div className="flex items-center justify-end gap-2">
                        <button
                          className="flex items-center gap-1 rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-200 transition hover:bg-blue-500/30"
                          onClick={() => handleViewMovie(movie)}
                        >
                          <Eye className="h-4 w-4" />
                          Chi tiết
                        </button>
                        <button
                          className="flex items-center gap-1 rounded-lg bg-emerald-500/20 px-3 py-2 text-xs font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                          onClick={() => handleOpenEdit(movie)}
                        >
                          <Pencil className="h-4 w-4" />
                          Chỉnh sửa
                        </button>
                        <button
                          className="flex items-center gap-1 rounded-lg bg-red-500/20 px-3 py-2 text-xs font-semibold text-red-200 transition hover:bg-red-500/30"
                          onClick={() => handleConfirmDelete(movie)}
                        >
                          <Trash2 className="h-4 w-4" />
                          Xoá
                        </button>
                      </div>
                    </td>
                  </tr>
                ))}
              </tbody>
            </table>
          </div>
        )}
      </div>

      <MovieFormModal
        open={isFormOpen}
        mode={formMode}
        movie={movieEditing ?? undefined}
        accessToken={accessToken}
        onClose={closeForm}
        onSubmit={(data: CreateMovieRequest) =>
          formMode === "edit" && movieEditing
            ? handleUpdateMovie(movieEditing.movieId, data)
            : handleCreateMovie(data)
        }
        isSubmitting={createMovieMutation.isPending || updateMovieMutation.isPending}
      />

      <MovieDetailModal
        movie={movieViewing ?? undefined}
        open={!!movieViewing}
        onClose={handleCloseDetail}
      />

      <ConfirmDeleteModal
        open={!!movieDeleting}
        movieTitle={movieDeleting?.title}
        isProcessing={deleteMovieMutation.isPending}
        onCancel={() => setMovieDeleting(null)}
        onConfirm={handleDeleteMovie}
      />

      {isMutating && (
        <div className="pointer-events-none fixed inset-0 z-10 flex items-end justify-end p-6">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs text-white shadow-lg">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang xử lý yêu cầu...
          </div>
        </div>
      )}
    </div>
  );
};

export default ManageMovie;

const getStatusLabel = (status?: Movie["status"]) => {
  switch (status) {
    case "now_showing":
      return "Đang chiếu";
    case "coming_soon":
      return "Sắp chiếu";
    case "ended":
      return "Đã kết thúc";
    default:
      return "Không xác định";
  }
};

const getStatusBadgeClass = (status?: Movie["status"]) => {
  switch (status) {
    case "now_showing":
      return "bg-emerald-500/20 text-emerald-200 border border-emerald-400/30";
    case "coming_soon":
      return "bg-sky-500/20 text-sky-200 border border-sky-400/30";
    case "ended":
      return "bg-red-500/20 text-red-200 border border-red-400/30";
    default:
      return "bg-gray-500/20 text-gray-200 border border-gray-400/30";
  }
};

const formatDateDisplay = (dateInput?: Date | string) => {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

interface ConfirmDeleteModalProps {
  open: boolean;
  movieTitle?: string;
  isProcessing?: boolean;
  onCancel: () => void;
  onConfirm: () => void;
}

const ConfirmDeleteModal = ({
  open,
  movieTitle,
  isProcessing,
  onCancel,
  onConfirm,
}: ConfirmDeleteModalProps) => {
  if (!open) return null;

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      <div className="w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl">
        <h3 className="text-xl font-semibold">Xác nhận xoá phim</h3>
        <p className="mt-3 text-sm text-gray-200">
          Bạn có chắc chắn muốn xoá phim "{movieTitle}" khỏi hệ thống? Hành động này không thể hoàn tác.
        </p>

        <div className="mt-6 flex justify-end gap-3 text-sm">
          <button
            onClick={onCancel}
            className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-white transition hover:bg-white/20"
            disabled={isProcessing}
          >
            Huỷ
          </button>
          <button
            onClick={onConfirm}
            className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-semibold text-slate-900 transition hover:bg-red-400 disabled:opacity-70"
            disabled={isProcessing}
          >
            {isProcessing && <Loader2 className="h-4 w-4 animate-spin" />}
            Xoá phim
          </button>
        </div>
      </div>
    </div>
  );
};

// =========================
// Movie Form Modal
// =========================
