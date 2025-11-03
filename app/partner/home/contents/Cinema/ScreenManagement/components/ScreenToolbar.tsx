import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { Filter, Plus, RefreshCw, Search } from "lucide-react";
import { defaultScreenFilters, screenTypeOptions } from "../constants";
import type { ScreenFilters } from "../types";

interface ScreenToolbarProps {
  filters: ScreenFilters;
  onFiltersChange: (partial: Partial<ScreenFilters>) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCreate: () => void;
  cinemaName?: string;
}

const ScreenToolbar = ({
  filters,
  onFiltersChange,
  onRefresh,
  isRefreshing,
  onCreate,
  cinemaName,
}: ScreenToolbarProps) => {
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "status") {
      onFiltersChange({ status: value as ScreenFilters["status"] });
      return;
    }
    onFiltersChange({ [name]: value } as Partial<ScreenFilters>);
  };

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-[#f5f5f5]/80">
          <Filter className="size-5 text-[#ff7a45]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">
              Phòng chiếu tại {cinemaName ?? "..."}
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Lọc và quản lý danh sách phòng chiếu của rạp đã chọn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ ...defaultScreenFilters })}
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
            Thêm phòng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
          <Input
            placeholder="Tìm kiếm theo tên phòng hoặc mã phòng"
            className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>
        <select
          name="screenType"
          value={filters.screenType}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          {screenTypeOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#151518] text-[#f5f5f5]">
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          <option value="all" className="bg-[#151518] text-[#f5f5f5]">
            Tất cả trạng thái
          </option>
          <option value="active" className="bg-[#151518] text-[#f5f5f5]">
            Đang hoạt động
          </option>
          <option value="inactive" className="bg-[#151518] text-[#f5f5f5]">
            Ngừng hoạt động
          </option>
        </select>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          <option value="screenName" className="bg-[#151518] text-[#f5f5f5]">
            Tên phòng
          </option>
          <option value="screenType" className="bg-[#151518] text-[#f5f5f5]">
            Loại phòng
          </option>
          <option value="capacity" className="bg-[#151518] text-[#f5f5f5]">
            Sức chứa
          </option>
          <option value="createdDate" className="bg-[#151518] text-[#f5f5f5]">
            Ngày tạo
          </option>
          <option value="updatedDate" className="bg-[#151518] text-[#f5f5f5]">
            Ngày cập nhật
          </option>
        </select>
      </div>
    </div>
  );
};

export default ScreenToolbar;
