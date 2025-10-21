import { RefreshCw, Search } from 'lucide-react';
import { motion } from 'framer-motion';

interface UserFiltersProps {
  totalUsers: number;
  searchTerm: string;
  setSearchTerm: (term: string) => void;
  roleFilter: string;
  setRoleFilter: (role: string) => void;
  sortBy: string;
  setSortBy: (sort: string) => void;
  sortOrder: 'asc' | 'desc';
  setSortOrder: (order: 'asc' | 'desc') => void;
  onSearch: (e: React.FormEvent) => void;
  onRefresh: () => void;
}

export const UserFilters = ({
  totalUsers,
  searchTerm,
  setSearchTerm,
  roleFilter,
  setRoleFilter,
  sortBy,
  setSortBy,
  sortOrder,
  setSortOrder,
  onSearch,
  onRefresh
}: UserFiltersProps) => {
  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 p-6 rounded-2xl border border-slate-700/50 backdrop-blur-sm shadow-2xl"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      {/* Header with animated elements */}
      <motion.div 
        className="flex flex-col md:flex-row md:items-center md:justify-between gap-4 mb-6"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        transition={{ delay: 0.2, duration: 0.5 }}
      >
        <motion.h2 
          className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-heading"
          initial={{ x: -20, opacity: 0 }}
          animate={{ x: 0, opacity: 1 }}
          transition={{ delay: 0.3, duration: 0.5 }}
        >
          Quản lý người dùng
        </motion.h2>
        
        <div className="flex items-center gap-4">
          <motion.span 
            className="text-gray-300 flex items-center gap-2 font-body"
            initial={{ scale: 0 }}
            animate={{ scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <div className="w-2 h-2 bg-green-400 rounded-full animate-pulse"></div>
            Tổng số người dùng: {totalUsers}
          </motion.span>
          
          <motion.button
            onClick={onRefresh}
            className="px-4 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-xl transition-all duration-300 flex items-center gap-2 shadow-lg hover:shadow-blue-500/25 font-body"
            whileHover={{ scale: 1.05, y: -2 }}
            whileTap={{ scale: 0.95 }}
            initial={{ opacity: 0, x: 20 }}
            animate={{ opacity: 1, x: 0 }}
            transition={{ delay: 0.5, duration: 0.5 }}
          >
            <motion.div
              animate={{ rotate: 0 }}
              whileHover={{ rotate: 180 }}
              transition={{ duration: 0.5 }}
            >
              <RefreshCw size={16} />
            </motion.div>
            Làm mới
          </motion.button>
        </div>
      </motion.div>

      {/* Search and Filters with stagger animation */}
      <motion.div 
        className="grid grid-cols-1 md:grid-cols-4 gap-4"
        initial="hidden"
        animate="visible"
        variants={{
          hidden: { opacity: 0 },
          visible: {
            opacity: 1,
            transition: {
              staggerChildren: 0.1,
              delayChildren: 0.6
            }
          }
        }}
      >
        <motion.form 
          onSubmit={onSearch} 
          className="flex"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
        >
          <input
            type="text"
            placeholder="Tìm kiếm người dùng..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="flex-1 px-4 py-3 bg-slate-700/50 text-white rounded-l-xl border border-slate-600/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm font-body"
          />
          <motion.button
            type="submit"
            className="px-4 py-3 bg-gradient-to-r from-blue-500 to-cyan-500 hover:from-blue-600 hover:to-cyan-600 text-white rounded-r-xl transition-all duration-300 shadow-lg font-body"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Search size={16} />
          </motion.button>
        </motion.form>

        <motion.select
          value={roleFilter}
          onChange={(e) => setRoleFilter(e.target.value)}
          className="px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm cursor-pointer font-body"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          whileHover={{ scale: 1.02 }}
        >
          <option value="">Tất cả vai trò</option>
          <option value="admin">Quản trị viên</option>
          <option value="customer">Khách hàng</option>
          <option value="staff">Nhân viên</option>
        </motion.select>

        <motion.select
          value={sortBy}
          onChange={(e) => setSortBy(e.target.value)}
          className="px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm cursor-pointer font-body"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          whileHover={{ scale: 1.02 }}
        >
          <option value="created_at">Ngày tạo</option>
          <option value="name">Tên</option>
          <option value="email">Email</option>
          <option value="role">Vai trò</option>
        </motion.select>

        <motion.select
          value={sortOrder}
          onChange={(e) => setSortOrder(e.target.value as 'asc' | 'desc')}
          className="px-4 py-3 bg-slate-700/50 text-white rounded-xl border border-slate-600/50 focus:outline-none focus:border-blue-500/50 focus:ring-2 focus:ring-blue-500/20 transition-all duration-300 backdrop-blur-sm cursor-pointer font-body"
          variants={{
            hidden: { opacity: 0, x: -20 },
            visible: { opacity: 1, x: 0 }
          }}
          whileHover={{ scale: 1.02 }}
        >
          <option value="desc">Giảm dần</option>
          <option value="asc">Tăng dần</option>
        </motion.select>
      </motion.div>
    </motion.div>
  );
};
