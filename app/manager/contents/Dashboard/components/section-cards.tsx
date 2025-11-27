"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardAction,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingDownIcon,
  TrendingUpIcon,
  DollarSign,
  Users,
  Ticket,
  Film,
  Building2,
  CreditCard,
  Calendar,
  AlertCircle,
  Loader2,
  Percent,
  Store,
} from "lucide-react";
import { useGetManagerBookingStatistics } from "@/apis/manager.booking.api";
import { useAuthStore } from "@/store/authStore";
import { AnimatedCounter } from "./animated-counter";
import { SimpleBarChart, DonutChart, WeeklyRevenueTracker, HorizontalBarChart } from "./charts";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

// Format currency to VND
const formatCurrency = (value: number) => {
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

// Card wrapper component with animation
function StatCard({
  children,
  className,
  delay = 0,
}: {
  children: React.ReactNode;
  className?: string;
  delay?: number;
}) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card
        className={cn(
          "bg-zinc-800/80 border border-zinc-700 rounded-xl text-zinc-100 shadow-md hover:shadow-lg hover:border-zinc-500/50 transition-all duration-300 hover:-translate-y-1",
          className
        )}
      >
        {children}
      </Card>
    </motion.div>
  );
}

// Trend badge component
function TrendBadge({
  value,
  suffix = "%",
}: {
  value: number;
  suffix?: string;
}) {
  const isPositive = value >= 0;
  return (
    <Badge
      className={cn(
        isPositive
          ? "bg-green-500/20 text-green-400 border-green-500/30"
          : "bg-red-500/20 text-red-400 border-red-500/30"
      )}
    >
      {isPositive ? (
        <TrendingUpIcon className="size-4 mr-1" />
      ) : (
        <TrendingDownIcon className="size-4 mr-1" />
      )}
      {isPositive ? "+" : ""}
      {value.toFixed(1)}
      {suffix}
    </Badge>
  );
}

// Loading skeleton
function LoadingSkeleton() {
  return (
    <div className="flex flex-col items-center justify-center py-20">
      <Loader2 className="size-12 text-orange-400 animate-spin mb-4" />
      <p className="text-zinc-400">Đang tải dữ liệu thống kê...</p>
    </div>
  );
}

// Error state
function ErrorState({ message }: { message: string }) {
  return (
    <div className="flex flex-col items-center justify-center py-12 px-4">
      <AlertCircle className="size-12 text-red-400 mb-4" />
      <p className="text-zinc-400 text-center">{message}</p>
    </div>
  );
}

