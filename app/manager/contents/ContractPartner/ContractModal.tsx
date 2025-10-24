import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

import { useCreateContract } from '@/apis/manager.contract.api';
import type { PartnerWithoutContract } from '@/apis/manager.contract.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

const CONTRACT_TYPES = ["partnership", "service", "standard", "premium"] as const;
const MIN_CONTRACT_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const contractFormBaseSchema = z.object({
  partnerId: z.number(),
  contractNumber: z.string().min(1, 'Không được để trống'),
  contractType: z.enum(CONTRACT_TYPES, { required_error: 'Vui lòng chọn loại hợp đồng' }),
  title: z.string().min(1, 'Không được để trống'),
  description: z.string().min(1, 'Không được để trống'),
  termsAndConditions: z.string().min(1, 'Không được để trống'),
  startDate: z.string().min(1, 'Không được để trống'),
  endDate: z.string().min(1, 'Không được để trống'),
  commissionRate: z.coerce.number({ invalid_type_error: 'Tỷ lệ không hợp lệ' }).min(0, 'Tỷ lệ không hợp lệ').max(50, 'Tỷ lệ không thể vượt quá 50%'),
  minimumRevenue: z.coerce.number({ invalid_type_error: 'Doanh thu không hợp lệ' }).min(1, 'Không được để trống'),
});

const createContractSchema = contractFormBaseSchema.superRefine((data: z.infer<typeof contractFormBaseSchema>, ctx: z.RefinementCtx) => {
  const today = new Date();
  today.setHours(0, 0, 0, 0);
  const start = new Date(data.startDate);
  const end = new Date(data.endDate);

  if (Number.isNaN(start.getTime())) {
    ctx.addIssue({ path: ['startDate'], code: z.ZodIssueCode.custom, message: 'Ngày bắt đầu không hợp lệ' });
  } else if (start < today) {
    ctx.addIssue({ path: ['startDate'], code: z.ZodIssueCode.custom, message: 'Ngày bắt đầu phải lớn hơn hoặc bằng hôm nay' });
  }

  if (Number.isNaN(end.getTime())) {
    ctx.addIssue({ path: ['endDate'], code: z.ZodIssueCode.custom, message: 'Ngày kết thúc không hợp lệ' });
    return;
  }

  if (end <= start) {
    ctx.addIssue({ path: ['endDate'], code: z.ZodIssueCode.custom, message: 'Ngày kết thúc phải lớn hơn ngày bắt đầu' });
    return;
  }

  if (end.getTime() - start.getTime() < MIN_CONTRACT_DURATION_MS) {
    ctx.addIssue({ path: ['endDate'], code: z.ZodIssueCode.custom, message: 'Thời gian hợp đồng ít nhất phải 1 tháng' });
  }
});

export type CreateContractForm = z.infer<typeof contractFormBaseSchema>;

interface CreateContractModalProps {
  partner: PartnerWithoutContract | null;
  open: boolean;
  onClose: () => void;
}

const defaultTerms = `ĐIỀU 1: PHẠM VI HỢP TÁC...
ĐIỀU 2: QUYỀN VÀ NGHĨA VỤ...
ĐIỀU 3: ĐIỀU KHOẢN TÀI CHÍNH...`;

