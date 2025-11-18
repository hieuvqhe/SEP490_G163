import { keepPreviousData, useMutation, useQuery, useQueryClient } from "@tanstack/react-query";
import { createPartnerRequest, handlePartnerError } from "./partner.api";
import {
  GetActorByIdResponse,
  GetActorsParams,
  GetActorsResponse,
} from "./manager.actor.api";

// ===============================
// MOVIES MANAGEMENT INTERFACE
// ===============================

interface NewActor {
  name: string;
  avatarUrl: string;
  role: string;
}

export interface CreateMovieSubmissionReq {
  title: string;
  genre: string;
  durationMinutes: number;
  director: string;
  language: string;
  country: string;
  posterUrl: string; // .webp
  bannerUrl: string; // .jpg
  production: string;
  description: string;
  premiereDate: string; // ISO date (vd: "2025-11-03")
  endDate: string; // ISO date
  trailerUrl: string; // youtu.be
  copyrightDocumentUrl: string; // .jpeg
  distributionLicenseUrl: string; // .pdf
  additionalNotes: string;
  actorIds: number[] | null;
  newActors: NewActor[] | null;
  actorRoles: Record<string, string> | null;
}

export interface MovieSubmissionActor {
  movieSubmissionActorId: number;
  actorId: number | null;
  actorName: string;
  actorAvatarUrl: string;
  role: string;
  isExistingActor: boolean;
}

export interface MovieSubmissionResult {
  movieSubmissionId: number;
  title: string;
  genre: string;
  durationMinutes: number;
  director: string;
  language: string;
  country: string;
  posterUrl: string;
  bannerUrl: string;
  production: string;
  description: string;
  premiereDate: string; // "2025-11-03"
  endDate: string; // "2025-11-03"
  trailerUrl: string;
  copyrightDocumentUrl: string;
  distributionLicenseUrl: string;
  additionalNotes: string;
  status: string;
  submittedAt: string | null;
  reviewedAt: string | null;
  rejectionReason: string | null;
  movieId: number | null;
  createdAt: string; // ISO timestamp
  updatedAt: string; // ISO timestamp
  actors: MovieSubmissionActor[];
}

interface MovieSubmissionResponse {
  message: string;
  result: MovieSubmissionResult;
}

interface MovieSubmissionParams {
  page?: number;
  pageSize?: number;
  status?: string;
  search?: string;
  sortBy?: string;
  sortOrder?: "asc" | "desc";
}

interface GetMoviesSubmissionResponse {
  message: string;
  result: {
    submissions: MovieSubmissionResult[];
    pagination: {
      currentPage: number;
      pageSize: number;
      totalCount: number;
      totalPages: number;
      hasPrevious: boolean;
      hasNext: boolean;
    };
  };
}

interface MovieDetailResponse {
  message: string;
  result: MovieSubmissionResult;
}

interface UpdateDataRequest {
  title: string;
  genre: string;
  durationMinutes: number;
  director: string;
  language: string;
  country: string;
  posterUrl: string;
  bannerUrl: string;
  production: string;
  description: string;
  premiereDate: string;
  endDate: string;
  trailerUrl: string;
  copyrightDocumentUrl: string;
  distributionLicenseUrl: string;
  additionalNotes: string;
  actorIds: number[] | null;
  newActors: NewActor[] | null;
  actorRoles: Record<string, string> | null;
}

interface MovieSubSubmitResponse {
  message: string;
  result: {
    movieSubmissionId: number;
    title: string;
    status: string;
    submittedAt: Date;
    message: string;
  };
}

interface DeleteMovieSubResponse {
  message: string;
  result: string;
}

interface ActorRequest {
  actorId?: number | null;
  actorName?: string | null;
  actorAvatarUrl?: string | null;
  role: string;
}

interface CreateNewActorResponse {
  message: string;
  result: {
    movieSubmissionActorId: number;
    actorId: number | null;
    actorName: string;
    actorAvatarUrl: string | null;
    role: string;
    isExistingActor: boolean;
  };
}

interface GetActorsByMovieSubId {
  message: string;
  result: {
    actors: [
      {
        movieSubmissionActorId: number;
        actorId: number;
        actorName: string;
        actorAvatarUrl: string;
        role: string;
        isExistingActor: boolean;
      }
    ];
    totalCount: number;
  };
}

interface NewActorReq {
  role: string;
  actorName: string;
  actorAvatarUrl: string;
}

