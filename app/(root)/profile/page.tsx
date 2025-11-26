"use client";

import React from "react";
import UserProfile from "./components/UserProfile";

const page = () => {
  return (
    <div className="w-[75%] flex flex-col items-center bg-white/5 backdrop-blur-xl h-full border border-white/10 rounded-lg p-8 shadow-2xl">
      <UserProfile />
    </div>
  );
};

export default page;
