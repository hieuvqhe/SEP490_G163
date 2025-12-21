"use client";

import { useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { ManageMovie } from "../contents";

const ManagerMovieManagementPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((previous) => !previous);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Sidebar open={sidebarOpen} onClose={closeSidebar}>
      <Header onMenuClick={toggleSidebar} />
      <div className="relative min-h-screen bg-[#09090b] py-12 pt-20 px-4">
        <div
          className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-yellow-900/10 to-red-900/20"
          aria-hidden
        />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 bg-clip-text text-4xl font-bold text-transparent">
              Quản Lý Submission Phim
            </h1>
            <p className="text-lg text-gray-400">Theo dõi và duyệt các submission phim từ đối tác.</p>
          </div>

          <ManageMovie />
        </div>
      </div>
    </Sidebar>
  );
};

export default ManagerMovieManagementPage;
