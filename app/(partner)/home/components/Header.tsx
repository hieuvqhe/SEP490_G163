"use client";

import { Button } from "@/components/ui/button";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

const Header = () => {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await clearAuth();
  };

  return (
    <div>
      <motion.header
        className="bg-slate-800/80 backdrop-blur-lg border-b border-slate-700/50 px-6 py-4 fixed top-0 z-40 w-full"
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.6, type: "spring", stiffness: 100 }}
      >
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-4">
            <div className="flex items-center space-x-4">
              <div>
                <h1
                  className={`${pacifico.className} text-3xl font-bold text-white`}
                >
                  TicketXpress
                </h1>
                <p className="text-slate-400">Partner Management Dashboard</p>
              </div>
            </div>
          </div>

          <div className="flex items-center space-x-4">
            <motion.div
              className="text-right"
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <p className="font-medium text-white">
                {user?.username || "Staff User"}
              </p>
              <span className="inline-flex items-center px-2.5 py-0.5 rounded-full text-xs font-medium bg-gradient-to-r from-purple-500 to-cyan-500 text-white">
                {user?.username?.toUpperCase() || "STAFF"}
              </span>
            </motion.div>

            <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
              <Button
                onClick={handleLogout}
                variant="outline"
                size="sm"
                className="text-slate-300 border-slate-600/50 hover:bg-slate-700/50 hover:border-purple-500/30 transition-all duration-300"
              >
                <LogOut size={16} />
              </Button>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </div>
  );
};

export default Header;
