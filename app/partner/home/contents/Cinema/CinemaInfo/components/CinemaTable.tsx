"use client";

import { Fragment } from "react";
import {
  PartnerCinema,
  PartnerCinemasPagination,
} from "@/apis/partner.cinema.api";
import { Button } from "@/components/ui/button";
import {
  ArrowUpDown,
  Eye,
  PencilLine,
  Trash2,
} from "lucide-react";
import PaginationControls from "./PaginationControls";

interface CinemaTableProps {
  cinemas: PartnerCinema[];
  loading: boolean;
  errorMessage?: string;
  pagination?: PartnerCinemasPagination;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  onSortChange: (field: string) => void;
  onPageChange: (page: number) => void;
  onView: (cinema: PartnerCinema) => void;
  onEdit: (cinema: PartnerCinema) => void;
  onDelete: (cinema: PartnerCinema) => void;
}

const columns: { key: keyof PartnerCinema | "status" | "screens"; label: string; sortable?: boolean }[] = [
  { key: "cinemaName", label: "Tên rạp", sortable: true },
  { key: "code", label: "Mã rạp", sortable: true },
  { key: "city", label: "Thành phố", sortable: true },
  { key: "district", label: "Quận / Huyện" },
  { key: "screens", label: "Phòng chiếu" },
  { key: "status", label: "Trạng thái", sortable: true },
  { key: "updatedAt", label: "Cập nhật", sortable: true },
  { key: "cinemaId", label: "Thao tác" },
];

const CinemaTable = ({
  cinemas,
  loading,
  errorMessage,
  pagination,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onView,
  onEdit,
  onDelete,
}: CinemaTableProps) => {
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="size-4 text-[#9e9ea2]" />;
    return (
      <ArrowUpDown
        className={`size-4 ${sortOrder === "asc" ? "text-[#ff7a45] rotate-180" : "text-[#ff7a45]"}`}
      />
    );
  };

  const renderStatusBadge = (cinema: PartnerCinema) => {
    const active = cinema.isActive;
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
          active
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            : "bg-rose-500/15 text-rose-200 border border-rose-500/30"
        }`}
      >
        <span className={`size-1.5 rounded-full ${active ? "bg-emerald-300" : "bg-rose-300"}`} />
        {active ? "Đang hoạt động" : "Ngừng hoạt động"}
      </span>
    );
  };

  const renderScreens = (cinema: PartnerCinema) => (
    <div className="flex flex-col text-sm text-[#d0d0d3]">
      <span>{cinema.activeScreens}/{cinema.totalScreens}</span>
      <span className="text-xs text-[#9e9ea2]">Hoạt động / Tổng</span>
    </div>
  );

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? 1;

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#27272a] bg-[#151518] shadow-lg shadow-black/40"
      id="cinema-tour-table"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#27272a]">
          <thead className="bg-[#27272a]">
            <tr
              className="text-left text-xs font-semibold uppercase tracking-wider text-[#9e9ea2]"
              id="cinema-tour-table-sort"
            >
              {columns.map((column) => (
                <th key={column.key as string} className="px-4 py-3">
                  {column.key === "cinemaId" ? (
                    <span>Thao tác</span>
                  ) : column.sortable ? (
                    <button
                      type="button"
                      onClick={() => onSortChange(column.key as string)}
                      className="flex items-center gap-2 text-[#9e9ea2] transition hover:text-[#ff7a45]"
                    >
                      {column.label}
                      {renderSortIcon(column.key as string)}
                    </button>
                  ) : (
                    column.label
                  )}
                </th>
              ))}
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {columns.map((column) => (
                    <td key={column.key as string} className="px-4 py-4">
                      <div className="h-4 rounded bg-[#27272a]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : errorMessage ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-6 text-center text-sm text-rose-300">
                  {errorMessage}
                </td>
              </tr>
            ) : cinemas.length === 0 ? (
              <tr>
                <td colSpan={columns.length} className="px-4 py-10 text-center text-sm text-[#9e9ea2]">
                  Không có rạp nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              cinemas.map((cinema, index) => (
                <Fragment key={cinema.cinemaId}>
                  <tr
                    className="bg-[#151518] transition-colors hover:bg-[#1c1c1f]"
                    id={index === 0 ? "cinema-tour-row" : undefined}
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#f5f5f5]">{cinema.cinemaName}</span>
                        <span className="text-xs text-[#9e9ea2]">#{cinema.cinemaId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[#9e9ea2]">{cinema.code}</td>
                    <td className="px-4 py-4 text-sm text-[#f5f5f5]">{cinema.city}</td>
                    <td className="px-4 py-4 text-sm text-[#d0d0d3]">{cinema.district}</td>
                    <td className="px-4 py-4">{renderScreens(cinema)}</td>
                    <td className="px-4 py-4">{renderStatusBadge(cinema)}</td>
                    <td className="px-4 py-4 text-sm text-[#9e9ea2]">
                      {new Date(cinema.updatedAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-4">
                      <div
                        className="flex items-center gap-2"
                        id={index === 0 ? "cinema-tour-row-actions" : undefined}
                      >
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                          onClick={() => onView(cinema)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                          onClick={() => onEdit(cinema)}
                          title="Chỉnh sửa"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-rose-600/50 text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
                          onClick={() => onDelete(cinema)}
                          title="Xoá rạp"
                        >
                          <Trash2 className="size-4" />
                        </Button>
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <PaginationControls
        currentPage={currentPage}
        totalPages={totalPages}
        loading={loading}
        onPageChange={onPageChange}
      />
    </div>
  );
};

export default CinemaTable;
