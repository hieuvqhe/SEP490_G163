import { BASE_URL } from "@/constants";
import { useMutation, useQuery, useQueryClient } from "@tanstack/react-query";

export type MovieSubmissionStatus = "Pending" | "Rejected" | "Resubmitted" | "Approved";

export interface MovieSubmissionPartner {
  partnerId: number;
  partnerName: string;
}

export interface MovieSubmissionSummary {
  movieSubmissionId: number;
  title: string;
  director: string;
  genre: string;
  status: MovieSubmissionStatus;
  submittedAt: string;
  createdAt: string;
  updatedAt: string;
  partner: MovieSubmissionPartner;
}

export interface MovieSubmissionActor {
  movieSubmissionActorId: number;
  actorId: number | null;
  actorName: string;
  actorAvatarUrl: string | null;
  role: string | null;
  isExistingActor: boolean;
}

export interface MovieSubmissionDetail extends MovieSubmissionSummary {
  description: string;
  language: string;
  country: string;
  production?: string | null;
  premiereDate: string;
  endDate: string;
  posterUrl?: string | null;
  bannerUrl?: string | null;
  trailerUrl?: string | null;
  durationMinutes?: number | null;
  copyrightDocumentUrl?: string | null;
  distributionLicenseUrl?: string | null;
  additionalNotes?: string | null;
  reviewedAt?: string | null;
  rejectionReason?: string | null;
  movieId?: number | null;
  actors: MovieSubmissionActor[];
}

export interface MovieSubmissionReviewResult extends MovieSubmissionDetail {
  durationMinutes: number;
  production: string;
  trailerUrl: string;
  copyrightDocumentUrl: string;
  distributionLicenseUrl: string;
  additionalNotes: string | null;
  reviewedAt: string;
  rejectionReason: string | null;
  movieId: number | null;
}

export interface Pagination {
  currentPage: number;
  pageSize: number;
  totalCount: number;
  totalPages: number;
  hasPrevious?: boolean;
  hasNext?: boolean;
}

export interface GetMovieSubmissionsResponse {
  message: string;
  result: {
    submissions: MovieSubmissionSummary[];
    pagination: Pagination;
  };
}

export interface GetMovieSubmissionByIdResponse {
  message: string;
  result: MovieSubmissionDetail;
}

export interface ApproveMovieSubmissionResponse {
  message: string;
  result: MovieSubmissionReviewResult;
}

export interface RejectMovieSubmissionRequest {
  reason: string;
}

export interface RejectMovieSubmissionResponse {
  message: string;
  result: MovieSubmissionReviewResult;
}

export interface ManagerMovieApiError {
  message: string;
  detail?: string;
}

export interface GetMovieSubmissionsParams {
  page?: number;
  limit?: number;
  status?: MovieSubmissionStatus;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

class ManagerMovieService {
  private baseURL = `${BASE_URL}/api/manager`;

  async getMovieSubmissions(params: GetMovieSubmissionsParams, accessToken: string): Promise<GetMovieSubmissionsResponse> {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined) queryParams.append("page", params.page.toString());
      if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
      if (params.status) queryParams.append("status", params.status);
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const queryString = queryParams.toString();
      const url = `${this.baseURL}/movie-submissions${queryString ? `?${queryString}` : ""}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerMovieApiError;
      }
      return result as GetMovieSubmissionsResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }

  async getMovieSubmissionById(movieSubmissionId: number, accessToken: string): Promise<GetMovieSubmissionByIdResponse> {
    try {
      const url = `${this.baseURL}/movie-submissions/${movieSubmissionId}`;
      const response = await fetch(url, {
        method: "GET",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerMovieApiError;
      }
      return result as GetMovieSubmissionByIdResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }

  async approveMovieSubmission(
    movieSubmissionId: number,
    accessToken: string,
  ): Promise<ApproveMovieSubmissionResponse> {
    try {
      const url = `${this.baseURL}/movie-submissions/${movieSubmissionId}/approve`;
      const response = await fetch(url, {
        method: "PUT",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });
      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerMovieApiError;
      }
      return result as ApproveMovieSubmissionResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }

  async rejectMovieSubmission(
    movieSubmissionId: number,
    data: RejectMovieSubmissionRequest,
    accessToken: string,
  ): Promise<RejectMovieSubmissionResponse> {
    try {
      const url = `${this.baseURL}/movie-submissions/${movieSubmissionId}/reject`;
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
        throw result as ManagerMovieApiError;
      }
      return result as RejectMovieSubmissionResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }
}

export const managerMovieService = new ManagerMovieService();

export const useGetMovieSubmissions = (params: GetMovieSubmissionsParams, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-movie-submissions", params],
    queryFn: () => managerMovieService.getMovieSubmissions(params, accessToken!),
    enabled: !!accessToken,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetMovieSubmissionById = (movieSubmissionId?: number, accessToken?: string) => {
  return useQuery({
    queryKey: ["manager-movie-submission", movieSubmissionId],
    queryFn: () =>
      managerMovieService.getMovieSubmissionById(movieSubmissionId as number, accessToken!),
    enabled: !!accessToken && typeof movieSubmissionId === "number" && movieSubmissionId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useApproveMovieSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ movieSubmissionId, accessToken }: { movieSubmissionId: number; accessToken: string }) =>
      managerMovieService.approveMovieSubmission(movieSubmissionId, accessToken),
    onSuccess: (_, { movieSubmissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-movie-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["manager-movie-submission", movieSubmissionId] });
    },
  });
};

export const useRejectMovieSubmission = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({
      movieSubmissionId,
      data,
      accessToken,
    }: {
      movieSubmissionId: number;
      data: RejectMovieSubmissionRequest;
      accessToken: string;
    }) => managerMovieService.rejectMovieSubmission(movieSubmissionId, data, accessToken),
    onSuccess: (_, { movieSubmissionId }) => {
      queryClient.invalidateQueries({ queryKey: ["manager-movie-submissions"] });
      queryClient.invalidateQueries({ queryKey: ["manager-movie-submission", movieSubmissionId] });
    },
  });
};
