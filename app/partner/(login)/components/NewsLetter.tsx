"use client";

import React, { useCallback, useState } from "react";

import { motion, type Variants } from "framer-motion";

import {
  Mail,
  User,
  Building,
  Phone,
  MapPin,
  FileText,
  Lock,
  Image,
  FileImage,
} from "lucide-react";
import { useCreatePartner } from "@/hooks/userPartner";
import { PartnerCreateRequest } from "@/apis/partner.api";
import { useToast } from "@/components/ToastProvider";
import FileUpload from "./FileUpload";
import TheaterImgsUpload from "./TheaterImageUpload";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";

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

type ValidationErrors = Record<string, string | undefined>;

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



  const [errors, setErrors] = useState<ValidationErrors>({});

  const { showToast } = useToast();

  const { mutate: createPartner, isPending } = useCreatePartner({
    onSuccess: (response) => {
      showToast(response.message ?? "Đăng ký thành công", undefined, "success");
    },
    onError: (message, fieldErrors) => {
      if (fieldErrors) {
        setErrors((prev) => ({
          ...prev,
          ...fieldErrors,
        }));
      }

      const title = message && message.trim() !== ""
        ? message
        : "Đăng ký không thành công";
      const detailMessage = fieldErrors
        ? Object.values(fieldErrors)
            .filter((msg): msg is string => Boolean(msg && msg.trim()))
            .join("\n")
        : undefined;

      showToast(title, detailMessage, "error");
    },
  });

  const uploadMutation = useUploadToCloudinary();

  // Validation functions
  const validateEmail = (email: string): string | undefined => {
    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!email) return "Email là bắt buộc";
    if (!emailRegex.test(email)) return "Email không hợp lệ";
    return undefined;
  };

  const validatePassword = (password: string): string | undefined => {
    if (!password) return "Mật khẩu là bắt buộc";
    if (password.length < 6) return "Mật khẩu phải có ít nhất 6 ký tự";
    if (!/[a-z]/.test(password))
      return "Mật khẩu phải chứa ít nhất một chữ cái thường";
    if (!/[A-Z]/.test(password))
      return "Mật khẩu phải chứa ít nhất một chữ cái hoa";
    if (!/[@$!%*?&]/.test(password))
      return "Mật khẩu phải chứa ít nhất một ký tự đặc biệt (@$!%*?&)";
    return undefined;
  };

  const validateConfirmPassword = (
    confirmPassword: string,
    password: string
  ): string | undefined => {
    if (!confirmPassword) return "Xác nhận mật khẩu là bắt buộc";
    if (confirmPassword !== password) return "Mật khẩu xác nhận không khớp";
    return undefined;
  };

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: value,
    }));

    // Clear error when user starts typing
    if (errors[name]) {
      setErrors((prev) => {
        const next = { ...prev };
        delete next[name];
        return next;
      });
    }

    // Validate specific fields as user types
    if (name === "email") {
      const emailError = validateEmail(value);
      setErrors((prev) => ({
        ...prev,
        email: emailError,
      }));
    } else if (name === "password") {
      const passwordError = validatePassword(value);
      setErrors((prev) => ({
        ...prev,
        password: passwordError,
      }));
      // Also validate confirm password if it exists
      if (formData.confirmPassword) {
        const confirmPasswordError = validateConfirmPassword(
          formData.confirmPassword,
          value
        );
        setErrors((prev) => ({
          ...prev,
          confirmPassword: confirmPasswordError,
        }));
      }
    } else if (name === "confirmPassword") {
      const confirmPasswordError = validateConfirmPassword(
        value,
        formData.password
      );
      setErrors((prev) => ({
        ...prev,
        confirmPassword: confirmPasswordError,
      }));
    }
  };

  const validateForm = () => {
    const newErrors: ValidationErrors = {};

    const emailError = validateEmail(formData.email);
    const passwordError = validatePassword(formData.password);
    const confirmPasswordError = validateConfirmPassword(
      formData.confirmPassword,
      formData.password
    );

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!validateForm()) {
      console.log("Form validation failed");
      return;
    }

    console.log("Form data:", formData);
    createPartner(formData);
  };

  // "taxCode": yêu cầu mã từ 10 - 12 chữ số

  // "businessRegistrationCertificateUrl": yêu cầu ảnh với định dạng,
  // "identityCardUrl": yêu cầu ảnh với định dạng,
  // "taxRegistrationCertificateUrl": yêu cầu ảnh với định dạng,
  // "theaterPhotosUrls": [yêu cầu ảnh với định dạng]

  const [fileInputModal, setFileInputModal] = useState(false);
  const [currentFileType, setCurrentFileType] = useState<
    "business" | "identity" | "tax" | "theater"
  >("business");
  const [currentFileTitle, setCurrentFileTitle] = useState("");

  const handleChooseFile = (
    fileType: "business" | "identity" | "tax" | "theater"
  ) => {
    setCurrentFileType(fileType);
    setCurrentFileTitle(getFileTitle(fileType));
    setFileInputModal(true);
  };

  const getFileTitle = (fileType: string) => {
    switch (fileType) {
      case "business":
        return "Tải lên giấy phép đăng ký kinh doanh";
      case "identity":
        return "Tải lên căn cước công dân";
      case "tax":
        return "Tải lên giấy chứng nhận đăng ký thuế";
      case "theater":
        return "Tải lên ảnh rạp chiếu phim";
      default:
        return "Tải lên file";
    }
  };

  const handleFileSelect = (file: File) => {
    uploadMutation.mutate(file, {
      onSuccess: (data) => {
        console.log("✅ Upload success:", data.secure_url);
        const secureUrl = data.secure_url;

        setFormData((prev) => {
          switch (currentFileType) {
            case "business":
              return {
                ...prev,
                businessRegistrationCertificateUrl: secureUrl,
              };
            case "identity":
              return {
                ...prev,
                identityCardUrl: secureUrl,
              };
            case "tax":
              return {
                ...prev,
                taxRegistrationCertificateUrl: secureUrl,
              };
            case "theater":
              return {
                ...prev,
                theaterPhotosUrls: [secureUrl],
              };
            default:
              return prev;
          }
        });
      },
      onError: (error) => {
        console.error("❌ Upload failed:", error);
        showToast("Tải file thất bại", "Vui lòng thử lại.", "error");
      },
    });
  };

  const handleTheaterFileSelect = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        theaterPhotosUrls: previewUrls,
      }));

      try {
        const uploadPromises = files.map((file) =>
          uploadMutation.mutateAsync(file)
        );

        const uploadedResults = await Promise.all(uploadPromises);

        const uploadedUrls = uploadedResults.map((res) => res.secure_url);

        setFormData((prev) => ({
          ...prev,
          theaterPhotosUrls: uploadedUrls,
        }));

        previewUrls.forEach((url) => URL.revokeObjectURL(url));
      } catch (error) {
        console.error("❌ Upload thất bại:", error);
      }
    },
    [setFormData, uploadMutation]
  );

  return (
    <div className="relative font-sans w-full min-h-screen flex items-center justify-center overflow-hidden p-4 bg-gray-800/50 dark:bg-black transition-colors duration-300">
      <motion.div
        className="relative z-10 container mx-auto text-center max-w-3xl py-28"
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
              <div className="">
                <div className="relative">
                  <Mail className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    type="email"
                    name="email"
                    placeholder="Email"
                    value={formData.email}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.email
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-600 dark:border-gray-600"
                    }`}
                    required
                  />
                </div>
                {errors.email && (
                  <p className="text-left mt-1 text-sm text-red-400 dark:text-red-400">
                    {errors.email}
                  </p>
                )}
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
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    type="password"
                    name="password"
                    placeholder="Mật khẩu"
                    value={formData.password}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.password
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-600 dark:border-gray-600"
                    }`}
                    required
                  />
                </div>
                {errors.password && (
                  <p className="mt-1 text-sm text-red-400 dark:text-red-400 text-left">
                    {errors.password}
                  </p>
                )}
              </div>

              {/* Confirm Password */}
              <div>
                <div className="relative">
                  <Lock className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <input
                    type="password"
                    name="confirmPassword"
                    placeholder="Xác nhận mật khẩu"
                    value={formData.confirmPassword}
                    onChange={handleInputChange}
                    className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                      errors.confirmPassword
                        ? "border-red-500 dark:border-red-500"
                        : "border-gray-600 dark:border-gray-600"
                    }`}
                    required
                  />
                </div>
                {errors.confirmPassword && (
                  <p className="mt-1 text-sm text-red-400 dark:text-red-400 text-left">
                    {errors.confirmPassword}
                  </p>
                )}
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
                  className={`w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 ${
                    errors.taxCode
                      ? "border-red-500 dark:border-red-500"
                      : "border-gray-600 dark:border-gray-600"
                  }`}
                  required
                />
                {errors.taxCode && (
                  <p className="mt-1 text-sm text-red-400 dark:text-red-400 text-left">
                    {errors.taxCode}
                  </p>
                )}
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

            {/* Document Upload Section */}
            <div className="space-y-4">
              <h3 className="text-xl font-semibold text-gray-100 dark:text-gray-100 mb-4">
                Tài liệu đính kèm
              </h3>

              {/* Business Registration Certificate */}
              <div className="relative">
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <button
                  type="button"
                  onClick={() => handleChooseFile("business")}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-left hover:bg-gray-700/50 dark:hover:bg-gray-700/50"
                >
                  {formData.businessRegistrationCertificateUrl
                    ? "✓ Đã chọn file"
                    : "Chọn giấy phép đăng ký kinh doanh"}
                </button>
              </div>

              {/* Identity Card */}
              <div className="relative">
                <Image className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <button
                  type="button"
                  onClick={() => handleChooseFile("identity")}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-left hover:bg-gray-700/50 dark:hover:bg-gray-700/50"
                >
                  {formData.identityCardUrl
                    ? "✓ Đã chọn file"
                    : "Chọn căn cước công dân"}
                </button>
              </div>

              {/* Tax Registration Certificate */}
              <div className="relative">
                <FileImage className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <button
                  type="button"
                  onClick={() => handleChooseFile("tax")}
                  className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-left hover:bg-gray-700/50 dark:hover:bg-gray-700/50"
                >
                  {formData.taxRegistrationCertificateUrl
                    ? "✓ Đã chọn file"
                    : "Chọn giấy chứng nhận đăng ký thuế"}
                </button>
              </div>

              {/* Theater Photos */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300">
                  Ảnh rạp chiếu phim
                </label>
                {/* <div className="relative">
                  <Camera className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                  <button
                    type="button"
                    onClick={() => handleChooseFile('theater')}
                    className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 placeholder:text-gray-400 dark:placeholder:text-gray-400 outline-none focus:ring-2 focus:ring-purple-500 focus:border-transparent transition-all duration-300 text-left hover:bg-gray-700/50 dark:hover:bg-gray-700/50"
                  >
                    {formData.theaterPhotosUrls[0] ? '✓ Đã chọn ảnh rạp' : 'Chọn ảnh rạp chiếu phim'}
                  </button>
                </div> */}
                <TheaterImgsUpload
                  handleTheaterFileSelect={handleTheaterFileSelect}
                />
              </div>
            </div>

            {/* Submit Button */}
            <button
              // disabled={!validateForm()}
              type="submit"
              className="w-full px-6 py-3 bg-purple-600 dark:bg-purple-600 text-white dark:text-white font-semibold rounded-lg hover:bg-purple-700 dark:hover:bg-purple-700 transition-colors duration-300 shadow-md transform hover:scale-105"
            >
              Đăng ký đối tác
            </button>
          </div>
        </motion.form>

        {/* File Upload Modal */}
        <FileUpload
          isOpen={fileInputModal}
          onClose={() => setFileInputModal(false)}
          onFileSelect={handleFileSelect}
          fileType={currentFileType}
          title={currentFileTitle}
          isPending={uploadMutation.isPending}
        />
      </motion.div>
    </div>
  );
};

export default function NewsletterSection() {
  return <Newsletter />;
}
