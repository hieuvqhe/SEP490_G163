import { getAllMovies, getTopRateMovies, MovieTopRateParams } from "@/apis/movie.api";
import { MovieQueryParams } from "@/types/movie.type";
import { useQuery } from "@tanstack/react-query";

export const useGetFullMovies = (params: MovieQueryParams) => {
  return useQuery({
    queryKey: ["movies", params],
    queryFn: () => getAllMovies(params),
    enabled: !!params,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};

export const useGetTopRateMovie = (params: MovieTopRateParams) => {
  return useQuery({
    queryKey: ["topRateMovies", params],
    queryFn: () => getTopRateMovies(params),
    enabled: !!params,
    staleTime: 1000 * 60 * 5,
    refetchOnWindowFocus: false,
  });
};
