"use client";

import { ChangeEvent } from "react";
import { Filter, RefreshCw, Search, SlidersHorizontal, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { CinemaFilters, CinemaStatusFilter } from "../types";

type CinemaToolbarProps = {
  filters: CinemaFilters;
  onFiltersChange: (filters: Partial<CinemaFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing: boolean;
};

const CinemaToolbar = ({
  filters,
  onFiltersChange,
  onReset,
  onRefresh,
  isRefreshing,
  onCreate,
}: CinemaToolbarProps) => {
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "status") {
      onFiltersChange({ status: value as CinemaStatusFilter });
      return;
    }
    onFiltersChange({ [name]: value });
  };

  return (
    <div className="flex flex-col gap-4 bg-slate-900/60 border border-slate-800/60 backdrop-blur rounded-xl p-4">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Bộ lọc rạp chiếu
            </p>
            <p className="text-xs text-slate-500">
              Tìm kiếm, lọc và sắp xếp danh sách rạp bạn đang quản lý
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800/70"
          >
            <SlidersHorizontal className="size-4" />
            Đặt lại
          </Button>
          <Button
            variant="outline"
            size="sm"
            onClick={onRefresh}
            disabled={isRefreshing}
            className={cn(
              "border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800/70",
              isRefreshing && "opacity-70"
            )}
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")}
            />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={onCreate}
            className="bg-orange-500 hover:bg-orange-600 text-white"
          >
            <Plus className="size-4" />
            Tạo rạp mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative">
          <Search className="size-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tên, mã rạp..."
            className="pl-9 bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>
        <Input
          placeholder="Thành phố"
          className="bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
          name="city"
          value={filters.city}
          onChange={handleInputChange}
        />
        <Input
          placeholder="Quận / Huyện"
          className="bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
          name="district"
          value={filters.district}
          onChange={handleInputChange}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="h-9 rounded-md border bg-slate-900/70 border-slate-800/80 px-3 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>
    </div>
  );
};

export default CinemaToolbar;