interface DeleteActorFromMovieSubRes {
  message: string;
  result: string;
}

interface UpdateActorInMovieSubRes {
  message: string;
  result: MovieSubmissionActor;
}

// ===============================
// MOVIES MANAGEMENT APIS
// ===============================

const partnerApi = createPartnerRequest();

class PartnerMoviesManagement {
  private readonly basePath = "/api/partners/movie-submissions";

  createMovieSubmission = async (
    movieData: CreateMovieSubmissionReq
  ): Promise<MovieSubmissionResponse> => {
    try {
      const response = await partnerApi.post(this.basePath, movieData);
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  getMoviesSubmission = async (
    params?: MovieSubmissionParams
  ): Promise<GetMoviesSubmissionResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params?.page) queryParams.append("page", params.page.toString());
      if (params?.pageSize) queryParams.append("pageSize", params.pageSize.toString());
      if (params?.status && params.status !== "all") {
        queryParams.append("status", params.status);
      }
      if (params?.search) queryParams.append("search", params.search);
      if (params?.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params?.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${this.basePath}${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await partnerApi.get<GetMoviesSubmissionResponse>(url);

      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  getMoviesSubmissionDetail = async (
    movieId: number
  ): Promise<MovieDetailResponse> => {
    try {
      const response = await partnerApi.get(`${this.basePath}/${movieId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  updateMovieSubmission = async (
    movieId: number,
    data: UpdateDataRequest
  ): Promise<MovieDetailResponse> => {
    try {
      const response = await partnerApi.put(
        `${this.basePath}/${movieId}`,
        data
      );
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  submitMovieSub = async (movieId: number): Promise<MovieSubSubmitResponse> => {
    try {
      const response = await partnerApi.post(
        `${this.basePath}/${movieId}/submit`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  deleteMovieSub = async (movieId: number): Promise<DeleteMovieSubResponse> => {
    try {
      const response = await partnerApi.delete(`${this.basePath}/${movieId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };
}

class PartnerActorsManagement {
  private readonly basePath = "/api/partners/movie-submissions";

  getActors = async (params: GetActorsParams): Promise<GetActorsResponse> => {
    try {
      const queryParams = new URLSearchParams();
      if (params.page !== undefined)
        queryParams.append("page", params.page.toString());
      if (params.limit !== undefined)
        queryParams.append("limit", params.limit.toString());
      if (params.search) queryParams.append("search", params.search);
      if (params.sortBy) queryParams.append("sortBy", params.sortBy);
      if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

      const url = `${this.basePath}/actors/available${
        queryParams.toString() ? "?" + queryParams.toString() : ""
      }`;

      const response = await partnerApi.get(url);

      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  getActorDetail = async (actorId: number): Promise<GetActorByIdResponse> => {
    try {
      const response = await partnerApi.get(`${this.basePath}/${actorId}`);
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  createNewActor = async (
    submissionId: number,
    actorReq: ActorRequest
  ): Promise<CreateNewActorResponse> => {
    try {
      const response = await partnerApi.post(
        `${this.basePath}/${submissionId}/actors`,
        actorReq
      );
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  getActorsByMovieSubId = async (
    submissionId: number
  ): Promise<GetActorsByMovieSubId> => {
    try {
      const response = await partnerApi.get(
        `${this.basePath}/${submissionId}/actors`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  updateActorsInMovieSub = async (
    submissionId: number,
    actorId: number,
    newActor: NewActorReq
  ): Promise<UpdateActorInMovieSubRes> => {
    try {
      const response = await partnerApi.put(
        `${this.basePath}/${submissionId}/actors/${actorId}`,
        newActor
      );
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };

  removeActorFromMovieSub = async (
    submissionId: number,
    actorId: number
  ): Promise<DeleteActorFromMovieSubRes> => {
    try {
      const response = await partnerApi.delete(
        `${this.basePath}/${submissionId}/actors/${actorId}`
      );
      return response.data;
    } catch (error) {
      throw handlePartnerError(error);
    }
  };
}

export const partnerMovieSubmissionService = new PartnerMoviesManagement();
export const partnerActorsService = new PartnerActorsManagement();

// ===============================
// MOVIES MANAGEMENT CUSTOM HOOK
// ===============================

export const useCreateMovieSub = () => {
  const queryClient = useQueryClient();

  return useMutation<MovieSubmissionResponse, Error, CreateMovieSubmissionReq>({
    mutationFn: (data) =>
      partnerMovieSubmissionService.createMovieSubmission(data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
    },
  });
};

export const useMoviesSubmission = (params?: MovieSubmissionParams) => {
  return useQuery<GetMoviesSubmissionResponse, Error>({
    queryKey: ["movie-submissions", params],
    queryFn: () => partnerMovieSubmissionService.getMoviesSubmission(params),
  });
};

export const useMovieSubmissionDetail = (movieId?: number) => {
  return useQuery<MovieDetailResponse, Error>({
    queryKey: ["movie-submission-detail", movieId],
    queryFn: () =>
      partnerMovieSubmissionService.getMoviesSubmissionDetail(movieId!),
    enabled: !!movieId,
  });
};

export const useUpdateMovieSub = (movieId: number) => {
  const queryClient = useQueryClient();

  return useMutation<MovieDetailResponse, Error, UpdateDataRequest>({
    mutationFn: (data) =>
      partnerMovieSubmissionService.updateMovieSubmission(movieId, data),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["movie-submission-detail", movieId],
      });
    },
  });
};

export const useSubmitMovieSub = (movieId: number) => {
  const queryClient = useQueryClient();

  return useMutation<MovieSubSubmitResponse, Error>({
    mutationFn: () => partnerMovieSubmissionService.submitMovieSub(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
      queryClient.invalidateQueries({
        queryKey: ["movie-submission-detail", movieId],
      });
    },
  });
};

export const useDeleteMovieSub = (movieId: number) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteMovieSubResponse, Error>({
    mutationFn: () => partnerMovieSubmissionService.deleteMovieSub(movieId),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
    },
  });
};

// ===============================
// ACTORS MANAGEMENT CUSTOM HOOK
// ===============================

export const useGetActors = (params?: GetActorsParams) => {
  return useQuery<GetActorsResponse>({
    queryKey: [
      "partner",
      "actors",
      params?.page ?? 1,
      params?.limit ?? 10,
      params?.search ?? "",
      params?.sortBy ?? "",
      params?.sortOrder ?? "",
    ],
    queryFn: () =>
      partnerActorsService.getActors(params || { page: 1, limit: 10 }),
    placeholderData: keepPreviousData,
  });
};

export const useGetActorDetail = (actorId: number | undefined) => {
  return useQuery<GetActorByIdResponse>({
    queryKey: ["partner", "actor", actorId],
    queryFn: () => {
      if (!actorId) throw new Error("Actor ID không hợp lệ");
      return partnerActorsService.getActorDetail(actorId);
    },
    enabled: !!actorId,
  });
};

export const useGetActorsByMovieSubId = (submissionId: number | undefined) => {
  return useQuery<GetActorsByMovieSubId>({
    queryKey: ["partner", "movie-submission", submissionId, "actors"],
    queryFn: () => {
      if (!submissionId) throw new Error("submissionId không hợp lệ");
      return partnerActorsService.getActorsByMovieSubId(submissionId);
    },
    enabled: !!submissionId,
  });
};

export const useCreateNewActor = (submissionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<CreateNewActorResponse, Error, ActorRequest>({
    mutationFn: (actorReq) =>
      partnerActorsService.createNewActor(submissionId, actorReq),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partner", "movie-submission", submissionId, "actors"],
      });
      queryClient.invalidateQueries({
        queryKey: ["movie-submission-detail", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
    },
  });
};

export const useUpdateActorInMovieSub = (submissionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<
    UpdateActorInMovieSubRes,
    Error,
    { actorId: number; newActor: NewActorReq }
  >({
    mutationFn: ({ actorId, newActor }) =>
      partnerActorsService.updateActorsInMovieSub(
        submissionId,
        actorId,
        newActor
      ),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partner", "movie-submission", submissionId, "actors"],
      });
      queryClient.invalidateQueries({
        queryKey: ["movie-submission-detail", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
    },
  });
};

export const useRemoveActorFromMovieSub = (submissionId: number) => {
  const queryClient = useQueryClient();

  return useMutation<DeleteActorFromMovieSubRes, Error, number>({
    mutationFn: (actorId) =>
      partnerActorsService.removeActorFromMovieSub(submissionId, actorId),

    onSuccess: () => {
      queryClient.invalidateQueries({
        queryKey: ["partner", "movie-submission", submissionId, "actors"],
      });
      queryClient.invalidateQueries({
        queryKey: ["movie-submission-detail", submissionId],
      });
      queryClient.invalidateQueries({ queryKey: ["movie-submissions"] });
    },
  });
};
