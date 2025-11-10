"use client";

import { Button } from "@/components/ui/button";
import { ArrowUp01Icon, MapPinIcon } from "lucide-react";
import Image from "next/image";
import { useEffect, useState } from "react";

interface Showtime {
  showtimeId: number;
  startTime: string;
  endTime: string;
  formatType: string;
  basePrice: number;
  availableSeats: number;
  isSoldOut: boolean;
  label: string;
}

interface Screen {
  screenId: number;
  screenName: string;
  screenType: string;
  soundSystem: string;
  capacity: number;
  showtimes: Showtime[];
}

interface Cinema {
  cinemaId: number;
  cinemaName: string;
  address: string;
  city: string;
  district: string;
  brandCode: string;
  logoUrl: string;
  screens: Screen[];
}

// Data mẫu
const SAMPLE_CINEMAS: Cinema[] = [
  {
    cinemaId: 1,
    cinemaName: "CGV Vincom Bà Triệu",
    address: "191 Bà Triệu",
    city: "Hà Nội",
    district: "Hai Bà Trưng",
    brandCode: "CGV",
    logoUrl:
      "",
    screens: [
      {
        screenId: 1,
        screenName: "Phòng 1",
        screenType: "2D",
        soundSystem: "Dolby 7.1",
        capacity: 150,
        showtimes: [
          {
            showtimeId: 1,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "2D",
            basePrice: 80000,
            availableSeats: 45,
            isSoldOut: false,
            label: "Phụ đề",
          },
          {
            showtimeId: 2,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "2D",
            basePrice: 90000,
            availableSeats: 30,
            isSoldOut: false,
            label: "Phụ đề",
          },
          {
            showtimeId: 3,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "2D",
            basePrice: 100000,
            availableSeats: 0,
            isSoldOut: true,
            label: "Phụ đề",
          },
        ],
      },
      {
        screenId: 2,
        screenName: "Phòng 2",
        screenType: "IMAX",
        soundSystem: "IMAX Sound",
        capacity: 200,
        showtimes: [
          {
            showtimeId: 4,
            startTime: "2024-11-10",
            endTime:"2024-11-10",
            formatType: "IMAX",
            basePrice: 150000,
            availableSeats: 80,
            isSoldOut: false,
            label: "Phụ đề",
          },
          {
            showtimeId: 5,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "IMAX",
            basePrice: 170000,
            availableSeats: 25,
            isSoldOut: false,
            label: "Phụ đề",
          },
        ],
      },
    ],
  },
  {
    cinemaId: 2,
    cinemaName: "Lotte Cinema Tây Hồ",
    address: "Tầng 6, TTTM Lotte",
    city: "Hà Nội",
    district: "Tây Hồ",
    brandCode: "LOTTE",
    logoUrl:
      "",
    screens: [
      {
        screenId: 3,
        screenName: "Phòng 3",
        screenType: "3D",
        soundSystem: "Dolby Atmos",
        capacity: 180,
        showtimes: [
          {
            showtimeId: 6,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "3D",
            basePrice: 120000,
            availableSeats: 60,
            isSoldOut: false,
            label: "Lồng tiếng",
          },
          {
            showtimeId: 7,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "3D",
            basePrice: 130000,
            availableSeats: 40,
            isSoldOut: false,
            label: "Phụ đề",
          },
          {
            showtimeId: 8,
            startTime: "2024-11-10",
            endTime: "2024-11-10",
            formatType: "3D",
            basePrice: 140000,
            availableSeats: 15,
            isSoldOut: false,
            label: "Phụ đề",
          },
        ],
      },
    ],
  },
];

const ShowtimeDetail = () => {
  return (
    <div className="w-full space-y-6 p-5">
      {SAMPLE_CINEMAS.map((cinema) => (
        <div
          key={cinema.cinemaId}
          className="rounded-2xl border border-border p-4 shadow-sm hover:shadow-md transition-all duration-200"
        >
          {/* Header */}
          <div className="flex items-start gap-4">
            <Image
              src={cinema.logoUrl}
              alt={cinema.cinemaName}
              width={60}
              height={60}
              className="rounded-lg border bg-white object-contain"
            />
            <div className="flex-1 space-y-1">
              <h2 className="text-lg font-semibold">{cinema.cinemaName}</h2>
              <p className="text-sm text-muted-foreground flex items-center gap-1">
                <MapPinIcon size={14} />
                {cinema.address}, {cinema.district}, {cinema.city}
              </p>
            </div>
            <div className="text-muted-foreground">
              <ArrowUp01Icon className="cursor-pointer hover:text-primary transition-colors" />
            </div>
          </div>

          {/* Screens */}
          <div className="mt-4 space-y-4">
            {cinema.screens.map((screen) => (
              <div
                key={screen.screenId}
                className="border-t border-border pt-3"
              >
                <div className="flex flex-wrap items-center justify-between mb-2">
                  <p className="font-medium text-sm">
                    {screen.screenName} • {screen.screenType} •{" "}
                    {screen.soundSystem}
                  </p>
                  <span className="text-xs text-muted-foreground">
                    {screen.capacity} ghế
                  </span>
                </div>

                {/* Showtimes */}
                <div className="flex flex-wrap gap-2">
                  {screen.showtimes.map((showtime) => {
                    const start = "2025-11-2";
                    const end = "2025-11-2";

                    return (
                      <Button
                        key={showtime.showtimeId}
                        variant={showtime.isSoldOut ? "secondary" : "outline"}
                        disabled={showtime.isSoldOut}
                        className="rounded-xl text-sm"
                      >
                        {start} - {end}
                      </Button>
                    );
                  })}
                </div>
              </div>
            ))}
          </div>
        </div>
      ))}
    </div>
  );
};

export default ShowtimeDetail;
