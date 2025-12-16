import { BASE_URL } from "@/constants";
import { getAccessToken } from "@/store/authStore";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";
import {
  GetPartnerShowtimeByIdResponse,
  PartnerShowtimeApiError,
} from "./partner.showtime.api";

export const createPublicRequest = () => {
  const token = getAccessToken();
  return axios.create({
    baseURL: BASE_URL,
    headers: {
      Authorization: token ? `Bearer ${token}` : "",
      "Content-Type": "application/json",
    },
  });
};

// Handle movie API errors
export const handleShowtimeOverviewError = (error: unknown): Error => {
  if (axios.isAxiosError(error)) {
    const status = error.response?.status;
    const message = error.response?.data?.message;

    if (status === 404) {
      throw new Error("Lỗi thông tin, yêu cầu gửi lại.");
    } else if (status === 500) {
      throw new Error("Lỗi hệ thống khi lấy thông tin suất chiếu.");
    } else if (status === 404) {
      throw new Error(message || "Không tìm thấy movie.");
    } else {
      throw new Error(message || "Request failed.");
    }
  }
  throw new Error("Network error. Please check your connection.");
};

const userApi = createPublicRequest();

// ===============================
// ShowtimeOverview APIS
// ===============================

export interface ShowtimeOverviewParams {
  movieId: number;
  Date?: string;
  City?: string;
  District?: string;
  Brand?: string;
  CinemaId?: number;
  ScreenType?: string;
  FormatType?: string;
  TimeFrom?: string;
  TimeTo?: string;
  Page?: number;
  Limit?: number;
  SortBy?: string;
  SortOrder?: string;
}

export interface ShowtimesByCinemaParams {
  Date?: string;
  City?: string;
  District?: string;
  Brand?: string;
  CinemaId?: number;
  Page?: number;
  Limit?: number;
}

interface Brand {
  code: string;
  name: string;
  logoUrl: string;
}

interface GetBrandsResponse {
  message: string;
  result: {
    brands: Brand[];
  };
}

interface GetShowtimesByCinemaRes {
  message: string;
  result: {
    date: string;
    brands: Brand[];
    cinemas: {
      items: {
        cinemaId: number;
        cinemaName: string;
        address: string;
        city: string;
        district: string;
        brandCode: string;
        logoUrl: string;
        latitude: number;
        longitude: number;
        movies: {
          movieId: number;
          title: string;
          posterUrl: string;
          duration: string;
          ageRating: string;
          screens: {
            screenId: number;
            screenName: string;
            screenType: string;
            soundSystem: string;
            showtimes: {
              showtimeId: number;
              startTime: string;
              endTime: string;
              formatType: string;
              basePrice: number;
              availableSeats: number;
              isSoldOut: boolean;
              label: string;
            }[];
          }[];
        }[];
      }[];
      pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      };
    };
  };
}

interface GetShowtimeOverviewRes {
  message: string;
  result: {
    movieId: number;
    title: string;
    posterUrl: string;
    date: Date;
    brands: Brand[];
    cinemas: {
      items: [
        {
          cinemaId: number;
          cinemaName: string;
          address: string;
          city: string;
          district: string;
          brandCode: string;
          logoUrl: string;
          latitude: number;
          longitude: number;
          screens: [
            {
              screenId: number;
              screenName: string;
              screenType: string;
              soundSystem: string;
              capacity: number;
              showtimes: [
                {
                  showtimeId: number;
                  startTime: string;
                  endTime: string;
                  formatType: string;
                  basePrice: number;
                  availableSeats: number;
                  isSoldOut: boolean;
                  label: string;
                }
              ];
            }
          ];
        }
      ];
      pagination: {
        currentPage: number;
        pageSize: number;
        totalCount: number;
        totalPages: number;
      };
    };
  };
}

interface SeatType {
  seatTypeId: number;
  code: string;
  name: string;
  surcharge: number;
  color: string;
}

export interface Seat {
  seatId: number;
  rowCode: string;
  seatNumber: number;
  seatName: string;
  seatTypeId: number;
  status: string;
  lockedUntil: string | null;
}

interface GetShowtimeSeatRes {
  message: string;
  result: {
    showtimeId: number;
    movie: {
      movieId: number;
      title: string;
      posterUrl: string;
    };
    cinema: {
      cinemaId: number;
      cinemaName: string;
      city: string;
      district: string;
      latitude: number;
      longitude: number;
    };
    screen: {
      screenId: number;
      screenName: string;
      screenType: string;
      soundSystem: string;
    };
    totalRows: number;
    totalColumns: number;
    seatTypes: SeatType[];
    seats: Seat[];
    serverTime: string;
  };
}

