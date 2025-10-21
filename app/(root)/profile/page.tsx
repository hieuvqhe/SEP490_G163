"use client";
import React, { useState, useEffect, useCallback } from "react";
// Import thêm useUpdateUserInfo
import { useGetUserInfo, useUpdateUserInfo, useChangePassword } from "@/hooks/useAuth";
import { useAuthStore } from "@/store/authStore";
import { UserInfo, ChangePasswordData } from "@/services/authService";
import Image from "next/image";
import { useToast } from '@/components/ToastProvider';

const ProfilePage = () => {
  const { accessToken, user } = useAuthStore();
  const { data: userInfo, isLoading, isError, error } = useGetUserInfo(accessToken);
  const { showToast } = useToast();
  
  // Type assertion để TypeScript hiểu kiểu dữ liệu
  const currentUser = user as UserInfo | null;
  
  // Helper function để lấy user data
  const getUserData = useCallback((): UserInfo | null => {
    return (userInfo || currentUser) as UserInfo | null;
  }, [userInfo, currentUser]);

  // State để quản lý chế độ chỉnh sửa
  const [isEditing, setIsEditing] = useState(false);
  // State để quản lý hiển thị form đổi mật khẩu
  const [showChangePassword, setShowChangePassword] = useState(false);
  // State để lưu trữ dữ liệu form khi chỉnh sửa
  const [formData, setFormData] = useState({
    fullname: "",
    phone: "",
  });
  // State cho form đổi mật khẩu
  const [passwordForm, setPasswordForm] = useState<ChangePasswordData>({
    oldPassword: "",
    newPassword: "",
    confirmPassword: "",
  });
  // State để lưu lỗi validation cho từng field
  const [passwordFieldErrors, setPasswordFieldErrors] = useState<Record<string, string>>({});
  // Hàm xử lý thay đổi input cho form đổi mật khẩu
  const handlePasswordInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setPasswordForm(prev => ({ ...prev, [name]: value }));

    // Clear field error when user starts typing (both client and server validation errors)
    if (passwordFieldErrors[name.toLowerCase()]) {
      setPasswordFieldErrors(prev => ({ ...prev, [name.toLowerCase()]: '' }));
    }
  };

  // Hàm validate form đổi mật khẩu
  const validatePasswordForm = () => {
    const errors: Record<string, string> = {};

    if (!passwordForm.oldPassword.trim()) {
      errors.oldpassword = 'Vui lòng nhập mật khẩu hiện tại';
    }

    if (!passwordForm.newPassword.trim()) {
      errors.newpassword = 'Vui lòng nhập mật khẩu mới';
    } else if (passwordForm.newPassword.length < 6) {
      errors.newpassword = 'Mật khẩu phải có ít nhất 6 ký tự';
    }

    if (!passwordForm.confirmPassword.trim()) {
      errors.confirmpassword = 'Vui lòng xác nhận mật khẩu mới';
    } else if (passwordForm.newPassword !== passwordForm.confirmPassword) {
      errors.confirmpassword = 'Mật khẩu xác nhận không khớp';
    }

    return errors;
  };

  // Hàm gọi API đổi mật khẩu
  const handleChangePassword = () => {
    // Validate form trước khi gửi request
    const validationErrors = validatePasswordForm();
    if (Object.keys(validationErrors).length > 0) {
      setPasswordFieldErrors(validationErrors);
      return;
    }

    if (!accessToken) {
      showToast('Lỗi xác thực', 'Không tìm thấy token.', 'error');
      return;
    }
    changePasswordMutation.mutate({ data: passwordForm, accessToken });
  };

  // Sử dụng hook useUpdateUserInfo
  const updateMutation = useUpdateUserInfo({
    onSuccess: () => {
      showToast('Cập nhật hồ sơ thành công!', undefined, 'success');
      setIsEditing(false); // Tắt chế độ chỉnh sửa sau khi thành công
      // Dữ liệu sẽ tự động được cập nhật nhờ query invalidation trong hook
    },
    onError: (error) => {
      showToast('Lỗi cập nhật', error, 'error');
      // Giữ nguyên chế độ chỉnh sửa để người dùng có thể sửa lại
    }
  });

  // Sử dụng hook useChangePassword
  const changePasswordMutation = useChangePassword({
    onSuccess: (data) => {
      showToast('Thành công', data.message, 'success');
      setShowChangePassword(false);
      setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
      setPasswordFieldErrors({}); // Clear all errors on success
    },
    onFieldError: (fieldErrors) => {
      // Server validation errors take precedence over client validation
      setPasswordFieldErrors(fieldErrors);
    },
    onError: (error) => {
      showToast('Lỗi đổi mật khẩu', error, 'error');
      // Keep existing field errors for server errors
    }
  });

  // Cập nhật formData khi userInfo thay đổi (lần đầu tải trang)
  useEffect(() => {
    const userData = getUserData();
    if (userData) {
      setFormData({
        fullname: userData.fullname || "",
        phone: userData.phone || "",
      });
    }
  }, [userInfo, currentUser, getUserData]);

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData(prev => ({ ...prev, [name]: value }));
  };

  // Hàm xử lý khi nhấn nút "Lưu thay đổi"
  const handleSave = () => {
    if (!accessToken) {
        showToast('Lỗi xác thực', 'Không tìm thấy token.', 'error');
        return;
    }
    // Chỉ gửi request nếu có sự thay đổi
    const userData = getUserData();
    if (formData.fullname !== userData?.fullname || formData.phone !== userData?.phone) {
        updateMutation.mutate({ data: formData, accessToken });
    } else {
        setIsEditing(false); // Nếu không có gì thay đổi, chỉ cần thoát chế độ chỉnh sửa
    }
  };
  
  // Hàm xử lý khi nhấn nút "Hủy"
  const handleCancel = () => {
    setIsEditing(false);
    // Reset lại form data về giá trị ban đầu từ userInfo hoặc user
    const userData = getUserData();
    if (userData) {
      setFormData({
        fullname: userData.fullname,
        phone: userData.phone || "",
      });
    }
  };


  return (
    <div className="min-h-screen bg-[#09090b] py-12 px-4 relative overflow-hidden">
      {/* Background gradient overlay */}
      <div className="absolute inset-0 bg-gradient-to-br from-purple-900/20 via-blue-900/10 to-cyan-900/20"></div>
      
      {/* Animated background elements */}
      <div className="absolute top-20 left-10 w-72 h-72 bg-purple-500/10 rounded-full blur-3xl animate-pulse"></div>
      <div className="absolute bottom-20 right-10 w-96 h-96 bg-blue-500/10 rounded-full blur-3xl animate-pulse delay-1000"></div>
      
      <div className="relative z-10 max-w-4xl mx-auto mt-20">
        {/* Header Section */}
        <div className="text-center mb-12">
          <h1 className="text-5xl font-bold bg-gradient-to-r from-white via-blue-200 to-purple-200 bg-clip-text text-transparent mb-4">
            Hồ sơ cá nhân
          </h1>
          <p className="text-gray-400 text-lg">Quản lý thông tin và cài đặt tài khoản của bạn</p>
        </div>

        {/* Main Profile Card */}
        <div className="bg-white/5 backdrop-blur-xl border border-white/10 rounded-3xl p-8 shadow-2xl">
          {isLoading && (
            <div className="flex items-center justify-center py-20">
              <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-white"></div>
              <span className="ml-4 text-gray-300">Đang tải thông tin người dùng...</span>
            </div>
          )}
          
          {isError && (
            <div className="text-center py-20">
              <div className="bg-red-500/20 border border-red-500/30 rounded-2xl p-6 backdrop-blur-sm">
                <p className="text-red-300 text-lg">
                  Lỗi: {error instanceof Error ? error.message : String(error)}
                </p>
              </div>
            </div>
          )}
          
          {getUserData() && (
            <div className="grid md:grid-cols-2 gap-8">
              {/* Avatar and Basic Info */}
              <div className="flex flex-col items-center space-y-6">
                <div className="relative">
                  <div className="absolute -inset-4 bg-gradient-to-r from-purple-500 to-blue-500 rounded-full blur opacity-30"></div>
                  <div className="relative bg-white/10 backdrop-blur-sm border border-white/20 rounded-full p-2">
                    <Image
                      src={getUserData()?.avatarUrl || "/default-avatar.svg"}
                      alt="avatar"
                      width={120}
                      height={120}
                      className="w-30 h-30 rounded-full object-cover"
                    />
                  </div>
                </div>
                
                <div className="text-center space-y-2 w-full">
                  {isEditing ? (
                    <input
                      type="text"
                      name="fullname"
                      value={formData.fullname}
                      onChange={handleInputChange}
                      className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-2xl font-bold text-white text-center focus:outline-none focus:ring-2 focus:ring-purple-500"
                    />
                  ) : (
                    <h2 className="text-2xl font-bold text-white">{getUserData()?.fullname}</h2>
                  )}
                  <p className="text-gray-400 text-lg">@{getUserData()?.username}</p>
                  <div className="inline-flex items-center px-4 py-2 bg-gradient-to-r from-purple-500/20 to-blue-500/20 border border-purple-500/30 rounded-full">
                    <span className="text-purple-300 text-sm font-medium">Thành viên</span>
                  </div>
                </div>
              </div>

              {/* User Details */}
              <div className="space-y-6">
                <h3 className="text-xl font-semibold text-white mb-6">Thông tin chi tiết</h3>
                
                <div className="space-y-4">
                  {/* Email (không cho chỉnh sửa) */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-blue-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-blue-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M16 12a4 4 0 10-8 0 4 4 0 008 0zm0 0v1.5a2.5 2.5 0 005 0V12a9 9 0 10-9 9m4.5-1.206a8.959 8.959 0 01-4.5 1.207" /></svg>
                          </div>
                          <span className="text-gray-300 font-medium">Email</span>
                        </div>
                        <span className="text-white font-semibold">{getUserData()?.email}</span>
                    </div>
                  </div>

                  {/* Số điện thoại */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4 transition-all duration-300">
                    <div className="flex items-center justify-between">
                      <div className="flex items-center space-x-3">
                        <div className="w-10 h-10 bg-green-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-green-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M3 5a2 2 0 012-2h3.28a1 1 0 01.948.684l1.498 4.493a1 1 0 01-.502 1.21l-2.257 1.13a11.042 11.042 0 005.516 5.516l1.13-2.257a1 1 0 011.21-.502l4.493 1.498a1 1 0 01.684.949V19a2 2 0 01-2 2h-1C9.716 21 3 14.284 3 6V5z" /></svg>
                        </div>
                        <span className="text-gray-300 font-medium">Số điện thoại</span>
                      </div>
                      {isEditing ? (
                        <input
                          type="text"
                          name="phone"
                          value={formData.phone}
                          onChange={handleInputChange}
                          className="w-40 bg-white/10 border border-white/20 rounded-lg py-1 px-2 text-white font-semibold text-right focus:outline-none focus:ring-2 focus:ring-green-500"
                          placeholder="Nhập số điện thoại"
                        />
                      ) : (
                        <span className="text-white font-semibold">{getUserData()?.phone || "Chưa cập nhật"}</span>
                      )}
                    </div>
                  </div>

                  {/* User ID (không cho chỉnh sửa) */}
                  <div className="bg-white/5 backdrop-blur-sm border border-white/10 rounded-2xl p-4">
                    <div className="flex items-center justify-between">
                        <div className="flex items-center space-x-3">
                          <div className="w-10 h-10 bg-purple-500/20 rounded-lg flex items-center justify-center">
                            <svg className="w-5 h-5 text-purple-400" fill="none" stroke="currentColor" viewBox="0 0 24 24"><path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M10 6H5a2 2 0 00-2 2v9a2 2 0 002 2h14a2 2 0 002-2V8a2 2 0 00-2-2h-5m-4 0V5a2 2 0 114 0v1m-4 0a2 2 0 104 0m-5 8a2 2 0 100-4 2 2 0 000 4zm0 0c1.306 0 2.417.835 2.83 2M9 14a3.001 3.001 0 00-2.83 2M15 11h3m-3 4h2" /></svg>
                          </div>
                          <span className="text-gray-300 font-medium">ID người dùng</span>
                        </div>
                        <span className="text-white font-semibold">{getUserData()?.userId}</span>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          )}
        </div>

        {/* Action Buttons */}
        {getUserData() && (
          <div className="mt-8 flex flex-col sm:flex-row gap-4 justify-center">
            {isEditing ? (
              <>
                <button
                  onClick={handleSave}
                  disabled={updateMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {updateMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
                </button>
                <button onClick={handleCancel} className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300">
                  Hủy
                </button>
              </>
            ) : (
              <>
                <button onClick={() => setIsEditing(true)} className="px-8 py-3 bg-gradient-to-r from-purple-500 to-blue-500 text-white font-semibold rounded-2xl hover:from-purple-600 hover:to-blue-600 transition-all duration-300 transform hover:scale-105 shadow-lg">
                  Chỉnh sửa hồ sơ
                </button>
                <button onClick={() => setShowChangePassword(true)} className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300">
                  Đổi mật khẩu
                </button>
              </>
            )}
          </div>
        )}

        {/* Form đổi mật khẩu */}
        {showChangePassword && (
          <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/60">
            <div className="bg-[#18181b] rounded-2xl p-8 shadow-2xl w-full max-w-md relative">
              <h2 className="text-2xl font-bold text-white mb-6 text-center">Đổi mật khẩu</h2>
              <div className="space-y-4">
                <div>
                  <input
                    type="password"
                    name="oldPassword"
                    value={passwordForm.oldPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Mật khẩu hiện tại"
                    autoComplete="current-password"
                  />
                  {passwordFieldErrors.oldpassword && (
                    <p className="text-red-400 text-sm mt-1">{passwordFieldErrors.oldpassword}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    name="newPassword"
                    value={passwordForm.newPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Mật khẩu mới"
                    autoComplete="new-password"
                  />
                  {passwordFieldErrors.newpassword && (
                    <p className="text-red-400 text-sm mt-1">{passwordFieldErrors.newpassword}</p>
                  )}
                </div>
                <div>
                  <input
                    type="password"
                    name="confirmPassword"
                    value={passwordForm.confirmPassword}
                    onChange={handlePasswordInputChange}
                    className="w-full bg-white/10 border border-white/20 rounded-lg py-2 px-3 text-white text-lg focus:outline-none focus:ring-2 focus:ring-purple-500"
                    placeholder="Xác nhận mật khẩu mới"
                    autoComplete="new-password"
                  />
                  {passwordFieldErrors.confirmpassword && (
                    <p className="text-red-400 text-sm mt-1">{passwordFieldErrors.confirmpassword}</p>
                  )}
                </div>
              </div>
              <div className="mt-8 flex gap-4 justify-center">
                <button
                  onClick={handleChangePassword}
                  disabled={changePasswordMutation.isPending}
                  className="px-8 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white font-semibold rounded-2xl hover:from-green-600 hover:to-teal-600 transition-all duration-300 transform hover:scale-105 shadow-lg disabled:opacity-50 disabled:cursor-not-allowed"
                >
                  {changePasswordMutation.isPending ? "Đang đổi..." : "Đổi mật khẩu"}
                </button>
                <button
                  onClick={() => { 
                    setShowChangePassword(false); 
                    setPasswordForm({ oldPassword: '', newPassword: '', confirmPassword: '' });
                    setPasswordFieldErrors({});
                  }}
                  className="px-8 py-3 bg-white/10 backdrop-blur-sm border border-white/20 text-white font-semibold rounded-2xl hover:bg-white/20 transition-all duration-300"
                >
                  Hủy
                </button>
              </div>
            </div>
          </div>
        )}
      </div>
    </div>
  );
};

export default ProfilePage;