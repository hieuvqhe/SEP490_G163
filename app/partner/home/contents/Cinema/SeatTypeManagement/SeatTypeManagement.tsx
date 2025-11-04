"use client";

import { useMemo, useState } from "react";
import { AlertTriangle } from "lucide-react";
import { Button } from "@/components/ui/button";
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

const REQUIRED_SEAT_TYPES = [
  { display: "Ghế mẫu", normalized: "ghế mẫu", code: "DRAFT", color: "#d4d4d4", description: "Ghế tạo mẫu" },
  { display: "Không được chọn", normalized: "không được chọn", code: "DISABLE", color: "#27272A", description: "Tạo đường đi" },
] as const;

const normalizeSeatTypeName = (value?: string) => value?.trim().toLowerCase().normalize("NFC") ?? "";

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

  const missingRequiredSeatTypes = useMemo(() => {
    const normalizedSeatTypeNames = new Set(seatTypes.map((seatType) => normalizeSeatTypeName(seatType.name)));
    return REQUIRED_SEAT_TYPES.filter((required) => !normalizedSeatTypeNames.has(required.normalized));
  }, [seatTypes]);

  const shouldShowRequiredSeatTypeAlert = !isLoading && missingRequiredSeatTypes.length > 0;

  const formatMissingSeatTypeNames = () => {
    const names = missingRequiredSeatTypes.map((item) => `"${item.display}"`);
    if (names.length <= 1) return names[0] ?? "";
    return `${names.slice(0, -1).join(", ")} và ${names[names.length - 1]}`;
  };

  const handleCreateRequiredSeatType = (template: (typeof REQUIRED_SEAT_TYPES)[number]) => {
    setFormMode("create");
    setEditingId(null);
    setFormInitialValues({
      code: template.code,
      name: template.display,
      surcharge: "0",
      color: template.color,
      description: template.description,
    });
    setFormOpen(true);
  };

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
      {shouldShowRequiredSeatTypeAlert && (
        <div className="flex items-start gap-3 rounded-xl border border-amber-500/40 bg-amber-500/10 p-4 text-amber-100">
          <AlertTriangle className="mt-0.5 size-5 text-amber-400" />
          <div className="space-y-3">
            <p className="font-semibold">Cần tạo loại ghế bắt buộc</p>
            <p className="text-sm text-amber-100/90">
              Để tạo sơ đồ rạp, bạn cần có đủ hai loại ghế bắt buộc gồm {formatMissingSeatTypeNames()}. Vui lòng tạo các loại ghế này trong danh sách bên dưới.
            </p>
            <div className="space-y-2">
              {missingRequiredSeatTypes.map((item) => (
                <div
                  key={item.code}
                  className="flex items-centergap-3 rounded-lg border border-amber-400/40 bg-amber-500/5 p-3 text-sm text-amber-50/90 md:flex-row md:items-center md:justify-between"
                >
                  <div className="space-y-2 text-center md:text-center">
                    <p className="font-semibold text-amber-50">{item.display}</p>
                    <p>
                      Mã loại ghế: <span className="font-mono text-amber-100">{item.code}</span>
                    </p>
                    <div className="flex flex-col items-center gap-2 md:flex-row md:items-center">
                      <span>Màu đại diện:</span>
                      <span
                        className="inline-flex items-center gap-2 rounded-full border border-amber-400/40 px-2 py-1 font-mono text-xs"
                        style={{ backgroundColor: `${item.color}` }}
                      >
                        {item.color}
                      </span>
                    </div>
                    <p>Mô tả gợi ý: {item.description}</p>
                  </div>
                  <Button
                    size="sm"
                    className="bg-amber-400 text-[#151518] shadow hover:bg-amber-300"
                    onClick={() => handleCreateRequiredSeatType(item)}
                  >
                    Tạo nhanh loại ghế này
                  </Button>
                </div>
              ))}
            </div>
          </div>
        </div>
      )}

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
