"use client";

import { useCallback, useEffect, useMemo, useState } from "react";
import {
  type CreateVoucherRequest,
  type ManagerVoucherApiError,
  type SendVoucherToAllUsersRequest,
  type SendVoucherToSpecificUsersRequest,
  type VoucherSortBy,
  type VoucherSummary,
  type VoucherStatusFilter,
  useCreateVoucher,
  useDeleteVoucher,
  useGetVoucherById,
  useGetVoucherEmailHistory,
  useGetVouchers,
  useSendVoucherToAllUsers,
  useSendVoucherToSpecificUsers,
  useToggleVoucherStatus,
  useUpdateVoucher,
} from "@/apis/manager.voucher.api";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { usePermissions } from "@/hooks/usePermissions";
import { Loader2 } from "lucide-react";
import VoucherFilters, { type VoucherFilterState } from "./VoucherFilters";
import VoucherTable from "./VoucherTable";
import VoucherFormModal from "./VoucherFormModal";
import VoucherDetailModal from "./VoucherDetailModal";
import VoucherConfirmDeleteModal from "./VoucherConfirmDeleteModal";
import VoucherSendAllModal from "./VoucherSendAllModal";
import VoucherSendSpecificModal from "./VoucherSendSpecificModal";
import VoucherEmailHistoryModal from "./VoucherEmailHistoryModal";

const DEFAULT_FILTERS: VoucherFilterState = {
  search: "",
  status: "all",
  sortBy: "createdat",
  sortOrder: "desc",
  limit: 10,
};

