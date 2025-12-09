import { useEffect, useMemo } from 'react';
import { motion } from 'framer-motion';
import { Calendar, DollarSign, FileText, FolderOpen, Layers, PenLine, Percent, PhoneCall, Receipt, Scroll, User2, X } from 'lucide-react';
import { useForm } from 'react-hook-form';
import { zodResolver } from '@hookform/resolvers/zod';
import { z } from 'zod';
import { useQueryClient } from '@tanstack/react-query';

import { ManagerContractApiError, useCreateContract } from '@/apis/manager.contract.api';
import type { PartnerWithoutContract } from '@/apis/manager.contract.api';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';

const CONTRACT_TYPES = ["partnership", "service", "standard", "premium"] as const;
const MIN_CONTRACT_DURATION_MS = 30 * 24 * 60 * 60 * 1000;

const sanitizePartnerSegment = (value: string | null | undefined): string => {
  if (!value || !value.trim()) {
    return "CTY";
  }

  const asciiValue = value
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/[^a-zA-Z0-9]/g, '')
    .toUpperCase();

  return asciiValue.slice(0, 5) || "CTY";
};

const buildDefaultContractNumber = (partner: PartnerWithoutContract | null): string => {
  if (!partner) {
    return '';
  }

  const now = new Date();
  const year = now.getFullYear();
  const sequence = String(Math.floor(Math.random() * 1000)).padStart(3, '0');
  const companySegment = sanitizePartnerSegment(partner.partnerName);

  return `HD-${year}-${sequence}-${companySegment}`;
};

