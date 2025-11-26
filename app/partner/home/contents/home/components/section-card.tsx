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
  ShoppingCart,
  CreditCard,
  Armchair,
  Calendar,
  AlertCircle,
} from "lucide-react";
import { useGetBookingStatistics } from "@/apis/partner.statistic.api";
import { AnimatedCounter } from "./animated-counter";
import { SimpleBarChart, DonutChart, WeeklyRevenueTracker } from "./charts";
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
    <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
      {Array.from({ length: 8 }).map((_, i) => (
        <Card
          key={i}
          className="bg-zinc-800/80 border border-zinc-700 rounded-xl animate-pulse"
        >
          <CardHeader>
            <div className="h-4 w-24 bg-zinc-700 rounded" />
            <div className="h-8 w-32 bg-zinc-700 rounded mt-2" />
          </CardHeader>
          <CardFooter>
            <div className="h-4 w-40 bg-zinc-700 rounded" />
          </CardFooter>
        </Card>
      ))}
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

export function SectionCards() {
  const { data, isLoading, isError, error } = useGetBookingStatistics({
    groupBy: "day",
    includeComparison: true,
    topLimit: 10,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Không thể tải dữ liệu thống kê"}
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
    serviceStatistics,
    seatStatistics,
    showtimeStatistics,
    paymentStatistics,
  } = stats;

  // Calculate comparison percentages
  const revenueChange =
    timeStatistics.periodComparison?.revenueChangePercentage || 0;
  const bookingsChange =
    timeStatistics.periodComparison?.bookingsChangePercentage || 0;

  return (
    <div className="space-y-6">
      {/* Overview Stats - Row 1 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
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
            <div className="text-zinc-400">Thống kê 30 ngày gần nhất</div>
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
              <Armchair className="size-4 text-purple-400" />
              Vé Đã Bán
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-400">
              <AnimatedCounter value={overview.totalTicketsSold} />
            </CardTitle>
            <CardAction>
              <Badge className="bg-purple-500/20 text-purple-400 border-purple-500/30">
                <Armchair className="size-4 mr-1" />
                {seatStatistics.overallOccupancyRate.toFixed(1)}%
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium text-purple-400">
              Tỷ lệ lấp đầy ghế
            </div>
            <div className="text-zinc-400">
              {seatStatistics.totalSeatsAvailable.toLocaleString()} ghế khả dụng
            </div>
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
              <Badge className="bg-green-500/20 text-green-400 border-green-500/30">
                <Users className="size-4 mr-1" />
                Active
              </Badge>
            </CardAction>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm">
            <div className="flex gap-2 font-medium text-green-400">
              Giá trị TB: {formatCurrency(overview.averageOrderValue)}
            </div>
            <div className="text-zinc-400">Trung bình mỗi đơn hàng</div>
          </CardFooter>
        </StatCard>
      </div>

      {/* Charts Row - Row 2 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Revenue Trend Card */}
        <StatCard delay={0.4} className="@5xl/main:col-span-2">
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
            {timeStatistics.revenueTrend.length > 0 ? (
              <SimpleBarChart
                items={timeStatistics.revenueTrend.map((t) => ({
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
        >
          <WeeklyRevenueTracker
            spending={(() => {
              // Generate last 7 days data from revenueTrend
              const days = ["CN", "T2", "T3", "T4", "T5", "T6", "T7"];
              const today = new Date();
              const last7Days = [];
              
              for (let i = 6; i >= 0; i--) {
                const date = new Date(today);
                date.setDate(date.getDate() - i);
                const dateStr = date.toISOString().split("T")[0];
                const dayOfWeek = date.getDay();
                
                const trendItem = timeStatistics.revenueTrend.find(
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

        {/* Service Revenue Donut */}
        <StatCard delay={0.5}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <ShoppingCart className="size-4 text-pink-400" />
              Doanh Thu Dịch Vụ
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center">
            <DonutChart
              value={serviceStatistics.serviceRevenuePercentage}
              max={100}
              size={100}
              strokeWidth={10}
              color="#ec4899"
            >
              <div className="text-center">
                <div className="text-lg font-bold text-pink-400">
                  {serviceStatistics.serviceRevenuePercentage.toFixed(0)}%
                </div>
                <div className="text-[10px] text-zinc-400">Tổng DT</div>
              </div>
            </DonutChart>
            <div className="mt-3 text-center">
              <div className="text-sm font-semibold text-zinc-100">
                {formatCurrency(serviceStatistics.totalServiceRevenue)}
              </div>
              <div className="text-xs text-zinc-400">
                {serviceStatistics.totalServiceOrders} đơn dịch vụ
              </div>
            </div>
          </CardContent>
        </StatCard>
      </div>

      {/* Cinema & Movie Stats - Row 3 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
        {/* Top Cinemas */}
        <StatCard delay={0.6}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Building2 className="size-4 text-cyan-400" />
              Top Rạp Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {cinemaRevenue.topCinemasByRevenue.slice(0, 4).map((cinema, idx) => (
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
          </CardContent>
        </StatCard>

        {/* Top Movies */}
        <StatCard delay={0.7}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Film className="size-4 text-red-400" />
              Top Phim Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {movieStatistics.topMoviesByRevenue.slice(0, 4).map((movie, idx) => (
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
                    {movie.totalTicketsSold} vé
                  </div>
                </div>
              </div>
            ))}
          </CardContent>
        </StatCard>
      </div>

      {/* Bottom Stats - Row 4 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Time Stats - Today */}
        <StatCard delay={0.8}>
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
        <StatCard delay={0.9}>
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
        <StatCard delay={1.0}>
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

        {/* Payment Stats */}
        <StatCard delay={1.1}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <CreditCard className="size-4 text-indigo-400" />
              Thanh Toán
            </CardDescription>
            <CardTitle className="text-xl font-semibold tabular-nums text-indigo-400">
              {paymentStatistics.paymentByProvider.length > 0
                ? paymentStatistics.paymentByProvider[0].bookingCount
                : 0}{" "}
              đơn
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1 text-sm">
            <div className="text-zinc-300">
              {paymentStatistics.paymentByProvider
                .map((p) => p.provider.toUpperCase())
                .join(", ") || "N/A"}
            </div>
            <div className="text-zinc-400">
              Tỷ lệ lỗi: {paymentStatistics.failedPaymentRate.toFixed(1)}%
            </div>
          </CardFooter>
        </StatCard>
      </div>

      {/* Top Customers Row - Row 5 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
        <StatCard delay={1.2}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Users className="size-4 text-violet-400" />
              Top Khách Hàng
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Theo Doanh Thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="overflow-x-auto">
              <table className="w-full text-sm">
                <thead>
                  <tr className="border-b border-zinc-700">
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">
                      #
                    </th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium">
                      Khách Hàng
                    </th>
                    <th className="text-left py-2 px-2 text-zinc-400 font-medium hidden sm:table-cell">
                      Email
                    </th>
                    <th className="text-right py-2 px-2 text-zinc-400 font-medium">
                      Chi Tiêu
                    </th>
                    <th className="text-right py-2 px-2 text-zinc-400 font-medium hidden md:table-cell">
                      Đơn Hàng
                    </th>
                    <th className="text-right py-2 px-2 text-zinc-400 font-medium hidden lg:table-cell">
                      TB/Đơn
                    </th>
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
                        <div className="font-medium text-zinc-100">
                          {customer.fullname}
                        </div>
                        <div className="text-xs text-zinc-400 sm:hidden">
                          {customer.email}
                        </div>
                      </td>
                      <td className="py-3 px-2 text-zinc-300 hidden sm:table-cell">
                        {customer.email}
                      </td>
                      <td className="py-3 px-2 text-right font-semibold text-violet-400">
                        {formatCurrency(customer.totalSpent)}
                      </td>
                      <td className="py-3 px-2 text-right text-zinc-300 hidden md:table-cell">
                        {customer.totalBookings}
                      </td>
                      <td className="py-3 px-2 text-right text-zinc-400 hidden lg:table-cell">
                        {formatCurrency(customer.averageOrderValue)}
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </CardContent>
        </StatCard>
      </div>

      {/* Showtime & Seat Stats - Row 6 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2">
        {/* Showtime Stats */}
        <StatCard delay={1.3}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Calendar className="size-4 text-teal-400" />
              Thống Kê Suất Chiếu
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-4">
            <div className="grid grid-cols-3 gap-4 text-center">
              <div className="bg-zinc-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-teal-400">
                  {showtimeStatistics.totalShowtimes}
                </div>
                <div className="text-xs text-zinc-400">Tổng Suất</div>
              </div>
              <div className="bg-zinc-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-green-400">
                  {showtimeStatistics.showtimesWithBookings}
                </div>
                <div className="text-xs text-zinc-400">Có Đặt Vé</div>
              </div>
              <div className="bg-zinc-700/30 rounded-lg p-3">
                <div className="text-2xl font-bold text-zinc-400">
                  {showtimeStatistics.showtimesWithoutBookings}
                </div>
                <div className="text-xs text-zinc-400">Chưa Có</div>
              </div>
            </div>
            <div className="space-y-2">
              <div className="text-xs text-zinc-400 font-medium">
                Top suất chiếu theo doanh thu
              </div>
              {showtimeStatistics.topShowtimesByRevenue
                .slice(0, 3)
                .map((showtime) => (
                  <div
                    key={showtime.showtimeId}
                    className="flex items-center justify-between text-sm py-1.5 border-b border-zinc-700/30 last:border-0"
                  >
                    <div>
                      <div className="text-zinc-100 font-medium">
                        {showtime.movieTitle}
                      </div>
                      <div className="text-xs text-zinc-400">
                        {showtime.cinemaName} •{" "}
                        {new Date(showtime.showDatetime).toLocaleDateString(
                          "vi-VN"
                        )}
                      </div>
                    </div>
                    <div className="text-teal-400 font-semibold">
                      {formatCurrency(showtime.totalRevenue)}
                    </div>
                  </div>
                ))}
            </div>
          </CardContent>
        </StatCard>

        {/* Seat Type Stats */}
        <StatCard delay={1.4}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Armchair className="size-4 text-rose-400" />
              Thống Kê Loại Ghế
            </CardDescription>
          </CardHeader>
          <CardContent className="space-y-3">
            {seatStatistics.bySeatType.map((seatType) => {
              const percentage =
                (seatType.totalTicketsSold / seatStatistics.totalSeatsSold) *
                  100 || 0;
              return (
                <div key={seatType.seatTypeId} className="space-y-1">
                  <div className="flex items-center justify-between text-sm">
                    <span className="text-zinc-100">{seatType.seatTypeName}</span>
                    <span className="text-zinc-400">
                      {seatType.totalTicketsSold} vé •{" "}
                      {formatCurrency(seatType.totalRevenue)}
                    </span>
                  </div>
                  <div className="w-full bg-zinc-700/50 rounded-full h-2">
                    <motion.div
                      className="bg-gradient-to-r from-rose-500 to-pink-500 h-2 rounded-full"
                      initial={{ width: 0 }}
                      animate={{ width: `${percentage}%` }}
                      transition={{ duration: 1, delay: 0.5 }}
                    />
                  </div>
                  <div className="text-xs text-zinc-400 text-right">
                    Giá TB: {formatCurrency(seatType.averagePrice)}
                  </div>
                </div>
              );
            })}
          </CardContent>
        </StatCard>
      </div>
    </div>
  );
}
