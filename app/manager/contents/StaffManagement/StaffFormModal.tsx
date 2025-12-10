"use client";

import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X, User, Mail, Phone, Calendar, Shield, Loader2 } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';

import {
  useCreateManagerStaff,
  useUpdateManagerStaff,
  useGetManagerStaffById,
  type CreateManagerStaffRequest,
  type UpdateManagerStaffRequest,
  ManagerStaffError
} from '@/apis/manager.staff.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

const createStaffSchema = z.object({
  fullName: z.string().min(1, 'Không được để trống').min(3, 'Tên phải có ít nhất 3 ký tự'),
  email: z.string().min(1, 'Không được để trống').email('Email không hợp lệ'),
  phone: z.string().min(1, 'Không được để trống').regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),
  password: z.string().min(8, 'Mật khẩu phải có ít nhất 8 ký tự')
    .regex(/[A-Z]/, 'Mật khẩu phải có ít nhất 1 chữ hoa')
    .regex(/[a-z]/, 'Mật khẩu phải có ít nhất 1 chữ thường')
    .regex(/[0-9]/, 'Mật khẩu phải có ít nhất 1 chữ số')
    .regex(/[@$!%*?&#]/, 'Mật khẩu phải có ít nhất 1 ký tự đặc biệt'),
  confirmPassword: z.string().min(1, 'Không được để trống'),
  roleType: z.literal('ManagerStaff'),
  hireDate: z.string().min(1, 'Không được để trống'),
}).refine((data) => data.password === data.confirmPassword, {
  message: 'Mật khẩu xác nhận không khớp',
  path: ['confirmPassword'],
});

const updateStaffSchema = z.object({
  fullName: z.string().min(1, 'Không được để trống').min(3, 'Tên phải có ít nhất 3 ký tự'),
  phone: z.string().min(1, 'Không được để trống').regex(/^0\d{9}$/, 'Số điện thoại phải có 10 chữ số và bắt đầu bằng 0'),
  roleType: z.literal('ManagerStaff'),
  isActive: z.boolean(),
});

type CreateStaffForm = z.infer<typeof createStaffSchema>;
type UpdateStaffForm = z.infer<typeof updateStaffSchema>;

interface StaffFormModalProps {
  mode: 'create' | 'edit';
  staffId?: number;
  open: boolean;
  onClose: () => void;
}

const StaffFormModal = ({ mode, staffId, open, onClose }: StaffFormModalProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();

  const createMutation = useCreateManagerStaff();
  const updateMutation = useUpdateManagerStaff();
  const { data: staffData, isLoading: isLoadingStaff } = useGetManagerStaffById(
    staffId!,
    mode === 'edit' ? accessToken ?? undefined : undefined
  );

  const isCreate = mode === 'create';
  const schema = isCreate ? createStaffSchema : updateStaffSchema;

  const defaultValues = useMemo(() => {
    if (isCreate) {
      return {
        fullName: '',
        email: '',
        phone: '',
        password: '',
        confirmPassword: '',
        roleType: 'ManagerStaff' as const,
        hireDate: new Date().toISOString().split('T')[0],
      };
    }

    if (staffData?.result) {
      return {
        fullName: staffData.result.fullName,
        phone: staffData.result.phone,
        roleType: 'ManagerStaff' as const,
        isActive: staffData.result.isActive,
      };
    }

    return {
      fullName: '',
      phone: '',
      roleType: 'ManagerStaff' as const,
      isActive: true,
    };
  }, [isCreate, staffData]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
  } = useForm<CreateStaffForm | UpdateStaffForm>({
    resolver: zodResolver(schema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = (values: CreateStaffForm | UpdateStaffForm) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập lại', undefined, 'error');
      return;
    }

    if (isCreate) {
      const createData = values as CreateStaffForm;
      createMutation.mutate(
        { data: createData, accessToken },
        {
          onSuccess: (response) => {
            showToast(response.message || 'Tạo nhân viên thành công', undefined, 'success');
            onClose();
          },
          onError: (error: unknown) => {
            const staffError = error instanceof ManagerStaffError ? error : undefined;
            const title = staffError?.message?.trim() || 'Đã có lỗi xảy ra';

            if (staffError?.errors) {
              Object.entries(staffError.errors).forEach(([field, value]) => {
                const message = typeof value === 'string' ? value : JSON.stringify(value);
                const normalizedField = field.toLowerCase();

                if (normalizedField.includes('fullname')) setError('fullName', { message });
                else if (normalizedField.includes('email')) setError('email', { message });
                else if (normalizedField.includes('phone')) setError('phone', { message });
                else if (normalizedField.includes('password')) setError('password', { message });
              });
            }

            showToast(title, staffError?.detail, 'error');
          }
        }
      );
    } else {
      const updateData = values as UpdateStaffForm;
      updateMutation.mutate(
        { staffId: staffId!, data: updateData, accessToken },
        {
          onSuccess: (response) => {
            showToast(response.message || 'Cập nhật nhân viên thành công', undefined, 'success');
            onClose();
          },
          onError: (error: unknown) => {
            const staffError = error instanceof ManagerStaffError ? error : undefined;
            const title = staffError?.message?.trim() || 'Đã có lỗi xảy ra';

            if (staffError?.errors) {
              Object.entries(staffError.errors).forEach(([field, value]) => {
                const message = typeof value === 'string' ? value : JSON.stringify(value);
                const normalizedField = field.toLowerCase();

                if (normalizedField.includes('fullname')) setError('fullName', { message });
                else if (normalizedField.includes('phone')) setError('phone', { message });
              });
            }

            showToast(title, staffError?.detail, 'error');
          }
        }
      );
    }
  };

  if (!open) return null;

  if (mode === 'edit' && isLoadingStaff) {
    return (
      <motion.div
        className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
        initial={{ opacity: 0 }}
        animate={{ opacity: 1 }}
        exit={{ opacity: 0 }}
      >
        <div className="flex flex-col items-center gap-3 rounded-2xl border border-white/10 bg-white/5 p-8 backdrop-blur-xl">
          <Loader2 className="h-12 w-12 animate-spin text-emerald-500" />
          <p className="font-body text-sm text-gray-400">Đang tải thông tin nhân viên...</p>
        </div>
      </motion.div>
    );
  }

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-4 w-full max-w-2xl overflow-y-auto max-h-[92vh] rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-6 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">
              {isCreate ? 'Tạo nhân viên mới' : 'Chỉnh sửa nhân viên'}
            </h2>
            <p className="mt-1 font-body text-sm text-gray-300">
              {isCreate ? 'Điền thông tin để tạo tài khoản Manager Staff' : 'Cập nhật thông tin nhân viên'}
            </p>
          </div>
          <motion.button
            onClick={onClose}
            className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        <form className="space-y-5" onSubmit={handleSubmit(onSubmit)}>
          {/* Full Name */}
          <div className="space-y-2">
            <label className="font-body text-sm text-gray-300">Họ và Tên</label>
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-indigo-400" />
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                placeholder="Nhập họ và tên"
                {...register('fullName')}
              />
            </div>
            {errors.fullName && <p className="text-xs text-red-400">{errors.fullName.message}</p>}
          </div>

          {/* Email (Create only) */}
          {isCreate && (
            <div className="space-y-2">
              <label className="font-body text-sm text-gray-300">Email</label>
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
              <input
                  type="email"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                  placeholder="example@domain.com"
                  {...register('email' as any)}
                />
              </div>
              {'email' in errors && errors.email && <p className="text-xs text-red-400">{errors.email.message}</p>}
            </div>
          )}

          {/* Phone */}
          <div className="space-y-2">
            <label className="font-body text-sm text-gray-300">Số điện thoại</label>
            <div className="relative">
              <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />
              <input
                type="tel"
                className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                placeholder="0xxxxxxxxx"
                {...register('phone')}
              />
            </div>
            {errors.phone && <p className="text-xs text-red-400">{errors.phone.message}</p>}
          </div>

          {/* Password (Create only) */}
          {isCreate && (
            <>
              <div className="space-y-2">
                <label className="font-body text-sm text-gray-300">Mật khẩu</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <input
                    type="password"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    placeholder="Tối thiểu 8 ký tự, gồm chữ hoa, thường, số và ký tự đặc biệt"
                    {...register('password' as any)}
                  />
                </div>
                {'password' in errors && errors.password && <p className="text-xs text-red-400">{errors.password.message}</p>}
              </div>

              <div className="space-y-2">
                <label className="font-body text-sm text-gray-300">Xác nhận mật khẩu</label>
                <div className="relative">
                  <Shield className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <input
                    type="password"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    placeholder="Nhập lại mật khẩu"
                    {...register('confirmPassword' as any)}
                  />
                </div>
                {'confirmPassword' in errors && errors.confirmPassword && <p className="text-xs text-red-400">{errors.confirmPassword.message}</p>}
              </div>
            </>
          )}

          {/* Hire Date (Create only) */}
          {isCreate && (
            <div className="space-y-2">
              <label className="font-body text-sm text-gray-300">Ngày tuyển dụng</label>
              <div className="relative">
                <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                <input
                  type="date"
                  className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white"
                  {...register('hireDate' as any)}
                />
              </div>
              {'hireDate' in errors && errors.hireDate && <p className="text-xs text-red-400">{errors.hireDate.message}</p>}
            </div>
          )}

          {/* Role Type (Hidden) */}
          <input type="hidden" {...register('roleType')} value="ManagerStaff" />

          {/* Is Active (Edit only) */}
          {!isCreate && (
            <div className="flex items-center gap-3">
              <input
                type="checkbox"
                id="isActive"
                className="h-4 w-4 rounded border-white/10 bg-white/5 text-emerald-500 focus:ring-emerald-500"
                {...register('isActive' as any)}
              />
              <label htmlFor="isActive" className="font-body text-sm text-gray-300">
                Tài khoản đang hoạt động
              </label>
            </div>
          )}

          {/* Actions */}
          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-5 py-2 font-body text-sm text-white transition hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hủy
            </motion.button>
            <motion.button
              type="submit"
              disabled={createMutation.isPending || updateMutation.isPending}
              className="rounded-lg bg-gradient-to-r from-emerald-500 to-teal-600 px-6 py-2 font-body font-semibold text-white transition hover:from-emerald-600 hover:to-teal-700 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              {createMutation.isPending || updateMutation.isPending
                ? 'Đang xử lý...'
                : isCreate
                ? 'Tạo nhân viên'
                : 'Cập nhật'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default StaffFormModal;
