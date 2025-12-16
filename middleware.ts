import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

// Helper function to get home page based on role
function getHomePageForRole(role: string | undefined): string {
  const roleLower = role?.toLowerCase();
  
  switch (roleLower) {
    case "admin":
      return "/admin";
    case "partner":
    case "staff":
      return "/partner/home";
    case "manager":
    case "managerstaff":
      return "/manager";
    case "cashier":
      return "/cashier";
    case "user":
    default:
      return "/";
  }
}

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value;
  const roleLower = role?.toLowerCase();
  
  const { pathname } = request.nextUrl;

  // 🔒 Nếu chưa đăng nhập mà truy cập trang cần login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/", request.url));
  }

  // ⚙️ Phân quyền cho admin
  if (pathname.startsWith("/admin") && roleLower !== "admin") {
    const homePage = getHomePageForRole(role);
    return NextResponse.redirect(new URL(homePage, request.url));
  }

  // ⚙️ Phân quyền cho partner (chỉ protect /partner/home và các route con, không protect /partner landing page)
  // Partner và Staff đều có thể truy cập /partner/home
  if (pathname.startsWith("/partner/home") && roleLower !== "partner" && roleLower !== "staff") {
    const homePage = getHomePageForRole(role);
    return NextResponse.redirect(new URL(homePage, request.url));
  }

  // ⚙️ Phân quyền cho manager và manager staff
  if (pathname.startsWith("/manager") && roleLower !== "manager" && roleLower !== "managerstaff") {
    const homePage = getHomePageForRole(role);
    return NextResponse.redirect(new URL(homePage, request.url));
  }

  // ⚙️ Phân quyền cho cashier
  if (pathname.startsWith("/cashier") && roleLower !== "cashier") {
    const homePage = getHomePageForRole(role);
    return NextResponse.redirect(new URL(homePage, request.url));
  }

  return NextResponse.next();
}

// ✅ Áp dụng middleware cho các route cần
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/partner/home/:path*",
    "/manager/:path*",
    "/cashier/:path*",
  ],
};
