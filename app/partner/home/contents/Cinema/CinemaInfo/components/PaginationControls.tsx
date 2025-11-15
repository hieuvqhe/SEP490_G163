"use client";

import { Button } from "@/components/ui/button";
import { Loader2 } from "lucide-react";

interface PaginationControlsProps {
  currentPage: number;
  totalPages: number;
  loading?: boolean;
  onPageChange: (page: number) => void;
}

const PaginationControls = ({ currentPage, totalPages, loading, onPageChange }: PaginationControlsProps) => {
  return (
    <div
      className="flex items-center justify-between border-t border-[#27272a] bg-[#151518] px-4 py-3 text-sm text-[#9e9ea2]"
      id="cinema-tour-pagination"
    >
      <div>
        Trang {currentPage} / {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border border-[#3a3a3d] text-[#f5f5f5] hover:bg-[#27272a]"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || !!loading}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border border-[#3a3a3d] text-[#f5f5f5] hover:bg-[#27272a]"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || !!loading}
        >
          Sau
        </Button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-[#ff7a45]">
          <Loader2 className="size-4 animate-spin" />
          Đang tải dữ liệu
        </div>
      )}
    </div>
  );
};

export default PaginationControls;
