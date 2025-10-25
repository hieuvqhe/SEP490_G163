import { ToastProvider } from "@/components/ToastProvider";

const PartnerLayout = ({ children }: { children: React.ReactNode }) => {
  return <ToastProvider>{children}</ToastProvider>;
};

export default PartnerLayout;
