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
    <div className="flex flex-col gap-4 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-[#f5f5f5]/80">
          <Filter className="size-5 text-[#ff7a45]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">Bộ lọc loại ghế</p>
            <p className="text-xs text-[#9e9ea2]">Tìm kiếm, lọc và quản lý danh sách loại ghế của bạn</p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] transition hover:bg-[#27272a]"
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
              "border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] transition hover:bg-[#27272a]",
              isRefreshing && "opacity-70"
            )}
          >
            <RefreshCw className={cn("size-4", isRefreshing && "animate-spin")} />
            Làm mới
          </Button>
          <Button
            size="sm"
            onClick={onCreate}
            className="bg-[#ff7a45] text-[#151518] transition hover:bg-[#ff8d60]"
          >
            <Plus className="size-4" />
            Tạo loại ghế
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-5">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
          <Input
            placeholder="Tìm kiếm theo tên"
            className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        <div className="relative">
          <Tag className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
          <Input
            placeholder="Mã loại ghế"
            className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            name="code"
            value={filters.code}
            onChange={handleInputChange}
          />
        </div>

        <Input
          placeholder="Phụ thu tối thiểu"
          className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
          name="minSurcharge"
          value={filters.minSurcharge}
          onChange={handleInputChange}
        />
        <Input
          placeholder="Phụ thu tối đa"
          className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
          name="maxSurcharge"
          value={filters.maxSurcharge}
          onChange={handleInputChange}
        />
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          <option value="all" className="bg-[#151518] text-[#f5f5f5]">Tất cả trạng thái</option>
          <option value="active" className="bg-[#151518] text-[#f5f5f5]">Đang hoạt động</option>
          <option value="inactive" className="bg-[#151518] text-[#f5f5f5]">Ngừng hoạt động</option>
        </select>
      </div>
    </div>
  );
};

export default SeatTypeToolbar;
