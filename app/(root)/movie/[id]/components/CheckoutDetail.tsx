"use client";

import { DialogClose, DialogContent, DialogTitle } from "@/components/ui/dialog";
import React from "react";
import QRCode from "react-qr-code";
import { useGetMovieById } from "@/apis/movie.api";

interface ComboCount {
  serviceId: number;
  quantity: number;
  servicesTitle: string;
}

interface PostPricingPreview {
  appliedVoucherCode: string | null; // tùy API có thể null
  total: number;
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
}

const CheckoutDetail = ({
  sessionId,
  selectedCombos,
  selectedSeats,
  qrCode,
  previewSession,
}: CheckOutProps) => {
  console.log("Sesison id trong checkoiut: " + sessionId);

  const movieId = Number(localStorage.getItem("movieId"));

  const { data: movieInfoRes } = useGetMovieById(movieId);
  const movieInfo = movieInfoRes?.result;

  return (
    <DialogContent className="!max-w-4xl p-0 overflow-hidden bg-white text-zinc-800 border border-zinc-300 rounded-xl shadow-xl [&>button]:hidden">
      <DialogTitle className="sr-only">Thanh toán</DialogTitle>

      <div className="grid grid-cols-1 lg:grid-cols-2">
        {/* LEFT – INFO */}
        <div className="p-8 space-y-6">
          {/* Movie Title + Age Badge */}
          <div className="flex items-start gap-3">
            {/* <span className="px-2.5 py-1 bg-orange-500 text-white text-xs font-bold rounded-md">
              C16
            </span> */}

            <h2 className="text-2xl font-bold leading-snug">
              {movieInfo?.title ?? "Tên phim"}
            </h2>
          </div>

          {/* TIME + DATE */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-xs">THỜI GIAN</span>
              <span className="font-semibold">
                {/* {previewSession?.timeStart} ~ {previewSession?.timeEnd} */}
                11:12 ~ 14:00
              </span>
            </div>
            <div className="flex flex-col gap-1">
              <span className="text-zinc-500 text-xs">NGÀY CHIẾU</span>
              {/* <span className="font-semibold">{previewSession?.date}</span> */}
              <span className="font-semibold">11-28-2025</span>
            </div>
          </div>

          {/* CINEMA */}
          <div>
            <div className="text-zinc-500 text-xs mb-1">RẠP</div>
            {/* <div className="font-semibold">{previewSession?.cinemaName}</div> */}
            <div className="font-semibold">CGV Hòa Lạc</div>
            <div className="text-sm text-zinc-500">
              {/* {previewSession?.cinemaAddress} */}
              Thanh Hoa
            </div>
          </div>

          {/* ROOM + FORMAT */}
          <div className="grid grid-cols-2 gap-4 text-sm">
            <div>
              <div className="text-zinc-500 text-xs mb-1">PHÒNG CHIẾU</div>
              {/* <div className="font-semibold">{previewSession?.roomName}</div> */}
              IMAX
            </div>
            <div>
              <div className="text-zinc-500 text-xs mb-1">ĐỊNH DẠNG</div>
              <div className="font-semibold">
                {/* {previewSession?.format ?? "2D"} */}
                2D
              </div>
            </div>
          </div>

          {/* SEATS */}
          <div className="flex items-center justify-between">
            <div>
              <div className="text-zinc-500 text-xs mb-1">GHẾ</div>
              <div className="font-semibold">
                {selectedSeats?.map((s) => s.seatTitle).join(", ")}
              </div>
            </div>
            <div className="font-semibold">
              {/* {previewSession?.seatPrice?.toLocaleString()}đ */}
              {/* 30.000 đ */}
            </div>
          </div>

          {/* COMBOS */}
          {selectedCombos.length > 0 && (
            <div className="space-y-2">
              <div className="text-zinc-500 text-xs">BẮP - NƯỚC</div>

              {selectedCombos.map((combo) => (
                <div
                  key={combo.serviceId}
                  className="flex items-center justify-between text-sm"
                >
                  <span>
                    {combo.quantity} x {combo.servicesTitle}
                  </span>
                  <span className="font-semibold">
                    {/* {combo.price.toLocaleString()}đ */}
                    {/* 30.000 đ */}
                  </span>
                </div>
              ))}
            </div>
          )}

          {/* TOTAL */}
          <div className="border-t pt-4 mt-4">
            <div className="flex items-center justify-between">
              <span className="font-semibold text-lg">Tạm tính</span>
              <span className="font-bold text-lg">
                {previewSession?.total.toLocaleString()}đ
              </span>
            </div>
            <div className="text-xs text-zinc-500 mt-1">
              Ưu đãi (nếu có) sẽ được áp dụng ở bước thanh toán.
            </div>
          </div>
        </div>

        {/* RIGHT – QR MoMo */}
        <div className="bg-[#c92241] text-white p-8 flex flex-col items-center justify-center gap-6 relative">
          {/* Close Button (optional) */}
          <DialogClose className="absolute top-4 right-4 text-white/80 hover:text-white">
            ✕
          </DialogClose>

          <div className="text-center space-y-1">
            <h3 className="font-bold text-xl">
              Quét mã QR để thanh toán
            </h3>
          </div>

          {qrCode ? (
            <div className="bg-white p-4 rounded-xl shadow-lg">
              <QRCode value={qrCode} size={220} />
            </div>
          ) : (
            <div className="bg-white/20 p-10 rounded-xl">
              <span className="text-white/80">Không có QR</span>
            </div>
          )}

          {/* <p className="text-sm text-white/80 text-center leading-relaxed max-w-xs">
            Sử dụng App MoMo hoặc ứng dụng Camera hỗ trợ QR code để quét mã.
          </p> */}
        </div>
      </div>
    </DialogContent>
  );
};

export default CheckoutDetail;
