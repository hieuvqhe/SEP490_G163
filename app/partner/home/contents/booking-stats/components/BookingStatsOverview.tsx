import React from "react";
import { BookingStatisticsOverview } from "@/apis/partner.bookings.api";
import { StatCard } from "./StatCard";
import { Ticket, DollarSign, Users, CalendarCheck } from "lucide-react";
import { LoadingSkeleton } from "./LoadingSkeleton";

interface BookingStatsOverviewProps {
  stats?: BookingStatisticsOverview;
  isLoading: boolean;
}

export function BookingStatsOverview({ stats, isLoading }: BookingStatsOverviewProps) {
  if (isLoading) {
    return <LoadingSkeleton />;
  }

  if (!stats) {
    return null;
  }

  return (
    <div className="grid grid-cols-1 gap-4 sm:grid-cols-2 lg:grid-cols-4">
      <StatCard
        title="Tổng Đơn Đặt Vé"
        value={stats.totalBookings.toLocaleString()}
        icon={CalendarCheck}
        color="text-blue-500"
        subtitle={`${stats.totalPaidBookings} đơn đã thanh toán`}
        delay={0.1}
      />
      <StatCard
        title="Tổng Doanh Thu"
        value={`${stats.totalRevenue.toLocaleString()} đ`}
        icon={DollarSign}
        color="text-green-500"
        subtitle="Doanh thu thực tế"
        delay={0.2}
      />
      <StatCard
        title="Vé Đã Bán"
        value={stats.totalTicketsSold.toLocaleString()}
        icon={Ticket}
        color="text-purple-500"
        subtitle="Tổng số vé"
        delay={0.3}
      />
      <StatCard
        title="Khách Hàng"
        value={stats.totalCustomers.toLocaleString()}
        icon={Users}
        color="text-orange-500"
        subtitle="Khách hàng duy nhất"
        delay={0.4}
      />
    </div>
  );
}
