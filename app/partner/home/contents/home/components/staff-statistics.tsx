"use client";

import { Badge } from "@/components/ui/badge";
import {
  Card,
  CardContent,
  CardDescription,
  CardFooter,
  CardHeader,
  CardTitle,
} from "@/components/ui/card";
import {
  TrendingUpIcon,
  Users,
  DollarSign,
  Ticket,
  Building2,
  AlertCircle,
  Award,
  UserCheck,
  UserX,
  Briefcase,
  Star,
  Calendar,
} from "lucide-react";
import {
  useGetStaffPerformance,
  StaffPerformanceItem,
} from "@/apis/partner.statistic.api";
import { AnimatedCounter } from "./animated-counter";
import { DonutChart, HorizontalBarChart } from "./charts";
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

// Role badge component
function RoleBadge({ role }: { role: string }) {
  const roleConfig: Record<string, { bg: string; text: string; label: string }> = {
    Staff: { bg: "bg-blue-500/20", text: "text-blue-400", label: "Nhân viên" },
    Marketing: { bg: "bg-purple-500/20", text: "text-purple-400", label: "Marketing" },
    Cashier: { bg: "bg-green-500/20", text: "text-green-400", label: "Thu ngân" },
  };

  const config = roleConfig[role] || roleConfig.Staff;

  return (
    <Badge className={cn(config.bg, config.text, "border-transparent")}>
      {config.label}
    </Badge>
  );
}

// Staff card component
function StaffCard({
  staff,
  rank,
  delay = 0,
}: {
  staff: StaffPerformanceItem;
  rank: number;
  delay?: number;
}) {
  const getRankStyle = (rank: number) => {
    switch (rank) {
      case 1:
        return "bg-yellow-500/20 text-yellow-400 border-yellow-500/30";
      case 2:
        return "bg-zinc-400/20 text-zinc-300 border-zinc-400/30";
      case 3:
        return "bg-orange-600/20 text-orange-400 border-orange-600/30";
      default:
        return "bg-zinc-600/20 text-zinc-400 border-zinc-600/30";
    }
  };

  return (
    <motion.div
      initial={{ opacity: 0, x: -20 }}
      animate={{ opacity: 1, x: 0 }}
      transition={{ duration: 0.4, delay }}
      className="flex items-center justify-between py-3 px-4 border-b border-zinc-700/50 last:border-0 hover:bg-zinc-700/30 transition-colors rounded-lg"
    >
      <div className="flex items-center gap-4">
        <span
          className={cn(
            "flex items-center justify-center size-8 rounded-full text-sm font-bold border",
            getRankStyle(rank)
          )}
        >
          {rank <= 3 ? (
            <Star className="size-4" />
          ) : (
            rank
          )}
        </span>
        <div>
          <div className="flex items-center gap-2">
            <span className="text-sm font-medium text-zinc-100">
              {staff.employeeName}
            </span>
            <RoleBadge role={staff.roleType} />
            {!staff.isActive && (
              <Badge className="bg-red-500/20 text-red-400 border-red-500/30">
                Không hoạt động
              </Badge>
            )}
          </div>
          <div className="text-xs text-zinc-400 mt-0.5">
            {staff.email}
          </div>
          <div className="text-xs text-zinc-500 mt-0.5">
            Quản lý {staff.cinemaCount} rạp • {staff.cinemaNames.slice(0, 2).join(", ")}
            {staff.cinemaNames.length > 2 && ` +${staff.cinemaNames.length - 2}`}
          </div>
        </div>
      </div>
      <div className="text-right">
        <div className="text-sm font-semibold text-emerald-400">
          {formatCurrency(staff.totalRevenue)}
        </div>
        <div className="text-xs text-zinc-400">
          {staff.totalBookings} đơn • {staff.totalTicketsSold} vé
        </div>
      </div>
    </motion.div>
  );
}

