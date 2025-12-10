"use client";

import type { MovieSubmissionSummary, Pagination } from "@/apis/manager.movie.api";
import { useGetManagerStaffById } from "@/apis/manager.staff.api";
import { useAuthStore } from "@/store/authStore";
import clsx from "clsx";
import { Button } from "@/components/ui/button";
import { Eye, CheckCircle2, XCircle, Film, CalendarDays, UserSquare2 } from "lucide-react";

interface MovieTableProps {
  submissions: MovieSubmissionSummary[];
  isLoading: boolean;
  isFetching: boolean;
  pagination?: Pagination;
  page: number;
  onPageChange: (page: number) => void;
  limit: number;
  onChangeLimit: (limit: number) => void;
  onView: (submissionId: number) => void;
  onApprove: (submissionId: number) => void;
  onReject: (submissionId: number) => void;
  disableActions?: boolean;
}

const limitOptions = [5, 10, 20, 50];

const statusLabelMap: Record<MovieSubmissionSummary["status"], string> = {
  Pending: "Chờ duyệt",
  Resubmitted: "Cần duyệt lại",
  Approved: "Đã duyệt",
  Rejected: "Đã từ chối",
};

const statusClassMap: Record<MovieSubmissionSummary["status"], string> = {
  Pending: "border-amber-400/40 bg-amber-500/20 text-amber-200",
  Resubmitted: "border-blue-400/40 bg-blue-500/20 text-blue-200",
  Approved: "border-emerald-400/40 bg-emerald-500/20 text-emerald-200",
  Rejected: "border-red-400/40 bg-red-500/20 text-red-200",
};

