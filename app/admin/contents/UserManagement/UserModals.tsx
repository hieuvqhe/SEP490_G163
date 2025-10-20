import { useState } from 'react';
import { X, User, Mail, Phone, MapPin, Calendar } from 'lucide-react';
import { motion } from 'framer-motion';
import type { AdminUser, UpdateUserRequest } from '../../../../types/Admin.type';

interface UserDetailModalProps {
  user: AdminUser;
  onClose: () => void;
}

export const UserDetailModal = ({ user, onClose }: UserDetailModalProps) => (
  <motion.div 
    className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClose}
  >
    <motion.div 
      className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl p-8 max-w-4xl w-full mx-4 max-h-[90vh] overflow-y-auto border border-slate-700/50 shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      {/* Header */}
      <motion.div 
        className="flex justify-between items-center mb-6"
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.2, duration: 0.3 }}
      >
        <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-heading">
          Chi tiết người dùng
        </h3>
        <motion.button 
          onClick={onClose} 
          className="text-gray-400 hover:text-white p-2 rounded-lg hover:bg-slate-700/50 transition-all duration-300 font-body"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>
      </motion.div>
      
      <motion.div 
        className="space-y-6"
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ delay: 0.3, duration: 0.4 }}
      >
        {/* User Avatar */}
        {user.avatar && (
          <motion.div 
            className="flex justify-center mb-6"
            initial={{ opacity: 0, scale: 0 }}
            animate={{ opacity: 1, scale: 1 }}
            transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
          >
            <img 
              src={user.avatar} 
              alt={user.name}
              className="w-24 h-24 rounded-full object-cover border-4 border-blue-500/50"
              onError={(e) => {
                e.currentTarget.style.display = 'none';
              }}
            />
          </motion.div>
        )}
        
        <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
          <div className="space-y-3">
            <div className="flex items-center space-x-3">
              <User size={20} className="text-blue-400" />
              <div>
                <p className="text-gray-400 text-sm font-body">Tên</p>
                <p className="text-white font-body">{user.name}</p>
              </div>
            </div>
            
            <div className="flex items-center space-x-3">
              <Mail size={20} className="text-green-400" />
              <div>
                <p className="text-gray-400 text-sm font-body">Email</p>
                <p className="text-white font-body">{user.email}</p>
              </div>
            </div>
            
            {user.phone && (
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-yellow-400" />
                <div>
                  <p className="text-gray-400 text-sm font-body">Điện thoại</p>
                  <p className="text-white font-body">{user.phone}</p>
                </div>
              </div>
            )}
            
            <div className="flex items-center space-x-3">
              <Calendar size={20} className="text-purple-400" />
              <div>
                <p className="text-gray-400 text-sm font-body">Ngày tham gia</p>
                <p className="text-white font-body">{new Date(user.created_at).toLocaleDateString()}</p>
              </div>
            </div>
          </div>
          
          <div className="space-y-3">
            <div>
              <p className="text-gray-400 text-sm font-body">Vai trò</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium font-body ${
                user.role === 'admin' ? 'bg-red-500/20 text-red-400 border border-red-500/30' :
                user.role === 'staff' ? 'bg-blue-500/20 text-blue-400 border border-blue-500/30' :
                'bg-green-500/20 text-green-400 border border-green-500/30'
              }`}>
                {user.role.toUpperCase()}
              </span>
            </div>
            
            <div>
              <p className="text-gray-400 text-sm font-body">Trạng thái</p>
              <span className={`px-2 py-1 rounded-full text-xs font-medium font-body ${
                user.verify === 1 
                  ? 'bg-green-500/20 text-green-400 border border-green-500/30' 
                  : user.verify === 2
                  ? 'bg-red-500/20 text-red-400 border border-red-500/30'
                  : 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
              }`}>
                {user.verify === 1 ? 'Đã xác minh' : user.verify === 2 ? 'Bị cấm' : 'Chưa xác minh'}
              </span>
            </div>
            
            {user.username && (
              <div>
                <p className="text-gray-400 text-sm font-body">Tên người dùng</p>
                <p className="text-white font-body">{user.username}</p>
              </div>
            )}
            
            {user.date_of_birth && (
              <div>
                <p className="text-gray-400 text-sm font-body">Ngày sinh</p>
                <p className="text-white font-body">{new Date(user.date_of_birth).toLocaleDateString()}</p>
              </div>
            )}
            
            {user.stats && (
              <div>
                <p className="text-gray-400 text-sm font-body">Thống kê</p>
                <div className="text-white space-y-1 font-body">
                  <p className="text-sm">Lượt đặt vé: {user.stats.bookings_count}</p>
                  <p className="text-sm">Lượt đánh giá: {user.stats.ratings_count}</p>
                  <p className="text-sm">Lượt phản hồi: {user.stats.feedbacks_count}</p>
                  {user.stats.total_spent !== undefined && (
                    <p className="text-sm">Tổng chi tiêu: ${user.stats.total_spent}</p>
                  )}
                </div>
              </div>
            )}
          </div>
        </div>
        
        {user.address && (
          <div className="pt-4 border-t border-gray-700">
            <div className="flex items-start space-x-3">
              <MapPin size={20} className="text-orange-400 mt-1" />
              <div>
                <p className="text-gray-400 text-sm font-body">Địa chỉ</p>
                <div className="text-white font-body">
                  <p>{user.address.street}</p>
                  <p>{user.address.city}, {user.address.state}</p>
                  <p>{user.address.country} {user.address.zipCode}</p>
                </div>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </motion.div>
  </motion.div>
);

interface EditUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, data: UpdateUserRequest) => void;
}

export const EditUserModal = ({ user, onClose, onSave }: EditUserModalProps) => {
  const [formData, setFormData] = useState({
    name: user.name,
    email: user.email,
    phone: user.phone || '',
    date_of_birth: user.date_of_birth ? user.date_of_birth.split('T')[0] : '',
    address: user.address || {
      street: '',
      city: '',
      state: '',
      country: '',
      zipCode: ''
    }
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user._id, formData);
  };

  return (
    <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white font-heading">Chỉnh sửa người dùng</h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Tên</label>
              <input
                type="text"
                value={formData.name}
                onChange={(e) => setFormData({ ...formData, name: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Email</label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) => setFormData({ ...formData, email: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                required
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Điện thoại</label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) => setFormData({ ...formData, phone: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
              />
            </div>
            
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Ngày sinh</label>
              <input
                type="date"
                value={formData.date_of_birth}
                onChange={(e) => setFormData({ ...formData, date_of_birth: e.target.value })}
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
              />
            </div>
          </div>
          
          <div className="space-y-3">
            <h4 className="text-lg font-medium text-white font-heading">Địa chỉ</h4>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Đường</label>
                <input
                  type="text"
                  value={formData.address.street}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, street: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Thành phố</label>
                <input
                  type="text"
                  value={formData.address.city}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, city: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Tỉnh</label>
                <input
                  type="text"
                  value={formData.address.state}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, state: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Quốc gia</label>
                <input
                  type="text"
                  value={formData.address.country}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, country: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                />
              </div>
              
              <div>
                <label className="block text-sm font-medium text-gray-400 mb-1 font-body">Mã bưu điện</label>
                <input
                  type="text"
                  value={formData.address.zipCode}
                  onChange={(e) => setFormData({ 
                    ...formData, 
                    address: { ...formData.address, zipCode: e.target.value }
                  })}
                  className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                />
              </div>
            </div>
          </div>
          
          <div className="flex justify-end space-x-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-body"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="px-4 py-2 bg-blue-600 text-white rounded hover:bg-blue-700 transition-colors font-body"
            >
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
};

interface DeleteConfirmModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
}

export const DeleteConfirmModal = ({ user, onClose, onConfirm }: DeleteConfirmModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white font-heading">Xác nhận xóa</h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>
      
      <div className="mb-6">
        <p className="text-gray-300 mb-2 font-body">
          Bạn có chắc chắn muốn xóa người dùng này không?
        </p>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-white font-medium font-body">{user.name}</p>
          <p className="text-gray-400 text-sm font-body">{user.email}</p>
        </div>
        <p className="text-red-400 text-sm mt-2 font-body">
          Hành động này không thể hoàn tác.
        </p>
      </div>
      
      <div className="flex justify-end space-x-3">
        <button
          onClick={onClose}
          className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-body"
        >
          Hủy
        </button>
        <button
          onClick={onConfirm}
          className="px-4 py-2 bg-red-600 text-white rounded hover:bg-red-700 transition-colors font-body"
        >
          Xóa người dùng
        </button>
      </div>
    </div>
  </div>
);
