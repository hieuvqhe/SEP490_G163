'use client';

import { useState } from 'react';
import { useMutation } from '@tanstack/react-query';
import { useRouter } from 'next/navigation';
import { authAPI, LoginRequest } from '../services/authAPI';
import { Card, CardContent, CardDescription, CardHeader, CardTitle } from "@/components/ui/card";
import { Input } from "@/components/ui/input";
import { Label } from "@/components/ui/label";
import { useToast } from "@/hooks/use-toast";
import { Loader2, Mail, Lock, Eye, EyeOff } from "lucide-react";
import LoadingScreen from "./LoadingScreen";
import ElectricBorder from "../../components/ElectricBorder";

export default function LoginForm() {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);
  const [isRedirecting, setIsRedirecting] = useState(false);
  const router = useRouter();
  const { toast } = useToast();

  const loginMutation = useMutation({
    mutationFn: (credentials: LoginRequest) => authAPI.login(credentials),
    onSuccess: (data) => {
      if (data.success) {
        toast({
          title: "Đăng nhập thành công!",
          description: `Chào mừng ${data.email} đến với hệ thống.`,
        });
        
        // Hiển thị loading screen
        setIsRedirecting(true);
        
        // Chuyển hướng đến trang home sau 2.5 giây
        setTimeout(() => {
          router.push('/home');
        }, 2500);
      } else {
        // Đây là trường hợp backend trả về success: false (sai email/password)
        toast({
          variant: "destructive",
          title: "Đăng nhập thất bại",
          description: data.message || "Sai email hoặc mật khẩu",
        });
      }
    },
    onError: (error) => {
      // Đây mới là lỗi thực sự (network error, server down, etc.)
      console.error('Login error:', error);
      toast({
        variant: "destructive",
        title: "Lỗi kết nối",
        description: "Không thể kết nối đến server. Vui lòng thử lại.",
      });
    },
  });

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    loginMutation.mutate({ email, password });
  };

  return (
    <>
      <LoadingScreen 
        isVisible={isRedirecting} 
        message="Đang chuyển hướng đến trang chủ..."
      />
      
      <div 
        className="min-h-screen flex items-center justify-center p-4 relative overflow-hidden"
        style={{
          background: `
            radial-gradient(ellipse at 20% 50%, #554226 0%, transparent 50%),
            radial-gradient(ellipse at 80% 20%, #03162D 0%, transparent 50%),
            radial-gradient(ellipse at 40% 80%, #002027 0%, transparent 50%),
            radial-gradient(ellipse at 60% 30%, #020210 0%, transparent 50%),
            radial-gradient(ellipse at 90% 70%, #02152A 0%, transparent 50%),
            linear-gradient(135deg, #003FFF 0%, #002027 50%, #020210 100%)
          `
        }}
      >
      {/* Animated overlay for wave effect */}
      <div 
        className="absolute inset-0 opacity-30"
        style={{
          background: `
            repeating-linear-gradient(
              45deg,
              transparent,
              transparent 10px,
              rgba(255,255,255,0.02) 10px,
              rgba(255,255,255,0.02) 20px
            )
          `,
          animation: 'wave 8s ease-in-out infinite'
        }}
      />
      
      {/* Grain texture overlay */}
      <div 
        className="absolute inset-0 opacity-10"
        style={{
          backgroundImage: `
            radial-gradient(circle at 25% 25%, #ffffff 1px, transparent 1px),
            radial-gradient(circle at 75% 75%, #ffffff 1px, transparent 1px)
          `,
          backgroundSize: '24px 24px',
          backgroundPosition: '0 0, 12px 12px'
        }}
      />

      {/* Floating particles */}
      <div className="absolute inset-0 overflow-hidden pointer-events-none">
        {[...Array(12)].map((_, i) => (
          <div
            key={i}
            className="absolute w-1 h-1 bg-white/20 rounded-full"
            style={{
              left: `${Math.random() * 100}%`,
              top: `${Math.random() * 100}%`,
              animationDelay: `${Math.random() * 8}s`,
              animation: `float ${4 + Math.random() * 4}s ease-in-out infinite`
            }}
          />
        ))}
      </div>

      <div className="w-full max-w-md relative z-10">
        <ElectricBorder
          color="#00FFFF"
          speed={1.2}
          chaos={1.5}
          thickness={3}
          className="rounded-xl"
          style={{ borderRadius: '16px' }}
        >
          <Card className="shadow-2xl border-0 bg-gray-900/95 backdrop-blur-sm rounded-xl">
            <CardHeader className="space-y-1 text-center">
              <CardTitle className="text-3xl font-bold text-cyan-100">
                Đăng nhập
              </CardTitle>
              <CardDescription className="text-cyan-200/80">
                Nhập thông tin để truy cập hệ thống Cinema
              </CardDescription>
            </CardHeader>
          <CardContent>
            <form onSubmit={handleSubmit} className="space-y-4">
              <div className="space-y-2">
                <Label htmlFor="email" className="text-sm font-medium text-cyan-200">
                  Email
                </Label>
                <div className="relative">
                  <Mail className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                  <Input
                    id="email"
                    name="email"
                    type="email"
                    autoComplete="email"
                    required
                    className="pl-10 bg-gray-800/50 border-gray-700 text-cyan-100 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Nhập email của bạn"
                    value={email}
                    onChange={(e) => setEmail(e.target.value)}
                  />
                </div>
              </div>

              <div className="space-y-2">
                <Label htmlFor="password" className="text-sm font-medium text-cyan-200">
                  Mật khẩu
                </Label>
                <div className="relative">
                  <Lock className="absolute left-3 top-3 h-4 w-4 text-cyan-400" />
                  <Input
                    id="password"
                    name="password"
                    type={showPassword ? "text" : "password"}
                    autoComplete="current-password"
                    required
                    className="pl-10 pr-10 bg-gray-800/50 border-gray-700 text-cyan-100 placeholder:text-gray-400 focus:border-cyan-400 focus:ring-cyan-400"
                    placeholder="Nhập mật khẩu"
                    value={password}
                    onChange={(e) => setPassword(e.target.value)}
                  />
                  <button
                    type="button"
                    className="absolute right-3 top-3 text-cyan-400 hover:text-cyan-300"
                    onClick={() => setShowPassword(!showPassword)}
                  >
                    {showPassword ? (
                      <EyeOff className="h-4 w-4" />
                    ) : (
                      <Eye className="h-4 w-4" />
                    )}
                  </button>
                </div>
              </div>

              <button
                type="submit"
                className="w-full electric-login-button h-10 rounded-md px-8 text-sm font-medium"
                disabled={loginMutation.isPending}
              >
                <span>
                  {loginMutation.isPending ? (
                    <>
                      <Loader2 className="mr-2 h-4 w-4 animate-spin inline" />
                      Đang đăng nhập...
                    </>
                  ) : (
                    'Đăng nhập'
                  )}
                </span>
              </button>
            </form>

       
           

          </CardContent>
        </Card>
        </ElectricBorder>
      </div>
    </div>
    </>
  );
}