class ShowtimeManagement {
  getBrands = async (): Promise<GetBrandsResponse> => {
    try {
      const response = await userApi.get<GetBrandsResponse>(
        `/api/cinema/brands`
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  getShowtimesByCinema = async (
    params?: ShowtimesByCinemaParams
  ): Promise<GetShowtimesByCinemaRes> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.Date) queryParams.append("Date", params.Date);
      if (params?.City) queryParams.append("City", params.City);
      if (params?.District) queryParams.append("District", params.District);
      if (params?.Brand) queryParams.append("Brand", params.Brand);
      if (params?.CinemaId)
        queryParams.append("CinemaId", params.CinemaId.toString());
      if (params?.Page) queryParams.append("Page", params.Page.toString());
      if (params?.Limit) queryParams.append("Limit", params.Limit.toString());

      const url = `/api/cinema/showtimes/by-cinema${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      const response = await userApi.get<GetShowtimesByCinemaRes>(url);
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  getShowtimesOverview = async (
    params?: ShowtimeOverviewParams
  ): Promise<GetShowtimeOverviewRes> => {
    try {
      const queryParams = new URLSearchParams();

      if (params?.movieId)
        queryParams.append("movieId", params.movieId.toString());
      if (params?.Date) queryParams.append("Date", params.Date);
      if (params?.City) queryParams.append("City", params.City);
      if (params?.District) queryParams.append("District", params.District);
      if (params?.Brand) queryParams.append("Brand", params.Brand);
      if (params?.CinemaId)
        queryParams.append("CinemaId", params.CinemaId.toString());
      if (params?.ScreenType)
        queryParams.append("ScreenType", params.ScreenType);
      if (params?.FormatType)
        queryParams.append("FormatType", params.FormatType);
      if (params?.TimeFrom) queryParams.append("TimeFrom", params.TimeFrom);
      if (params?.TimeTo) queryParams.append("TimeTo", params.TimeTo);
      if (params?.Page) queryParams.append("Page", params.Page.toString());
      if (params?.Limit) queryParams.append("Limit", params.Limit.toString());
      if (params?.SortBy) queryParams.append("SortBy", params.SortBy);
      if (params?.SortOrder) queryParams.append("SortOrder", params.SortOrder);

      const url = `/api/cinema/movies/${params?.movieId}/showtimes/overview${
        queryParams.toString() ? `?${queryParams.toString()}` : ""
      }`;

      // https://expressticketcinemasystemapi-fjescsgjg9djeuf5.southeastasia-01.azurewebsites.net/cinema/movies/18/showtimes/overview?movieId=18&Date=2025-11-10
      // https://expressticketcinemasystemapi-fjescsgjg9djeuf5.southeastasia-01.azurewebsites.net/api/cinema/movies/18/showtimes/overview?Date=2025-11-13

      const response = await userApi.get<GetShowtimeOverviewRes>(url);

      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  getShowtimeSeat = async (showtimeId: number): Promise<GetShowtimeSeatRes> => {
    try {
      const response = await userApi.get(
        `/api/cinema/showtimes/${showtimeId}/seats`
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  };

  async getShowtimeById(
    showtimeId: number
  ): Promise<GetPartnerShowtimeByIdResponse> {
    if (!showtimeId || showtimeId <= 0) {
      throw new PartnerShowtimeApiError("Vui lòng chọn suất chiếu hợp lệ.");
    }

    try {
      const client = createPublicRequest();
      const response = await client.get<GetPartnerShowtimeByIdResponse>(
        `${BASE_URL}/api/cinema/showtimes/${showtimeId}`
      );
      return response.data;
    } catch (error) {
      throw handleShowtimeOverviewError(error);
    }
  }
}

export const showtimeManagementServices = new ShowtimeManagement();

export const useGetShowtimeById = (showtimeId?: number) => {
  return useQuery({
    queryKey: ["catalog-showtime", showtimeId],
    queryFn: () => showtimeManagementServices.getShowtimeById(showtimeId!),
    enabled: typeof showtimeId === "number" && showtimeId > 0,
    staleTime: 5 * 60 * 1000,
    gcTime: 10 * 60 * 1000,
  });
};

export const useGetBrands = () => {
  return useQuery<GetBrandsResponse>({
    queryKey: ["brands"],
    queryFn: () => showtimeManagementServices.getBrands(),
    staleTime: 10 * 60 * 1000, // 10 minutes - brands don't change often
    gcTime: 30 * 60 * 1000, // 30 minutes
  });
};

export const useGetShowtimesByCinema = (
  params?: ShowtimesByCinemaParams
) => {
  return useQuery<GetShowtimesByCinemaRes>({
    queryKey: ["showtimesByCinema", params],
    queryFn: () => showtimeManagementServices.getShowtimesByCinema(params),
    placeholderData: keepPreviousData,
    enabled: !!params?.Date, // Only fetch when date is provided
  });
};

export const useGetShowtimesOverview = (params?: ShowtimeOverviewParams) => {
  return useQuery<GetShowtimeOverviewRes>({
    queryKey: ["showtimeOverview", params],
    queryFn: () => showtimeManagementServices.getShowtimesOverview(params),
    placeholderData: keepPreviousData,
  });
};

export const useGetShowtimeSeat = (showtimeId: number) => {
  return useQuery<GetShowtimeSeatRes>({
    queryKey: ["showtimeOverview", showtimeId],
    queryFn: () => showtimeManagementServices.getShowtimeSeat(showtimeId),
    placeholderData: keepPreviousData,
  });
};
