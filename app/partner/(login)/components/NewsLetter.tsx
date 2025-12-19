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
import { useCreatePartner } from "@/hooks/usePartner";
import { PartnerCreateRequest } from "@/apis/partner.api";
import { useToast } from "@/components/ToastProvider";
import FileUpload from "./FileUpload";
import TheaterImgsUpload from "./TheaterImageUpload";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import ImagePreviewModal from "./ImagePreviewModal";
import { Eye } from "lucide-react";

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
    additionalDocumentsUrls: [""],
  });

  const [errors, setErrors] = useState<ValidationErrors>({});

  const { showToast } = useToast();

  const { mutate: createPartner, isPending } = useCreatePartner({
    onSuccess: (response) => {
      showToast(response.message ?? "Đăng ký thành công", undefined, "success");
    },
    onError: (message, fieldErrors) => {
      console.log("Error message:", message);
      console.log("Field errors:", fieldErrors);
      
      // Set validation errors for form fields if available
      if (fieldErrors && Object.keys(fieldErrors).length > 0) {
        setErrors(fieldErrors);
        
        // Collect all field error messages
        const errorMessages = Object.values(fieldErrors);
        const displayMessage = errorMessages.length > 0 
          ? errorMessages.join(', ') 
          : message;
        
        showToast(displayMessage, "", "error");
      } else {
        // No field errors, just show the main message
        showToast(message, "", "error");
      }
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

  const validateTaxCode = (taxCode: string): string | undefined => {
    if (!taxCode) return "Mã số thuế là bắt buộc";
    const taxCodeRegex = /^\d{10,14}$/;
    if (!taxCodeRegex.test(taxCode)) {
      return "Mã số thuế phải từ 10-14 chữ số";
    }
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
    } else if (name === "taxCode") {
      const taxCodeError = validateTaxCode(value);
      setErrors((prev) => ({
        ...prev,
        taxCode: taxCodeError,
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
    const taxCodeError = validateTaxCode(formData.taxCode);

    if (emailError) newErrors.email = emailError;
    if (passwordError) newErrors.password = passwordError;
    if (confirmPasswordError) newErrors.confirmPassword = confirmPasswordError;
    if (taxCodeError) newErrors.taxCode = taxCodeError;

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
  const [previewModal, setPreviewModal] = useState(false);
  const [previewImage, setPreviewImage] = useState("");
  const [previewTitle, setPreviewTitle] = useState("");

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

  const handleAdditionalDocumentsSelect = useCallback(
    async (files: File[]) => {
      if (!files || files.length === 0) return;

      const previewUrls = files.map((file) => URL.createObjectURL(file));
      setFormData((prev) => ({
        ...prev,
        additionalDocumentsUrls: previewUrls,
      }));

      try {
        const uploadPromises = files.map((file) =>
          uploadMutation.mutateAsync(file)
        );

        const uploadedResults = await Promise.all(uploadPromises);

        const uploadedUrls = uploadedResults.map((res) => res.secure_url);

        setFormData((prev) => ({
          ...prev,
          additionalDocumentsUrls: uploadedUrls,
        }));

        previewUrls.forEach((url) => URL.revokeObjectURL(url));
      } catch (error) {
        console.error("❌ Upload thất bại:", error);
      }
    },
    [setFormData, uploadMutation]
  );

  const handlePreviewImage = (url: string, title: string) => {
    setPreviewImage(url);
    setPreviewTitle(title);
    setPreviewModal(true);
  };

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
                  placeholder="Họ và tên người đại diện hợp pháp"
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
                    placeholder="Email liên hệ"
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
                  placeholder="Số điện thoại liên hệ"
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
                Thông tin doanh nghiệp
              </h3>

              {/* Partner Name */}
              <div className="relative">
                <Building className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400" />
                <input
                  type="text"
                  name="partnerName"
                  placeholder="Tên doanh nghiệp"
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
                  placeholder="Địa chỉ đăng ký kinh doanh"
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
                <FileText className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400 z-10" />
                <div className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 transition-all duration-300">
                  {formData.businessRegistrationCertificateUrl ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.businessRegistrationCertificateUrl}
                          alt="Business Registration"
                          className="h-8 w-8 object-cover rounded"
                        />
                        <span>Đã chọn file</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handlePreviewImage(
                              formData.businessRegistrationCertificateUrl,
                              "Giấy phép đăng ký kinh doanh"
                            )
                          }
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChooseFile("business")}
                          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Thay đổi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleChooseFile("business")}
                      className="w-full text-left text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Chọn giấy phép đăng ký kinh doanh
                    </button>
                  )}
                </div>
              </div>

              {/* Identity Card */}
              <div className="relative">
                <Image className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400 z-10" />
                <div className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 transition-all duration-300">
                  {formData.identityCardUrl ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.identityCardUrl}
                          alt="Identity Card"
                          className="h-8 w-8 object-cover rounded"
                        />
                        <span>Đã chọn file</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handlePreviewImage(
                              formData.identityCardUrl,
                              "CMND/CCCD"
                            )
                          }
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChooseFile("identity")}
                          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Thay đổi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleChooseFile("identity")}
                      className="w-full text-left text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      CMND/CCCD của người đại diện theo pháp luật
                    </button>
                  )}
                </div>
              </div>

              {/* Tax Registration Certificate */}
              <div className="relative">
                <FileImage className="absolute left-4 top-1/2 -translate-y-1/2 h-5 w-5 text-gray-400 dark:text-gray-400 z-10" />
                <div className="w-full pl-12 pr-4 py-3 bg-gray-800/50 dark:bg-gray-800/50 border border-gray-600 dark:border-gray-600 rounded-lg text-gray-100 dark:text-gray-100 transition-all duration-300">
                  {formData.taxRegistrationCertificateUrl ? (
                    <div className="flex items-center justify-between gap-2">
                      <div className="flex items-center gap-2">
                        <img
                          src={formData.taxRegistrationCertificateUrl}
                          alt="Tax Registration"
                          className="h-8 w-8 object-cover rounded"
                        />
                        <span>Đã chọn file</span>
                      </div>
                      <div className="flex gap-2">
                        <button
                          type="button"
                          onClick={() =>
                            handlePreviewImage(
                              formData.taxRegistrationCertificateUrl,
                              "Giấy chứng nhận đăng ký thuế"
                            )
                          }
                          className="flex items-center gap-1 text-sm text-blue-400 hover:text-blue-300 transition-colors"
                        >
                          <Eye className="h-4 w-4" />
                          <span>Xem chi tiết</span>
                        </button>
                        <button
                          type="button"
                          onClick={() => handleChooseFile("tax")}
                          className="text-sm text-gray-400 hover:text-gray-300 transition-colors"
                        >
                          Thay đổi
                        </button>
                      </div>
                    </div>
                  ) : (
                    <button
                      type="button"
                      onClick={() => handleChooseFile("tax")}
                      className="w-full text-left text-gray-400 hover:text-gray-300 transition-colors"
                    >
                      Chọn giấy chứng nhận đăng ký thuế
                    </button>
                  )}
                </div>
              </div>

              {/* Additional Documents */}
              <div className="space-y-3">
                <label className="block text-sm font-medium text-gray-300 dark:text-gray-300">
                  Giấy tờ liên quan khác
                </label>
                <TheaterImgsUpload
                  handleTheaterFileSelect={handleAdditionalDocumentsSelect}
                  label="Giấy tờ liên quan"
                />
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
              type="submit"
              disabled={isPending}
              className="w-full px-6 py-3 bg-purple-600 dark:bg-purple-600 text-white dark:text-white font-semibold rounded-lg hover:bg-purple-700 dark:hover:bg-purple-700 transition-colors duration-300 shadow-md transform hover:scale-105 disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isPending ? "Đang xử lý..." : "Đăng ký đối tác"}
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

        {/* Image Preview Modal */}
        <ImagePreviewModal
          isOpen={previewModal}
          onClose={() => setPreviewModal(false)}
          imageUrl={previewImage}
          title={previewTitle}
        />
      </motion.div>
    </div>
  );
};

export default function NewsletterSection() {
  return <Newsletter />;
}
