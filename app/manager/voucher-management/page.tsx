"use client";

import { useState } from "react";
import Header from "../components/header";
import Sidebar from "../components/sidebar";
import { VoucherManagement } from "../contents";

const ManagerVoucherManagementPage = () => {
  const [sidebarOpen, setSidebarOpen] = useState(false);

  const toggleSidebar = () => setSidebarOpen((previous) => !previous);
  const closeSidebar = () => setSidebarOpen(false);

  return (
    <Sidebar open={sidebarOpen} onClose={closeSidebar}>
      <Header onMenuClick={toggleSidebar} />
      <div className="relative min-h-screen bg-[#09090b] pt-20 py-12 px-4">
        <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-yellow-900/10 to-red-900/20" aria-hidden />

        <div className="relative z-10 mx-auto max-w-7xl">
          <div className="mb-8">
            <h1 className="mb-2 text-4xl font-bold text-transparent bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 bg-clip-text">
              Quản Lý Voucher
            </h1>
            <p className="text-lg text-gray-400">Theo dõi, tạo mới và gửi voucher cho người dùng.</p>
          </div>

          <VoucherManagement />
        </div>
      </div>
    </Sidebar>
  );
};

export default ManagerVoucherManagementPage;
