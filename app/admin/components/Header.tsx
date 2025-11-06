import { Shield, LogOut, Bell, Settings, Search, Menu, X } from "lucide-react";
import { motion } from "framer-motion";
import { Button } from "@/components/ui/button";
import { UserInfo } from "@/services/authService";

interface AdminHeaderProps {
  user: UserInfo | null;
  onLogout: () => void;
  isSidebarCollapsed: boolean;
  onToggleSidebar: () => void;
}

export const AdminHeader = ({
  user,
  onLogout,
  isSidebarCollapsed,
  onToggleSidebar,
}: AdminHeaderProps) => {
  return (
    <motion.header
      className="bg-white/10 backdrop-blur-xl border-b border-white/20 px-6 py-4 relative overflow-hidden"
      initial={{ opacity: 0, y: -20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5 }}
    >
      {/* Animated background gradient */}
      <motion.div
        className="absolute inset-0 bg-gradient-to-r from-purple-500/10 via-blue-500/10 to-purple-500/10"
        animate={{
          background: [
            "linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
            "linear-gradient(to right, rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1))",
            "linear-gradient(to right, rgba(147, 51, 234, 0.1), rgba(59, 130, 246, 0.1), rgba(147, 51, 234, 0.1))",
          ],
        }}
        transition={{ duration: 4, repeat: Infinity, ease: "easeInOut" }}
      />

      <div className="flex items-center justify-between relative z-10">
        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: -20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.1 }}
        >
          {/* Sidebar Toggle Button */}
          <motion.button
            onClick={onToggleSidebar}
            className="p-2 rounded-lg bg-white/10 hover:bg-white/20 transition-colors group"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            title={
              isSidebarCollapsed ? "Mở rộng thanh bên" : "Thu gọn thanh bên"
            }
          >
            <motion.div
              animate={{ rotate: isSidebarCollapsed ? 0 : 180 }}
              transition={{ duration: 0.3 }}
            >
              {isSidebarCollapsed ? (
                <Menu
                  size={20}
                  className="text-white group-hover:text-purple-200"
                />
              ) : (
                <X
                  size={20}
                  className="text-white group-hover:text-purple-200"
                />
              )}
            </motion.div>
          </motion.button>

          <motion.div
            className="relative"
            whileHover={{ scale: 1.1, rotate: 5 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <motion.div
              className="absolute inset-0 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur-lg opacity-50"
              animate={{
                scale: [1, 1.2, 1],
                opacity: [0.3, 0.6, 0.3],
              }}
              transition={{ duration: 2, repeat: Infinity }}
            />
            <Shield size={32} className="text-white relative z-10" />
          </motion.div>
          <div>
            <motion.h1
              className="text-2xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent font-heading"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              Bảng điều khiển quản trị
            </motion.h1>
            <motion.p
              className="text-gray-300 text-sm font-body"
              initial={{ opacity: 0 }}
              animate={{ opacity: 1 }}
              transition={{ duration: 0.5, delay: 0.3 }}
            >
              Quản lý hệ sinh thái rạp chiếu phim của bạn
            </motion.p>
          </div>
        </motion.div>

        {/* Center Search Bar */}
        <motion.div
          className="hidden md:flex items-center space-x-4 flex-1 max-w-md mx-8"
          initial={{ opacity: 0, y: -10 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ duration: 0.5, delay: 0.4 }}
        >
          <div className="relative flex-1">
            <Search
              size={18}
              className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400"
            />
            <motion.input
              type="text"
              placeholder="Tìm kiếm người dùng, phim, đặt vé..."
              className="w-full pl-10 pr-4 py-2 bg-white/10 border border-white/20 rounded-lg text-white placeholder-gray-400 focus:outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all font-body"
              whileFocus={{ scale: 1.02 }}
              transition={{ type: "spring", stiffness: 300 }}
            />
          </div>
        </motion.div>

        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >
          {/* Notification Bell */}
          <motion.button
            className="relative p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1 }}
            whileTap={{ scale: 0.95 }}
          >
            <Bell size={20} className="text-white" />
            <motion.div
              className="absolute -top-1 -right-1 w-3 h-3 bg-red-500 rounded-full"
              animate={{ scale: [1, 1.2, 1] }}
              transition={{ duration: 2, repeat: Infinity }}
            />
          </motion.button>

          {/* Settings */}
          <motion.button
            className="p-2 rounded-full bg-white/10 hover:bg-white/20 transition-colors"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.95 }}
            transition={{ type: "spring", stiffness: 400, damping: 10 }}
          >
            <Settings size={20} className="text-white" />
          </motion.button>

          {/* User Info */}
          <motion.div
            className="text-right"
            initial={{ opacity: 0, scale: 0.8 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ duration: 0.5, delay: 0.3 }}
          >
            <p className="font-medium text-white font-body">
              {user?.fullname || "Quản trị viên"}
            </p>
            <motion.span
              className="inline-block bg-gradient-to-r from-purple-500 to-blue-500 text-white text-xs px-3 py-1 rounded-full font-medium font-body"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ duration: 0.3, delay: 0.5, type: "spring" }}
            >
              {user?.role?.toUpperCase() || "ADMIN"}
            </motion.span>
          </motion.div>

          {/* Logout Button */}
          <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
            <Button
              onClick={onLogout}
              variant="outline"
              size="sm"
              className="text-white border-white/20 hover:bg-white/10 bg-white/5 backdrop-blur-sm transition-all duration-200"
            >
              <LogOut size={16} />
            </Button>
          </motion.div>
        </motion.div>
      </div>
    </motion.header>
  );
};
