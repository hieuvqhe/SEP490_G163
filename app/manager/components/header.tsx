"use client";

import * as React from 'react';
import { styled, alpha } from '@mui/material/styles';
import InputBase from '@mui/material/InputBase';
import Badge from '@mui/material/Badge';
import MenuItem from '@mui/material/MenuItem';
import Menu from '@mui/material/Menu';
import MenuIcon from '@mui/icons-material/Menu';
import SearchIcon from '@mui/icons-material/Search';
import MailIcon from '@mui/icons-material/Mail';
import NotificationsIcon from '@mui/icons-material/Notifications';
import MoreIcon from '@mui/icons-material/MoreVert';

// Use lucide-react + framer-motion like admin header for a modern look
import { Menu as LucideMenu, X, Bell, Settings, LogOut, Shield } from 'lucide-react';
import { motion } from 'framer-motion';
import { Button } from '@/components/ui/button';
import { useAuthStore } from '@/store/authStore';
import { useToast } from '@/components/ToastProvider';
import { useRouter } from 'next/navigation';

const Search = styled('div')(({ theme }) => ({
  position: 'relative',
  borderRadius: theme.shape.borderRadius,
  backgroundColor: alpha(theme.palette.common.white, 0.15),
  '&:hover': {
    backgroundColor: alpha(theme.palette.common.white, 0.25),
  },
  marginRight: theme.spacing(2),
  marginLeft: 0,
  width: '100%',
  [theme.breakpoints.up('sm')]: {
    marginLeft: theme.spacing(3),
    width: 'auto',
  },
}));

const SearchIconWrapper = styled('div')(({ theme }) => ({
  padding: theme.spacing(0, 2),
  height: '100%',
  position: 'absolute',
  pointerEvents: 'none',
  display: 'flex',
  alignItems: 'center',
  justifyContent: 'center',
}));

const StyledInputBase = styled(InputBase)(({ theme }) => ({
  color: 'inherit',
  '& .MuiInputBase-input': {
    padding: theme.spacing(1, 1, 1, 0),
    // vertical padding + font size from searchIcon
    paddingLeft: `calc(1em + ${theme.spacing(4)})`,
    transition: theme.transitions.create('width'),
    width: '100%',
    [theme.breakpoints.up('md')]: {
      width: '20ch',
    },
  },
}));

interface ManagerHeaderProps {
  onMenuClick?: () => void;
  user?: any;
  onLogout?: () => void;
}

