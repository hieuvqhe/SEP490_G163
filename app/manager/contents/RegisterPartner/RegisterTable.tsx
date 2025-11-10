import { Loader2, CheckCircle, XCircle, ChevronLeft, ChevronRight, Eye } from 'lucide-react';

import type { PendingPartner } from '../../../../apis/manager.register';

interface RegisterTableProps {
  partners: PendingPartner[];
  partnersLoading: boolean;
  currentPage: number;
  totalPartners: number;
  limit: number;
  onApprovePartner: (partnerId: number) => void;
  onRejectPartner: (partnerId: number) => void;
  onViewPartner: (partner: PendingPartner) => void;
  onPageChange: (page: number) => void;
}

export const RegisterTable = ({
  partners,
  partnersLoading,
  currentPage,
  totalPartners,
  limit,
  onApprovePartner,
  onRejectPartner,
  onViewPartner,
  onPageChange
}: RegisterTableProps) => {
  const totalPages = Math.ceil(totalPartners / limit);

  if (partnersLoading) {
    return (
      <div className="rounded-2xl border border-white/10 bg-white/5 p-12 text-sm text-gray-300 backdrop-blur-lg shadow-lg">
        <div className="flex items-center justify-center gap-3">
          <div className="animate-spin">
            <Loader2 size={24} className="text-blue-400" />
          </div>
          Đang tải danh sách đối tác...
        </div>
      </div>
    );
  }

  return (
    <div className="overflow-hidden rounded-2xl border border-white/10 bg-white/5 backdrop-blur-lg shadow-lg">
      <div className="overflow-x-auto">
        <table className="min-w-full divide-y divide-white/10 text-left text-sm text-gray-200">
          <thead className="bg-white/5 text-xs uppercase tracking-wider text-gray-400">
            <tr>
              <th scope="col" className="px-6 py-3">Đối tác</th>
              <th scope="col" className="px-6 py-3">Thông tin liên hệ</th>
              <th scope="col" className="px-6 py-3">Thông tin doanh nghiệp</th>
              <th scope="col" className="px-6 py-3">Trạng thái</th>
              <th scope="col" className="px-6 py-3">Ngày đăng ký</th>
              <th scope="col" className="px-6 py-3 text-right">Hành động</th>
            </tr>
          </thead>
          <tbody className="divide-y divide-white/5">
            {partners.map((partner) => (
              <tr
                key={partner.partnerId}
                className="transition hover:bg-white/10"
              >
                <td className="px-6 py-4 font-medium text-white">
                  <div className="flex items-center gap-3">
                    <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-base font-semibold text-white">
                      {partner.partnerName?.charAt(0)?.toUpperCase() || '?'}
                    </div>
                    <div className="flex flex-col">
                      <span>{partner.partnerName}</span>
                      <span className="text-xs text-gray-400">ID: {partner.partnerId}</span>
                    </div>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-white">{partner.fullname}</span>
                    <span>{partner.userEmail}</span>
                    <span>{partner.userPhone}</span>
                  </div>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  <div className="flex flex-col gap-1 text-sm">
                    <span className="text-white">MST: {partner.taxCode}</span>
                    <span>{partner.address}</span>
                    <span>Hoa hồng: {partner.commissionRate}%</span>
                  </div>
                </td>
                <td className="px-6 py-4">
                  <span
                    className={`inline-flex items-center rounded-full px-3 py-1 text-xs font-medium ${
                      partner.status === 'pending'
                        ? 'bg-yellow-500/20 text-yellow-300 border border-yellow-500/30'
                        : partner.status === 'approved'
                        ? 'bg-emerald-500/20 text-emerald-300 border border-emerald-500/30'
                        : 'bg-red-500/20 text-red-300 border border-red-500/30'
                    }`}
                  >
                    {partner.status === 'pending'
                      ? 'Chờ duyệt'
                      : partner.status === 'approved'
                      ? 'Đã duyệt'
                      : 'Từ chối'}
                  </span>
                </td>
                <td className="px-6 py-4 text-gray-300">
                  {new Date(partner.createdAt).toLocaleDateString('vi-VN')}
                </td>
                <td className="px-6 py-4">
                  <div className="flex items-center justify-end gap-2 text-xs">
                    <button
                      onClick={() => onViewPartner(partner)}
                      className="flex w-28 items-center justify-center gap-2 rounded-lg bg-blue-500/20 px-3 py-2 font-semibold text-blue-200 transition hover:bg-blue-500/30"
                      title="Xem chi tiết"
                    >
                      <Eye size={14} />
                      Chi tiết
                    </button>
                    <button
                      onClick={() => onApprovePartner(partner.partnerId)}
                      className="flex w-28 items-center justify-center gap-2 rounded-lg bg-emerald-500/20 px-3 py-2 font-semibold text-emerald-200 transition hover:bg-emerald-500/30"
                      title="Duyệt đối tác"
                    >
                      <CheckCircle size={14} />
                      Duyệt
                    </button>
                    <button
                      onClick={() => onRejectPartner(partner.partnerId)}
                      className="flex w-28 items-center justify-center gap-2 rounded-lg bg-red-500/20 px-3 py-2 font-semibold text-red-200 transition hover:bg-red-500/30"
                      title="Từ chối đối tác"
                    >
                      <XCircle size={14} />
                      Từ chối
                    </button>
                  </div>
                </td>
              </tr>
            ))}
          </tbody>
        </table>
      </div>

      {totalPages > 1 && (
        <div
          className="flex items-center justify-between border-t border-white/10 bg-white/5 px-6 py-4 text-sm text-gray-300"
        >
          <span>
            Hiển thị {((currentPage - 1) * limit) + 1} - {Math.min(currentPage * limit, totalPartners)} trong tổng {totalPartners} đối tác
          </span>
          <div className="flex items-center gap-2">
            <button
              onClick={() => onPageChange(currentPage - 1)}
              disabled={currentPage === 1}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              <ChevronLeft size={14} />
              Trước
            </button>
            <span className="rounded-lg bg-blue-500/20 px-3 py-2 text-xs font-semibold text-blue-200">
              Trang {currentPage} / {totalPages}
            </span>
            <button
              onClick={() => onPageChange(currentPage + 1)}
              disabled={currentPage === totalPages}
              className="flex items-center gap-1 rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
            >
              Sau
              <ChevronRight size={14} />
            </button>
          </div>
        </div>
      )}
    </div>
  );
};