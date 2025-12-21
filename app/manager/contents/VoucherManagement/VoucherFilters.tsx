"use client";

import { ChangeEvent } from "react";
import { Loader2, Plus, RefreshCcw } from "lucide-react";
import type { VoucherSortBy, VoucherStatusFilter } from "@/apis/manager.voucher.api";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue
} from "@/components/ui/select";

export interface VoucherFilterState {
  search: string;
  status: "all" | VoucherStatusFilter;
  sortBy: VoucherSortBy;
  sortOrder: "asc" | "desc";
  limit: number;
}

interface VoucherFiltersProps {
  filters: VoucherFilterState;
  onChange: (value: Partial<VoucherFilterState>) => void;
  isRefreshing?: boolean;
  onRefresh: () => void;
  onCreate: () => void;  canCreate?: boolean;}

const sortOptions: { label: string; value: VoucherSortBy }[] = [
  { label: "Ngày tạo", value: "createdat" },
  { label: "Mã voucher", value: "voucherCode" },
  { label: "ID", value: "voucherId" },
  { label: "Giá trị giảm", value: "discountVal" },
  { label: "Bắt đầu", value: "validFrom" },
  { label: "Kết thúc", value: "validTo" },
  { label: "Số lượt", value: "usageLimit" },
  { label: "Đã dùng", value: "usedCount" },
];

const limitOptions = [5, 10, 20, 50];

const VoucherFilters = ({ filters, onChange, isRefreshing, onRefresh, onCreate, canCreate = true }: VoucherFiltersProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ search: event.target.value });
  };

  const handleStatusChange = (value: string) => {
    onChange({ status: value as "all" | VoucherStatusFilter });
  };

  const handleSortByChange = (value: string) => {
    onChange({ sortBy: value as VoucherSortBy });
  };

  const handleSortOrderChange = (value: string) => {
    onChange({ sortOrder: value as "asc" | "desc" });
  };

  const handleLimitChange = (value: string) => {
    onChange({ limit: Number(value) });
  };

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-end">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative">
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm theo mã voucher"
            className="w-56 rounded-lg border border-white/10 bg-white/10 py-2 pl-3 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
          />
        </div>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="min-w-[180px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white hover:bg-white/15 focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue placeholder="Tất cả trạng thái" />
          </SelectTrigger>
          <SelectContent className="border border-white/10 bg-slate-950/95 text-white">
            <SelectItem value="all" className="text-gray-200 focus:bg-white/10 focus:text-white">
              Tất cả trạng thái
            </SelectItem>
            <SelectItem value="active" className="text-gray-200 focus:bg-white/10 focus:text-white">
              Đang hoạt động
            </SelectItem>
            <SelectItem value="inactive" className="text-gray-200 focus:bg-white/10 focus:text-white">
              Ngưng hoạt động
            </SelectItem>
          </SelectContent>
        </Select>

        <Select value={filters.sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="min-w-[180px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white hover:bg-white/15 focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-white/10 bg-slate-950/95 text-white">
            {sortOptions.map((option) => (
              <SelectItem
                key={option.value}
                value={option.value}
                className="text-gray-200 focus:bg-white/10 focus:text-white"
              >
                {option.label}
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <Select value={filters.sortOrder} onValueChange={handleSortOrderChange}>
          <SelectTrigger className="min-w-[140px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white hover:bg-white/15 focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue />
          </SelectTrigger>
          <SelectContent className="border border-white/10 bg-slate-950/95 text-white">
            <SelectItem value="desc" className="text-gray-200 focus:bg-white/10 focus:text-white">
              Giảm dần
            </SelectItem>
            <SelectItem value="asc" className="text-gray-200 focus:bg-white/10 focus:text-white">
              Tăng dần
            </SelectItem>
          </SelectContent>
        </Select>

      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white transition hover:bg-white/20"
          disabled={isRefreshing}
        >
          {isRefreshing ? <Loader2 className="h-4 w-4 animate-spin" /> : <RefreshCcw className="h-4 w-4" />}
          Làm mới
        </button>
        {canCreate && (
          <button
            onClick={onCreate}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Tạo voucher
          </button>
        )}
      </div>
    </div>
  );
};

export default VoucherFilters;
