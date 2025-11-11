"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
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
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
import { Info } from "lucide-react";

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

  const handleStartGuide = useCallback(() => {
    const steps = [] as {
      element: string;
      popover: {
        title: string;
        description: string;
        side: "bottom" | "right";
        align: "start";
      };
    }[];

    steps.push(
      {
        element: "#showtime-tour-page",
        popover: {
          title: "Quản lý suất chiếu",
          description:
            "Chọn phim, rạp và phòng chiếu để xem – chỉnh sửa các suất chiếu đang diễn ra.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#showtime-tour-movie-panel",
        popover: {
          title: "Chọn phim",
          description:
            "Lọc danh sách phim đang chiếu, tìm theo tên và chọn phim cần tạo lịch chiếu.",
          side: "right",
          align: "start",
        },
      },
      {
        element: "#showtime-tour-cinema-panel",
        popover: {
          title: "Chọn rạp",
          description:
            "Tra cứu rạp thuộc quyền quản lý, xem trạng thái và chọn rạp phù hợp.",
          side: "right",
          align: "start",
        },
      }
    );

    steps.push(
      {
        element: "#showtime-tour-screen-panel",
        popover: {
          title: "Chọn phòng chiếu",
          description:
            "Sau khi chọn rạp, chọn phòng chiếu cụ thể để xem danh sách suất chiếu tương ứng.",
          side: "bottom",
          align: "start",
        },
      },
      {
        element: "#showtime-tour-toolbar",
        popover: {
          title: "Bộ lọc & thao tác",
          description:
            "Lọc theo ngày, trạng thái, sắp xếp và tạo suất chiếu mới cho phòng đã chọn.",
          side: "bottom",
          align: "start",
        },
      }
    );

    if (!selectedMovie || !selectedCinema || !selectedScreen) {
      steps.push({
        element: "#showtime-tour-empty",
        popover: {
          title: "Chưa đủ điều kiện",
          description:
            "Hệ thống cần bạn chọn đủ phim, rạp và phòng chiếu trước khi hiển thị lịch.",
          side: "bottom",
          align: "start",
        },
      });
    } else {
      steps.push({
        element: "#showtime-tour-table",
        popover: {
          title: "Danh sách suất chiếu",
          description:
            "Theo dõi thời gian chiếu, giá vé, số ghế và truy cập nhanh vào hành động chỉnh sửa/xoá.",
          side: "bottom",
          align: "start",
        },
      });
    }

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, []);

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

  const handleBulkCreateShowtimes = async (items: ShowtimeFormValues[]) => {
    if (!ensureContext()) {
      throw new Error("Vui lòng chọn đủ phim, rạp và phòng chiếu trước khi tạo suất chiếu.");
    }

    const movieId = selectedMovie!.movieId;
    const cinemaId = selectedCinema!.cinemaId;
    const screenId = selectedScreen!.screenId;

    const payloadContext = { movieId, cinemaId, screenId };

    try {
      for (const showtimeValues of items) {
        const payload = mapFormValuesToCreatePayload(showtimeValues, payloadContext);
        await createMutation.mutateAsync(payload);
      }
      showToast(`Đã tạo ${items.length} suất chiếu thành công`, undefined, "success");
      resetModals();
      refetchShowtimes();
    } catch (error) {
      showToast(getShowtimeErrorMessage(error), undefined, "error");
      throw error;
    }
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
    <div className="space-y-6" id="showtime-tour-page">
      <div className="grid gap-6 lg:grid-cols-[340px,1fr]">
        <div className="space-y-6">
          <div className="rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40" id="showtime-tour-movie-panel">
            <div className="flex items-center justify-between">
              <h2 className="text-sm font-semibold uppercase tracking-wide text-[#f5f5f5]">Phim đang chiếu</h2>
              <Button
                variant="outline"
                size="sm"
                className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] hover:bg-[#27272a]"
                onClick={handleStartGuide}
                id="showtime-tour-start-btn"
              >
                <Info className="mr-1 size-4" /> Hướng dẫn
              </Button>
            </div>
            <MovieSelectionPanel
              searchTerm={movieSearchTerm}
              onSearchChange={setMovieSearchTerm}
              movies={movies}
              loading={moviesLoading || moviesFetching}
              errorMessage={movieErrorMessage}
              selectedMovieId={selectedMovie?.movieId ?? null}
              onSelect={handleSelectMovie}
              onRefresh={() => refetchMovies()}
            />
          </div>

          <div className="rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40" id="showtime-tour-cinema-panel">
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
          <div className="rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40" id="showtime-tour-screen-panel">
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
            <div id="showtime-tour-toolbar">
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
            </div>

            {!canQueryShowtimes ? (
              <div className="rounded-xl border border-dashed border-[#27272a] bg-[#151518] p-10 text-center text-[#9e9ea2]" id="showtime-tour-empty">
                <p className="text-lg font-semibold text-[#f5f5f5]">Hãy chọn đủ phim, rạp và phòng chiếu</p>
                <p className="mt-1 text-sm">
                  Sau khi chọn đầy đủ, hệ thống sẽ hiển thị danh sách suất chiếu và cho phép bạn thao tác.
                </p>
              </div>
            ) : (
              <div id="showtime-tour-table">
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
              </div>
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
        onBulkCreate={handleBulkCreateShowtimes}
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
