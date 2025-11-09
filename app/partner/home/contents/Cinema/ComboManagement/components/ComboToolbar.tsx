"use client";

import { ChangeEvent } from "react";
import { Filter, RefreshCw, Search, Plus } from "lucide-react";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import type { ComboFilters, ComboStatusFilter } from "../types";

type ComboToolbarProps = {
  filters: ComboFilters;
  onFiltersChange: (filters: Partial<ComboFilters>) => void;
  onReset: () => void;
  onRefresh: () => void;
  onCreate: () => void;
  isRefreshing: boolean;
};

const ComboToolbar = ({
  filters,
  onFiltersChange,
  onReset,
  onRefresh,
  onCreate,
  isRefreshing,
}: ComboToolbarProps) => {
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "status") {
      onFiltersChange({ status: value as ComboStatusFilter });
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
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">
              Bộ lọc combo
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Tìm kiếm, lọc và sắp xếp danh sách combo bạn đang quản lý
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={onReset}
            className="border border-[#3a3a3d] bg-[#27272a]/70 text-[#f5f5f5] transition hover:bg-[#27272a]"
          >
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
            Tạo combo mới
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-3">
        <div className="relative md:col-span-2">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
          <Input
            placeholder="Tìm kiếm theo tên hoặc mã combo..."
            className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>

        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          <option value="all" className="bg-[#151518] text-[#f5f5f5]">
            Tất cả trạng thái
          </option>
          <option value="available" className="bg-[#151518] text-[#f5f5f5]">
            Đang bán
          </option>
          <option value="unavailable" className="bg-[#151518] text-[#f5f5f5]">
            Tạm ngưng
          </option>
        </select>
      </div>
    </div>
  );
};

export default ComboToolbar;
