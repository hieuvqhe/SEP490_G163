"use client";

import React, { useState, useEffect } from "react";
import Image from "next/image";
import dayjs from "dayjs";
import { useGetBrands, useGetShowtimesByCinema } from "@/apis/user.catalog.api";
import { Spinner } from "@/components/ui/spinner";
import { MapPin, Search } from "lucide-react";
import { Button } from "@/components/ui/button";
import Link from "next/link";
import { Dialog, DialogTrigger } from "@/components/ui/dialog";
import SeatLayout from "@/app/(root)/movie/[id]/components/SeatLayout";
import { useAuthStore } from "@/store/authStore";
import { useToast } from "@/components/ToastProvider";
import {
  useCreateBookingSession,
  useDeleteBookingSession,
  useGetBookingSessionDetail,
} from "@/apis/user.booking-session.api";
import BlurCircle from "@/components/layout/BlurCircle";

const VIETNAM_CITIES = [
  "Hà Nội",
  "Hồ Chí Minh",
  "Đà Nẵng",
  "Hải Phòng",
  "Cần Thơ",
  "Nha Trang",
  "Huế",
  "Vũng Tàu",
];

const LS_KEY = "booking-session";

const TheaterSchedule = () => {
  const [selectedDate, setSelectedDate] = useState<string>(
    dayjs().format("YYYY-MM-DD")
  );
  const [selectedCity, setSelectedCity] = useState<string>("Hà Nội");
  const [selectedBrand, setSelectedBrand] = useState<string>("ALL");
  const [selectedCinemaId, setSelectedCinemaId] = useState<number | null>(null);
  const [searchQuery, setSearchQuery] = useState<string>("");
  const [seatLayoutContent, setSeatLayoutContent] = useState<boolean>(false);
  const [currentSessionId, setCurrentSessionId] = useState<string | null>(null);
  const [sessionStillOnTime, setSessionStillOnTime] = useState(false);
  const [currentShowtime, setCurrentShowtime] = useState<any>(null);

  const { user } = useAuthStore();
  const { showToast } = useToast();

  const { data: brandsData, isLoading: brandsLoading } = useGetBrands();
  const { data: showtimesData, isLoading: showtimesLoading } =
    useGetShowtimesByCinema({
      Date: selectedDate,
      City: selectedCity,
      Brand: selectedBrand === "ALL" ? undefined : selectedBrand,
    });

  const deleteSessionMutate = useDeleteBookingSession();
  const createSessionMutate = useCreateBookingSession();
  const getSessionDetailQuery = useGetBookingSessionDetail(
    currentSessionId ?? "",
    Boolean(currentSessionId)
  );

  // Generate next 7 days
  const dates = Array.from({ length: 7 }, (_, i) => {
    const date = dayjs().add(i, "day");
    return {
      date: date.format("YYYY-MM-DD"),
      dayOfWeek: date.format("ddd"),
      day: date.format("DD"),
      isToday: i === 0,
    };
  });

  const brands = brandsData?.result.brands || [];
  const cinemas = showtimesData?.result.cinemas.items || [];

  // Filter cinemas by search query
  const filteredCinemas = cinemas.filter((cinema) =>
    cinema.cinemaName.toLowerCase().includes(searchQuery.toLowerCase())
  );

  // Get selected cinema details
  const selectedCinema = cinemas.find((c) => c.cinemaId === selectedCinemaId);

  const handleOpenGoogleMaps = (latitude: number, longitude: number) => {
    const url = `https://www.google.com/maps/search/?api=1&query=${latitude},${longitude}`;
    window.open(url, "_blank");
  };

  useEffect(() => {
    if (!currentShowtime) return;

    const saved = localStorage.getItem(LS_KEY);
    if (!saved) return;

    const parsed = JSON.parse(saved);

    if (parsed.showtimeId !== currentShowtime.showtimeId) {
      localStorage.removeItem(LS_KEY);
      return;
    }

    if (Date.now() < new Date(parsed.expiresAt).getTime()) {
      setCurrentSessionId(parsed.id);
      setSessionStillOnTime(true);
    } else {
      deleteSessionMutate.mutate(parsed.id);
      localStorage.removeItem(LS_KEY);
    }
  }, [currentShowtime]);

  useEffect(() => {
    const expiresAt = getSessionDetailQuery.data?.result.expiresAt;
    if (!expiresAt || !currentShowtime) return;

    const end = new Date(expiresAt).getTime();
    setSessionStillOnTime(Date.now() < end);

    localStorage.setItem(
      LS_KEY,
      JSON.stringify({
        id: currentSessionId,
        expiresAt,
        showtimeId: currentShowtime.showtimeId,
      })
    );
  }, [currentSessionId, getSessionDetailQuery.data, currentShowtime]);

  const handleShowtimeClick = (showtime: any) => {
    if (!user) {
      showToast("Bạn cần đăng nhập để đặt vé", "", "warning");
      return;
    }

    if (showtime.isSoldOut) {
      return;
    }

    setCurrentShowtime(showtime);

    if (currentSessionId && sessionStillOnTime) {
      setSeatLayoutContent(true);
      return;
    }

    createSessionMutate.mutate(showtime.showtimeId, {
      onSuccess: (res) => {
        const newId = res.result.bookingSessionId;
        const newExpires = res.result.expiresAt;

        setCurrentSessionId(newId);
        setSessionStillOnTime(true);
        setSeatLayoutContent(true);

        localStorage.setItem(
          LS_KEY,
          JSON.stringify({
            id: newId,
            expiresAt: newExpires,
            showtimeId: showtime.showtimeId,
          })
        );
      },
      onError: (err) => {
        console.error("Create new session failed", err);
        showToast("Không thể tạo phiên đặt vé", "", "error");
      },
    });
  };

  return (
    <section className="px-6 md:px-16 lg:px-24 xl:px-44 overflow-hidden relative pt-10">
      <BlurCircle top="50px" left="-80px" />
      <BlurCircle right="0px" top="400px" />

      <div className="w-full py-16">
        <h2 className="text-4xl font-bold text-white mb-8">
          Lịch chiếu phim
        </h2>

        {/* Location Selector */}
        <div className="mb-6 flex items-center gap-4">
          <div className="flex items-center gap-2">
            <MapPin className="text-primary" size={20} />
            <span className="text-white font-medium">Vị trí:</span>
          </div>
          <select
            value={selectedCity}
            onChange={(e) => setSelectedCity(e.target.value)}
            className="bg-gray-800 text-white px-4 py-2 rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
          >
            {VIETNAM_CITIES.map((city) => (
              <option key={city} value={city}>
                {city}
              </option>
            ))}
          </select>
        </div>

        {/* Brand Selector */}
        {brandsLoading ? (
          <div className="flex justify-center py-8">
            <Spinner className="size-8" />
          </div>
        ) : (
          <div className="mb-8">
            <div className="flex gap-4 overflow-x-auto pb-4">
              {/* All Brands */}
              <button
                onClick={() => setSelectedBrand("ALL")}
                className={`flex-shrink-0 flex flex-col items-center gap-2 px-6 py-4 rounded-lg border-2 transition-all ${
                  selectedBrand === "ALL"
                    ? "bg-primary/20 border-primary"
                    : "bg-gray-800 border-gray-700 hover:border-primary/50"
                }`}
              >
                <div className="w-12 h-12 rounded-full bg-gradient-to-br from-primary to-purple-600 flex items-center justify-center">
                  <span className="text-white text-2xl">★</span>
                </div>
                <span
                  className={`text-sm font-medium ${
                    selectedBrand === "ALL" ? "text-primary" : "text-gray-400"
                  }`}
                >
                  Tất cả
                </span>
              </button>

              {/* Brand Items */}
              {brands.map((brand) => (
                <button
                  key={brand.code}
                  onClick={() => setSelectedBrand(brand.code)}
                  className={`flex-shrink-0 flex flex-col items-center gap-2 px-4 py-4 rounded-lg border-2 transition-all ${
                    selectedBrand === brand.code
                      ? "bg-primary/20 border-primary"
                      : "bg-gray-800 border-gray-700 hover:border-primary/50"
                  }`}
                >
                  <div className="relative w-12 h-12 rounded-full overflow-hidden bg-white/10">
                    {brand.logoUrl ? (
                      <Image
                        src={brand.logoUrl}
                        alt={brand.name}
                        fill
                        className="object-contain p-1"
                        unoptimized
                      />
                    ) : (
                      <div className="w-full h-full flex items-center justify-center text-white font-bold">
                        {brand.code.substring(0, 2)}
                      </div>
                    )}
                  </div>
                  <span
                    className={`text-sm font-medium ${
                      selectedBrand === brand.code
                        ? "text-primary"
                        : "text-gray-400"
                    }`}
                  >
                    {brand.name}
                  </span>
                </button>
              ))}
            </div>
          </div>
        )}

        {/* Two Column Layout */}
        <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
          {/* Left Column - Cinema List */}
          <div className="lg:col-span-1">
            <div className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden sticky top-4">
              {/* Search Bar */}
              <div className="p-4 border-b border-gray-700">
                <div className="relative">
                  <Search
                    className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400"
                    size={20}
                  />
                  <input
                    type="text"
                    placeholder="Tìm kiếm rạp..."
                    value={searchQuery}
                    onChange={(e) => setSearchQuery(e.target.value)}
                    className="w-full pl-10 pr-4 py-2 bg-gray-900 text-white rounded-lg border border-gray-700 focus:outline-none focus:ring-2 focus:ring-primary"
                  />
                </div>
              </div>

              {/* Cinema List */}
              <div className="max-h-[600px] overflow-y-auto">
                {showtimesLoading ? (
                  <div className="flex justify-center py-8">
                    <Spinner className="size-8" />
                  </div>
                ) : filteredCinemas.length === 0 ? (
                  <div className="text-center py-8 text-gray-400">
                    Không tìm thấy rạp
                  </div>
                ) : (
                  filteredCinemas.map((cinema) => (
                    <button
                      key={cinema.cinemaId}
                      onClick={() => setSelectedCinemaId(cinema.cinemaId)}
                      className={`w-full p-4 border-b border-gray-700 text-left hover:bg-gray-700/50 transition-colors ${
                        selectedCinemaId === cinema.cinemaId
                          ? "bg-primary/20 border-l-4 border-l-primary"
                          : ""
                      }`}
                    >
                      <div className="flex gap-3">
                        {cinema.logoUrl && (
                          <div className="relative w-12 h-12 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                            <Image
                              src={cinema.logoUrl}
                              alt={cinema.cinemaName}
                              fill
                              className="object-contain p-1"
                              unoptimized
                            />
                          </div>
                        )}
                        <div className="flex-1 min-w-0">
                          <h3 className="text-white font-medium truncate">
                            {cinema.cinemaName}
                          </h3>
                          <p className="text-xs text-gray-400 truncate">
                            {cinema.address}
                          </p>
                          <p className="text-xs text-primary mt-1">
                            {cinema.movies.length} phim
                          </p>
                        </div>
                      </div>
                    </button>
                  ))
                )}
              </div>
            </div>
          </div>

          {/* Right Column - Movie Schedule */}
          <div className="lg:col-span-2">
            {/* Date Selector */}
            <div className="mb-6 flex gap-3 overflow-x-auto pb-4">
              {dates.map((date) => (
                <button
                  key={date.date}
                  onClick={() => setSelectedDate(date.date)}
                  className={`flex-shrink-0 flex flex-col items-center justify-center px-6 py-3 rounded-lg border-2 transition-all ${
                    selectedDate === date.date
                      ? "bg-primary border-primary text-white"
                      : "bg-gray-800 border-gray-700 text-gray-400 hover:border-primary/50"
                  }`}
                >
                  <span className="text-xs uppercase">{date.dayOfWeek}</span>
                  <span className="text-2xl font-bold">{date.day}</span>
                  {date.isToday && (
                    <span className="text-xs text-primary mt-1">Hôm nay</span>
                  )}
                </button>
              ))}
            </div>

            {/* Movies & Showtimes */}
            {!selectedCinema ? (
              <div className="bg-gray-800 rounded-lg border border-gray-700 p-16 text-center">
                <div className="text-gray-400 text-lg">
                  Vui lòng chọn rạp để xem lịch chiếu
                </div>
              </div>
            ) : (
              <div className="space-y-6">
                {/* Cinema Info Header */}
                <div className="bg-gray-800 rounded-lg border border-gray-700 p-4">
                  <div className="flex items-start gap-4">
                    {selectedCinema.logoUrl && (
                      <div className="relative w-16 h-16 rounded-lg overflow-hidden bg-white/10 flex-shrink-0">
                        <Image
                          src={selectedCinema.logoUrl}
                          alt={selectedCinema.cinemaName}
                          fill
                          className="object-contain p-2"
                          unoptimized
                        />
                      </div>
                    )}
                    <div className="flex-1">
                      <h3 className="text-xl font-semibold text-white mb-1">
                        {selectedCinema.cinemaName}
                      </h3>
                      <p className="text-sm text-gray-400">
                        {selectedCinema.address}, {selectedCinema.district},{" "}
                        {selectedCinema.city}
                      </p>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        handleOpenGoogleMaps(
                          selectedCinema.latitude,
                          selectedCinema.longitude
                        )
                      }
                      className="flex items-center gap-2"
                    >
                      <MapPin size={16} />
                      Bản đồ
                    </Button>
                  </div>
                </div>

                {/* Movie List */}
                {selectedCinema.movies.map((movie) => (
                  <div
                    key={movie.movieId}
                    className="bg-gray-800 rounded-lg border border-gray-700 overflow-hidden hover:border-primary/50 transition-all p-4"
                  >
                    {/* Movie Info */}
                    <div className="flex gap-4">
                      <Link
                        href={`/movie/${movie.movieId}`}
                        className="relative w-24 h-36 rounded-lg overflow-hidden flex-shrink-0 group"
                      >
                        <Image
                          src={movie.posterUrl}
                          alt={movie.title}
                          fill
                          className="object-cover group-hover:scale-105 transition-transform"
                        />
                      </Link>
                      <div className="flex-1">
                        <Link href={`/movie/${movie.movieId}`}>
                          <h4 className="text-lg font-semibold text-white mb-2 hover:text-primary transition-colors">
                            {movie.title}
                          </h4>
                        </Link>
                        <div className="flex gap-3 text-sm text-gray-400 mb-3">
                          {movie.duration && (
                            <span>{movie.duration} phút</span>
                          )}
                          {movie.ageRating && (
                            <span className="px-2 py-0.5 bg-amber-500/20 text-amber-500 rounded">
                              {movie.ageRating}
                            </span>
                          )}
                        </div>

                        {/* Screens & Showtimes */}
                        <div className="space-y-3">
                          {movie.screens.map((screen) => (
                            <div key={screen.screenId}>
                              <div className="text-xs text-gray-400 mb-2">
                                <span className="font-medium text-gray-300">
                                  {screen.screenName}
                                </span>
                                <span className="ml-2">
                                  • {screen.soundSystem}
                                </span>
                              </div>

                              {/* Showtime Buttons */}
                              <div className="flex flex-wrap gap-2">
                                {screen.showtimes.map((showtime) => (
                                  <Dialog
                                    key={showtime.showtimeId}
                                    open={
                                      seatLayoutContent &&
                                      currentShowtime?.showtimeId ===
                                        showtime.showtimeId
                                    }
                                    onOpenChange={(open) => {
                                      if (
                                        currentShowtime?.showtimeId ===
                                        showtime.showtimeId
                                      ) {
                                        setSeatLayoutContent(open);
                                      }
                                    }}
                                  >
                                    <DialogTrigger asChild>
                                      <button
                                        onClick={() =>
                                          handleShowtimeClick(showtime)
                                        }
                                        disabled={showtime.isSoldOut}
                                        className={`px-4 py-2 rounded-lg border text-sm font-medium transition-all ${
                                          showtime.isSoldOut
                                            ? "bg-gray-700 border-gray-600 text-gray-500 cursor-not-allowed"
                                            : "bg-gray-700 border-gray-600 text-white hover:bg-primary hover:border-primary"
                                        }`}
                                      >
                                        <div className="flex flex-col items-center">
                                          <span>
                                            {dayjs(showtime.startTime).format(
                                              "HH:mm"
                                            )}
                                          </span>
                                          {showtime.isSoldOut && (
                                            <span className="text-xs text-red-400">
                                              Hết chỗ
                                            </span>
                                          )}
                                        </div>
                                      </button>
                                    </DialogTrigger>

                                    {seatLayoutContent &&
                                      currentShowtime?.showtimeId ===
                                        showtime.showtimeId && (
                                        <SeatLayout
                                          showtime={showtime}
                                          sessionId={currentSessionId ?? ""}
                                          seatLayoutContent={seatLayoutContent}
                                          setSeatLayoutContent={
                                            setSeatLayoutContent
                                          }
                                        />
                                      )}
                                  </Dialog>
                                ))}
                              </div>
                            </div>
                          ))}
                        </div>
                      </div>
                    </div>
                  </div>
                ))}

                {selectedCinema.movies.length === 0 && (
                  <div className="bg-gray-800 rounded-lg border border-gray-700 p-16 text-center">
                    <div className="flex flex-col items-center gap-4">
                      <div className="w-20 h-20 rounded-full bg-gray-700 flex items-center justify-center">
                        <svg
                          xmlns="http://www.w3.org/2000/svg"
                          width="40"
                          height="40"
                          viewBox="0 0 24 24"
                          fill="none"
                          stroke="currentColor"
                          strokeWidth="2"
                          strokeLinecap="round"
                          strokeLinejoin="round"
                          className="text-gray-500"
                        >
                          <rect x="2" y="7" width="20" height="15" rx="2" ry="2" />
                          <polyline points="17 2 12 7 7 2" />
                        </svg>
                      </div>
                      <div className="text-gray-400 text-lg">
                        Không có suất chiếu nào trong ngày này
                      </div>
                      <p className="text-sm text-gray-500">
                        Vui lòng chọn ngày khác để xem lịch chiếu
                      </p>
                    </div>
                  </div>
                )}
              </div>
            )}
          </div>
        </div>
      </div>
    </section>
  );
};

export default TheaterSchedule;
