import { motion, AnimatePresence } from "framer-motion";
import { Users, Film, BarChart3, Settings, ChevronRight, Activity } from "lucide-react";
import { useGetUsers } from "@/apis/admin.api";

interface AdminSidebarProps {
  activeTab: string;
  onTabChange: (tab: string) => void;
  isCollapsed: boolean;
  accessToken?: string;
}

export const AdminSidebar = ({
  activeTab,
  onTabChange,
  isCollapsed,
  accessToken,
}: AdminSidebarProps) => {
  // Get total users count for display
  const { data: usersData, isLoading } = useGetUsers({ limit: 1 }, accessToken);

  const menuItems = [
    {
      id: "users",
      label: "Quản lý người dùng",
      icon: Users,
      count: isLoading ? "..." : usersData?.result?.total || 0,
      color: "from-emerald-500 to-teal-500",
    },
    {
      id: "audit-logs",
      label: "Nhật ký hoạt động",
      icon: Activity,
      color: "from-amber-500 to-orange-500",
    },
  ];

  const bottomMenuItems = [
    {
      id: "settings",
      label: "Cài đặt",
      icon: Settings,
      color: "from-gray-500 to-slate-500",
    },
  ];

  // Animation variants
  const sidebarVariants = {
    expanded: {
      width: 280,
      transition: {
        duration: 0.3,
      },
    },
    collapsed: {
      width: 80,
      transition: {
        duration: 0.3,
      },
    },
  };

  const contentVariants = {
    expanded: {
      opacity: 1,
      x: 0,
      transition: {
        delay: 0.1,
        duration: 0.2,
      },
    },
    collapsed: {
      opacity: 0,
      x: -20,
      transition: {
        duration: 0.1,
      },
    },
  };

  const itemVariants = {
    hidden: { opacity: 0, x: -20 },
    visible: (i: number) => ({
      opacity: 1,
      x: 0,
      transition: {
        delay: i * 0.05,
        duration: 0.3,
      },
    }),
  };

  return (
    <motion.div
      className="relative bg-slate-900/95 backdrop-blur-xl border-r border-slate-700/50 shadow-2xl flex flex-col"
      variants={sidebarVariants}
      animate={isCollapsed ? "collapsed" : "expanded"}
      initial="expanded"
    >
      {/* Background Gradient */}
      <div className="absolute inset-0 bg-gradient-to-b from-slate-800/50 via-purple-900/20 to-slate-900/50" />

      {/* Logo Section */}
      <motion.div className="relative p-6 border-b border-slate-700/50">
        <div className="flex items-center gap-3">
          <motion.div
            className="w-10 h-10 bg-gradient-to-r from-purple-500 to-cyan-500 rounded-xl flex items-center justify-center shadow-lg"
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
          >
            <Film size={24} className="text-white" />
          </motion.div>

          <AnimatePresence>
            {!isCollapsed && (
              <motion.div
                variants={contentVariants}
                initial="collapsed"
                animate="expanded"
                exit="collapsed"
              >
                <h1 className="text-xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-heading">
                  Quản trị viên rạp chiếu
                </h1>
                <p className="text-xs text-gray-400 font-body">
                  Bảng điều khiển quản lý
                </p>
              </motion.div>
            )}
          </AnimatePresence>
        </div>
      </motion.div>

      {/* Navigation Menu */}
      <div className="flex-1 py-4 px-3 overflow-y-auto">
        <motion.nav className="space-y-2" initial="hidden" animate="visible">
          {menuItems.map((item, index) => {
            const Icon = item.icon;
            const isActive = activeTab === item.id;

            return (
              <motion.button
                key={item.id}
                custom={index}
                variants={itemVariants}
                onClick={() => onTabChange(item.id)}
                className={`
                  group relative w-full flex items-center gap-3 px-4 py-3 rounded-xl 
                  transition-all duration-300 text-left
                  ${
                    isActive
                      ? "bg-gradient-to-r from-purple-500/20 to-cyan-500/20 border border-purple-500/30 shadow-lg"
                      : "hover:bg-slate-800/50 hover:border-slate-600/50 border border-transparent"
                  }
                `}
                whileHover={{ scale: 1.02, x: 4 }}
                whileTap={{ scale: 0.98 }}
              >
                {/* Active Indicator */}
                {isActive && (
                  <motion.div
                    className="absolute left-0 top-1/2 -translate-y-1/2 w-1 h-8 bg-gradient-to-b from-purple-500 to-cyan-500 rounded-r-full"
                    layoutId="activeIndicator"
                    transition={{ type: "spring", stiffness: 400, damping: 30 }}
                  />
                )}

                {/* Icon */}
                <div
                  className={`
                  relative z-10 p-2 rounded-lg transition-all duration-300
                  ${
                    isActive
                      ? `bg-gradient-to-r ${item.color} shadow-lg`
                      : "bg-slate-800/50 group-hover:bg-slate-700/50"
                  }
                `}
                >
                  <Icon
                    size={20}
                    className={`
                      transition-colors duration-300
                      ${
                        isActive
                          ? "text-white"
                          : "text-gray-400 group-hover:text-gray-300"
                      }
                    `}
                  />
                </div>

                {/* Label and Count */}
                <AnimatePresence>
                  {!isCollapsed && (
                    <motion.div
                      className="flex-1 flex items-center justify-between"
                      variants={contentVariants}
                      initial="collapsed"
                      animate="expanded"
                      exit="collapsed"
                    >
                      <span
                        className={`
                        font-medium transition-colors duration-300
                        ${
                          isActive
                            ? "text-white"
                            : "text-gray-300 group-hover:text-white"
                        }
                      `}
                      >
                        {item.label}
                      </span>

                      {item.count && (
                        <motion.span
                          className={`
                            px-2 py-1 text-xs rounded-full font-medium transition-all duration-300
                            ${
                              isActive
                                ? "bg-white/20 text-white"
                                : "bg-slate-700/50 text-gray-400 group-hover:bg-slate-600/50 group-hover:text-gray-300"
                            }
                          `}
                          whileHover={{ scale: 1.05 }}
                        >
                          {item.count.toLocaleString()}
                        </motion.span>
                      )}

                      {/* Arrow indicator */}
                      <ChevronRight
                        size={16}
                        className={`
                          transition-all duration-300 ml-2
                          ${
                            isActive
                              ? "text-white opacity-100"
                              : "text-gray-500 opacity-0 group-hover:opacity-100 group-hover:text-gray-300"
                          }
                        `}
                      />
                    </motion.div>
                  )}
                </AnimatePresence>
              </motion.button>
            );
          })}
        </motion.nav>
      </div>

    </motion.div>
  );
};
