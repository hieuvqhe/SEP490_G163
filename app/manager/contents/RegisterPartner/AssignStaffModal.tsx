import { useState } from 'react';
import { motion, AnimatePresence } from 'framer-motion';
import { X, UserCheck, Loader2, Search, Users } from 'lucide-react';
import type { ManagerStaff } from '@/apis/manager.staff.api';

interface AssignStaffModalProps {
  isOpen: boolean;
  onClose: () => void;
  onConfirm: (staffId: number) => void;
  staffList: ManagerStaff[];
  staffLoading: boolean;
  partnerName: string;
  isAssigning: boolean;
}

export const AssignStaffModal = ({
  isOpen,
  onClose,
  onConfirm,
  staffList,
  staffLoading,
  partnerName,
  isAssigning
}: AssignStaffModalProps) => {
  const [selectedStaffId, setSelectedStaffId] = useState<number | null>(null);
  const [searchTerm, setSearchTerm] = useState('');

  const handleConfirm = () => {
    if (selectedStaffId) {
      onConfirm(selectedStaffId);
    }
  };

  const handleClose = () => {
    if (!isAssigning) {
      setSelectedStaffId(null);
      setSearchTerm('');
      onClose();
    }
  };

  // Filter active staff only and by search term
  const filteredStaff = staffList
    .filter(staff => staff.isActive)
    .filter(staff => 
      staff.fullName.toLowerCase().includes(searchTerm.toLowerCase()) ||
      staff.email.toLowerCase().includes(searchTerm.toLowerCase())
    );

  return (
    <AnimatePresence>
      {isOpen && (
        <>
          <motion.div
            initial={{ opacity: 0 }}
            animate={{ opacity: 1 }}
            exit={{ opacity: 0 }}
            onClick={handleClose}
            className="fixed inset-0 z-50 bg-black/60 backdrop-blur-sm"
          />
          <motion.div
            initial={{ opacity: 0, scale: 0.95, y: 20 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            className="fixed left-1/2 top-1/2 z-50 w-full max-w-2xl -translate-x-1/2 -translate-y-1/2 rounded-2xl border border-white/10 bg-gradient-to-br from-gray-900/95 to-gray-800/95 p-6 shadow-2xl backdrop-blur-xl"
          >
            <div className="mb-6 flex items-start justify-between">
              <div className="flex items-center gap-3">
                <div className="flex h-12 w-12 items-center justify-center rounded-xl bg-blue-500/20 text-blue-400">
                  <Users size={24} />
                </div>
                <div>
                  <h3 className="text-xl font-semibold text-white">
                    Phân Staff Quản Lý
                  </h3>
                  <p className="mt-1 text-sm text-gray-400">
                    Chọn staff hệ thống để quản lý đối tác: <span className="font-medium text-white">{partnerName}</span>
                  </p>
                </div>
              </div>
              <button
                onClick={handleClose}
                disabled={isAssigning}
                className="rounded-lg p-2 text-gray-400 transition hover:bg-white/10 hover:text-white disabled:cursor-not-allowed disabled:opacity-50"
              >
                <X size={20} />
              </button>
            </div>

            {/* Search Box */}
            <div className="mb-4 relative">
              <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400" size={18} />
              <input
                type="text"
                placeholder="Tìm kiếm theo tên hoặc email..."
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                disabled={isAssigning}
                className="w-full rounded-lg border border-white/10 bg-white/5 py-2.5 pl-10 pr-4 text-sm text-white placeholder-gray-400 transition focus:border-blue-500/50 focus:outline-none focus:ring-2 focus:ring-blue-500/20 disabled:cursor-not-allowed disabled:opacity-50"
              />
            </div>

            {/* Staff List */}
            <div className="mb-6 max-h-96 overflow-y-auto rounded-lg border border-white/10 bg-white/5">
              {staffLoading ? (
                <div className="flex items-center justify-center gap-3 p-8 text-sm text-gray-300">
                  <div className="animate-spin">
                    <Loader2 size={20} className="text-blue-400" />
                  </div>
                  Đang tải danh sách staff...
                </div>
              ) : filteredStaff.length === 0 ? (
                <div className="p-8 text-center text-sm text-gray-400">
                  {searchTerm ? 'Không tìm thấy staff phù hợp' : 'Không có staff hệ thống nào khả dụng'}
                </div>
              ) : (
                <div className="divide-y divide-white/5">
                  {filteredStaff.map((staff) => (
                    <button
                      key={staff.managerStaffId}
                      onClick={() => setSelectedStaffId(staff.managerStaffId)}
                      disabled={isAssigning}
                      className={`w-full p-4 text-left transition hover:bg-white/10 disabled:cursor-not-allowed ${
                        selectedStaffId === staff.managerStaffId
                          ? 'bg-blue-500/20 border-l-4 border-blue-500'
                          : ''
                      }`}
                    >
                      <div className="flex items-center gap-3">
                        <div className="flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-white/10 text-sm font-semibold text-white">
                          {staff.fullName?.charAt(0)?.toUpperCase() || '?'}
                        </div>
                        <div className="flex-1">
                          <div className="flex items-center gap-2">
                            <span className="font-medium text-white">{staff.fullName}</span>
                            {selectedStaffId === staff.managerStaffId && (
                              <UserCheck size={16} className="text-blue-400" />
                            )}
                          </div>
                          <div className="mt-0.5 text-xs text-gray-400">{staff.email}</div>
                          <div className="mt-0.5 text-xs text-gray-500">
                            SĐT: {staff.phone} • Ngày vào: {new Date(staff.hireDate).toLocaleDateString('vi-VN')}
                          </div>
                        </div>
                      </div>
                    </button>
                  ))}
                </div>
              )}
            </div>

            {/* Action Buttons */}
            <div className="flex gap-3">
              <button
                onClick={handleClose}
                disabled={isAssigning}
                className="flex-1 rounded-lg border border-white/10 bg-white/5 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-white/10 disabled:cursor-not-allowed disabled:opacity-50"
              >
                Hủy
              </button>
              <button
                onClick={handleConfirm}
                disabled={!selectedStaffId || isAssigning}
                className="flex flex-1 items-center justify-center gap-2 rounded-lg bg-blue-500 px-4 py-2.5 text-sm font-semibold text-white transition hover:bg-blue-600 disabled:cursor-not-allowed disabled:opacity-50"
              >
                {isAssigning ? (
                  <>
                    <Loader2 size={16} className="animate-spin" />
                    Đang phân công...
                  </>
                ) : (
                  <>
                    <UserCheck size={16} />
                    Xác nhận phân công
                  </>
                )}
              </button>
            </div>
          </motion.div>
        </>
      )}
    </AnimatePresence>
  );
};
