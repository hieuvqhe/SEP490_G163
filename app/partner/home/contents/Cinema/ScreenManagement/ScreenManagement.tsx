"use client";

import { useEffect, useMemo, useState } from "react";
import { useGetPartnerCinemas, useInvalidatePartnerCinemas } from "@/apis/partner.cinema.api";
import type { PartnerCinema } from "@/apis/partner.cinema.api";
import {
  useCreatePartnerScreen,
  useDeletePartnerScreen,
  useGetPartnerScreenById,
  useGetPartnerScreens,
  useInvalidatePartnerScreens,
  useUpdatePartnerScreen,
} from "@/apis/partner.screen.api";
import type { PartnerScreen } from "@/apis/partner.screen.api";
import { useToast } from "@/components/ToastProvider";
import { Button } from "@/components/ui/button";
import {
  CinemaSelectionPanel,
  ScreenDeleteDialog,
  ScreenDetailModal,
  ScreenFormModal,
  ScreenTable,
  ScreenToolbar,
} from "./components";
import {
  defaultScreenFilters,
  defaultScreenFormValues,
} from "./constants";
import {
  getScreenErrorMessage,
  mapFormValuesToCreatePayload,
  mapFormValuesToUpdatePayload,
  mapScreenToFormValues,
} from "./utils";
import type { ScreenFilters, ScreenFormValues } from "./types";
import { MonitorPlay } from "lucide-react";

