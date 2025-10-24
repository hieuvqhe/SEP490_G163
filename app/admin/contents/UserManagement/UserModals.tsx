import React, { useState } from "react";
import { X, User, Mail, Phone, Calendar } from "lucide-react";
import { motion } from "framer-motion";
import type { AdminUser, UpdateUserRequest } from "@/apis/admin.api";
import { useGetUserById } from "@/apis/admin.api";
import { useAuthStore } from "@/store/authStore";
import Image from "next/image";

interface UserDetailModalProps {
  user: AdminUser;
  onClose: () => void;
}

export const UserDetailModal = ({ user, onClose }: UserDetailModalProps) => {
  const { accessToken } = useAuthStore();
  const {
    data: userDetail,
    isLoading,
    error,
  } = useGetUserById(user.id, accessToken || undefined);

  if (isLoading) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
      >
        <motion.div
          className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl p-8 max-w-4xl w-full mx-4 border border-slate-700/50 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
        >
          <div className="flex justify-center items-center py-12">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-3 text-white font-body">
              Đang tải thông tin người dùng...
            </span>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  if (error) {
    return (
      <motion.div
        className="fixed inset-0 bg-black/70 flex items-center justify-center z-50 backdrop-blur-sm"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
        transition={{ duration: 0.3 }}
        onClick={onClose}
      >
        <motion.div
          className="bg-gradient-to-br from-slate-800/95 to-slate-900/95 rounded-2xl p-8 max-w-4xl w-full mx-4 border border-slate-700/50 shadow-2xl backdrop-blur-xl"
          initial={{ opacity: 0, scale: 0.8, y: 50 }}
          animate={{ opacity: 1, scale: 1, y: 0 }}
          exit={{ opacity: 0, scale: 0.8, y: 50 }}
          transition={{ duration: 0.4, ease: "easeOut" }}
          onClick={(e) => e.stopPropagation()}
        >
          <motion.div
            className="flex justify-between items-center mb-6"
            initial={{ opacity: 0, y: -20 }}
            animate={{ opacity: 1, y: 0 }}
            transition={{ delay: 0.2, duration: 0.3 }}
          >
            <h3 className="text-2xl font-bold bg-gradient-to-r from-white to-gray-300 bg-clip-text text-transparent font-heading">
              Lỗi tải dữ liệu
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

          <div className="text-red-400 mb-6 text-center">
            Không thể tải thông tin người dùng. Vui lòng thử lại.
          </div>

          <div className="flex justify-center">
            <button
              onClick={onClose}
              className="px-6 py-2 bg-slate-700 text-white rounded-lg hover:bg-slate-600 transition-colors font-body"
            >
              Đóng
            </button>
          </div>
        </motion.div>
      </motion.div>
    );
  }

  const detailData = userDetail?.result;

  return (
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
          {detailData?.avataUrl && (
            <motion.div
              className="flex justify-center mb-6"
              initial={{ opacity: 0, scale: 0 }}
              animate={{ opacity: 1, scale: 1 }}
              transition={{ delay: 0.4, type: "spring", stiffness: 200 }}
            >
              <Image
                src={detailData.avataUrl || "/default-avatar.png"}
                alt={
                  detailData.fullname || detailData.username || "User avatar"
                }
                width={96}
                height={96}
                className="rounded-full object-cover border-4 border-blue-500/50"
              />
              <div
                className="w-24 h-24 rounded-full bg-blue-500/20 border-4 border-blue-500/50 flex items-center justify-center absolute inset-0 opacity-0 transition-opacity duration-200"
                style={{ display: "none" }}
              >
                <span className="text-2xl font-bold text-blue-400">
                  {(detailData.fullname || detailData.username || "U")
                    .charAt(0)
                    .toUpperCase()}
                </span>
              </div>
            </motion.div>
          )}

          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2 font-heading">
                Thông tin cơ bản
              </h4>

              <div className="flex items-center space-x-3">
                <User size={20} className="text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">
                    Họ tên đầy đủ
                  </p>
                  <p className="text-white font-body break-words">
                    {detailData?.fullname || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Email</p>
                  <p className="text-white font-body break-words">
                    {detailData?.email}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-purple-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">
                    Số điện thoại
                  </p>
                  <p className="text-white font-body">
                    {detailData?.phone || "Chưa cập nhật"}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <User size={20} className="text-orange-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">
                    Tên người dùng
                  </p>
                  <p className="text-white font-body break-words">
                    {detailData?.username}
                  </p>
                </div>
              </div>

              <div className="flex items-center space-x-3">
                <Calendar size={20} className="text-indigo-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">
                    Ngày tham gia
                  </p>
                  <p className="text-white font-body">
                    {detailData?.createdAt
                      ? new Date(detailData.createdAt).toLocaleDateString(
                          "vi-VN"
                        )
                      : "N/A"}
                  </p>
                </div>
              </div>
            </div>

            {/* Status Information */}
            <div className="space-y-4">
              <h4 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2 font-heading">
                Trạng thái tài khoản
              </h4>

              <div>
                <p className="text-gray-400 text-sm font-body mb-2">
                  Loại người dùng
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-body ${
                    detailData?.userType === "admin"
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : detailData?.userType === "manager"
                      ? "bg-purple-500/20 text-purple-400 border border-purple-500/30"
                      : detailData?.userType === "partner"
                      ? "bg-blue-500/20 text-blue-400 border border-blue-500/30"
                      : detailData?.userType === "employee"
                      ? "bg-yellow-500/20 text-yellow-400 border border-yellow-500/30"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }`}
                >
                  {detailData?.userType?.toUpperCase() || "CUSTOMER"}
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm font-body mb-2">
                  Email xác thực
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-body ${
                    detailData?.emailConfirmed
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {detailData?.emailConfirmed ? "Đã xác thực" : "Chưa xác thực"}
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm font-body mb-2">
                  Trạng thái hoạt động
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-body ${
                    detailData?.isActive
                      ? "bg-green-500/20 text-green-400 border border-green-500/30"
                      : "bg-red-500/20 text-red-400 border border-red-500/30"
                  }`}
                >
                  {detailData?.isActive ? "Đang hoạt động" : "Không hoạt động"}
                </span>
              </div>

              <div>
                <p className="text-gray-400 text-sm font-body mb-2">
                  Trạng thái cấm
                </p>
                <span
                  className={`px-3 py-1 rounded-full text-sm font-medium font-body ${
                    detailData?.isBanned
                      ? "bg-red-500/20 text-red-400 border border-red-500/30"
                      : "bg-green-500/20 text-green-400 border border-green-500/30"
                  }`}
                >
                  {detailData?.isBanned ? "Đã bị cấm" : "Không bị cấm"}
                </span>
              </div>
            </div>
          </div>

          {/* Ban/Unban Information */}
          {(detailData?.bannedAt ||
            detailData?.unbannedAt ||
            detailData?.deactivatedAt) && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2 mb-4 font-heading">
                Lịch sử trạng thái
              </h4>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                {detailData.bannedAt && (
                  <div className="bg-red-500/10 border border-red-500/30 rounded-lg p-3">
                    <p className="text-red-400 text-sm font-body mb-1">
                      Ngày cấm
                    </p>
                    <p className="text-white font-body text-sm">
                      {new Date(detailData.bannedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}

                {detailData.unbannedAt && (
                  <div className="bg-green-500/10 border border-green-500/30 rounded-lg p-3">
                    <p className="text-green-400 text-sm font-body mb-1">
                      Ngày bỏ cấm
                    </p>
                    <p className="text-white font-body text-sm">
                      {new Date(detailData.unbannedAt).toLocaleString("vi-VN")}
                    </p>
                  </div>
                )}

                {detailData.deactivatedAt && (
                  <div className="bg-yellow-500/10 border border-yellow-500/30 rounded-lg p-3">
                    <p className="text-yellow-400 text-sm font-body mb-1">
                      Ngày vô hiệu hóa
                    </p>
                    <p className="text-white font-body text-sm">
                      {new Date(detailData.deactivatedAt).toLocaleString(
                        "vi-VN"
                      )}
                    </p>
                  </div>
                )}
              </div>
            </div>
          )}

          {/* Avatar URL */}
          {detailData?.avataUrl && (
            <div className="mt-6">
              <h4 className="text-lg font-semibold text-white border-b border-slate-700/50 pb-2 mb-4 font-heading">
                Avatar
              </h4>

              <div className="bg-slate-700/50 rounded-lg p-4">
                <p className="text-gray-400 text-sm font-body mb-2">
                  URL Avatar
                </p>
                <a
                  href={detailData.avataUrl}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-blue-400 hover:text-blue-300 break-all text-sm font-body underline"
                >
                  {detailData.avataUrl}
                </a>
              </div>
            </div>
          )}
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

interface EditUserModalProps {
  user: AdminUser;
  onClose: () => void;
  onSave: (userId: string, data: UpdateUserRequest) => void;
}

export const EditUserModal = ({
  user,
  onClose,
  onSave,
}: EditUserModalProps) => {
  const { accessToken } = useAuthStore();
  const {
    data: userDetail,
    isLoading,
    error,
  } = useGetUserById(user.id, accessToken || undefined);

  const [formData, setFormData] = useState({
    email: "",
    phone: "",
    userType: "",
    fullname: "",
    username: "",
    avataUrl: "",
  });

  // Update form data when user detail is loaded
  React.useEffect(() => {
    if (userDetail?.result) {
      setFormData({
        email: userDetail.result.email || "",
        phone: userDetail.result.phone || "",
        userType: userDetail.result.userType || "",
        fullname: userDetail.result.fullname || "",
        username: userDetail.result.username || "",
        avataUrl: userDetail.result.avataUrl || "",
      });
    }
  }, [userDetail]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    onSave(user.id.toString(), formData);
  };

  if (isLoading) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-center items-center py-8">
            <div className="animate-spin rounded-full h-8 w-8 border-b-2 border-blue-500"></div>
            <span className="ml-2 text-white">
              Đang tải thông tin người dùng...
            </span>
          </div>
        </div>
      </div>
    );
  }

  if (error) {
    return (
      <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
        <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4">
          <div className="flex justify-between items-center mb-4">
            <h3 className="text-xl font-bold text-white font-heading">
              Lỗi tải dữ liệu
            </h3>
            <button
              onClick={onClose}
              className="text-gray-400 hover:text-white"
            >
              <X size={24} />
            </button>
          </div>
          <div className="text-red-400 mb-4">
            Không thể tải thông tin người dùng. Vui lòng thử lại.
          </div>
          <div className="flex justify-end">
            <button
              onClick={onClose}
              className="px-4 py-2 bg-gray-600 text-white rounded hover:bg-gray-700 transition-colors font-body"
            >
              Đóng
            </button>
          </div>
        </div>
      </div>
    );
  }

  return (
    <div className="fixed inset-0 bg-black/70 backdrop-blur-sm flex items-center justify-center z-50">
      <div className="bg-gray-800 rounded-lg p-6 max-w-2xl w-full mx-4 max-h-[90vh] overflow-y-auto">
        <div className="flex justify-between items-center mb-4">
          <h3 className="text-xl font-bold text-white font-heading">
            Chỉnh sửa người dùng
          </h3>
          <button onClick={onClose} className="text-gray-400 hover:text-white">
            <X size={24} />
          </button>
        </div>

        <form onSubmit={handleSubmit} className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">
                Email
              </label>
              <input
                type="email"
                value={formData.email}
                onChange={(e) =>
                  setFormData({ ...formData, email: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">
                Điện thoại
              </label>
              <input
                type="tel"
                value={formData.phone}
                onChange={(e) =>
                  setFormData({ ...formData, phone: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">
                Loại người dùng
              </label>
              <select
                value={formData.userType}
                onChange={(e) =>
                  setFormData({ ...formData, userType: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
              >
                <option value="customer">Khách hàng</option>
                <option value="employee">Nhân viên</option>
                <option value="admin">Quản trị viên</option>
                <option value="partner">Đối tác</option>
                <option value="manager">Quản lý</option>
              </select>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">
                Họ tên đầy đủ
              </label>
              <input
                type="text"
                value={formData.fullname}
                onChange={(e) =>
                  setFormData({ ...formData, fullname: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">
                Tên người dùng
              </label>
              <input
                type="text"
                value={formData.username}
                onChange={(e) =>
                  setFormData({ ...formData, username: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
                required
              />
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-400 mb-1 font-body">
                URL Avatar
              </label>
              <input
                type="url"
                value={formData.avataUrl}
                onChange={(e) =>
                  setFormData({ ...formData, avataUrl: e.target.value })
                }
                className="w-full px-3 py-2 bg-gray-700 text-white rounded border border-gray-600 focus:outline-none focus:border-blue-500 font-body"
              />
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

export const DeleteConfirmModal = ({
  user,
  onClose,
  onConfirm,
}: DeleteConfirmModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white font-heading">
          Xác nhận xóa
        </h3>
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

interface UnbanConfirmModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
}

export const UnbanConfirmModal = ({
  user,
  onClose,
  onConfirm,
}: UnbanConfirmModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white font-heading">
          Xác nhận bỏ cấm
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 mb-2 font-body">
          Bạn có chắc chắn muốn bỏ cấm người dùng này không?
        </p>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-white font-medium font-body">{user.name}</p>
          <p className="text-gray-400 text-sm font-body">{user.email}</p>
        </div>
        <p className="text-green-400 text-sm mt-2 font-body">
          Người dùng sẽ có thể truy cập lại hệ thống.
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
          className="px-4 py-2 bg-green-600 text-white rounded hover:bg-green-700 transition-colors font-body"
        >
          Bỏ cấm
        </button>
      </div>
    </div>
  </div>
);

interface BanConfirmModalProps {
  user: AdminUser;
  onClose: () => void;
  onConfirm: () => void;
}

export const BanConfirmModal = ({
  user,
  onClose,
  onConfirm,
}: BanConfirmModalProps) => (
  <div className="fixed inset-0 bg-black bg-opacity-50 flex items-center justify-center z-50">
    <div className="bg-gray-800 rounded-lg p-6 max-w-md w-full mx-4">
      <div className="flex justify-between items-center mb-4">
        <h3 className="text-xl font-bold text-white font-heading">
          Xác nhận cấm người dùng
        </h3>
        <button onClick={onClose} className="text-gray-400 hover:text-white">
          <X size={24} />
        </button>
      </div>

      <div className="mb-6">
        <p className="text-gray-300 mb-2 font-body">
          Bạn có chắc chắn muốn cấm người dùng này không?
        </p>
        <div className="bg-gray-700 p-3 rounded">
          <p className="text-white font-medium font-body">{user.name}</p>
          <p className="text-gray-400 text-sm font-body">{user.email}</p>
        </div>
        <p className="text-red-400 text-sm mt-2 font-body">
          Người dùng sẽ không thể truy cập vào hệ thống cho đến khi được bỏ cấm.
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
          Cấm người dùng
        </button>
      </div>
    </div>
  </div>
);
