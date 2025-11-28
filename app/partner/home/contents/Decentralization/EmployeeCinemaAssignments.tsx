"use client";

import React from "react";
import { useGetCinemaAssignments } from "@/apis/partner.decentralization.api";
import { Badge } from "@/components/ui/badge";
import { MapPin, Building2 } from "lucide-react";
import { cn } from "@/lib/utils";

interface EmployeeCinemaAssignmentsProps {
  employeeId: number;
  isActive: boolean;
  roleType?: string;
}

export default function EmployeeCinemaAssignments({ 
  employeeId, 
  isActive,
  roleType = "Staff"
}: EmployeeCinemaAssignmentsProps) {
  const { data: assignmentsData, isLoading, error } = useGetCinemaAssignments(employeeId);

  
  const assignments = assignmentsData?.result?.filter(a => a.isActive) || [];

  const isCashier = roleType === "Cashier";

  if (isLoading) {
    return (
      <div className="mt-2 pt-2 border-t border-zinc-700">
        <div className="h-4 bg-zinc-700 rounded w-24 mb-2 animate-pulse" />
        <div className="h-3 bg-zinc-700 rounded w-full animate-pulse" />
      </div>
    );
  }

  if (assignments.length === 0) {
    return (
      <div className="mt-2 pt-2 border-t border-zinc-700">
        <div className="flex items-center gap-1.5 text-xs text-zinc-500">
          <Building2 className="h-3.5 w-3.5" />
          <span>{isCashier ? "Chưa được phân rạp thu ngân" : "Chưa được phân rạp"}</span>
        </div>
      </div>
    );
  }

  return (
    <div className="mt-2 pt-2 border-t border-zinc-700 space-y-1.5">
      <div className="flex items-center gap-1.5 text-xs font-medium text-zinc-300">
        <Building2 className="h-3.5 w-3.5" />
        <span>
          {isCashier 
            ? "Thu ngân tại:" 
            : assignments.length === 1 
              ? "Quản lý rạp:" 
              : `Quản lý ${assignments.length} rạp:`
          }
        </span>
      </div>
      <div className="space-y-1">
        {assignments.map((assignment) => (
          <div 
            key={assignment.assignmentId}
            className="flex items-start gap-1.5 text-xs"
          >
            <MapPin className="h-3 w-3 text-emerald-400 mt-0.5 flex-shrink-0" />
            <div className="flex-1 min-w-0">
              <p className="text-zinc-300 font-medium truncate">
                {assignment.cinemaName}
              </p>
              <p className="text-zinc-500 text-[10px]">
                {assignment.cinemaCity}
              </p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
}
