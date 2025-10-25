import React, { useState } from 'react';
import { X, CheckCircle, XCircle, User, Mail, Phone, MapPin, Building, FileText, Image } from 'lucide-react';
import type { LucideIcon } from 'lucide-react';

import { motion } from 'framer-motion';
import type { PendingPartner } from '../../../../apis/manager.register';

interface PartnerDetailModalProps {
  partner: PendingPartner;
  onClose: () => void;
}

interface DocumentPreviewCardProps {
  title: string;
  url: string;
  Icon: LucideIcon;
  accentColor: string;
  alt: string;
}

const DocumentPreviewCard = ({ title, url, Icon, accentColor, alt }: DocumentPreviewCardProps) => (
  <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur-lg">
    <div className="mb-3 flex items-center gap-3">
      <Icon size={20} className={accentColor} />
      <p className="font-body text-sm font-medium text-white">{title}</p>
    </div>
    <a
      href={url}
      target="_blank"
      rel="noopener noreferrer"
      className="block group"
    >
      <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40">
        <img
          src={url}
          alt={alt}
          className="h-48 w-full object-cover transition-transform duration-300 group-hover:scale-105"
        />
        <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 font-body">
          Nhấp để xem kích thước lớn
        </div>
      </div>
    </a>
  </div>
);

export const PartnerDetailModal = ({ partner, onClose }: PartnerDetailModalProps) => {
  const theaterPhotoUrls = partner.theaterPhotosUrl
    ?.split(";")
    .map((url) => url.trim())
    .filter((url) => url.length > 0);

  return (
    <motion.div 
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
      initial={{ opacity: 0 }}
      animate={{ opacity: 1 }}
      exit={{ opacity: 0 }}
      transition={{ duration: 0.3 }}
      onClick={onClose}
    >
      <motion.div 
        className="mx-4 w-full max-w-5xl overflow-y-auto max-h-[92vh] rounded-2xl border border-white/10 bg-white/10 p-10 text-white shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        {/* Header */}
        <motion.div 
          className="mb-6 flex items-center justify-between"
          initial={{ opacity: 0, y: -20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.2, duration: 0.3 }}
        >
          <h3 className="font-heading text-2xl font-semibold text-white">
            Chi tiết đối tác
          </h3>
          <motion.button 
            onClick={onClose} 
            className="font-body rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </motion.div>
        
        <motion.div 
          className="space-y-6 text-sm text-gray-200"
          initial={{ opacity: 0, y: 20 }}
          animate={{ opacity: 1, y: 0 }}
          transition={{ delay: 0.3, duration: 0.4 }}
        >
          <div className="grid grid-cols-1 md:grid-cols-2 xl:grid-cols-3 gap-6">
            {/* Basic Information */}
            <div className="space-y-4">
              <h4 className="border-b border-white/10 pb-2 font-heading text-lg font-semibold text-white">
                Thông tin cơ bản
              </h4>
              
              <div className="flex items-center space-x-3">
                <User size={20} className="text-blue-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Tên đối tác</p>
                  <p className="text-white font-body break-words">{partner.partnerName}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <User size={20} className="text-green-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Họ tên người liên hệ</p>
                  <p className="text-white font-body break-words">{partner.fullname}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Mail size={20} className="text-purple-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Email</p>
                  <p className="text-white font-body break-words">{partner.userEmail}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <Phone size={20} className="text-orange-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Số điện thoại</p>
                  <p className="text-white font-body">{partner.userPhone}</p>
                </div>
              </div>
            </div>
            
            {/* Business Information */}
            <div className="space-y-4">
              <h4 className="border-b border-white/10 pb-2 font-heading text-lg font-semibold text-white">
                Thông tin doanh nghiệp
              </h4>
              
              <div className="flex items-center space-x-3">
                <Building size={20} className="text-indigo-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Mã số thuế</p>
                  <p className="text-white font-body">{partner.taxCode}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <MapPin size={20} className="text-red-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Địa chỉ</p>
                  <p className="text-white font-body break-words">{partner.address}</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-yellow-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Tỷ lệ hoa hồng</p>
                  <p className="text-white font-body">{partner.commissionRate}%</p>
                </div>
              </div>
              
              <div className="flex items-center space-x-3">
                <FileText size={20} className="text-cyan-400 flex-shrink-0" />
                <div className="min-w-0 flex-1">
                  <p className="text-gray-400 text-sm font-body">Trạng thái</p>
                  <span className={`px-3 py-1 rounded-full text-sm font-medium font-body ${
                    partner.status === 'pending'
                      ? 'bg-yellow-500/20 text-yellow-400 border border-yellow-500/30'
                      : partner.status === 'approved'
                      ? 'bg-green-500/20 text-green-400 border border-green-500/30'
                      : 'bg-red-500/20 text-red-400 border border-red-500/30'
                  }`}>
                    {partner.status === 'pending' ? 'Chờ duyệt' : 
                     partner.status === 'approved' ? 'Đã duyệt' : 'Từ chối'}
                  </span>
                </div>
              </div>
            </div>
          </div>
          
          {/* Documents */}
          <div className="mt-6">
            <h4 className="mb-4 border-b border-white/10 pb-2 font-heading text-lg font-semibold text-white">
              Tài liệu đính kèm
            </h4>
            
            <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4">
              {partner.businessRegistrationCertificateUrl && (
                <DocumentPreviewCard
                  title="Giấy phép kinh doanh"
                  url={partner.businessRegistrationCertificateUrl}
                  Icon={FileText}
                  accentColor="text-blue-400"
                  alt="Giấy phép kinh doanh của đối tác"
                />
              )}

              {partner.taxRegistrationCertificateUrl && (
                <DocumentPreviewCard
                  title="Giấy đăng ký thuế"
                  url={partner.taxRegistrationCertificateUrl}
                  Icon={FileText}
                  accentColor="text-green-400"
                  alt="Giấy đăng ký thuế của đối tác"
                />
              )}

              {partner.identityCardUrl && (
                <DocumentPreviewCard
                  title="CMND/CCCD"
                  url={partner.identityCardUrl}
                  Icon={FileText}
                  accentColor="text-purple-400"
                  alt="CMND hoặc CCCD của đối tác"
                />
              )}

              {theaterPhotoUrls && theaterPhotoUrls.length > 0 && (
                <div className="rounded-xl border border-white/10 bg-white/5 p-4 text-white backdrop-blur-lg col-span-full">
                  <div className="mb-3 flex items-center gap-3">
                    <Image size={20} className="text-orange-400" />
                    <p className="font-body text-sm font-medium text-white">Hình ảnh rạp chiếu</p>
                  </div>

                  <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-3">
                    {theaterPhotoUrls.map((url, index) => (
                      <a
                        key={`${url}-${index}`}
                        href={url}
                        target="_blank"
                        rel="noopener noreferrer"
                        className="group block"
                      >
                        <div className="relative overflow-hidden rounded-lg border border-white/10 bg-black/40">
                          <img
                            src={url}
                            alt={`Hình ảnh rạp chiếu của đối tác ${index + 1}`}
                            className="h-40 w-full object-cover transition-transform duration-300 group-hover:scale-105"
                          />
                          <div className="absolute inset-0 flex items-center justify-center bg-black/60 text-xs text-white opacity-0 transition-opacity group-hover:opacity-100 font-body">
                            Nhấp để xem kích thước lớn
                          </div>
                        </div>
                      </a>
                    ))}
                  </div>
                </div>
              )}
            </div>
          </div>
        </motion.div>
      </motion.div>
    </motion.div>
  );
};

