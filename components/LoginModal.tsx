'use client';

import { useEffect, useState } from 'react';
import { useLogin } from '@/hooks/useAuth';
import Modal from '@/components/Modal';
import SlideArrowButton from '@/components/slide-arrow-button';
import { useToast } from '@/components/ToastProvider';
import ForgotPasswordModal from './ForgotPasswordModal';

// --- IMPORT THÊM ---
import { SiGoogle } from 'react-icons/si';
import { LinkBox } from './ClipPathLinks';
import { generateGoogleOAuthURL } from '@/utils/googleAuth';
import { useSearchParams } from 'next/navigation';

// Add Google Fonts link for Pacifico
if (typeof document !== 'undefined') {
  const link = document.createElement('link');
  link.href = 'https://fonts.googleapis.com/css2?family=Pacifico&display=swap';
  link.rel = 'stylesheet';
  if (!document.querySelector(`link[href="${link.href}"]`)) {
    document.head.appendChild(link);
  }
}

interface LoginFormData {
  emailOrUsername: string;
  password: string;
}

interface LoginSuccessResponse {
  result: {
    accessToken: string;
    refreshToken: string;
    expireAt: string;
    fullName: string;
    role: string;
  };
  message?: string;
}

interface LoginModalProps {
  isOpen: boolean;
  onClose: () => void;
  onSuccess: (data: LoginSuccessResponse) => void;
  onSwitchToRegister?: () => void;
}

interface ValidationErrors {
  emailOrUsername?: string;
  password?: string;
  email?: string; // Thêm để xử lý lỗi email từ API
}

