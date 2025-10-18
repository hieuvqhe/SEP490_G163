import { NextResponse } from "next/server";
import type { NextRequest } from "next/server";

export function middleware(request: NextRequest) {
  const token = request.cookies.get("token")?.value;
  const role = request.cookies.get("role")?.value; // hoặc decode JWT để lấy role
  const roleLower = role?.toLowerCase();
  
  const { pathname } = request.nextUrl;

  // 🔒 Nếu chưa đăng nhập mà truy cập trang cần login
  if (!token && pathname.startsWith("/dashboard")) {
    return NextResponse.redirect(new URL("/login", request.url));
  }

  // ⚙️ Phân quyền cho admin
  if (pathname.startsWith("/admin") && roleLower !== "admin") {
    return NextResponse.redirect(new URL("/403", request.url)); // trang không có quyền
  }

  // ⚙️ Phân quyền cho partner
  // if (pathname.startsWith("/partner") && roleLower !== "partner") {
  //   return NextResponse.redirect(new URL("/403", request.url));
  // }

  // ⚙️ Phân quyền cho manager
  if (pathname.startsWith("/manager") && roleLower !== "manager") {
    return NextResponse.redirect(new URL("/403", request.url));
  }

  return NextResponse.next();
}

// ✅ Áp dụng middleware cho các route cần
export const config = {
  matcher: [
    "/dashboard/:path*",
    "/admin/:path*",
    "/partner/:path*",
    "/manager/:path*",
  ],
};
