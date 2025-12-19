import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import { useQuery, useMutation, useQueryClient } from "@tanstack/react-query";
import axios from "axios";

// Admin API interfaces
export interface GetUsersParams {
  page?: number;
  limit?: number;
  sort_by?: string;
  sort_order?: "asc" | "desc";
  search?: string;
  role?: "customer" | "employee" | "admin" | "partner" | "manager";
  verify?: 0 | 1 | 2; // 0=unverified, 1=verified, 2=banned
}

export interface UserStats {
  bookingsCount: number;
  ratingsCount: number;
  commentsCount: number;
}

export interface AdminUser {
  id: number;
  name: string;
  email: string;
  username: string;
  role: string;
  verify: number;
  createdAt: string;
  stats: UserStats;
}

export interface GetUsersResponse {
  message: string;
  result: {
    users: AdminUser[];
    page: number;
    limit: number;
    total: number;
    totalPages: number;
  };
}

export interface DeleteUserResponse {
  message: string;
  result: {
    userId: string;
    deleted: boolean;
    deactivatedAt: string;
  };
}

export interface GetUserByIdResponse {
  message: string;
  result: {
    userId: number;
    email: string;
    phone: string | null;
    userType: string;
    fullname: string;
    isActive: boolean;
    createdAt: string;
    emailConfirmed: boolean;
    username: string;
    avataUrl: string;
    updatedAt: string | null;
    isBanned: boolean;
    bannedAt: string | null;
    unbannedAt: string | null;
    deactivatedAt: string | null;
  };
}

export interface UpdateUserRequest {
  email: string;
  phone: string;
  userType: string;
  fullname: string;
  username: string;
  avataUrl: string;
}

export interface UpdateUserResponse {
  message: string;
  result: {
    userId: string;
    email: string;
    phone: string;
    userType: string;
    fullname: string;
    isActive: boolean;
    createdAt: string;
    emailConfirmed: boolean;
    username: string;
    avataUrl: string;
    updatedAt: string;
    isBanned: boolean;
    bannedAt: string | null;
    unbannedAt: string | null;
    deactivatedAt: string | null;
  };
}

export interface BanUserResponse {
  message: string;
  result: {
    userId: string;
    isBanned: boolean;
    bannedAt: string;
  };
}

export interface UnbanUserResponse {
  message: string;
  result: {
    userId: string;
    isBanned: boolean;
    unbannedAt: string;
  };
}

export interface UpdateUserRoleRequest {
  role: string;
}

export interface UpdateUserRoleResponse {
  message: string;
  result: {
    userId: string;
    role: string;
    updatedAt: string;
  };
}

export interface AdminApiError {
  message: string;
  errorInfo?: {
    name: string;
    message: string;
  };
}

export interface CreateNewUserBody {
  fullName: string;
  username: string;
  email: string;
  password: string;
  confirmPassword: string;
  phone: string;
  role: string;
  managerId: number;
  hireDate: string;
}

interface CreateNewUserResponse {
  message: string;
  result: {
    userId: number;
    email: string;
    phone: string;
    userType: string;
    fullname: string;
    isActive: boolean;
    createdAt: string;
    emailConfirmed: boolean;
    username: string;
    avataUrl: string;
    updatedAt: string;
    isBanned: boolean;
    bannedAt: string;
    unbannedAt: string;
    deactivatedAt: string;
  };
}

const createAdminRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};

const adminApi = createAdminRequest();

class AdminService {
  private baseURL = `${BASE_URL}/api/admin`;