export function ManagerDashboardStats() {
  const accessToken = useAuthStore((state) => state.accessToken);
  
  const { data, isLoading, isError, error } = useGetManagerBookingStatistics(
    {
      groupBy: "day",
      includeComparison: true,
      topLimit: 10,
    },
    accessToken || undefined
  );

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        message={(error as any)?.message || "Không thể tải dữ liệu thống kê"}
      />
    );
  }

  const stats = data?.result;
  if (!stats) {
    return <ErrorState message="Không có dữ liệu thống kê" />;
  }

  const {
    overview,
    cinemaRevenue,
    movieStatistics,
    timeStatistics,
    topCustomers,
    partnerRevenue,
    voucherStatistics,
    paymentStatistics,
  } = stats;

  // Calculate comparison percentages
  const revenueChange = timeStatistics.periodComparison?.growth?.revenueGrowth || 0;
  const bookingsChange = timeStatistics.periodComparison?.growth?.bookingGrowth || 0;
  const customerChange = timeStatistics.periodComparison?.growth?.customerGrowth || 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats - Row 1 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Total Revenue Card */}
        <StatCard delay={0}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <DollarSign className="size-4 text-orange-400" />
              Tổng Doanh Thu
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-400">
              <AnimatedCounter
                value={overview.totalRevenue}
                format={formatCurrency}
              />
            </CardTitle>
            <CardAction>
              <TrendBadge value={revenueChange} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div
              className={cn(
                "flex gap-2 font-medium",
                revenueChange >= 0 ? "text-green-400" : "text-red-400"
              )}
            >
              {revenueChange >= 0 ? "Tăng trưởng" : "Giảm"} so với kỳ trước
              {revenueChange >= 0 ? (
                <TrendingUpIcon className="size-4" />
              ) : (
                <TrendingDownIcon className="size-4" />
              )}
            </div>
            <div className="text-zinc-400">Thống kê toàn hệ thống</div>
          </CardFooter>
        </StatCard>

        {/* Total Bookings Card */}
        <StatCard delay={0.1}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Ticket className="size-4 text-blue-400" />
              Tổng Đơn Hàng
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-400">
              <AnimatedCounter value={overview.totalBookings} />
            </CardTitle>
            <CardAction>
              <TrendBadge value={bookingsChange} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium text-green-400">
              {overview.totalPaidBookings} đã thanh toán
            </div>
            <div className="text-zinc-400">
              {overview.totalPendingBookings} đang chờ •{" "}
              {overview.totalCancelledBookings} đã hủy
            </div>
          </CardFooter>
        </StatCard>

        {/* Tickets Sold Card */}
        <StatCard delay={0.2}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Film className="size-4 text-purple-400" />
              Vé Đã Bán
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-400">
              <AnimatedCounter value={overview.totalTicketsSold} />
            </CardTitle>
            <CardAction>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Film className="size-4 mr-1" />
                Vé
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium text-purple-400">
              Giá trị TB: {formatCurrency(overview.averageOrderValue)}
            </div>
            <div className="text-zinc-400">Trung bình mỗi đơn hàng</div>
          </CardFooter>
        </StatCard>

        {/* Customers Card */}
        <StatCard delay={0.3}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Users className="size-4 text-green-400" />
              Khách Hàng
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-green-400">
              <AnimatedCounter value={overview.totalCustomers} />
            </CardTitle>
            <CardAction>
              <TrendBadge value={customerChange} />
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium text-green-400">
              Khách hàng đã mua vé
            </div>
            <div className="text-zinc-400">Trong kỳ thống kê</div>
          </CardFooter>
        </StatCard>
      </div>

      {/* Charts Row - Row 2 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {/* Revenue Trend Card */}
        <StatCard delay={0.4} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-orange-400" />
              Xu Hướng Doanh Thu
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Biểu đồ theo ngày
            </CardTitle>
          </CardHeader>
          <CardContent>
            {timeStatistics.revenueTrend && timeStatistics.revenueTrend.length > 0 ? (
              <SimpleBarChart
                items={timeStatistics.revenueTrend.slice(-7).map((t) => ({
                  value: t.revenue,
                  label: new Date(t.date).toLocaleDateString("vi-VN", {
                    day: "2-digit",
                    month: "2-digit",
                  }),
                }))}
                height={140}
                className="mt-2"
              />
            ) : (
              <div className="h-[140px] flex items-center justify-center text-zinc-500">
                Chưa có dữ liệu
              </div>
            )}
          </CardContent>
        </StatCard>

        {/* Weekly Revenue Tracker */}
        <motion.div
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.45 }}
          className="h-full"
        >
          <WeeklyRevenueTracker
            spending={(() => {
              const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
              const today = new Date();
              const last7Days = [];
              
              for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];
                const dayOfWeek = date.getDay();
                
                const trendItem = timeStatistics.revenueTrend?.find(
                  (t) => t.date.split("T")[0] === dateStr
                );
                
                last7Days.push({
                  day: days[dayOfWeek],
                  amount: trendItem?.revenue || 0,
                });
              }
              
              return last7Days;
            })()}
            subtitle="DOANH THU 7 NGÀY QUA"
            formatValue={formatCurrency}
            className="h-full"
          />
        </motion.div>

        {/* Voucher Usage Donut */}
        <StatCard delay={0.5} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Percent className="size-4 text-pink-400" />
              Sử Dụng Voucher
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1">
            <DonutChart
              value={voucherStatistics.voucherUsageRate}
              max={100}
              size={100}
              strokeWidth={10}
              color="#ec4899"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-pink-400">
                  {voucherStatistics.voucherUsageRate.toFixed(0)}%
                </div>
                <div className="text-[10px] text-zinc-400">Tỷ lệ</div>
              </div>
            </DonutChart>
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-zinc-100">
                {voucherStatistics.totalVouchersUsed} voucher đã dùng
              </div>
              <div className="text-xs text-zinc-400">
                Giảm giá: {formatCurrency(voucherStatistics.totalVoucherDiscount)}
              </div>
            </div>
          </CardContent>
        </StatCard>
      </div>

      {/* Partner & Cinema Stats - Row 3 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        {/* Top Partners */}
        <StatCard delay={0.6} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Store className="size-4 text-emerald-400" />
              Top Đối Tác Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {partnerRevenue.topPartnersByRevenue.slice(0, 5).map((partner, idx) => (
              <div
                key={partner.partnerId}
                className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : idx === 1
                        ? "bg-zinc-400/20 text-zinc-300"
                        : idx === 2
                        ? "bg-orange-600/20 text-orange-400"
                        : "bg-zinc-600/20 text-zinc-400"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">
                      {partner.partnerName}
                    </div>
                    <div className="text-xs text-zinc-400">
                      MST: {partner.taxCode} • {partner.totalCinemas} rạp
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-emerald-400">
                    {formatCurrency(partner.totalRevenue)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {partner.totalBookings} đơn
                  </div>
                </div>
              </div>
            ))}
            {partnerRevenue.topPartnersByRevenue.length === 0 && (
              <div className="text-center text-zinc-500 py-4">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </StatCard>

        {/* Top Cinemas */}
        <StatCard delay={0.7} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Building2 className="size-4 text-cyan-400" />
              Top Rạp Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cinemaRevenue.topCinemasByRevenue.slice(0, 5).map((cinema, idx) => (
              <div
                key={cinema.cinemaId}
                className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : idx === 1
                        ? "bg-zinc-400/20 text-zinc-300"
                        : idx === 2
                        ? "bg-orange-600/20 text-orange-400"
                        : "bg-zinc-600/20 text-zinc-400"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-zinc-100">
                      {cinema.cinemaName}
                    </div>
                    <div className="text-xs text-zinc-400">
                      {cinema.district}, {cinema.city}
                    </div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-cyan-400">
                    {formatCurrency(cinema.totalRevenue)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {cinema.totalBookings} đơn
                  </div>
                </div>
              </div>
            ))}
            {cinemaRevenue.topCinemasByRevenue.length === 0 && (
              <div className="text-center text-zinc-500 py-4">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </StatCard>
      </div>

      {/* Movies & Time Stats - Row 4 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        {/* Top Movies by Revenue */}
        <StatCard delay={0.8} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Film className="size-4 text-red-400" />
              Top Phim Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {movieStatistics.topMoviesByRevenue.slice(0, 5).map((movie, idx) => (
              <div
                key={movie.movieId}
                className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : idx === 1
                        ? "bg-zinc-400/20 text-zinc-300"
                        : idx === 2
                        ? "bg-orange-600/20 text-orange-400"
                        : "bg-zinc-600/20 text-zinc-400"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-zinc-100 line-clamp-1">
                      {movie.title}
                    </div>
                    <div className="text-xs text-zinc-400">{movie.genre}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-red-400">
                    {formatCurrency(movie.totalRevenue)}
                  </div>
                  <div className="text-xs text-zinc-400">
                    {movie.totalTicketsSold} vé • {movie.showtimeCount} suất
                  </div>
                </div>
              </div>
            ))}
            {movieStatistics.topMoviesByRevenue.length === 0 && (
              <div className="text-center text-zinc-500 py-4">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </StatCard>

        {/* Top Movies by Tickets */}
        <StatCard delay={0.9} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Ticket className="size-4 text-amber-400" />
              Top Phim Theo Vé Bán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {movieStatistics.topMoviesByTickets.slice(0, 5).map((movie, idx) => (
              <div
                key={movie.movieId}
                className="flex items-center justify-between py-2 border-b border-zinc-700/50 last:border-0"
              >
                <div className="flex items-center gap-3">
                  <span
                    className={cn(
                      "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                      idx === 0
                        ? "bg-yellow-500/20 text-yellow-400"
                        : idx === 1
                        ? "bg-zinc-400/20 text-zinc-300"
                        : idx === 2
                        ? "bg-orange-600/20 text-orange-400"
                        : "bg-zinc-600/20 text-zinc-400"
                    )}
                  >
                    {idx + 1}
                  </span>
                  <div>
                    <div className="text-sm font-medium text-zinc-100 line-clamp-1">
                      {movie.title}
                    </div>
                    <div className="text-xs text-zinc-400">{movie.genre}</div>
                  </div>
                </div>
                <div className="text-right">
                  <div className="text-sm font-semibold text-amber-400">
                    {movie.totalTicketsSold} vé
                  </div>
                  <div className="text-xs text-zinc-400">
                    {movie.totalBookings} đơn
                  </div>
                </div>
              </div>
            ))}
            {movieStatistics.topMoviesByTickets.length === 0 && (
              <div className="text-center text-zinc-500 py-4">Chưa có dữ liệu</div>
            )}
          </CardContent>
        </StatCard>
      </div>

      {/* Time Period Stats - Row 5 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Time Stats - Today */}
        <StatCard delay={1.0}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Calendar className="size-4 text-amber-400" />
              Hôm Nay
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-amber-400">
              {formatCurrency(timeStatistics.today.revenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-zinc-300">
              {timeStatistics.today.bookings} đơn •{" "}
              {timeStatistics.today.tickets} vé
            </div>
            <div className="text-zinc-400">
              {timeStatistics.today.customers} khách hàng
            </div>
          </CardFooter>
        </StatCard>

        {/* Time Stats - This Week */}
        <StatCard delay={1.1}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Calendar className="size-4 text-emerald-400" />
              Tuần Này
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-emerald-400">
              {formatCurrency(timeStatistics.thisWeek.revenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-zinc-300">
              {timeStatistics.thisWeek.bookings} đơn •{" "}
              {timeStatistics.thisWeek.tickets} vé
            </div>
            <div className="text-zinc-400">
              {timeStatistics.thisWeek.customers} khách hàng
            </div>
          </CardFooter>
        </StatCard>

        {/* Time Stats - This Month */}
        <StatCard delay={1.2}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Calendar className="size-4 text-sky-400" />
              Tháng Này
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-sky-400">
              {formatCurrency(timeStatistics.thisMonth.revenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-zinc-300">
              {timeStatistics.thisMonth.bookings} đơn •{" "}
              {timeStatistics.thisMonth.tickets} vé
            </div>
            <div className="text-zinc-400">
              {timeStatistics.thisMonth.customers} khách hàng
            </div>
          </CardFooter>
        </StatCard>

        {/* Time Stats - This Year */}
        <StatCard delay={1.3}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Calendar className="size-4 text-violet-400" />
              Năm Nay
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-violet-400">
              {formatCurrency(timeStatistics.thisYear.revenue)}
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-zinc-300">
              {timeStatistics.thisYear.bookings} đơn •{" "}
              {timeStatistics.thisYear.tickets} vé
            </div>
            <div className="text-zinc-400">
              {timeStatistics.thisYear.customers} khách hàng
            </div>
          </CardFooter>
        </StatCard>
      </div>

      {/* Top Customers & Payment Stats - Row 6 */}
      <div className="grid grid-cols-1 gap-4 @xl/main:grid-cols-2">
        {/* Top Customers */}
        <StatCard delay={1.4}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Users className="size-4 text-violet-400" />
              Top Khách Hàng Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">#</th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">Khách Hàng</th>
                    <th className="text-right py-2 px-2 text-zinc-400 font-medium">Chi Tiêu</th>
                    <th className="text-right py-2 px-2 text-zinc-400 font-medium hidden sm:table-cell">Đơn</th>
                  </tr>
                </thead>
                <tbody>
                  {topCustomers.byRevenue.slice(0, 5).map((customer, idx) => (
                    <tr
                      key={customer.customerId}
                      className="border-b border-zinc-700/50 last:border-0 hover:bg-zinc-700/30 transition-colors"
                    >
                      <td className="py-3 px-2">
                        <span
                          className={cn(
                            "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                            idx === 0
                              ? "bg-yellow-500/20 text-yellow-400"
                              : idx === 1
                              ? "bg-zinc-400/20 text-zinc-300"
                              : idx === 2
                              ? "bg-orange-600/20 text-orange-400"
                              : "bg-zinc-600/20 text-zinc-400"
                          )}
                        >
                          {idx + 1}
                        </span>
                      </td>
                      <td className="py-3 px-2">
                        <div className="font-medium text-zinc-100">{customer.fullname}</div>
                        <div className="text-xs text-zinc-400">{customer.email}</div>
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-violet-400">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="py-3 px-2 text-right text-zinc-300 hidden sm:table-cell">
                        {customer.totalBookings}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
              {topCustomers.byRevenue.length === 0 && (
                <div className="text-center text-zinc-500 py-4">Chưa có dữ liệu</div>
              )}
            </div>
          </CardContent>
        </StatCard>

        {/* Payment Stats */}
        <StatCard delay={1.5}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <CreditCard className="size-4 text-indigo-400" />
              Thống Kê Thanh Toán
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-2 gap-4">
              <div className="bg-zinc-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-indigo-400">
                  {paymentStatistics.paymentByProvider.reduce((sum, p) => sum + p.bookingCount, 0)}
                </div>
                <div className="text-xs text-zinc-400">Tổng giao dịch</div>
              </div>
              <div className="bg-zinc-700/30 rounded-lg p-4 text-center">
                <div className="text-2xl font-bold text-red-400">
                  {paymentStatistics.failedPaymentRate.toFixed(1)}%
                </div>
                <div className="text-xs text-zinc-400">Tỷ lệ lỗi</div>
              </div>
            </div>
            
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 font-medium">Theo nhà cung cấp</div>
              <HorizontalBarChart
                items={paymentStatistics.paymentByProvider.map((p) => ({
                  label: p.provider.toUpperCase(),
                  value: p.totalAmount,
                  color: "linear-gradient(to right, #6366f1, #818cf8)",
                }))}
                formatValue={formatCurrency}
              />
              {paymentStatistics.paymentByProvider.length === 0 && (
                <div className="text-center text-zinc-500 py-2">Chưa có dữ liệu</div>
              )}
            </div>

            {paymentStatistics.pendingPaymentAmount > 0 && (
              <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                <div className="text-sm text-yellow-400">
                  Đang chờ thanh toán: {formatCurrency(paymentStatistics.pendingPaymentAmount)}
                </div>
              </div>
            )}
          </CardContent>
        </StatCard>
      </div>
    </div>
  );
}
