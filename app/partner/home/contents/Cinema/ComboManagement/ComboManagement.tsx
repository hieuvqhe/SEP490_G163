"use client";

import { useCallback, useMemo, useState } from "react";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";
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
import { Button } from "@/components/ui/button";
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
import { Info } from "lucide-react";

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

  const handleStartGuide = useCallback(() => {
    const hasCombos = combos.length > 0;
    const steps = [
      {
        element: "#combo-tour-page",
        popover: {
          title: "Quản lý combo bắp nước",
          description:
            "Tab này cho phép bạn tạo, chỉnh sửa và theo dõi các combo phục vụ kênh bán vé, bao gồm giá, mô tả và trạng thái kinh doanh.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#combo-tour-summary",
        popover: {
          title: "Tổng quan & hướng dẫn",
          description:
            "Bảng tóm tắt giúp bạn nắm nhanh mục đích của trang. Nhấn \"Hướng dẫn\" bất cứ lúc nào để chạy lại tour từng bước.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#combo-tour-toolbar",
        popover: {
          title: "Bộ lọc & thao tác",
          description:
            "Tại đây bạn tìm kiếm theo tên/mã, lọc theo trạng thái, đặt lại bộ lọc, làm mới dữ liệu hoặc mở biểu mẫu tạo combo mới.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#combo-tour-filters",
        popover: {
          title: "Tìm kiếm nhanh",
          description:
            "Nhập từ khoá hoặc chọn trạng thái để thu hẹp danh sách combo. Mọi thay đổi sẽ áp dụng tức thì.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#combo-tour-toolbar-actions",
        popover: {
          title: "Các nút thao tác",
          description:
            "Đặt lại bộ lọc về mặc định, làm mới dữ liệu mới nhất hoặc bấm \"Tạo combo mới\" để mở biểu mẫu khởi tạo.",
          side: "left" as const,
          align: "center" as const,
        },
      },
      {
        element: "#combo-tour-table",
        popover: {
          title: "Danh sách combo",
          description:
            "Theo dõi toàn bộ combo đang quản lý cùng mã, mô tả, giá bán, thời gian cập nhật và trạng thái kinh doanh.",
          side: "top" as const,
          align: "start" as const,
        },
      },
    ];

    if (hasCombos) {
      steps.push(
        {
          element: "#combo-tour-table-sort",
          popover: {
            title: "Sắp xếp linh hoạt",
            description: "Nhấn tiêu đề cột có biểu tượng mũi tên để sắp xếp theo giá, ngày tạo hoặc cập nhật.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: "#combo-tour-row",
          popover: {
            title: "Chi tiết từng combo",
            description: "Mỗi hàng hiển thị tên, mã, mô tả rút gọn, giá và trạng thái giúp bạn đánh giá nhanh.",
            side: "bottom" as const,
            align: "start" as const,
          },
        },
        {
          element: "#combo-tour-row-actions",
          popover: {
            title: "Thao tác nhanh",
            description: "Xem chi tiết, chỉnh sửa hoặc xoá combo ngay tại đây. Các nút có biểu tượng trực quan.",
            side: "left" as const,
            align: "center" as const,
          },
        }
      );
    } else {
      steps.push({
        element: "#combo-tour-empty",
        popover: {
          title: "Chưa có combo phù hợp",
          description: "Khi bộ lọc không trả về kết quả, bạn sẽ thấy thông báo gợi ý điều chỉnh hoặc tạo combo mới.",
          side: "top" as const,
          align: "start" as const,
        },
      });
    }

    steps.push({
      element: "#combo-tour-pagination",
      popover: {
        title: "Điều hướng trang",
        description: "Sử dụng nút Trước/Sau để duyệt qua các trang combo và quan sát trạng thái tải dữ liệu.",
        side: "top" as const,
        align: "start" as const,
      },
    });

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, [combos.length]);

  return (
    <div className="space-y-6" id="combo-tour-page">
      <div className="flex flex-col gap-3 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40 sm:flex-row sm:items-center sm:justify-between" id="combo-tour-summary">
        <div className="flex items-start gap-3 text-[#f5f5f5]">
          <div className="rounded-full bg-[#ff7a45]/15 p-2 text-[#ff7a45]">
            <Info className="size-5" />
          </div>
          <div>
            <h2 className="text-lg font-semibold">Quản lý combo bắp nước</h2>
            <p className="text-sm text-[#9e9ea2]">
              Theo dõi danh mục combo, cập nhật giá và trạng thái bán nhằm đồng bộ trên hệ thống đối tác.
            </p>
          </div>
        </div>
        <Button
          variant="outline"
          size="sm"
          onClick={handleStartGuide}
          className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] transition hover:bg-[#27272a]"
          id="combo-tour-start-btn"
        >
          Hướng dẫn
        </Button>
      </div>

      <div className="space-y-4">
        <div id="combo-tour-toolbar">
          <ComboToolbar
            filters={filters}
            onFiltersChange={handleFiltersChange}
            onReset={handleResetFilters}
            onRefresh={() => refetch()}
            onCreate={handleCreateClick}
            isRefreshing={isRefreshing}
          />
        </div>

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
      </div>

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
