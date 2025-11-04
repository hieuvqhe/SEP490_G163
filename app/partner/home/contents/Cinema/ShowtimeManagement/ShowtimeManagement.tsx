"use client";

import { useEffect, useMemo, useState } from "react";
import { useQuery } from "@tanstack/react-query";
import { getMoviesByStatus } from "@/apis/movie.api";
import type { Movie } from "@/types/movie.type";
import {
  useCreatePartnerShowtime,
  useDeletePartnerShowtime,
  useGetPartnerShowtimes,
  useUpdatePartnerShowtime,
  type PartnerShowtime,
} from "@/apis/partner.showtime.api";
import {
  useGetPartnerCinemas,
  type PartnerCinema,
} from "@/apis/partner.cinema.api";
import {
  useGetPartnerScreens,
  useInvalidatePartnerScreens,
  type PartnerScreen,
} from "@/apis/partner.screen.api";
import {
  defaultShowtimeFilters,
  defaultShowtimeFormValues,
} from "./constants";
import type {
  SelectedContext,
  ShowtimeFilters,
  ShowtimeFormValues,
  ShowtimePaginationState,
} from "./types";
import {
  MovieSelectionPanel,
  ScreenSelectionPanel,
  ShowtimeDeleteDialog,
  ShowtimeFormModal,
  ShowtimeTable,
  ShowtimeToolbar,
} from "./components";
import {
  getShowtimeErrorMessage,
  mapFormValuesToCreatePayload,
  mapFormValuesToUpdatePayload,
  mapShowtimeToFormValues,
} from "./utils";
import { getScreenErrorMessage } from "../ScreenManagement/utils";
import { useToast } from "@/components/ToastProvider";
import { CinemaSelectionPanel } from "../ScreenManagement/components";

