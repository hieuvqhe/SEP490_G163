import Header from "@/components/Header";
import React from "react";

export default function ProfileLayout({ children }: { children: React.ReactNode }) {
  return (
    <>
      <Header/>
      {children}
    </>
  );
}
