"use client";

import { useState, useMemo } from "react";
import type { SendVoucherToSpecificUsersRequest } from "@/apis/manager.voucher.api";
import { useGetTopCustomers, type GetTopCustomersParams } from "@/apis/manager.register";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import { Loader2, Search, X } from "lucide-react";

interface VoucherSendSpecificModalProps {
  open: boolean;
  isSubmitting?: boolean;
  voucherData?: { usageLimit: number; usedCount: number } | null;
  onClose: () => void;
  onSubmit: (payload: SendVoucherToSpecificUsersRequest) => Promise<void>;
}

const VoucherSendSpecificModal = ({ open, isSubmitting, voucherData, onClose, onSubmit }: VoucherSendSpecificModalProps) => {
  const accessToken = useAuthStore((state) => state.accessToken);
  const { showToast } = useToast();
  
  // Calculate remaining usage limit
  const remainingLimit = voucherData 
    ? voucherData.usageLimit - voucherData.usedCount 
    : null;
  
  const [subject, setSubject] = useState("Đừng Bỏ Lỡ Voucher Đặc Biệt Dành Cho Bạn");
  const [customMessage, setCustomMessage] = useState(
    "Chào bạn, chúng tôi gửi tặng bạn voucher đặc biệt này như một lời cảm ơn vì đã là khách hàng thân thiết. Ưu đãi này chỉ dành riêng cho bạn!",
  );
  const [selectedUserIds, setSelectedUserIds] = useState<Set<number>>(new Set());
  const [error, setError] = useState<string | null>(null);
  
  // Customer table filters
  const [searchQuery, setSearchQuery] = useState("");
  const [currentPage, setCurrentPage] = useState(1);
  const [sortBy, setSortBy] = useState<"booking_count" | "total_spent">("total_spent");
  const [sortOrder, setSortOrder] = useState<"asc" | "desc">("desc");
  const [minBookings, setMinBookings] = useState<string>("");
  const [maxBookings, setMaxBookings] = useState<string>("");
  
  const customersParams: GetTopCustomersParams = {
    page: currentPage,
    pageSize: 50, // Fetch more to filter client-side
    sortBy,
    sortOrder,
    ...(searchQuery && { customerName: searchQuery }),
  };
  
  const { data: customersData, isLoading: isLoadingCustomers } = useGetTopCustomers(
    customersParams,
    accessToken || undefined
  );

  const rawCustomers = customersData?.result?.fullCustomerList?.customers || [];
  const pagination = customersData?.result?.fullCustomerList?.pagination;
  
  // Filter customers by booking count on client-side
  const customers = useMemo(() => {
    let filtered = rawCustomers;
    
    const min = minBookings ? parseInt(minBookings) : null;
    const max = maxBookings ? parseInt(maxBookings) : null;
    
    if (min !== null && !isNaN(min)) {
      filtered = filtered.filter((c) => c.totalBookings >= min);
    }
    
    if (max !== null && !isNaN(max)) {
      filtered = filtered.filter((c) => c.totalBookings <= max);
    }
    
    return filtered;
  }, [rawCustomers, minBookings, maxBookings]);
  
  if (!open) return null;

  const resetState = () => {
    setError(null);
    setSelectedUserIds(new Set());
    setSearchQuery("");
    setCurrentPage(1);
    setMinBookings("");
    setMaxBookings("");
  };

  const handleToggleUser = (userId: number) => {
    setSelectedUserIds((prev) => {
      const newSet = new Set(prev);
      if (newSet.has(userId)) {
        newSet.delete(userId);
      } else {
        newSet.add(userId);
      }
      return newSet;
    });
  };

  const handleSelectAll = () => {
    if (customers.length > 0 && customers.every((c) => selectedUserIds.has(c.userId))) {
      // Deselect all filtered customers
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        customers.forEach((c) => newSet.delete(c.userId));
        return newSet;
      });
    } else {
      // Select all filtered customers
      setSelectedUserIds((prev) => {
        const newSet = new Set(prev);
        customers.forEach((c) => newSet.add(c.userId));
        return newSet;
      });
    }
  };

  const handleSubmit = async (event: React.FormEvent<HTMLFormElement>) => {
    event.preventDefault();
    setError(null);

    if (!subject.trim()) {
      setError("Vui lòng nhập tiêu đề email");
      return;
    }

    if (!customMessage.trim()) {
      setError("Vui lòng nhập nội dung email");
      return;
    }

    if (selectedUserIds.size === 0) {
      showToast("Vui lòng chọn ít nhất một người dùng", undefined, "error");
      return;
    }

    // Validate usage limit
    if (remainingLimit !== null && selectedUserIds.size > remainingLimit) {
      showToast(`Voucher chỉ còn ${remainingLimit} lượt sử dụng. Bạn đang chọn ${selectedUserIds.size} người.`, undefined, "error");
      return;
    }

    try {
      await onSubmit({
        subject: subject.trim(),
        customMessage: customMessage.trim(),
        userIds: Array.from(selectedUserIds),
      });
      resetState();
    } catch {
      setError("Không thể gửi voucher cho người dùng được chọn. Vui lòng thử lại.");
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  return (
    <div className="fixed inset-0 z-40 flex items-center justify-center bg-slate-950/60 backdrop-blur-xl p-4">
      <div className="w-full max-w-6xl rounded-2xl border border-white/10 bg-[#1c1c24]/90 p-6 text-white shadow-2xl backdrop-blur-md max-h-[90vh] overflow-y-auto">
        <div className="mb-4 flex items-start justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Gửi voucher cho người dùng cụ thể</h2>
            <p className="mt-1 text-sm text-gray-300">
              Chọn khách hàng từ danh sách để gửi voucher qua email.
            </p>
          </div>
          <button
            type="button"
            onClick={() => {
              resetState();
              onClose();
            }}
            className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 transition hover:bg-white/10"
            disabled={isSubmitting}
          >
            Đóng
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit}>
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Tiêu đề email</label>
              <textarea
                value={subject}
                onChange={(event) => setSubject(event.target.value)}
                className="min-h-[60px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none resize-none"
                placeholder="Nhập tiêu đề"
              />
            </div>

            <div className="space-y-2">
              <label className="block text-sm font-medium text-gray-200">Nội dung thông điệp</label>
              <textarea
                value={customMessage}
                onChange={(event) => setCustomMessage(event.target.value)}
                className="min-h-[60px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none resize-none"
                placeholder="Nhập nội dung email"
              />
            </div>
          </div>

          <div className="space-y-3">
            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="block text-sm font-medium text-gray-200">
                Danh sách khách hàng ({selectedUserIds.size} đã chọn
                {remainingLimit !== null && ` / ${remainingLimit} lượt còn lại`})
              </label>
              <div className="flex flex-wrap items-center gap-2">
                {/* Booking count filter */}
                <div className="flex items-center gap-1.5">
                  <span className="text-xs text-gray-400 whitespace-nowrap">Số lần đặt:</span>
                  <input
                    type="number"
                    min="0"
                    value={minBookings}
                    onChange={(e) => {
                      setMinBookings(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Từ"
                    className="w-20 rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                  />
                  <span className="text-gray-400">-</span>
                  <input
                    type="number"
                    min="0"
                    value={maxBookings}
                    onChange={(e) => {
                      setMaxBookings(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Đến"
                    className="w-20 rounded-lg border border-white/10 bg-white/10 px-2 py-1.5 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                  />
                </div>
                
                <div className="relative">
                  <Search className="absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
                  <input
                    type="text"
                    value={searchQuery}
                    onChange={(e) => {
                      setSearchQuery(e.target.value);
                      setCurrentPage(1);
                    }}
                    placeholder="Tìm theo tên..."
                    className="w-64 rounded-lg border border-white/10 bg-white/10 py-1.5 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                  />
                  {searchQuery && (
                    <button
                      type="button"
                      onClick={() => {
                        setSearchQuery("");
                        setCurrentPage(1);
                      }}
                      className="absolute right-2 top-1/2 -translate-y-1/2 text-gray-400 hover:text-white"
                    >
                      <X className="h-4 w-4" />
                    </button>
                  )}
                </div>
                <select
                  value={`${sortBy}-${sortOrder}`}
                  onChange={(e) => {
                    const [by, order] = e.target.value.split("-") as [typeof sortBy, typeof sortOrder];
                    setSortBy(by);
                    setSortOrder(order);
                    setCurrentPage(1);
                  }}
                  className="rounded-lg border border-white/10 bg-white/10 px-3 py-1.5 text-sm text-white focus:border-orange-400 focus:outline-none"
                >
                  <option value="total_spent-desc" className="bg-slate-900">Tổng chi tiêu (Cao → Thấp)</option>
                  <option value="total_spent-asc" className="bg-slate-900">Tổng chi tiêu (Thấp → Cao)</option>
                  <option value="booking_count-desc" className="bg-slate-900">Số lần đặt (Cao → Thấp)</option>
                  <option value="booking_count-asc" className="bg-slate-900">Số lần đặt (Thấp → Cao)</option>
                </select>
              </div>
            </div>

            <div className="rounded-lg border border-white/10 bg-white/5 overflow-hidden">
              {isLoadingCustomers ? (
                <div className="flex items-center justify-center py-12">
                  <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
                </div>
              ) : customers.length === 0 ? (
                <div className="py-12 text-center text-gray-400">
                  Không tìm thấy khách hàng nào
                </div>
              ) : (
                <>
                  <div className="overflow-x-auto">
                    <table className="w-full text-sm">
                      <thead className="border-b border-white/10 bg-white/5">
                        <tr>
                          <th className="p-3 text-left">
                            <input
                              type="checkbox"
                              checked={customers.length > 0 && customers.every((c) => selectedUserIds.has(c.userId))}
                              onChange={handleSelectAll}
                              className="h-4 w-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0"
                            />
                          </th>
                          <th className="p-3 text-left font-medium">Khách hàng</th>
                          <th className="p-3 text-left font-medium">Email</th>
                          <th className="p-3 text-left font-medium">SĐT</th>
                          <th className="p-3 text-right font-medium">Số lần đặt</th>
                          <th className="p-3 text-right font-medium">Tổng chi tiêu</th>
                          <th className="p-3 text-right font-medium">Trung bình/đơn</th>
                          <th className="p-3 text-center font-medium">Đặt lần cuối</th>
                        </tr>
                      </thead>
                      <tbody className="divide-y divide-white/5">
                        {customers.map((customer) => (
                          <tr
                            key={customer.userId}
                            className={`transition hover:bg-white/5 ${selectedUserIds.has(customer.userId) ? "bg-orange-500/10" : ""}`}
                          >
                            <td className="p-3">
                              <input
                                type="checkbox"
                                checked={selectedUserIds.has(customer.userId)}
                                onChange={() => handleToggleUser(customer.userId)}
                                className="h-4 w-4 rounded border-white/20 bg-white/10 text-orange-500 focus:ring-2 focus:ring-orange-500 focus:ring-offset-0"
                              />
                            </td>
                            <td className="p-3">
                              <div className="flex items-center gap-2">
                                {customer.avatarUrl ? (
                                  <img
                                    src={customer.avatarUrl}
                                    alt={customer.fullname}
                                    className="h-8 w-8 rounded-full object-cover"
                                  />
                                ) : (
                                  <div className="flex h-8 w-8 items-center justify-center rounded-full bg-orange-500 text-xs font-semibold text-white">
                                    {customer.fullname.charAt(0).toUpperCase()}
                                  </div>
                                )}
                                <div>
                                  <div className="font-medium">{customer.fullname}</div>
                                  <div className="text-xs text-gray-400">@{customer.username}</div>
                                </div>
                              </div>
                            </td>
                            <td className="p-3 text-gray-300">{customer.email}</td>
                            <td className="p-3 text-gray-300">{customer.phone || "—"}</td>
                            <td className="p-3 text-right font-medium">{customer.totalBookings}</td>
                            <td className="p-3 text-right font-medium text-orange-400">
                              {formatCurrency(customer.totalSpent)}
                            </td>
                            <td className="p-3 text-right text-gray-300">
                              {formatCurrency(customer.averageOrderValue)}
                            </td>
                            <td className="p-3 text-center text-gray-300">
                              {formatDate(customer.lastBookingDate)}
                            </td>
                          </tr>
                        ))}
                      </tbody>
                    </table>
                  </div>

                  {pagination && pagination.totalPages > 1 && (
                    <div className="flex items-center justify-between border-t border-white/10 bg-white/5 px-4 py-3">
                      <div className="text-sm text-gray-400">
                        Trang {pagination.currentPage} / {pagination.totalPages} (Tổng: {pagination.totalCount} khách hàng)
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => Math.max(1, p - 1))}
                          disabled={!pagination.hasPrevious}
                          className="rounded border border-white/10 bg-white/5 px-3 py-1 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Trước
                        </button>
                        <button
                          type="button"
                          onClick={() => setCurrentPage((p) => p + 1)}
                          disabled={!pagination.hasNext}
                          className="rounded border border-white/10 bg-white/5 px-3 py-1 text-sm transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
                        >
                          Sau
                        </button>
                      </div>
                    </div>
                  )}
                </>
              )}
            </div>
          </div>

          {error && <p className="text-sm text-red-300">{error}</p>}

          <div className="flex items-center justify-end gap-3 border-t border-white/10 pt-4">
            <button
              type="button"
              onClick={() => {
                resetState();
                onClose();
              }}
              className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
              disabled={isSubmitting}
            >
              Huỷ
            </button>
            <button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400 disabled:cursor-not-allowed disabled:opacity-70"
              disabled={isSubmitting || selectedUserIds.size === 0}
            >
              {isSubmitting && <Loader2 className="h-4 w-4 animate-spin" />}
              Gửi voucher cho {selectedUserIds.size} người
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

export default VoucherSendSpecificModal;
