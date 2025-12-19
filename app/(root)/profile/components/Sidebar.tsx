"use client";

import { useAuthStore } from "@/store/authStore";
import {
  CreditCard,
  Heart,
  LogOut,
  Ticket,
  User,
  Menu,
  X,
  Award,
} from "lucide-react";
import { Dispatch, SetStateAction, useState } from "react";

interface SidebarProps {
  activeSection: string;
  setActiveSection: Dispatch<SetStateAction<string>>;
}

const Sidebar = ({ activeSection, setActiveSection }: SidebarProps) => {
  const [openMobile, setOpenMobile] = useState(false);
  const {user} = useAuthStore();

  const menuItems = [
    { id: "profile", label: "Thông tin cá nhân", icon: User },
    { id: "tickets", label: "Vé đã mua", icon: Ticket },
    { id: "orders", label: "Lịch sử giao dịch", icon: CreditCard },
    // { id: "favorites", label: "Hạng thành viên", icon: Award },
  ];

  const renderMenu = (
    <ul className="space-y-1">
      {menuItems.map((item) => {
        const Icon = item.icon;
        return (
          <li key={item.id}>
            <button
              onClick={() => {
                setActiveSection(item.id);
                setOpenMobile(false);
              }}
              className={`
              w-full flex items-center space-x-3 px-4 py-3 rounded-lg 
              transition-colors
              ${
                activeSection === item.id
                  ? "bg-white/10 text-white"
                  : "text-zinc-300 hover:bg-white/5"
              }
            `}
            >
              <Icon className="w-5 h-5" />
              <span className="font-medium">{item.label}</span>
            </button>
          </li>
        );
      })}
    </ul>
  );

  return (
    <>
      {/* MOBILE HEADER */}
      <div className="md:hidden flex items-center justify-between px-4 py-3 bg-white shadow-sm border rounded-lg">
        <h2 className="font-semibold text-lg">Tài khoản</h2>
        <button onClick={() => setOpenMobile(!openMobile)}>
          {openMobile ? (
            <X className="w-6 h-6" />
          ) : (
            <Menu className="w-6 h-6" />
          )}
        </button>
      </div>

      {/* MOBILE DROPDOWN */}
      {openMobile && (
        <div className="md:hidden bg-white border rounded-lg shadow-sm mt-2 p-4 animate-fadeIn">
          {/* User */}
          <div className="flex items-center space-x-4 pb-4 border-b">
            <div className="w-14 h-14 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-lg font-bold">
              ND
            </div>
            <div>
              <h3 className="font-semibold text-gray-900">{user?.username}</h3>
              <p className="text-sm text-gray-500">{user?.email}</p>
            </div>
          </div>

          <nav className="mt-4">{renderMenu}</nav>

          <div className="pt-4 border-t">
            <button className="w-full flex items-center space-x-3 px-4 py-3 rounded-lg text-red-600 hover:bg-red-50 transition-colors">
              <LogOut className="w-5 h-5" />
              <span className="font-medium">Đăng xuất</span>
            </button>
          </div>
        </div>
      )}

      {/* DESKTOP SIDEBAR */}
      <div
        className="hidden md:flex 
    bg-white/5 backdrop-blur-xl 
    border border-white/10 
    rounded-lg shadow-2xl w-[25%]
    h-full flex-col justify-between"
      >
        {/* User */}
        <div className="p-6 border-b border-white/10">
          <div className="flex items-center space-x-4">
            <div className="w-16 h-16 bg-gradient-to-br from-blue-500 to-purple-600 rounded-full flex items-center justify-center text-white text-xl font-bold">
              ND
            </div>
            <div>
              <h3 className="font-semibold text-white">{user?.fullname}</h3>
              <p className="text-sm text-zinc-400">{user?.email}</p>
            </div>
          </div>
        </div>

        <nav className="p-4 flex-1">{renderMenu}</nav>

        <div className="border-t border-white/10">
          <button
            className="
        w-full flex items-center justify-center space-x-3 
        px-4 py-3 rounded-lg 
        text-red-400 
        hover:bg-red-500/10 
        transition-colors
      "
          >
            <LogOut className="w-5 h-5" />
            <span className="font-medium">Đăng xuất</span>
          </button>
        </div>
      </div>
    </>
  );
};

export default Sidebar;
