"use client";

import { useMemo, useState } from "react";
import {
  PartnerSeatType,
  PartnerSeatTypeApiError,
  useCreatePartnerSeatType,
  useDeletePartnerSeatType,
  useGetPartnerSeatTypeById,
  useGetPartnerSeatTypes,
  useUpdatePartnerSeatType,
  type GetPartnerSeatTypesParams,
} from "@/apis/partner.seat-type.api";
import { useToast } from "@/components/ToastProvider";
import {
  SeatTypeDeleteDialog,
  SeatTypeDetailModal,
  SeatTypeFormModal,
  SeatTypeTable,
  SeatTypeToolbar,
} from "./components";
import type { SeatTypeFilters, SeatTypeFormValues } from "./types";

const mapSortFieldToApi = (field: SeatTypeFilters["sortBy"]) => {
  switch (field) {
    case "createdAt":
      return "created_at";
    case "updatedAt":
      return "updated_at";
    default:
      return field;
  }
};

const DEFAULT_FILTERS: SeatTypeFilters = {
  search: "",
  code: "",
  minSurcharge: "",
  maxSurcharge: "",
  status: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
};

const DEFAULT_FORM_VALUES: SeatTypeFormValues = {
  code: "",
  name: "",
  surcharge: "",
  color: "",
  description: "",
};

const mapSeatTypeToFormValues = (seatType: Partial<PartnerSeatType> = {}): SeatTypeFormValues => ({
  code: seatType.code ?? "",
  name: seatType.name ?? "",
  surcharge: seatType.surcharge !== undefined ? String(seatType.surcharge) : "",
  color: seatType.color ?? "",
  description: seatType.description ?? "",
});

const parseSurcharge = (value: string): number => {
  const trimmed = value.trim();
  if (trimmed === "") return 0;
  const parsed = Number(trimmed);
  if (Number.isNaN(parsed) || parsed < 0) {
    throw new Error("Phụ thu không hợp lệ");
  }
  return parsed;
};

const mapFormToCreatePayload = (values: SeatTypeFormValues) => ({
  code: values.code.trim(),
  name: values.name.trim(),
  color: values.color.trim(),
  description: values.description.trim(),
  surcharge: parseSurcharge(values.surcharge),
});

const mapFormToUpdatePayload = (values: SeatTypeFormValues) => ({
  name: values.name.trim(),
  color: values.color.trim(),
  description: values.description.trim(),
  surcharge: parseSurcharge(values.surcharge),
});

