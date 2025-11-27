"use client";

import { useState, useEffect, useCallback } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import {
  useGetAuditLogs,
  type AuditLog,
  type GetAuditLogsParams,
  type AdminAuditLogApiError,
} from "@/apis/admin.auditlog.api";
import { AuditLogFilters } from "./AuditLogFilters";
import { AuditLogTable } from "./AuditLogTable";
import { AuditLogDetailModal } from "./AuditLogModals";

export const AuditLogManagement = () => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  // Filter states
  const [currentPage, setCurrentPage] = useState(1);
  const [limit] = useState(15);
  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [userId, setUserId] = useState("");
  const [role, setRole] = useState("");
  const [action, setAction] = useState("");
  const [tableName, setTableName] = useState("");
  const [fromDate, setFromDate] = useState("");
  const [toDate, setToDate] = useState("");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");

  // Modal states
  const [selectedLog, setSelectedLog] = useState<AuditLog | null>(null);

  // Debounce search
  useEffect(() => {
    const timer = setTimeout(() => {
      setDebouncedSearch(searchTerm);
    }, 500);
    return () => clearTimeout(timer);
  }, [searchTerm]);

  // Build query params
  const queryParams: GetAuditLogsParams = {
    page: currentPage,
    limit,
    search: debouncedSearch || undefined,
    userId: userId ? parseInt(userId, 10) : undefined,
    role: role || undefined,
    action: action || undefined,
    tableName: tableName || undefined,
    from: fromDate || undefined,
    to: toDate || undefined,
    sortOrder,
  };

  // Fetch audit logs
  const {
    data: logsData,
    isLoading,
    isError,
    error,
    refetch,
  } = useGetAuditLogs(queryParams, accessToken || undefined);

  // Show error toast
  useEffect(() => {
    if (isError && error) {
      const apiError = error as AdminAuditLogApiError;
      showToast(
        apiError.message || "Không thể tải audit logs",
        undefined,
        "error"
      );
    }
  }, [isError, error, showToast]);

  // Extract data
  const logs = logsData?.result?.logs || [];
  const totalLogs = logsData?.result?.total || 0;

  // Handlers
  const handleSearch = useCallback((e: React.FormEvent) => {
    e.preventDefault();
    setCurrentPage(1);
  }, []);

  const handleViewLog = useCallback((log: AuditLog) => {
    setSelectedLog(log);
  }, []);

  const handleCloseModal = useCallback(() => {
    setSelectedLog(null);
  }, []);

  const handlePageChange = useCallback((page: number) => {
    setCurrentPage(page);
  }, []);

  const handleClearFilters = useCallback(() => {
    setSearchTerm("");
    setDebouncedSearch("");
    setUserId("");
    setRole("");
    setAction("");
    setTableName("");
    setFromDate("");
    setToDate("");
    setSortOrder("desc");
    setCurrentPage(1);
  }, []);

  // Animation variants
  const containerVariants = {
    hidden: { opacity: 0 },
    visible: {
      opacity: 1,
      transition: {
        duration: 0.3,
        staggerChildren: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, y: 20 },
    visible: {
      opacity: 1,
      y: 0,
      transition: {
        duration: 0.4,
      },
    },
  };

  return (
    <motion.div
      className="space-y-6"
      variants={containerVariants}
      initial="hidden"
      animate="visible"
    >
      {/* Filters */}
      <motion.div variants={itemVariants}>
        <AuditLogFilters
          totalLogs={totalLogs}
          searchTerm={searchTerm}
          setSearchTerm={setSearchTerm}
          userId={userId}
          setUserId={setUserId}
          role={role}
          setRole={setRole}
          action={action}
          setAction={setAction}
          tableName={tableName}
          setTableName={setTableName}
          fromDate={fromDate}
          setFromDate={setFromDate}
          toDate={toDate}
          setToDate={setToDate}
          sortOrder={sortOrder}
          setSortOrder={setSortOrder}
          onSearch={handleSearch}
          onRefresh={refetch}
          onClearFilters={handleClearFilters}
        />
      </motion.div>

      {/* Table */}
      <motion.div variants={itemVariants}>
        <AuditLogTable
          logs={logs}
          isLoading={isLoading}
          currentPage={currentPage}
          totalLogs={totalLogs}
          limit={limit}
          onViewLog={handleViewLog}
          onPageChange={handlePageChange}
        />
      </motion.div>

      {/* Detail Modal */}
      <AnimatePresence mode="wait">
        {selectedLog && (
          <AuditLogDetailModal log={selectedLog} onClose={handleCloseModal} />
        )}
      </AnimatePresence>
    </motion.div>
  );
};
