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
import { usePartnerHomeStore } from "@/store/partnerHomeStore";

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

  const setActiveTab = usePartnerHomeStore((state) => state.setActiveTab);
  const setSeatLayoutContext = usePartnerHomeStore((state) => state.setSeatLayoutContext);

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

  const handleViewSeatLayout = (screen: PartnerScreen) => {
    setSeatLayoutContext({
      cinemaId: screen.cinemaId,
      cinemaName: screen.cinemaName,
      screenId: screen.screenId,
      screenName: screen.screenName,
    });
    setIsDetailOpen(false);
    setActiveTab("seating-chart");
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
                onViewSeatLayout={handleViewSeatLayout}
              />

              {filteredScreens.length === 0 && !screensLoading && !screenErrorMessage && (
                <div className="flex flex-col items-center justify-center gap-4 rounded-xl border border-dashed border-[#27272a] bg-[#151518] p-10 text-center text-[#f5f5f5]/80 shadow-lg shadow-black/30">
                  <MonitorPlay className="size-12 text-[#ff7a45]" />
                  <div className="space-y-2">
                    <h3 className="text-lg font-semibold text-[#f5f5f5]">
                      Rạp này chưa có phòng chiếu nào
                    </h3>
                    <p className="text-sm text-[#9e9ea2]">
                      Hãy tạo phòng chiếu mới để bắt đầu quản lý lịch chiếu và sơ đồ ghế cho rạp.
                    </p>
                  </div>
                  <div className="flex flex-col gap-2 sm:flex-row">
                    <Button onClick={handleCreateClick} className="bg-[#ff7a45] text-[#151518] transition hover:bg-[#ff8d60]">
                      Tạo phòng chiếu đầu tiên
                    </Button>
                    <Button
                      variant="outline"
                      onClick={() => setActiveTab("seating-chart")}
                      className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a]"
                    >
                      Đến trang sơ đồ ghế
                    </Button>
                  </div>
                </div>
              )}
            </>
          ) : (
            <div className="flex h-full min-h-[320px] flex-col items-center justify-center gap-3 rounded-xl border border-dashed border-[#27272a] bg-[#151518] p-8 text-center text-[#9e9ea2] shadow-lg shadow-black/30">
              <MonitorPlay className="size-10 text-[#ff7a45]" />
              <div>
                <p className="text-lg font-semibold text-[#f5f5f5]">
                  Chọn một rạp để bắt đầu quản lý phòng chiếu
                </p>
                <p className="mt-2 text-sm text-[#9e9ea2]">
                  Danh sách phòng sẽ hiển thị sau khi bạn chọn rạp thuộc quyền quản lý của mình.
                </p>
              </div>
              <Button
                variant="outline"
                className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a]"
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
        onViewSeatLayout={handleViewSeatLayout}
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
