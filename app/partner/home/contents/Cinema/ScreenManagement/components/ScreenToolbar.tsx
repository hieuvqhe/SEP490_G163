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
    <div className="flex flex-col gap-4 rounded-xl border border-slate-800/60 bg-slate-900/60 p-4 backdrop-blur">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-slate-300">
          <Filter className="size-5 text-orange-400" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-slate-400">
              Phòng chiếu tại {cinemaName ?? "..."}
            </p>
            <p className="text-xs text-slate-500">
              Lọc và quản lý danh sách phòng chiếu của rạp đã chọn
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ ...defaultScreenFilters })}
            className="border-slate-700 bg-slate-800/40 text-slate-200 hover:bg-slate-800/70"
          >
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
            Thêm phòng
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative">
          <Search className="size-4 text-slate-500 absolute left-3 top-1/2 -translate-y-1/2" />
          <Input
            placeholder="Tìm kiếm theo tên phòng hoặc mã phòng"
            className="pl-9 bg-slate-900/70 border-slate-800/80 text-slate-200 placeholder:text-slate-500"
            name="search"
            value={filters.search}
            onChange={handleInputChange}
          />
        </div>
        <select
          name="screenType"
          value={filters.screenType}
          onChange={handleInputChange}
          className="h-9 rounded-md border bg-slate-900/70 border-slate-800/80 px-3 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          {screenTypeOptions.map((option) => (
            <option key={option.value} value={option.value}>
              {option.label}
            </option>
          ))}
        </select>
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
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleInputChange}
          className="h-9 rounded-md border bg-slate-900/70 border-slate-800/80 px-3 text-sm text-slate-200 focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-orange-500"
        >
          <option value="screenName">Tên phòng</option>
          <option value="screenType">Loại phòng</option>
          <option value="capacity">Sức chứa</option>
          <option value="createdDate">Ngày tạo</option>
          <option value="updatedDate">Ngày cập nhật</option>
        </select>
      </div>
    </div>
  );
};

export default ScreenToolbar;
