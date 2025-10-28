import { ToastProvider } from "@/components/ToastProvider";
import { SidebarProvider, SidebarTrigger } from "@/components/ui/sidebar";

const PartnerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <main>{children}</main>
    </ToastProvider>
  );
};

export default PartnerLayout;
