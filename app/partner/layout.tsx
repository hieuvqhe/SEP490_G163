import { ToastProvider } from "@/components/ToastProvider";

const PartnerLayout = ({ children }: { children: React.ReactNode }) => {
  return (
    <ToastProvider>
      <main>{children}</main>
    </ToastProvider>
  );
};

export default PartnerLayout;
