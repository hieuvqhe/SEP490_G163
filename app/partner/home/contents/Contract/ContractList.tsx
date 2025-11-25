"use client";

import React, { useState } from "react";
import {
  Card,
  CardHeader,
  CardTitle,
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
import { Search } from "lucide-react";
import { useGetPartnersContract } from "@/hooks/usePartner";
import Skeleton from "@mui/material/Skeleton";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Dialog, DialogContent, DialogTrigger, DialogTitle } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ContractDetails from "./ContractDetails";

export default function ContractList() {
  const [search, setSearch] = useState<string>("");
  const [statusParams, setStatusParams] = useState<
    "active" | "inactive" | "terminated" | "pending" | "all"
  >("all");
  const [page, setPage] = useState(1);

  const { data: partnerContractRes, isLoading } = useGetPartnersContract({
    sortBy: "desc",
    limit: 4,
    page: page,
    sortOrder: "asc",
    status: statusParams,
  });
  const totalPages = partnerContractRes?.result.pagination.totalPages;

  const partnerContracts = partnerContractRes?.result?.contracts;

  const filteredContracts = partnerContracts?.filter((c) => {
    const matchesStatus = statusParams === "all" || c.status === statusParams;
    const matchesSearch = c.title.toLowerCase().includes(search.toLowerCase());
    return matchesStatus && matchesSearch;
  });

  return (
    <div className="min-h-[85vh] text-zinc-100 rounded-xl border border-[#27272a] bg-[#151518] p-4 shadow-lg shadow-black/40">
      {/* Header */}

      <div className="flex flex-col h-full justify-around">
        <div className="flex justify-between items-center mb-8">
          <h1 className="text-2xl font-semibold">Quản lý hợp đồng của tôi</h1>
          {/* <Button className="rounded-xl bg-emerald-600 hover:bg-emerald-500">
            + Tạo hợp đồng mới
          </Button> */}
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
                  <SelectItem value="active">Hiệu lực</SelectItem>
                  <SelectItem value="inactive">Hết hạn</SelectItem>
                  <SelectItem value="peding">Chờ ký</SelectItem>
                  <SelectItem value="terminated">Đã hủy</SelectItem>
                </SelectContent>
              </Select>
            </div>

            <div className="relative flex-1 max-w-sm">
              <Search
                className="absolute left-2 top-2.5 text-zinc-500"
                size={18}
              />
              <Input
                placeholder="Tìm kiếm hợp đồng..."
                value={search}
                onChange={(e) => setSearch(e.target.value)}
                className="pl-8 bg-zinc-800 border-zinc-700 text-zinc-200 rounded-xl"
              />
            </div>
          </div>

          {/* Lưới hợp đồng */}
          {isLoading ? (
            <ContractCardSkeleton />
          ) : filteredContracts?.length === 0 ? (
            <div className="flex flex-col items-center justify-center w-full h-[45vh]">
              <p className="text-zinc-500 text-center mt-10">
                Không có hợp đồng nào phù hợp.
              </p>
            </div>
          ) : (
            <div className="grid sm:grid-cols-2 lg:grid-cols-3 xl:grid-cols-4 gap-6">
              {!partnerContracts ? (
                <div className="flex flex-col items-center justify-center w-full h-[45vh]">
                  <p className="text-zinc-500 text-center mt-10">
                    Không có hợp đồng nào phù hợp.
                  </p>
                </div>
              ) : (
                partnerContracts?.map((contract) => (
                  <Card
                    key={contract.contractId}
                    className="bg-zinc-800 border border-zinc-700 rounded-2xl shadow-md p-4 hover:shadow-lg hover:-translate-y-1 transition-all"
                  >
                    <CardHeader className="flex justify-between items-center p-0">
                      <CardTitle className="text-zinc-100 text-lg font-semibold">
                        {contract.title}
                      </CardTitle>
                      <Badge
                        variant="outline"
                        className={
                          contract.status === "active"
                            ? "border-emerald-500 text-emerald-400"
                            : contract.status === "terminated"
                            ? "border-red-500 text-red-400"
                            : "border-yellow-500 text-yellow-400"
                        }
                      >
                        {contract.status}
                      </Badge>
                    </CardHeader>

                    <CardDescription className="text-zinc-400 mt-2">
                      {contract.contractNumber} - {contract.title}
                    </CardDescription>

                    <div className="mt-4 space-y-1 text-sm text-zinc-500">
                      <p>Ngày tạo: {contract.createdAt}</p>
                      <p>Loại: {contract.contractType}</p>
                    </div>

                    <CardFooter className="mt-4 flex justify-between p-0">
                      <Dialog>
                        <DialogTrigger asChild>
                          <Button variant="ghost" size="sm">
                            Xem chi tiết
                          </Button>
                        </DialogTrigger>
                        <DialogContent 
                          className="!max-w-[80vw] h-[90vh] bg-zinc-950"
                          onInteractOutside={(e) => e.preventDefault()}
                          onEscapeKeyDown={(e) => e.preventDefault()}
                        >
                          <VisuallyHidden>
                            <DialogTitle>Chi tiết hợp đồng</DialogTitle>
                          </VisuallyHidden>
                          <ContractDetails contractId={contract.contractId} />
                        </DialogContent>
                      </Dialog>
                      {!contract.isLocked && (
                        <Button variant="outline" size="sm">
                          Tải PDF
                        </Button>
                      )}
                    </CardFooter>
                  </Card>
                ))
              )}
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
  );
}

const ContractCardSkeleton = () => {
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