export default function ManagerHeader({ onMenuClick, user, onLogout }: ManagerHeaderProps) {
  const [anchorEl, setAnchorEl] = React.useState<null | HTMLElement>(null);
  const [mobileMoreAnchorEl, setMobileMoreAnchorEl] =
    React.useState<null | HTMLElement>(null);
  const [isScrolled, setIsScrolled] = React.useState(false);

  // Track scroll position
  React.useEffect(() => {
    const handleScroll = () => {
      setIsScrolled(window.scrollY > 50);
    };

    window.addEventListener('scroll', handleScroll);
    handleScroll(); // Check initial position

    return () => window.removeEventListener('scroll', handleScroll);
  }, []);

  const isMenuOpen = Boolean(anchorEl);
  const isMobileMenuOpen = Boolean(mobileMoreAnchorEl);

  const handleProfileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setAnchorEl(event.currentTarget);
  };

  const handleMobileMenuClose = () => {
    setMobileMoreAnchorEl(null);
  };

  const handleMenuClose = () => {
    setAnchorEl(null);
    handleMobileMenuClose();
  };

  const handleMobileMenuOpen = (event: React.MouseEvent<HTMLElement>) => {
    setMobileMoreAnchorEl(event.currentTarget);
  };

  const router = useRouter();
  const { showToast } = useToast();

  const fallbackLogout = () => {
    try {
      useAuthStore.getState().logout();
    } catch (e) {
      // noop
    }
  };

  const handleLogout = async () => {
    try {
      if (onLogout) {
        await Promise.resolve(onLogout());
      } else {
        fallbackLogout();
      }
    } catch (e) {
      // ignore
    }

    try { showToast('Bạn đã đăng xuất', undefined, 'success'); } catch {}
    try { router.push('/'); } catch {}
  };


  // We'll keep the MUI Menu for profile/actions but render a custom header layout
  const menuId = 'manager-header-account-menu';
  const renderMenu = (
    <Menu
      anchorEl={anchorEl}
      anchorOrigin={{ vertical: 'top', horizontal: 'right' }}
      id={menuId}
      keepMounted
      transformOrigin={{ vertical: 'top', horizontal: 'right' }}
      open={isMenuOpen}
      onClose={handleMenuClose}
    >
      <MenuItem onClick={handleMenuClose}>Profile</MenuItem>
      <MenuItem onClick={handleMenuClose}>My account</MenuItem>
    </Menu>
  );

  return (
    <motion.header
      className={`fixed top-0 left-0 right-0 z-50 border-b px-4 py-3 transition-all duration-300 ${
        isScrolled 
          ? 'backdrop-blur-md border-white/10' 
          : 'border-transparent'
      }`}
      style={{ 
        backgroundColor: isScrolled ? 'rgba(33, 24, 50, 0.95)' : 'transparent',
      }}
      initial={false}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.4 }}
    >
      <motion.div className="absolute inset-0" style={{ backgroundColor: 'transparent' }} />

      <div className="relative z-10 flex items-center justify-between">
        <div className="flex items-center space-x-3">
          <button
            onClick={onMenuClick}
            className="p-2 rounded-md"
            title="Toggle sidebar"
            style={{ color: '#F25912', background: 'rgba(255,255,255,0.02)' }}
          >
            <LucideMenu size={20} />
          </button>

          <div className="flex items-center space-x-3">
            <div className="relative">
              <div className="absolute -inset-2 rounded-full bg-gradient-to-r from-purple-500 to-blue-500 blur-md opacity-30" />
              <Shield size={32} className="relative z-10" style={{ color: '#F25912' }} />
            </div>
            <div>
              <h1 className="text-lg font-semibold" style={{ color: '#F25912' }}>Manager Dashboard</h1>
              <p className="text-sm" style={{ color: '#F25912' }}>Quản lý rạp chiếu phim</p>
            </div>
          </div>
        </div>

        <div className="flex-1 max-w-lg mx-6 hidden md:flex">
          <div className="relative w-full">
            <SearchIconWrapper>
              <SearchIcon sx={{ color: '#F25912' }} />
            </SearchIconWrapper>
            <StyledInputBase
              placeholder="Tìm kiếm người dùng, phim, đặt vé..."
              inputProps={{ 'aria-label': 'search' }}
              sx={{ background: 'rgba(255,255,255,0.02)', borderRadius: 1, px: 2, color: '#F25912' }}
            />
          </div>
        </div>

        <div className="flex items-center space-x-3">
          <button className="p-2 rounded-full" style={{ color: '#F25912', background: 'rgba(255,255,255,0.02)' }}>
            <Badge badgeContent={4} color="error">
              <MailIcon />
            </Badge>
          </button>
          <button className="p-2 rounded-full" style={{ color: '#F25912', background: 'rgba(255,255,255,0.02)' }}>
            <NotificationsIcon />
          </button>
          <div className="text-right">
            <p className="text-sm" style={{ color: '#F25912' }}>{user?.name || 'Manager'}</p>
            <span className="text-xs" style={{ color: '#F25912', background: 'rgba(255,255,255,0.02)', padding: '2px 8px', borderRadius: 9999 }}>MANAGER</span>
          </div>
          <div>
            <Button onClick={handleLogout} variant="ghost">
              <LogOut size={16} style={{ color: '#F25912' }} />
            </Button>
          </div>
        </div>
      </div>

      {renderMenu}
    </motion.header>
  );
}