const CreateContractModal = ({ partner, open, onClose }: CreateContractModalProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const createContractMutation = useCreateContract();

  const defaultValues = useMemo((): CreateContractForm => ({
    partnerId: partner?.partnerId || 0,
    contractNumber: partner ? `${partner.partnerName}_Contract` : '',
    contractType: 'partnership',
    title: 'HỢP ĐỒNG HỢP TÁC KINH DOANH',
    description: 'Hợp đồng hợp tác cung cấp dịch vụ vé xem phim',
    termsAndConditions: defaultTerms,
    startDate: '',
    endDate: '',
    commissionRate: 0,
    minimumRevenue: 1,
  }), [partner]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
  } = useForm<CreateContractForm>({
    resolver: zodResolver(createContractSchema),
    defaultValues,
  });

  useEffect(() => {
    if (open) {
      reset(defaultValues);
    }
  }, [open, defaultValues, reset]);

  const onSubmit = (values: CreateContractForm) => {
    if (!accessToken) {
      showToast('Vui lòng đăng nhập lại', undefined, 'error');
      return;
    }

    createContractMutation.mutate(
      {
        data: {
          partnerId: values.partnerId,
          contractNumber: values.contractNumber,
          contractType: values.contractType,
          title: values.title,
          description: values.description,
          termsAndConditions: values.termsAndConditions,
          startDate: values.startDate,
          endDate: values.endDate,
          commissionRate: values.commissionRate,
          minimumRevenue: values.minimumRevenue,
        },
        accessToken,
      },
      {
        onSuccess: () => {
          showToast('Tạo hợp đồng thành công!', undefined, 'success');
          queryClient.invalidateQueries({ queryKey: ['manager-partners-without-contracts'] });
          queryClient.invalidateQueries({ queryKey: ['manager-contracts'] });
          onClose();
        },
        onError: (error: any) => {
          showToast(error?.message || 'Đã có lỗi xảy ra', undefined, 'error');
        },
      }
    );
  };

  if (!open || !partner) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur-sm"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      onClick={onClose}
    >
      <motion.div
        className="w-full max-w-4xl mx-4 overflow-y-auto max-h-[90vh] rounded-2xl border border-white/10 bg-gradient-to-br from-slate-900/95 to-slate-950/95 p-8 text-white shadow-2xl"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.3 }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="flex items-center justify-between mb-6">
          <div>
            <h2 className="text-2xl font-semibold">Tạo hợp đồng mới</h2>
            <p className="text-sm text-gray-400">Đối tác: {partner.partnerName}</p>
          </div>
          <button
            onClick={onClose}
            className="rounded-full p-2 text-gray-400 hover:bg-white/10 hover:text-white transition"
          >
            <X size={20} />
          </button>
        </div>

        <form className="space-y-4" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('partnerId', { valueAsNumber: true })} />

          <div className="grid grid-cols-1 gap-4 md:grid-cols-2">
            <div>
              <label className="mb-2 block text-sm text-gray-300">Số hợp đồng</label>
              <input
                readOnly
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                {...register('contractNumber')}
              />
              {errors.contractNumber && <p className="mt-1 text-xs text-red-400">{errors.contractNumber.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Loại hợp đồng</label>
              <select
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                {...register('contractType')}
              >
                {CONTRACT_TYPES.map((type) => (
                  <option key={type} value={type} className="bg-slate-900 text-white">
                    {type}
                  </option>
                ))}
              </select>
              {errors.contractType && <p className="mt-1 text-xs text-red-400">{errors.contractType.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Tiêu đề</label>
              <input
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                placeholder="Nhập tiêu đề hợp đồng"
                {...register('title')}
              />
              {errors.title && <p className="mt-1 text-xs text-red-400">{errors.title.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Tỷ lệ hoa hồng (%)</label>
              <input
                type="number"
                step="0.1"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                {...register('commissionRate', { valueAsNumber: true })}
              />
              {errors.commissionRate && <p className="mt-1 text-xs text-red-400">{errors.commissionRate.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Ngày bắt đầu</label>
              <input
                type="date"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                {...register('startDate')}
              />
              {errors.startDate && <p className="mt-1 text-xs text-red-400">{errors.startDate.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Ngày kết thúc</label>
              <input
                type="date"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                {...register('endDate')}
              />
              {errors.endDate && <p className="mt-1 text-xs text-red-400">{errors.endDate.message}</p>}
            </div>

            <div>
              <label className="mb-2 block text-sm text-gray-300">Doanh thu tối thiểu</label>
              <input
                type="number"
                className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
                {...register('minimumRevenue', { valueAsNumber: true })}
              />
              {errors.minimumRevenue && <p className="mt-1 text-xs text-red-400">{errors.minimumRevenue.message}</p>}
            </div>
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Mô tả</label>
            <textarea
              rows={3}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
              {...register('description')}
            />
            {errors.description && <p className="mt-1 text-xs text-red-400">{errors.description.message}</p>}
          </div>

          <div>
            <label className="mb-2 block text-sm text-gray-300">Điều khoản hợp đồng</label>
            <textarea
              rows={6}
              className="w-full rounded-lg border border-white/10 bg-white/5 p-3 text-sm text-white"
              {...register('termsAndConditions')}
            />
            {errors.termsAndConditions && <p className="mt-1 text-xs text-red-400">{errors.termsAndConditions.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <button
              type="button"
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white hover:bg-white/10 transition"
            >
              Hủy
            </button>
            <button
              type="submit"
              disabled={createContractMutation.isPending}
              className="rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-black hover:bg-orange-400 transition disabled:cursor-not-allowed disabled:opacity-60"
            >
              {createContractMutation.isPending ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateContractModal;