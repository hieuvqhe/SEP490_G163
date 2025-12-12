"use client";

import * as React from "react";
import { ChevronsUpDown, Tickets } from "lucide-react";
import { useAuthStore } from "@/store/authStore";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
} from "@/components/ui/sidebar";
import { Pacifico } from "next/font/google";

export interface Team {
  setActiveTab?: (tab: string) => void;
}

export function TeamSwitcher({ ...props }: Team) {
  const { user } = useAuthStore();
  
  // Get role display name
  const getRoleDisplay = (role: string | undefined) => {
    const roleLower = role?.toLowerCase();
    switch (roleLower) {
      case "partner":
        return "Đối Tác";
      case "staff":
        return "Nhân Viên";
      default:
        return role || "Người Dùng";
    }
  };

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-zinc-700 hover:bg-zinc-700 
          hover:text-zinc-50 text-zinc-50 data-[state=open]:text-sidebar-accent-foreground"
          onClick={() => props.setActiveTab?("home"): undefined}
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <Tickets className="size-4" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span
              className={`truncate font-medium text-sm ${pacifico.className}`}
            >
              {"TicketXpress"}
            </span>
            <span className="truncate text-xs text-zinc-200/60">
              {user?.fullname || "Quản Lý"} • {getRoleDisplay(user?.role)}
            </span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
