'use client';

import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { useRouter } from "next/navigation";

export default function HomePage() {
  const router = useRouter();

  const handleLogout = () => {
    // Trong thực tế, bạn sẽ xóa token và thông tin người dùng
    router.push('/');
  };

  return (
    <div className="min-h-screen bg-gray-50 p-8">
      <div className="max-w-4xl mx-auto">
        <div className="mb-8">
          <h1 className="text-4xl font-bold text-gray-900">Chào mừng đến với Cinema App!</h1>
          <p className="text-gray-600 mt-2">Bạn đã đăng nhập thành công vào hệ thống.</p>
        </div>

        <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
          <Card>
            <CardHeader>
              <CardTitle>Thống kê phim</CardTitle>
              <CardDescription>Xem các thống kê về phim đang chiếu</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">250+</div>
              <p className="text-gray-600">Phim đang chiếu</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Khách hàng</CardTitle>
              <CardDescription>Tổng số khách hàng đã đăng ký</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">15,420</div>
              <p className="text-gray-600">Khách hàng</p>
            </CardContent>
          </Card>

          <Card>
            <CardHeader>
              <CardTitle>Doanh thu</CardTitle>
              <CardDescription>Doanh thu tháng này</CardDescription>
            </CardHeader>
            <CardContent>
              <div className="text-2xl font-bold">₫2.5M</div>
              <p className="text-gray-600">VNĐ</p>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8">
          <Card>
            <CardHeader>
              <CardTitle>Quản lý hệ thống</CardTitle>
              <CardDescription>Các chức năng quản lý dành cho admin</CardDescription>
            </CardHeader>
            <CardContent className="flex gap-4">
              <Button variant="outline">Quản lý phim</Button>
              <Button variant="outline">Quản lý rạp</Button>
              <Button variant="outline">Quản lý vé</Button>
              <Button variant="outline">Báo cáo</Button>
            </CardContent>
          </Card>
        </div>

        <div className="mt-8 flex justify-between items-center">
          <div>
            <p className="text-sm text-gray-500">
              Đang đăng nhập với tài khoản: <span className="font-medium">admin@cinema.com</span>
            </p>
          </div>
          <Button variant="destructive" onClick={handleLogout}>
            Đăng xuất
          </Button>
        </div>
      </div>
    </div>
  );
}