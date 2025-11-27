"use client";

import {
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { useState } from "react";
import {
  useCheckPayOSOrder,
  useCreatePayOS,
  useSetExpiredOrder,
} from "@/apis/user.payment.api";
import { Button } from "@/components/ui/button";
import { redirect } from "next/navigation";
import { useToast } from "@/components/ToastProvider";
import { useGetShowtimeById } from "@/apis/user.catalog.api";
import {
  useCreateCheckout,
  useDeleteSessionVoucher,
  usePostApplyCoupon,
} from "@/apis/user.booking-session.api";
import {
  Sheet,
  SheetClose,
  SheetContent,
  SheetTitle,
  SheetTrigger,
} from "@/components/ui/sheet";
import { LuTicketPercent } from "react-icons/lu";
import Image from "next/image";
import { formatCurrency } from "@/utils/format";

interface ComboCount {
  serviceId: number;
  quantity: number;
  servicesTitle: string;
  price?: number;
}

interface PostPricingPreview {
  appliedVoucherCode: string | null; // tùy API có thể null
  total: number;
  seatSubTotal?: number;
  comboSubTotal?: number;
}

interface CheckOutProps {
  sessionId?: string;
  selectedCombos: ComboCount[];
  selectedSeats?: { seatId: number; seatTitle: string }[];
  cinemaName?: string;
  roomName?: string;
  roomFormat?: string;
  qrCode?: string;
  totalPrice?: number;
  previewSession?: PostPricingPreview;
  curentOrderId: string;
  showtimeId?: number;
}

const CheckoutDetail = ({
  selectedCombos,
  selectedSeats,
  previewSession,
  curentOrderId,
  showtimeId,
  sessionId,
}: CheckOutProps) => {
  // console.log(`showtimeId: ${showtimeId}`);
  // console.log(`curentOrderId: ${curentOrderId}`);

  const { showToast } = useToast();
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [paymentDisplay, setPaymentDisplay] = useState<boolean>(true);
  const [qrCode, setQrCode] = useState<string>("");
  const [showSpnner, setShowSpinner] = useState<boolean>(true);

  const [appliedVouchers, setAppliedVouchers] = useState<{ code: string }[]>(
    []
  );

  const expiredOrderMutate = useSetExpiredOrder();
  const checkPayOSOrderMutate = useCheckPayOSOrder();
  const setVoucherMutate = usePostApplyCoupon();
  const deleteVoucherMutate = useDeleteSessionVoucher();
  const checkoutMutate = useCreateCheckout();
  const createPaymentMutate = useCreatePayOS();

  const { data: getPartnerShowtimeRes } = useGetShowtimeById(showtimeId ?? 0);
  const showtimeInfo = getPartnerShowtimeRes?.result;

  const handleSetExpiredOrder = () => {
    expiredOrderMutate.mutate(curentOrderId, {
      onSuccess: () => {
        console.log("handleSetExpiredOrder sucess");
      },
      onError: (error) => {
        console.log("handleSetExpiredOrder error" + error);
      },
    });
  };

  const handleSetVoucher = () => {
    if (!voucherCode.trim()) return;

    setVoucherMutate.mutate(
      {
        id: sessionId ?? "",
        voucherCode: voucherCode.trim(),
      },
      {
        onSuccess: (res) => {
          showToast(res.message, "", "success");
          setAppliedVouchers((prev) => [...prev, { code: voucherCode.trim() }]);
        },
        onError: (error) => {
          showToast(error.message, "", "error");
        },
      }
    );

    setVoucherCode("");
  };

  const handleCheckPaymentStatus = () => {
    checkPayOSOrderMutate.mutate(curentOrderId, {
      onSuccess: (res) => {
        switch (res.result.status) {
          case "EXPIRED":
            console.log("Quy trình thanh toán hết hạn!");
            redirect(`/movie/${showtimeInfo?.movieId}`);
          case "PENDING":
            showToast("Đang kiểm tra trạng thái");
            break;
          case "PAID":
            showToast(
              "Thanh toán thành công",
              "Vé sẽ được gửi về email của bạn!",
              "warning"
            );
            redirect("/");
          default:
            break;
        }
      },
      onError: (error) => {
        console.log("handleCheckPaymentStatus error: " + error);
      },
    });
  };

  const handleRemoveVoucher = (code: string) => {
    setAppliedVouchers((prev) => prev.filter((v) => v.code !== code));
    deleteVoucherMutate.mutate(sessionId ?? "", {
      onSuccess: (res) => {
        showToast(res.message, "", "success");
      },
      onError: (error) => {
        showToast(error.message, "", "error");
      },
    });
  };

  const extractTime = (datetime?: string) => {
    if (!datetime) return "";
    const parts = datetime.split("T");
    if (parts.length < 2) return "";
    return parts[1].slice(0, 5);
  };

  const extractDate = (datetime?: string) => {
    if (!datetime) return "";
    const parts = datetime.split("T");
    if (parts.length === 0) return "";
    const [year, month, day] = parts[0].split("-");
    if (!year || !month || !day) return "";
    return `${day}/${month}/${year}`;
  };

  const handleCreatePayment = (orderId: string) => {
    console.log(orderId);
    createPaymentMutate.mutate(
      {
        orderId: orderId ?? "",
        cancelUrl: "",
        returnUrl: "",
      },
      {
        onSuccess: (res) => {
          setQrCode(res.result.qrCode);
          setPaymentDisplay(true);
          setShowSpinner(false);
        },
        onError: (err) => {
          console.log(`handleCreatePayment failed`);
          showToast(err.message, "", "error");
        },
      }
    );
  };

  const handleSendCheckout = () => {
    checkoutMutate.mutate(
      {
        id: sessionId ?? "",
        body: {
          provider: "PayOS",
          cancelUrl: "",
          returnUrl: "",
        },
      },
      {
        onSuccess: (res) => handleCreatePayment(res.result.orderId),
        onError: (err) => {
          console.log(`handleGetPreview failed: ${err.message}`);
          showToast(err.message, "", "error");
        },
      }
    );
  };

  return (
    <DialogContent
      onInteractOutside={(e) => e.preventDefault()}
      className="!max-w-4xl p-0 bg-white text-zinc-800 border border-zinc-200 rounded-xl shadow-2xl overflow-hidden [&>button]:hidden"
    >
      <DialogTitle className="sr-only">Thanh toán</DialogTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT – INFO */}
        <div className="p-8 space-y-8 bg-white">
          {/* Movie Title */}
          <div className="space-y-1">
            <h2 className="text-2xl font-bold leading-tight">
              {showtimeInfo?.movie?.title ?? "Tên phim"}
            </h2>
            <p className="text-xs text-zinc-500">Thông tin suất chiếu</p>
          </div>

          {/* TIME + DATE */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-zinc-500">THỜI GIAN</div>
              <div className="font-semibold mt-1 text-sm">
                {extractTime(showtimeInfo?.startTime ?? "")} ~{" "}
                {extractTime(showtimeInfo?.endTime ?? "")}
              </div>
            </div>

            <div>
              <div className="text-xs text-zinc-500">NGÀY CHIẾU</div>
              <div className="font-semibold mt-1 text-sm">
                {extractDate(showtimeInfo?.startTime ?? "")}
              </div>
            </div>
          </div>

          {/* CINEMA */}
          <div className="space-y-1">
            <div className="text-xs text-zinc-500">RẠP</div>
            <div className="font-semibold">{showtimeInfo?.cinema?.name}</div>
            <div className="text-sm text-zinc-500">
              {showtimeInfo?.cinema?.address}, {showtimeInfo?.cinema?.city}
            </div>
          </div>

          {/* ROOM + FORMAT */}
          <div className="grid grid-cols-2 gap-6">
            <div>
              <div className="text-xs text-zinc-500 mb-1">PHÒNG CHIẾU</div>
              <div className="font-semibold">{showtimeInfo?.screen?.name}</div>
            </div>
            <div>
              <div className="text-xs text-zinc-500 mb-1">ÂM THANH</div>
              <div className="font-semibold">
                {showtimeInfo?.screen?.soundSystem}
              </div>
            </div>
          </div>

          {/* SEATS */}
          <div className="">
            <div className="text-xs text-zinc-500 mb-1">GHẾ</div>
            <div className="flex items-center justify-between">
              <div className="font-semibold text-sm">
                {selectedSeats?.map((s) => s.seatTitle).join(", ")}
              </div>
              <span className="font-semibold text-sm">
                {/* {Number(showtimeInfo?.basePrice) * (selectedSeats?.length ?? 0)}{" "}
                đ */}
                {formatCurrency(previewSession?.seatSubTotal ?? 0)}
              </span>
            </div>
          </div>

          {/* COMBOS */}
          {selectedCombos.length > 0 && (
            <div className="">
              <div className="text-xs text-zinc-500">BẮP - NƯỚC</div>

              {selectedCombos.map((combo) => (
                <div
                  key={combo.serviceId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {combo.quantity} × {combo.servicesTitle}
                  </span>
                  <span className="font-semibold">
                    {formatCurrency(previewSession?.comboSubTotal ?? 0)}
                  </span>
                </div>
              ))}
            </div>
          )}
        </div>

        {/* RIGHT – ORDER SUMMARY */}
        {paymentDisplay ? (
          <div className="bg-[#f6f7f9] p-8 flex flex-col gap-8 relative h-full">
            {/* Close Button */}
            <DialogClose
              onClick={handleSetExpiredOrder}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700"
            >
              ✕
            </DialogClose>

            {showSpnner ? (
              <div className="h-full flex flex-col items-center justify-center">
                <div className="w-12 text-primary">
                  <svg
                    fill="currentColor"
                    viewBox="0 0 24 24"
                    xmlns="http://www.w3.org/2000/svg"
                  >
                    <circle cx="4" cy="12" r="3">
                      <animate
                        id="spinner_qFRN"
                        begin="0;spinner_OcgL.end+0.25s"
                        attributeName="cy"
                        calcMode="spline"
                        dur="0.6s"
                        values="12;6;12"
                        keySplines=".33,.66,.66,1;.33,0,.66,.33"
                      ></animate>
                    </circle>
                    <circle cx="12" cy="12" r="3">
                      <animate
                        begin="spinner_qFRN.begin+0.1s"
                        attributeName="cy"
                        calcMode="spline"
                        dur="0.6s"
                        values="12;6;12"
                        keySplines=".33,.66,.66,1;.33,0,.66,.33"
                      ></animate>
                    </circle>
                    <circle cx="20" cy="12" r="3">
                      <animate
                        id="spinner_OcgL"
                        begin="spinner_qFRN.begin+0.2s"
                        attributeName="cy"
                        calcMode="spline"
                        dur="0.6s"
                        values="12;6;12"
                        keySplines=".33,.66,.66,1;.33,0,.66,.33"
                      ></animate>
                    </circle>
                  </svg>
                </div>
              </div>
            ) : (
              <div>
                <div className="flex flex-col items-center justify-around h-full w-full ">
                  <h3 className="text-lg font-bold">
                    Quét mã QR để thanh toán
                  </h3>
                  <p>Qr code</p>

                  <Button onClick={handleCheckPaymentStatus}>
                    Kiểm tra trạng thái thanh toán
                  </Button>
                </div>
              </div>
            )}
          </div>
        ) : (
          <div className="bg-[#f6f7f9] p-8 flex flex-col gap-8 relative">
            {/* Close Button */}
            <DialogClose
              onClick={handleSetExpiredOrder}
              className="absolute top-4 right-4 text-zinc-500 hover:text-zinc-700"
            >
              ✕
            </DialogClose>

            {/* Title */}
            <div className="text-center space-y-1">
              <p className="text-sm text-zinc-500">
                Vui lòng kiểm tra thông tin trước khi thanh toán
              </p>
            </div>

            {/* VOUCHER */}
            <div className="space-y-2">
              <Sheet>
                <SheetTrigger asChild>
                  <button className="w-full flex items-center justify-between px-4 py-3 bg-white border border-zinc-300 rounded-lg text-sm cursor-pointer hover:bg-zinc-50">
                    <div className="flex items-center gap-3">
                      <LuTicketPercent size={17} />
                      <p>Nhập hoặc chọn mã giảm giá</p>
                    </div>
                    <svg
                      className="w-4 h-4 text-zinc-600"
                      fill="none"
                      stroke="currentColor"
                      strokeWidth="2"
                      viewBox="0 0 24 24"
                    >
                      <path d="M9 5l7 7-7 7" />
                    </svg>
                  </button>
                </SheetTrigger>
                <SheetContent
                  side="right"
                  className="!w-[600px] !max-w-none bg-[#f6f7f9] text-black p-0 flex flex-col animate-slide-in-right"
                >
                  {/* HEADER */}
                  <SheetTitle className="hidden">Vouchers</SheetTitle>

                  {/* BODY – Scrollable */}
                  <div className="flex-1 overflow-y-auto px-6 pt-6 space-y-6">
                    {/* --- INPUT CODE --- */}
                    <div className="pb-6 border-b flex flex-col items-baseline gap-3 w-full border-zinc-300">
                      <h3 className="text-xl font-bold">Mã giảm giá</h3>
                      <div className="flex w-full items-center gap-2">
                        <input
                          type="text"
                          placeholder="Nhập mã giảm giá..."
                          className="w-full px-3 py-3 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#c92241]"
                          onChange={(e) => setVoucherCode(e.target.value)}
                        />
                        <Button
                          onClick={handleSetVoucher}
                          className="bg-[#c92241] hover:bg-[#b11d38] text-white px-4"
                        >
                          Áp dụng
                        </Button>
                      </div>
                    </div>

                    {/* --- VOUCHER LIST --- */}
                    <div className="pb-6 border-b border-zinc-300">
                      <h4 className="font-semibold mb-3 text-sm text-zinc-600">
                        Mã đã áp dụng
                      </h4>

                      <div className="space-y-2 h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                        {appliedVouchers.length > 0 ? (
                          appliedVouchers.map((v) => (
                            <div
                              key={v.code}
                              className="flex justify-between items-center text-sm bg-green-50 border border-green-200 px-3 py-3 rounded-md"
                            >
                              {/* LEFT – INFO */}
                              <div className="flex flex-col gap-1">
                                <span className="font-semibold text-green-700">
                                  {v.code}
                                </span>

                                {/* Description (nếu không có mô tả thì ẩn) */}
                                {/* {v.description && ( */}
                                <p className="text-xs text-green-600 leading-4">
                                  {/* {v.description} */} Mã giảm 50% cho đơn
                                  hàng trên 100.000đ
                                </p>
                                {/* )} */}
                              </div>

                              {/* RIGHT – DISCOUNT + REMOVE */}
                              <div className="flex items-center gap-3">
                                <span className="font-bold text-green-700 whitespace-nowrap">
                                  -30.000đ
                                </span>

                                <button
                                  onClick={() => handleRemoveVoucher(v.code)}
                                  className="text-red-500 hover:text-red-700 text-base leading-none cursor-pointer"
                                >
                                  ✕
                                </button>
                              </div>
                            </div>
                          ))
                        ) : (
                          <div className="w-full h-full flex flex-col items-center justify-center gap-3 text-zinc-500">
                            {/* SVG icon */}
                            <Image
                              src={"/voucher-svgrepo-com.svg"}
                              alt="voucher"
                              width={100}
                              height={100}
                            />

                            {/* Text */}
                            <p className="text-sm font-medium">
                              Chưa có mã nào rồi
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* --- PRICE SUMMARY --- */}
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Tiết kiệm</span>
                        <span className="font-semibold">-0đ</span>
                      </div>

                      <div className="flex justify-between text-lg font-bold">
                        <span>Cần thanh toán</span>
                        <span>{previewSession?.total?.toLocaleString()}đ</span>
                      </div>
                    </div>
                  </div>

                  {/* FOOTER – Fixed bottom button */}
                  <div className="p-6 border-t border-zinc-300 bg-white sticky bottom-0">
                    <SheetClose asChild>
                      <Button className="w-full bg-[#c92241] hover:bg-[#b11d38] text-white font-semibold py-3 rounded-md">
                        Xác nhận
                      </Button>
                    </SheetClose>
                  </div>
                </SheetContent>
              </Sheet>
            </div>

            {/* ORDER INFO */}
            <div className="space-y-4 border-t border-zinc-300 pt-4">
              <h4 className="font-semibold text-lg">Thông tin đơn hàng</h4>

              <div className="flex justify-between text-sm">
                <span>Tổng tiền</span>
                <span className="font-semibold">
                  {previewSession?.total?.toLocaleString()}đ
                </span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>Khuyến mãi</span>
                <span className="font-semibold">-0đ</span>
              </div>

              {appliedVouchers.length !== 0 && (
                <div className="flex justify-between items-center text-sm font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-md">
                  {appliedVouchers.length} vouchers đã áp dụng
                </div>
              )}
            </div>

            {/* FINAL TOTAL */}
            <div className="border-t border-zinc-300 pt-4">
              <div className="flex items-center justify-between mb-1">
                <span className="text-lg font-semibold">
                  Số tiền cần thanh toán
                </span>
                <span className="text-lg font-semibold">
                  {previewSession?.total?.toLocaleString()}đ
                </span>
              </div>
              <p className="text-xs text-zinc-500">
                * Đã bao gồm ưu đãi (nếu có).
              </p>
            </div>

            {/* BUTTON */}
            <Button
              onClick={handleSendCheckout}
              className="mt-auto w-full bg-[#c92241] hover:bg-[#b11d38] text-white font-semibold py-3 rounded-md"
            >
              Xác nhận thanh toán
            </Button>
          </div>
        )}
      </div>
    </DialogContent>
  );
};

export default CheckoutDetail;
