"use client";

import * as React from "react";
import { Bot, LucideIcon, Newspaper, SquareTerminal, Ticket } from "lucide-react";

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
import { useGetStaffProfile, hasAnyPermission, GrantedPermission } from "@/apis/staff.api";

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
    
    },
    onError: () => {
      // If fetching user info fails, clear the tokens as they might be invalid
      clearAuth();
    },
  });

  // Lấy thông tin staff profile (chỉ khi user là Staff - case insensitive)
  const isStaffRole = user?.role?.toLowerCase() === "staff";
  const { data: staffProfileData, isLoading: isLoadingStaffProfile } = useGetStaffProfile(
    isStaffRole && accessToken ? accessToken : undefined
  );
  const staffPermissions = React.useMemo(() => {
    return staffProfileData?.result?.grantedPermissions ?? [];
  }, [staffProfileData]);

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

  // Mapping giữa permission codes và menu items
  const PERMISSION_MENU_MAPPING: Record<string, { title: string; url: string }> = {
    // Cinema permissions
    'CINEMA_READ': { title: "Tổng quan Rạp", url: "cinema" },
    // Screen permissions  
    'SCREEN_READ': { title: "Phòng Chiếu", url: "screen" },
    // Seat type permissions
    'SEAT_TYPE_READ': { title: "Loại Ghế", url: "seat-type" },
    // Seat layout permissions
    'SEAT_LAYOUT_READ': { title: "Sơ Đồ Rạp", url: "seating-chart" },
    // Showtime permissions
    'SHOWTIME_READ': { title: "Suất Chiếu", url: "showtimes" },
    // Service/Combo permissions
    'SERVICE_READ': { title: "Combo", url: "combo" },
    // Booking permissions
    'BOOKING_READ': { title: "Đơn Đặt Vé", url: "bookings" },
    'BOOKING_STATISTICS': { title: "Thống Kê Booking", url: "booking-stats" },
  };

  /**
   * Generate menu items cho Staff dựa trên permissions
   */
  const generateStaffMenu = (permissions: GrantedPermission[]): NavItem[] => {
    if (!permissions || permissions.length === 0) {
      return [];
    }

    const cinemaItems: NavItem[] = [];
    const bookingItems: NavItem[] = [];

    // Duyệt qua mapping và check permission
    Object.entries(PERMISSION_MENU_MAPPING).forEach(([permissionCode, menuInfo]) => {
      if (hasAnyPermission(permissions, permissionCode)) {
        const menuItem = { title: menuInfo.title, url: menuInfo.url };
        
        // Phân loại menu items theo nhóm
        if (permissionCode.startsWith('BOOKING')) {
          bookingItems.push(menuItem);
        } else {
          cinemaItems.push(menuItem);
        }
      }
    });

    const navItems: NavItem[] = [];

    // Thêm nhóm Rạp Chiếu nếu có items
    if (cinemaItems.length > 0) {
      navItems.push({
        title: "Rạp Chiếu",
        url: "#",
        icon: SquareTerminal,
        isActive: true,
        items: cinemaItems,
      });
    }

    // Thêm nhóm Booking nếu có items
    if (bookingItems.length > 0) {
      navItems.push({
        title: "Đơn Đặt Vé",
        url: "#",
        icon: Ticket,
        items: bookingItems,
      });
    }

    return navItems;
  };

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

  // Tính toán menu cho Staff
  const getStaffNavItems = (): NavItem[] => {
    if (!staffPermissions || staffPermissions.length === 0) {
      return [];
    }
    return generateStaffMenu(staffPermissions);
  };

  // Normalize role to handle case variations
  const normalizedRole = user?.role?.toLowerCase();

  switch (normalizedRole) {
    case "partner":
      data.navMain = baseNavMain;
      break;

    case "staff":
      // Generate menu động dựa trên permissions của staff
      // Nếu đang loading hoặc chưa có permissions, hiển thị menu loading
      if (isLoadingStaffProfile) {
        data.navMain = [
          {
            title: "Đang tải...",
            url: "#",
            icon: SquareTerminal,
            isActive: false,
            items: [],
          },
        ];
      } else {
        data.navMain = getStaffNavItems();
      }
      break;

    case "cashier":
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

    case "marketing":
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
