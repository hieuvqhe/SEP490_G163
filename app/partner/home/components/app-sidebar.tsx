"use client";

import * as React from "react";
import { Bot, Newspaper, SquareTerminal, Tickets } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./team-switcher";
import { NavMain } from "./nav-main";
import { NavUser } from "./nav-user";
import { useAuthStore } from "@/store/authStore";
import { useGetUserInfo } from "@/hooks/useAuth";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  setActiveTab?: (tab: string) => void;
}

export function AppSidebar({ ...props }: AppSidebarProps) {
  const { user, accessToken, isLoading, isHydrated, clearAuth } =
    useAuthStore();

  React.useEffect(() => {
    if (isHydrated && !accessToken && !user && isLoading) {
      // If hydrated but no data and still loading, set loading to false
      clearAuth(); // This will set isLoading to false
    }
  }, [isHydrated, accessToken, user, isLoading, clearAuth]);

  const shouldFetchUserInfo = accessToken && !user && !isLoading;

  useGetUserInfo(shouldFetchUserInfo ? accessToken : null, {
    onSuccess: (data) => {
      console.log("User info fetched successfully:", data);
    },
    onError: (error) => {
      console.error("Failed to fetch user info:", error);
      // If fetching user info fails, clear the tokens as they might be invalid
      clearAuth();
    },
  });

  const data = {
    user: {
      name: user?.fullname ?? "Đối Tác",
      email: user?.email ?? "doitac@gmail.com",
      avatar: user?.avatarUrl ?? "/avatars/default-avatar.jpg",
    },
    navMain: [
      {
        title: "Rạp Chiếu",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: [
          {
            title: "Tổng quan Rạp",
            url: "cinema",
          },
          {
            title: "Phòng Chiếu",
            url: "screen",
          },
          {
            title: "Loại Ghế",
            url: "seat-type",
          },
          {
            title: "Sơ Đồ Rạp",
            url: "seating-chart",
          },
          {
            title: "Suất Chiếu",
            url: "showtimes",
          },
          {
            title: "Phim Chiếu",
            url: "movies",
          },
          {
            title: "Combo & Giá Vé",
            url: "combo",
          },
        ],
      },
      {
        title: "Quản Lý",
        url: "#",
        icon: Bot,
        items: [
          {
            title: "Nhân Viên",
            url: "employees",
          },
          {
            title: "Giao Dịch",
            url: "transactions",
          },
        ],
      },

      {
        title: "Hợp Đồng",
        url: "#",
        icon: Newspaper,
        items: [
          {
            title: "Hợp Đồng Mẫu",
            url: "sample-contracts",
          },
          {
            title: "Hợp Đồng Của Tôi",
            url: "my-contracts",
          },
          {
            title: "Đăng Tải Hợp Đồng",
            url: "contracts-upload",
          },
        ],
      },
    ],
  };

  return (
    <Sidebar
      className="border-zinc-700 border-r-2"
      collapsible="icon"
      {...props}
    >
      <SidebarHeader className="bg-zinc-800">
        <TeamSwitcher setActiveTab={props.setActiveTab} />
      </SidebarHeader>
      <SidebarContent className="bg-zinc-800">
        <NavMain setActiveTab={props.setActiveTab} items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter className="bg-zinc-800">
        <NavUser user={data.user} />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
