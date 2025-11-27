"use client";

import { motion } from "framer-motion";
import {
  Eye,
  ChevronLeft,
  ChevronRight,
  Globe,
  Monitor,
  Clock,
  User,
  Database,
  Activity,
  Loader2,
} from "lucide-react";
import {
  type AuditLog,
  getActionColor,
  getRoleColor,
  formatAuditTimestamp,
  getHttpMethodColor,
} from "@/apis/admin.auditlog.api";

interface AuditLogTableProps {
  logs: AuditLog[];
  isLoading: boolean;
  currentPage: number;
  totalLogs: number;
  limit: number;
  onViewLog: (log: AuditLog) => void;
  onPageChange: (page: number) => void;
}

export const AuditLogTable = ({
  logs,
  isLoading,
  currentPage,
  totalLogs,
  limit,
  onViewLog,
  onPageChange,
}: AuditLogTableProps) => {
  const totalPages = Math.ceil(totalLogs / limit);
  const startIndex = (currentPage - 1) * limit + 1;
  const endIndex = Math.min(currentPage * limit, totalLogs);

  // Generate page numbers to display
  const getPageNumbers = () => {
    const pages: (number | string)[] = [];
    const maxVisiblePages = 5;

    if (totalPages <= maxVisiblePages) {
      for (let i = 1; i <= totalPages; i++) {
        pages.push(i);
      }
    } else {
      if (currentPage <= 3) {
        for (let i = 1; i <= 4; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      } else if (currentPage >= totalPages - 2) {
        pages.push(1);
        pages.push("...");
        for (let i = totalPages - 3; i <= totalPages; i++) {
          pages.push(i);
        }
      } else {
        pages.push(1);
        pages.push("...");
        for (let i = currentPage - 1; i <= currentPage + 1; i++) {
          pages.push(i);
        }
        pages.push("...");
        pages.push(totalPages);
      }
    }

    return pages;
  };

  const tableRowVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: (i: number) => ({
      opacity: 1,
      y: 0,
      transition: {
        delay: i * 0.03,
        duration: 0.3,
      },
    }),
  };

  if (isLoading) {
    return (
      <motion.div
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Loader2 className="w-10 h-10 text-amber-500 animate-spin mb-4" />
          <p className="text-gray-400">Đang tải dữ liệu...</p>
        </div>
      </motion.div>
    );
  }

  if (logs.length === 0) {
    return (
      <motion.div
        className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 p-8"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
      >
        <div className="flex flex-col items-center justify-center py-12">
          <Activity className="w-16 h-16 text-gray-600 mb-4" />
          <p className="text-gray-400 text-lg">Không có bản ghi nào</p>
          <p className="text-gray-500 text-sm mt-2">
            Thử thay đổi bộ lọc để tìm kiếm
          </p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="bg-slate-800/50 backdrop-blur-xl rounded-2xl border border-slate-700/50 overflow-hidden"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.3, delay: 0.1 }}
    >
      {/* Table */}
      <div className="overflow-x-auto">
        <table className="w-full">
          <thead>
            <tr className="bg-slate-900/50 border-b border-slate-700/50">
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Clock size={14} />
                  Thời gian
                </div>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <User size={14} />
                  User
                </div>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Activity size={14} />
                  Hành động
                </div>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Database size={14} />
                  Bảng
                </div>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Globe size={14} />
                  IP / Method
                </div>
              </th>
              <th className="px-4 py-4 text-left text-xs font-semibold text-gray-400 uppercase tracking-wider">
                <div className="flex items-center gap-2">
                  <Monitor size={14} />
                  Path
                </div>
              </th>
              <th className="px-4 py-4 text-center text-xs font-semibold text-gray-400 uppercase tracking-wider">
                Chi tiết
              </th>
            </tr>
          </thead>
          <tbody className="divide-y divide-slate-700/30">
            {logs.map((log, index) => (
              <motion.tr
                key={log.logId}
                custom={index}
                variants={tableRowVariants}
                initial="hidden"
                animate="visible"
                className="hover:bg-slate-700/30 transition-colors group"
              >
                {/* Timestamp */}
                <td className="px-4 py-4">
                  <div className="text-sm text-white font-medium">
                    {formatAuditTimestamp(log.timestamp)}
                  </div>
                  <div className="text-xs text-gray-500">ID: {log.logId}</div>
                </td>

                {/* User */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <div className="w-8 h-8 bg-gradient-to-br from-slate-600 to-slate-700 rounded-full flex items-center justify-center">
                      <User size={14} className="text-gray-300" />
                    </div>
                    <div>
                      <div className="text-sm text-white">
                        {log.userId ? `#${log.userId}` : "System"}
                      </div>
                      {log.role && (
                        <span
                          className={`inline-flex px-2 py-0.5 text-xs rounded-full border ${getRoleColor(
                            log.role
                          )}`}
                        >
                          {log.role}
                        </span>
                      )}
                    </div>
                  </div>
                </td>

                {/* Action */}
                <td className="px-4 py-4">
                  <span
                    className={`inline-flex px-3 py-1 text-xs font-medium rounded-full border ${getActionColor(
                      log.action
                    )}`}
                  >
                    {log.action}
                  </span>
                </td>

                {/* Table Name */}
                <td className="px-4 py-4">
                  <div className="flex items-center gap-2">
                    <Database size={14} className="text-gray-500" />
                    <span className="text-sm text-gray-300">{log.tableName}</span>
                    {log.recordId && (
                      <span className="text-xs text-gray-500">
                        #{log.recordId}
                      </span>
                    )}
                  </div>
                </td>

                {/* IP / Method */}
                <td className="px-4 py-4">
                  <div className="text-sm text-gray-300">{log.ipAddress || "-"}</div>
                  {log.metadata?.httpMethod && (
                    <span
                      className={`text-xs font-mono ${getHttpMethodColor(
                        log.metadata.httpMethod
                      )}`}
                    >
                      {log.metadata.httpMethod}
                    </span>
                  )}
                </td>

                {/* Path */}
                <td className="px-4 py-4">
                  <div
                    className="text-sm text-gray-400 font-mono truncate max-w-[200px]"
                    title={log.metadata?.path || ""}
                  >
                    {log.metadata?.path || "-"}
                  </div>
                  {log.metadata?.statusCode && (
                    <span
                      className={`text-xs ${
                        log.metadata.statusCode >= 200 && log.metadata.statusCode < 300
                          ? "text-green-400"
                          : log.metadata.statusCode >= 400
                          ? "text-red-400"
                          : "text-yellow-400"
                      }`}
                    >
                      Status: {log.metadata.statusCode}
                    </span>
                  )}
                </td>

                {/* Actions */}
                <td className="px-4 py-4">
                  <div className="flex items-center justify-center">
                    <motion.button
                      onClick={() => onViewLog(log)}
                      className="p-2 bg-slate-700/50 hover:bg-amber-500/20 border border-slate-600/50 hover:border-amber-500/50 rounded-lg text-gray-400 hover:text-amber-400 transition-all"
                      whileHover={{ scale: 1.1 }}
                      whileTap={{ scale: 0.95 }}
                      title="Xem chi tiết"
                    >
                      <Eye size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      <div className="px-6 py-4 border-t border-slate-700/50 flex flex-col sm:flex-row items-center justify-between gap-4">
        <div className="text-sm text-gray-400">
          Hiển thị{" "}
          <span className="font-medium text-white">{startIndex}</span> -{" "}
          <span className="font-medium text-white">{endIndex}</span> trong tổng{" "}
          <span className="font-medium text-white">{totalLogs}</span> bản ghi
        </div>

        <div className="flex items-center gap-2">
          <motion.button
            onClick={() => onPageChange(currentPage - 1)}
            disabled={currentPage === 1}
            className={`p-2 rounded-lg border transition-all ${
              currentPage === 1
                ? "bg-slate-800/50 border-slate-700/50 text-gray-600 cursor-not-allowed"
                : "bg-slate-700/50 border-slate-600/50 text-gray-300 hover:bg-slate-700 hover:text-white"
            }`}
            whileHover={currentPage !== 1 ? { scale: 1.05 } : {}}
            whileTap={currentPage !== 1 ? { scale: 0.95 } : {}}
          >
            <ChevronLeft size={18} />
          </motion.button>

          <div className="flex items-center gap-1">
            {getPageNumbers().map((page, index) =>
              page === "..." ? (
                <span key={`ellipsis-${index}`} className="px-2 text-gray-500">
                  ...
                </span>
              ) : (
                <motion.button
                  key={page}
                  onClick={() => onPageChange(page as number)}
                  className={`min-w-[36px] h-9 px-3 rounded-lg border text-sm font-medium transition-all ${
                    currentPage === page
                      ? "bg-gradient-to-r from-amber-500 to-orange-500 border-amber-500/50 text-white shadow-lg"
                      : "bg-slate-700/50 border-slate-600/50 text-gray-300 hover:bg-slate-700 hover:text-white"
                  }`}
                  whileHover={{ scale: 1.05 }}
                  whileTap={{ scale: 0.95 }}
                >
                  {page}
                </motion.button>
              )
            )}
          </div>

          <motion.button
            onClick={() => onPageChange(currentPage + 1)}
            disabled={currentPage === totalPages}
            className={`p-2 rounded-lg border transition-all ${
              currentPage === totalPages
                ? "bg-slate-800/50 border-slate-700/50 text-gray-600 cursor-not-allowed"
                : "bg-slate-700/50 border-slate-600/50 text-gray-300 hover:bg-slate-700 hover:text-white"
            }`}
            whileHover={currentPage !== totalPages ? { scale: 1.05 } : {}}
            whileTap={currentPage !== totalPages ? { scale: 0.95 } : {}}
          >
            <ChevronRight size={18} />
          </motion.button>
        </div>
      </div>
    </motion.div>
  );
};
