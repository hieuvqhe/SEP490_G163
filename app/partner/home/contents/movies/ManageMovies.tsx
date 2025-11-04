"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Badge } from "@/components/ui/badge";
import { Input } from "@/components/ui/input";
import {
  Select,
  SelectTrigger,
  SelectContent,
  SelectItem,
  SelectValue,
} from "@/components/ui/select";
import { CalendarDays, Clock, Film, Search, User } from "lucide-react";
import Skeleton from "@mui/material/Skeleton";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { useMoviesSubmission } from "@/apis/partner.movies.api";
import { cn } from "@/lib/utils";
import CardContent from "@mui/material/CardContent";
import Image from "next/image";
import AddMovieModal from "./AddMovieModal";

export default function ManageMovies() {
  const [statusParams, setStatusParams] = useState<
    "active" | "inactive" | "terminated" | "pending" | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);

  const { data: moviesSubmissionRes, isLoading } = useMoviesSubmission({
    limit: 4,
    page: page,
    search: "",
    sortOrder: "desc",
    status: "name",
  });

  const movieSubs = moviesSubmissionRes?.result.submissions;
  const totalPages = moviesSubmissionRes?.result.pagination.totalPages;

  const filteredMovieSubs = movieSubs?.filter((c) => {
    const matchesStatus = statusParams === "all" || c.status === statusParams;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="">
      <div className="min-h-[85vh] text-zinc-100 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
        {/* Header */}

        <div className="flex flex-col h-full justify-around">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Quản lý phim chiếu</h1>
            <Button
              onClick={() => setIsOpenCreateModal(true)}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
            >
              + Tạo phim mới
            </Button>
          </div>
          <div className="flex flex-col items-baseline gap-3">
            {/* Bộ lọc */}
            <div className="flex flex-wrap gap-4 items-center mb-8">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Trạng thái:</span>
                <Select
                  value={statusParams}
                  onValueChange={(value) =>
                    setStatusParams(
                      value as
                        | "active"
                        | "inactive"
                        | "terminated"
                        | "pending"
                        | "all"
                    )
                  }
                >
                  <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="active">Bản nháp</SelectItem>
                    <SelectItem value="inactive">Chờ duyệt</SelectItem>
                    <SelectItem value="peding">Đã duyệt</SelectItem>
                  </SelectContent>
                </Select>
              </div>

              <div className="relative flex-1 max-w-sm">
                <Search
                  className="absolute left-2 top-2.5 text-zinc-500"
                  size={18}
                />
                <Input
                  placeholder="Tìm kiếm phim..."
                  value={search}
                  onChange={(e) => setSearch(e.target.value)}
                  className="pl-8 bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl"
                />
              </div>
            </div>

            {/* Lưới hợp đồng */}
            {isLoading ? (
              <MovieSkeleton />
            ) : filteredMovieSubs?.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-[45vh]">
                <p className="text-zinc-500 text-center mt-10">
                  Không có phim nào phù hợp.
                </p>
              </div>
            ) : !movieSubs ? (
              <div className="flex flex-col items-center justify-center w-full h-[45vh]">
                <p className="text-zinc-500 text-center mt-10">
                  Không có phim nào.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {movieSubs?.map((movieSub) => (
                  <Card
                    key={movieSub.movieId}
                    className={cn(
                      "group relative py-0 overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 hover:bg-zinc-800/90 transition-all duration-300 shadow-md hover:shadow-lg"
                    )}
                  >
                    {/* Poster Image */}
                    <div className="relative w-full h-64 overflow-hidden">
                      <Image
                        src={movieSub.posterUrl}
                        alt={movieSub.title}
                        fill
                        className="object-cover object-[center_10%] transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <Badge
                        className={cn(
                          "absolute top-3 left-3 border text-xs font-medium px-2 py-0.5 rounded-md"
                          // statusColors[movieSub.status]
                        )}
                      >
                        {movieSub.status}
                      </Badge>
                    </div>

                    {/* Info */}
                    <CardContent className="p-4 space-y-2">
                      <h3 className="text-lg font-semibold text-white truncate">
                        {movieSub.title}
                      </h3>

                      <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                        <span className="flex items-center gap-1">
                          <Film className="h-4 w-4 text-zinc-500" />
                          {movieSub.genre}
                        </span>
                        <span className="flex items-center gap-1">
                          <Clock className="h-4 w-4 text-zinc-500" />
                          {movieSub.durationMinutes} phút
                        </span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-zinc-500">
                        <User className="h-4 w-4" />
                        <span className="truncate">{movieSub.director}</span>
                      </div>

                      <div className="flex items-center gap-1 text-sm text-zinc-500">
                        <CalendarDays className="h-4 w-4" />
                        <span>
                          Khởi chiếu:{" "}
                          {new Date(movieSub.premiereDate).toLocaleDateString(
                            "vi-VN"
                          )}
                        </span>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <CustomPagination
            totalPages={totalPages ?? 1}
            currentPage={page}
            onPageChange={setPage}
          />
        </div>
      </div>
      <AddMovieModal
        open={isOpenCreateModal}
        onClose={() => setIsOpenCreateModal(false)}
      />
    </div>
  );
}

const MovieSkeleton = () => {
  return (
    <Card className="bg-zinc-800 border border-zinc-700 rounded-2xl shadow-md p-4 w-[320px] h-[220px] flex flex-col justify-between">
      {/* Header */}
      <CardHeader className="flex justify-between items-start p-0">
        <Skeleton className="h-5 w-2/3 bg-zinc-700 rounded-md" />
        <Skeleton className="h-5 w-16 bg-zinc-700 rounded-md" />
      </CardHeader>

      {/* Description */}
      <CardDescription className="mt-2 space-y-2">
        <Skeleton className="h-4 w-full bg-zinc-700 rounded-md" />
        <Skeleton className="h-4 w-3/4 bg-zinc-700 rounded-md" />
      </CardDescription>

      {/* Info */}
      <div className="mt-2 space-y-2 text-sm">
        <Skeleton className="h-3 w-1/2 bg-zinc-700 rounded-md" />
        <Skeleton className="h-3 w-2/3 bg-zinc-700 rounded-md" />
      </div>

      {/* Footer */}
      <CardFooter className="mt-4 flex justify-between p-0">
        <Skeleton className="h-8 w-24 bg-zinc-700 rounded-lg" />
        <Skeleton className="h-8 w-20 bg-zinc-700 rounded-lg" />
      </CardFooter>
    </Card>
  );
};
