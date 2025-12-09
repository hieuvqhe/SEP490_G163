import React from "react";
import { Card, CardContent, CardDescription, CardHeader } from "@/components/ui/card";
import { cn } from "@/lib/utils";
import { motion } from "framer-motion";

interface StatCardProps {
  title: string;
  value: string | number;
  icon: React.ElementType;
  color: string;
  subtitle?: string;
  delay?: number;
}

export function StatCard({
  title,
  value,
  icon: Icon,
  color,
  subtitle,
  delay = 0,
}: StatCardProps) {
  return (
    <motion.div
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, delay }}
    >
      <Card className="bg-zinc-800/80 border border-zinc-700 rounded-xl hover:shadow-lg hover:border-zinc-500/50 transition-all duration-300 hover:-translate-y-1">
        <CardHeader className="pb-2">
          <CardDescription className="text-zinc-400 flex items-center gap-2">
            <Icon className={cn("size-4", color)} />
            {title}
          </CardDescription>
        </CardHeader>
        <CardContent>
          <div className={cn("text-2xl font-bold", color)}>{value}</div>
          {subtitle && <p className="text-xs text-zinc-400 mt-1">{subtitle}</p>}
        </CardContent>
      </Card>
    </motion.div>
  );
}