const contractFormBaseSchema = z.object({
  partnerId: z.number(),
  contractNumber: z.string().min(1, 'Không được để trống'),
  contractType: z.enum(CONTRACT_TYPES, { required_error: 'Vui lòng chọn loại hợp đồng' }),
  title: z.string().min(1, 'Không được để trống'),
  description: z.string().min(1, 'Không được để trống'),
  termsAndConditions: z.string().min(1, 'Không được để trống'),
  startDate: z.string().min(1, 'Không được để trống'),
  endDate: z.string().min(1, 'Không được để trống'),
  commissionRate: z.coerce.number({ invalid_type_error: 'Tỷ lệ không hợp lệ' }).min(0.01, 'Tỷ lệ phải lớn hơn 0').max(100, 'Tỷ lệ không thể vượt quá 100%'),
  minimumRevenue: z.coerce.number({ invalid_type_error: 'Doanh thu không hợp lệ' }).min(1000000, 'Doanh thu tối thiểu phải từ 1,000,000 trở lên'),
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

const defaultTerms = ``;

const CreateContractModal = ({ partner, open, onClose }: CreateContractModalProps) => {
  const { accessToken } = useAuthStore();
  const { showToast } = useToast();
  const queryClient = useQueryClient();
  const createContractMutation = useCreateContract();

  const defaultValues = useMemo((): CreateContractForm => ({
    partnerId: partner?.partnerId || 0,
    contractNumber: buildDefaultContractNumber(partner),
    contractType: 'partnership',
    title: 'HỢP ĐỒNG HỢP TÁC KINH DOANH',
    description: 'Hợp đồng hợp tác cung cấp dịch vụ vé xem phim',
    termsAndConditions: defaultTerms,
    startDate: '',
    endDate: '',
    commissionRate: '' as any,
    minimumRevenue: '' as any,
  }), [partner]);

  const {
    register,
    handleSubmit,
    formState: { errors },
    reset,
    setError,
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
        onError: (error: unknown) => {
          const apiError = error instanceof ManagerContractApiError ? error : undefined;
          const title = apiError?.message?.trim() || 'Đã có lỗi xảy ra';
          let fieldErrors: Record<string, string> | undefined;

          const normalizeFieldName = (field: string): keyof CreateContractForm | undefined => {
            const normalized = field.trim().toLowerCase();

            switch (normalized) {
              case 'partnerid':
              case 'partner_id':
                return 'partnerId';
              case 'contractnumber':
              case 'contract_number':
                return 'contractNumber';
              case 'contracttype':
              case 'contract_type':
                return 'contractType';
              case 'title':
                return 'title';
              case 'description':
                return 'description';
              case 'termsandconditions':
              case 'terms_and_conditions':
              case 'terms':
                return 'termsAndConditions';
              case 'startdate':
              case 'start_date':
                return 'startDate';
              case 'enddate':
              case 'end_date':
                return 'endDate';
              case 'commissionrate':
              case 'commission_rate':
                return 'commissionRate';
              case 'minimumrevenue':
              case 'minimum_revenue':
                return 'minimumRevenue';
              default:
                return undefined;
            }
          };

          const extractErrorMessage = (value: unknown): string | undefined => {
            if (!value) return undefined;
            if (typeof value === 'string') return value;

            if (Array.isArray(value) && value.length > 0) {
              const first = value[0];
              if (typeof first === 'string') return first;
              if (first && typeof first === 'object') {
                const candidate = (first as { msg?: string; message?: string; error?: string }).msg
                  || (first as { msg?: string; message?: string; error?: string }).message
                  || (first as { msg?: string; message?: string; error?: string }).error;
                if (candidate) return candidate;
                return JSON.stringify(first);
              }
              return String(first);
            }

            if (typeof value === 'object') {
              const obj = value as { msg?: string; message?: string; error?: string; detail?: string };
              return obj.msg || obj.message || obj.error || obj.detail || JSON.stringify(value);
            }

            return String(value);
          };

          if (apiError?.errors && typeof apiError.errors === 'object') {
            const parsed: Record<string, string> = {};
            Object.entries(apiError.errors).forEach(([field, value]) => {
              if (!value) return;
              const message = extractErrorMessage(value);
              if (!message) return;

              const normalizedField = normalizeFieldName(field);
              if (normalizedField) {
                setError(normalizedField, { type: 'server', message });
              }

              parsed[normalizedField ?? field] = message;
            });

            if (Object.keys(parsed).length > 0) {
              fieldErrors = parsed;
            }
          }

          const detailMessage = fieldErrors
            ? Object.entries(fieldErrors)
                .map(([field, message]) => `${field}: ${message}`)
                .join('\n')
            : apiError?.detail;

          showToast(title, detailMessage, 'error');
        },
      }
    );
  };

  if (!open || !partner) return null;

  return (
    <motion.div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
    >
      <motion.div
        className="mx-4 w-full max-w-5xl overflow-y-auto max-h-[92vh] rounded-2xl border border-white/10 bg-white/10 p-10 text-white shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8, y: 40 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        transition={{ duration: 0.35, ease: 'easeOut' }}
      >
        <div className="mb-8 flex items-start justify-between">
          <div>
            <h2 className="font-heading text-2xl font-semibold text-white">Tạo hợp đồng mới</h2>
            <p className="mt-1 font-body text-sm text-gray-300">Đối tác: {partner.partnerName}</p>
          </div>
          <motion.button
            onClick={onClose}
            className="font-body rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={22} />
          </motion.button>
        </div>

        <form className="space-y-6" onSubmit={handleSubmit(onSubmit)}>
          <input type="hidden" {...register('partnerId', { valueAsNumber: true })} />

          <div className="grid grid-cols-1 gap-6 lg:grid-cols-3">
            <div className="space-y-4">
              <h4 className="border-b border-white/10 pb-2 font-heading text-lg font-semibold text-white">
                Thông tin hợp đồng
              </h4>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Số hợp đồng</label>
                <div className="relative">
                  <Receipt className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-emerald-400" />
                  <input
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    placeholder="VD: HD-2024-001"
                    autoComplete="off"
                    {...register('contractNumber')}
                  />
                </div>
                {errors.contractNumber && <p className="text-xs text-red-400">{errors.contractNumber.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Loại hợp đồng</label>
                <div className="relative">
                  <Layers className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-400" />
                  <select
                    className="w-full appearance-none rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-10 text-sm text-white"
                    {...register('contractType')}
                  >
                    {CONTRACT_TYPES.map((type) => (
                      <option key={type} value={type} className="bg-slate-900 text-white">
                        {type}
                      </option>
                    ))}
                  </select>
                </div>
                {errors.contractType && <p className="text-xs text-red-400">{errors.contractType.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Tiêu đề</label>
                <div className="relative">
                  <PenLine className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-purple-400" />
                  <input
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    placeholder="Nhập tiêu đề hợp đồng"
                    {...register('title')}
                  />
                </div>
                {errors.title && <p className="text-xs text-red-400">{errors.title.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="border-b border-white/10 pb-2 font-heading text-lg font-semibold text-white">
                Thông tin tài chính
              </h4>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Tỷ lệ hoa hồng (%)</label>
                <div className="relative">
                  <Percent className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-orange-400" />
                  <input
                    type="text"
                    inputMode="decimal"
                    placeholder="Nhập tỷ lệ (0-100)"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    {...register('commissionRate', { 
                      valueAsNumber: true,
                      setValueAs: (v) => v === '' ? undefined : parseFloat(v)
                    })}
                    onKeyDown={(e) => {
                      if (!/[0-9.]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                    onInput={(e) => {
                      const input = e.currentTarget;
                      const value = parseFloat(input.value);
                      if (!isNaN(value) && value > 100) {
                        input.value = '100';
                      }
                    }}
                  />
                </div>
                {errors.commissionRate && <p className="text-xs text-red-400">{errors.commissionRate.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Doanh thu tối thiểu</label>
                <div className="relative">
                  <DollarSign className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-green-400" />
                  <input
                    type="text"
                    inputMode="numeric"
                    placeholder="Tối thiểu 1,000,000 VNĐ"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    {...register('minimumRevenue', { 
                      valueAsNumber: true,
                      setValueAs: (v) => v === '' ? undefined : parseInt(v, 10)
                    })}
                    onKeyDown={(e) => {
                      if (!/[0-9]/.test(e.key) && !['Backspace', 'Delete', 'Tab', 'ArrowLeft', 'ArrowRight'].includes(e.key)) {
                        e.preventDefault();
                      }
                    }}
                  />
                </div>
                {errors.minimumRevenue && <p className="text-xs text-red-400">{errors.minimumRevenue.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Ngày bắt đầu</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-sky-400" />
                  <input
                    type="date"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white"
                    {...register('startDate')}
                  />
                </div>
                {errors.startDate && <p className="text-xs text-red-400">{errors.startDate.message}</p>}
              </div>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Ngày kết thúc</label>
                <div className="relative">
                  <Calendar className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-rose-400" />
                  <input
                    type="date"
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white"
                    {...register('endDate')}
                  />
                </div>
                {errors.endDate && <p className="text-xs text-red-400">{errors.endDate.message}</p>}
              </div>
            </div>

            <div className="space-y-4">
              <h4 className="border-b border-white/10 pb-2 font-heading text-lg font-semibold text-white">
                Thông tin đối tác
              </h4>

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Tên đối tác</label>
                <div className="relative">
                  <User2 className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-blue-300" />
                  <input
                    readOnly
                    value={partner.partnerName}
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white"
                  />
                </div>
              </div>

  

              <div className="space-y-3">
                <label className="font-body text-sm text-gray-300">Ghi chú</label>
                <div className="relative">
                  <FolderOpen className="absolute left-4 top-3 h-5 w-5 text-gray-300" />
                  <textarea
                    rows={3}
                    className="w-full rounded-lg border border-white/10 bg-white/5 py-3 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                    placeholder="Ghi chú thêm (không bắt buộc)"
                    {...register('description')}
                  />
                </div>
                {errors.description && <p className="text-xs text-red-400">{errors.description.message}</p>}
              </div>
            </div>
          </div>

          <div className="space-y-3">
            <label className="font-body text-sm text-gray-300">Chú thích hợp đồng</label>
            <div className="relative">
              <Scroll className="absolute left-4 top-4 h-5 w-5 text-indigo-300" />
              <textarea
                rows={8}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-4 pl-12 pr-4 text-sm text-white placeholder:text-gray-400"
                {...register('termsAndConditions')}
              />
            </div>
            {errors.termsAndConditions && <p className="text-xs text-red-400">{errors.termsAndConditions.message}</p>}
          </div>

          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="font-body rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-sm text-white transition hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hủy
            </motion.button>
            <motion.button
              type="submit"
              disabled={createContractMutation.isPending}
              className="flex items-center gap-2 rounded-lg bg-emerald-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-emerald-400 disabled:cursor-not-allowed disabled:opacity-60"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <FileText size={18} />
              {createContractMutation.isPending ? 'Đang tạo...' : 'Tạo hợp đồng'}
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};

export default CreateContractModal;