const getErrorMessage = (error: unknown): string => {
  if (error instanceof PartnerSeatTypeApiError) {
    return error.message;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return "Đã xảy ra lỗi. Vui lòng thử lại sau.";
};

const SeatTypeManagement = () => {
  const { showToast } = useToast();

  const [filters, setFilters] = useState<SeatTypeFilters>(DEFAULT_FILTERS);
  const [pagination, setPagination] = useState<{ page: number; limit: number }>({ page: 1, limit: 10 });

  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formOpen, setFormOpen] = useState(false);
  const [formInitialValues, setFormInitialValues] = useState<SeatTypeFormValues>(DEFAULT_FORM_VALUES);
  const [editingId, setEditingId] = useState<number | null>(null);

  const [deleteOpen, setDeleteOpen] = useState(false);
  const [deletingSeatType, setDeletingSeatType] = useState<PartnerSeatType | null>(null);

  const [detailOpen, setDetailOpen] = useState(false);
  const [detailId, setDetailId] = useState<number | null>(null);

  const queryParams = useMemo<GetPartnerSeatTypesParams>(() => {
    const params: GetPartnerSeatTypesParams = {
      page: pagination.page,
      limit: pagination.limit,
      sortOrder: filters.sortOrder,
    };

    const sortField = mapSortFieldToApi(filters.sortBy);
    if (sortField) params.sortBy = sortField;

    const parsedSearch = filters.search.trim();
    const parsedCode = filters.code.trim();
    const parsedMin = filters.minSurcharge.trim();
    const parsedMax = filters.maxSurcharge.trim();

    if (parsedSearch !== "") params.search = parsedSearch;
    if (parsedCode !== "") params.code = parsedCode;
    if (parsedMin !== "") {
      const value = Number(parsedMin);
      if (!Number.isNaN(value) && value >= 0) params.minSurcharge = value;
    }
    if (parsedMax !== "") {
      const value = Number(parsedMax);
      if (!Number.isNaN(value) && value >= 0) params.maxSurcharge = value;
    }
    return params;
  }, [filters, pagination]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPartnerSeatTypes(queryParams);

  const detailQuery = useGetPartnerSeatTypeById(detailId ?? undefined);
  const createMutation = useCreatePartnerSeatType();
  const updateMutation = useUpdatePartnerSeatType();
  const deleteMutation = useDeletePartnerSeatType();

  const seatTypes = data?.result.seatTypes ?? [];
  const displaySeatTypes = useMemo(() => {
    if (filters.status === "all") return seatTypes;
    return seatTypes.filter((seatType) => seatType.status === (filters.status === "active"));
  }, [seatTypes, filters.status]);
  const paginationInfo = data?.result.pagination;
  const queryError = error as PartnerSeatTypeApiError | undefined;

  const handleFiltersChange = (partial: Partial<SeatTypeFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_FILTERS });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (sortBy: string) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: sortBy as SeatTypeFilters["sortBy"],
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
    setFormInitialValues({ ...DEFAULT_FORM_VALUES });
    setEditingId(null);
    setFormOpen(true);
  };

  const handleEditClick = (seatType: PartnerSeatType) => {
    setFormMode("edit");
    setEditingId(seatType.id);
    setFormInitialValues(mapSeatTypeToFormValues(seatType));
    setFormOpen(true);
  };

  const handleViewClick = (seatType: PartnerSeatType) => {
    setDetailId(seatType.id);
    setDetailOpen(true);
  };

  const handleDeleteClick = (seatType: PartnerSeatType) => {
    setDeletingSeatType(seatType);
    setDeleteOpen(true);
  };

  const handleFormSubmit = (values: SeatTypeFormValues) => {
    try {
      if (formMode === "create") {
        createMutation.mutate(mapFormToCreatePayload(values), {
          onSuccess: (response) => {
            showToast(response.message || "Tạo loại ghế thành công", undefined, "success");
            setFormOpen(false);
            setFormInitialValues({ ...DEFAULT_FORM_VALUES });
            setEditingId(null);
          },
          onError: (err) => {
            showToast(getErrorMessage(err), undefined, "error");
          },
        });
        return;
      }

      if (!editingId) {
        showToast("Không xác định được loại ghế cần cập nhật", undefined, "error");
        return;
      }

      updateMutation.mutate(
        { seatTypeId: editingId, payload: mapFormToUpdatePayload(values) },
        {
          onSuccess: (response) => {
            showToast(response.message || "Cập nhật loại ghế thành công", undefined, "success");
            setFormOpen(false);
            setEditingId(null);
            setFormInitialValues({ ...DEFAULT_FORM_VALUES });
          },
          onError: (err) => {
            showToast(getErrorMessage(err), undefined, "error");
          },
        }
      );
    } catch (err) {
      showToast(getErrorMessage(err), undefined, "error");
    }
  };

  const handleDeleteConfirm = () => {
    if (!deletingSeatType) return;
    deleteMutation.mutate(deletingSeatType.id, {
      onSuccess: (response) => {
        showToast(response.message || "Đã vô hiệu hoá loại ghế", undefined, "success");
        setDeleteOpen(false);
        setDeletingSeatType(null);
      },
      onError: (err) => {
        showToast(getErrorMessage(err), undefined, "error");
      },
    });
  };

  const handleFormClose = () => {
    setFormOpen(false);
    setEditingId(null);
    setFormInitialValues({ ...DEFAULT_FORM_VALUES });
  };

  const handleDetailClose = () => {
    setDetailOpen(false);
    setDetailId(null);
  };

  const handleDeleteClose = () => {
    setDeleteOpen(false);
    setDeletingSeatType(null);
  };

  const isRefreshing = isFetching && !isLoading;

  return (
    <div className="space-y-6">
      <SeatTypeToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        isRefreshing={isRefreshing}
        onCreate={handleCreateClick}
      />

      <SeatTypeTable
        seatTypes={displaySeatTypes}
        loading={isLoading}
        errorMessage={queryError?.message}
        pagination={paginationInfo}
        sortBy={filters.sortBy}
        sortOrder={filters.sortOrder}
        onSortChange={handleSortChange}
        onPageChange={handlePageChange}
        onView={handleViewClick}
        onEdit={handleEditClick}
        onDelete={handleDeleteClick}
      />

      <SeatTypeFormModal
        open={formOpen}
        mode={formMode}
        initialValues={formInitialValues}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <SeatTypeDetailModal
        open={detailOpen}
        onClose={handleDetailClose}
        seatType={detailQuery.data?.result ?? null}
        loading={detailQuery.isLoading}
      />

      <SeatTypeDeleteDialog
        open={deleteOpen}
        onClose={handleDeleteClose}
        seatTypeName={deletingSeatType?.name ?? ""}
        submitting={deleteMutation.isPending}
        onConfirm={handleDeleteConfirm}
      />
    </div>
  );
};

export default SeatTypeManagement;
