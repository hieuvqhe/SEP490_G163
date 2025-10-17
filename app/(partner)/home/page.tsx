"use client"

import React, { useState } from "react";
import Overview from "./contents/Overview";
import TheaterInfo from "./contents/TheaterInfo";
import Movies from "./contents/Movies";
import Showtimes from "./contents/Showtimes";
import Bookings from "./contents/Bookings";
import ContractDetails from "./contents/ContractDetails";
import { motion, AnimatePresence } from "framer-motion";
import Header from "./components/Header";
import Sidebar from "./components/Sidebar";

const PartnerHomepage = () => {
  const [activeTab, setActiveTab] = useState<string>("overview");

//   const renderContent = () => {
//     switch (activeTab) {
//       case "overview":
//         return <Overview />;

//       case "theaters":
//         return <TheaterInfo />;

//       case "movies":
//         return <Movies />;

//       case "showtimes":
//         return <Showtimes />;

//       case "bookings":
//         return <Bookings />;

//       case "contract":
//         return <ContractDetails />;

//     //   case "screen":
//     //     return <Screen />;

//       default:
//         return (
//           <motion.div
//             className="bg-slate-800/60 backdrop-blur-sm p-8 rounded-xl border border-slate-700/50 text-center"
//             initial={{ opacity: 0, scale: 0.95 }}
//             animate={{ opacity: 1, scale: 1 }}
//             transition={{ duration: 0.5 }}
//           >
//             <p className="text-slate-400 text-lg">
//               This section is under development.
//             </p>
//             <div className="mt-6">
//               <div className="inline-flex items-center gap-2 px-4 py-2 bg-orange-500/20 border border-orange-500/30 rounded-lg">
//                 <div className="w-2 h-2 bg-orange-400 rounded-full animate-pulse" />
//                 <span className="text-orange-300 text-sm font-medium">
//                   Coming Soon
//                 </span>
//               </div>
//             </div>
//           </motion.div>
//         );
//     }
//   };

  return (
    <div className="h-screen bg-gradient-to-br from-slate-900 via-slate-800 to-slate-900 flex flex-col overflow-y-hidden">
      {/* Header */}
      <Header />

      <div className="flex mt-24 h-screen overflow-hidden">
        {/* Sidebar */}
        <Sidebar activeTab={activeTab} setActiveTab={setActiveTab} />

        {/* Main Content */}
        <motion.main
          className="flex-1 p-7 overflow-auto"
          transition={{ duration: 0.3 }}
        >
          {/* <AnimatePresence mode="wait">
            <motion.div
              key={activeTab}
              initial={{ opacity: 0, y: 20 }}
              animate={{ opacity: 1, y: 0 }}
              exit={{ opacity: 0, y: -20 }}
              transition={{ duration: 0.3 }}
            >
              {renderContent()}
            </motion.div>
          </AnimatePresence> */}
        </motion.main>
      </div>
    </div>
  );
};

export default PartnerHomepage;
