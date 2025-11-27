"use client";

import { useState } from "react";
import { motion } from "framer-motion";
import {
  Search,
  Filter,
  RefreshCw,
  Calendar,
  User,
  Shield,
  Activity,
  Database,
  X,
} from "lucide-react";

interface AuditLogFiltersProps {
  totalLogs: number;
  searchTerm: string;
  setSearchTerm: (value: string) => void;
  userId: string;
  setUserId: (value: string) => void;
  role: string;
  setRole: (value: string) => void;
  action: string;
  setAction: (value: string) => void;
  tableName: string;
  setTableName: (value: string) => void;
  fromDate: string;
  setFromDate: (value: string) => void;
  toDate: string;
  setToDate: (value: string) => void;
  sortOrder: "asc" | "desc";
  setSortOrder: (value: "asc" | "desc") => void;
  onSearch: (e: React.FormEvent) => void;
  onRefresh: () => void;
  onClearFilters: () => void;
}

const roleOptions = [
  { value: "", label: "Tất cả vai trò" },
  { value: "Admin", label: "Admin" },
  { value: "Manager", label: "Manager" },
  { value: "Partner", label: "Partner" },
  { value: "Employee", label: "Employee" },
  { value: "Customer", label: "Customer" },
];

const actionOptions = [
  { value: "", label: "Tất cả hành động" },
  { value: "AUTH_LOGIN", label: "Đăng nhập" },
  { value: "AUTH_LOGOUT", label: "Đăng xuất" },
  { value: "AUTH_REGISTER", label: "Đăng ký" },
  { value: "USER_CREATE", label: "Tạo user" },
  { value: "USER_UPDATE", label: "Cập nhật user" },
  { value: "USER_DELETE", label: "Xóa user" },
  { value: "USER_BAN", label: "Ban user" },
  { value: "USER_UNBAN", label: "Unban user" },
  { value: "CINEMA_CREATE", label: "Tạo rạp" },
  { value: "CINEMA_UPDATE", label: "Cập nhật rạp" },
  { value: "CINEMA_DELETE", label: "Xóa rạp" },
  { value: "MOVIE_CREATE", label: "Tạo phim" },
  { value: "MOVIE_UPDATE", label: "Cập nhật phim" },
  { value: "BOOKING_CREATE", label: "Tạo booking" },
  { value: "BOOKING_UPDATE", label: "Cập nhật booking" },
  { value: "PAYMENT_CREATE", label: "Thanh toán" },
];

const tableNameOptions = [
  { value: "", label: "Tất cả bảng" },
  { value: "UserAuth", label: "UserAuth" },
  { value: "Users", label: "Users" },
  { value: "Cinemas", label: "Cinemas" },
  { value: "Movies", label: "Movies" },
  { value: "Bookings", label: "Bookings" },
  { value: "Showtimes", label: "Showtimes" },
  { value: "Payments", label: "Payments" },
  { value: "Screens", label: "Screens" },
  { value: "Seats", label: "Seats" },
];

