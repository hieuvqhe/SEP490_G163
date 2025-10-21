"use client";

import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { Button } from "@/components/ui/button";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuGroup,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuPortal,
  DropdownMenuSeparator,
  DropdownMenuShortcut,
  DropdownMenuSub,
  DropdownMenuSubContent,
  DropdownMenuSubTrigger,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/authStore";
import { motion } from "framer-motion";
import { LogOut } from "lucide-react";
import { Pacifico } from "next/font/google";
import { FaAngleDown } from "react-icons/fa";
import { GoSignOut } from "react-icons/go";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

const Header = () => {
  const { user, clearAuth } = useAuthStore();

  const handleLogout = async () => {
    await clearAuth();
  };

  // <motion.div whileHover={{ scale: 1.05 }} whileTap={{ scale: 0.95 }}>
  //   <Button
  //     onClick={handleLogout}
  //     variant="outline"
  //     size="sm"
  //     className="text-slate-300 border-slate-600/50 hover:bg-slate-700/50 hover:border-purple-500/30 transition-all duration-300"
  //   >
  //     <LogOut size={16} />
  //   </Button>
  // </motion.div>;


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
              initial={{ opacity: 0, x: 20 }}
              animate={{ opacity: 1, x: 0 }}
              transition={{ duration: 0.5, delay: 0.2 }}
            >
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <div className="flex items-center gap-3 cursor-pointer">
                    <Avatar className="size-10 border border-white/30">
                      <AvatarImage src={user?.avatarUrl || "/logo.png"} />
                      <AvatarFallback>{user?.fullname}</AvatarFallback>
                    </Avatar>

                    <FaAngleDown />
                  </div>
                </DropdownMenuTrigger>
                <DropdownMenuContent className="w-56 bg-slate-700 text-white border border-slate-500" align="start">
                  <DropdownMenuLabel>My Account</DropdownMenuLabel>
                  <DropdownMenuGroup>
                    <DropdownMenuItem>
                      Profile
                      <DropdownMenuShortcut>⇧⌘P</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Billing
                      <DropdownMenuShortcut>⌘B</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Settings
                      <DropdownMenuShortcut>⌘S</DropdownMenuShortcut>
                    </DropdownMenuItem>
                    <DropdownMenuItem>
                      Keyboard shortcuts
                      <DropdownMenuShortcut>⌘K</DropdownMenuShortcut>
                    </DropdownMenuItem>
                  </DropdownMenuGroup>
                  <DropdownMenuSeparator />
                  <DropdownMenuItem onClick={handleLogout}>
                    Log out
                    <DropdownMenuShortcut>
                      <GoSignOut/>
                    </DropdownMenuShortcut>
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            </motion.div>
          </div>
        </div>
      </motion.header>
    </div>
  );
};

export default Header;
