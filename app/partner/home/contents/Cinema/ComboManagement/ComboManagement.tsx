"use client";

import { useMemo, useState } from "react";
import {
  PartnerCombo,
  PartnerComboApiError,
  PartnerCombosPagination,
  useCreatePartnerCombo,
  useDeletePartnerCombo,
  useGetPartnerComboById,
  useGetPartnerCombos,
  useUpdatePartnerCombo,
} from "@/apis/partner.combo.api";
import { useToast } from "@/components/ToastProvider";
import {
  ComboDeleteDialog,
  ComboDetailModal,
  ComboFormModal,
  ComboTable,
  ComboToolbar,
} from "./components";
import {
  DEFAULT_COMBO_FILTERS,
  DEFAULT_COMBO_FORM_VALUES,
} from "./constants";
import type { ComboFilters, ComboFormValues } from "./types";
import {
  getComboErrorMessage,
  mapComboToFormValues,
  mapFormValuesToCreatePayload,
  mapFormValuesToUpdatePayload,
  mapSortFieldToApi,
  mapStatusFilterToBoolean,
} from "./utils";

const ComboManagement = () => {
  const { showToast } = useToast();

  const [filters, setFilters] = useState<ComboFilters>({ ...DEFAULT_COMBO_FILTERS });
  const [pagination, setPagination] = useState<{ page: number; limit: number }>({ page: 1, limit: 10 });

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [formInitialValues, setFormInitialValues] = useState<ComboFormValues>({ ...DEFAULT_COMBO_FORM_VALUES });
  const [editingComboId, setEditingComboId] = useState<number | null>(null);

  const [isDetailOpen, setIsDetailOpen] = useState(false);
  const [detailComboId, setDetailComboId] = useState<number | null>(null);

  const [isDeleteOpen, setIsDeleteOpen] = useState(false);
  const [comboToDelete, setComboToDelete] = useState<PartnerCombo | null>(null);

  const queryParams = useMemo(() => {
    const params: Parameters<typeof useGetPartnerCombos>[0] = {
      page: pagination.page,
      limit: pagination.limit,
      sortOrder: filters.sortOrder,
    };

    const sortField = mapSortFieldToApi(filters.sortBy);
    if (sortField) params.sortBy = sortField;

    const status = mapStatusFilterToBoolean(filters.status);
    if (status !== undefined) params.isAvailable = status;

    const trimmedSearch = filters.search.trim();
    if (trimmedSearch) params.search = trimmedSearch;

    return params;
  }, [filters, pagination]);

  const {
    data,
    isLoading,
    isFetching,
    error,
    refetch,
  } = useGetPartnerCombos(queryParams);

  const combos = data?.result.services ?? [];
  const paginationInfo: PartnerCombosPagination | undefined = data?.result.pagination;
  const queryError = error as PartnerComboApiError | undefined;

  const detailQuery = useGetPartnerComboById(detailComboId ?? undefined);
  const createMutation = useCreatePartnerCombo();
  const updateMutation = useUpdatePartnerCombo();
  const deleteMutation = useDeletePartnerCombo();

  const handleFiltersChange = (partial: Partial<ComboFilters>) => {
    setFilters((prev) => ({ ...prev, ...partial }));
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleResetFilters = () => {
    setFilters({ ...DEFAULT_COMBO_FILTERS });
    setPagination((prev) => ({ ...prev, page: 1 }));
  };

  const handleSortChange = (field: ComboFilters["sortBy"]) => {
    setFilters((prev) => ({
      ...prev,
      sortBy: field,
      sortOrder: prev.sortBy === field && prev.sortOrder === "asc" ? "desc" : "asc",
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
    setFormInitialValues({ ...DEFAULT_COMBO_FORM_VALUES });
    setEditingComboId(null);
    setIsFormOpen(true);
  };

  const handleEditClick = (combo: PartnerCombo) => {
    setFormMode("edit");
    setEditingComboId(combo.serviceId);
    setFormInitialValues(mapComboToFormValues(combo));
    setIsFormOpen(true);
  };

  const handleViewClick = (combo: PartnerCombo) => {
    setDetailComboId(combo.serviceId);
    setIsDetailOpen(true);
  };

  const handleDeleteClick = (combo: PartnerCombo) => {
    setComboToDelete(combo);
    setIsDeleteOpen(true);
  };

  const handleFormSubmit = (values: ComboFormValues) => {
    try {
      if (formMode === "create") {
        const payload = mapFormValuesToCreatePayload(values);
        createMutation.mutate(payload, {
          onSuccess: (response) => {
            showToast(response?.message || "Tạo combo thành công", undefined, "success");
            setIsFormOpen(false);
            setFormInitialValues({ ...DEFAULT_COMBO_FORM_VALUES });
            setEditingComboId(null);
          },
          onError: (err) => {
            showToast(getComboErrorMessage(err), undefined, "error");
          },
        });
        return;
      }

      if (!editingComboId) {
        showToast("Không xác định được combo cần cập nhật", undefined, "error");
        return;
      }

      const payload = mapFormValuesToUpdatePayload(values);
      updateMutation.mutate(
        { serviceId: editingComboId, payload },
        {
          onSuccess: (response) => {
            showToast(response?.message || "Cập nhật combo thành công", undefined, "success");
            setIsFormOpen(false);
            setEditingComboId(null);
          },
          onError: (err) => {
            showToast(getComboErrorMessage(err), undefined, "error");
          },
        }
      );
    } catch (err) {
      showToast(getComboErrorMessage(err), undefined, "error");
    }
  };

  const handleDeleteConfirm = () => {
    if (!comboToDelete) return;

    deleteMutation.mutate(comboToDelete.serviceId, {
      onSuccess: (response) => {
        showToast(response?.message || "Đã xoá combo", undefined, "success");
        setIsDeleteOpen(false);
        setComboToDelete(null);
      },
      onError: (err) => {
        showToast(getComboErrorMessage(err), undefined, "error");
      },
    });
  };

  const handleFormClose = () => {
    setIsFormOpen(false);
    setEditingComboId(null);
    setFormInitialValues({ ...DEFAULT_COMBO_FORM_VALUES });
  };

  const handleDetailClose = () => {
    setIsDetailOpen(false);
    setDetailComboId(null);
  };

  const handleDeleteClose = () => {
    setIsDeleteOpen(false);
    setComboToDelete(null);
  };

  const isRefreshing = isFetching && !isLoading;

  return (
    <div className="space-y-6">
      <ComboToolbar
        filters={filters}
        onFiltersChange={handleFiltersChange}
        onReset={handleResetFilters}
        onRefresh={() => refetch()}
        onCreate={handleCreateClick}
        isRefreshing={isRefreshing}
      />

      <ComboTable
        combos={combos}
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

      <ComboFormModal
        open={isFormOpen}
        mode={formMode}
        initialValues={formInitialValues}
        onClose={handleFormClose}
        onSubmit={handleFormSubmit}
        submitting={createMutation.isPending || updateMutation.isPending}
      />

      <ComboDetailModal
        open={isDetailOpen}
        onClose={handleDetailClose}
        combo={detailQuery.data?.result ?? null}
        loading={detailQuery.isLoading}
      />

      <ComboDeleteDialog
        open={isDeleteOpen}
        onClose={handleDeleteClose}
        comboName={comboToDelete?.name ?? ""}
        onConfirm={handleDeleteConfirm}
        submitting={deleteMutation.isPending}
      />
    </div>
  );
};

export default ComboManagement;
