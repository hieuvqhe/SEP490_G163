import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import axios from "axios";
import { useMutation, useQuery } from "@tanstack/react-query";

const createPublicMovieReviewRequest = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

export const createMovieReviewRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: `Bearer ${token}`,
      "Content-Type": "application/json",
    },
  });
};

// Handle movie API errors
const handleMovieReviewError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error(message);
    } else if (status === 403) {
      throw new Error(message);
    } else if (status === 404) {
      throw new Error(message || "Movie not found.");
    } else if (status === 400) {
      throw new Error(message || "Invalid request data.");
    } else if (status === 409) {
      throw new Error(message || "Movie already exists.");
    } else if (status === 500) {
      throw new Error("Server error. Please try again later.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

const movieReviewApi = createPublicMovieReviewRequest();
const movieReviewAuthApi = createMovieReviewRequest();

interface CreateNewReviewParams {
  movieId: number;
  body: {
    rating_star: number;
    comment: string;
  };
}

interface CreateNewReviewRes {
  message: string;
  result: {
    rating_id: number;
    movie_id: number;
    user_id: number;
    rating_star: number;
    comment: string;
    rating_at: string;
  };
}

interface GetReviewParams {
  movieId: number;
  params: {
    page: number;
    limit: number;
    sort: "newest" | "oldest" | "highest" | "lowest";
  };
}

interface GetMovieReviewsRes {
  message: string;
  result: {
    movie_id: number;
    page: number;
    limit: number;
    total_reviews: number;
    average_rating: number;
    items: {
      rating_id: number;
      user_id: number;
      user_name: string;
      rating_star: number;
      comment: string;
      rating_at: string;
    }[];
  };
}

interface GetMyReviewRes {
  message: string;
  result: {
    movie_id: number;
    user_id: number;
    review: {
      rating_id: number;
      rating_star: number;
      comment: string;
      rating_at: string;
    };
  };
}

interface GetRatingSumRes {
  message: string;
  result: {
    movie_id: number;
    average_rating: number;
    total_ratings: number;
    breakdown: {
      "1": number;
      "2": number;
      "3": number;
      "4": number;
      "5": number;
    };
  };
}

class MovieReviewManagement {
  private Base_Url = "/cinema/movies";

  createNewReview = async (
    params: CreateNewReviewParams
  ): Promise<CreateNewReviewRes> => {
    try {
      const res = await movieReviewAuthApi.post(
        `${this.Base_Url}/${params.movieId}/reviews`,
        params.body
      );

      return res.data;
    } catch (error) {
      throw handleMovieReviewError(error);
    }
  };

  updateReview = async (
    params: CreateNewReviewParams
  ): Promise<CreateNewReviewRes> => {
    try {
      const res = await movieReviewApi.put(
        `${this.Base_Url}/${params.movieId}/reviews`,
        params.body
      );

      return res.data;
    } catch (error) {
      throw handleMovieReviewError(error);
    }
  };

  getMovieReviews = async (
    params: GetReviewParams
  ): Promise<GetMovieReviewsRes> => {
    try {
      const queryParams = new URLSearchParams();

      if (params.params.page)
        queryParams.append("page", params.params.page.toString());
      if (params.params.limit)
        queryParams.append("limit", params.params.limit.toString());
      if (params.params.sort) queryParams.append("sort", params.params.sort);

      const res = await movieReviewApi.get(
        `${this.Base_Url}/${params.movieId}/reviews${
          queryParams.toString() ? `?${queryParams.toString()}` : ""
        }`
      );

      return res.data;
    } catch (error) {
      throw handleMovieReviewError(error);
    }
  };

  deleteMovieReviews = async (movieId: number) => {
    try {
      const res = await movieReviewApi.delete(
        `${this.Base_Url}/${movieId}/reviews`
      );

      return res.data;
    } catch (error) {
      throw handleMovieReviewError(error);
    }
  };

  getMyReview = async (movieId: number): Promise<GetMyReviewRes> => {
    try {
      const res = await movieReviewAuthApi.get(
        `${this.Base_Url}/${movieId}/reviews`
      );
      return res.data;
    } catch (error) {
      throw handleMovieReviewError(error);
    }
  };

  getRatingSum = async (movieId: number): Promise<GetRatingSumRes> => {
    try {
      const res = await movieReviewAuthApi.get(
        `${this.Base_Url}/${movieId}/rating-summary`
      );
      return res.data;
    } catch (error) {
      throw handleMovieReviewError(error);
    }
  };
}

const movieReviewServices = new MovieReviewManagement();

// ==========================
// CREATE REVIEW
// ==========================
export const useCreateReview = () => {
  return useMutation({
    mutationFn: movieReviewServices.createNewReview,
  });
};

// ==========================
// UPDATE REVIEW
// ==========================
export const useUpdateReview = () => {
  return useMutation({
    mutationFn: movieReviewServices.updateReview,
  });
};

// ==========================
// DELETE REVIEW
// ==========================
export const useDeleteReview = () => {
  return useMutation({
    mutationFn: movieReviewServices.deleteMovieReviews,
  });
};

// ==========================
// GET MOVIE REVIEWS (LIST)
// ==========================
export const useMovieReviews = (params: GetReviewParams) => {
  return useQuery({
    queryKey: ["movie-reviews", params.movieId, params.params],
    queryFn: () => movieReviewServices.getMovieReviews(params),
  });
};

// ==========================
// GET MY REVIEW
// ==========================
export const useMyReview = (movieId: number, enabled = true) => {
  return useQuery({
    queryKey: ["my-review", movieId],
    queryFn: () => movieReviewServices.getMyReview(movieId),
    enabled,
  });
};

// ==========================
// GET RATING SUMMARY
// ==========================
export const useRatingSummary = (movieId: number, enabled = true) => {
  return useQuery({
    queryKey: ["rating-summary", movieId],
    queryFn: () => movieReviewServices.getRatingSum(movieId),
    enabled,
  });
};
