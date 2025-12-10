"use client";

import { motion } from 'framer-motion';
import { Search, Filter, SortAsc, SortDesc } from 'lucide-react';

interface StaffFiltersProps {
  isActiveFilter: boolean | undefined;
  searchTerm: string;
  sortBy: string;
  sortOrder: 'asc' | 'desc';
  onIsActiveFilterChange: (value: boolean | undefined) => void;
  onSearchChange: (value: string) => void;
  onSortByChange: (value: string) => void;
  onSortOrderChange: (value: 'asc' | 'desc') => void;
}

const StaffFilters = ({
  isActiveFilter,
  searchTerm,
  sortBy,
  sortOrder,
  onIsActiveFilterChange,
  onSearchChange,
  onSortByChange,
  onSortOrderChange,
}: StaffFiltersProps) => {
  return (
    <motion.div
      className="rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur-xl"
      initial={{ opacity: 0, y: -10 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      <div className="mb-4 flex items-center gap-2">
        <Filter className="h-5 w-5 text-indigo-400" />
        <h3 className="font-heading text-lg font-semibold text-white">Bộ lọc</h3>
      </div>

      <div className="grid grid-cols-1 gap-4 md:grid-cols-2 lg:grid-cols-4">
        {/* Search */}
        <div className="space-y-2">
          <label className="font-body text-xs text-gray-400">Tìm kiếm</label>
          <div className="relative">
            <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              type="text"
              value={searchTerm}
              onChange={(e) => onSearchChange(e.target.value)}
              placeholder="Tên, email, SĐT..."
              className="w-full rounded-lg border border-white/10 bg-white/5 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-500 focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
            />
          </div>
        </div>

        {/* Status Filter */}
        <div className="space-y-2">
          <label className="font-body text-xs text-gray-400">Trạng thái</label>
          <select
            value={isActiveFilter === undefined ? 'all' : isActiveFilter ? 'active' : 'inactive'}
            onChange={(e) => {
              const value = e.target.value;
              if (value === 'all') onIsActiveFilterChange(undefined);
              else if (value === 'active') onIsActiveFilterChange(true);
              else onIsActiveFilterChange(false);
            }}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          >
            <option value="all" className="bg-slate-900">Tất cả</option>
            <option value="active" className="bg-slate-900">Hoạt động</option>
            <option value="inactive" className="bg-slate-900">Vô hiệu hóa</option>
          </select>
        </div>

        {/* Sort By */}
        <div className="space-y-2">
          <label className="font-body text-xs text-gray-400">Sắp xếp theo</label>
          <select
            value={sortBy}
            onChange={(e) => onSortByChange(e.target.value)}
            className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white focus:border-indigo-500/50 focus:outline-none focus:ring-1 focus:ring-indigo-500/50"
          >
            <option value="fullName" className="bg-slate-900">Họ tên</option>
            <option value="email" className="bg-slate-900">Email</option>
            <option value="hireDate" className="bg-slate-900">Ngày tuyển dụng</option>
            <option value="managerStaffId" className="bg-slate-900">ID</option>
          </select>
        </div>

        {/* Sort Order */}
        <div className="space-y-2">
          <label className="font-body text-xs text-gray-400">Thứ tự</label>
          <motion.button
            onClick={() => onSortOrderChange(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex w-full items-center justify-center gap-2 rounded-lg border border-white/10 bg-white/5 py-2 px-3 text-sm text-white transition hover:bg-white/10"
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            {sortOrder === 'asc' ? (
              <>
                <SortAsc className="h-4 w-4" />
                Tăng dần
              </>
            ) : (
              <>
                <SortDesc className="h-4 w-4" />
                Giảm dần
              </>
            )}
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};

export default StaffFilters;
