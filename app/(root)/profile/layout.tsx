"use client";

import Header from "@/components/Header";
import React from "react";

export default function ProfileLayout({
  children,
}: {
  children: React.ReactNode;
}) {
  return (
    <>
      <Header />
      <div className="w-full flex mt-32 h-[70vh] overflow-hidden gap-8 mb-16 px-3">
        {children}
      </div>
    </>
  );
}
