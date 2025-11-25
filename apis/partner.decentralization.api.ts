import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export interface PartnerEmployee {
  employeeId: number;
  userId: number;
  fullName: string;
  email: string;
  phone: string;
  roleType: "Staff" | "Marketing" | "Cashier";
  hireDate: string;
  isActive: boolean;
  createdAt?: string;
  updatedAt?: string;
}

export type PartnerEmployeeDetail = PartnerEmployee;

export interface PartnerEmployeesPagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious: boolean;
  hasNext: boolean;
}

export interface GetPartnerEmployeesResponse {
  message: string;
  result: {
    employees: PartnerEmployee[];
    pagination: PartnerEmployeesPagination;
  };
}

export interface GetPartnerEmployeeByIdResponse {
  message: string;
  result: PartnerEmployeeDetail;
}

export interface CreatePartnerEmployeeRequest {
  fullName: string;
  email: string;
  phone: string;
  password: string;
  confirmPassword: string;
  roleType: "Staff" | "Marketing" | "Cashier";
  hireDate?: string;
}

export interface CreatePartnerEmployeeResponse {
  message: string;
  result: {
    employeeId: number;
    userId: number;
    fullName: string;
    email: string;
    phone: string;
    roleType: "Staff" | "Marketing" | "Cashier";
    hireDate: string;
    isActive: boolean;
  };
}

export interface UpdatePartnerEmployeeRequest {
  fullName?: string;
  phone?: string;
  roleType?: "Staff" | "Marketing" | "Cashier";
  isActive?: boolean;
}

export interface UpdatePartnerEmployeeResponse {
  message: string;
  result: PartnerEmployeeDetail;
}

export interface DeletePartnerEmployeeResponse {
  message: string;
  result?: {
    employeeId: number;
    message?: string;
    isActive: boolean;
    updatedAt: string;
  };
}

export interface AssignCinemaToEmployeeRequest {
  employeeId: number;
  cinemaIds: number[];
}

export interface AssignCinemaToEmployeeResponse {
  message: string;
  result: null;
}

export interface UnassignCinemaFromEmployeeRequest {
  employeeId: number;
  cinemaIds: number[];
}

export interface UnassignCinemaFromEmployeeResponse {
  message: string;
  result: null;
}

export interface CinemaAssignment {
  assignmentId: number;
  employeeId: number;
  employeeName: string;
  cinemaId: number;
  cinemaName: string;
  cinemaCity: string;
  assignedAt: string;
  isActive: boolean;
}

export interface GetCinemaAssignmentsResponse {
  message: string;
  result: CinemaAssignment[];
}

export interface GetPartnerEmployeesParams {
  page?: number;
  limit?: number;
  roleType?: "Staff" | "Marketing" | "Cashier";
  isActive?: boolean;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
  search?: string;
}

export class PartnerEmployeeApiError extends Error {
  status?: number;
  errors?: Record<string, unknown>;

  constructor(message: string, status?: number, errors?: Record<string, unknown>) {
    super(message);
    this.name = "PartnerEmployeeApiError";
    this.status = status;
    this.errors = errors;
  }
}

const createPartnerEmployeeRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : undefined,
      Accept: "application/json",
      "Content-Type": "application/json",
    },
  });
};

const handlePartnerEmployeeError = (
  error: unknown,
  fallbackMessage = "Đã xảy ra lỗi hệ thống khi thao tác với nhân viên."
): never => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const data = error.response?.data as Record<string, unknown> | undefined;
    const message =
      typeof data?.message === "string" && data.message.trim() !== ""
        ? (data.message as string)
        : status === 401 || status === 403
          ? "Xác thực thất bại"
          : fallbackMessage;
    const errors = data?.errors && typeof data.errors === "object"
      ? (data.errors as Record<string, unknown>)
      : undefined;

    throw new PartnerEmployeeApiError(message, status, errors);
  }

  throw new PartnerEmployeeApiError(
    "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng."
  );
};

class PartnerEmployeeService {
  private readonly basePath = "/partners/employees";
  private readonly cinemaAssignmentPath = "/partners/employees/cinema-assignments";

