"use client";

import React, { useState } from "react";

import { motion, type Variants } from "framer-motion";

import {
  Mail,
  User,
  Building,
  Phone,
  MapPin,
  FileText,
  Lock,
} from "lucide-react";
import { useCreatePartner } from "@/hooks/userPartner";
import { PartnerCreateRequest } from "@/apis/partner.api";

const containerVariants: Variants = {
  hidden: { opacity: 0 },

  visible: {
    opacity: 1,

    transition: {
      staggerChildren: 0.2,

      delayChildren: 0.3,
    },
  },
};

const itemVariants: Variants = {
  hidden: { y: 20, opacity: 0 },

  visible: {
    y: 0,

    opacity: 1,

    transition: {
      type: "spring" as const,

      stiffness: 100,
    },
  },
};

const Newsletter = () => {
  const [formData, setFormData] = useState<PartnerCreateRequest>({
    email: "",
    password: "",
    confirmPassword: "",
    fullName: "",
    phone: "",
    partnerName: "",
    taxCode: "",
    address: "",
    commissionRate: 0,
    businessRegistrationCertificateUrl: "",
    taxRegistrationCertificateUrl: "",
    identityCardUrl: "",
    theaterPhotosUrls: [""],
  });

  const { mutate: createPartner } = useCreatePartner();

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    // Handle form submission here
    console.log("Form data:", formData);
    createPartner(formData);
  };

  return (
    <div className="relative font-sans w-full min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gray-800/50 dark:bg-black transition-colors duration-300">
      <motion.div
        className="relative z-10 container mx-auto text-center max-w-3xl"
        variants={containerVariants}
        initial="hidden"
        animate="visible"
      >
        {/* Heading */}

        <motion.h2
          className="text-3xl md:text-6xl font-bold leading-tight tracking-tight text-gray-100 dark:text-gray-100"
          variants={itemVariants}
        >
          Thành công sau này - Hành động hôm nay!
        </motion.h2>

        {/* Subheading */}

        <motion.p
          className="mt-6 text-lg md:text-xl text-gray-300 dark:text-gray-300 max-w-2xl mx-auto"
          variants={itemVariants}
        >
          Trao quyền cho các rạp chiếu bằng nền tảng thông minh – quản lý dễ
          dàng, thành công cùng nhau.
        </motion.p>

        {/* Partner Registration Form */}

        <motion.form
          className="mt-10 max-w-2xl mx-auto"
          onSubmit={handleSubmit}
          variants={itemVariants}
        >
          <div className="bg-gray-900/90 dark:bg-gray-900/90 backdrop-blur-sm p-8 rounded-2xl shadow-lg border border-gray-700/80 dark:border-gray-600/80 space-y-6">
            {/* Personal Information Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100 mb-4">
                Thông tin cá nhân
              </h3>

              {/* Full Name */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  name="fullName"
                  placeholder="Họ và tên"
                  value={formData.fullName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Email */}
              <div className="relative">
                <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="email"
                  name="email"
                  placeholder="Email"
                  value={formData.email}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Phone */}
              <div className="relative">
                <Phone className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="tel"
                  name="phone"
                  placeholder="Số điện thoại"
                  value={formData.phone}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="password"
                  name="password"
                  placeholder="Mật khẩu"
                  value={formData.password}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Confirm Password */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="password"
                  name="confirmPassword"
                  placeholder="Xác nhận mật khẩu"
                  value={formData.confirmPassword}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Company Information Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100 mb-4">
                Thông tin công ty
              </h3>

              {/* Partner Name */}
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  name="partnerName"
                  placeholder="Tên công ty"
                  value={formData.partnerName}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Tax Code */}
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  name="taxCode"
                  placeholder="Mã số thuế"
                  value={formData.taxCode}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>

              {/* Address */}
              <div className="relative">
                <MapPin className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  name="address"
                  placeholder="Địa chỉ"
                  value={formData.address}
                  onChange={handleInputChange}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300"
                  required
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 dark:bg-purple-600 text-white dark:text-white font-semibold rounded-lg hover:bg-purple-700 dark:hover:bg-purple-700 transition-colors duration-300 shadow-md transform hover:scale-105"
            >
              Đăng ký đối tác
            </button>
          </div>
        </motion.form>
      </motion.div>
    </div>
  );
};

export default function NewsletterSection() {
  return <Newsletter />;
}
