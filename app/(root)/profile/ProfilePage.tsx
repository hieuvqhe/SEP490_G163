import React, { useState } from "react";
import UserProfile from "./components/UserProfile";
import PurchasedTickets from "./components/PurchasedTickets";
import Sidebar from "./components/Sidebar";
import OrderHistory from "./components/OrderHistory";

const ProfilePage = () => {
  const [activeTab, setActiveTab] = useState<string>("profile");

  const renderContent = () => {
    switch (activeTab) {
      case "profile":
        return <UserProfile />;
      case "tickets":
        return <PurchasedTickets />;
      case "orders":
        return <OrderHistory />;
      default:
        return <div></div>;
    }
  };

  return (
    <div className="w-full h-full flex gap-5">
      <Sidebar activeSection={activeTab} setActiveSection={setActiveTab} />
      <div
        className="w-[75%] 
      bg-white/5 backdrop-blur-xl h-full border
      border-white/10 rounded-lg p-8 shadow-2xl flex items-center justify-center"
      >
        {renderContent()}
      </div>
    </div>
  );
};

export default ProfilePage;
