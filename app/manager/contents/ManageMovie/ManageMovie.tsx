"use client";

import { useEffect, useMemo, useRef, useState } from "react";
import {
  type GetMovieSubmissionsParams,
  type ManagerMovieApiError,
  type MovieSubmissionDetail,
  type MovieSubmissionSummary,
  useApproveMovieSubmission,
  useGetMovieSubmissionById,
  useGetMovieSubmissions,
  useRejectMovieSubmission,
} from "@/apis/manager.movie.api";
import MovieFilters, { type MovieFilterState } from "./MovieFilters";
import MovieTable from "./MovieTable";
import MovieDetailModal from "./MovieDetailModal";
import MovieApproveConfirmModal from "./MovieApproveConfirmModal";
import MovieRejectModal from "./MovieRejectModal";
import { useToast } from "@/components/ToastProvider";
import { useAuthStore } from "@/store/authStore";

const DEFAULT_FILTERS: MovieFilterState = {
  search: "",
  status: "all",
  sortBy: "createdAt",
  sortOrder: "desc",
  limit: 10,
};

const ManageMovie = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const token = accessToken ?? undefined;

  const [filters, setFilters] = useState<MovieFilterState>(DEFAULT_FILTERS);
  const [page, setPage] = useState(1);
  const [debouncedSearch, setDebouncedSearch] = useState("");

  const [viewSubmissionId, setViewSubmissionId] = useState<number | null>(null);
  const [approveSubmissionId, setApproveSubmissionId] = useState<number | null>(null);
  const [rejectSubmissionId, setRejectSubmissionId] = useState<number | null>(null);

  useEffect(() => {
    const timeout = setTimeout(() => {
      setDebouncedSearch(filters.search.trim());
    }, 350);

    return () => clearTimeout(timeout);
  }, [filters.search]);

  const queryParams = useMemo<GetMovieSubmissionsParams>(() => {
    return {
      page,
      limit: filters.limit,
      search: debouncedSearch || undefined,
      status: filters.status === "all" ? undefined : filters.status,
      sortBy: filters.sortBy,
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
  } = useGetMovieSubmissions(queryParams, token);

  const lastErrorMessageRef = useRef<string | undefined>(undefined);

  useEffect(() => {
    if (!isError) {
      lastErrorMessageRef.current = undefined;
      return;
    }

    const apiError = error as ManagerMovieApiError | undefined;
    const message = apiError?.message || "Không thể tải danh sách submission";

    if (lastErrorMessageRef.current === message) {
      return;
    }

    lastErrorMessageRef.current = message;
    showToast(message, undefined, "error");
  }, [isError, error, showToast]);

  const submissions: MovieSubmissionSummary[] = Array.isArray(data?.result?.submissions)
    ? data?.result?.submissions
    : [];
  const pagination = data?.result?.pagination;

  const detailSubmissionId = viewSubmissionId ?? undefined;
  const {
    data: submissionDetail,
    isLoading: isDetailLoading,
  } = useGetMovieSubmissionById(detailSubmissionId, token);

  const approveMutation = useApproveMovieSubmission();
  const rejectMutation = useRejectMovieSubmission();

  const handleUpdateFilters = (partial: Partial<MovieFilterState>) => {
    setFilters((previous) => ({ ...previous, ...partial }));
    setPage(1);
  };

  const handleOpenApprove = (submissionId: number) => {
    setApproveSubmissionId(submissionId);
  };

  const handleOpenReject = (submissionId: number) => {
    setRejectSubmissionId(submissionId);
  };

  const handleApproveSubmission = () => {
    if (!accessToken || approveSubmissionId === null) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      approveMutation.mutate(
        { movieSubmissionId: approveSubmissionId, accessToken },
        {
          onSuccess: (response) => {
            showToast(response.message || "Duyệt submission thành công", undefined, "success");
            setApproveSubmissionId(null);
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerMovieApiError | undefined;
            showToast(apiError?.message || "Duyệt submission thất bại", undefined, "error");
            reject(err as Error);
          },
        },
      );
    });
  };

  const handleRejectSubmission = (reason: string) => {
    if (!accessToken || rejectSubmissionId === null) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tiếp tục", "error");
      return Promise.resolve();
    }

    return new Promise<void>((resolve, reject) => {
      rejectMutation.mutate(
        { movieSubmissionId: rejectSubmissionId, data: { reason }, accessToken },
        {
          onSuccess: (response) => {
            showToast(response.message || "Từ chối submission thành công", undefined, "success");
            setRejectSubmissionId(null);
            resolve();
          },
          onError: (err) => {
            const apiError = err as ManagerMovieApiError | undefined;
            showToast(apiError?.message || "Từ chối submission thất bại", undefined, "error");
            reject(err as Error);
          },
        },
      );
    });
  };

  const isMutating = approveMutation.isPending || rejectMutation.isPending;

  return (
    <div className="space-y-6">
      <div className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white">
        <div className="flex flex-col gap-4 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Quản lý submissions phim</h2>
            <p className="mt-2 text-sm text-gray-300">
              Theo dõi và xử lý các submission phim từ đối tác.
            </p>
          </div>
          <MovieFilters
            filters={filters}
            onChange={handleUpdateFilters}
            isRefreshing={isFetching}
            onRefresh={() => {
              void refetch();
            }}
          />
        </div>
      </div>

      <div className="rounded-2xl border border-white/10 bg-white/5">
        <MovieTable
          submissions={submissions}
          isLoading={isLoading}
          isFetching={isFetching}
          pagination={pagination}
          page={page}
          onPageChange={setPage}
          limit={filters.limit}
          onChangeLimit={(value) => handleUpdateFilters({ limit: value })}
          onView={(submissionId) => setViewSubmissionId(submissionId)}
          onApprove={handleOpenApprove}
          onReject={handleOpenReject}
          disableActions={isMutating}
        />
      </div>

      {isMutating && (
        <div className="fixed inset-0 z-20 flex items-end justify-end p-6">
          <div className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-xs text-white">
            Đang xử lý yêu cầu...
          </div>
        </div>
      )}

      <MovieDetailModal
        open={viewSubmissionId !== null}
        submission={submissionDetail?.result as MovieSubmissionDetail | undefined}
        isLoading={isDetailLoading}
        onClose={() => setViewSubmissionId(null)}
      />

      <MovieApproveConfirmModal
        open={approveSubmissionId !== null}
        onClose={() => setApproveSubmissionId(null)}
        onConfirm={handleApproveSubmission}
        isSubmitting={approveMutation.isPending}
      />

      <MovieRejectModal
        open={rejectSubmissionId !== null}
        onClose={() => setRejectSubmissionId(null)}
        onSubmit={handleRejectSubmission}
        isSubmitting={rejectMutation.isPending}
      />
    </div>
  );
};

export default ManageMovie;
