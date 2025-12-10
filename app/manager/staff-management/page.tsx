"use client";

import { useState } from 'react';
import Header from '../components/header';
import Sidebar from '../components/sidebar';
import StaffManagement from "../contents/StaffManagement/StaffManagement";

export default function StaffManagementPage() {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((s) => !s);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Sidebar open={sidebarOpen} onClose={closeSidebar}>
      <Header onMenuClick={toggleSidebar} />
      <div className="min-h-screen bg-[#09090b] py-12 px-4 relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-indigo-900/20 via-purple-900/10 to-blue-900/20"></div>
        <div className="absolute top-20 left-10 w-72 h-72 bg-indigo-500/10 rounded-full blur-3xl animate-pulse"></div>
        <div className="absolute bottom-20 right-10 w-96 h-96 bg-purple-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

        <div className="relative z-10">
          <StaffManagement />
        </div>
      </div>
    </Sidebar>
  );
}