const VoucherManagement = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const { canCreate, canUpdate, canDelete, canSend } = usePermissions();

  const token = accessToken ?? undefined;

  // Check voucher permissions
  const canCreateVoucher = canCreate('VOUCHER');
  const canUpdateVoucher = canUpdate('VOUCHER');
  const canDeleteVoucher = canDelete('VOUCHER');
  const canSendVoucher = canSend('VOUCHER');

  const [filters, setFilters] = useState<VoucherFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [isFormOpen, setIsFormOpen] = useState(false);
  const [formMode, setFormMode] = useState<"create" | "edit">("create");
  const [editingVoucherId, setEditingVoucherId] = useState<number | null>(null);

  const [viewVoucherId, setViewVoucherId] = useState<number | null>(null);
  const [deleteVoucherId, setDeleteVoucherId] = useState<number | null>(null);

  const [sendAllVoucherId, setSendAllVoucherId] = useState<number | null>(null);
  const [sendSpecificVoucherId, setSendSpecificVoucherId] = useState<number | null>(null);

  const [emailHistoryVoucherId, setEmailHistoryVoucherId] = useState<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  const queryParams = useMemo(() => {
    return {
      page,
      limit: filters.limit,
      search: debouncedSearch || undefined,
      status: filters.status === "all" ? undefined : (filters.status as VoucherStatusFilter),
      sortBy: filters.sortBy as VoucherSortBy,
      sortOrder: filters.sortOrder,
    };
  }, [page, filters.limit, filters.status, filters.sortBy, filters.sortOrder, debouncedSearch]);

  const {
    data,
    isLoading,
    isFetching,
    isError,
    error,
    refetch,
  } = useGetVouchers(queryParams, token);

  const vouchers: VoucherSummary[] = Array.isArray(data?.result?.vouchers)
    ? data?.result?.vouchers
    : [];

  const pagination = data?.result?.pagination;

  useEffect(() => {
    if (isError) {
      const apiError = error as ManagerVoucherApiError | undefined;
      showToast(apiError?.message || "Không thể tải danh sách voucher", undefined, "error");
    }
  }, [isError, error, showToast]);

  const createVoucherMutation = useCreateVoucher();
  const updateVoucherMutation = useUpdateVoucher();
  const deleteVoucherMutation = useDeleteVoucher();
  const toggleStatusMutation = useToggleVoucherStatus();
  const sendAllMutation = useSendVoucherToAllUsers();
  const sendSpecificMutation = useSendVoucherToSpecificUsers();

  const detailVoucherId = viewVoucherId ?? undefined;
  const editingVoucherQueryId = formMode === "edit" && editingVoucherId ? editingVoucherId : undefined;
  const emailHistoryQueryId = emailHistoryVoucherId ?? undefined;

  const {
    data: voucherDetail,
    isLoading: isVoucherDetailLoading,
  } = useGetVoucherById(detailVoucherId, token);

  const {
    data: editingVoucher,
    isLoading: isEditingVoucherLoading,
  } = useGetVoucherById(editingVoucherQueryId, token);

  const {
    data: emailHistoryData,
    isLoading: isEmailHistoryLoading,
  } = useGetVoucherEmailHistory(emailHistoryQueryId, token);

  const resetFormState = useCallback(() => {
    setIsFormOpen(false);
    setEditingVoucherId(null);
    setFormMode("create");
  }, []);

  const handleOpenCreateForm = useCallback(() => {
    setFormMode("create");
    setEditingVoucherId(null);
    setIsFormOpen(true);
  }, []);

  const handleUpdateFilters = useCallback((partial: Partial<VoucherFilterState>) => {
    setFilters((prev: VoucherFilterState) => ({ ...prev, ...partial }));
    setPage(1);
  }, []);

  const handleCreateVoucher = (payload: CreateVoucherRequest) => {
    return new Promise<void>((resolve, reject) => {
      if (!accessToken) {
        showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
        reject(new Error("Thiếu accessToken"));
        return;
      }

      createVoucherMutation.mutate(
        { data: payload, accessToken },
        {
          onSuccess: () => {
            showToast("Tạo voucher thành công", undefined, "success");
            resetFormState();
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerVoucherApiError | undefined;
            showToast(apiError?.message || "Tạo voucher thất bại", undefined, "error");
            reject(err as Error);
          },
        },
      );
    });
  };

  const handleUpdateVoucher = (voucherId: number, payload: CreateVoucherRequest) => {
    return new Promise<void>((resolve, reject) => {
      if (!accessToken) {
        showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
        reject(new Error("Thiếu accessToken"));
        return;
      }

      updateVoucherMutation.mutate(
        { voucherId, data: payload, accessToken },
        {
          onSuccess: () => {
            showToast("Cập nhật voucher thành công", undefined, "success");
            resetFormState();
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerVoucherApiError | undefined;
            showToast(apiError?.message || "Cập nhật voucher thất bại", undefined, "error");
            reject(err as Error);
          },
        },
      );
    });
  };

  const handleDeleteVoucher = () => {
    if (!deleteVoucherId) return;
    if (!accessToken) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
      return;
    }

    deleteVoucherMutation.mutate(
      { voucherId: deleteVoucherId, accessToken },
      {
        onSuccess: () => {
          showToast("Xoá voucher thành công", undefined, "success");
          setDeleteVoucherId(null);
        },
        onError: (err) => {
          const apiError = err as ManagerVoucherApiError | undefined;
          showToast(apiError?.message || "Xoá voucher thất bại", undefined, "error");
        },
      },
    );
  };

  const handleToggleStatus = (voucherId: number) => {
    if (!accessToken) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
      return;
    }

    toggleStatusMutation.mutate(
      { voucherId, accessToken },
      {
        onSuccess: () => {
          showToast("Thay đổi trạng thái thành công", undefined, "success");
        },
        onError: (err) => {
          const apiError = err as ManagerVoucherApiError | undefined;
          showToast(apiError?.message || "Thay đổi trạng thái thất bại", undefined, "error");
        },
      },
    );
  };

  const handleSendToAll = (voucherId: number, payload: SendVoucherToAllUsersRequest) => {
    return new Promise<void>((resolve, reject) => {
      if (!accessToken) {
        showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
        reject(new Error("Thiếu accessToken"));
        return;
      }

      sendAllMutation.mutate(
        { voucherId, data: payload, accessToken },
        {
          onSuccess: (res) => {
            showToast(res.message || "Đã gửi voucher", undefined, "success");
            setSendAllVoucherId(null);
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerVoucherApiError | undefined;
            showToast(apiError?.message || "Gửi voucher thất bại", undefined, "error");
            reject(err as Error);
          },
        },
      );
    });
  };

  const handleSendToSpecific = (
    voucherId: number,
    payload: SendVoucherToSpecificUsersRequest,
  ) => {
    return new Promise<void>((resolve, reject) => {
      if (!accessToken) {
        showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
        reject(new Error("Thiếu accessToken"));
        return;
      }

      sendSpecificMutation.mutate(
        { voucherId, data: payload, accessToken },
        {
          onSuccess: (res) => {
            showToast(res.message || "Đã gửi voucher", undefined, "success");
            setSendSpecificVoucherId(null);
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerVoucherApiError | undefined;
            showToast(apiError?.message || "Gửi voucher thất bại", undefined, "error");
            reject(err as Error);
          },
        },
      );
    });
  };

  const isMutating =
    createVoucherMutation.isPending ||
    updateVoucherMutation.isPending ||
    deleteVoucherMutation.isPending ||
    toggleStatusMutation.isPending ||
    sendAllMutation.isPending ||
    sendSpecificMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Quản lý voucher</h2>
            <p className="mt-2 text-sm text-gray-300">
              Theo dõi, tạo mới, chỉnh sửa và gửi voucher đến người dùng.
            </p>
          </div>
          <VoucherFilters
            filters={filters}
            onChange={handleUpdateFilters}
            isRefreshing={isFetching}
            onRefresh={refetch}
            onCreate={handleOpenCreateForm}
            canCreate={canCreateVoucher}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        <VoucherTable
          vouchers={vouchers}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          page={page}
          onPageChange={(nextPage: number) => setPage(nextPage)}
          limit={filters.limit}
          onChangeLimit={(value: number) => handleUpdateFilters({ limit: value })}
          onView={(voucherId: number) => setViewVoucherId(voucherId)}
          onEdit={(voucherId: number) => {
            setFormMode("edit");
            setEditingVoucherId(voucherId);
            setIsFormOpen(true);
          }}
          onDelete={(voucherId: number) => setDeleteVoucherId(voucherId)}
          onToggleStatus={handleToggleStatus}
          onSendAll={(voucherId: number) => setSendAllVoucherId(voucherId)}
          onSendSpecific={(voucherId: number) => setSendSpecificVoucherId(voucherId)}
          onViewEmailHistory={(voucherId: number) => setEmailHistoryVoucherId(voucherId)}
          canEdit={canUpdateVoucher}
          canDelete={canDeleteVoucher}
          canSend={canSendVoucher}
        />
      </div>

      {isMutating && (
        <div className="fixed inset-0 z-20 flex items-end justify-end p-6">
          <div className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs text-white">
            <Loader2 className="h-4 w-4 animate-spin" />
            Đang xử lý yêu cầu...
          </div>
        </div>
      )}

      {isFormOpen && (
        <VoucherFormModal
          open={isFormOpen}
          mode={formMode}
          onClose={resetFormState}
          onSubmit={(payload: CreateVoucherRequest) =>
            formMode === "edit" && editingVoucherId
              ? handleUpdateVoucher(editingVoucherId, payload)
              : handleCreateVoucher(payload)
          }
          isLoading={createVoucherMutation.isPending || updateVoucherMutation.isPending}
          voucher={formMode === "edit" ? editingVoucher?.result : undefined}
          isVoucherLoading={formMode === "edit" && isEditingVoucherLoading}
        />
      )}

      {viewVoucherId !== null && (
        <VoucherDetailModal
          open={viewVoucherId !== null}
          voucher={voucherDetail?.result}
          isLoading={isVoucherDetailLoading}
          onClose={() => setViewVoucherId(null)}
        />
      )}

      {deleteVoucherId !== null && (
        <VoucherConfirmDeleteModal
          open={deleteVoucherId !== null}
          isProcessing={deleteVoucherMutation.isPending}
          onCancel={() => setDeleteVoucherId(null)}
          onConfirm={handleDeleteVoucher}
        />
      )}

      {sendAllVoucherId !== null && (
        <VoucherSendAllModal
          open={sendAllVoucherId !== null}
          isSubmitting={sendAllMutation.isPending}
          onClose={() => setSendAllVoucherId(null)}
          onSubmit={(payload: SendVoucherToAllUsersRequest) =>
            sendAllVoucherId !== null ? handleSendToAll(sendAllVoucherId, payload) : Promise.resolve()
          }
        />
      )}

      {sendSpecificVoucherId !== null && (
        <VoucherSendSpecificModal
          open={sendSpecificVoucherId !== null}
          isSubmitting={sendSpecificMutation.isPending}
          voucherData={vouchers.find(v => v.voucherId === sendSpecificVoucherId) || null}
          onClose={() => setSendSpecificVoucherId(null)}
          onSubmit={(payload: SendVoucherToSpecificUsersRequest) =>
            sendSpecificVoucherId !== null
              ? handleSendToSpecific(sendSpecificVoucherId, payload)
              : Promise.resolve()
          }
        />
      )}

      {emailHistoryVoucherId !== null && (
        <VoucherEmailHistoryModal
          open={emailHistoryVoucherId !== null}
          isLoading={isEmailHistoryLoading}
          history={emailHistoryData?.result || []}
          onClose={() => setEmailHistoryVoucherId(null)}
        />
      )}
    </div>
  );
};

export default VoucherManagement;
