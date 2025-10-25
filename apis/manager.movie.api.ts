import { BASE_URL } from "@/constants";
import { useMutation, useQueryClient } from "@tanstack/react-query";

export interface CreateMovieRequest {
  title: string;
  genre?: string;
  durationMinutes?: number;
  premiereDate?: string; // ISO date
  endDate?: string; // ISO date
  director?: string;
  language?: string;
  country?: string;
  isActive?: boolean;
  posterUrl?: string;
  production?: string;
  description?: string;
  status?: string;
  trailerUrl?: string;
  actorIds?: number[];
}

export interface MovieActor {
  id: number;
  name: string;
  profileImage?: string | null;
}

export interface CreateMovieResponse {
  message: string;
  result: {
    movieId: number;
    title: string;
    genre?: string;
    durationMinutes?: number;
    premiereDate?: string;
    endDate?: string;
    director?: string;
    language?: string;
    country?: string;
    isActive?: boolean;
    posterUrl?: string;
    production?: string;
    description?: string;
    status?: string;
    trailerUrl?: string;
    averageRating?: number;
    ratingsCount?: number;
    createdAt?: string;
    createdBy?: string;
    updateAt?: string;
    actor?: MovieActor[];
  };
}

export interface ManagerMovieApiError {
  message: string;
  errors?: Record<string, { msg: string; path?: string; location?: string }>;
}

class ManagerMovieService {
  private baseURL = `${BASE_URL}/api/movie-management`;

  async createMovie(data: CreateMovieRequest, accessToken: string): Promise<CreateMovieResponse> {
    try {
      const url = `${this.baseURL}/movies`;
      const response = await fetch(url, {
        method: "POST",
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
      return result as CreateMovieResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }

  async updateMovie(movieId: number, data: CreateMovieRequest, accessToken: string): Promise<CreateMovieResponse> {
    try {
      const url = `${this.baseURL}/movies/${movieId}`;
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
      return result as CreateMovieResponse;
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }

  async deleteMovie(movieId: number, accessToken: string): Promise<{ message: string; result: null }> {
    try {
      const url = `${this.baseURL}/movies/${movieId}`;
      const response = await fetch(url, {
        method: "DELETE",
        headers: {
          Accept: "application/json",
          Authorization: `Bearer ${accessToken}`,
        },
      });

      const result = await response.json();
      if (!response.ok) {
        throw result as ManagerMovieApiError;
      }
      return result as { message: string; result: null };
    } catch (error: any) {
      if (error?.name === "TypeError") {
        throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerMovieApiError;
      }
      throw error;
    }
  }
}

export const managerMovieService = new ManagerMovieService();

export const useCreateMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ data, accessToken }: { data: CreateMovieRequest; accessToken: string }) =>
      managerMovieService.createMovie(data, accessToken),
    onSuccess: () => {
      // Invalidate movie lists to refresh
      queryClient.invalidateQueries({ queryKey: ["manager-movies"] });
    },
  });
};

export const useUpdateMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ movieId, data, accessToken }: { movieId: number; data: CreateMovieRequest; accessToken: string }) =>
      managerMovieService.updateMovie(movieId, data, accessToken),
    onSuccess: () => {
      // Invalidate movie lists and movie detail caches
      queryClient.invalidateQueries({ queryKey: ["manager-movies"] });
      // If detail cache is keyed by movie id use that to invalidate only the updated movie
      // We can't access variables here, so callers can use optimistic updates or we could setQueryData in onMutate/onSuccess with the response.
      queryClient.invalidateQueries({ queryKey: ["manager-movie"] });
    },
  });
};

export const useDeleteMovie = () => {
  const queryClient = useQueryClient();
  return useMutation({
    mutationFn: ({ movieId, accessToken }: { movieId: number; accessToken: string }) =>
      managerMovieService.deleteMovie(movieId, accessToken),
    onSuccess: (_, variables) => {
      // Refresh movie list
      queryClient.invalidateQueries({ queryKey: ["manager-movies"] });
      // Remove specific movie detail cache if present
      if (variables?.movieId !== undefined) {
        queryClient.removeQueries({ queryKey: ["manager-movie", variables.movieId] });
      }
    },
  });
};
