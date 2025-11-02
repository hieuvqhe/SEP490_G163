import { useEffect, useMemo, useRef, useState } from "react";
import type { PartnerCinema } from "@/apis/partner.cinema.api";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { cn } from "@/lib/utils";
import { ChevronLeft, ChevronRight, MonitorPlay, Search } from "lucide-react";

interface CinemaSelectionPanelProps {
  cinemas: PartnerCinema[];
  loading: boolean;
  errorMessage?: string;
  selectedCinemaId: number | null;
  onSelect: (cinema: PartnerCinema) => void;
  onRetry: () => void;
  searchTerm: string;
  onSearchChange: (value: string) => void;
}

const CinemaSelectionPanel = ({
  cinemas,
  loading,
  errorMessage,
  selectedCinemaId,
  onSelect,
  onRetry,
  searchTerm,
  onSearchChange,
}: CinemaSelectionPanelProps) => {
  const scrollContainerRef = useRef<HTMLDivElement>(null);
  const [canScrollLeft, setCanScrollLeft] = useState(false);
  const [canScrollRight, setCanScrollRight] = useState(false);

  const filtered = useMemo(() => {
    if (!searchTerm.trim()) return cinemas;
    const keyword = searchTerm.trim().toLowerCase();
    return cinemas.filter((cinema) =>
      [cinema.cinemaName, cinema.code, cinema.city, cinema.district]
        .filter(Boolean)
        .some((value) => value!.toLowerCase().includes(keyword))
    );
  }, [cinemas, searchTerm]);

  const updateScrollButtons = () => {
    const container = scrollContainerRef.current;
    if (!container) return;
    const { scrollLeft, scrollWidth, clientWidth } = container;
    setCanScrollLeft(scrollLeft > 0);
    setCanScrollRight(scrollLeft + clientWidth < scrollWidth - 1);
  };

  useEffect(() => {
    updateScrollButtons();
  }, [filtered.length, loading, errorMessage]);

  useEffect(() => {
    const container = scrollContainerRef.current;
    if (!container) return;

    const handleScroll = () => updateScrollButtons();
    container.addEventListener("scroll", handleScroll, { passive: true });

    const handleResize = () => updateScrollButtons();
    window.addEventListener("resize", handleResize);

    return () => {
      container.removeEventListener("scroll", handleScroll);
      window.removeEventListener("resize", handleResize);
    };
  }, []);

  const scrollByDistance = (distance: number) => {
    const container = scrollContainerRef.current;
    if (!container) return;
    container.scrollBy({ left: distance, behavior: "smooth" });
  };

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#f5f5f5]/80">
          <MonitorPlay className="size-5 text-[#ff7a45]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">
              Rạp chiếu của bạn
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Chọn rạp để quản lý danh sách phòng chiếu
            </p>
          </div>
        </div>
      </div>

      <div className="relative">
        <Search className="size-4 text-[#9e9ea2] absolute left-3 top-1/2 -translate-y-1/2" />
        <Input
          placeholder="Tìm kiếm theo tên, mã rạp, địa điểm..."
          className="pl-9 border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] placeholder:text-[#9e9ea2] focus-visible:border-[#ff7a45] focus-visible:ring-[#ff7a45]/30"
          value={searchTerm}
          onChange={(event) => onSearchChange(event.target.value)}
        />
      </div>

      <div className="relative">
        <div
          ref={scrollContainerRef}
          className="flex gap-3 overflow-x-auto pb-2 pr-1"
        >
          {loading ? (
            <div className="flex min-h-[180px] min-w-full items-center justify-center text-sm text-[#9e9ea2]">
              Đang tải danh sách rạp...
            </div>
          ) : errorMessage ? (
            <div className="min-w-[280px] rounded-lg border border-rose-500/40 bg-rose-500/10 p-4 text-sm text-rose-300">
              <p>{errorMessage}</p>
              <Button
                size="sm"
                variant="outline"
                className="mt-3 border border-rose-500/50 text-rose-200 hover:bg-rose-500/20"
                onClick={onRetry}
              >
                Thử lại
              </Button>
            </div>
          ) : filtered.length === 0 ? (
            <div className="flex min-h-[180px] min-w-full items-center justify-center text-sm text-[#9e9ea2]">
              Không tìm thấy rạp phù hợp.
            </div>
          ) : (
            filtered.map((cinema) => {
              const isSelected = cinema.cinemaId === selectedCinemaId;
              return (
                <button
                  key={cinema.cinemaId}
                  type="button"
                  onClick={() => onSelect(cinema)}
                  className={cn(
                    "min-w-[260px] shrink-0 rounded-lg border px-4 py-3 text-left transition-all",
                    "border-[#27272a] bg-[#151518] hover:border-[#ff7a45]/60 hover:bg-[#1c1c1f] shadow-lg shadow-black/20",
                    isSelected && "border-[#ff7a45]/70 bg-[#ff7a45]/10 shadow-lg shadow-[#ff7a45]/30"
                  )}
                >
                  <div className="flex items-start justify-between gap-4">
                    <div>
                      <p className="font-semibold text-[#f5f5f5]">{cinema.cinemaName}</p>
                      <p className="text-xs uppercase tracking-wide text-[#9e9ea2]">
                        #{cinema.cinemaId} · {cinema.code}
                      </p>
                      <p className="mt-1 text-xs text-[#9e9ea2]">{cinema.address}</p>
                    </div>
                    <div className="text-xs text-[#9e9ea2] text-right">
                      <p>
                        Tổng phòng: <span className="text-[#f5f5f5]">{cinema.totalScreens ?? 0}</span>
                      </p>
                      <p>
                        Đang hoạt động: <span className="text-emerald-300">{cinema.activeScreens ?? 0}</span>
                      </p>
                    </div>
                  </div>
                </button>
              );
            })
          )}
        </div>

        {!loading && !errorMessage && filtered.length > 0 && (
          <>
            <button
              type="button"
              onClick={() => scrollByDistance(-320)}
              className={cn(
                "absolute left-2 top-1/2 -translate-y-1/2 rounded-full border border-[#3a3a3d] bg-[#151518] p-2 text-[#f5f5f5] shadow-lg transition-opacity",
                "hover:border-[#ff7a45]/60 hover:text-[#ff7a45]",
                canScrollLeft ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Cuộn danh sách rạp sang trái"
            >
              <ChevronLeft className="size-4" />
            </button>
            <button
              type="button"
              onClick={() => scrollByDistance(320)}
              className={cn(
                "absolute right-2 top-1/2 -translate-y-1/2 rounded-full border border-[#3a3a3d] bg-[#151518] p-2 text-[#f5f5f5] shadow-lg transition-opacity",
                "hover:border-[#ff7a45]/60 hover:text-[#ff7a45]",
                canScrollRight ? "opacity-100" : "opacity-0 pointer-events-none"
              )}
              aria-label="Cuộn danh sách rạp sang phải"
            >
              <ChevronRight className="size-4" />
            </button>
          </>
        )}
      </div>
    </div>
  );
};

export default CinemaSelectionPanel;
