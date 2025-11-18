// import type { Genre } from "@/types";

export interface Genre {
  name: string;
}

/**
 * Format genre array to string
 */
export const formatGenres = (genre: string[] | Genre[]): string => {
  if (!Array.isArray(genre)) return String(genre);
  
  return genre
    .map(g => typeof g === 'string' ? g : g.name)
    .join(" - ");
};

/**
 * Format currency in Vietnamese Dong
 */
export const formatCurrency = (amount: number): string => {
  return new Intl.NumberFormat("vi-VN", {
    style: "currency",
    currency: "VND",
  }).format(amount);
};

/**
 * Format date and time for Vietnamese locale
 */
export const formatDate = (value?: string | Date | null): string => {
  if (!value) return "-";

  const date = typeof value === "string" ? new Date(value) : value;
  if (Number.isNaN(date.getTime())) return "-";

  return date.toLocaleDateString("vi-VN", {
    day: "2-digit",
    month: "2-digit",
    year: "numeric",
  });
};

export const formatDateTime = (
  dateInput?: string | Date | null,
  options?: {
    includeTime?: boolean;
    relative?: boolean;
  }
): string => {
  if (!dateInput) return "-";

  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";

  const now = new Date();

  if (options?.relative) {
    const diffInHours = Math.floor(
      (now.getTime() - date.getTime()) / (1000 * 60 * 60)
    );

    if (diffInHours < 1) {
      const diffInMinutes = Math.floor(
        (now.getTime() - date.getTime()) / (1000 * 60)
      );
      return diffInMinutes < 1 ? "Just now" : `${diffInMinutes} minutes ago`;
    } else if (diffInHours < 24) {
      return `${diffInHours} hours ago`;
    } else if (diffInHours < 168) {
      return `${Math.floor(diffInHours / 24)} days ago`;
    }
  }

  const formatOptions: Intl.DateTimeFormatOptions = {
    year: "numeric",
    month: "short",
    day: "numeric",
  };

  if (options?.includeTime) {
    formatOptions.hour = "2-digit";
    formatOptions.minute = "2-digit";
  }

  return date.toLocaleDateString("vi-VN", formatOptions);
};

/**
 * Format date for showtime display
 */
export const formatShowtime = (startTime: string, endTime?: string): string => {
  const start = new Date(startTime);
  const end = endTime ? new Date(endTime) : null;

  const dateStr = start.toLocaleDateString("vi-VN", {
    weekday: "long",
    year: "numeric",
    month: "long",
    day: "numeric",
  });

  const timeStr = start.toLocaleTimeString("vi-VN", {
    hour: "2-digit",
    minute: "2-digit",
  });

  if (end) {
    const endTimeStr = end.toLocaleTimeString("vi-VN", {
      hour: "2-digit",
      minute: "2-digit",
    });
    return `${dateStr} at ${timeStr} - ${endTimeStr}`;
  }

  return `${dateStr} at ${timeStr}`;
};

/**
 * Truncate text with ellipsis
 */
export const truncateText = (text: string, maxLength: number): string => {
  if (text.length <= maxLength) return text;
  return text.substring(0, maxLength).trim() + "...";
};

/**
 * Format file size
 */
export const formatFileSize = (bytes: number): string => {
  if (bytes === 0) return "0 B";

  const k = 1024;
  const sizes = ["B", "KB", "MB", "GB"];
  const i = Math.floor(Math.log(bytes) / Math.log(k));

  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + " " + sizes[i];
};

/**
 * Format duration in minutes to hours and minutes
 */
export const formatDuration = (minutes: number): string => {
  const hours = Math.floor(minutes / 60);
  const remainingMinutes = minutes % 60;

  if (hours === 0) {
    return `${remainingMinutes}m`;
  }

  return remainingMinutes === 0
    ? `${hours}h`
    : `${hours}h ${remainingMinutes}m`;
};

/**
 * Format payment method display name
 */
export const formatPaymentMethod = (method: string): string => {
  const methodMap: Record<string, string> = {
    vnpay: "VNPay",
    credit_card: "Credit Card",
    debit_card: "Debit Card",
    net_banking: "Net Banking",
    upi: "UPI",
    wallet: "Digital Wallet",
    cash: "Cash",
  };

  return (
    methodMap[method] ||
    method.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase())
  );
};

/**
 * Format status with proper capitalization
 */
export const formatStatus = (status: string): string => {
  return status.replace("_", " ").replace(/\b\w/g, (l) => l.toUpperCase());
};

/**
 * Generate initials from name
 */
export const getInitials = (name: string): string => {
  return name
    .split(" ")
    .map((word) => word.charAt(0))
    .join("")
    .toUpperCase()
    .slice(0, 2);
};

/**
 * Format percentage
 */
export const formatPercentage = (
  value: number,
  decimals: number = 1
): string => {
  return `${value.toFixed(decimals)}%`;
};

/**
 * Format large numbers with suffixes (K, M, B)
 */
export const formatNumber = (num: number): string => {
  if (num >= 1000000000) {
    return (num / 1000000000).toFixed(1) + "B";
  }
  if (num >= 1000000) {
    return (num / 1000000).toFixed(1) + "M";
  }
  if (num >= 1000) {
    return (num / 1000).toFixed(1) + "K";
  }
  return num.toString();
};

/**
 * Format seat display
 */
export const formatSeat = (row: string, number: number): string => {
  return `${row}${number}`;
};

/**
 * Format seats array for display
 */
export const formatSeats = (
  seats: Array<{ row: string; number: number }>
): string => {
  return seats.map((seat) => formatSeat(seat.row, seat.number)).join(", ");
};

/**
 * Format rating display
 */
export const formatRating = (rating: number, maxRating: number = 5): string => {
  return `${rating.toFixed(1)}/${maxRating}`;
};

/**
 * Format review content preview
 */
export const formatReviewPreview = (
  content: string,
  maxLength: number = 150
): string => {
  const cleanContent = content.replace(/\n/g, " ").trim();
  return truncateText(cleanContent, maxLength);
};
