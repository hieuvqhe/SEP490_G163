"use client";

import { Fragment } from "react";
import { Eye, PencilLine, Trash2, ArrowUpDown } from "lucide-react";
import { Button } from "@/components/ui/button";
import type { PartnerCombo, PartnerCombosPagination } from "@/apis/partner.combo.api";
import type { ComboSortField } from "../types";
import ComboPaginationControls from "./ComboPaginationControls";
import { formatCurrency } from "../utils";

interface ComboTableProps {
  combos: PartnerCombo[];
  loading: boolean;
  errorMessage?: string;
  pagination?: PartnerCombosPagination;
  sortBy: ComboSortField;
  sortOrder: "asc" | "desc";
  onSortChange: (field: ComboSortField) => void;
  onPageChange: (page: number) => void;
  onView: (combo: PartnerCombo) => void;
  onEdit: (combo: PartnerCombo) => void;
  onDelete: (combo: PartnerCombo) => void;
  canEdit?: boolean;
  canDelete?: boolean;
}

const sortableColumns: { key: ComboSortField; label: string }[] = [
  { key: "price", label: "Giá combo" },
  { key: "createdAt", label: "Ngày tạo" },
  { key: "updatedAt", label: "Ngày cập nhật" },
];

const TOTAL_COLUMNS = 8;

const ComboTable = ({
  combos,
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
  canEdit = true,
  canDelete = true,
}: ComboTableProps) => {
  const renderSortIcon = (columnKey: ComboSortField) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="size-4 text-[#9e9ea2]" />;
    return (
      <ArrowUpDown
        className={`size-4 ${sortOrder === "asc" ? "text-[#ff7a45] rotate-180" : "text-[#ff7a45]"}`}
      />
    );
  };

  const renderStatusBadge = (combo: PartnerCombo) => {
    const active = combo.isAvailable;
    return (
      <span
        className={`inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide ${
          active
            ? "bg-emerald-500/20 text-emerald-300 border border-emerald-500/40"
            : "bg-rose-500/15 text-rose-200 border border-rose-500/30"
        }`}
      >
        <span className={`size-1.5 rounded-full ${active ? "bg-emerald-300" : "bg-rose-300"}`} />
        {active ? "Đang bán" : "Tạm ngưng"}
      </span>
    );
  };

  const renderDescription = (description: string) => {
    if (!description) return <span className="text-[#9e9ea2]">Không có mô tả</span>;
    if (description.length <= 80) return description;
    return `${description.slice(0, 80)}...`;
  };

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? 1;

  return (
    <div
      className="overflow-hidden rounded-xl border border-[#27272a] bg-[#151518] shadow-lg shadow-black/40"
      id="combo-tour-table"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#27272a]">
          <thead className="bg-[#27272a]">
            <tr className="text-left text-xs font-semibold uppercase tracking-wider text-[#9e9ea2]">
              <th className="px-4 py-3">Tên combo</th>
              <th className="px-4 py-3">Mã combo</th>
              <th className="px-4 py-3">Mô tả</th>
              {sortableColumns.map((column) => (
                <th key={column.key} className="px-4 py-3">
                  <button
                    type="button"
                    onClick={() => onSortChange(column.key)}
                    className="flex items-center gap-2 text-[#9e9ea2] transition hover:text-[#ff7a45]"
                    id={column.key === "price" ? "combo-tour-table-sort" : undefined}
                  >
                    {column.label}
                    {renderSortIcon(column.key)}
                  </button>
                </th>
              ))}
              <th className="px-4 py-3">Trạng thái</th>
              <th className="px-4 py-3">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {[...Array(TOTAL_COLUMNS)].map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="h-4 rounded bg-[#27272a]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : errorMessage ? (
              <tr>
                <td colSpan={TOTAL_COLUMNS} className="px-4 py-6 text-center text-sm text-rose-300">
                  {errorMessage}
                </td>
              </tr>
            ) : combos.length === 0 ? (
              <tr>
                <td
                  colSpan={TOTAL_COLUMNS}
                  className="px-4 py-10 text-center text-sm text-[#9e9ea2]"
                  id="combo-tour-empty"
                >
                  Không có combo nào phù hợp với bộ lọc hiện tại.
                </td>
              </tr>
            ) : (
              combos.map((combo, index) => (
                <Fragment key={combo.serviceId}>
                  <tr
                    className="bg-[#151518] transition-colors hover:bg-[#1c1c1f]"
                    id={index === 0 ? "combo-tour-row" : undefined}
                  >
                    <td className="px-4 py-4">
                      <div className="flex flex-col">
                        <span className="font-semibold text-[#f5f5f5]">{combo.name}</span>
                        <span className="text-xs text-[#9e9ea2]">#{combo.serviceId}</span>
                      </div>
                    </td>
                    <td className="px-4 py-4 font-mono text-xs text-[#9e9ea2]">{combo.code}</td>
                    <td className="px-4 py-4 text-sm text-[#d0d0d3]">
                      {renderDescription(combo.description)}
                    </td>
                    <td className="px-4 py-4 text-sm font-semibold text-[#f5f5f5]">
                      {formatCurrency(combo.price)}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#f5f5f5]">
                      {new Date(combo.createdAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-4 text-sm text-[#f5f5f5]">
                      {new Date(combo.updatedAt).toLocaleString("vi-VN")}
                    </td>
                    <td className="px-4 py-4">{renderStatusBadge(combo)}</td>
                    <td className="px-4 py-4">
                      <div className="flex items-center gap-2" id={index === 0 ? "combo-tour-row-actions" : undefined}>
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                          onClick={() => onView(combo)}
                          title="Xem chi tiết"
                        >
                          <Eye className="size-4" />
                        </Button>
                        {canEdit && (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                            onClick={() => onEdit(combo)}
                            title="Chỉnh sửa"
                          >
                            <PencilLine className="size-4" />
                          </Button>
                        )}
                        {canDelete && (
                          <Button
                            variant="outline"
                            size="icon-sm"
                            className="border border-rose-600/50 text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
                            onClick={() => onDelete(combo)}
                            title="Xoá combo"
                          >
                            <Trash2 className="size-4" />
                          </Button>
                        )}
                      </div>
                    </td>
                  </tr>
                </Fragment>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div id="combo-tour-pagination">
        <ComboPaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ComboTable;
