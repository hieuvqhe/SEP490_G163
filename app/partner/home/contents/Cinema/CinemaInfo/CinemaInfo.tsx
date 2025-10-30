"use client";

import { useMemo, useState } from "react";
import {
  PartnerCinema,
  PartnerCinemaApiError,
  PartnerCinemasPagination,
  useCreatePartnerCinema,
  useDeletePartnerCinema,
  useGetPartnerCinemaById,
  useGetPartnerCinemas,
  useUpdatePartnerCinema,
} from "@/apis/partner.cinema.api";
import { useToast } from "@/components/ToastProvider";
import {
  CinemaDeleteDialog,
  CinemaDetailModal,
  CinemaFormModal,
  CinemaTable,
  CinemaToolbar,
} from "./components";
import type { CinemaFilters, CinemaFormValues, CinemaLike } from "./types";

const defaultFilters: CinemaFilters = {
  search: "",
  city: "",
  district: "",
  status: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const defaultFormValues: CinemaFormValues = {
  cinemaName: "",
  address: "",
  phone: "",
  code: "",
  city: "",
  district: "",
  latitude: "",
  longitude: "",
  email: "",
  isActive: true,
  logoUrl: "",
  totalScreens: "",
  activeScreens: "",
};

const mapCinemaToFormValues = (cinema: CinemaLike = {}): CinemaFormValues => ({
  cinemaName: cinema?.cinemaName ?? "",
  address: cinema?.address ?? "",
  phone: cinema?.phone ?? "",
  code: cinema?.code ?? "",
  city: cinema?.city ?? "",
  district: cinema?.district ?? "",
  latitude: cinema?.latitude !== undefined ? String(cinema.latitude) : "",
  longitude: cinema?.longitude !== undefined ? String(cinema.longitude) : "",
  email: cinema?.email ?? "",
  isActive: cinema?.isActive ?? true,
  logoUrl: cinema?.logoUrl ?? "",
  totalScreens: cinema?.totalScreens !== undefined ? String(cinema.totalScreens) : "",
  activeScreens: cinema?.activeScreens !== undefined ? String(cinema.activeScreens) : "",
});

const mapFormValuesToPayload = (values: CinemaFormValues) => {
  const parseRequiredNumber = (value: string, field: string) => {
    const parsed = parseFloat(value);
    if (Number.isNaN(parsed)) {
      throw new Error(`${field} không hợp lệ`);
    }
    return parsed;
  };

  const latitude = parseRequiredNumber(values.latitude, "Vĩ độ");
  const longitude = parseRequiredNumber(values.longitude, "Kinh độ");

  const toOptionalNumber = (text: string | undefined) => {
    if (!text) return undefined;
    const trimmed = text.trim();
    if (trimmed === "") return undefined;
    const parsed = parseInt(trimmed, 10);
    if (Number.isNaN(parsed)) {
      throw new Error("Giá trị số không hợp lệ");
    }
    return parsed;
  };

  const totalScreens = toOptionalNumber(values.totalScreens);
  const activeScreens = toOptionalNumber(values.activeScreens);

  if (totalScreens !== undefined && activeScreens !== undefined && activeScreens > totalScreens) {
    throw new Error("Số phòng chiếu đang hoạt động không thể lớn hơn tổng số phòng chiếu");
  }

  const trimmedLogo = values.logoUrl.trim();

  return {
    cinemaName: values.cinemaName.trim(),
    address: values.address.trim(),
    phone: values.phone.trim(),
    code: values.code.trim(),
    city: values.city.trim(),
    district: values.district.trim(),
    latitude,
    longitude,
    email: values.email.trim(),
    isActive: values.isActive,
    logoUrl: trimmedLogo || undefined,
    totalScreens,
    activeScreens,
  };
};

const getErrorMessage = (error: unknown): string => {
  if (error instanceof PartnerCinemaApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};

const CinemaInfo = () => {
  const { showToast } = useToast();
  const [filters, setFilters] = useState<CinemaFilters>(defaultFilters);
  const [pagination, setPagination] = useState<{ page: number; limit: number }>({ page: 1, limit: 10 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formInitialValues, setFormInitialValues] = useState<CinemaFormValues>(defaultFormValues);
  const [editingCinemaId, setEditingCinemaId] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [cinemaToDelete, setCinemaToDelete] = useState<PartnerCinema | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailCinemaId, setDetailCinemaId] = useState<number | null>(null);

  const queryParams = useMemo(() => ({
    page: pagination.page,
    limit: pagination.limit,
    search: filters.search.trim() || undefined,
    city: filters.city.trim() || undefined,
    district: filters.district.trim() || undefined,
    isActive: filters.status === "all" ? undefined : filters.status === "active",
    sortBy: filters.sortBy || undefined,
    sortOrder: filters.sortOrder,
  }), [filters, pagination]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPartnerCinemas(queryParams);

  const detailQuery = useGetPartnerCinemaById(detailCinemaId ?? undefined);

  const createMutation = useCreatePartnerCinema();
  const updateMutation = useUpdatePartnerCinema();
  const deleteMutation = useDeletePartnerCinema();

  const cinemas = data?.result.cinemas ?? [];
  const paginationInfo: PartnerCinemasPagination | undefined = data?.result.pagination;
  const queryError = error as PartnerCinemaApiError | undefined;

  const handleFiltersChange = (partial: Partial<CinemaFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ ...defaultFilters });
    setPagination({ page: 1, limit: pagination.limit });
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy,
      sortOrder: prev.sortBy === sortBy && prev.sortOrder === "asc" ? "desc" : "asc",
    }));
  };

  const handlePageChange = (page: number) => {
    if (page < 1) return;
    const totalPages = paginationInfo?.totalPages ?? 1;
    if (page > totalPages) return;
    setPagination((prev) => ({ ...prev, page }));
  };

  const handleCreateClick = () => {
    setFormMode("create");
    setFormInitialValues({ ...defaultFormValues });
    setEditingCinemaId(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (cinema: PartnerCinema) => {
    setFormMode("edit");
    setEditingCinemaId(cinema.cinemaId);
    setFormInitialValues(mapCinemaToFormValues(cinema));
    setIsFormOpen(true);
  };

  const handleDetailClick = (cinema: PartnerCinema) => {
    setDetailCinemaId(cinema.cinemaId);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (cinema: PartnerCinema) => {
    setCinemaToDelete(cinema);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = async (values: CinemaFormValues) => {
    try {
      const payload = mapFormValuesToPayload(values);

      if (formMode === "create") {
        createMutation.mutate(payload, {
          onSuccess: () => {
            showToast("Tạo rạp chiếu thành công", undefined, "success");
            setIsFormOpen(false);
            setFormInitialValues({ ...defaultFormValues });
            setEditingCinemaId(null);
          },
          onError: (err) => {
            showToast(getErrorMessage(err), undefined, "error");
          },
        });
        return;
      }

      if (!editingCinemaId) {
        showToast("Không xác định được rạp cần cập nhật", undefined, "error");
        return;
      }

      updateMutation.mutate(
        { cinemaId: editingCinemaId, payload },
        {
          onSuccess: () => {
            showToast("Cập nhật rạp chiếu thành công", undefined, "success");
            setIsFormOpen(false);
            setEditingCinemaId(null);
            setFormInitialValues({ ...defaultFormValues });
          },
          onError: (err) => {
            showToast(getErrorMessage(err), undefined, "error");
          },
        },
      );
    } catch (err) {
      showToast(getErrorMessage(err), undefined, "error");
    }
  };

  const handleDeleteConfirm = () => {
    if (!cinemaToDelete) return;
    deleteMutation.mutate(cinemaToDelete.cinemaId, {
      onSuccess: () => {
        showToast("Đã xoá rạp chiếu", undefined, "success");
        setIsDeleteOpen(false);
        setCinemaToDelete(null);
      },
      onError: (err) => {
        showToast(getErrorMessage(err), undefined, "error");
      },
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingCinemaId(null);
    setFormInitialValues({ ...defaultFormValues });
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setDetailCinemaId(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setCinemaToDelete(null);
  };

  const isRefreshing = isFetching && !isLoading;

  return (
    <div className="space-y-6">
      <CinemaToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        isRefreshing={isRefreshing}
        onCreate={handleCreateClick}
      />

      <CinemaTable
        cinemas={cinemas}
        loading={isLoading}
        errorMessage={queryError?.message}
        pagination={paginationInfo}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onView={handleDetailClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <CinemaFormModal
        open={isFormOpen}
        mode={formMode}
        initialValues={formInitialValues}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <CinemaDetailModal
        open={isDetailOpen}
        onClose={handleDetailClose}
        cinema={detailQuery.data?.result ?? null}
        loading={detailQuery.isLoading}
      />

      <CinemaDeleteDialog
        open={isDeleteOpen}
        onClose={handleDeleteClose}
        cinemaName={cinemaToDelete?.cinemaName ?? ""}
        onConfirm={handleDeleteConfirm}
        submitting={deleteMutation.isPending}
      />
    </div>
  );
};

export default CinemaInfo;
