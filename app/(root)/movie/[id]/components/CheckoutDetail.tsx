"use client";

import {
  DialogClose,
  DialogContent,
  DialogTitle,
} from "@/components/ui/dialog";
import React, { Dispatch, use, useEffect, useState } from "react";
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
import { QRCodeCanvas } from "qrcode.react";
import { useGetUserVoucherByCode } from "@/apis/user.voucher.api";

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
  previewSession?: PostPricingPreview;
  showtimeId?: number;
  setCheckoutDialog?: Dispatch<React.SetStateAction<boolean>>;
}

const CheckoutDetail = ({
  selectedCombos,
  selectedSeats,
  previewSession,
  showtimeId,
  sessionId,
  setCheckoutDialog,
}: CheckOutProps) => {
  useEffect(() => {
    console.log(`showtimeId: ${showtimeId}`);
    console.log(`sessionId: ${sessionId}`);
  }, []);

  const { showToast } = useToast();
  const [voucherCode, setVoucherCode] = useState<string>("");
  const [paymentDisplay, setPaymentDisplay] = useState<boolean>(false);
  const [qrCode, setQrCode] = useState<string>("");
  const [showSpnner, setShowSpinner] = useState<boolean>(false);
  const [orderId, setOrderId] = useState<string>("");
  const [voucherForInfo, setVoucherForInfo] = useState<string>("");

  // State lưu thông tin pricing từ API (cập nhật sau khi apply/remove voucher)
  const [pricingData, setPricingData] = useState<{
    total: number;
    discount: number;
    seatsSubtotal: number;
    combosSubtotal: number;
    appliedVoucher: string | null;
  }>({
    total: previewSession?.total ?? 0,
    discount: 0,
    seatsSubtotal: previewSession?.seatSubTotal ?? 0,
    combosSubtotal: previewSession?.comboSubTotal ?? 0,
    appliedVoucher: previewSession?.appliedVoucherCode ?? null,
  });

  // Sync pricingData khi previewSession thay đổi (khi quay lại từ chọn combo)
  useEffect(() => {
    if (previewSession) {
      setPricingData((prev) => ({
        ...prev,
        total: previewSession.total ?? prev.total,
        seatsSubtotal: previewSession.seatSubTotal ?? prev.seatsSubtotal,
        combosSubtotal: previewSession.comboSubTotal ?? prev.combosSubtotal,
        // Giữ nguyên discount và appliedVoucher nếu đã có voucher
        discount: prev.appliedVoucher ? prev.discount : 0,
      }));
    }
  }, [previewSession]);

  // Chỉ cho phép 1 voucher
  const [appliedVoucher, setAppliedVoucher] = useState<{
    code: string;
    description: string;
    discountVal: number;
  } | null>(null);

  // State loading khi đang áp dụng voucher
  const [isApplyingVoucher, setIsApplyingVoucher] = useState(false);

  const expiredOrderMutate = useSetExpiredOrder();
  const checkPayOSOrderMutate = useCheckPayOSOrder();
  const setVoucherMutate = usePostApplyCoupon();
  const deleteVoucherMutate = useDeleteSessionVoucher();
  const checkoutMutate = useCreateCheckout();
  const createPaymentMutate = useCreatePayOS();

  const { data: getVoucherByCodeRes, isLoading: voucherInfoLoad } =
    useGetUserVoucherByCode(voucherForInfo);
  const voucherInfo = getVoucherByCodeRes?.result;

  const { data: getPartnerShowtimeRes } = useGetShowtimeById(showtimeId ?? 0);
  const showtimeInfo = getPartnerShowtimeRes?.result;

  const handleSetExpiredOrder = () => {
    console.log(orderId);

    expiredOrderMutate.mutate(orderId, {
      onSuccess: () => {
        console.log("handleSetExpiredOrder sucess");
      },
      onError: (error) => {
        console.log("handleSetExpiredOrder error" + error);
      },
    });
  };

  const handleSetVoucher = () => {
    if (!voucherCode.trim()) {
      showToast("Vui lòng nhập mã giảm giá", "", "warning");
      return;
    }

    if (appliedVoucher) {
      showToast("Chỉ được áp dụng 1 mã giảm giá", "", "warning");
      return;
    }

    setIsApplyingVoucher(true);
    setVoucherForInfo(voucherCode.trim());
    setVoucherCode("");
  };

  useEffect(() => {
    // Chỉ gọi API apply voucher khi:
    // 1. Có voucherForInfo (người dùng đã nhập mã)
    // 2. Đã load xong thông tin voucher
    if (voucherForInfo && !voucherInfoLoad) {
      // Nếu không tìm thấy voucher (API trả về null/undefined)
      if (!voucherInfo) {
        showToast("Mã giảm giá không tồn tại hoặc đã hết hạn", "", "error");
        setVoucherForInfo("");
        setIsApplyingVoucher(false);
        return;
      }

      // Có voucherInfo, tiến hành apply
      setVoucherMutate.mutate(
        {
          id: sessionId ?? "",
          voucherCode: voucherInfo.voucherCode,
        },
        {
          onSuccess: (res) => {
            showToast(res.message, "", "success");
            
            // Cập nhật pricing từ API response
            const pricing = res.result.pricing;
            setPricingData({
              total: pricing.total,
              discount: pricing.discount,
              seatsSubtotal: pricing.seatsSubtotal,
              combosSubtotal: pricing.combosSubtotal,
              appliedVoucher: res.result.appliedVoucher,
            });

            // Set single voucher
            setAppliedVoucher({
              code: voucherInfo.voucherCode,
              description: voucherInfo.description,
              discountVal: res.result.discountAmount,
            });
            
            setVoucherForInfo("");
            setIsApplyingVoucher(false);
          },
          onError: (error: any) => {
            showToast(error?.message || "Mã không hợp lệ", "", "error");
            setVoucherForInfo("");
            setIsApplyingVoucher(false);
          },
        }
      );
    }
  }, [voucherForInfo, voucherInfoLoad, voucherInfo]);

  // const handleSetVoucher = () => {
  //   const code = voucherCode.trim();
  //   if (!code) return;

  //   setVoucherForInfo(code);
  //   setVoucherCode("");

  //   if (!voucherInfo || voucherInfoLoad) {
  //     showToast("Đang tải voucher hoặc voucher không tồn tại", "", "warning");
  //     return;
  //   }

  //   setVoucherMutate.mutate(
  //     {
  //       id: sessionId ?? "",
  //       voucherCode: code,
  //     },
  //     {
  //       onSuccess: (res) => {
  //         showToast(res.message, "", "success");
  //         setAppliedVouchers((prev) => [
  //           ...prev,
  //           {
  //             code,
  //             description: voucherInfo.description,
  //             discountVal: voucherInfo.discountVal,
  //           },
  //         ]);
  //       },
  //       onError: (error) => {
  //         showToast(error.message, "", "error");
  //       },
  //     }
  //   );
  // };

  const handleCheckPaymentStatus = () => {
    console.log(orderId);

    checkPayOSOrderMutate.mutate(orderId, {
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

  const handleRemoveVoucher = () => {
    deleteVoucherMutate.mutate(sessionId ?? "", {
      onSuccess: (res) => {
        showToast(res.message, "", "success");
        // Reset voucher và pricing về giá gốc
        setAppliedVoucher(null);
        setPricingData({
          total: previewSession?.total ?? 0,
          discount: 0,
          seatsSubtotal: previewSession?.seatSubTotal ?? 0,
          combosSubtotal: previewSession?.comboSubTotal ?? 0,
          appliedVoucher: null,
        });
      },
      onError: (error: any) => {
        showToast(error?.message || "Có lỗi xảy ra", "", "error");
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
        onSuccess: (res) => {
          setOrderId(res.result.orderId);
          handleCreatePayment(res.result.orderId);
        },
        onError: (err) => {
          console.log(`handleSendCheckout failed: ${err.message}`);
          showToast(err.message, "", "error");
        },
      }
    );
  };

  // Sử dụng discount từ API response (pricingData.discount)
  // Nếu chưa có response từ API, tính từ local state
  const getTotalDiscount = () => {
    return pricingData.discount;
  };

  // Lấy tổng tiền cần thanh toán (đã trừ discount)
  const getFinalTotal = () => {
    return pricingData.total;
  };

  const handleBackQrPayment = () => {
    setPaymentDisplay(false);
    setQrCode("");
    handleSetExpiredOrder();
    setCheckoutDialog?.(false);
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
                <div className="flex flex-col gap-10 items-center justify-around h-full w-full ">
                  <h3 className="text-lg font-bold">
                    Quét mã QR để thanh toán
                  </h3>
                  {qrCode && (
                    // <div></div>
                    <QRCodeCanvas
                      value={qrCode} // dữ liệu để mã QR hiển thị
                      size={200} // kích thước px
                      bgColor="#ffffff" // màu nền
                      fgColor="#000000" // màu QR
                      level="H" // mức độ sửa lỗi (L, M, Q, H)
                    />
                  )}

                  {/* <div className="w-full flex justify-between gap-4"> */}
                  {/* <Button onClick={handleBackQrPayment}>Trở lại</Button> */}
                  <Button onClick={handleCheckPaymentStatus}>
                    Kiểm tra trạng thái thanh toán
                  </Button>
                  {/* </div> */}
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
                    {/* --- INPUT CODE --- Chỉ hiển thị khi chưa có voucher */}
                    {!appliedVoucher ? (
                      <div className="pb-6 border-b flex flex-col items-baseline gap-3 w-full border-zinc-300">
                        <h3 className="text-xl font-bold">Mã giảm giá</h3>
                        <div className="flex w-full items-center gap-2">
                          <input
                            type="text"
                            placeholder="Nhập mã giảm giá..."
                            value={voucherCode}
                            disabled={isApplyingVoucher}
                            className="w-full px-3 py-3 text-sm border border-zinc-300 rounded-lg focus:ring-2 focus:ring-[#c92241] disabled:bg-zinc-100 disabled:cursor-not-allowed"
                            onChange={(e) => setVoucherCode(e.target.value)}
                            onKeyDown={(e) => {
                              if (e.key === "Enter") handleSetVoucher();
                            }}
                          />
                          <Button
                            onClick={handleSetVoucher}
                            disabled={isApplyingVoucher}
                            className="bg-[#c92241] hover:bg-[#b11d38] text-white px-4 disabled:opacity-50"
                          >
                            {isApplyingVoucher ? "Đang áp dụng..." : "Áp dụng"}
                          </Button>
                        </div>
                      </div>
                    ) : (
                      <div className="pb-6 border-b border-zinc-300">
                        <h3 className="text-xl font-bold mb-3">Mã giảm giá</h3>
                        <p className="text-sm text-zinc-500">
                          Bạn đã áp dụng 1 mã giảm giá. Gỡ mã hiện tại để nhập mã khác.
                        </p>
                      </div>
                    )}

                    {/* --- VOUCHER ĐÃ ÁP DỤNG --- */}
                    <div className="pb-6 border-b border-zinc-300">
                      <h4 className="font-semibold mb-3 text-sm text-zinc-600">
                        Mã đã áp dụng
                      </h4>

                      <div className="space-y-2 h-[45vh] overflow-y-auto pr-1 custom-scrollbar">
                        {appliedVoucher ? (
                          <div className="flex justify-between items-center text-sm bg-green-50 border border-green-200 px-3 py-3 rounded-md">
                            {/* LEFT – INFO */}
                            <div className="flex flex-col gap-1">
                              <span className="font-semibold text-green-700">
                                {appliedVoucher.code}
                              </span>
                              <p className="text-xs text-green-600 leading-4">
                                {appliedVoucher.description}
                              </p>
                            </div>

                            {/* RIGHT – DISCOUNT + REMOVE */}
                            <div className="flex items-center gap-3">
                              <span className="font-bold text-green-700 whitespace-nowrap">
                                -{formatCurrency(appliedVoucher.discountVal)}
                              </span>

                              <button
                                onClick={handleRemoveVoucher}
                                className="text-red-500 hover:text-red-700 text-base leading-none cursor-pointer"
                              >
                                ✕
                              </button>
                            </div>
                          </div>
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
                              Chưa có mã nào được áp dụng
                            </p>
                          </div>
                        )}
                      </div>
                    </div>

                    {/* --- PRICE SUMMARY --- */}
                    <div className="space-y-4">
                      <div className="flex justify-between text-sm text-green-600">
                        <span>Tiết kiệm</span>
                        <span className="font-semibold">
                          -{formatCurrency(getTotalDiscount())}
                        </span>
                      </div>

                      <div className="flex justify-between text-lg font-bold">
                        <span>Cần thanh toán</span>
                        <span>
                          {formatCurrency(getFinalTotal())}
                        </span>
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
                  {formatCurrency(pricingData.seatsSubtotal + pricingData.combosSubtotal)}
                </span>
              </div>

              <div className="flex justify-between text-sm text-green-600">
                <span>Khuyến mãi</span>
                <span className="font-semibold">
                  -{formatCurrency(getTotalDiscount())}
                </span>
              </div>

              {appliedVoucher && (
                <div className="flex justify-between items-center text-sm font-semibold bg-green-50 border border-green-200 px-3 py-2 rounded-md">
                  <span>Mã: {appliedVoucher.code}</span>
                  <span className="text-green-600">-{formatCurrency(appliedVoucher.discountVal)}</span>
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
                  {formatCurrency(getFinalTotal())}
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
