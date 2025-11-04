import type { ChangeEvent } from "react";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { CalendarDays, Filter, Plus, RefreshCw } from "lucide-react";
import { cn } from "@/lib/utils";
import type { ShowtimeFilters } from "../types";
import {
  defaultShowtimeFilters,
  showtimeSortByOptions,
  showtimeStatusOptions,
} from "../constants";

interface ShowtimeToolbarProps {
  filters: ShowtimeFilters;
  onFiltersChange: (partial: Partial<ShowtimeFilters>) => void;
  onRefresh: () => void;
  isRefreshing: boolean;
  onCreate: () => void;
  movieName?: string;
  cinemaName?: string;
  screenName?: string;
}

const ShowtimeToolbar = ({
  filters,
  onFiltersChange,
  onRefresh,
  isRefreshing,
  onCreate,
  movieName,
  cinemaName,
  screenName,
}: ShowtimeToolbarProps) => {
  const handleInputChange = (
    event: ChangeEvent<HTMLInputElement | HTMLSelectElement>
  ) => {
    const { name, value } = event.target;
    if (name === "status") {
      onFiltersChange({ status: value as ShowtimeFilters["status"] });
      return;
    }
    if (name === "sortOrder") {
      onFiltersChange({ sortOrder: value as ShowtimeFilters["sortOrder"] });
      return;
    }
    onFiltersChange({ [name]: value } as Partial<ShowtimeFilters>);
  };

  const summaryTexts = [movieName, cinemaName, screenName].filter(Boolean);

  return (
    <div className="flex flex-col gap-4 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
      <div className="flex flex-col gap-3 md:flex-row md:items-center md:justify-between">
        <div className="flex items-center gap-2 text-[#f5f5f5]/80">
          <Filter className="size-5 text-[#ff7a45]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">
              Quản lý suất chiếu
            </p>
            <p className="text-xs text-[#9e9ea2]">
              {summaryTexts.length > 0
                ? summaryTexts.join(" • ")
                : "Chọn phim, rạp và phòng chiếu để bắt đầu"}
            </p>
          </div>
        </div>
        <div className="flex items-center gap-2">
          <Button
            variant="outline"
            size="sm"
            onClick={() => onFiltersChange({ ...defaultShowtimeFilters })}
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
            disabled={!movieName || !cinemaName || !screenName}
            className="bg-[#ff7a45] text-[#151518] transition hover:bg-[#ff8d60] disabled:cursor-not-allowed disabled:opacity-60"
          >
            <Plus className="size-4" />
            Thêm suất chiếu
          </Button>
        </div>
      </div>

      <div className="grid grid-cols-1 gap-3 md:grid-cols-4">
        <div className="relative">
          <CalendarDays className="absolute left-3 top-1/2 size-4 -translate-y-1/2 text-[#9e9ea2]" />
          <Input
            type="date"
            name="date"
            value={filters.date}
            onChange={handleInputChange}
            className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
          />
        </div>
        <select
          name="status"
          value={filters.status}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          {showtimeStatusOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#151518] text-[#f5f5f5]">
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="sortBy"
          value={filters.sortBy}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          {showtimeSortByOptions.map((option) => (
            <option key={option.value} value={option.value} className="bg-[#151518] text-[#f5f5f5]">
              {option.label}
            </option>
          ))}
        </select>
        <select
          name="sortOrder"
          value={filters.sortOrder}
          onChange={handleInputChange}
          className="h-9 rounded-md border border-[#3a3a3d] bg-[#27272a] px-3 text-sm text-[#f5f5f5] focus-visible:outline-none focus-visible:ring-2 focus-visible:ring-[#ff7a45]"
        >
          <option value="asc" className="bg-[#151518] text-[#f5f5f5]">
            Tăng dần
          </option>
          <option value="desc" className="bg-[#151518] text-[#f5f5f5]">
            Giảm dần
          </option>
        </select>
      </div>
    </div>
  );
};

export default ShowtimeToolbar;
