import { useToast } from '@/components/ToastProvider';
import { useLogin } from "@/hooks/useAuth";
import { Lock, User } from "lucide-react";
import { useState } from "react";
import { FaTimes } from "react-icons/fa";

interface LoginFormProps {
  onSuccess: (data: LoginSuccessResponse) => void;
  setLoginForm: (value: boolean) => void;
  action: () => void;
}

interface ValidationErrors {
  emailOrUsername?: string;
  password?: string;
}

interface LoginSuccessResponse {
  data: {
    accessToken: string;
    refreshToken: string;
    expireAt: string;
    fullName: string;
    role: string;
  };
  message?: string;
}

const LoginForm: React.FC<LoginFormProps> = ({
  onSuccess,
  setLoginForm,
  action,
}) => {
  const [formData, setFormData] = useState({
    emailOrUsername: "",
    password: "",
  });

  const { showToast } = useToast();
  const [errors, setErrors] = useState<ValidationErrors>({});

  // Validation functions
  const validateForm = (): boolean => {
    const newErrors: ValidationErrors = {};

    // Email or Username validation
    if (!formData.emailOrUsername.trim()) {
      newErrors.emailOrUsername = "Email hoặc tên đăng nhập là bắt buộc";
    }

    // Password validation
    if (!formData.password) {
      newErrors.password = "Mật khẩu là bắt buộc";
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const loginMutation = useLogin({
    onSuccess: (data) => {
      showToast("Đăng nhập thành công!", undefined, "success");
      onSuccess(data);
    },
    onError: (error) => {
      console.log("LoginForm onError called with:", error);
      const errorMessage = error || "Đăng nhập thất bại. Vui lòng kiểm tra lại thông tin.";
      showToast("Lỗi đăng nhập", errorMessage, "error");
      console.log("loi roi niu");
      
    },
    onFieldError: (fieldErrors) => {
      console.log("LoginForm onFieldError called with:", fieldErrors);
      setErrors(fieldErrors);
      showToast("Lỗi đăng nhập", JSON.stringify(fieldErrors.emailOrUsername), "error");
    },
  });

  const handleInputChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value, type, checked } = e.target;
    setFormData((prev) => ({
      ...prev,
      [name]: type === "checkbox" ? checked : value,
    }));
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    if (validateForm()) {
      console.log("Submitting login with data:", formData);
      loginMutation.mutate(formData, {
        onError: (error) => {
          console.log("Direct mutation onError called with:", error);
        }
      });
    }
  };

  const handleBackdropClick = (e: React.MouseEvent) => {
    if (e.target === e.currentTarget) {
      setLoginForm(false);
    }
  };

  const handleContact = () => {
    setLoginForm(false);
    action();
  };

  return (
    <div
      className="fixed inset-0 z-50 flex items-center justify-center bg-black/50 backdrop-blur-sm"
      onClick={handleBackdropClick}
    >
      <div className="relative w-full max-w-md mx-4">
        <div className="bg-zinc-800/80 backdrop-blur-md rounded-3xl [box-shadow:var(--shadow-m)] p-8 ">
          {/* Close Button */}
          <button
            onClick={() => setLoginForm(false)}
            className="absolute top-4 right-4 p-2 hover:bg-gray-100/50 rounded-full transition-colors"
          >
            <FaTimes className="w-5 h-5 text-gray-600" />
          </button>

          {/* Header */}
          <div className="text-center mb-8">
            <h2 className="text-3xl font-bold text-zinc-50 mb-2">Welcome</h2>
            <p className="text-zinc-50/50">
              Trở thành đối tác của chúng tôi?{" "}
              <a
                href="#"
                onClick={handleContact}
                className="text-blue-600 hover:text-blue-700 font-semibold"
              >
                Contact
              </a>
            </p>
          </div>

          {/* Form */}
          <form onSubmit={handleSubmit} className="space-y-5">
            {/* Email Input */}
            <div className="relative">
              <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              <input
                type="email"
                name="emailOrUsername"
                value={formData.emailOrUsername}
                onChange={handleInputChange}
                placeholder="Email Address"
                required
                className={`w-full h-12 bg-gray-100/80 rounded-full pl-12 pr-4 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.emailOrUsername ? 'border-red-500 border-2' : ''
                }`}
              />
              {errors.emailOrUsername && (
                <p className="text-red-500 text-sm mt-1 px-2">{errors.emailOrUsername}</p>
              )}
            </div>

            {/* Password Input */}
            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
              <input
                type="password"
                name="password"
                value={formData.password}
                onChange={handleInputChange}
                placeholder="Password"
                required
                className={`w-full h-12 bg-gray-100/80 rounded-full pl-12 pr-4 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all ${
                  errors.password ? 'border-red-500 border-2' : ''
                }`}
              />
              {errors.password && (
                <p className="text-red-500 text-sm mt-1 px-2">{errors.password}</p>
              )}
            </div>

            {/* Remember Me & Forgot Password */}
            <div className="flex items-center justify-between px-2 text-sm">
              <label className="flex items-center gap-2 cursor-pointer">
                <input
                  type="checkbox"
                  name="rememberMe"
                //   checked={formData.rememberMe}
                  onChange={handleInputChange}
                  className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                />
                <span className="text-zinc-50/50">Remember Me</span>
              </label>

              <a
                href="#"
                className="text-blue-600 hover:text-blue-700 font-medium"
              >
                Forgot Password?
              </a>
            </div>

            {/* Sign In Button */}
            <button
              type="submit"
              className="w-full h-12 bg-zinc-700/70 [box-shadow:var(--shadow-m)] text-zinc-50 font-semibold rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]"
            >
              Sign In
            </button>
          </form>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
