"use client";

import React from "react";
import dynamic from "next/dynamic";
import { motion } from "framer-motion";
import {
  SidebarInset,
  SidebarProvider,
  SidebarTrigger,
} from "@/components/ui/sidebar";
import { AppSidebar } from "./components/sidebar/app-sidebar";
import { Separator } from "@radix-ui/react-separator";
import {
  Breadcrumb,
  BreadcrumbItem,
  BreadcrumbLink,
  BreadcrumbList,
  BreadcrumbPage,
  BreadcrumbSeparator,
} from "@/components/ui/breadcrumb";
import Page from "./contents/home/dashboard/page";
import SeatLayout from "./contents/seat/SeatLayout";
import { usePartnerHomeStore } from "@/store/partnerHomeStore";
import ManageMovies from "./contents/movies/ManageMovies";
import CinemaInfo from "./contents/cinema/CinemaInfo/CinemaInfo";
import ScreenManagement from "./contents/cinema/ScreenManagement/ScreenManagement";
import ShowtimeManagement from "./contents/cinema/ShowtimeManagement/ShowtimeManagement";
import SeatTypeManagement from "./contents/cinema/SeatTypeManagement/SeatTypeManagement";
import ContractList from "./contents/contract/ContractList";
// import ContractUpload from "./contents/contract/ContractUpload";


const PartnerHomepage = () => {
  const activeTab = usePartnerHomeStore((state) => state.activeTab);
  const setActiveTab = usePartnerHomeStore((state) => state.setActiveTab);

  const renderContent = () => {
    switch (activeTab) {
      case "home":
        return <Page />;

      // case "theaters":
      //   return <TheaterInfo />;

      case "cinema":
        return <CinemaInfo />;

      case "screen":
        return <ScreenManagement />;

      case "showtimes":
        return <ShowtimeManagement />;

      case "seat-type":
        return <SeatTypeManagement />;

      case "seating-chart":
        return <SeatLayout />;

      case "movies":
        return <ManageMovies />;

      case "contract-list":
        return <ContractList />;
      // case "showtimes":
      //   return <Showtimes />;

      // case "bookings":
      //   return <Bookings />;

      case "contracts-upload":
        // return <ContractUpload />;

      //   case "screen":
      //     return <Screen />;

      default:
        return (
          <motion.div
            className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
            initial={{ opacity: 0, scale: 0.95 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5 }}
          >
            <p className="text-slate-400 text-lg">
              This section is under development.
            </p>
            <div className="mt-6">
              <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
                <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
                <span className="text-orange-300 text-sm font-medium">
                  Coming Soon
                </span>
              </div>
            </div>
          </motion.div>
        );
    }
  };

  return (
    <SidebarProvider>
      <AppSidebar setActiveTab={setActiveTab} />
      <SidebarInset>
        <header className="flex h-16 shrink-0 items-center gap-2 transition-[width,height] ease-linear group-has-data-[collapsible=icon]/sidebar-wrapper:h-12">
          <div className="flex items-center gap-2 px-4">
            <SidebarTrigger className="-ml-1" />
            <Separator
              orientation="vertical"
              className="mr-2 data-[orientation=vertical]:h-4"
            />
            <Breadcrumb>
              <BreadcrumbList>
                <BreadcrumbItem className="hidden md:block">
                  <BreadcrumbLink
                    className=" text-zinc-200 hover:text-zinc-200/80 transition-colors duration-200"
                    href="#"
                  >
                    Building Your Application
                  </BreadcrumbLink>
                </BreadcrumbItem>
                <BreadcrumbSeparator className="hidden md:block" />
                <BreadcrumbItem>
                  <BreadcrumbPage>Data Fetching</BreadcrumbPage>
                </BreadcrumbItem>
              </BreadcrumbList>
            </Breadcrumb>
          </div>
        </header>
        <div className="flex flex-1 flex-col gap-4 p-4 pt-0">
          {renderContent()}
        </div>
      </SidebarInset>
    </SidebarProvider>
  );
};

export default PartnerHomepage;
