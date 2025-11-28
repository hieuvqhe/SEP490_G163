import { Button } from "@/components/ui/button";
import PaginationControls from "../../CinemaInfo/components/PaginationControls";
import { cn } from "@/lib/utils";
import { ArrowUpDown, Eye, LayoutPanelTop, Monitor, PencilLine } from "lucide-react";
import type {
  PartnerScreen,
  PartnerScreensPagination,
} from "@/apis/partner.screen.api";

interface ScreenTableProps {
  screens: PartnerScreen[];
  loading: boolean;
  errorMessage?: string;
  pagination?: PartnerScreensPagination;
  sortBy: string;
  sortOrder: "asc" | "desc";
  onSortChange: (field: string) => void;
  onPageChange: (page: number) => void;
  onView: (screen: PartnerScreen) => void;
  onEdit: (screen: PartnerScreen) => void;
  onDelete: (screen: PartnerScreen) => void;
  onViewSeatLayout?: (screen: PartnerScreen) => void;
  /** Có quyền chỉnh sửa phòng chiếu không */
  canEdit?: boolean;
  /** Có quyền xóa/vô hiệu hóa phòng chiếu không */
  canDelete?: boolean;
}

const DisableIcon = ({ className, ...props }: React.SVGProps<SVGSVGElement>) => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    xmlns="http://www.w3.org/2000/svg"
    className={className}
    {...props}
  >
    <path
      d="M20 15V6C20 5.44772 19.5523 5 19 5H9.5M4 8.5V15C4 15.5523 4.44772 16 5 16H12V20M12 20H16M12 20H8M3 3L21 21"
      stroke="#c5420eff"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
    />
  </svg>
);

