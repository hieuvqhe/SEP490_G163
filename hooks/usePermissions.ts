import { useAuthStore } from '@/store/authStore';
import { useGetManagerStaffProfile, hasPermission, hasAnyPermission, hasPermissionForPartner, hasAnyPermissionForPartner } from '@/apis/staff.manager.api';

/**
 * Custom hook to check user permissions
 * Returns permission checking functions based on user role and granted permissions
 */
export const usePermissions = () => {
  const { role, accessToken } = useAuthStore();
  
  // Get staff profile if user is ManagerStaff
  const { data: staffProfile } = useGetManagerStaffProfile(
    role?.toLowerCase() === 'managerstaff' ? accessToken || undefined : undefined
  );

  const isManager = role?.toLowerCase() === 'manager';
  const permissions = staffProfile?.result?.grantedPermissions || [];

  /**
   * Check if user has a specific permission
   * Manager always has all permissions
   */
  const checkPermission = (permissionCode: string): boolean => {
    if (isManager) return true;
    return hasPermission(permissions, permissionCode);
  };

  /**
   * Check if user has any of the specified permissions
   * Manager always has all permissions
   */
  const checkAnyPermission = (permissionCodes: string[]): boolean => {
    if (isManager) return true;
    return hasAnyPermission(permissions, permissionCodes);
  };

  /**
   * Check if user has a specific permission for a partner
   * Manager always has all permissions
   */
  const checkPermissionForPartner = (permissionCode: string, partnerId: number): boolean => {
    if (isManager) return true;
    return hasPermissionForPartner(permissions, permissionCode, partnerId);
  };

  /**
   * Check if user has any of the specified permissions for a partner
   * Manager always has all permissions
   */
  const checkAnyPermissionForPartner = (permissionCodes: string[], partnerId: number): boolean => {
    if (isManager) return true;
    return hasAnyPermissionForPartner(permissions, permissionCodes, partnerId);
  };

  /**
   * Check if user can perform CRUD operations on a resource
   */
  const canCreate = (resource: string) => checkPermission(`${resource}_CREATE`);
  const canRead = (resource: string) => checkPermission(`${resource}_READ`);
  const canUpdate = (resource: string) => checkPermission(`${resource}_UPDATE`);
  const canDelete = (resource: string) => checkPermission(`${resource}_DELETE`);
  const canApprove = (resource: string) => checkPermission(`${resource}_APPROVE`);
  const canReject = (resource: string) => checkPermission(`${resource}_REJECT`);
  const canSend = (resource: string) => checkPermission(`${resource}_SEND`);

  /**
   * Check if user can perform CRUD operations on a resource for a specific partner
   */
  const canCreateForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_CREATE`, partnerId);
  const canReadForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_READ`, partnerId);
  const canUpdateForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_UPDATE`, partnerId);
  const canDeleteForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_DELETE`, partnerId);
  const canApproveForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_APPROVE`, partnerId);
  const canRejectForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_REJECT`, partnerId);
  const canSendForPartner = (resource: string, partnerId: number) => checkPermissionForPartner(`${resource}_SEND`, partnerId);

  return {
    isManager,
    permissions,
    checkPermission,
    checkAnyPermission,
    checkPermissionForPartner,
    checkAnyPermissionForPartner,
    canCreate,
    canRead,
    canUpdate,
    canDelete,
    canApprove,
    canReject,
    canSend,
    canCreateForPartner,
    canReadForPartner,
    canUpdateForPartner,
    canDeleteForPartner,
    canApproveForPartner,
    canRejectForPartner,
    canSendForPartner,
  };
};
