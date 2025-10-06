'use client';

import { useState, useEffect } from 'react';
import RegisterModal from './RegisterModal';
import EmailVerificationModal from './EmailVerificationModal';
import { useToast } from './ToastProvider';

interface RegisterSuccessData {
  user: {
    email: string;
    id?: string;
    username?: string;
    fullName?: string;
  };
  message?: string;
}

const navigationItems = [
  { label: "Xem Ngay", href: "#" },
  { label: "Điểm Thưởng", href: "#" },
  { label: "Yêu Thích", href: "#" },
  { label: "Phim Mới", href: "#" },
];

export default function Header() {
  const [isScrolled, setIsScrolled] = useState(false);
  const [activeIndex, setActiveIndex] = useState(0);
  const [showMobileSearch, setShowMobileSearch] = useState(false);
  const [showRegisterModal, setShowRegisterModal] = useState(false);
  const [showEmailVerificationModal, setShowEmailVerificationModal] = useState(false);
  const [registeredUserEmail, setRegisteredUserEmail] = useState('');
  const { showToast } = useToast();

  const handleRegisterSuccess = (data: RegisterSuccessData) => {
    setRegisteredUserEmail(data.user.email);
    setShowEmailVerificationModal(true);
    showToast('Đăng ký thành công!', 'Vui lòng kiểm tra email để xác minh tài khoản.', 'success');
  };

  const handleRegisterError = (error: string) => {
    showToast('Đăng ký thất bại', error, 'error');
  };

  useEffect(() => {
    const handleScroll = () => {
      const scrollTop = window.scrollY;
      setIsScrolled(scrollTop > 100);
    };

    window.addEventListener('scroll', handleScroll);
    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  return (
    <>
      {/* Hero section - static at top */}
      <section className="relative z-10 pt-32 pb-16">
        <div className="container mx-auto px-4 text-center">
          <h1 className="text-6xl md:text-8xl font-bold text-black mb-6 tracking-tight">
            Welcome
          </h1>
          <p className="text-xl md:text-2xl text-gray-700 max-w-2xl mx-auto leading-relaxed">
            Experience the future of navigation with our interactive menu
          </p>
        </div>
      </section>

      {/* Sticky Navigation Header */}
      <header 
        className={`fixed top-0 left-0 right-0 z-50 transition-all duration-300 ${
          isScrolled 
            ? 'bg-black backdrop-blur-md border-b border-gray-800 shadow-lg' 
            : 'bg-transparent'
        }`}
      >
        <div className="container mx-auto px-4 py-4">
          <div className="flex items-center justify-between">
            {/* Logo/Brand - Left */}
            <div className="flex items-center space-x-2 flex-shrink-0">
              <div className="w-10 h-10 bg-gradient-to-r from-pink-500 to-red-500 rounded-full flex items-center justify-center" style={{background: 'linear-gradient(135deg, #F84565, #FF6B8A)'}}>
                <span className="text-white font-bold text-lg">🎬</span>
              </div>
            </div>

            {/* Search Bar - Center */}
            <div className="flex-1 max-w-md mx-8 transition-all duration-300">
              <div className="relative w-full">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm tên phim, diễn viên"
                  className={`w-full backdrop-blur-sm border pl-10 pr-4 py-3 outline-none transition-all duration-200 ${
                    isScrolled 
                      ? 'bg-gray-100 border-gray-300 text-black placeholder-gray-500 focus:bg-white focus:ring-2 focus:ring-pink-500 rounded-lg' 
                      : 'bg-gray-800/50 border-gray-600/50 text-white placeholder-gray-400 focus:bg-gray-700/50 focus:ring-2 focus:ring-pink-500 rounded-full'
                  }`}
                  style={isScrolled ? {} : {}}
                />
              </div>
            </div>

            {/* Navigation Items - Right */}
            <nav className="flex items-center space-x-6">
              {isScrolled ? (
                // Compact navigation when scrolled
                <ul className="flex space-x-4 list-none">
                  {navigationItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        onClick={() => setActiveIndex(index)}
                        className={`transition-colors duration-200 font-medium outline-none px-3 py-2 rounded-lg text-sm relative group ${
                          activeIndex === index 
                            ? 'text-white' 
                            : 'text-white hover:text-white'
                        }`}
                        style={{
                          color: activeIndex === index ? '#F84565' : '#FFFFFF',
                          backgroundColor: activeIndex === index ? 'rgba(248, 69, 101, 0.1)' : 'transparent'
                        }}
                      >
                        {item.label}
                        {/* Hover underline for scrolled state */}
                        <span className="absolute bottom-0 left-0 w-full h-0.5 transform scale-x-0 group-hover:scale-x-100 transition-transform duration-300 origin-left" style={{backgroundColor: '#F84565'}}></span>
                      </a>
                    </li>
                  ))}
                </ul>
              ) : (
                // Full navigation when at top - horizontal layout
                <ul className="flex items-center space-x-6 list-none">
                  {navigationItems.map((item, index) => (
                    <li key={index}>
                      <a
                        href={item.href}
                        onClick={() => setActiveIndex(index)}
                        className={`transition-all duration-300 font-medium outline-none px-4 py-2 rounded-lg block relative group ${
                          activeIndex === index 
                            ? '' 
                            : 'hover:bg-black/5'
                        }`}
                        style={{
                          color: activeIndex === index ? '#F84565' : '#FFFFFF',
                          backgroundColor: activeIndex === index ? 'rgba(248, 69, 101, 0.1)' : 'transparent'
                        }}
                      >
                        {item.label}
                        {/* Hover underline for top state */}
                        <span className={`absolute bottom-0 left-0 w-full h-0.5 transform transition-transform duration-300 origin-left ${
                          activeIndex === index 
                            ? 'scale-x-100' 
                            : 'scale-x-0 group-hover:scale-x-100'
                        }`} style={{backgroundColor: '#F84565'}}></span>
                      </a>
                    </li>
                  ))}
                </ul>
              )}
              
              {/* Get Started Button */}
              <button 
                onClick={() => setShowRegisterModal(true)}
                className="px-4 py-2 rounded-lg font-medium outline-none text-sm border relative overflow-hidden group transition-all duration-300"
                style={{
                  backgroundColor: '#F84565',
                  color: '#FFFFFF',
                  borderColor: '#F84565'
                }}
              >
                {/* Background overlay for hover effect */}
                <span 
                  className="absolute -inset-1 bg-white transform -translate-x-full group-hover:translate-x-0 transition-transform duration-300 ease-out rounded-lg"
                  style={{ zIndex: 1 }}
                ></span>
                
                {/* Button text */}
                <span 
                  className="relative transition-colors duration-300 text-white group-hover:text-[#F84565]"
                  style={{ zIndex: 2 }}
                >
                  Đăng Ký 
                </span>
              </button>
            </nav>

            {/* Mobile menu toggle */}
            <button 
              onClick={() => setShowMobileSearch(!showMobileSearch)}
              className="md:hidden outline-none rounded-md p-1 ml-4"
              style={{color: isScrolled ? '#FFFFFF' : '#000000'}}
            >
              <svg className="w-6 h-6" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M4 6h16M4 12h16M4 18h16" />
              </svg>
            </button>
          </div>
          
          {/* Mobile Search Bar */}
          {showMobileSearch && (
            <div className="md:hidden mt-4 px-4 pb-4">
              <div className="relative">
                <div className="absolute inset-y-0 left-0 pl-3 flex items-center pointer-events-none">
                  <svg className="w-4 h-4 text-gray-400" fill="none" stroke="currentColor" viewBox="0 0 24 24">
                    <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M21 21l-6-6m2-5a7 7 0 11-14 0 7 7 0 0114 0z" />
                  </svg>
                </div>
                <input
                  type="text"
                  placeholder="Tìm tên phim, diễn viên"
                  className="w-full backdrop-blur-sm border rounded-full pl-10 pr-4 py-3 outline-none transition-all duration-200"
                  style={{
                    backgroundColor: isScrolled ? 'rgba(255,255,255,0.1)' : 'rgba(55,65,81,0.5)',
                    borderColor: isScrolled ? 'rgba(255,255,255,0.2)' : 'rgba(75,85,99,0.5)',
                    color: isScrolled ? '#FFFFFF' : '#FFFFFF'
                  }}
                  onFocus={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.boxShadow = '0 0 0 2px rgba(248, 69, 101, 0.5)';
                  }}
                  onBlur={(e) => {
                    const target = e.target as HTMLInputElement;
                    target.style.boxShadow = 'none';
                  }}
                />
              </div>
            </div>
          )}
        </div>
      </header>

      {/* Modals */}
      <RegisterModal
        isOpen={showRegisterModal}
        onClose={() => setShowRegisterModal(false)}
        onSuccess={handleRegisterSuccess}
        onError={handleRegisterError}
      />
      
      <EmailVerificationModal
        isOpen={showEmailVerificationModal}
        onClose={() => setShowEmailVerificationModal(false)}
        userEmail={registeredUserEmail}
      />
    </>
  );
}