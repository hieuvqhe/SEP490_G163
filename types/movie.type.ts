export interface Movie {
  movieId: number;
  title: string;
  genre: string;
  durationMinutes: number;
  premiereDate: Date;
  endDate: Date;
  director: string;
  language: string;
  country: string;
  isActive: true;
  posterUrl: string;
  production: string;
  description: string;
  status?: "now_showing" | "coming_soon" | "ended";
  trailerUrl: string;
  actor: [
    {
      id: number;
      name: string;
      profileImage: string;
    }
  ];
  averageRating: number;
  ratingsCount: number;
  createdAt: Date;
  createdBy: null;
  updateAt: null;
}

export interface GetMovieResponse {
  message: string;
  result: {
    movies: [Movie];
    total: number;
    page: number;
    limit: number;
    totalPages: number;
  };
}

export interface MovieQueryParams {
  page?: number;
  limit?: number;
  status?: "now_showing" | "coming_soon" | "ended";
  genre?: string;
  language?: string;
  search?: string;
  sort_by?:
    | "title"
    | "premiere_date"
    | "average_rating"
    | "duration_minutes"
    | "ratings_count"
    | "created_at";
  sort_order?: "asc" | "desc";
  premiere_date_from?: Date;
  premiere_date_to?: Date;
  min_rating?: number;
}

export interface GetMovieByIdRes {
  message: "Get movie details success";
  result: Movie;
}
