"use client";

import { ChangeEvent } from "react";
import { Filter, Plus, RefreshCw, Search, SlidersHorizontal, Tag } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { SeatTypeFilters } from "../types";

type SeatTypeToolbarProps = {
  filters: SeatTypeFilters;
  onFiltersChange: (filters: Partial<SeatTypeFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing: boolean;
};

const SeatTypeToolbar = ({
  filters,
  onFiltersChange,
  onReset,
  onRefresh,
  onCreate,
  isRefreshing,
}: SeatTypeToolbarProps) => {
  const handleInputChange = (event: ChangeEvent<HTMLInputElement | HTMLSelectElement>) => {
    const { name, value } = event.target;

    if (name === "status") {
      onFiltersChange({ status: value as SeatTypeFilters["status"] });
      return;
    }

    onFiltersChange({ [name]: value });
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">Bộ lọc loại ghế</p>
            <p className="text-xs text-slate-500">Tìm kiếm, lọc và quản lý danh sách loại ghế của bạn</p>
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
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={onCreate}
            className="bg-orange-500 text-white hover:bg-orange-600"
          >
            <Plus className="size-4" />
            Tạo loại ghế
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Tìm kiếm theo tên"
            className="pl-9 bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        <div className="relative">
          <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-slate-500" />
          <Input
            placeholder="Mã loại ghế"
            className="pl-9 bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
            name="code"
            value={filters.code}
            onChange={handleInputChange}
          />
        </div>

        <Input
          placeholder="Phụ thu tối thiểu"
          className="bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
          name="minSurcharge"
          value={filters.minSurcharge}
          onChange={handleInputChange}
        />
        <Input
          placeholder="Phụ thu tối đa"
          className="bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
          name="maxSurcharge"
          value={filters.maxSurcharge}
          onChange={handleInputChange}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-slate-800/80 bg-slate-900/70 px-3 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <option value="all">Tất cả trạng thái</option>
          <option value="active">Đang hoạt động</option>
          <option value="inactive">Ngừng hoạt động</option>
        </select>
      </div>
    </div>
  );
};

export default SeatTypeToolbar;