export function StaffStatistics() {
  const { data, isLoading, isError, error } = useGetStaffPerformance({
    topLimit: 10,
  });

  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (isError) {
    return (
      <ErrorState
        message={error?.message || "Không thể tải dữ liệu thống kê nhân viên"}
      />
    );
  }

  const result = data?.result;
  if (!result) {
    return <ErrorState message="Không có dữ liệu thống kê nhân viên" />;
  }

  const { staffPerformance, summary } = result;

  // Group staff by role
  const staffByRole = staffPerformance.reduce((acc, staff) => {
    acc[staff.roleType] = (acc[staff.roleType] || 0) + 1;
    return acc;
  }, {} as Record<string, number>);

  // Calculate active/inactive staff
  const activeStaff = staffPerformance.filter((s) => s.isActive).length;
  const inactiveStaff = staffPerformance.filter((s) => !s.isActive).length;

  // Top performers for chart
  const topPerformersForChart = staffPerformance.slice(0, 5).map((staff) => ({
    label: staff.employeeName.split(" ").slice(-2).join(" "),
    value: staff.totalRevenue,
    color: staff.rank === 1 ? "#fbbf24" : staff.rank === 2 ? "#9ca3af" : staff.rank === 3 ? "#f97316" : "#3b82f6",
  }));

  return (
    <div className="space-y-6">
      {/* Overview Stats - Row 1 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-4">
        {/* Total Staff Card */}
        <StatCard delay={0} className="h-full flex flex-col">
          <CardHeader className="flex-1">
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Users className="size-4 text-blue-400" />
              Tổng Nhân Viên
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-blue-400">
              <AnimatedCounter value={summary.totalStaff} />
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm min-h-[60px]">
            <div className="flex gap-2 font-medium text-green-400">
              <UserCheck className="size-4" />
              {activeStaff} đang hoạt động
            </div>
            <div className="text-zinc-400">
              {inactiveStaff > 0 ? `${inactiveStaff} không hoạt động` : "Tất cả đang hoạt động"}
            </div>
          </CardFooter>
        </StatCard>

        {/* Total Revenue Card */}
        <StatCard delay={0.1} className="h-full flex flex-col">
          <CardHeader className="flex-1">
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <DollarSign className="size-4 text-orange-400" />
              Tổng Doanh Thu
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-orange-400">
              <AnimatedCounter
                value={summary.totalRevenue}
                format={formatCurrency}
              />
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm min-h-[60px]">
            <div className="flex gap-2 font-medium text-orange-400">
              <TrendingUpIcon className="size-4" />
              Tổng doanh thu từ nhân viên
            </div>
            <div className="text-zinc-400">Thống kê theo hiệu suất</div>
          </CardFooter>
        </StatCard>

        {/* Total Bookings Card */}
        <StatCard delay={0.2} className="h-full flex flex-col">
          <CardHeader className="flex-1">
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Ticket className="size-4 text-purple-400" />
              Tổng Đơn Hàng
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-purple-400">
              <AnimatedCounter value={summary.totalBookings} />
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm min-h-[60px]">
            <div className="flex gap-2 font-medium text-purple-400">
              Đơn hàng được xử lý
            </div>
            <div className="text-zinc-400">Bởi tất cả nhân viên</div>
          </CardFooter>
        </StatCard>

        {/* Average Revenue Per Staff Card */}
        <StatCard delay={0.3} className="h-full flex flex-col">
          <CardHeader className="flex-1">
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Award className="size-4 text-emerald-400" />
              Doanh Thu TB/Nhân Viên
            </CardDescription>
            <CardTitle className="text-2xl font-semibold tabular-nums @[250px]/card:text-3xl text-emerald-400">
              <AnimatedCounter
                value={summary.averageRevenuePerStaff}
                format={formatCurrency}
              />
            </CardTitle>
          </CardHeader>
          <CardFooter className="flex-col items-start gap-1.5 text-sm min-h-[60px]">
            <div className="flex gap-2 font-medium text-emerald-400">
              Hiệu suất trung bình
            </div>
            <div className="text-zinc-400">Theo từng nhân viên</div>
          </CardFooter>
        </StatCard>
      </div>

      {/* Best Performer & Role Distribution - Row 2 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6 @xl/main:grid-cols-2 @5xl/main:grid-cols-3">
        {/* Best Performer Card */}
        {summary.bestPerformer && (
          <StatCard delay={0.4} className="h-full">
            <CardHeader>
              <CardDescription className="text-zinc-400 flex items-center gap-2">
                <Star className="size-4 text-yellow-400" />
                Nhân Viên Xuất Sắc Nhất
              </CardDescription>
            </CardHeader>
            <CardContent className="flex flex-col items-center justify-center flex-1 py-4">
              <div className="relative">
                <div className="size-20 rounded-full bg-gradient-to-br from-yellow-400 to-orange-500 flex items-center justify-center">
                  <span className="text-2xl font-bold text-zinc-900">
                    {summary.bestPerformer.employeeName.charAt(0).toUpperCase()}
                  </span>
                </div>
                <div className="absolute -top-1 -right-1 size-8 rounded-full bg-yellow-500 flex items-center justify-center border-2 border-zinc-800">
                  <Star className="size-4 text-zinc-900" />
                </div>
              </div>
              <div className="mt-4 text-center">
                <div className="text-lg font-semibold text-zinc-100">
                  {summary.bestPerformer.employeeName}
                </div>
                <div className="text-sm text-zinc-400 mb-2">
                  {summary.bestPerformer.email}
                </div>
                <RoleBadge role={summary.bestPerformer.roleType} />
              </div>
              <div className="mt-4 grid grid-cols-3 gap-4 w-full text-center">
                <div>
                  <div className="text-lg font-bold text-yellow-400">
                    {formatCurrency(summary.bestPerformer.totalRevenue)}
                  </div>
                  <div className="text-xs text-zinc-400">Doanh thu</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-blue-400">
                    {summary.bestPerformer.totalBookings}
                  </div>
                  <div className="text-xs text-zinc-400">Đơn hàng</div>
                </div>
                <div>
                  <div className="text-lg font-bold text-purple-400">
                    {summary.bestPerformer.totalTicketsSold}
                  </div>
                  <div className="text-xs text-zinc-400">Vé bán</div>
                </div>
              </div>
            </CardContent>
          </StatCard>
        )}

        {/* Role Distribution */}
        <StatCard delay={0.5} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Briefcase className="size-4 text-indigo-400" />
              Phân Bố Theo Vai Trò
            </CardDescription>
          </CardHeader>
          <CardContent className="flex flex-col items-center justify-center flex-1">
            <DonutChart
              value={activeStaff}
              max={summary.totalStaff}
              size={120}
              strokeWidth={12}
              color="#22c55e"
            >
              <div className="text-center">
                <div className="text-xl font-bold text-green-400">
                  {((activeStaff / summary.totalStaff) * 100).toFixed(0)}%
                </div>
                <div className="text-[10px] text-zinc-400">Hoạt động</div>
              </div>
            </DonutChart>
            <div className="mt-4 w-full space-y-2">
              {Object.entries(staffByRole).map(([role, count]) => (
                <div key={role} className="flex items-center justify-between">
                  <RoleBadge role={role} />
                  <span className="text-sm text-zinc-300">{count} người</span>
                </div>
              ))}
            </div>
          </CardContent>
        </StatCard>

        {/* Top Performers Chart */}
        <StatCard delay={0.6} className="h-full">
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <TrendingUpIcon className="size-4 text-emerald-400" />
              Top 5 Nhân Viên Theo Doanh Thu
            </CardDescription>
          </CardHeader>
          <CardContent>
            <HorizontalBarChart
              items={topPerformersForChart}
              formatValue={formatCurrency}
            />
          </CardContent>
        </StatCard>
      </div>

      {/* Staff Performance List - Row 3 */}
      <div className="grid grid-cols-1 gap-4 px-4 lg:px-6">
        <StatCard delay={0.7}>
          <CardHeader>
            <CardDescription className="text-zinc-400 flex items-center gap-2">
              <Users className="size-4 text-cyan-400" />
              Bảng Xếp Hạng Nhân Viên
            </CardDescription>
            <CardTitle className="text-lg font-semibold">
              Theo Hiệu Suất Doanh Thu
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              {staffPerformance.map((staff, idx) => (
                <StaffCard
                  key={staff.employeeId}
                  staff={staff}
                  rank={staff.rank || idx + 1}
                  delay={0.1 * idx}
                />
              ))}
            </div>
            {staffPerformance.length === 0 && (
              <div className="text-center py-8 text-zinc-400">
                Không có dữ liệu nhân viên
              </div>
            )}
          </CardContent>
        </StatCard>
      </div>

      {/* Staff Details Grid - Row 4 */}
      <div className="flex justify-center px-4 lg:px-6">
        <div className={cn(
          "grid gap-4 w-full",
          staffPerformance.length <= 2 
            ? "grid-cols-1 @xl/main:grid-cols-2 max-w-4xl" 
            : "grid-cols-1 @xl/main:grid-cols-2 @5xl/main:grid-cols-3"
        )}>
          {staffPerformance.slice(0, 6).map((staff, idx) => (
            <StatCard key={staff.employeeId} delay={0.8 + idx * 0.1} className="h-full">
              <CardHeader className="pb-2">
                <div className="flex items-center justify-between">
                  <CardDescription className="text-zinc-400 flex items-center gap-2">
                    <span
                      className={cn(
                        "flex items-center justify-center size-6 rounded-full text-xs font-bold",
                        staff.rank === 1
                          ? "bg-yellow-500/20 text-yellow-400"
                          : staff.rank === 2
                          ? "bg-zinc-400/20 text-zinc-300"
                          : staff.rank === 3
                          ? "bg-orange-600/20 text-orange-400"
                          : "bg-zinc-600/20 text-zinc-400"
                      )}
                    >
                      #{staff.rank}
                    </span>
                    {staff.employeeName}
                  </CardDescription>
                  <RoleBadge role={staff.roleType} />
                </div>
              </CardHeader>
              <CardContent className="space-y-3">
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-700/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-orange-400">
                      {formatCurrency(staff.totalRevenue)}
                    </div>
                    <div className="text-xs text-zinc-400">Doanh thu</div>
                  </div>
                  <div className="bg-zinc-700/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-blue-400">
                      {staff.totalBookings}
                    </div>
                    <div className="text-xs text-zinc-400">Đơn hàng</div>
                  </div>
                </div>
                <div className="grid grid-cols-2 gap-3">
                  <div className="bg-zinc-700/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-purple-400">
                      {staff.totalTicketsSold}
                    </div>
                    <div className="text-xs text-zinc-400">Vé bán</div>
                  </div>
                  <div className="bg-zinc-700/30 rounded-lg p-2 text-center">
                    <div className="text-lg font-bold text-emerald-400">
                      {formatCurrency(staff.averageBookingValue)}
                    </div>
                    <div className="text-xs text-zinc-400">TB/Đơn</div>
                  </div>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Building2 className="size-3" />
                  <span>
                    {staff.cinemaNames.length > 0
                      ? staff.cinemaNames.join(", ")
                      : "Chưa phân công rạp"}
                  </span>
                </div>
                <div className="flex items-center gap-2 text-xs text-zinc-400">
                  <Calendar className="size-3" />
                  <span>
                    Ngày vào làm:{" "}
                    {new Date(staff.hireDate).toLocaleDateString("vi-VN")}
                  </span>
                </div>
              </CardContent>
            </StatCard>
          ))}
        </div>
      </div>
    </div>
  );
}