interface ApproveConfirmModalProps {
  partner: PendingPartner;
  onClose: () => void;
  onConfirm: () => void;
}

export const ApproveConfirmModal = ({ partner, onClose, onConfirm }: ApproveConfirmModalProps) => (
  <motion.div 
    className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
    initial={{ opacity: 0 }}
    animate={{ opacity: 1 }}
    exit={{ opacity: 0 }}
    transition={{ duration: 0.3 }}
    onClick={onClose}
  >
    <motion.div 
      className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl"
      initial={{ opacity: 0, scale: 0.8, y: 50 }}
      animate={{ opacity: 1, scale: 1, y: 0 }}
      exit={{ opacity: 0, scale: 0.8, y: 50 }}
      transition={{ duration: 0.4, ease: "easeOut" }}
      onClick={(e) => e.stopPropagation()}
    >
      <div className="mb-6 flex items-center justify-between">
        <h3 className="font-heading text-xl font-semibold text-white">Xác nhận duyệt đối tác</h3>
        <motion.button 
          onClick={onClose} 
          className="font-body rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
          whileHover={{ scale: 1.1, rotate: 90 }}
          whileTap={{ scale: 0.9 }}
        >
          <X size={24} />
        </motion.button>
      </div>
      
      <div className="mb-6 text-sm text-gray-200">
        <p className="mb-4 font-body">
          Bạn có chắc chắn muốn duyệt đối tác này không?
        </p>
        <div className="rounded-xl border border-white/10 bg-white/5 p-4 font-body">
          <p className="text-white font-medium">{partner.partnerName}</p>
          <p className="text-sm text-gray-300">{partner.userEmail}</p>
          <p className="text-sm text-gray-300">MST: {partner.taxCode}</p>
        </div>
        <p className="mt-3 text-sm text-emerald-300 font-body">
          Đối tác sẽ được kích hoạt và có thể sử dụng hệ thống.
        </p>
      </div>
      
      <div className="flex justify-end gap-3">
        <motion.button
          onClick={onClose}
          className="font-body rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          Hủy
        </motion.button>
        <motion.button
          onClick={onConfirm}
          className="flex items-center gap-2 rounded-lg bg-emerald-500 px-4 py-2 font-body font-semibold text-slate-900 transition hover:bg-emerald-400"
          whileHover={{ scale: 1.05 }}
          whileTap={{ scale: 0.95 }}
        >
          <CheckCircle size={16} />
          Duyệt đối tác
        </motion.button>
      </div>
    </motion.div>
  </motion.div>
);

