"use client";

import { useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import BookingManagementContent from "./components/BookingManagementContent";

const BookingManagementPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Sidebar open={sidebarOpen} onClose={closeSidebar}>
      <Header onMenuClick={toggleSidebar} />
      <div className="min-h-screen bg-[#09090b] py-6 px-4 relative overflow-hidden">
        {/* Background gradient overlay */}
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-yellow-900/10 to-red-900/20"></div>

        {/* Animated background elements */}
        <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10 max-w-7xl mx-auto mt-16">
          <div className="mb-6">
            <h1 className="text-3xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 bg-clip-text text-transparent mb-2">
              Quản Lý Doanh Thu
            </h1>
            <p className="text-gray-400">Xem và quản lý tất cả đơn hàng trong hệ thống</p>
          </div>

          <BookingManagementContent />
        </div>
      </div>
    </Sidebar>
  );
};

export default BookingManagementPage;
