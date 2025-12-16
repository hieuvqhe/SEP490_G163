import type { Metadata } from "next";
import { Geist, Geist_Mono } from "next/font/google";
import "./globals.css";
import QueryProvider from "@/providers/QueryProvider";
import { ToastProvider } from "@/components/ToastProvider";
import AuthInitializer from "@/components/AuthInitializer";


const geistSans = Geist({
  variable: "--font-geist-sans",
  subsets: ["latin"],
});

const geistMono = Geist_Mono({
  variable: "--font-geist-mono",
  subsets: ["latin"],
});

export const metadata: Metadata = {
  title: "TicketXpress",
  description: "Watch movies, book tickets, and enjoy the show with TicketXpress!",
  icons: {
    icon: "/logo2.svg",
    shortcut: "/logo2.svg",
    apple: "/logo2.svg",
  },
};

export default function RootLayout({
  children,
}: Readonly<{
  children: React.ReactNode;
}>) {
  return (
    <html lang="en" suppressHydrationWarning>
      <body
        className={`${geistSans.variable} ${geistMono.variable} antialiased`}
      >
        <QueryProvider>
          <ToastProvider>
            
            <AuthInitializer />
          
            {children}
          </ToastProvider>
        </QueryProvider>
      </body>
    </html>
  );
}
