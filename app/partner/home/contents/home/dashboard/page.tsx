"use client";

import { SectionCards } from "../components/section-card";
import { StaffStatistics } from "../components/staff-statistics";
import { Tabs, TabsContent, TabsList, TabsTrigger } from "@/components/ui/tabs";
import { Building2, Users } from "lucide-react";

export default function Page() {
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
              <TabsContent value="cinema" className="mt-6">
                <SectionCards />
              </TabsContent>
              <TabsContent value="staff" className="mt-6">
                <StaffStatistics />
              </TabsContent>
            </Tabs>
          </div>
        </div>
      </div>
    </div>
  );
}