  async getEmployees(params: GetPartnerEmployeesParams = {}): Promise<GetPartnerEmployeesResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const queryParams = new URLSearchParams();

      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.roleType) queryParams.append("roleType", params.roleType);
      if (params.isActive !== undefined)
        queryParams.append("isActive", String(params.isActive));
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);
      if (params.search) queryParams.append("search", params.search);

      const endpoint = `${this.basePath}${queryParams.toString() ? `?${queryParams.toString()}` : ""}`;
      const response = await client.get<GetPartnerEmployeesResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi lấy danh sách nhân viên.");
    }
  }

  async getEmployeeById(employeeId: number): Promise<GetPartnerEmployeeByIdResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const response = await client.get<GetPartnerEmployeeByIdResponse>(`${this.basePath}/${employeeId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi lấy thông tin nhân viên.");
    }
  }

  async createEmployee(data: CreatePartnerEmployeeRequest): Promise<CreatePartnerEmployeeResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const response = await client.post<CreatePartnerEmployeeResponse>(this.basePath, data);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi tạo nhân viên.");
    }
  }

  async updateEmployee(
    employeeId: number,
    data: UpdatePartnerEmployeeRequest
  ): Promise<UpdatePartnerEmployeeResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const response = await client.put<UpdatePartnerEmployeeResponse>(`${this.basePath}/${employeeId}`, data);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi cập nhật nhân viên.");
    }
  }

  async deleteEmployee(employeeId: number): Promise<DeletePartnerEmployeeResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const response = await client.delete<DeletePartnerEmployeeResponse>(`${this.basePath}/${employeeId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi xóa nhân viên.");
    }
  }

  async assignCinemaToEmployee(data: AssignCinemaToEmployeeRequest): Promise<AssignCinemaToEmployeeResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const response = await client.post<AssignCinemaToEmployeeResponse>(this.cinemaAssignmentPath, data);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi phân quyền rạp.");
    }
  }

  async unassignCinemaFromEmployee(data: UnassignCinemaFromEmployeeRequest): Promise<UnassignCinemaFromEmployeeResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      const response = await client.delete<UnassignCinemaFromEmployeeResponse>(this.cinemaAssignmentPath, {
        data: data,
      });
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi hủy phân quyền rạp.");
    }
  }

  async getCinemaAssignments(employeeId?: number): Promise<GetCinemaAssignmentsResponse> {
    try {
      const client = createPartnerEmployeeRequest();
      // API endpoint theo format: /partners/employees/{employeeId}/cinema-assignments
      const endpoint = employeeId !== undefined 
        ? `${this.basePath}/${employeeId}/cinema-assignments`
        : this.cinemaAssignmentPath;
      const response = await client.get<GetCinemaAssignmentsResponse>(endpoint);
      return response.data;
    } catch (error) {
      throw handlePartnerEmployeeError(error, "Đã xảy ra lỗi hệ thống khi lấy danh sách phân quyền.");
    }
  }
}

export const partnerEmployeeService = new PartnerEmployeeService();

export const useGetPartnerEmployees = (params: GetPartnerEmployeesParams = {}) => {
  return useQuery({
    queryKey: ["partner-employees", params],
    queryFn: () => partnerEmployeeService.getEmployees(params),
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetPartnerEmployeeById = (employeeId?: number) => {
  return useQuery({
    queryKey: ["partner-employee", employeeId],
    queryFn: () => partnerEmployeeService.getEmployeeById(employeeId!),
    enabled: !!employeeId,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const usePrefetchPartnerEmployees = () => {
  const queryClient = useQueryClient();

  return (params: GetPartnerEmployeesParams = {}) =>
    queryClient.prefetchQuery({
      queryKey: ["partner-employees", params],
      queryFn: () => partnerEmployeeService.getEmployees(params),
    });
};

export const useInvalidatePartnerEmployees = () => {
  const queryClient = useQueryClient();

  return (params?: GetPartnerEmployeesParams) => {
    if (params) {
      queryClient.invalidateQueries({ queryKey: ["partner-employees", params] });
    } else {
      queryClient.invalidateQueries({ queryKey: ["partner-employees"] });
    }
  };
};

export const useCreatePartnerEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: CreatePartnerEmployeeRequest) => partnerEmployeeService.createEmployee(payload),
    onSuccess: (response) => {
      queryClient.invalidateQueries({ queryKey: ["partner-employees"] });
      if (response?.result?.employeeId) {
        queryClient.setQueryData(["partner-employee", response.result.employeeId], response);
      }
    },
  });
};

export const useUpdatePartnerEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: ({
      employeeId,
      payload,
    }: {
      employeeId: number;
      payload: UpdatePartnerEmployeeRequest;
    }) => partnerEmployeeService.updateEmployee(employeeId, payload),
    onSuccess: (response, variables) => {
      queryClient.invalidateQueries({ queryKey: ["partner-employees"] });
      if (variables?.employeeId) {
        queryClient.invalidateQueries({ queryKey: ["partner-employee", variables.employeeId] });
        queryClient.setQueryData(["partner-employee", variables.employeeId], response);
      }
    },
  });
};

export const useDeletePartnerEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (employeeId: number) => partnerEmployeeService.deleteEmployee(employeeId),
    onSuccess: (_, employeeId) => {
      queryClient.invalidateQueries({ queryKey: ["partner-employees"] });
      if (employeeId !== undefined) {
        queryClient.removeQueries({ queryKey: ["partner-employee", employeeId] });
      }
    },
  });
};

export const useAssignCinemaToEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: AssignCinemaToEmployeeRequest) => partnerEmployeeService.assignCinemaToEmployee(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cinema-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["cinema-assignments", variables.employeeId] });
    },
  });
};

export const useUnassignCinemaFromEmployee = () => {
  const queryClient = useQueryClient();

  return useMutation({
    mutationFn: (payload: UnassignCinemaFromEmployeeRequest) => partnerEmployeeService.unassignCinemaFromEmployee(payload),
    onSuccess: (_, variables) => {
      queryClient.invalidateQueries({ queryKey: ["cinema-assignments"] });
      queryClient.invalidateQueries({ queryKey: ["cinema-assignments", variables.employeeId] });
    },
  });
};

export const useGetCinemaAssignments = (employeeId?: number, options?: { enabled?: boolean }) => {
  return useQuery({
    queryKey: ["cinema-assignments", employeeId],
    queryFn: () => partnerEmployeeService.getCinemaAssignments(employeeId),
    enabled: options?.enabled !== false,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};
