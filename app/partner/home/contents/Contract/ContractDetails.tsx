"use client";

import React from "react";
import { useQuery } from "@tanstack/react-query";
import { getPartnersContractById } from "@/apis/partner.api";
import { Loader2, FileText, Calendar, DollarSign, Shield, CheckCircle2 } from "lucide-react";
import { Badge } from "@/components/ui/badge";
import { Card, CardContent, CardHeader, CardTitle } from "@/components/ui/card";
import { Separator } from "@/components/ui/separator";

interface ContractDetailsProps {
  contractId: number;
}

const ContractDetails = ({ contractId }: ContractDetailsProps) => {
  const { data, isLoading, error } = useQuery({
    queryKey: ["contract-detail", contractId],
    queryFn: () => getPartnersContractById(contractId.toString()),
    enabled: !!contractId,
  });

  const contract = data?.result;

  if (isLoading) {
    return (
      <div className="flex items-center justify-center h-full">
        <Loader2 className="h-8 w-8 animate-spin text-orange-500" />
      </div>
    );
  }

  if (error) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <Shield className="h-12 w-12 text-red-500" />
        <p className="text-red-400 text-center">
          {(error as any)?.message || "Không thể tải thông tin hợp đồng"}
        </p>
      </div>
    );
  }

  if (!contract) {
    return (
      <div className="flex flex-col items-center justify-center h-full gap-4">
        <FileText className="h-12 w-12 text-zinc-600" />
        <p className="text-zinc-400 text-center">Không tìm thấy hợp đồng</p>
      </div>
    );
  }

  const formatDate = (dateStr: string) => {
    return new Date(dateStr).toLocaleDateString("vi-VN");
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat("vi-VN", {
      style: "currency",
      currency: "VND",
    }).format(amount);
  };

  const getStatusBadge = (status: string) => {
    const statusConfig = {
      active: { label: "Hiệu lực", color: "border-emerald-500 text-emerald-400" },
      inactive: { label: "Chưa ký", color: "border-yellow-500 text-yellow-400" },
      pending: { label: "Chờ ký", color: "border-blue-500 text-blue-400" },
      terminated: { label: "Đã hủy", color: "border-red-500 text-red-400" },
    };
    const config = statusConfig[status as keyof typeof statusConfig] || statusConfig.inactive;
    return (
      <Badge variant="outline" className={config.color}>
        {config.label}
      </Badge>
    );
  };

  return (
    <div className="h-full overflow-y-auto px-4 py-2 space-y-6 text-zinc-100">
      {/* Header */}
      <div className="space-y-4">
        <div className="flex items-start justify-between">
          <div>
            <h2 className="text-3xl font-bold">{contract.title}</h2>
            <p className="text-zinc-400 mt-1">{contract.contractNumber}</p>
          </div>
          {getStatusBadge(contract.status)}
        </div>
        
        {contract.description && (
          <p className="text-zinc-300">{contract.description}</p>
        )}
      </div>

      <Separator className="bg-zinc-800" />

      {/* Contract Info Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Duration */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <Calendar className="h-5 w-5 text-blue-400" />
            <CardTitle className="text-sm font-medium text-zinc-400">Thời hạn hợp đồng</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-zinc-400">Bắt đầu:</span>{" "}
                <span className="font-medium">{formatDate(contract.startDate)}</span>
              </p>
              <p className="text-sm">
                <span className="text-zinc-400">Kết thúc:</span>{" "}
                <span className="font-medium">{formatDate(contract.endDate)}</span>
              </p>
            </div>
          </CardContent>
        </Card>

        {/* Financial Terms */}
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader className="flex flex-row items-center gap-2 space-y-0 pb-2">
            <DollarSign className="h-5 w-5 text-green-400" />
            <CardTitle className="text-sm font-medium text-zinc-400">Điều khoản tài chính</CardTitle>
          </CardHeader>
          <CardContent>
            <div className="space-y-1">
              <p className="text-sm">
                <span className="text-zinc-400">Tỷ lệ hoa hồng:</span>{" "}
                <span className="font-medium text-green-400">{contract.commissionRate}%</span>
              </p>
              <p className="text-sm">
                <span className="text-zinc-400">Doanh thu tối thiểu:</span>{" "}
                <span className="font-medium">{formatCurrency(contract.minimumRevenue)}</span>
              </p>
            </div>
          </CardContent>
        </Card>
      </div>

      {/* Partner Information */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Thông tin đối tác</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Tên công ty</p>
              <p className="font-medium">{contract.partnerName}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Mã số thuế</p>
              <p className="font-medium">{contract.partnerTaxCode}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Người đại diện</p>
              <p className="font-medium">{contract.partnerRepresentative}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Chức vụ</p>
              <p className="font-medium">{contract.partnerPosition}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Email</p>
              <p className="font-medium">{contract.partnerEmail}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Điện thoại</p>
              <p className="font-medium">{contract.partnerPhone}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-zinc-400">Địa chỉ</p>
              <p className="font-medium">{contract.partnerAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Company Information */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg">Thông tin công ty</CardTitle>
        </CardHeader>
        <CardContent className="space-y-3">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
            <div>
              <p className="text-sm text-zinc-400">Tên công ty</p>
              <p className="font-medium">{contract.companyName}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Mã số thuế</p>
              <p className="font-medium">{contract.companyTaxCode}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Người quản lý</p>
              <p className="font-medium">{contract.managerName}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Chức vụ</p>
              <p className="font-medium">{contract.managerPosition}</p>
            </div>
            <div>
              <p className="text-sm text-zinc-400">Email</p>
              <p className="font-medium">{contract.managerEmail}</p>
            </div>
            <div className="md:col-span-2">
              <p className="text-sm text-zinc-400">Địa chỉ</p>
              <p className="font-medium">{contract.companyAddress}</p>
            </div>
          </div>
        </CardContent>
      </Card>

      {/* Terms and Conditions */}
      {contract.termsAndConditions && (
        <Card className="bg-zinc-900 border-zinc-800">
          <CardHeader>
            <CardTitle className="text-lg">Điều khoản và điều kiện</CardTitle>
          </CardHeader>
          <CardContent>
            <pre className="whitespace-pre-wrap text-sm text-zinc-300 font-sans">
              {contract.termsAndConditions}
            </pre>
          </CardContent>
        </Card>
      )}

      {/* Signatures */}
      <Card className="bg-zinc-900 border-zinc-800">
        <CardHeader>
          <CardTitle className="text-lg flex items-center gap-2">
            <CheckCircle2 className="h-5 w-5 text-emerald-400" />
            Chữ ký và xác nhận
          </CardTitle>
        </CardHeader>
        <CardContent className="space-y-4">
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Partner Signature */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-400">Chữ ký đối tác</p>
              {contract.partnerSignatureUrl ? (
                <div className="space-y-2">
                  <img
                    src={contract.partnerSignatureUrl}
                    alt="Partner Signature"
                    className="max-w-[200px] border border-zinc-700 rounded p-2 bg-white"
                  />
                  {contract.partnerSignedAt && (
                    <p className="text-xs text-zinc-500">
                      Ký ngày: {formatDate(contract.partnerSignedAt)}
                    </p>
                  )}
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Chưa ký</p>
              )}
            </div>

            {/* Manager Signature */}
            <div className="space-y-2">
              <p className="text-sm font-medium text-zinc-400">Chữ ký quản lý</p>
              {contract.managerSignedAt ? (
                <div className="space-y-2">
                  <div className="text-sm text-emerald-400 flex items-center gap-2">
                    <CheckCircle2 className="h-4 w-4" />
                    <span>Đã ký số</span>
                  </div>
                  <p className="text-xs text-zinc-500">
                    Ký ngày: {formatDate(contract.managerSignedAt)}
                  </p>
                </div>
              ) : (
                <p className="text-sm text-zinc-500">Chưa ký</p>
              )}
            </div>
          </div>

          {contract.isLocked && (
            <div className="mt-4 flex items-center gap-2 text-sm text-zinc-400">
              <Shield className="h-4 w-4" />
              <span>Hợp đồng đã được khóa và không thể chỉnh sửa</span>
              {contract.lockedAt && (
                <span className="text-zinc-500">
                  (Khóa lúc: {formatDate(contract.lockedAt)})
                </span>
              )}
            </div>
          )}
        </CardContent>
      </Card>

      {/* Metadata */}
      <div className="text-xs text-zinc-500 space-y-1 pb-4">
        <p>Tạo bởi: {contract.createdByName} - {formatDate(contract.createdAt)}</p>
        <p>Cập nhật lần cuối: {formatDate(contract.updatedAt)}</p>
        {contract.contractHash && (
          <p className="font-mono"></p>
        )}
      </div>
    </div>
  );
};

export default ContractDetails;