"use client";

import { useState } from 'react';
import Header from './components/header';
import Sidebar from './components/sidebar';
import { ManagerDashboardStats } from './contents/Dashboard/components';

const ManagerPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Sidebar open={sidebarOpen} onClose={closeSidebar}>
      <Header onMenuClick={toggleSidebar} />
      <div className="min-h-screen bg-[#09090b] py-6 px-4 relative @container/main">

        <div className="relative z-10 max-w-7xl mx-auto mt-16">
          <div className="text-center mb-8">
            <h1 className="text-4xl font-bold  bg-clip-text text-transparent mb-2">
              Manager Dashboard
            </h1>
            <p className="text-gray-400 text-lg">Thống kê và quản lý toàn hệ thống</p>
          </div>

          {/* Statistics Dashboard */}
          <ManagerDashboardStats />
        </div>
      </div>
    </Sidebar>
  );
};

export default ManagerPage;