const ShowtimeManagement = () => {
  const { showToast } = useToast();

  const [movieSearchTerm, setMovieSearchTerm] = useState("");
  const [cinemaSearch, setCinemaSearch] = useState("");

  const [selectedMovie, setSelectedMovie] = useState<Movie | null>(null);
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<PartnerCinema | null>(null);
  const [selectedScreen, setSelectedScreen] = useState<PartnerScreen | null>(null);

  const [filters, setFilters] = useState<ShowtimeFilters>({ ...defaultShowtimeFilters });
  const [pagination, setPagination] = useState<ShowtimePaginationState>({ page: 1, limit: 10 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formValues, setFormValues] = useState<ShowtimeFormValues>({ ...defaultShowtimeFormValues });
  const [editingShowtime, setEditingShowtime] = useState<PartnerShowtime | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [deleteTarget, setDeleteTarget] = useState<PartnerShowtime | null>(null);

  const invalidateScreens = useInvalidatePartnerScreens();

  const {
    data: moviesData,
    isLoading: moviesLoading,
    isFetching: moviesFetching,
    refetch: refetchMovies,
    error: moviesError,
  } = useQuery({
    queryKey: ["partner-now-showing-movies"],
    queryFn: () => getMoviesByStatus("now_showing", 100, 1),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });

  const {
    data: cinemaData,
    isLoading: cinemasLoading,
    isFetching: cinemasFetching,
    error: cinemasError,
    refetch: refetchCinemas,
  } = useGetPartnerCinemas({ page: 1, limit: 100, sortBy: "cinemaName", sortOrder: "asc" });

  const cinemas = cinemaData?.result.cinemas ?? [];

  useEffect(() => {
    if (!selectedCinemaId) {
      setSelectedCinema(null);
      setSelectedScreen(null);
      return;
    }
    const cinema = cinemas.find((item) => item.cinemaId === selectedCinemaId) ?? null;
    setSelectedCinema(cinema);
    if (!cinema) {
      setSelectedScreen(null);
    }
  }, [cinemas, selectedCinemaId]);

  const {
    data: screenData,
    isLoading: screensLoading,
    isFetching: screensFetching,
    error: screensError,
    refetch: refetchScreens,
  } = useGetPartnerScreens(selectedCinemaId ?? undefined, {
    page: 1,
    limit: 100,
    sortBy: "screenName",
    sortOrder: "asc",
  });

  const screens = screenData?.result.screens ?? [];

  useEffect(() => {
    if (!selectedScreen) return;
    const exists = screens.some((screen) => screen.screenId === selectedScreen.screenId);
    if (!exists) {
      setSelectedScreen(null);
    }
  }, [screens, selectedScreen]);

  const canQueryShowtimes = Boolean(selectedMovie && selectedCinema && selectedScreen);

  const showtimeQueryParams = useMemo(() => {
    return {
      page: pagination.page,
      limit: pagination.limit,
      movieId: selectedMovie?.movieId,
      cinemaId: selectedCinema?.cinemaId,
      screenId: selectedScreen?.screenId,
      date: filters.date || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    };
  }, [filters.date, filters.sortBy, filters.sortOrder, pagination.limit, pagination.page, selectedCinema, selectedMovie, selectedScreen]);

  const {
    data: showtimeData,
    isLoading: showtimesLoading,
    isFetching: showtimesFetching,
    error: showtimesError,
    refetch: refetchShowtimes,
  } = useGetPartnerShowtimes(showtimeQueryParams, { enabled: canQueryShowtimes });

  const showtimes = showtimeData?.result.showtimes ?? [];
  const showtimePagination = showtimeData?.result;

  const createMutation = useCreatePartnerShowtime();
  const updateMutation = useUpdatePartnerShowtime();
  const deleteMutation = useDeletePartnerShowtime();

  const movies = (moviesData?.result?.movies ?? []) as Movie[];

  const movieErrorMessage = moviesError instanceof Error ? moviesError.message : undefined;
  const cinemaErrorMessage = cinemasError ? getScreenErrorMessage(cinemasError) : undefined;
  const screenErrorMessage = screensError ? getScreenErrorMessage(screensError) : undefined;
  const showtimeErrorMessage = showtimesError ? getShowtimeErrorMessage(showtimesError) : undefined;

  const handleSelectMovie = (movie: Movie) => {
    setSelectedMovie(movie);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSelectCinema = (cinema: PartnerCinema) => {
    setSelectedCinemaId(cinema.cinemaId);
    setSelectedScreen(null);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSelectScreen = (screen: PartnerScreen) => {
    setSelectedScreen(screen);
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleFiltersChange = (partial: Partial<ShowtimeFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    const totalPages = showtimePagination?.totalPages ?? 1;
    if (page > totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  const context: SelectedContext = {
    movie: selectedMovie,
    cinema: selectedCinema,
    screen: selectedScreen,
  };

  const ensureContext = () => {
    if (!selectedMovie) {
      showToast("Vui lòng chọn phim đang chiếu", undefined, "error");
      return false;
    }
    if (!selectedCinema) {
      showToast("Vui lòng chọn rạp quản lý", undefined, "error");
      return false;
    }
    if (!selectedScreen) {
      showToast("Vui lòng chọn phòng chiếu", undefined, "error");
      return false;
    }
    return true;
  };

  const handleCreateShowtime = () => {
    if (!ensureContext()) return;
    setFormMode("create");
    setEditingShowtime(null);
    setFormValues({
      ...defaultShowtimeFormValues,
      availableSeats: selectedScreen?.capacity ? String(selectedScreen.capacity) : "",
    });
    setIsFormOpen(true);
  };

  const handleEditShowtime = (showtime: PartnerShowtime) => {
    if (!ensureContext()) return;
    setFormMode("edit");
    setEditingShowtime(showtime);
    setFormValues(mapShowtimeToFormValues(showtime));
    setIsFormOpen(true);
  };

  const handleDeleteShowtime = (showtime: PartnerShowtime) => {
    setDeleteTarget(showtime);
    setIsDeleteOpen(true);
  };

  const resetModals = () => {
    setIsFormOpen(false);
    setEditingShowtime(null);
    setFormValues({ ...defaultShowtimeFormValues });
  };

  const handleFormSubmit = (values: ShowtimeFormValues) => {
    if (!ensureContext()) return;
    const movieId = selectedMovie!.movieId;
    const cinemaId = selectedCinema!.cinemaId;
    const screenId = selectedScreen!.screenId;

    const payloadContext = { movieId, cinemaId, screenId };

    if (formMode === "create") {
      const payload = mapFormValuesToCreatePayload(values, payloadContext);
      createMutation.mutate(payload, {
        onSuccess: (response) => {
          showToast(response.message ?? "Tạo suất chiếu thành công", undefined, "success");
          resetModals();
          refetchShowtimes();
        },
        onError: (error) => {
          showToast(getShowtimeErrorMessage(error), undefined, "error");
        },
      });
      return;
    }

    if (!editingShowtime) {
      showToast("Không xác định được suất chiếu cần cập nhật", undefined, "error");
      return;
    }

    const payload = mapFormValuesToUpdatePayload(values, payloadContext);
    updateMutation.mutate(
      { showtimeId: editingShowtime.showtimeId, payload },
      {
        onSuccess: (response) => {
          showToast(response.message ?? "Cập nhật suất chiếu thành công", undefined, "success");
          resetModals();
          refetchShowtimes();
        },
        onError: (error) => {
          showToast(getShowtimeErrorMessage(error), undefined, "error");
        },
      }
    );
  };

  const handleDeleteConfirm = () => {
    if (!deleteTarget) return;
    deleteMutation.mutate(deleteTarget.showtimeId, {
      onSuccess: (response) => {
        showToast(response.message ?? "Xoá suất chiếu thành công", undefined, "success");
        setIsDeleteOpen(false);
        setDeleteTarget(null);
        refetchShowtimes();
      },
      onError: (error) => {
        showToast(getShowtimeErrorMessage(error), undefined, "error");
      },
    });
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setDeleteTarget(null);
  };

  const isRefreshingShowtimes = showtimesFetching && !showtimesLoading;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
            <MovieSelectionPanel
              movies={movies}
              loading={moviesLoading || moviesFetching}
              errorMessage={movieErrorMessage}
              searchTerm={movieSearchTerm}
              onSearchChange={setMovieSearchTerm}
              selectedMovieId={selectedMovie?.movieId ?? null}
              onSelect={handleSelectMovie}
              onRefresh={() => refetchMovies()}
            />
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
            <CinemaSelectionPanel
              cinemas={cinemas}
              loading={cinemasLoading || cinemasFetching}
              errorMessage={cinemaErrorMessage}
              selectedCinemaId={selectedCinemaId}
              onSelect={handleSelectCinema}
              onRetry={() => refetchCinemas()}
              searchTerm={cinemaSearch}
              onSearchChange={setCinemaSearch}
            />
          </div>
        </div>

        <div className="space-y-6">
          <div className="rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
            <ScreenSelectionPanel
              screens={screens}
              loading={screensLoading || screensFetching}
              errorMessage={screenErrorMessage}
              selectedScreenId={selectedScreen?.screenId ?? null}
              onSelect={handleSelectScreen}
              onRefresh={() => {
                if (selectedCinemaId) {
                  invalidateScreens(selectedCinemaId);
                  refetchScreens();
                }
              }}
            />
          </div>

          <div className="space-y-4">
            <ShowtimeToolbar
              filters={filters}
              onFiltersChange={handleFiltersChange}
              onRefresh={() => refetchShowtimes()}
              isRefreshing={isRefreshingShowtimes}
              onCreate={handleCreateShowtime}
              movieName={selectedMovie?.title}
              cinemaName={selectedCinema?.cinemaName}
              screenName={selectedScreen?.screenName}
            />

            {!canQueryShowtimes ? (
              <div className="rounded-xl border border-dashed border-[#27272a] bg-[#151518] p-10 text-center text-[#9e9ea2]">
                <p className="text-lg font-semibold text-[#f5f5f5]">Hãy chọn đủ phim, rạp và phòng chiếu</p>
                <p className="mt-1 text-sm">
                  Sau khi chọn đầy đủ, hệ thống sẽ hiển thị danh sách suất chiếu và cho phép bạn thao tác.
                </p>
              </div>
            ) : (
              <ShowtimeTable
                showtimes={showtimes}
                loading={showtimesLoading && !showtimesFetching}
                errorMessage={showtimeErrorMessage}
                pagination={showtimePagination}
                paginationState={pagination}
                onPageChange={handlePageChange}
                onEdit={handleEditShowtime}
                onDelete={handleDeleteShowtime}
              />
            )}
          </div>
        </div>
      </div>

      <ShowtimeFormModal
        open={isFormOpen}
        mode={formMode}
        values={formValues}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
        movie={context.movie}
        cinema={context.cinema}
        screen={context.screen}
        existingShowtimes={showtimes}
        editingShowtimeId={editingShowtime?.showtimeId ?? null}
      />

      <ShowtimeDeleteDialog
        open={isDeleteOpen}
        onClose={handleDeleteClose}
        showtime={deleteTarget}
        onConfirm={handleDeleteConfirm}
        submitting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ShowtimeManagement;