const MovieTable = ({
  submissions,
  isLoading,
  isFetching,
  pagination,
  page,
  onPageChange,
  limit,
  onChangeLimit,
  onView,
  onApprove,
  onReject,
  disableActions,
}: MovieTableProps) => {
  const totalPages = pagination?.totalPages ?? 1;
  const totalCount = pagination?.totalCount ?? submissions.length;

  const handlePrevious = () => {
    if (page > 1) onPageChange(page - 1);
  };

  const handleNext = () => {
    if (totalPages && page < totalPages) {
      onPageChange(page + 1);
    }
  };

  return (
    <div className="overflow-hidden rounded-2xl">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-sm text-gray-200">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th className="px-6 py-3 text-left">Phim</th>
              <th className="px-6 py-3 text-left">Thể loại</th>
              <th className="px-6 py-3 text-left">Đối tác</th>
              <th className="px-6 py-3 text-left">Người phụ trách</th>
              <th className="px-6 py-3 text-left">Trạng thái</th>
              <th className="px-6 py-3 text-left">Ngày gửi</th>
              <th className="px-6 py-3 text-left">Ngày tạo</th>
              <th className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {isLoading ? (
              <tr>
                <td colSpan={8} className="px-6 py-10">
                  <div className="flex flex-col items-center justify-center gap-2 text-sm text-gray-200">
                    <Film className="h-5 w-5" />
                    Đang tải danh sách submission...
                  </div>
                </td>
              </tr>
            ) : submissions.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-6 py-10 text-center text-sm text-gray-300">
                  Không có submission nào phù hợp.
                </td>
              </tr>
            ) : (
              submissions.map((submission) => (
                <tr key={submission.movieSubmissionId} className="transition-colors hover:bg-white/10">
                  <td className="px-6 py-4 font-medium text-white">
                    <div className="flex flex-col gap-0.5">
                      <span>{submission.title}</span>
                      <span className="text-xs text-gray-400">ID: {submission.movieSubmissionId}</span>
                      <span className="text-xs text-gray-400">Đạo diễn: {submission.director || "-"}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">{submission.genre || "-"}</td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex flex-col text-xs text-gray-300">
                      <span>{submission.partner.partnerName}</span>
                      <span className="text-gray-400">#{submission.partner.partnerId}</span>
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <ManagerStaffCell managerStaffId={submission.managerStaff?.managerStaffId} />
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={clsx(
                        "inline-flex items-center gap-1 rounded-full border px-3 py-1 text-xs font-medium",
                        statusClassMap[submission.status],
                      )}
                    >
                      <StatusIcon status={submission.status} />
                      {statusLabelMap[submission.status]}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-2 text-xs">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      {formatDateTime(submission.submittedAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-gray-300">
                    <div className="flex items-center gap-2 text-xs">
                      <CalendarDays className="h-4 w-4 text-gray-400" />
                      {formatDateTime(submission.createdAt)}
                    </div>
                  </td>
                  <td className="px-6 py-4">
                    <div className="flex flex-wrap justify-end gap-2">
                      <Button
                        variant="ghost"
                        size="sm"
                        className="inline-flex items-center gap-1 text-gray-200 hover:text-white"
                        disabled={disableActions}
                        onClick={() => onView(submission.movieSubmissionId)}
                      >
                        <Eye className="h-4 w-4" />
                        Xem
                      </Button>
                      {submission.status === "Pending" && (
                        <>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex items-center gap-1 text-emerald-200 hover:text-emerald-100"
                            disabled={disableActions}
                            onClick={() => onApprove(submission.movieSubmissionId)}
                          >
                            <CheckCircle2 className="h-4 w-4" />
                            Duyệt
                          </Button>
                          <Button
                            variant="ghost"
                            size="sm"
                            className="inline-flex items-center gap-1 text-red-300 hover:text-red-200"
                            disabled={disableActions}
                            onClick={() => onReject(submission.movieSubmissionId)}
                          >
                            <XCircle className="h-4 w-4" />
                            Từ chối
                          </Button>
                        </>
                      )}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div className="flex flex-col gap-4 border-t border-white/10 bg-white/5 px-6 py-4 text-sm text-gray-200 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-3">
          <span>
            Trang {page} / {totalPages || 1}
          </span>
          <span className="hidden text-xs text-gray-400 md:inline">Tổng: {totalCount} submission</span>
          <select
            value={limit}
            onChange={(event) => onChangeLimit(Number(event.target.value))}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white focus:border-orange-400 focus:outline-none"
            disabled={disableActions}
          >
            {limitOptions.map((option) => (
              <option key={option} value={option}>
                {option}/trang
              </option>
            ))}
          </select>
        </div>

        <div className="flex items-center gap-2">
          <button
            onClick={handlePrevious}
            disabled={page <= 1 || disableActions}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Trước
          </button>
          <button
            onClick={handleNext}
            disabled={(!!totalPages && page >= totalPages) || disableActions}
            className="rounded-lg border border-white/10 bg-white/10 px-3 py-1 text-xs text-white transition hover:bg-white/20 disabled:cursor-not-allowed disabled:opacity-50"
          >
            Sau
          </button>
        </div>

        {isFetching && !isLoading && (
          <div className="text-xs text-gray-300">Đang cập nhật dữ liệu...</div>
        )}
      </div>
    </div>
  );
};

const StatusIcon = ({ status }: { status: MovieSubmissionSummary["status"] }) => {
  switch (status) {
    case "Pending":
      return <UserSquare2 className="h-4 w-4" />;
    case "Resubmitted":
      return <Film className="h-4 w-4" />;
    case "Approved":
      return <CheckCircle2 className="h-4 w-4" />;
    case "Rejected":
      return <XCircle className="h-4 w-4" />;
    default:
      return null;
  }
};

const ManagerStaffCell = ({ managerStaffId }: { managerStaffId?: number }) => {
  const { accessToken } = useAuthStore();
  
  const { data: staffData } = useGetManagerStaffById(
    managerStaffId || 0,
    managerStaffId ? accessToken ?? undefined : undefined
  );

  if (!managerStaffId) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <UserSquare2 className="h-4 w-4 text-blue-400" />
        <span className="text-gray-300">Manager</span>
      </div>
    );
  }

  if (!staffData) {
    return (
      <div className="flex items-center gap-2 text-xs">
        <UserSquare2 className="h-4 w-4 text-gray-400" />
        <span className="text-gray-400">Đang tải...</span>
      </div>
    );
  }

  return (
    <div className="flex flex-col text-xs">
      <div className="flex items-center gap-2">
        <UserSquare2 className="h-4 w-4 text-purple-400" />
        <span className="text-gray-300">{staffData.result.fullName}</span>
      </div>
      <span className="text-gray-400">Staff #{managerStaffId}</span>
    </div>
  );
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

export default MovieTable;
