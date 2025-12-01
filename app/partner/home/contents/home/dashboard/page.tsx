"use client";

import { useCallback } from "react";
import { SectionCards } from "../components/section-card";
import { StaffStatistics } from "../components/staff-statistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users, Info } from "lucide-react";
import { Button } from "@/components/ui/button";
import { driver } from "driver.js";
import "driver.js/dist/driver.css";

export default function Page() {
  const handleCinemaGuide = useCallback(() => {
    const steps = [
      {
        element: "#cinema-tab-content",
        popover: {
          title: "Thống kê về rạp",
          description:
            "Tổng quan về doanh thu, đơn hàng, khách hàng và hiệu suất của tất cả các rạp trong hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-stats-overview",
        popover: {
          title: "Tổng quan chính",
          description:
            "Các chỉ số quan trọng nhất: Tổng doanh thu, đơn hàng, vé bán ra và số lượng khách hàng. Theo dõi xu hướng tăng/giảm so với kỳ trước.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-stats-charts",
        popover: {
          title: "Biểu đồ doanh thu",
          description:
            "Theo dõi xu hướng doanh thu theo ngày, xem doanh thu 7 ngày gần nhất và tỷ lệ doanh thu từ dịch vụ & combo.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-stats-top-list",
        popover: {
          title: "Xếp hạng Top",
          description:
            "Danh sách các rạp và phim có doanh thu cao nhất. Giúp bạn xác định những điểm mạnh trong hệ thống.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-stats-time",
        popover: {
          title: "Thống kê theo thời gian",
          description:
            "Doanh thu và đơn hàng theo các khoảng thời gian: Hôm nay, tuần này, tháng này. Theo dõi thanh toán và tỷ lệ lỗi.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-stats-customers",
        popover: {
          title: "Top khách hàng",
          description:
            "Bảng xếp hạng khách hàng theo doanh thu. Xem chi tiêu, số đơn và giá trị trung bình mỗi đơn hàng.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#cinema-stats-showtime",
        popover: {
          title: "Suất chiếu & ghế",
          description:
            "Thống kê về suất chiếu (tổng số, có/chưa có đặt vé) và phân tích theo loại ghế. Theo dõi hiệu suất sử dụng phòng chiếu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
    ];

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, []);

  const handleStaffGuide = useCallback(() => {
    const steps = [
      {
        element: "#staff-tab-content",
        popover: {
          title: "Thống kê về nhân viên",
          description:
            "Tổng quan về hiệu suất làm việc của nhân viên, doanh thu và đơn hàng do từng nhân viên xử lý.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#staff-stats-overview",
        popover: {
          title: "Tổng quan nhân viên",
          description:
            "Tổng số nhân viên, doanh thu, đơn hàng và doanh thu trung bình mỗi nhân viên. Theo dõi nhân viên đang hoạt động.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#staff-stats-best",
        popover: {
          title: "Nhân viên xuất sắc",
          description:
            "Nhân viên có hiệu suất cao nhất, phân bố theo vai trò và biểu đồ top 5 nhân viên theo doanh thu.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#staff-stats-ranking",
        popover: {
          title: "Bảng xếp hạng nhân viên",
          description:
            "Danh sách đầy đủ nhân viên được xếp hạng theo doanh thu. Xem thông tin chi tiết về từng nhân viên và rạp quản lý.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
      {
        element: "#staff-stats-details",
        popover: {
          title: "Chi tiết cá nhân",
          description:
            "Thẻ thông tin chi tiết cho từng nhân viên hàng đầu, bao gồm doanh thu, đơn hàng, vé bán và thông tin rạp.",
          side: "bottom" as const,
          align: "start" as const,
        },
      },
    ];

    driver({
      showProgress: true,
      allowClose: true,
      overlayOpacity: 0.65,
      nextBtnText: "Tiếp tục",
      prevBtnText: "Quay lại",
      doneBtnText: "Hoàn tất",
      steps,
    }).drive();
  }, []);

  return (
    <div className="flex flex-1 flex-col">
      <div className="@container/main flex flex-1 flex-col gap-2">
        <div className="flex flex-col gap-4 py-4 md:gap-6 md:py-6">
          <div className="px-4 lg:px-6">
            <Tabs defaultValue="cinema" className="w-full">
              <TabsList className="bg-zinc-800 border border-zinc-700 p-1 h-auto">
                <TabsTrigger
                  value="cinema"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-zinc-400 px-4 py-2 gap-2"
                >
                  <Building2 className="size-4" />
                  Thống kê về rạp
                </TabsTrigger>
                <TabsTrigger
                  value="staff"
                  className="data-[state=active]:bg-orange-500 data-[state=active]:text-white text-zinc-400 px-4 py-2 gap-2"
                >
                  <Users className="size-4" />
                  Thống kê về nhân viên
                </TabsTrigger>
              </TabsList>
              <TabsContent value="cinema" className="mt-6" id="cinema-tab-content">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-zinc-600 bg-zinc-700/70 text-zinc-100 hover:bg-zinc-700"
                    onClick={handleCinemaGuide}
                  >
                    <Info className="mr-1 size-4" /> Hướng dẫn
                  </Button>
                </div>
                <SectionCards />
              </TabsContent>
              <TabsContent value="staff" className="mt-6" id="staff-tab-content">
                <div className="flex justify-end mb-4">
                  <Button
                    variant="outline"
                    size="sm"
                    className="border border-zinc-600 bg-zinc-700/70 text-zinc-100 hover:bg-zinc-700"
                    onClick={handleStaffGuide}
                  >
                    <Info className="mr-1 size-4" /> Hướng dẫn
                  </Button>
                </div>
                <StaffStatistics />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
