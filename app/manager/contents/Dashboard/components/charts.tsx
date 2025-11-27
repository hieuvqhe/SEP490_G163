"use client";

import { motion } from "framer-motion";
import { cn } from "@/lib/utils";

interface BarChartItem {
  value: number;
  label: string;
  color?: string;
}

interface SimpleBarChartProps {
  items: BarChartItem[];
  height?: number;
  showLabels?: boolean;
  className?: string;
  barClassName?: string;
}

export function SimpleBarChart({
  items,
  height = 120,
  showLabels = true,
  className,
  barClassName,
}: SimpleBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);
  const chartHeight = showLabels ? height - 20 : height;

  return (
    <div className={cn("flex flex-col", className)} style={{ height }}>
      <div 
        className="flex items-end justify-between gap-1 group flex-1"
        style={{ height: chartHeight }}
      >
        {items.map((item, index) => {
          const barHeightPx = (item.value / maxValue) * chartHeight;

          return (
            <div 
              key={index} 
              className="flex flex-1 flex-col items-center justify-end cursor-pointer transition-opacity hover:!opacity-100 group-hover:opacity-70"
              style={{ height: chartHeight }}
            >
              <motion.div
                className={cn(
                  "w-full max-w-8 rounded-t-md bg-gradient-to-t from-orange-500 to-orange-400",
                  barClassName
                )}
                style={{ 
                  backgroundColor: item.color,
                  minHeight: item.value > 0 ? 4 : 0,
                }}
                initial={{ height: 0 }}
                animate={{ height: barHeightPx }}
                transition={{ duration: 0.8, delay: index * 0.05, ease: "easeOut" }}
              />
            </div>
          );
        })}
      </div>
      {showLabels && (
        <div className="flex justify-between gap-1 mt-1">
          {items.map((item, index) => (
            <span 
              key={index} 
              className="flex-1 text-[10px] text-zinc-400 truncate text-center"
            >
              {item.label}
            </span>
          ))}
        </div>
      )}
    </div>
  );
}

interface DonutChartProps {
  value: number;
  max?: number;
  size?: number;
  strokeWidth?: number;
  color?: string;
  bgColor?: string;
  className?: string;
  children?: React.ReactNode;
}

export function DonutChart({
  value,
  max = 100,
  size = 120,
  strokeWidth = 12,
  color = "#f97316",
  bgColor = "#3f3f46",
  className,
  children,
}: DonutChartProps) {
  const radius = (size - strokeWidth) / 2;
  const circumference = 2 * Math.PI * radius;
  const percentage = Math.min((value / max) * 100, 100);
  const strokeDashoffset = circumference - (percentage / 100) * circumference;

  return (
    <div className={cn("relative inline-flex items-center justify-center", className)}>
      <svg width={size} height={size} className="-rotate-90">
        <circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={bgColor}
          strokeWidth={strokeWidth}
        />
        <motion.circle
          cx={size / 2}
          cy={size / 2}
          r={radius}
          fill="none"
          stroke={color}
          strokeWidth={strokeWidth}
          strokeLinecap="round"
          strokeDasharray={circumference}
          initial={{ strokeDashoffset: circumference }}
          animate={{ strokeDashoffset }}
          transition={{ duration: 1.5, ease: "easeOut" }}
        />
      </svg>
      {children && (
        <div className="absolute inset-0 flex items-center justify-center">
          {children}
        </div>
      )}
    </div>
  );
}

interface MiniSparklineProps {
  data: number[];
  width?: number;
  height?: number;
  color?: string;
  className?: string;
}

export function MiniSparkline({
  data,
  width = 100,
  height = 30,
  color = "#22c55e",
  className,
}: MiniSparklineProps) {
  if (data.length < 2) return null;

  const max = Math.max(...data);
  const min = Math.min(...data);
  const range = max - min || 1;

  const points = data
    .map((value, index) => {
      const x = (index / (data.length - 1)) * width;
      const y = height - ((value - min) / range) * (height - 4) - 2;
      return `${x},${y}`;
    })
    .join(" ");

  return (
    <svg width={width} height={height} className={className}>
      <motion.polyline
        fill="none"
        stroke={color}
        strokeWidth={2}
        strokeLinecap="round"
        strokeLinejoin="round"
        points={points}
        initial={{ pathLength: 0 }}
        animate={{ pathLength: 1 }}
        transition={{ duration: 1.5, ease: "easeOut" }}
      />
    </svg>
  );
}

interface SpendingItem {
  day: string;
  amount: number;
}

interface WeeklyRevenueTrackerProps {
  spending: SpendingItem[];
  title?: string;
  subtitle?: string;
  formatValue?: (value: number) => string;
  className?: string;
}

