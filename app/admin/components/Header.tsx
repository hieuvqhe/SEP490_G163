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

        <motion.div
          className="flex items-center space-x-4"
          initial={{ opacity: 0, x: 20 }}
          animate={{ opacity: 1, x: 0 }}
          transition={{ duration: 0.5, delay: 0.2 }}
        >

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