interface RejectConfirmModalProps {
  partner: PendingPartner;
  onClose: () => void;
  onConfirm: (rejectionReason: string) => void;
}

export const RejectConfirmModal = ({ partner, onClose, onConfirm }: RejectConfirmModalProps) => {
  const [rejectionReason, setRejectionReason] = useState('');

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (rejectionReason.trim()) {
      onConfirm(rejectionReason.trim());
    }
  };

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
        className="mx-4 w-full max-w-md rounded-2xl border border-white/10 bg-white/10 p-6 text-white shadow-2xl backdrop-blur-xl"
        initial={{ opacity: 0, scale: 0.8, y: 50 }}
        animate={{ opacity: 1, scale: 1, y: 0 }}
        exit={{ opacity: 0, scale: 0.8, y: 50 }}
        transition={{ duration: 0.4, ease: "easeOut" }}
        onClick={(e) => e.stopPropagation()}
      >
        <div className="mb-6 flex items-center justify-between">
          <h3 className="font-heading text-xl短 font-semibold text-white">Xác nhận từ chối đối tác</h3>
          <motion.button 
            onClick={onClose} 
            className="font-body rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition-all duration-300 hover:bg-white/10 hover:text-white"
            whileHover={{ scale: 1.1, rotate: 90 }}
            whileTap={{ scale: 0.9 }}
          >
            <X size={24} />
          </motion.button>
        </div>
        
        <form onSubmit={handleSubmit} className="space-y-4 text-sm text-gray-200">
          <div className="mb-4">
            <p className="mb-3 font-body">
              Bạn có chắc chắn muốn từ chối đối tác này không?
            </p>
            <div className="rounded-xl border border-white/10 bg-white/5 p-4 font-body">
              <p className="text-white font-medium">{partner.partnerName}</p>
              <p className="text-sm text-gray-300">{partner.userEmail}</p>
              <p className="text-sm text-gray-300">MST: {partner.taxCode}</p>
            </div>
          </div>
          
          <div>
            <label className="mb-2 block font-body text-xs font-medium uppercase tracking-wide text-gray-300">
              Lý do từ chối *
            </label>
            <textarea
              value={rejectionReason}
              onChange={(e) => setRejectionReason(e.target.value)}
              className="font-body w-full rounded-lg border border-white/10 bg-white/5 px-3 py-2 text-white placeholder:text-gray-500 focus:outline-none focus:border-red-400"
              rows={3}
              placeholder="Nhập lý do từ chối..."
              required
            />
          </div>
          
          <p className="font-body text-sm text-red-300">
            Đối tác sẽ được thông báo về lý do từ chối.
          </p>
          
          <div className="flex justify-end gap-3 pt-4">
            <motion.button
              type="button"
              onClick={onClose}
              className="font-body rounded-lg border border-white/10 bg-white/5 px-4 py-2 text-white transition hover:bg-white/10"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              Hủy
            </motion.button>
            <motion.button
              type="submit"
              className="flex items-center gap-2 rounded-lg bg-red-500 px-4 py-2 font-body font-semibold text-white transition hover:bg-red-400"
              whileHover={{ scale: 1.05 }}
              whileTap={{ scale: 0.95 }}
            >
              <XCircle size={16} />
              Từ chối đối tác
            </motion.button>
          </div>
        </form>
      </motion.div>
    </motion.div>
  );
};