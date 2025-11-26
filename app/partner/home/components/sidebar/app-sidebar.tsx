"use client";

import * as React from "react";
import { Bot, LucideIcon, Newspaper, SquareTerminal } from "lucide-react";

import {
  Sidebar,
  SidebarContent,
  SidebarFooter,
  SidebarHeader,
  SidebarRail,
} from "@/components/ui/sidebar";
import { TeamSwitcher } from "./components/team-switcher";
import { NavMain } from "./components/nav-main";
import { NavUser } from "./components/nav-user";
import { usePartnerHomeStore } from "@/store/partnerHomeStore";
import { useAuthStore } from "@/store/authStore";
import { useGetUserInfo } from "@/hooks/useAuth";

export interface AppSidebarProps extends React.ComponentProps<typeof Sidebar> {
  setActiveTab?: (tab: string) => void;
}

export function AppSidebar({
  setActiveTab: legacySetActiveTab,
  ...rest
}: AppSidebarProps) {
  const { user, accessToken, isLoading, isHydrated, clearAuth, logout } =
    useAuthStore();
  const setStoreActiveTab = usePartnerHomeStore((state) => state.setActiveTab);

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

  interface UserInfo {
    fullname: string;
    email: string;
    image?: string;
  }

  interface NavItem {
    title: string;
    url: string;
    icon?: LucideIcon;
    isActive?: boolean;
    items?: NavItem[];
  }

  interface UserNavigation {
    user: UserInfo | null;
    navMain: NavItem[];
  }

  const baseNavMain: NavItem[] = [
    {
      title: "Rạp Chiếu",
      url: "#",
      icon: SquareTerminal,
      isActive: true,
      items: [
        { title: "Tổng quan Rạp", url: "cinema" },
        { title: "Phòng Chiếu", url: "screen" },
        { title: "Loại Ghế", url: "seat-type" },
        { title: "Sơ Đồ Rạp", url: "seating-chart" },
        { title: "Suất Chiếu", url: "showtimes" },
        { title: "Phim Chiếu", url: "movies" },
        { title: "Combo", url: "combo" },
      ],
    },
    {
      title: "Quản Lý",
      url: "#",
      icon: Bot,
      items: [
        { title: "Nhân Viên", url: "employees" },
        { title: "Giao Dịch", url: "transactions" },
      ],
    },
    {
      title: "Hợp Đồng",
      url: "#",
      icon: Newspaper,
      items: [
        { title: "Hợp Đồng Của Tôi", url: "contract-list" },
        { title: "Đăng Tải Hợp Đồng", url: "contracts-upload" },
      ],
    },
  ];

  const data: UserNavigation = {
    user: user,
    navMain: [],
  };

  switch (user?.role) {
    case "Partner":
      data.navMain = baseNavMain;
      break;

    case "Staff":
      data.navMain = [
        {
          title: "Rạp Chiếu",
          url: "#",
          icon: SquareTerminal,
          isActive: true,
          items: [
            { title: "Tổng quan Rạp", url: "cinema" },
            { title: "Phòng Chiếu", url: "screen" },
            { title: "Loại Ghế", url: "seat-type" },
            { title: "Sơ Đồ Rạp", url: "seating-chart" },
            { title: "Suất Chiếu", url: "showtimes" },
            { title: "Phim Chiếu", url: "movies" },
            { title: "Combo", url: "combo" },
          ],
        },
      ];
      break;

    case "Cashier":
      data.navMain = [
        {
          title: "Giao Dịch",
          url: "#",
          icon: Bot,
          items: [
            { title: "Bán Vé", url: "sell-tickets" },
            { title: "Lịch Sử Thanh Toán", url: "payments" },
          ],
        },
      ];
      break;

    case "Marketing":
      data.navMain = [
        {
          title: "Marketing",
          url: "#",
          icon: SquareTerminal,
          items: [
            { title: "Chiến Dịch", url: "campaigns" },
            { title: "Mã Giảm Giá", url: "vouchers" },
          ],
        },
      ];
      break;

    default:
      data.navMain = [];
  }

  const handleSetActiveTab = (tab: string) => {
    legacySetActiveTab?.(tab);
    setStoreActiveTab(tab);
  };

  return (
    <Sidebar
      className="border-zinc-700 border-r-2"
      collapsible="icon"
      {...rest}
    >
      <SidebarHeader className="bg-zinc-800">
        <TeamSwitcher setActiveTab={handleSetActiveTab} />
      </SidebarHeader>
      <SidebarContent className="bg-zinc-800">
        <NavMain setActiveTab={handleSetActiveTab} items={data.navMain} />
        {/* <NavProjects projects={data.projects} /> */}
      </SidebarContent>
      <SidebarFooter className="bg-zinc-800">
        <NavUser
          user={
            data.user
              ? {
                  name: data.user.fullname,
                  email: data.user.email,
                  avatar: data.user.image ?? "",
                }
              : null
          }
          logout={logout}
        />
      </SidebarFooter>
      <SidebarRail />
    </Sidebar>
  );
}