export function WeeklyRevenueTracker({
  spending,
  title,
  subtitle = "DOANH THU TUẦN NÀY",
  formatValue = (v) => `${Intl.NumberFormat("vi-VN").format(v)} đ`,
  className,
}: WeeklyRevenueTrackerProps) {
  const totalSpending = spending.reduce((acc, item) => acc + item.amount, 0);
  const maxAmount = Math.max(...spending.map((item) => item.amount), 1);

  return (
    <div
      className={cn(
        "flex flex-col rounded-2xl border border-zinc-700 bg-zinc-800/80 p-4",
        className
      )}
    >
      <h4 className="mb-1 text-sm font-semibold text-zinc-400">
        {title ||
          `${new Date()
            .toLocaleString("vi-VN", { month: "long" })
            .toUpperCase()} ${new Date().getFullYear()}`}
      </h4>
      <div className="group flex flex-1 items-end justify-between gap-1 py-2">
        {spending.map((item, index) => (
          <div
            key={`${item.day}-${index}`}
            className="flex cursor-pointer flex-col items-center transition-opacity hover:!opacity-100 group-hover:opacity-50"
          >
            <div className="mb-1 text-xs text-zinc-300">{item.day}</div>
            <div
              className="w-4 rounded-full bg-zinc-600 relative overflow-hidden"
              style={{ height: 80 }}
            >
              <motion.div
                className="absolute bottom-0 left-0 w-full rounded-full bg-gradient-to-t from-blue-600 to-blue-400"
                initial={{ height: 0 }}
                animate={{
                  height: `${(item.amount / maxAmount) * 100}%`,
                }}
                transition={{
                  duration: 0.8,
                  delay: index * 0.1,
                  ease: "easeOut",
                }}
              />
            </div>
          </div>
        ))}
      </div>
      <div className="mt-3">
        <p className="text-xs tracking-wide text-zinc-400">{subtitle}</p>
        <p className="text-xl font-black text-zinc-100">
          {formatValue(totalSpending)}
        </p>
      </div>
    </div>
  );
}

interface HorizontalBarItem {
  label: string;
  value: number;
  color?: string;
}

interface HorizontalBarChartProps {
  items: HorizontalBarItem[];
  formatValue?: (value: number) => string;
  className?: string;
}

export function HorizontalBarChart({
  items,
  formatValue = (v) => v.toLocaleString("vi-VN"),
  className,
}: HorizontalBarChartProps) {
  const maxValue = Math.max(...items.map((item) => item.value), 1);

  return (
    <div className={cn("space-y-3", className)}>
      {items.map((item, index) => {
        const percentage = (item.value / maxValue) * 100;
        return (
          <div key={index} className="space-y-1">
            <div className="flex items-center justify-between text-sm">
              <span className="text-zinc-100 truncate">{item.label}</span>
              <span className="text-zinc-400 ml-2 shrink-0">
                {formatValue(item.value)}
              </span>
            </div>
            <div className="w-full bg-zinc-700/50 rounded-full h-2">
              <motion.div
                className="h-2 rounded-full"
                style={{
                  background: item.color || "linear-gradient(to right, #f97316, #fb923c)",
                }}
                initial={{ width: 0 }}
                animate={{ width: `${percentage}%` }}
                transition={{ duration: 0.8, delay: index * 0.1, ease: "easeOut" }}
              />
            </div>
          </div>
        );
      })}
    </div>
  );
}

interface StatGridItem {
  label: string;
  value: string | number;
  icon?: React.ReactNode;
  color?: string;
}

interface StatsGridProps {
  items: StatGridItem[];
  columns?: 2 | 3 | 4;
  className?: string;
}

export function StatsGrid({ items, columns = 3, className }: StatsGridProps) {
  const gridCols = {
    2: "grid-cols-2",
    3: "grid-cols-3",
    4: "grid-cols-4",
  };

  return (
    <div className={cn("grid gap-3", gridCols[columns], className)}>
      {items.map((item, index) => (
        <motion.div
          key={index}
          className="bg-zinc-700/30 rounded-lg p-3 text-center"
          initial={{ opacity: 0, scale: 0.9 }}
          animate={{ opacity: 1, scale: 1 }}
          transition={{ duration: 0.3, delay: index * 0.1 }}
        >
          {item.icon && <div className="mb-1">{item.icon}</div>}
          <div
            className="text-xl font-bold"
            style={{ color: item.color || "#14b8a6" }}
          >
            {item.value}
          </div>
          <div className="text-xs text-zinc-400">{item.label}</div>
        </motion.div>
      ))}
    </div>
  );
}