  async getUsers(
    params: GetUsersParams,
    accessToken: string
  ): Promise<GetUsersResponse> {
    try {
      // Build query string from params
      const queryParams = new URLSearchParams();

      if (params.page !== undefined)
        queryParams.append("page", params.page.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.sort_by) queryParams.append("sort_by", params.sort_by);
      if (params.sort_order)
        queryParams.append("sort_order", params.sort_order);
      if (params.search) queryParams.append("search", params.search);
      if (params.role) queryParams.append("role", params.role);
      if (params.verify !== undefined)
        queryParams.append("verify", params.verify.toString());

      const url = `${this.baseURL}/users${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  // Future admin methods can be added here
  async updateUser(
    userId: number,
    data: UpdateUserRequest,
    accessToken: string
  ): Promise<UpdateUserResponse> {
    try {
      const url = `${this.baseURL}/users/${userId}`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  async getUserById(
    userId: number,
    accessToken: string
  ): Promise<GetUserByIdResponse> {
    try {
      const url = `${this.baseURL}/users/${userId}`;

      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  async deleteUser(
    userId: number,
    accessToken: string
  ): Promise<DeleteUserResponse> {
    try {
      const url = `${this.baseURL}/users/${userId}`;

      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  async banUser(userId: number, accessToken: string): Promise<BanUserResponse> {
    try {
      const url = `${this.baseURL}/users/${userId}/ban`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  async unbanUser(
    userId: number,
    accessToken: string
  ): Promise<UnbanUserResponse> {
    try {
      const url = `${this.baseURL}/users/${userId}/unban`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  async updateUserRole(
    userId: number,
    data: UpdateUserRoleRequest,
    accessToken: string
  ): Promise<UpdateUserRoleResponse> {
    try {
      const url = `${this.baseURL}/users/${userId}/role`;

      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          "Content-Type": "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
        body: JSON.stringify(data),
      });

      const result = await response.json();

      if (!response.ok) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }

  async createNewUser(body: CreateNewUserBody): Promise<CreateNewUserResponse> {
    try {
      const url = `${this.baseURL}/users`;

      const response = await adminApi.post(url, body);

      const result = await response.data;

      if (!response.data) {
        throw result as AdminApiError;
      }

      return result;
    } catch (error: any) {
      // Handle network errors
      if (error.name === "TypeError") {
        throw {
          message:
            "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng.",
        } as AdminApiError;
      }

      // Re-throw API errors as-is
      throw error;
    }
  }
}

export const adminService = new AdminService();

// TanStack Query hooks for admin APIs
export const useGetUsers = (params: GetUsersParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["admin-users", params],
    queryFn: () => adminService.getUsers(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000, // 5 minutes
    gcTime: 10 * 60 * 1000, // 10 minutes
  });
};

export const useGetUserById = (userId: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["admin-user", userId],
    queryFn: () => adminService.getUserById(userId, accessToken!),
    enabled: !!accessToken && !!userId,
    staleTime: 2 * 60 * 1000, // 2 minutes
    gcTime: 5 * 60 * 1000, // 5 minutes
  });
};

export const useUpdateUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
      accessToken,
    }: {
      userId: number;
      data: UpdateUserRequest;
      accessToken: string;
    }) => adminService.updateUser(userId, data, accessToken),
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch the specific user and users list after successful update
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useDeleteUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      accessToken,
    }: {
      userId: number;
      accessToken: string;
    }) => adminService.deleteUser(userId, accessToken),
    onSuccess: () => {
      // Invalidate and refetch users queries after successful deletion
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useBanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      accessToken,
    }: {
      userId: number;
      accessToken: string;
    }) => adminService.banUser(userId, accessToken),
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch the specific user and users list after successful ban
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useUnbanUser = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      accessToken,
    }: {
      userId: number;
      accessToken: string;
    }) => adminService.unbanUser(userId, accessToken),
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch the specific user and users list after successful unban
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useUpdateUserRole = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      userId,
      data,
      accessToken,
    }: {
      userId: number;
      data: UpdateUserRoleRequest;
      accessToken: string;
    }) => adminService.updateUserRole(userId, data, accessToken),
    onSuccess: (_, { userId }) => {
      // Invalidate and refetch the specific user and users list after successful role update
      queryClient.invalidateQueries({ queryKey: ["admin-user", userId] });
      queryClient.invalidateQueries({ queryKey: ["admin-users"] });
    },
  });
};

export const useCreateNewUserMutate = () => {
  return useMutation({
    mutationFn: (data: CreateNewUserBody) => adminService.createNewUser(data),
  });
};