const ScreenManagement = () => {
  const { showToast } = useToast();
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [selectedCinema, setSelectedCinema] = useState<PartnerCinema | null>(null);
  const [cinemaSearch, setCinemaSearch] = useState("");

  const [filters, setFilters] = useState<ScreenFilters>({ ...defaultScreenFilters });
  const [pagination, setPagination] = useState({ page: 1, limit: 10 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formInitialValues, setFormInitialValues] = useState<ScreenFormValues>({ ...defaultScreenFormValues });
  const [editingScreenId, setEditingScreenId] = useState<number | null>(null);

  const [detailScreenId, setDetailScreenId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const [deleteScreenId, setDeleteScreenId] = useState<number | null>(null);
  const [deleteScreenName, setDeleteScreenName] = useState<string>("");
  const [isDeleteOpen, setIsDeleteOpen] = useState(false);

  const invalidateScreens = useInvalidatePartnerScreens();
  const invalidateCinemas = useInvalidatePartnerCinemas();

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
      return;
    }
    const cinema = cinemas.find((item) => item.cinemaId === selectedCinemaId) ?? null;
    setSelectedCinema(cinema);
  }, [cinemas, selectedCinemaId]);

  const screenQueryParams = useMemo(
    () => ({
      page: pagination.page,
      limit: pagination.limit,
      screenType: filters.screenType === "all" ? undefined : filters.screenType,
      isActive:
        filters.status === "all" ? undefined : filters.status === "active",
      sortBy: filters.sortBy,
      sortOrder: filters.sortOrder,
    }),
    [filters, pagination]
  );

  const {
    data: screenData,
    isLoading: screensLoading,
    isFetching: screensFetching,
    error: screensError,
    refetch: refetchScreens,
  } = useGetPartnerScreens(selectedCinemaId ?? undefined, screenQueryParams);

  const screens = screenData?.result.screens ?? [];
  const paginationInfo = screenData?.result.pagination;

  const filteredScreens = useMemo(() => {
    if (!filters.search.trim()) return screens;
    const keyword = filters.search.trim().toLowerCase();
    return screens.filter((screen) =>
      [screen.screenName, screen.code]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [filters.search, screens]);

  const detailQuery = useGetPartnerScreenById(detailScreenId ?? undefined);

  const createMutation = useCreatePartnerScreen();
  const updateMutation = useUpdatePartnerScreen();
  const deleteMutation = useDeletePartnerScreen();

  const handleSelectCinema = (cinema: PartnerCinema) => {
    setSelectedCinemaId(cinema.cinemaId);
    setPagination({ page: 1, limit: 10 });
  };

  const handleFiltersChange = (partial: Partial<ScreenFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sortField: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortField,
      sortOrder:
        prev.sortBy === sortField && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    const totalPages = paginationInfo?.totalPages ?? 1;
    if (page > totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleCreateClick = () => {
    if (!selectedCinemaId) {
      showToast("Vui lòng chọn rạp trước khi thêm phòng", undefined, "error");
      return;
    }
    setFormMode("create");
    setFormInitialValues({ ...defaultScreenFormValues });
    setEditingScreenId(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (screen: PartnerScreen) => {
    setFormMode("edit");
    setFormInitialValues(mapScreenToFormValues(screen));
    setEditingScreenId(screen.screenId);
    setIsFormOpen(true);
  };

  const handleDetailClick = (screen: PartnerScreen) => {
    setDetailScreenId(screen.screenId);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (screen: PartnerScreen) => {
    setDeleteScreenId(screen.screenId);
    setDeleteScreenName(screen.screenName);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (values: ScreenFormValues) => {
    if (!selectedCinemaId) {
      showToast("Không xác định được rạp để thao tác", undefined, "error");
      return;
    }

    try {
      if (formMode === "create") {
        const payload = mapFormValuesToCreatePayload(values);
        createMutation.mutate(
          { cinemaId: selectedCinemaId, payload },
          {
            onSuccess: () => {
              showToast("Tạo phòng thành công", undefined, "success");
              setIsFormOpen(false);
              setFormInitialValues({ ...defaultScreenFormValues });
              invalidateScreens(selectedCinemaId);
              invalidateCinemas();
            },
            onError: (error) => {
              showToast(getScreenErrorMessage(error), undefined, "error");
            },
          }
        );
        return;
      }

      if (!editingScreenId) {
        showToast("Không xác định được phòng cần cập nhật", undefined, "error");
        return;
      }

      const payload = mapFormValuesToUpdatePayload(values);
      updateMutation.mutate(
        { screenId: editingScreenId, payload },
        {
          onSuccess: () => {
            showToast("Cập nhật phòng thành công", undefined, "success");
            setIsFormOpen(false);
            setEditingScreenId(null);
            invalidateScreens(selectedCinemaId);
            invalidateCinemas();
          },
          onError: (error) => {
            showToast(getScreenErrorMessage(error), undefined, "error");
          },
        }
      );
    } catch (error) {
      showToast(getScreenErrorMessage(error), undefined, "error");
    }
  };

  const handleDeleteConfirm = () => {
    if (!deleteScreenId) return;

    deleteMutation.mutate(deleteScreenId, {
      onSuccess: () => {
        showToast("Đã vô hiệu hoá phòng chiếu", undefined, "success");
        setIsDeleteOpen(false);
        setDeleteScreenId(null);
        invalidateScreens(selectedCinemaId ?? undefined);
        invalidateCinemas();
      },
      onError: (error) => {
        showToast(getScreenErrorMessage(error), undefined, "error");
      },
    });
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setDetailScreenId(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setDeleteScreenId(null);
    setDeleteScreenName("");
  };

  const isRefreshing = screensFetching && !screensLoading;
  const cinemaErrorMessage = cinemasError ? getScreenErrorMessage(cinemasError) : undefined;
  const screenErrorMessage = screensError ? getScreenErrorMessage(screensError) : undefined;

  return (
    <div className="space-y-6">
      <div className="grid gap-6 lg:grid-cols-[320px,1fr]">
        <div className="rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 backdrop-blur">
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

        <div className="space-y-4">
          {selectedCinema ? (
            <>
              <ScreenToolbar
                filters={filters}
                onFiltersChange={handleFiltersChange}
                onRefresh={() => refetchScreens()}
                isRefreshing={isRefreshing}
                onCreate={handleCreateClick}
                cinemaName={selectedCinema.cinemaName}
              />

              <ScreenTable
                screens={filteredScreens}
                loading={screensLoading}
                errorMessage={screenErrorMessage}
                pagination={paginationInfo}
                sortBy={filters.sortBy}
                sortOrder={filters.sortOrder}
                onSortChange={handleSortChange}
                onPageChange={handlePageChange}
                onView={handleDetailClick}
                onEdit={handleEditClick}
                onDelete={handleDeleteClick}
              />
            </>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-slate-700/60 bg-slate-900/30 p-8 text-center text-slate-400">
              <MonitorPlay className="size-10 text-orange-400" />
              <div>
                <p className="text-lg font-semibold text-slate-100">
                  Chọn một rạp để bắt đầu quản lý phòng chiếu
                </p>
                <p className="mt-2 text-sm text-slate-400">
                  Danh sách phòng sẽ hiển thị sau khi bạn chọn rạp thuộc quyền quản lý của mình.
                </p>
              </div>
              <Button
                variant="outline"
                className="border-slate-700 text-slate-200 hover:bg-slate-800"
                onClick={() => refetchCinemas()}
              >
                Làm mới danh sách rạp
              </Button>
            </div>
          )}
        </div>
      </div>

      <ScreenFormModal
        open={isFormOpen}
        mode={formMode}
        initialValues={formInitialValues}
        onClose={() => setIsFormOpen(false)}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <ScreenDetailModal
        open={isDetailOpen}
        onClose={handleDetailClose}
        screen={detailQuery.data?.result ?? null}
        loading={detailQuery.isLoading}
      />

      <ScreenDeleteDialog
        open={isDeleteOpen}
        onClose={handleDeleteClose}
        screenName={deleteScreenName}
        onConfirm={handleDeleteConfirm}
        submitting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ScreenManagement;
