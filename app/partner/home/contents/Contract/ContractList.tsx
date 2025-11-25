"use client";

import React, { useState, useRef } from "react";
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
import { Search, Upload, FileCheck, X, Loader2 } from "lucide-react";
import { useGetPartnersContract } from "@/hooks/usePartner";
import Skeleton from "@mui/material/Skeleton";
import { CustomPagination } from "@/components/custom/CustomPagination";
import { Dialog, DialogContent, DialogTrigger, DialogTitle, DialogClose } from "@/components/ui/dialog";
import { VisuallyHidden } from "@radix-ui/react-visually-hidden";
import ContractDetails from "./ContractDetails";
import { useMutation, useQueryClient } from "@tanstack/react-query";
import { generateSasSignature, uploadSignaturesImage } from "@/apis/partner.api";
import { useToast } from "@/components/ToastProvider";

export default function ContractList() {
  const [search, setSearch] = useState<string>("");
  const [statusParams, setStatusParams] = useState<
    "active" | "inactive" | "terminated" | "pending" | "all"
  >("all");
  const [page, setPage] = useState(1);
  const [uploadModalOpen, setUploadModalOpen] = useState(false);
  const [selectedContractId, setSelectedContractId] = useState<number | null>(null);
  const [pdfFile, setPdfFile] = useState<File | null>(null);
  const [pdfFileName, setPdfFileName] = useState<string>("");
  const [uploadNotes, setUploadNotes] = useState<string>("");
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  
  const { showToast } = useToast();
  const queryClient = useQueryClient();

  const { data: partnerContractRes, isLoading } = useGetPartnersContract({
    sortBy: "desc",
    limit: 4,
    page: page,
    sortOrder: "asc",
    status: statusParams,
  });
  const totalPages = partnerContractRes?.result.pagination.totalPages;

  const partnerContracts = partnerContractRes?.result?.contracts;

  const generateSasMutation = useMutation({
    mutationFn: generateSasSignature,
  });

  const uploadSignatureMutation = useMutation({
    mutationFn: ({ contractId, signedContractPdfUrl, notes }: { 
      contractId: string; 
      signedContractPdfUrl: string; 
      notes: string; 
    }) => uploadSignaturesImage(contractId, { signedContractPdfUrl, notes }),
    onSuccess: () => {
      queryClient.invalidateQueries({ queryKey: ["contract-detail"] });
      queryClient.invalidateQueries({ queryKey: ["partner-contracts"] });
    },
  });

  const handleOpenUploadModal = (contractId: number) => {
    setSelectedContractId(contractId);
    setUploadModalOpen(true);
  };

  const handleCloseUploadModal = () => {
    setUploadModalOpen(false);
    setSelectedContractId(null);
    setPdfFile(null);
    setPdfFileName("");
    setUploadNotes("");
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  const handleFileSelect = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (file.type !== "application/pdf") {
      showToast("Chỉ chấp nhận file PDF", "", "warning");
      return;
    }

    if (file.size > 10 * 1024 * 1024) {
      showToast("File quá lớn (tối đa 10MB)", "", "warning");
      return;
    }

    setPdfFile(file);
    setPdfFileName(file.name);
  };

  const handleUploadPdf = async () => {
    if (!pdfFile || !selectedContractId) {
      showToast("Vui lòng chọn file PDF", "", "warning");
      return;
    }

    setIsUploading(true);

    try {
      // Step 1: Generate SAS URL
      const sasResponse = await generateSasMutation.mutateAsync({
        fileName: `contract-${selectedContractId}-${Date.now()}.pdf`,
      });

      const { sasUrl, blobUrl } = sasResponse.result;

      // Step 2: Upload to Azure Blob
      const uploadResponse = await fetch(sasUrl, {
        method: "PUT",
        headers: {
          "x-ms-blob-type": "BlockBlob",
          "Content-Type": "application/pdf",
        },
        body: pdfFile,
      });

      if (!uploadResponse.ok) {
        throw new Error("Upload lên Azure thất bại");
      }

      // Step 3: Submit to backend
      await uploadSignatureMutation.mutateAsync({
        contractId: selectedContractId.toString(),
        signedContractPdfUrl: blobUrl,
        notes: uploadNotes.trim() || "Hợp đồng đã ký",
      });

      showToast("Upload hợp đồng thành công", "", "success");
      handleCloseUploadModal();
    } catch (error: any) {
      console.error("Upload error:", error);
      showToast(
        error?.message || "Upload thất bại. Vui lòng thử lại.",
        "",
        "error"
      );
    } finally {
      setIsUploading(false);
    }
  };

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
                      {!contract.partnerSignatureUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          onClick={() => handleOpenUploadModal(contract.contractId)}
                        >
                          <Upload className="h-4 w-4 mr-2" />
                          Tải PDF
                        </Button>
                      )}
                      {contract.partnerSignatureUrl && (
                        <Button 
                          variant="outline" 
                          size="sm"
                          className="text-emerald-400 border-emerald-400"
                          disabled
                        >
                          <FileCheck className="h-4 w-4 mr-2" />
                          Đã ký
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

      {/* Upload PDF Modal */}
      <Dialog open={uploadModalOpen} onOpenChange={setUploadModalOpen}>
        <DialogContent 
          className="sm:max-w-md bg-zinc-900 border-zinc-800 [&>button]:hidden"
          onInteractOutside={(e) => e.preventDefault()}
          onEscapeKeyDown={(e) => e.preventDefault()}
        >
          <div className="flex items-center justify-between">
            <DialogTitle className="text-xl font-semibold text-white">
              Upload hợp đồng đã ký
            </DialogTitle>
            <button
              onClick={handleCloseUploadModal}
              className="rounded-sm opacity-70 ring-offset-background transition-opacity hover:opacity-100 focus:outline-none focus:ring-2 focus:ring-ring focus:ring-offset-2 disabled:pointer-events-none data-[state=open]:bg-accent data-[state=open]:text-muted-foreground"
              disabled={isUploading}
            >
              <X className="h-4 w-4" />
              <span className="sr-only">Close</span>
            </button>
          </div>

          <div className="space-y-4 mt-4">
            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                File PDF hợp đồng đã ký *
              </label>
              <div className="space-y-2">
                <input
                  ref={fileInputRef}
                  type="file"
                  accept=".pdf"
                  onChange={handleFileSelect}
                  className="hidden"
                />
                <Button
                  type="button"
                  variant="outline"
                  className="w-full justify-start text-left font-normal border-zinc-700 hover:bg-zinc-800"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={isUploading}
                >
                  <Upload className="mr-2 h-4 w-4" />
                  {pdfFileName || "Chọn file PDF..."}
                </Button>
                {pdfFile && (
                  <div className="flex items-center gap-2 text-sm text-zinc-400">
                    <FileCheck className="h-4 w-4 text-emerald-400" />
                    <span>{pdfFile.name}</span>
                    <span className="text-zinc-600">({(pdfFile.size / 1024).toFixed(2)} KB)</span>
                  </div>
                )}
              </div>
            </div>

            <div className="space-y-2">
              <label className="text-sm font-medium text-zinc-300">
                Ghi chú (không bắt buộc)
              </label>
              <textarea
                value={uploadNotes}
                onChange={(e) => setUploadNotes(e.target.value)}
                placeholder="Thêm ghi chú về hợp đồng..."
                className="w-full min-h-[80px] px-3 py-2 bg-zinc-800 border border-zinc-700 rounded-lg text-white placeholder:text-zinc-500 focus:outline-none focus:ring-2 focus:ring-emerald-500"
                disabled={isUploading}
              />
            </div>

            <div className="flex justify-end gap-3 pt-4">
              <Button
                variant="outline"
                onClick={handleCloseUploadModal}
                disabled={isUploading}
                className="border-zinc-700 hover:bg-zinc-800"
              >
                Hủy
              </Button>
              <Button
                onClick={handleUploadPdf}
                disabled={!pdfFile || isUploading}
                className="bg-emerald-600 hover:bg-emerald-500"
              >
                {isUploading ? (
                  <>
                    <Loader2 className="mr-2 h-4 w-4 animate-spin" />
                    Đang tải...
                  </>
                ) : (
                  <>
                    <Upload className="mr-2 h-4 w-4" />
                    Upload
                  </>
                )}
              </Button>
            </div>
          </div>
        </DialogContent>
      </Dialog>
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
