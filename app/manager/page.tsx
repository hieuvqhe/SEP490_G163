"use client";

const ManagerPage = () => {
  return (
    <div className="min-h-screen bg-[#09090b] py-12 px-4 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-orange-900/20 via-yellow-900/10 to-red-900/20"></div>

      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-orange-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-yellow-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>

      <div className="relative z-10 max-w-4xl mx-auto mt-20">
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-orange-400 via-yellow-400 to-red-400 bg-clip-text text-transparent mb-4">
            Manager Dashboard
          </h1>
          <p className="text-gray-400 text-lg">Quản lý nội dung và lịch chiếu</p>
        </div>

        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-6">
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Quản lý phim</h3>
              <p className="text-gray-400">Thêm, sửa, xóa thông tin phim</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Lịch chiếu</h3>
              <p className="text-gray-400">Sắp xếp và quản lý lịch chiếu phim</p>
            </div>
            <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-6">
              <h3 className="text-xl font-semibold text-white mb-2">Báo cáo</h3>
              <p className="text-gray-400">Xem thống kê và báo cáo chi tiết</p>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default ManagerPage;