export const AuditLogFilters = ({
  totalLogs,
  searchTerm,
  setSearchTerm,
  userId,
  setUserId,
  role,
  setRole,
  action,
  setAction,
  tableName,
  setTableName,
  fromDate,
  setFromDate,
  toDate,
  setToDate,
  sortOrder,
  setSortOrder,
  onSearch,
  onRefresh,
  onClearFilters,
}: AuditLogFiltersProps) => {
  const [showAdvancedFilters, setShowAdvancedFilters] = useState(false);

  const hasActiveFilters =
    searchTerm ||
    userId ||
    role ||
    action ||
    tableName ||
    fromDate ||
    toDate;

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-6"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3 }}
    >
      {/* Header */}
      <div className="flex flex-col lg:flex-row lg:items-center lg:justify-between gap-4 mb-6">
        <div className="flex items-center gap-3">
          <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
            <Activity size={24} className="text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-white">Nhật ký hoạt động</h2>
            <p className="text-sm text-gray-400">
              Tổng cộng {totalLogs.toLocaleString()} bản ghi
            </p>
          </div>
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => setShowAdvancedFilters(!showAdvancedFilters)}
            className={`flex items-center gap-2 px-4 py-2 rounded-xl border transition-all ${
              showAdvancedFilters
                ? "bg-amber-500/20 border-amber-500/50 text-amber-400"
                : "bg-slate-700/50 border-slate-600/50 text-gray-300 hover:bg-slate-700"
            }`}
            whileHover={{ scale: 1.02 }}
            whileTap={{ scale: 0.98 }}
          >
            <Filter size={18} />
            <span>Bộ lọc nâng cao</span>
          </motion.button>

          {hasActiveFilters && (
            <motion.button
              onClick={onClearFilters}
              className="flex items-center gap-2 px-4 py-2 rounded-xl bg-red-500/20 border border-red-500/50 text-red-400 hover:bg-red-500/30 transition-all"
              whileHover={{ scale: 1.02 }}
              whileTap={{ scale: 0.98 }}
              initial={{ opacity: 0, scale: 0.8 }}
              animate={{ opacity: 1, scale: 1 }}
            >
              <X size={18} />
              <span>Xóa bộ lọc</span>
            </motion.button>
          )}

          <motion.button
            onClick={onRefresh}
            className="flex items-center gap-2 px-4 py-2 rounded-xl bg-slate-700/50 border border-slate-600/50 text-gray-300 hover:bg-slate-700 transition-all"
            whileHover={{ scale: 1.02, rotate: 180 }}
            whileTap={{ scale: 0.98 }}
          >
            <RefreshCw size={18} />
          </motion.button>
        </div>
      </div>

      {/* Search Bar */}
      <form onSubmit={onSearch} className="mb-4">
        <div className="relative">
          <Search
            className="absolute left-4 top-1/2 -translate-y-1/2 text-gray-400"
            size={20}
          />
          <input
            type="text"
            placeholder="Tìm kiếm theo IP, User Agent, Path..."
            value={searchTerm}
            onChange={(e) => setSearchTerm(e.target.value)}
            className="w-full pl-12 pr-4 py-3 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50 focus:border-amber-500/50 transition-all"
          />
        </div>
      </form>

      {/* Quick Filters */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 mb-4">
        {/* Role Filter */}
        <div className="relative">
          <Shield
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={role}
            onChange={(e) => setRole(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
          >
            {roleOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Action Filter */}
        <div className="relative">
          <Activity
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={action}
            onChange={(e) => setAction(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
          >
            {actionOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Table Name Filter */}
        <div className="relative">
          <Database
            className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
            size={18}
          />
          <select
            value={tableName}
            onChange={(e) => setTableName(e.target.value)}
            className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
          >
            {tableNameOptions.map((option) => (
              <option
                key={option.value}
                value={option.value}
                className="bg-slate-800"
              >
                {option.label}
              </option>
            ))}
          </select>
        </div>

        {/* Sort Order */}
        <div className="relative">
          <select
            value={sortOrder}
            onChange={(e) => setSortOrder(e.target.value as "asc" | "desc")}
            className="w-full px-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50 appearance-none cursor-pointer"
          >
            <option value="desc" className="bg-slate-800">
              Mới nhất trước
            </option>
            <option value="asc" className="bg-slate-800">
              Cũ nhất trước
            </option>
          </select>
        </div>
      </div>

      {/* Advanced Filters */}
      {showAdvancedFilters && (
        <motion.div
          className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4 pt-4 border-t border-slate-700/50"
          initial={{ opacity: 0, height: 0 }}
          animate={{ opacity: 1, height: "auto" }}
          exit={{ opacity: 0, height: 0 }}
          transition={{ duration: 0.2 }}
        >
          {/* User ID */}
          <div className="relative">
            <User
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="number"
              placeholder="User ID"
              value={userId}
              onChange={(e) => setUserId(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-amber-500/50"
            />
          </div>

          {/* From Date */}
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="datetime-local"
              value={fromDate}
              onChange={(e) => setFromDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Từ ngày"
            />
          </div>

          {/* To Date */}
          <div className="relative">
            <Calendar
              className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
              size={18}
            />
            <input
              type="datetime-local"
              value={toDate}
              onChange={(e) => setToDate(e.target.value)}
              className="w-full pl-10 pr-4 py-2.5 bg-slate-700/50 border border-slate-600/50 rounded-xl text-white focus:outline-none focus:ring-2 focus:ring-amber-500/50"
              placeholder="Đến ngày"
            />
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