export default function LoginModal({ isOpen, onClose, onSuccess, onSwitchToRegister }: LoginModalProps) {
  const [showForgotPasswordModal, setShowForgotPasswordModal] = useState(false);
  const [formData, setFormData] = useState<LoginFormData>({
    emailOrUsername: '',
    password: ''
  });
  const [errors, setErrors] = useState<ValidationErrors>({});
  const [generalError, setGeneralError] = useState<string | null>(null);
  const [showPassword, setShowPassword] = useState(false);
  const { showToast } = useToast();
  const searchParams = useSearchParams();
  const [googleErrorHandled, setGoogleErrorHandled] = useState(false);

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email or Username validation
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = 'Email hoặc tên đăng nhập là bắt buộc';
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = 'Mật khẩu là bắt buộc';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  // TanStack Query mutation for login using custom hook
  const loginMutation = useLogin({
    onSuccess: (data) => {
      showToast('Đăng nhập thành công!', undefined, 'success');
      onSuccess(data);
      handleClose();
    },
    onError: (error) => {
      showToast('Lỗi đăng nhập', error, 'error');
    },
    onFieldError: (fieldErrors) => {
      // Map lỗi email từ API sang emailOrUsername field
      const mappedErrors: Record<string, string> = { ...fieldErrors };
      // map email -> emailOrUsername for our form
      if (fieldErrors.email && !fieldErrors.emailOrUsername) {
        mappedErrors.emailOrUsername = fieldErrors.email;
        delete mappedErrors.email;
      }

      // Known form fields
      const knownFields = new Set(['emailOrUsername', 'password', 'email']);

      // Extract non-field errors (like partner) to show as a general error message
      const nonFieldMessages: string[] = [];
      Object.entries(mappedErrors).forEach(([k, v]) => {
        if (!knownFields.has(k)) {
          nonFieldMessages.push(v as string);
          delete mappedErrors[k];
        }
      });

      if (nonFieldMessages.length > 0) {
        setGeneralError(nonFieldMessages.join('. '));
      } else {
        setGeneralError(null);
      }

      setErrors(mappedErrors as ValidationErrors);
    }
  });

  const handleInputChange = (field: keyof LoginFormData, value: string) => {
    setFormData(prev => ({ ...prev, [field]: value }));
    // Clear error when user starts typing
    if (errors[field]) {
      setErrors(prev => ({ ...prev, [field]: undefined }));
    }
  };

  useEffect(() => {
    if (!isOpen || googleErrorHandled) return;
    const errorCode = searchParams.get('error');
    const errorMessage = searchParams.get('message') || searchParams.get('errorMessage');
    if (!errorCode && !errorMessage) return;

    const mapped = (() => {
      if (errorMessage) return errorMessage;
      switch (errorCode) {
        case 'invalid_token':
          return 'Đăng nhập Google thất bại: Token không hợp lệ.';
        case 'token_exchange_failed':
          return 'Không thể trao đổi token với Google.';
        case 'backend_login_failed':
          return 'Máy chủ từ chối đăng nhập Google.';
        case 'missing_code':
          return 'Thiếu mã xác thực từ Google.';
        case 'server_error':
          return 'Lỗi máy chủ trong quá trình đăng nhập Google.';
        default:
          return 'Đăng nhập Google thất bại.';
      }
    })();

    showToast(mapped, undefined, 'error');
    setGoogleErrorHandled(true);
  }, [isOpen, searchParams, googleErrorHandled, showToast]);

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      loginMutation.mutate(formData);
    }
  };

  const handleClose = () => {
    setFormData({
      emailOrUsername: '',
      password: ''
    });
    setErrors({});
    onClose();
  };

  if (!isOpen) return null;

  return (
    <div className="fixed inset-0 backdrop-blur-sm bg-opacity-15 flex items-center justify-center z-50">
      {/* Logo Section - Outside Modal */}
      <div className="absolute top-20 left-1/2 transform -translate-x-1/2 text-center z-60 ">
        <h1 
          className="text-white font-pacifico mb-2"
          style={{ 
            fontFamily: "'Pacifico', cursive",
            fontSize: '32px',
            textShadow: '2px 2px 4px rgba(0,0,0,0.3)'
          }}
        >
          TicketXpress
        </h1>
      </div>

      {/* Modal Content */}
      <Modal
        isOpen={true}
        onClose={handleClose}
        title="" // Remove default title
        modalSize="lg"
        showCloseButton={true}
        contentClassName="space-y-6"
        disableBackdropClick={true}
      >
        <div className="text-center mb-6">
          <h2 className="text-2xl font-bold text-gray-900">Đăng Nhập</h2>
        </div>

        {generalError && (
          <div className="mb-4 px-4 py-2 bg-red-50 border border-red-200 rounded text-red-700">
            {generalError}
          </div>
        )}

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4"
          style={{ minHeight: '300px' }} // Fixed minimum height to prevent layout shift
        >
          {/* Email or Username */}
          <div>
            <label htmlFor="emailOrUsername" className="block text-sm font-medium text-gray-700 mb-1">
              Email hoặc Tên đăng nhập
            </label>
            <input
              type="text"
              id="emailOrUsername"
              value={formData.emailOrUsername}
              onChange={(e) => handleInputChange('emailOrUsername', e.target.value)}
              className={`w-full px-3 py-2 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                errors.emailOrUsername ? 'border-red-500' : 'border-gray-300'
              }`}
              placeholder="Nhập email hoặc tên đăng nhập"
            />
            {errors.emailOrUsername && (
              <p className="text-red-500 text-sm mt-1">{errors.emailOrUsername}</p>
            )}
          </div>

          {/* Password */}
          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Mật khẩu
            </label>
            <div className="relative">
              <input
                type={showPassword ? 'text' : 'password'}
                id="password"
                value={formData.password}
                onChange={(e) => handleInputChange('password', e.target.value)}
                className={`w-full px-3 py-2 pr-10 border rounded-lg bg-white text-gray-900 focus:outline-none focus:ring-2 focus:ring-pink-500 transition-colors ${
                  errors.password ? 'border-red-500' : 'border-gray-300'
                }`}
                placeholder="Nhập mật khẩu"
              />
              <button
                type="button"
                onClick={() => setShowPassword(!showPassword)}
                className="absolute inset-y-0 right-0 pr-3 flex items-center text-gray-400 hover:text-gray-600"
              >
                {showPassword ? (
                   <svg className="w-5 h-5" viewBox="0 -2.5 150 150" fill="currentColor" xmlns="http://www.w3.org/2000/svg">
                    <g clipPath="url(#ZEL08Dv)">
                      <path d="M39.0478 34.6819C39.0478 32.648 37.5864 31.3404 36.5421 29.8367C33.5166 25.4822 30.3701 21.2073 27.4421 16.7887C25.0542 13.3537 23.3755 9.48112 22.5031 5.39577C22.3673 4.65114 22.4115 3.88511 22.6324 3.16096C22.8534 2.4368 23.2449 1.77545 23.7739 1.23164C24.2851 0.680395 24.9511 0.2951 25.6855 0.126166C26.42 -0.0427667 27.1886 0.0124123 27.8911 0.28452C30.0721 1.24255 31.5861 2.93279 33.0442 4.66437C38.9053 11.6244 44.737 18.6093 50.5391 25.6194C56.114 32.325 61.7693 38.9673 67.204 45.7822C73.1106 53.1883 78.8006 60.7644 84.5921 68.2613C86.2148 70.3612 87.7679 72.5232 89.5143 74.517C97.2694 83.3697 104.225 92.8362 111.317 102.207C114.058 105.829 117.142 109.191 119.924 112.784C126.417 121.172 132.854 129.603 139.235 138.076C140.732 140.067 140.131 142.991 138.304 144.107C137.46 144.547 136.501 144.719 135.555 144.6C134.611 144.481 133.725 144.075 133.019 143.439C131.949 142.372 130.921 141.259 129.923 140.126C121.399 130.453 112.877 120.779 104.358 111.104C103.877 110.514 103.246 110.062 102.531 109.795C101.816 109.527 101.043 109.453 100.289 109.58C97.6683 110.015 95.0663 110.56 92.4526 111.042C78.2313 113.666 64.4377 111.717 50.9334 107.064C39.0212 102.959 27.6965 97.6374 17.4552 90.2495C14.3517 88.0674 11.4231 85.649 8.69545 83.0169C6.57809 80.8536 4.73744 78.4384 3.21508 75.8265C-0.133191 70.2531 0.262281 67.6586 4.86046 62.6825C13.3828 53.4909 23.0881 45.4595 33.7244 38.7964C35.6171 37.6027 37.9573 36.9449 39.0478 34.6819ZM59.904 58.3091C56.8622 53.4872 52.9713 49.3917 48.8565 45.5194C48.1701 44.8721 46.7158 44.7744 45.6506 44.8592C44.5253 45.0207 43.4424 45.3989 42.4625 45.9725C31.3038 51.7621 21.274 59.1519 11.8909 67.4463C11.5244 67.7421 11.222 68.1085 11.0016 68.5241C10.7813 68.939 10.6475 69.3941 10.6086 69.8621C10.5697 70.3301 10.6263 70.8014 10.7751 71.2467C10.9239 71.6921 11.1618 72.1031 11.4744 72.4553C13.9915 75.2821 16.8965 77.7426 20.1035 79.7642C31.2258 87.1618 43.3428 92.4517 56.1249 96.2165C66.4375 99.2518 76.9937 99.7949 87.6502 98.4303C88.4531 98.3572 89.2221 98.0749 89.88 97.6108C90.5378 97.1467 91.0602 96.5181 91.3947 95.7886C90.3478 94.4053 89.2052 92.921 88.0893 91.4172C85.2531 87.5948 82.0747 84.5556 76.686 86.0814C75.9345 86.1843 75.1732 86.1888 74.421 86.0943C66.3568 86.1008 56.593 79.4521 57.9893 67.2087C58.3244 64.2612 59.226 61.38 59.904 58.3066V58.3091Z" fill="currentColor"/>
                      <path d="M120.901 100.556C118.15 99.0719 116.36 96.7189 114.748 94.0221C114.243 93.1955 114.048 92.2168 114.198 91.2607C114.348 90.3046 114.834 89.432 115.568 88.7976C115.891 88.5193 116.235 88.2662 116.598 88.0415C120.808 85.462 124.702 82.4066 128.205 78.9357C141.854 65.4895 141.113 68.7837 128.205 56.1423C120.202 48.3097 110.08 43.807 99.3736 40.7465C92.7877 38.8641 86.056 37.6969 79.1454 37.9629C77.2488 38.0367 75.3475 37.9939 73.4496 38.0399C70.5789 38.1105 68.3224 36.8244 66.4615 34.8125C65.4446 33.712 64.6267 32.4284 63.7151 31.2309C63.1504 30.4884 63.8394 28.8028 64.7724 28.4946C72.1769 26.0484 79.7674 26.3124 87.3306 27.2284C108.087 29.7426 125.533 39.1391 140.609 53.1951C143.076 55.4943 145.103 58.2926 147.147 60.9997C148.7 63.1812 149.52 65.7957 149.489 68.4685C149.52 69.9372 149.474 71.6591 148.761 72.8508C142.094 84.0022 134.4 94.2209 122.261 100.128C121.817 100.3 121.363 100.443 120.901 100.556Z" fill="currentColor"/>
                      <path d="M96.9916 66.2163C96.8068 67.6812 95.715 70.9754 95.1697 70.3009C90.9073 65.0576 84.4704 57.3836 80.3836 52.0017C80.2157 51.7187 80.1214 51.3985 80.109 51.0701C80.0967 50.7417 80.1663 50.4155 80.312 50.1206C80.5703 49.8652 80.882 49.6689 81.2242 49.5453C81.5665 49.4218 81.9322 49.374 82.2946 49.4053C85.6656 49.9392 88.8005 51.4571 91.3029 53.7664C95.158 57.2775 97.5329 61.9193 96.9916 66.2163Z" fill="currentColor"/>
                    </g>
                    <defs>
                      <clipPath id="ZEL08Dv">
                        <rect width="149" height="145" fill="white" transform="translate(0.777344)"/>
                      </clipPath>
                    </defs>
                  </svg>
                ) : (
                  <svg className="w-5 h-5" viewBox="0 0 64 64" fill="none" xmlns="http://www.w3.org/2000/svg">
                    <path fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" d="M1,32c0,0,11,15,31,15s31-15,31-15S52,17,32,17 S1,32,1,32z"/>
                    <circle fill="none" stroke="currentColor" strokeWidth="2" strokeMiterlimit="10" cx="32" cy="32" r="7"/>
                  </svg>
                )}
              </button>
            </div>
            {errors.password && (
              <p className="text-red-500 text-sm mt-1">{errors.password}</p>
            )}
          </div>

          {/* Submit Button */}
          <SlideArrowButton
            type="submit"
            disabled={loginMutation.isPending}
            primaryColor="#713dff"
            text={loginMutation.isPending ? "Đang đăng nhập..." : "Đăng Nhập"}
            className={`w-full transition-opacity ${loginMutation.isPending ? 'opacity-70 cursor-not-allowed' : ''}`}
          />
          
          {/* --- THÊM PHẦN ĐĂNG NHẬP VỚI GOOGLE --- */}
          <div className="relative my-6 flex items-center justify-center">
            <div className="absolute inset-0 flex items-center">
              <div className="w-full border-t border-gray-300"></div>
            </div>
            <div className="relative bg-white px-2 text-sm text-gray-500">
              Hoặc tiếp tục với
            </div>
          </div>

          <div className="flex justify-center">
            <div className="w-full max-w-full">
              <div
                onClick={() => window.location.href = generateGoogleOAuthURL()}
                className="cursor-pointer"
              >
                <LinkBox 
                  Icon={SiGoogle} 
                  href="#" 
                  customClassName="h-12 w-full rounded-lg border border-neutral-900 bg-[#fdc3cd] transition-colors duration-200"
                  iconClassName="text-2xl md:text-2xl text-black group-hover:text-[#fdc3cd] transition-colors duration-200"
                  overlayClassName="bg-white text-[#fdc3cd] rounded-lg transition-colors duration-200"
                />
              </div>
            </div>
          </div>
       


          {/* Switch to Register & Forgot Password */}
          <div className="flex flex-col items-center pt-4 border-t border-gray-200 gap-1">
            <div className="flex flex-row items-center gap-2 text-sm text-gray-600">
              <span>Chưa có tài khoản?</span>
              <button
                type="button"
                onClick={onSwitchToRegister}
                className="text-pink-500 hover:text-pink-600 font-medium transition-colors"
                style={{ color: '#F84565' }}
              >
                Đăng ký ngay
              </button>
              <span className="mx-1">|</span>
              <button
                type="button"
                onClick={() => setShowForgotPasswordModal(true)}
                className="text-blue-500 hover:text-blue-600 font-medium transition-colors"
              >
                Quên mật khẩu?
              </button>
            </div>
          </div>
        </form>
        
        {/* Forgot Password Modal */}
        {showForgotPasswordModal && (
          <ForgotPasswordModal
            isOpen={showForgotPasswordModal}
            onClose={() => setShowForgotPasswordModal(false)}
            onSwitchToLogin={() => {
              setShowForgotPasswordModal(false);
              // Modal login đã mở rồi, không cần làm gì thêm
            }}
          />
        )}
      </Modal>
    </div>
  );
}