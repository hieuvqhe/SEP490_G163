"use client";

import React from "react";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { MoreVertical, Edit, Trash2, MapPin } from "lucide-react";
import { cn } from "@/lib/utils";
import {
  useGetCinemaAssignments,
  type PartnerEmployee,
} from "@/apis/partner.decentralization.api";
import EmployeeCinemaAssignments from "./EmployeeCinemaAssignments";

interface EmployeeCardProps {
  employee: PartnerEmployee;
  onEdit: (employee: PartnerEmployee) => void;
  onAssign: (employee: PartnerEmployee) => void;
  onDelete: (employee: PartnerEmployee) => void;
  getRoleBadge: (role: string) => React.ReactNode;
  formatDate: (dateStr: string) => string;
}

export default function EmployeeCard({
  employee,
  onEdit,
  onAssign,
  onDelete,
  getRoleBadge,
  formatDate,
}: EmployeeCardProps) {
  // Kiểm tra assignments nếu là Staff
  const { data: assignmentsData } = useGetCinemaAssignments(
    employee.roleType === "Staff" ? employee.employeeId : undefined,
    { enabled: employee.roleType === "Staff" }
  );

  const hasActiveCinemas =
    employee.roleType === "Staff"
      ? (assignmentsData?.result?.filter((a) => a.isActive).length || 0) > 0
      : false;

  // Chỉ hiển thị menu "Tạm dừng làm việc" nếu:
  // - Không phải Staff, HOẶC
  // - Là Staff nhưng không có rạp nào đang quản lý
  const canDelete = !hasActiveCinemas;

  return (
    <Card className="bg-zinc-800/50 border-zinc-700 hover:bg-zinc-800 transition-all group">
      <CardHeader className="pb-3">
        <div className="flex items-start justify-between">
          <div className="flex items-center gap-3">
            <div className="w-12 h-12 rounded-full bg-gradient-to-br from-orange-500 to-pink-500 flex items-center justify-center text-white font-semibold">
              {employee.fullName.charAt(0).toUpperCase()}
            </div>
            <div>
              <CardTitle className="text-base text-zinc-100">
                {employee.fullName}
              </CardTitle>
              {getRoleBadge(employee.roleType)}
            </div>
          </div>
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <Button
                variant="ghost"
                size="sm"
                className="h-8 w-8 p-0 opacity-0 group-hover:opacity-100 transition-opacity"
              >
                <MoreVertical className="h-4 w-4" />
              </Button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
              <DropdownMenuItem
                onClick={() => onEdit(employee)}
                className="cursor-pointer hover:bg-zinc-700"
              >
                <Edit className="h-4 w-4 mr-2" />
                Chỉnh sửa
              </DropdownMenuItem>
              {employee.roleType === "Staff" && employee.isActive && (
                <DropdownMenuItem
                  onClick={() => onAssign(employee)}
                  className="cursor-pointer hover:bg-zinc-700"
                >
                  <MapPin className="h-4 w-4 mr-2" />
                  Phân rạp
                </DropdownMenuItem>
              )}
              {canDelete && (
                <DropdownMenuItem
                  onClick={() => onDelete(employee)}
                  className="cursor-pointer hover:bg-zinc-700 text-red-400"
                >
                  <Trash2 className="h-4 w-4 mr-2" />
                  Tạm dừng làm việc
                </DropdownMenuItem>
              )}
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </CardHeader>
      <CardContent className="pt-0 space-y-2 text-sm">
        <div className="flex items-center gap-2 text-zinc-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            fill="none"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <rect
              x="3"
              y="5"
              width="18"
              height="14"
              rx="1"
              stroke="#ffffff"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
            <path
              d="M20.62,5.22l-8,6.29a1,1,0,0,1-1.24,0l-8-6.29A1,1,0,0,1,4,5H20A1,1,0,0,1,20.62,5.22Z"
              stroke="#2ca9bc"
              strokeWidth="2"
              strokeLinecap="round"
              strokeLinejoin="round"
              fill="none"
            />
          </svg>
          <span className="truncate">{employee.email}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 1200 1200"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              fill="#ffffff"
              d="M1183.326,997.842l-169.187,167.83c-24.974,25.612-58.077,34.289-90.316,34.328c-142.571-4.271-277.333-74.304-387.981-146.215C354.22,921.655,187.574,757.82,82.984,559.832C42.87,476.809-4.198,370.878,0.299,278.209c0.401-34.86,9.795-69.073,34.346-91.543L203.831,17.565c35.132-29.883,69.107-19.551,91.589,15.257l136.111,258.102c14.326,30.577,6.108,63.339-15.266,85.188l-62.332,62.3c-3.848,5.271-6.298,11.271-6.36,17.801c23.902,92.522,96.313,177.799,160.281,236.486c63.967,58.688,132.725,138.198,221.977,157.021c11.032,3.077,24.545,4.158,32.438-3.179l72.51-73.743c24.996-18.945,61.086-28.205,87.771-12.714h1.272l245.51,144.943C1205.373,927.619,1209.131,971.279,1183.326,997.842L1183.326,997.842z"
            />
          </svg>
          <span>{employee.phone}</span>
        </div>
        <div className="flex items-center gap-2 text-zinc-400">
          <svg
            width="16"
            height="16"
            viewBox="0 0 24 24"
            xmlns="http://www.w3.org/2000/svg"
            className="flex-shrink-0"
          >
            <path
              fill="#ffffff"
              d="M12,14a1,1,0,1,0-1-1A1,1,0,0,0,12,14Zm5,0a1,1,0,1,0-1-1A1,1,0,0,0,17,14Zm-5,4a1,1,0,1,0-1-1A1,1,0,0,0,12,18Zm5,0a1,1,0,1,0-1-1A1,1,0,0,0,17,18ZM7,14a1,1,0,1,0-1-1A1,1,0,0,0,7,14ZM19,4H18V3a1,1,0,0,0-2,0V4H8V3A1,1,0,0,0,6,3V4H5A3,3,0,0,0,2,7V19a3,3,0,0,0,3,3H19a3,3,0,0,0,3-3V7A3,3,0,0,0,19,4Zm1,15a1,1,0,0,1-1,1H5a1,1,0,0,1-1-1V10H20ZM20,8H4V7A1,1,0,0,1,5,6H19a1,1,0,0,1,1,1ZM7,18a1,1,0,1,0-1-1A1,1,0,0,0,7,18Z"
            />
          </svg>
          <span>Vào: {formatDate(employee.hireDate)}</span>
        </div>
        <div className="pt-2 flex items-center justify-between">
          <Badge
            variant="outline"
            className={cn(
              "text-xs",
              employee.isActive
                ? "bg-emerald-500/10 text-emerald-400 border-emerald-500/20"
                : "bg-red-500/10 text-red-400 border-red-500/20"
            )}
          >
            {employee.isActive ? "Đang làm" : "Ngừng làm"}
          </Badge>
        </div>
        {/* Cinema Assignments for Staff */}
        {employee.roleType === "Staff" && (
          <EmployeeCinemaAssignments
            employeeId={employee.employeeId}
            isActive={employee.isActive}
          />
        )}
      </CardContent>
    </Card>
  );
}