const ScreenTable = ({
  screens,
  loading,
  errorMessage,
  pagination,
  sortBy,
  sortOrder,
  onSortChange,
  onPageChange,
  onView,
  onEdit,
  onDelete,
  onViewSeatLayout,
  canEdit = true,
  canDelete = true,
}: ScreenTableProps) => {
  const renderSortIcon = (columnKey: string) => {
    if (sortBy !== columnKey) return <ArrowUpDown className="size-4 text-[#9e9ea2]" />;
    return (
      <ArrowUpDown
        className={cn(
          "size-4 text-[#ff7a45]",
          sortOrder === "asc" && "rotate-180"
        )}
      />
    );
  };

  const renderStatusBadge = (screen: PartnerScreen) => {
    const active = screen.isActive;
    return (
      <span
        className={cn(
          "inline-flex items-center gap-2 rounded-full px-3 py-1 text-xs font-semibold tracking-wide",
          active
            ? "border border-emerald-500/40 bg-emerald-500/20 text-emerald-200"
            : "border border-rose-500/30 bg-rose-500/15 text-rose-200"
        )}
      >
        <span className={cn("size-1.5 rounded-full", active ? "bg-emerald-300" : "bg-rose-300")} />
        {active ? "Đang hoạt động" : "Ngừng hoạt động"}
      </span>
    );
  };

  const renderCapacity = (screen: PartnerScreen) => (
    <div className="text-sm text-[#f5f5f5]">
      <p>{screen.capacity} ghế</p>
      <p className="text-xs text-[#9e9ea2]">
        {screen.seatRows} hàng × {screen.seatColumns} ghế
      </p>
    </div>
  );

  const totalPages = pagination?.totalPages ?? 1;
  const currentPage = pagination?.currentPage ?? 1;

  return (
    <div
      className="rounded-xl border border-[#27272a] bg-[#151518] shadow-lg shadow-black/40"
      id="screen-tour-table"
    >
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-[#27272a]">
          <thead className="bg-[#27272a] text-xs font-semibold uppercase tracking-wider text-[#9e9ea2]">
            <tr id="screen-tour-table-sort">
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSortChange("screenName")}
                  className="flex items-center gap-2 text-[#9e9ea2] transition hover:text-[#ff7a45]"
                >
                  Tên phòng
                  {renderSortIcon("screenName")}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Mã phòng</th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSortChange("screenType")}
                  className="flex items-center gap-2 text-[#9e9ea2] transition hover:text-[#ff7a45]"
                >
                  Loại phòng
                  {renderSortIcon("screenType")}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Âm thanh</th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSortChange("capacity")}
                  className="flex items-center gap-2 text-[#9e9ea2] transition hover:text-[#ff7a45]"
                >
                  Sức chứa
                  {renderSortIcon("capacity")}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Trạng thái</th>
              <th className="px-4 py-3 text-left">
                <button
                  type="button"
                  onClick={() => onSortChange("updatedDate")}
                  className="flex items-center gap-2 text-[#9e9ea2] transition hover:text-[#ff7a45]"
                >
                  Cập nhật
                  {renderSortIcon("updatedDate")}
                </button>
              </th>
              <th className="px-4 py-3 text-left">Thao tác</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-[#27272a]">
            {loading ? (
              [...Array(5)].map((_, index) => (
                <tr key={index} className="animate-pulse">
                  {[...Array(8)].map((__, cellIndex) => (
                    <td key={cellIndex} className="px-4 py-4">
                      <div className="h-4 rounded bg-[#27272a]" />
                    </td>
                  ))}
                </tr>
              ))
            ) : errorMessage ? (
              <tr>
                <td colSpan={8} className="px-4 py-6 text-center text-sm text-rose-300">
                  {errorMessage}
                </td>
              </tr>
            ) : screens.length === 0 ? (
              <tr>
                <td colSpan={8} className="px-4 py-10 text-center text-sm text-[#9e9ea2]">
                  Chưa có phòng chiếu nào cho rạp này.
                </td>
              </tr>
            ) : (
              screens.map((screen, index) => (
                <tr
                  key={screen.screenId}
                  className="bg-[#151518] transition-colors hover:bg-[#1c1c1f]"
                  id={index === 0 ? "screen-tour-row" : undefined}
                >
                  <td className="px-4 py-4">
                    <div className="flex items-center gap-3">
                      <div className="flex size-10 items-center justify-center rounded-lg bg-[#27272a] text-[#ff7a45]">
                        <Monitor className="size-5" />
                      </div>
                      <div>
                        <p className="font-semibold text-[#f5f5f5]">{screen.screenName}</p>
                        <p className="text-xs text-[#9e9ea2]">#{screen.screenId}</p>
                      </div>
                    </div>
                  </td>
                  <td className="px-4 py-4 font-mono text-xs text-[#9e9ea2]">{screen.code}</td>
                  <td className="px-4 py-4 text-sm text-[#f5f5f5] capitalize">
                    {screen.screenType || "—"}
                  </td>
                  <td className="px-4 py-4 text-sm text-[#d0d0d3]">{screen.soundSystem || "—"}</td>
                  <td className="px-4 py-4">{renderCapacity(screen)}</td>
                  <td className="px-4 py-4">{renderStatusBadge(screen)}</td>
                  <td className="px-4 py-4 text-sm text-[#9e9ea2]">
                    {new Date(screen.updatedDate).toLocaleString("vi-VN")}
                  </td>
                  <td className="px-4 py-4">
                    <div
                      className="flex items-center gap-2"
                      id={index === 0 ? "screen-tour-row-actions" : undefined}
                    >
                      {onViewSeatLayout && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                          onClick={() => onViewSeatLayout(screen)}
                          title={
                            screen.hasSeatLayout
                              ? "Xem hoặc cập nhật sơ đồ ghế"
                              : "Tạo sơ đồ ghế cho phòng này"
                          }
                        >
                          <LayoutPanelTop className="size-4" />
                        </Button>
                      )}
                      <Button
                        variant="outline"
                        size="icon-sm"
                        className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                        onClick={() => onView(screen)}
                        title="Xem chi tiết"
                      >
                        <Eye className="size-4" />
                      </Button>
                      {canEdit && (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-[#3a3a3d] text-[#f5f5f5] transition hover:bg-[#27272a] hover:text-white"
                          onClick={() => onEdit(screen)}
                          title="Chỉnh sửa"
                        >
                          <PencilLine className="size-4" />
                        </Button>
                      )}
                      {canDelete && (screen.isActive ? (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-rose-600/50 text-rose-300 transition hover:bg-rose-500/20 hover:text-white"
                          onClick={() => onDelete(screen)}
                          title="Vô hiệu hoá"
                        >
                          <DisableIcon className="size-4" />
                        </Button>
                      ) : (
                        <Button
                          variant="outline"
                          size="icon-sm"
                          className="border border-[#2b2b2e] text-[#9e9ea2]/60 opacity-70"
                          disabled
                          title="Phòng đã bị vô hiệu hoá"
                        >
                          <DisableIcon className="size-4" />
                        </Button>
                      ))}
                    </div>
                  </td>
                </tr>
              ))
            )}
          </tbody>
        </table>
      </div>

      <div id="screen-tour-pagination">
        <PaginationControls
          currentPage={currentPage}
          totalPages={totalPages}
          loading={loading}
          onPageChange={onPageChange}
        />
      </div>
    </div>
  );
};

export default ScreenTable;
