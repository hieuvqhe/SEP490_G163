// Utility functions for booking stats

/**
 * Format currency to Vietnamese dong with smart abbreviations
 */
export const formatCurrency = (value: number): string => {
  if (value >= 1000000000) {
    return `${(value / 1000000000).toFixed(1)}B đ`;
  }
  if (value >= 1000000) {
    return `${(value / 1000000).toFixed(1)}M đ`;
  }
  if (value >= 1000) {
    return `${(value / 1000).toFixed(0)}K đ`;
  }
  return `${value.toLocaleString("vi-VN")} đ`;
};

/**
 * Get badge color classes for booking status
 */
export const getStatusColor = (status: string): string => {
  switch (status) {
    case "COMPLETED":
    case "CHECKED_IN":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "CANCELLED":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    case "PARTIAL_CHECKED_IN":
      return "bg-blue-500/20 text-blue-400 border-blue-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
};

/**
 * Get badge color classes for payment status
 */
export const getPaymentStatusColor = (status: string): string => {
  switch (status) {
    case "PAID":
      return "bg-green-500/20 text-green-400 border-green-500/30";
    case "PENDING":
      return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
    case "FAILED":
      return "bg-red-500/20 text-red-400 border-red-500/30";
    default:
      return "bg-zinc-500/20 text-zinc-400 border-zinc-500/30";
  }
};
