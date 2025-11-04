import { Button } from "@/components/ui/button";
import PaginationControls from "../../CinemaInfo/components/PaginationControls";
import type { ShowtimeListItem, ShowtimePaginationState } from "../types";
import { PencilLine, Timer, Trash2 } from "lucide-react";
import { cn } from "@/lib/utils";
import { formatCurrency, formatShowtimeDate, formatShowtimeTime } from "../utils";

interface ShowtimeTableProps {
  showtimes: ShowtimeListItem[];
  loading: boolean;
  errorMessage?: string;
  pagination?: {
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
  paginationState: ShowtimePaginationState;
  onPageChange: (page: number) => void;
  onEdit: (showtime: ShowtimeListItem) => void;
  onDelete: (showtime: ShowtimeListItem) => void;
}

const statusLabelMap: Record<string, string> = {
  scheduled: "Sắp diễn ra",
  finished: "Đã chiếu",
};

const statusStyleMap: Record<string, string> = {
  scheduled: "border-emerald-500/40 bg-emerald-500/15 text-emerald-200",
  finished: "border-slate-500/40 bg-slate-500/15 text-slate-200",
};

const ShowtimeTable = ({
  showtimes,
  loading,
  errorMessage,
  pagination,
  paginationState,
  onPageChange,
  onEdit,
  onDelete,
}: ShowtimeTableProps) => {
  if (loading) {
    return (
      <div className="rounded-xl border border-[#27272a] bg-[#151518] p-6 text-center text-sm text-[#9e9ea2]">
        Đang tải danh sách suất chiếu...
      </div>
    );
  }

  if (errorMessage) {
    return (
      <div className="rounded-xl border border-rose-500/40 bg-rose-500/15 p-6 text-sm text-rose-200">
        {errorMessage}
      </div>
    );
  }

  if (showtimes.length === 0) {
    return (
      <div className="rounded-xl border border-dashed border-[#27272a] bg-[#151518] p-10 text-center text-[#9e9ea2]">
        <Timer className="mx-auto mb-4 size-12 text-[#ff7a45]" />
        <p className="text-lg font-semibold text-[#f5f5f5]">Chưa có suất chiếu nào</p>
        <p className="mt-1 text-sm">
          Hãy thêm suất chiếu mới sau khi chọn đầy đủ phim, rạp và phòng chiếu.
        </p>
      </div>
    );
  }

  const currentPage = pagination?.page ?? paginationState.page;
  const totalPages = pagination?.totalPages ?? 1;

  return (
    <div className="overflow-hidden rounded-xl border border-[#27272a] bg-[#151518] shadow-lg shadow-black/40">
      <div className="overflow-x-auto">
        <table className="w-full min-w-[960px] text-sm text-[#f5f5f5]">
          <thead className="bg-[#1f1f23] text-xs uppercase tracking-wide text-[#9e9ea2]">
            <tr>
              <th className="px-6 py-4 text-left">Phim</th>
              <th className="px-6 py-4 text-left">Phòng chiếu</th>
              <th className="px-6 py-4 text-left">Thời gian</th>
              <th className="px-6 py-4 text-left">Giá cơ bản</th>
              <th className="px-6 py-4 text-left">Ghế khả dụng</th>
              <th className="px-6 py-4 text-left">Trạng thái</th>
              <th className="px-6 py-4 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {showtimes.map((item) => {
              const statusLabel = statusLabelMap[item.status] ?? item.status;
              const statusClass = statusStyleMap[item.status] ??
                "border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5]";
              return (
                <tr key={item.showtimeId} className="transition hover:bg-[#1c1c1f]">
                  <td className="px-6 py-4">
                    <div className="font-medium">
                      {item.movie?.title ?? `Phim #${item.movieId}`}
                    </div>
                    <div className="text-xs text-[#9e9ea2]">
                      {item.movie?.genre}
                    </div>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#f5f5f5]">
                    <p>{item.screen?.name ?? `Phòng #${item.screenId}`}</p>
                    <p className="text-xs text-[#9e9ea2]">
                      {item.cinema?.name ?? `Rạp #${item.cinemaId}`}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#f5f5f5]">
                    <p>{formatShowtimeDate(item.startTime)}</p>
                    <p className="text-xs text-[#9e9ea2]">
                      {formatShowtimeTime(item.startTime)} - {formatShowtimeTime(item.endTime)}
                    </p>
                  </td>
                  <td className="px-6 py-4 text-sm text-[#f5f5f5]">
                    {formatCurrency(item.basePrice)}
                  </td>
                  <td className="px-6 py-4 text-sm text-[#f5f5f5]">
                    {item.availableSeats}
                  </td>
                  <td className="px-6 py-4">
                    <span
                      className={cn(
                        "inline-flex items-center gap-2 rounded-full border px-3 py-1 text-xs font-semibold",
                        statusClass
                      )}
                    >
                      <span className="size-1.5 rounded-full bg-current" />
                      {statusLabel}
                    </span>
                  </td>
                  <td className="px-6 py-4 text-right">
                    <div className="flex items-center justify-end gap-2">
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 border border-[#3a3a3d] text-[#f5f5f5] hover:bg-[#27272a]"
                        onClick={() => onEdit(item)}
                        title="Chỉnh sửa"
                      >
                        <PencilLine className="size-4" />
                      </Button>
                      <Button
                        variant="outline"
                        size="icon"
                        className="size-8 border border-rose-500/60 text-rose-200 hover:bg-rose-500/20"
                        onClick={() => onDelete(item)}
                        title="Xoá"
                      >
                        <Trash2 className="size-4" />
                      </Button>
                    </div>
                  </td>
                </tr>
              );
            })}
          </tbody>
        </table>
      </div>
      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default ShowtimeTable;
