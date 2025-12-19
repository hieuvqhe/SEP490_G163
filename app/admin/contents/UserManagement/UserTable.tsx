import { Loader2, Eye, Edit, Trash2, ChevronLeft, ChevronRight, ShieldX, ShieldCheck } from 'lucide-react';
import { motion, AnimatePresence } from 'framer-motion';
import type { AdminUser } from '../../../../apis/admin.api';

interface UserTableProps {
  users: AdminUser[];
  usersLoading: boolean;
  currentPage: number;
  totalUsers: number;
  limit: number;
  onViewUser: (userId: string) => void;
  onEditUser: (user: AdminUser) => void;
  onToggleUserStatus: (userId: string, isCurrentlyActive: boolean) => void;
  onDeleteUser: (user: AdminUser) => void;
  onBanUser: (userId: string) => void;
  onUnbanUser: (userId: string) => void;
  onPageChange: (page: number) => void;
}

export const UserTable = ({
  users,
  usersLoading,
  currentPage,
  totalUsers,
  limit,
  onViewUser,
  onEditUser,
  onToggleUserStatus,
  onDeleteUser,
  onBanUser,
  onUnbanUser,
  onPageChange
}: UserTableProps) => {
  const totalPages = Math.ceil(totalUsers / limit);

  if (usersLoading) {
    return (
      <motion.div 
        className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 
        rounded-2xl border border-slate-700/50 
        overflow-hidden backdrop-blur-sm shadow-2xl"
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.3 }}
      >
        <div className="flex items-center justify-center py-12">
          <motion.div
            animate={{ rotate: 360 }}
            transition={{ duration: 1, repeat: Infinity, ease: "linear" }}
          >
            <Loader2 size={32} className="text-blue-400" />
          </motion.div>
          <motion.span 
            className="ml-3 text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2 }}
          >
            Đang tải người dùng...
          </motion.span>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div 
      className="bg-gradient-to-r from-slate-800/90 to-slate-900/90 rounded-2xl border border-slate-700/50 overflow-hidden backdrop-blur-sm shadow-2xl"
      initial={{ opacity: 0, y: 20 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.5, ease: "easeOut" }}
    >
      <div className="overflow-x-auto">
        <table className="w-full">
          <motion.thead 
            className="bg-gradient-to-r from-slate-700/80 to-slate-800/80"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.2, duration: 0.5 }}
          >
            <tr>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Người dùng</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Vai trò</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Trạng thái</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Thống kê</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Ngày tham gia</th>
              <th className="px-6 py-4 text-left text-xs font-medium text-gray-300 uppercase tracking-wider font-heading">Hành động</th>
            </tr>
          </motion.thead>
          <tbody className="divide-y divide-slate-700/50">
            <AnimatePresence>
              {users.map((userData, index) => (
                <motion.tr 
                  key={userData.id} 
                  className="hover:bg-slate-700/30 transition-all duration-300 group"
                  initial={{ opacity: 0, x: -20 }}
                  animate={{ opacity: 1, x: 0 }}
                  exit={{ opacity: 0, x: 20 }}
                  transition={{ 
                    delay: index * 0.05, 
                    duration: 0.3,
                    ease: "easeOut"
                  }}
                  whileHover={{ 
                    scale: 1.01,
                    transition: { duration: 0.2 }
                  }}
                >
                <td className="px-6 py-4 whitespace-nowrap">
                  <div className="flex items-center">
                    <div className="h-10 w-10 rounded-full overflow-hidden bg-gradient-to-r from-blue-400 to-purple-500 flex items-center justify-center text-white font-semibold">
                      {userData.name?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="ml-4">
                      <div className="text-sm font-medium text-white font-body">{userData.name || 'Không có tên'}</div>
                      <div className="text-sm text-gray-400 font-body">{userData.email}</div>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <span className={`px-3 py-1 rounded-full text-xs font-medium capitalize font-body ${
                    userData.role === 'admin'
                      ? 'bg-purple-500/20 text-purple-400 border border-purple-500/30'
                      : userData.role === 'staff'
                      ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30'
                      : 'bg-green-500/20 text-green-400 border border-green-500/30'
                  }`}>
                    {userData.role}
                  </span>
                </td>
                <td className="px-6 py-4 whitespace-nowrap">
                  <motion.button
                    onClick={() => onToggleUserStatus(userData.id.toString(), userData.verify === 1)}
                    className={`px-3 py-1 rounded-full text-xs font-medium transition-all duration-300 font-body ${
                      userData.verify === 1
                        ? 'bg-green-500/20 text-green-400 border border-green-500/30 hover:bg-green-500/30'
                        : userData.verify === 2
                        ? 'bg-red-500/20 text-red-400 border border-red-500/30 hover:bg-red-500/30'
                        : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30 hover:bg-yellow-500/30'
                    }`}
                    whileHover={{ scale: 1.1 }}
                    whileTap={{ scale: 0.95 }}
                  >
                    {userData.verify === 1 ? 'Đã xác minh' : userData.verify === 2 ? 'Bị cấm' : 'Chưa xác minh'}
                  </motion.button>
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-body">
                  {userData.stats && (
                    <div className="text-xs space-y-1">
                      <div>Lượt đặt vé: {userData.stats.bookingsCount}</div>
                      <div>Lượt đánh giá: {userData.stats.ratingsCount}</div>
                    </div>
                  )}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm text-gray-400 font-body">
                  {new Date(userData.createdAt).toLocaleDateString()}
                </td>
                <td className="px-6 py-4 whitespace-nowrap text-sm font-medium">
                  <div className="flex items-center gap-2">
                    <motion.button
                      onClick={() => onViewUser(userData.id.toString())}
                      className="text-blue-400 hover:text-blue-300 transition-colors p-1 rounded-lg hover:bg-blue-500/10"
                      title="Xem chi tiết"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Eye size={16} />
                    </motion.button>
                    <motion.button
                      onClick={() => onEditUser(userData)}
                      className="text-yellow-400 hover:text-yellow-300 transition-colors p-1 rounded-lg hover:bg-yellow-500/10"
                      title="Chỉnh sửa người dùng"
                      whileHover={{ scale: 1.2, rotate: -5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Edit size={16} />
                    </motion.button>
                    {(userData.role === 'user' || userData.role === 'customer') && (
                      userData.verify === 2 ? (
                        <motion.button
                          onClick={() => onUnbanUser(userData.id.toString())}
                          className="text-green-400 hover:text-green-300 transition-colors p-1 rounded-lg hover:bg-green-500/10"
                          title="Bỏ cấm người dùng"
                          whileHover={{ scale: 1.2, rotate: -5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ShieldCheck size={16} />
                        </motion.button>
                      ) : (
                        <motion.button
                          onClick={() => onBanUser(userData.id.toString())}
                          className="text-orange-400 hover:text-orange-300 transition-colors p-1 rounded-lg hover:bg-orange-500/10"
                          title="Cấm người dùng"
                          whileHover={{ scale: 1.2, rotate: 5 }}
                          whileTap={{ scale: 0.9 }}
                        >
                          <ShieldX size={16} />
                        </motion.button>
                      )
                    )}
                    <motion.button
                      onClick={() => onDeleteUser(userData)}
                      className="text-red-400 hover:text-red-300 transition-colors p-1 rounded-lg hover:bg-red-500/10"
                      title="Xóa người dùng"
                      whileHover={{ scale: 1.2, rotate: 5 }}
                      whileTap={{ scale: 0.9 }}
                    >
                      <Trash2 size={16} />
                    </motion.button>
                  </div>
                </td>
              </motion.tr>
            ))}
            </AnimatePresence>
          </tbody>
        </table>
      </div>

      {/* Pagination */}
      {totalPages > 1 && (
        <motion.div 
          className="bg-slate-800/50 px-6 py-4 flex items-center justify-between border-t border-slate-700/50"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.4, duration: 0.3 }}
        >
          <motion.div 
            className="text-sm text-gray-300"
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            transition={{ delay: 0.5 }}
          >
            Hiển thị {((currentPage - 1) * limit) + 1} đến {Math.min(currentPage * limit, totalUsers)} của {totalUsers} người dùng
          </motion.div>
          <div className="flex items-center gap-2">
            <motion.button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="px-3 py-2 bg-slate-600/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500/50 transition-all duration-300 flex items-center gap-1 font-body"
              whileHover={{ scale: currentPage === 1 ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === 1 ? 1 : 0.95 }}
            >
              <ChevronLeft size={16} />
              Trước
            </motion.button>
            
            <motion.span 
              className="text-sm px-3 py-2 bg-gradient-to-r from-blue-500 to-cyan-500 rounded-lg text-white font-medium font-body"
              initial={{ scale: 0 }}
              animate={{ scale: 1 }}
              transition={{ delay: 0.6, type: "spring" }}
            >
              Trang {currentPage} của {totalPages}
            </motion.span>
            
            <motion.button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="px-3 py-2 bg-slate-600/50 text-white rounded-lg disabled:opacity-50 disabled:cursor-not-allowed hover:bg-slate-500/50 transition-all duration-300 flex items-center gap-1 font-body"
              whileHover={{ scale: currentPage === totalPages ? 1 : 1.05 }}
              whileTap={{ scale: currentPage === totalPages ? 1 : 0.95 }}
            >
              Sau
              <ChevronRight size={16} />
            </motion.button>
          </div>
        </motion.div>
      )}
    </motion.div>
  );
};
