import * as React from 'react';
import { styled, useTheme } from '@mui/material/styles';
import Box from '@mui/material/Box';
import Drawer from '@mui/material/Drawer';
import CssBaseline from '@mui/material/CssBaseline';
import Divider from '@mui/material/Divider';
import IconButton from '@mui/material/IconButton';
import ChevronLeftIcon from '@mui/icons-material/ChevronLeft';
import ChevronRightIcon from '@mui/icons-material/ChevronRight';
import List from '@mui/material/List';
import ListItem from '@mui/material/ListItem';
import ListItemButton from '@mui/material/ListItemButton';
import ListItemIcon from '@mui/material/ListItemIcon';
import ListItemText from '@mui/material/ListItemText';
import InboxIcon from '@mui/icons-material/MoveToInbox';
import MailIcon from '@mui/icons-material/Mail';
import DescriptionIcon from '@mui/icons-material/Description';
import AssignmentTurnedInIcon from '@mui/icons-material/AssignmentTurnedIn';
import MovieCreationIcon from '@mui/icons-material/MovieCreation';
import CardGiftcardIcon from '@mui/icons-material/CardGiftcard';
import ReceiptLongIcon from '@mui/icons-material/ReceiptLong';
import PeopleIcon from '@mui/icons-material/People';
import { useRouter } from 'next/navigation';
import { useGetManagerStaffProfile } from '@/apis/staff.manager.api';
import { useAuthStore } from '@/store/authStore';

const drawerWidth = 240;

const Main = styled('main', { shouldForwardProp: (prop) => prop !== 'open' })<{
  open?: boolean;
}>(({ theme }) => ({
  flexGrow: 1,
  transition: theme.transitions.create('margin', {
    easing: theme.transitions.easing.sharp,
    duration: theme.transitions.duration.leavingScreen,
  }),
  marginLeft: `-${drawerWidth}px`,
  variants: [
    {
      props: ({ open }) => open,
      style: {
        transition: theme.transitions.create('margin', {
          easing: theme.transitions.easing.easeOut,
          duration: theme.transitions.duration.enteringScreen,
        }),
        marginLeft: 0,
      },
    },
  ],
}));

const DrawerHeader = styled('div')(({ theme }) => ({
  display: 'flex',
  alignItems: 'center',
  padding: theme.spacing(0, 1),
  ...theme.mixins.toolbar,
  justifyContent: 'flex-end',
}));

interface SidebarProps {
  children?: React.ReactNode;
  open?: boolean;
  onClose?: () => void;
}

export default function PersistentDrawerLeft({ children, open = false, onClose }: SidebarProps) {
  const theme = useTheme();
  const router = useRouter();
  const { accessToken, role } = useAuthStore();
  
  // Chỉ fetch profile nếu là ManagerStaff
  const { data: managerStaffProfile } = useGetManagerStaffProfile(
    role === 'ManagerStaff' ? accessToken ?? undefined : undefined
  );

  // Lấy danh sách permission codes của staff
  const staffPermissions = React.useMemo(() => {
    if (role !== 'ManagerStaff' || !managerStaffProfile?.result?.grantedPermissions) {
      return new Set<string>();
    }
    return new Set(
      managerStaffProfile.result.grantedPermissions
        .filter(p => p.isActive)
        .map(p => p.permissionCode)
    );
  }, [role, managerStaffProfile]);

  // Helper function để check quyền truy cập module
  const hasModuleAccess = (requiredPermissions: string[]): boolean => {
    // Manager có full access
    if (role === 'Manager') return true;
    
    // ManagerStaff check permissions
    if (role === 'ManagerStaff') {
      return requiredPermissions.some(permission => staffPermissions.has(permission));
    }
    
    return false;
  };

  // Định nghĩa menu items với required permissions
  const menuItems = [
    { 
      text: 'Dashboard', 
      icon: <InboxIcon />, 
      path: '/manager',
      requiredPermissions: [] // Dashboard luôn hiển thị
    },
    { 
      text: 'Quản Lý Đăng Ký', 
      icon: <MailIcon />, 
      path: '/manager/register',
      requiredPermissions: ['PARTNER_READ', 'PARTNER_APPROVE', 'PARTNER_REJECT']
    },
    { 
      text: 'Ký Kết Hợp Đồng', 
      icon: <DescriptionIcon />, 
      path: '/manager/contract-signing',
      requiredPermissions: ['CONTRACT_CREATE', 'CONTRACT_READ']
    },
    { 
      text: 'Quản Lý Hợp Đồng', 
      icon: <AssignmentTurnedInIcon />, 
      path: '/manager/contract-management',
      requiredPermissions: ['CONTRACT_READ', 'CONTRACT_UPDATE', 'CONTRACT_DELETE']
    },
    { 
      text: 'Quản Lý Phim', 
      icon: <MovieCreationIcon />, 
      path: '/manager/movie-management',
      requiredPermissions: [] // Manager only feature (no permission for staff)
    },
    { 
      text: 'Quản Lý Voucher', 
      icon: <CardGiftcardIcon />, 
      path: '/manager/voucher-management',
      requiredPermissions: ['VOUCHER_READ', 'VOUCHER_CREATE', 'VOUCHER_UPDATE', 'VOUCHER_DELETE', 'VOUCHER_SEND']
    },
    { 
      text: 'Quản Lý Doanh Thu', 
      icon: <ReceiptLongIcon />, 
      path: '/manager/booking-management',
      requiredPermissions: [] // Manager only feature
    },
    { 
      text: 'Quản Lý Nhân Viên', 
      icon: <PeopleIcon />, 
      path: '/manager/staff-management',
      requiredPermissions: [] // Manager only feature
    }
  ];

  // Lọc menu items dựa trên permissions
  const visibleMenuItems = menuItems.filter(item => {
    // Dashboard luôn hiển thị
    if (item.requiredPermissions.length === 0 && item.path === '/manager') {
      return true;
    }
    
    // Các module khác check permissions
    return hasModuleAccess(item.requiredPermissions);
  });

  return (
    <Box sx={{ display: 'flex' }}>
      <CssBaseline />
      <Drawer
        sx={{
          width: drawerWidth,
          flexShrink: 0,
            '& .MuiDrawer-paper': {
              width: drawerWidth,
              boxSizing: 'border-box',
              backgroundColor: '#211832',
              color: '#F25912',
            },
        }}
        variant="persistent"
        anchor="left"
        open={open}
      >
        <DrawerHeader>
          <IconButton onClick={onClose} sx={{ color: '#F25912' }}>
            {theme.direction === 'ltr' ? <ChevronLeftIcon /> : <ChevronRightIcon />}
          </IconButton>
        </DrawerHeader>
        <Divider />
        <List>
          {visibleMenuItems.map((item) => (
            <ListItem key={item.text} disablePadding>
              <ListItemButton
                sx={{ color: '#F25912' }}
                onClick={() => {
                  router.push(item.path);
                  onClose?.();
                }}
              >
                <ListItemIcon sx={{ color: '#F25912' }}>
                  {item.icon}
                </ListItemIcon>
                <ListItemText primary={item.text} />
              </ListItemButton>
            </ListItem>
          ))}
        </List>
      </Drawer>
      <Main open={open}>
        {children}
      </Main>
    </Box>
  );
}
