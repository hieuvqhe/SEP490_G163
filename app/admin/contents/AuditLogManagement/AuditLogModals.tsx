"use client";

import { motion, type Variants } from "framer-motion";
import {
  X,
  User,
  Clock,
  Globe,
  Monitor,
  Database,
  Activity,
  FileText,
  Code,
  ArrowRight,
  Copy,
  Check,
} from "lucide-react";
import { useState } from "react";
import {
  type AuditLog,
  getActionColor,
  getRoleColor,
  formatAuditTimestamp,
  getHttpMethodColor,
} from "@/apis/admin.auditlog.api";

interface AuditLogDetailModalProps {
  log: AuditLog;
  onClose: () => void;
}

export const AuditLogDetailModal = ({
  log,
  onClose,
}: AuditLogDetailModalProps) => {
  const [copiedField, setCopiedField] = useState<string | null>(null);

  const handleCopy = (text: string, field: string) => {
    navigator.clipboard.writeText(text);
    setCopiedField(field);
    setTimeout(() => setCopiedField(null), 2000);
  };

  const modalVariants: Variants = {
    hidden: { opacity: 0 },
    visible: { opacity: 1 },
    exit: { opacity: 0 },
  };

  const contentVariants: Variants = {
    hidden: { opacity: 0, scale: 0.95, y: 20 },
    visible: {
      opacity: 1,
      scale: 1,
      y: 0,
      transition: { type: "spring", stiffness: 300, damping: 30 },
    },
    exit: {
      opacity: 0,
      scale: 0.95,
      y: 20,
      transition: { duration: 0.2 },
    },
  };

  const renderJsonData = (data: Record<string, unknown> | null, title: string) => {
    if (!data || Object.keys(data).length === 0) {
      return (
        <div className="text-gray-500 text-sm italic">Không có dữ liệu</div>
      );
    }

    const jsonString = JSON.stringify(data, null, 2);

    return (
      <div className="relative">
        <div className="flex items-center justify-between mb-2">
          <span className="text-sm font-medium text-gray-300">{title}</span>
          <motion.button
            onClick={() => handleCopy(jsonString, title)}
            className="p-1.5 rounded-lg bg-slate-700/50 hover:bg-slate-600/50 text-gray-400 hover:text-white transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            {copiedField === title ? (
              <Check size={14} className="text-green-400" />
            ) : (
              <Copy size={14} />
            )}
          </motion.button>
        </div>
        <pre className="bg-slate-900/50 border border-slate-700/50 rounded-lg p-4 overflow-x-auto text-xs text-gray-300 font-mono max-h-60">
          {jsonString}
        </pre>
      </div>
    );
  };

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center p-4 bg-black/60 backdrop-blur-sm"
      variants={modalVariants}
      initial="hidden"
      animate="visible"
      exit="exit"
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-4xl max-h-[90vh] bg-slate-800 border border-slate-700/50 rounded-2xl shadow-2xl overflow-hidden"
        variants={contentVariants}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <div className="px-6 py-4 bg-gradient-to-r from-amber-500/10 to-orange-500/10 border-b border-slate-700/50 flex items-center justify-between">
          <div className="flex items-center gap-3">
            <div className="p-2 bg-gradient-to-r from-amber-500 to-orange-500 rounded-xl">
              <FileText size={20} className="text-white" />
            </div>
            <div>
              <h2 className="text-lg font-bold text-white">
                Chi tiết Audit Log #{log.logId}
              </h2>
              <p className="text-sm text-gray-400">
                {formatAuditTimestamp(log.timestamp)}
              </p>
            </div>
          </div>
          <motion.button
            onClick={onClose}
            className="p-2 rounded-xl bg-slate-700/50 hover:bg-red-500/20 border border-slate-600/50 hover:border-red-500/50 text-gray-400 hover:text-red-400 transition-all"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <X size={20} />
          </motion.button>
        </div>

        {/* Content */}
        <div className="p-6 overflow-y-auto max-h-[calc(90vh-80px)]">
          {/* Basic Info Grid */}
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
            {/* User Info */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <User size={16} />
                <span className="text-sm font-medium">User</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-medium">
                  {log.userId ? `#${log.userId}` : "System"}
                </span>
                {log.role && (
                  <span
                    className={`px-2 py-0.5 text-xs rounded-full border ${getRoleColor(
                      log.role
                    )}`}
                  >
                    {log.role}
                  </span>
                )}
              </div>
            </div>

            {/* Action */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Activity size={16} />
                <span className="text-sm font-medium">Hành động</span>
              </div>
              <span
                className={`inline-flex px-3 py-1 text-sm font-medium rounded-full border ${getActionColor(
                  log.action
                )}`}
              >
                {log.action}
              </span>
            </div>

            {/* Table */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Database size={16} />
                <span className="text-sm font-medium">Bảng / Record</span>
              </div>
              <div className="text-white font-medium">
                {log.tableName}
                {log.recordId && (
                  <span className="text-gray-400 ml-2">#{log.recordId}</span>
                )}
              </div>
            </div>

            {/* Timestamp */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Clock size={16} />
                <span className="text-sm font-medium">Thời gian</span>
              </div>
              <div className="text-white font-medium">
                {formatAuditTimestamp(log.timestamp)}
              </div>
            </div>

            {/* IP Address */}
            <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Globe size={16} />
                <span className="text-sm font-medium">IP Address</span>
              </div>
              <div className="flex items-center gap-2">
                <span className="text-white font-mono">
                  {log.ipAddress || "-"}
                </span>
                {log.ipAddress && (
                  <motion.button
                    onClick={() => handleCopy(log.ipAddress!, "ip")}
                    className="p-1 rounded bg-slate-600/50 hover:bg-slate-500/50 text-gray-400 hover:text-white"
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.9 }}
                  >
                    {copiedField === "ip" ? (
                      <Check size={12} className="text-green-400" />
                    ) : (
                      <Copy size={12} />
                    )}
                  </motion.button>
                )}
              </div>
            </div>

            {/* HTTP Method & Status */}
            {log.metadata && (
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                <div className="flex items-center gap-2 text-gray-400 mb-2">
                  <Code size={16} />
                  <span className="text-sm font-medium">HTTP</span>
                </div>
                <div className="flex items-center gap-2">
                  <span
                    className={`font-mono font-medium ${getHttpMethodColor(
                      log.metadata.httpMethod
                    )}`}
                  >
                    {log.metadata.httpMethod || "-"}
                  </span>
                  {log.metadata.statusCode && (
                    <span
                      className={`px-2 py-0.5 text-xs rounded ${
                        log.metadata.statusCode >= 200 &&
                        log.metadata.statusCode < 300
                          ? "bg-green-500/20 text-green-400"
                          : log.metadata.statusCode >= 400
                          ? "bg-red-500/20 text-red-400"
                          : "bg-yellow-500/20 text-yellow-400"
                      }`}
                    >
                      {log.metadata.statusCode}
                    </span>
                  )}
                </div>
              </div>
            )}
          </div>

          {/* User Agent */}
          {log.userAgent && (
            <div className="mb-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <Monitor size={16} />
                <span className="text-sm font-medium">User Agent</span>
              </div>
              <div className="flex items-center gap-2">
                <p className="text-gray-300 text-sm font-mono break-all flex-1">
                  {log.userAgent}
                </p>
                <motion.button
                  onClick={() => handleCopy(log.userAgent!, "userAgent")}
                  className="p-1.5 rounded bg-slate-600/50 hover:bg-slate-500/50 text-gray-400 hover:text-white flex-shrink-0"
                  whileHover={{ scale: 1.1 }}
                  whileTap={{ scale: 0.9 }}
                >
                  {copiedField === "userAgent" ? (
                    <Check size={14} className="text-green-400" />
                  ) : (
                    <Copy size={14} />
                  )}
                </motion.button>
              </div>
            </div>
          )}

          {/* Path */}
          {log.metadata?.path && (
            <div className="mb-6 bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
              <div className="flex items-center gap-2 text-gray-400 mb-2">
                <ArrowRight size={16} />
                <span className="text-sm font-medium">Request Path</span>
              </div>
              <code className="text-amber-400 text-sm font-mono">
                {log.metadata.path}
              </code>
            </div>
          )}

          {/* Data Changes */}
          {(log.before || log.after) && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Database size={18} />
                Thay đổi dữ liệu
              </h3>
              <div className="grid grid-cols-1 lg:grid-cols-2 gap-4">
                <div className="bg-red-500/5 border border-red-500/20 rounded-xl p-4">
                  {renderJsonData(log.before, "Before")}
                </div>
                <div className="bg-green-500/5 border border-green-500/20 rounded-xl p-4">
                  {renderJsonData(log.after, "After")}
                </div>
              </div>
            </div>
          )}

          {/* Metadata */}
          {log.metadata && (
            <div className="mb-6">
              <h3 className="text-white font-semibold mb-4 flex items-center gap-2">
                <Code size={18} />
                Metadata
              </h3>
              <div className="bg-slate-700/30 rounded-xl p-4 border border-slate-600/30">
                {renderJsonData(log.metadata as Record<string, unknown>, "Metadata")}
              </div>
            </div>
          )}
        </div>
      </motion.div>
    </motion.div>
  );
};
