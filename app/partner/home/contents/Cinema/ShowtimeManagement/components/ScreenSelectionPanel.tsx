import { useMemo } from "react";
import type { PartnerScreen } from "@/apis/partner.screen.api";
import { MonitorPlay, RefreshCw } from "lucide-react";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";

interface ScreenSelectionPanelProps {
  screens: PartnerScreen[];
  loading: boolean;
  errorMessage?: string;
  selectedScreenId: number | null;
  onSelect: (screen: PartnerScreen) => void;
  onRefresh: () => void;
}

const ScreenSelectionPanel = ({
  screens,
  loading,
  errorMessage,
  selectedScreenId,
  onSelect,
  onRefresh,
}: ScreenSelectionPanelProps) => {
  const sortedScreens = useMemo(() => {
    return [...screens].sort((a, b) => a.screenName.localeCompare(b.screenName));
  }, [screens]);

  return (
    <div className="space-y-4">
      <div className="flex items-center justify-between">
        <div className="flex items-center gap-2 text-[#f5f5f5]/80">
          <MonitorPlay className="size-5 text-[#ff7a45]" />
          <div>
            <p className="text-sm font-medium uppercase tracking-wide text-[#f5f5f5]/80">
              Chọn phòng chiếu
            </p>
            <p className="text-xs text-[#9e9ea2]">
              Danh sách phòng thuộc rạp đã chọn
            </p>
          </div>
        </div>
        <Button
          size="sm"
          variant="outline"
          onClick={onRefresh}
          disabled={loading}
          className="border border-[#3a3a3d] bg-[#27272a] text-[#f5f5f5] hover:bg-[#1c1c1f]"
        >
          <RefreshCw className={cn("size-4", loading && "animate-spin")} />
          Làm mới
        </Button>
      </div>

      <div className="grid gap-3">
        {loading ? (
          <div className="flex min-h-[160px] items-center justify-center text-sm text-[#9e9ea2]">
            Đang tải danh sách phòng chiếu...
          </div>
        ) : errorMessage ? (
          <div className="rounded-lg border border-rose-500/40 bg-rose-500/15 p-4 text-sm text-rose-200">
            {errorMessage}
          </div>
        ) : sortedScreens.length === 0 ? (
          <div className="flex min-h-[160px] items-center justify-center text-sm text-[#9e9ea2]">
            Rạp này chưa có phòng chiếu nào.
          </div>
        ) : (
          sortedScreens.map((screen) => {
            const isSelected = screen.screenId === selectedScreenId;
            return (
              <button
                key={screen.screenId}
                type="button"
                onClick={() => onSelect(screen)}
                className={cn(
                  "flex items-center justify-between rounded-lg border px-4 py-3 text-left transition",
                  "border-[#27272a] bg-[#151518] hover:border-[#ff7a45]/60 hover:bg-[#1c1c1f] shadow-lg shadow-black/20",
                  isSelected && "border-[#ff7a45]/70 bg-[#ff7a45]/10 shadow-lg shadow-[#ff7a45]/30"
                )}
              >
                <div className="space-y-1">
                  <p className="font-semibold text-[#f5f5f5]">{screen.screenName}</p>
                  <p className="text-xs uppercase text-[#9e9ea2]">
                    #{screen.screenId} · {screen.code}
                  </p>
                  <p className="text-xs text-[#9e9ea2]">
                    {screen.screenType?.toUpperCase()} • {screen.soundSystem}
                  </p>
                </div>
                <div className="text-right text-xs text-[#9e9ea2]">
                  <p>
                    Sức chứa: <span className="text-[#f5f5f5]">{screen.capacity}</span>
                  </p>
                  <p>
                    Ghế: {screen.seatRows} x {screen.seatColumns}
                  </p>
                </div>
              </button>
            );
          })
        )}
      </div>
    </div>
  );
};

export default ScreenSelectionPanel;
