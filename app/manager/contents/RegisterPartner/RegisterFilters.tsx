import React from 'react';
import { Search, RefreshCw, Filter } from 'lucide-react';
import { motion } from 'framer-motion';

interface RegisterFiltersProps {
  totalPartners: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  sortBy: string;
  setSortBy: (sortBy: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onSearch: (e: React.FormEvent) => void;
  onRefresh: () => void;
}

export const RegisterFilters = ({
  totalPartners,
  searchTerm,
  setSearchTerm,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onSearch,
  onRefresh
}: RegisterFiltersProps) => {
  return (
    <motion.div 
      className="rounded-2xl border border-white/10 bg-white/5 p-6 text-white backdrop-blur-lg shadow-lg"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="flex flex-col gap-6 lg:flex-row lg:items-center lg:justify-between">
          {/* Search and Stats */}
          <div className="flex flex-1 flex-col gap-4 sm:flex-row">
            <form onSubmit={onSearch} className="flex-1">
              <div className="relative">
                <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={20} />
                <input
                  type="text"
                  value={searchTerm}
                  onChange={(e) => setSearchTerm(e.target.value)}
                  placeholder="Tìm kiếm theo tên đối tác, email, MST..."
                  className="font-body w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-10 pr-4 text-white placeholder:text-gray-500 focus:outline-none focus:border-blue-400/80"
                />
              </div>
            </form>
            
            <motion.button
              onClick={onRefresh}
              className="font-body flex items-center gap-2 rounded-lg border border-white/10 bg-white/5 px-4 py-3 text-sm text-white transition hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <RefreshCw size={16} />
              Làm mới
            </motion.button>
          </div>

          {/* Sort Controls */}
          <div className="flex flex-col gap-3 sm:flex-row sm:items-center">
            <div className="flex items-center gap-2 text-sm text-gray-300">
              <Filter size={16} className="text-gray-400" />
              <span className="font-body">Sắp xếp:</span>
            </div>
            
            <select
              value={sortBy}
              onChange={(e) => setSortBy(e.target.value)}
              className="font-body rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/80"
            >
              <option className="bg-slate-900 text-white" value="created_at">Ngày đăng ký</option>
              <option className="bg-slate-900 text-white" value="partner_name">Tên đối tác</option>
              <option className="bg-slate-900 text-white" value="email">Email</option>
              <option className="bg-slate-900 text-white" value="phone">Số điện thoại</option>
              <option className="bg-slate-900 text-white" value="tax_code">Mã số thuế</option>
              <option className="bg-slate-900 text-white" value="updated_at">Ngày cập nhật</option>
            </select>
            
            <select
              value={sortOrder}
              onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
              className="font-body rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-sm text-white focus:outline-none focus:border-blue-400/80"
            >
              <option className="bg-slate-900 text-white" value="desc">Giảm dần</option>
              <option className="bg-slate-900 text-white" value="asc">Tăng dần</option>
            </select>
          </div>
        </div>

        {/* Stats */}
        <motion.div 
          className="mt-6 border-t border-white/10 pt-4"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="flex flex-col gap-2 text-sm text-gray-300 sm:flex-row sm:items-center sm:justify-between">
            <div className="font-body">
              Tổng cộng: <span className="text-white font-medium">{totalPartners}</span> đối tác chờ duyệt
            </div>
            
            {searchTerm && (
              <motion.div 
                className="font-body text-sm text-blue-300"
                initial={{ opacity: 0, scale: 0.8 }}
                animate={{ opacity: 1, scale: 1 }}
                transition={{ delay: 0.2, type: "spring" }}
              >
                Kết quả tìm kiếm cho: "{searchTerm}"
              </motion.div>
            )}
          </div>
        </motion.div>
    </motion.div>
  );
};