"use client";

import React, { useMemo, useState } from "react";
import {
  Card,
  CardHeader,
  CardDescription,
  CardFooter,
} from "@/components/ui/card";
import { Button } from "@/components/ui/button";
import { Input } from "@/components/ui/input";
import { Badge } from "@/components/ui/badge";
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
import { MovieSubmissionResult, useMoviesSubmission } from "@/apis/partner.movies.api";
import { cn } from "@/lib/utils";
import CardContent from "@mui/material/CardContent";
import Image from "next/image";
import AddMovieModal from "./AddMovieModal";
import { MovieSubmissionDetailDialog } from "./MovieSubmissionDetailDialog";

export default function ManageMovies() {
  const [statusParams, setStatusParams] = useState<
    "all" | "draft" | "pending" | "approved" | "rejected"
  >("all");
  const [page, setPage] = useState(1);
  const [search, setSearch] = useState<string>("");
  const [isOpenCreateModal, setIsOpenCreateModal] = useState(false);
  const [modalMode, setModalMode] = useState<"create" | "edit">("create");
  const [editingSubmission, setEditingSubmission] = useState<MovieSubmissionResult | null>(null);
  const [openedSubmissionId, setOpenedSubmissionId] = useState<number | null>(null);
  const [isDetailOpen, setIsDetailOpen] = useState(false);

  const { data: moviesSubmissionRes, isLoading } = useMoviesSubmission({
    pageSize: 4,
    page: page,
    search: search,
    sortOrder: "desc",
  });

  const submissions = moviesSubmissionRes?.result.submissions ?? [];
  const totalPages = moviesSubmissionRes?.result.pagination.totalPages ?? 1;

  const filteredSubmissions = useMemo(() => {
    const searchValue = search.trim().toLowerCase();
    return submissions.filter((submission) => {
      const normalizedStatus = submission.status?.toLowerCase() ?? "";
      const matchesStatus =
        statusParams === "all" || normalizedStatus === statusParams;
      const matchesSearch = !searchValue
        ? true
        : submission.title.toLowerCase().includes(searchValue);
      return matchesStatus && matchesSearch;
    });
  }, [search, statusParams, submissions]);

  const getStatusLabel = (status?: string | null) => {
    if (!status) return "Chưa xác định";
    switch (status.toLowerCase()) {
      case "draft":
        return "Bản nháp";
      case "pending":
        return "Chờ duyệt";
      case "approved":
        return "Đã duyệt";
      case "rejected":
        return "Từ chối";
      default:
        return status;
    }
  };

  return (
    <div className="">
      <div className="min-h-[85vh] text-zinc-100 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
        {/* Header */}

        <div className="flex flex-col h-full justify-around">
          <div className="flex justify-between items-center mb-8">
            <h1 className="text-2xl font-semibold">Quản lý phim chiếu</h1>
            <Button
              onClick={() => {
                setEditingSubmission(null);
                setModalMode("create");
                setIsOpenCreateModal(true);
              }}
              className="rounded-xl bg-emerald-600 hover:bg-emerald-500"
            >
              + Tạo yêu cầu gửi phim mới
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
                      value as "all" | "draft" | "pending" | "approved" | "rejected"
                    )
                  }
                >
                  <SelectTrigger className="w-[160px] bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl">
                    <SelectValue placeholder="Tất cả" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-800 border-zinc-700">
                    <SelectItem value="all">Tất cả</SelectItem>
                    <SelectItem value="draft">Bản nháp</SelectItem>
                    <SelectItem value="pending">Chờ duyệt</SelectItem>
                    <SelectItem value="approved">Đã duyệt</SelectItem>
                    <SelectItem value="rejected">Từ chối</SelectItem>
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
            ) : filteredSubmissions.length === 0 ? (
              <div className="flex flex-col items-center justify-center w-full h-[45vh]">
                <p className="text-zinc-500 text-center mt-10">
                  Không có phim nào phù hợp.
                </p>
              </div>
            ) : (
              <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
                {filteredSubmissions.map((submission) => (
                  <Card
                    key={submission.movieSubmissionId}
                    className={cn(
                      "group relative flex flex-col overflow-hidden rounded-2xl border border-zinc-800 bg-zinc-900 py-0 transition-all duration-300 shadow-md hover:bg-zinc-800/90 hover:shadow-lg"
                    )}
                  >
                    {/* Poster Image */}
                    <div className="relative w-full h-64 overflow-hidden">
                      <Image
                        src={submission.posterUrl}
                        alt={submission.title}
                        fill
                        className="object-cover object-[center_10%] transition-transform duration-300 group-hover:scale-105"
                      />
                      <div className="absolute inset-0 bg-gradient-to-t from-black/80 via-black/30 to-transparent" />
                      <Badge
                        className={cn(
                          "absolute top-3 left-3 border text-xs font-medium px-2 py-0.5 rounded-md"
                          // statusColors[submission.status as keyof typeof statusColors]
                        )}
                      >
                        {getStatusLabel(submission.status)}
                      </Badge>
                    </div>

                    {/* Info */}
                    <CardContent className="flex flex-1 flex-col p-4">
                      <div className="space-y-2">
                        <h3 className="truncate text-lg font-semibold text-white">
                          {submission.title}
                        </h3>

                        <div className="flex flex-wrap items-center gap-2 text-sm text-zinc-400">
                          <span className="flex items-center gap-1">
                            <Film className="h-4 w-4 text-zinc-500" />
                            {submission.genre}
                          </span>
                          <span className="flex items-center gap-1">
                            <Clock className="h-4 w-4 text-zinc-500" />
                            {submission.durationMinutes} phút
                          </span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-zinc-500">
                          <User className="h-4 w-4" />
                          <span className="truncate">{submission.director}</span>
                        </div>

                        <div className="flex items-center gap-1 text-sm text-zinc-500">
                          <CalendarDays className="h-4 w-4" />
                          <span>
                            Khởi chiếu: {" "}
                            {submission.premiereDate
                              ? new Date(submission.premiereDate).toLocaleDateString("vi-VN")
                              : "Chưa cập nhật"}
                          </span>
                        </div>
                      </div>

                      <div className="mt-auto pt-4">
                        <Button
                          variant="outline"
                          className="w-full"
                          onClick={() => {
                            setOpenedSubmissionId(submission.movieSubmissionId);
                            setIsDetailOpen(true);
                          }}
                        >
                          Xem chi tiết
                        </Button>
                      </div>
                    </CardContent>
                  </Card>
                ))}
              </div>
            )}
          </div>

          <CustomPagination totalPages={totalPages} currentPage={page} onPageChange={setPage} />
        </div>
      </div>
      <MovieSubmissionDetailDialog
        submissionId={openedSubmissionId}
        open={isDetailOpen}
        onClose={() => {
          setIsDetailOpen(false);
          setOpenedSubmissionId(null);
        }}
        onEdit={(data: MovieSubmissionResult) => {
          setIsDetailOpen(false);
          setOpenedSubmissionId(null);
          setEditingSubmission(data);
          setModalMode("edit");
          setIsOpenCreateModal(true);
        }}
      />
      <AddMovieModal
        open={isOpenCreateModal}
        onClose={() => {
          setIsOpenCreateModal(false);
          setEditingSubmission(null);
          setModalMode("create");
        }}
        mode={modalMode}
        initialSubmission={editingSubmission}
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
