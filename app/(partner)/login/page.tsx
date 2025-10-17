import React from "react";
import { Lock, User } from "lucide-react";
import { Pacifico } from "next/font/google";

const pacifico = Pacifico({
  subsets: ["latin"],
  weight: "400",
});

const navItems = [
  {
    title: "Home",
    link: "/partnerHome",
  },
  {
    title: "Blog",
    link: "/blog",
  },
  {
    title: "Services",
    link: "/services",
  },
  {
    title: "About",
    link: "/about",
  },
];

const Page = () => {
  return (
    <div
      className="relative w-full min-h-screen bg-cover bg-center bg-no-repeat"
      style={{
        backgroundImage: `url("/partnerBg.jpg")`,
      }}
    >
      <div className="absolute inset-0 bg-gradient-to-r from-black/40 via-black/30 to-black/20" />
      <div className="absolute inset-0 bg-gradient-to-t from-black/40 via-transparent to-black/20" />

      {/* Navbar */}
      <nav className="relative z-10 flex items-center justify-between px-8 py-6">
        <h1 className={`${pacifico.className} text-3xl font-bold text-white`}>
          TicketXpress
        </h1>

        <div className="flex items-center gap-8">
          {navItems.map((item) => (
            <a
              key={item.title}
              href={item.link}
              className="nav-hover-btn"
            >
              {item.title}
            </a>
          ))}
        </div>

        <div className="flex items-center gap-4">
          <button className="px-8 py-2 bg-white/90 hover:bg-white rounded-full text-black font-semibold transition-all shadow-lg">
            Sign In
          </button>
          <button className="px-8 py-2 bg-white/20 hover:bg-white/30 backdrop-blur-sm rounded-full text-white font-semibold transition-all border border-white/30">
            Sign Up
          </button>
        </div>
      </nav>

      {/* Login form - Centered */}
      <div className="relative z-10 flex items-center justify-center min-h-[calc(100vh-120px)]">
        <div className="w-full max-w-md mx-4">
          <div className="bg-white/60 backdrop-blur-md rounded-3xl shadow-2xl p-8 border border-white/20">
            {/* Header */}
            <div className="text-center mb-8">
              <h2 className="text-3xl font-bold text-gray-800 mb-2">Welcome Back</h2>
              <p className="text-gray-600">
                Dont have an account?{" "}
                <a href="#" className="text-blue-600 hover:text-blue-700 font-semibold">
                  Sign Up
                </a>
              </p>
            </div>

            {/* Form */}
            <div className="space-y-5">
              {/* Email Input */}
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                <input
                  type="email"
                  placeholder="Email Address"
                  className="w-full h-12 bg-gray-100/80 rounded-full pl-12 pr-4 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Password Input */}
              <div className="relative">
                <Lock className="absolute left-4 top-1/2 -translate-y-1/2 size-5 text-gray-500" />
                <input
                  type="password"
                  placeholder="Password"
                  className="w-full h-12 bg-gray-100/80 rounded-full pl-12 pr-4 text-gray-800 placeholder:text-gray-500 focus:outline-none focus:ring-2 focus:ring-blue-500 transition-all"
                />
              </div>

              {/* Remember Me & Forgot Password */}
              <div className="flex items-center justify-between px-2 text-sm">
                <label className="flex items-center gap-2 cursor-pointer">
                  <input
                    type="checkbox"
                    className="w-4 h-4 rounded border-gray-300 text-blue-600 focus:ring-blue-500"
                  />
                  <span className="text-gray-700">Remember Me</span>
                </label>

                <a href="#" className="text-blue-600 hover:text-blue-700 font-medium">
                  Forgot Password?
                </a>
              </div>

              {/* Sign In Button */}
              <button className="w-full h-12 bg-gradient-to-r from-blue-600 to-blue-700 hover:from-blue-700 hover:to-blue-800 text-white font-semibold rounded-full shadow-lg transition-all transform hover:scale-[1.02] active:scale-[0.98]">
                Sign In
              </button>

              {/* Divider */}
              <div className="relative my-6">
                <div className="absolute inset-0 flex items-center">
                  <div className="w-full border-t border-gray-300"></div>
                </div>
                <div className="relative flex justify-center text-sm">
                  <span className="px-4 bg-white text-gray-500">Or continue with</span>
                </div>
              </div>

              {/* Social Login */}
              <div className="grid grid-cols-2 gap-4">
                <button className="h-12 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-gray-700 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" viewBox="0 0 24 24">
                    <path fill="currentColor" d="M22.56 12.25c0-.78-.07-1.53-.2-2.25H12v4.26h5.92c-.26 1.37-1.04 2.53-2.21 3.31v2.77h3.57c2.08-1.92 3.28-4.74 3.28-8.09z"/>
                    <path fill="currentColor" d="M12 23c2.97 0 5.46-.98 7.28-2.66l-3.57-2.77c-.98.66-2.23 1.06-3.71 1.06-2.86 0-5.29-1.93-6.16-4.53H2.18v2.84C3.99 20.53 7.7 23 12 23z"/>
                    <path fill="currentColor" d="M5.84 14.09c-.22-.66-.35-1.36-.35-2.09s.13-1.43.35-2.09V7.07H2.18C1.43 8.55 1 10.22 1 12s.43 3.45 1.18 4.93l2.85-2.22.81-.62z"/>
                    <path fill="currentColor" d="M12 5.38c1.62 0 3.06.56 4.21 1.64l3.15-3.15C17.45 2.09 14.97 1 12 1 7.7 1 3.99 3.47 2.18 7.07l3.66 2.84c.87-2.6 3.3-4.53 6.16-4.53z"/>
                  </svg>
                  Google
                </button>
                <button className="h-12 bg-gray-100 hover:bg-gray-200 rounded-full font-medium text-gray-700 transition-all flex items-center justify-center gap-2">
                  <svg className="w-5 h-5" fill="currentColor" viewBox="0 0 24 24">
                    <path d="M24 12.073c0-6.627-5.373-12-12-12s-12 5.373-12 12c0 5.99 4.388 10.954 10.125 11.854v-8.385H7.078v-3.47h3.047V9.43c0-3.007 1.792-4.669 4.533-4.669 1.312 0 2.686.235 2.686.235v2.953H15.83c-1.491 0-1.956.925-1.956 1.874v2.25h3.328l-.532 3.47h-2.796v8.385C19.612 23.027 24 18.062 24 12.073z"/>
                  </svg>
                  Facebook
                </button>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};

export default Page;