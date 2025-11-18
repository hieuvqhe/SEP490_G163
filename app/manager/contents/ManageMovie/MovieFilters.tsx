"use client";

import { ChangeEvent } from "react";
import type { MovieSubmissionStatus } from "@/apis/manager.movie.api";
import { RefreshCcw, Search } from "lucide-react";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";

export type MovieSubmissionSortBy = "createdAt" | "submittedAt" | "title";

export interface MovieFilterState {
  search: string;
  status: "all" | MovieSubmissionStatus;
  sortBy: MovieSubmissionSortBy;
  sortOrder: "asc" | "desc";
  limit: number;
}

interface MovieFiltersProps {
  filters: MovieFilterState;
  onChange: (value: Partial<MovieFilterState>) => void;
  isRefreshing?: boolean;
  onRefresh: () => void;
}

const statusOptions: { label: string; value: MovieFilterState["status"]; hint?: string }[] = [
  { label: "Tất cả trạng thái", value: "all" },
  { label: "Chờ duyệt", value: "Pending" },
  { label: "Cần duyệt lại", value: "Resubmitted" },
  { label: "Đã duyệt", value: "Approved" },
  { label: "Đã từ chối", value: "Rejected" },
];

const sortOptions: { label: string; value: MovieSubmissionSortBy }[] = [
  { label: "Ngày tạo", value: "createdAt" },
  { label: "Ngày gửi", value: "submittedAt" },
  { label: "Tiêu đề", value: "title" },
];

const limitOptions = [5, 10, 20, 50];

const MovieFilters = ({ filters, onChange, isRefreshing, onRefresh }: MovieFiltersProps) => {
  const handleSearchChange = (event: ChangeEvent<HTMLInputElement>) => {
    onChange({ search: event.target.value });
  };

  const handleStatusChange = (value: MovieFilterState["status"]) => {
    onChange({ status: value });
  };

  const handleSortByChange = (value: MovieSubmissionSortBy) => {
    onChange({ sortBy: value });
  };

  const handleSortOrderChange = (value: "asc" | "desc") => {
    onChange({ sortOrder: value });
  };

  const handleLimitChange = (value: number) => {
    onChange({ limit: value });
  };

  return (
    <div className="flex w-full flex-col gap-4 md:flex-row md:items-start md:justify-between">
      <div className="flex flex-1 items-center gap-3">
        <div className="relative flex-1">
          <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
          <input
            type="text"
            value={filters.search}
            onChange={handleSearchChange}
            placeholder="Tìm kiếm theo tiêu đề phim"
            className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
          />
        </div>

        <Select value={filters.status} onValueChange={handleStatusChange}>
          <SelectTrigger className="min-w-[180px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue placeholder="Trạng thái" />
          </SelectTrigger>
          <SelectContent className="border border-white/10 bg-slate-950/95 text-white">
            {statusOptions.map((option) => (
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
      </div>

      <div className="flex flex-wrap items-center justify-end gap-3">
        <Select value={filters.sortBy} onValueChange={handleSortByChange}>
          <SelectTrigger className="min-w-[160px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue placeholder="Sắp xếp" />
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
          <SelectTrigger className="min-w-[140px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue placeholder="Thứ tự" />
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

        <Select value={filters.limit.toString()} onValueChange={(value) => handleLimitChange(Number(value))}>
          <SelectTrigger className="min-w-[120px] rounded-lg border border-white/10 bg-white/10 px-3 text-sm text-white focus-visible:border-orange-400 focus-visible:ring-0">
            <SelectValue placeholder="Số lượng" />
          </SelectTrigger>
          <SelectContent className="border border-white/10 bg-slate-950/95 text-white">
            {limitOptions.map((option) => (
              <SelectItem
                key={option}
                value={option.toString()}
                className="text-gray-200 focus:bg-white/10 focus:text-white"
              >
                {option}/trang
              </SelectItem>
            ))}
          </SelectContent>
        </Select>

        <button
          onClick={onRefresh}
          className="flex items-center gap-2 rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm font-medium text-white disabled:opacity-60"
          disabled={isRefreshing}
        >
          <RefreshCcw className="h-4 w-4" />
          {isRefreshing ? "Đang làm mới" : "Làm mới"}
        </button>
      </div>
    </div>
  );
};

export default MovieFilters;
