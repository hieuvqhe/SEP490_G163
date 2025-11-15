import { BASE_URL } from "@/constants";
import { keepPreviousData, useQuery } from "@tanstack/react-query";
import axios from "axios";

export const createPublicRequest = () => {
  return axios.create({
    baseURL: BASE_URL,
    headers: {
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

interface Brand {
  code: string;
  name: string;
  logoUrl: string;
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
}

export const showtimeManagementServices = new ShowtimeManagement();

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

