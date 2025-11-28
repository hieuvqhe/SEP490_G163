"use client";

import { ToastProvider } from "@/components/ToastProvider";
import { PermissionProvider } from "./home/contexts/PermissionContext";

const PartnerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <PermissionProvider>
        <main>{children}</main>
      </PermissionProvider>
    </ToastProvider>
  );
};

export default PartnerLayout;
