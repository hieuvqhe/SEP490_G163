"use client"

import { motion, AnimatePresence } from "framer-motion";
import { useState } from "react";
import type { Dispatch, SetStateAction } from "react";
import {
  Building2,
  Calendar,
  BarChart3,
  Settings,
  Film,
  Clock,
  FileText,
  MonitorPlay
} from "lucide-react";

interface SidebarProps {
  activeTab: string
  setActiveTab: Dispatch<SetStateAction<string>>
}

const Sidebar = ({ activeTab, setActiveTab }: SidebarProps) => {
  const [sidebarCollapsed] = useState<boolean>(false);
  const menuItems = [
    { id: "overview", label: "Overview", icon: BarChart3 },
    { id: "theaters", label: "Theater", icon: Building2 },
    { id: "movies", label: "Movies", icon: Film },
    { id: "showtimes", label: "Showtimes", icon: Clock },
    { id: "bookings", label: "Bookings", icon: Calendar },
    { id: "contract", label: "My Contract", icon: FileText },
    { id: "screen", label: "Screen", icon: MonitorPlay },
    { id: "settings", label: "Settings", icon: Settings },
  ];
  return (
    <div>
      <AnimatePresence>
        <motion.aside
          className="bg-slate-800/60 backdrop-blur-sm h-screen border-r border-slate-700/50 pt-3"
          initial={{ x: -300 }}
          animate={{
            x: 0,
            width: sidebarCollapsed ? 80 : 256,
          }}
          transition={{ duration: 0.3, type: "spring", stiffness: 100 }}
        >
          <nav className="p-4">
            <ul className="space-y-2">
              {menuItems.map((item, index) => (
                <motion.li
                  key={item.id}
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  transition={{ duration: 0.3, delay: index * 0.05 }}
                >
                  <motion.button
                    onClick={() => setActiveTab(item.id)}
                    className={`w-full flex items-center space-x-3 px-4 py-3 rounded-xl text-left transition-all duration-300 group ${
                      activeTab === item.id
                        ? "bg-gradient-to-r from-orange-500 to-amber-500 text-white shadow-lg shadow-orange-500/25"
                        : "text-slate-300 hover:bg-slate-700/50 hover:text-white border border-transparent hover:border-orange-500/20"
                    }`}
                    whileHover={{ scale: 1.02, x: 4 }}
                    whileTap={{ scale: 0.98 }}
                  >
                    <div
                      className={`${
                        activeTab === item.id
                          ? "text-white"
                          : "text-slate-400 group-hover:text-orange-400"
                      } transition-colors duration-300`}
                    >
                      <item.icon size={20} />
                    </div>

                    <AnimatePresence>
                      {!sidebarCollapsed && (
                        <motion.span
                          initial={{ opacity: 0, width: 0 }}
                          animate={{ opacity: 1, width: "auto" }}
                          exit={{ opacity: 0, width: 0 }}
                          transition={{ duration: 0.2 }}
                          className="font-medium"
                        >
                          {item.label}
                        </motion.span>
                      )}
                    </AnimatePresence>
                  </motion.button>
                </motion.li>
              ))}
            </ul>
          </nav>
        </motion.aside>
      </AnimatePresence>
    </div>
  );
};

export default Sidebar;
