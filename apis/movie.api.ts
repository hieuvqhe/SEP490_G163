import { BASE_URL } from "@/constants";
import { Movie } from "@/types/movie.type";
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

// Get all movies (public)
export const getAllMovies = async (): Promise<Movie[]> => {
  try {
    const movieApi = createPublicMovieRequest();
    const url = `/cinema/movies`;
    const response = await movieApi.get<Movie[]>(url);
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get showing movies (public)
export const getShowingMovies = async (): Promise<Movie[]> => {
  try {
    const movieApi = createPublicMovieRequest();
    const url = `/cinema/movies/categories/now-showing`;
    const response = await movieApi.get<Movie[]>(url);
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

// Get comming soon movies (public)
export const getCommingSoonMovies = async (): Promise<Movie[]> => {
  try {
    const movieApi = createPublicMovieRequest();
    const url = `/cinema/movies/categories/coming-soon`;
    const response = await movieApi.get<Movie[]>(url);
    return response.data;
  } catch (error) {
    throw handleMovieError(error);
  }
};

