import { BASE_URL } from "@/constants";
import {
  GetMovieByIdRes,
  GetMovieResponse,
  Movie,
  MovieQueryParams,
} from "@/types/movie.type";
import axios from "axios";

// Create public axios instance for public movie endpoints
const createPublicMovieRequest = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      "Content-Type": "application/json",
    },
  });
};

// Handle movie API errors
const handleMovieError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 401) {
      throw new Error("Unauthorized. Please login.");
    } else if (status === 403) {
      throw new Error("Access denied. Insufficient privileges.");
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

// ===============================
// PUBLIC MOVIE APIS
// ===============================

export const getAllMovies = async (
  params?: MovieQueryParams
): Promise<GetMovieResponse> => {
  try {
    const movieApi = createPublicMovieRequest();
    const queryParams = new URLSearchParams();

    if (params?.page) queryParams.append("page", params.page.toString());
    if (params?.limit) queryParams.append("limit", params.limit.toString());
    if (params?.search) queryParams.append("search", params.search);
    if (params?.genre) queryParams.append("genre", params.genre);
    if (params?.status) queryParams.append("status", params.status);
    if (params?.language) queryParams.append("language", params.language);
    if (params?.sort_by) queryParams.append("sort_by", params.sort_by);
    if (params?.sort_order) queryParams.append("sort_order", params.sort_order);

    if (params?.premiere_date_from)
      queryParams.append(
        "premiere_date_from",
        params.premiere_date_from.toISOString()
      );

    if (params?.premiere_date_to)
      queryParams.append(
        "premiere_date_to",
        params.premiere_date_to.toISOString()
      );

    if (params?.min_rating)
      queryParams.append("min_rating", params.min_rating.toString());

    const url = `/cinema/movies${
      queryParams.toString() ? `?${queryParams.toString()}` : ""
    }`;

    const response = await movieApi.get<GetMovieResponse>(url);
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get movie by status
export const getMoviesByStatus = async (
  status: "now_showing" | "coming_soon" | "ended",
  limit?: number,
  pages?: number
): Promise<Movie[]> => {
  try {
    const response = await getAllMovies({
      page: pages,
      status,
      limit,
      sort_by: "premiere_date",
      sort_order: "desc",
    });
    return response.result.movies;
  } catch (error) {
    throw handleMovieError(error);
  }
};

export const getMoviesById = async (movie_id: number) => {
  try {
    const response = await axios.get(
      `https://localhost:7263/cinema/movies/${movie_id}`
    );
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};
