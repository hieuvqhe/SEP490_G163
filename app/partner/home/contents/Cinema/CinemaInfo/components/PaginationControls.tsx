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
    <div className="flex items-center justify-between border-t border-slate-800/60 bg-slate-900/60 px-4 py-3 text-sm text-slate-400">
      <div>
        Trang {currentPage} / {totalPages}
      </div>
      <div className="flex items-center gap-2">
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 text-slate-200 hover:bg-slate-800"
          onClick={() => onPageChange(currentPage - 1)}
          disabled={currentPage <= 1 || !!loading}
        >
          Trước
        </Button>
        <Button
          variant="outline"
          size="sm"
          className="border-slate-700 text-slate-200 hover:bg-slate-800"
          onClick={() => onPageChange(currentPage + 1)}
          disabled={currentPage >= totalPages || !!loading}
        >
          Sau
        </Button>
      </div>
      {loading && (
        <div className="flex items-center gap-2 text-orange-300">
          <Loader2 className="size-4 animate-spin" />
          Đang tải dữ liệu
        </div>
      )}
    </div>
  );
};

export default PaginationControls;
