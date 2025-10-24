import { BASE_URL } from "@/constants";
import { useQuery } from "@tanstack/react-query";

export interface GetActorsParams {
	page?: number;
	limit?: number;
	search?: string;
	sortBy?: "name" | "actor_id";
	sortOrder?: "asc" | "desc";
}

export interface Actor {
	id: number;
	name: string;
	profileImage?: string | null;
}

export interface ActorsPagination {
	currentPage: number;
	pageSize: number;
	totalCount: number;
	totalPages: number;
	hasPrevious: boolean;
	hasNext: boolean;
}

export interface GetActorsResponse {
	message: string;
	result: {
		actors: Actor[];
		pagination: ActorsPagination;
	};
}

export interface GetActorByIdResponse {
	message: string;
	result: Actor;
}

export interface ManagerActorApiError {
	message: string;
	errors?: {
		manager?: {
			msg: string;
			path: string;
			location: string;
		};
	};
}

class ManagerActorService {
	// Public endpoints are under /api/movie-management as requested
	private baseURL = `${BASE_URL}/api/movie-management`;

	async getActors(params: GetActorsParams, accessToken: string): Promise<GetActorsResponse> {
		try {
			const queryParams = new URLSearchParams();
			if (params.page !== undefined) queryParams.append("page", params.page.toString());
			if (params.limit !== undefined) queryParams.append("limit", params.limit.toString());
			if (params.search) queryParams.append("search", params.search);
			if (params.sortBy) queryParams.append("sortBy", params.sortBy);
			if (params.sortOrder) queryParams.append("sortOrder", params.sortOrder);

			const url = `${this.baseURL}/actors${queryParams.toString() ? "?" + queryParams.toString() : ""}`;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const result = await response.json();
			if (!response.ok) {
				throw result as ManagerActorApiError;
			}
			return result as GetActorsResponse;
		} catch (error: any) {
			if (error?.name === "TypeError") {
				throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerActorApiError;
			}
			throw error;
		}
	}

	async getActorById(actorId: number, accessToken: string): Promise<GetActorByIdResponse> {
		try {
			const url = `${this.baseURL}/actors/${actorId}`;
			const response = await fetch(url, {
				method: "GET",
				headers: {
					Accept: "application/json",
					Authorization: `Bearer ${accessToken}`,
				},
			});

			const result = await response.json();
			if (!response.ok) {
				// If backend returns 404-like error message, propagate
				throw result as ManagerActorApiError;
			}

			return result as GetActorByIdResponse;
		} catch (error: any) {
			if (error?.name === "TypeError") {
				throw { message: "Không thể kết nối đến server. Vui lòng kiểm tra kết nối mạng." } as ManagerActorApiError;
			}
			throw error;
		}
	}
}

export const managerActorService = new ManagerActorService();

export const useGetActors = (params: GetActorsParams, accessToken?: string) => {
	return useQuery({
		queryKey: ["manager-actors", params],
		queryFn: () => managerActorService.getActors(params, accessToken!),
		enabled: !!accessToken,
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};

export const useGetActorById = (actorId?: number, accessToken?: string) => {
	return useQuery({
		queryKey: ["manager-actor", actorId],
		queryFn: () => managerActorService.getActorById(actorId!, accessToken!),
		enabled: !!accessToken && typeof actorId === "number",
		staleTime: 5 * 60 * 1000,
		gcTime: 10 * 60 * 1000,
	});
};
