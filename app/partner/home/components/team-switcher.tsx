"use client";

import * as React from "react";
import { ChevronsUpDown, Plus } from "lucide-react";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import {
  SidebarMenu,
  SidebarMenuButton,
  SidebarMenuItem,
  useSidebar,
} from "@/components/ui/sidebar";
import { Pacifico } from "next/font/google";

export function TeamSwitcher({
  teams,
}: {
  teams: {
    name: string;
    logo: React.ElementType;
    plan: string;
  }[];
}) {
  const { isMobile } = useSidebar();
  const [activeTeam, setActiveTeam] = React.useState(teams[0]);

  if (!activeTeam) {
    return null;
  }

  return (
    <SidebarMenu>
      <SidebarMenuItem>
        <SidebarMenuButton
          size="lg"
          className="data-[state=open]:bg-zinc-700 hover:bg-zinc-700 
          hover:text-zinc-50 text-zinc-50 data-[state=open]:text-sidebar-accent-foreground"
        >
          <div className="bg-sidebar-primary text-sidebar-primary-foreground flex aspect-square size-8 items-center justify-center rounded-lg">
            <activeTeam.logo className="size-4" />
          </div>
          <div className="grid flex-1 text-left leading-tight">
            <span className={`truncate font-medium text-sm ${pacifico.className}`}>{activeTeam.name}</span>
            <span className="truncate text-xs text-zinc-200/60">{activeTeam.plan}</span>
          </div>
          <ChevronsUpDown className="ml-auto" />
        </SidebarMenuButton>
      </SidebarMenuItem>
    </SidebarMenu>
  );
}
