"use client";

import { motion, AnimatePresence } from "framer-motion";
import {
  CalendarDays,
  Clock,
  Film,
  Globe2,
  Languages,
  MapPin,
  Video,
  X,
} from "lucide-react";
import type { Movie } from "@/types/movie.type";

interface MovieDetailModalProps {
  movie?: Movie;
  open: boolean;
  onClose: () => void;
}

const MovieDetailModal = ({ movie, open, onClose }: MovieDetailModalProps) => {
  if (!open || !movie) return null;

  const actors = Array.isArray(movie.actor) ? movie.actor : [];

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={onClose}
        >
          <motion.div
            className="mx-4 flex w-full max-w-4xl max-h-[90vh] flex-col overflow-hidden rounded-2xl border border-white/10 bg-white/10 text-white shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="relative">
              {movie.posterUrl && (
                <div className="relative h-64 w-full overflow-hidden">
                  <img
                    src={movie.posterUrl}
                    alt={movie.title}
                    className="h-full w-full object-cover opacity-40"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-black via-black/60 to-transparent" />
                </div>
              )}

              <button
                onClick={onClose}
                className="absolute right-4 top-4 inline-flex h-10 w-10 items-center justify-center rounded-full border border-white/10 bg-black/40 text-white transition hover:bg-black/60"
              >
                <X className="h-5 w-5" />
              </button>

              <div className="absolute inset-x-0 bottom-0 bg-gradient-to-t from-slate-900/90 via-slate-900/80 to-transparent" />

              <div className="absolute bottom-6 left-6 right-6 flex flex-col gap-3">
                <div className="flex flex-wrap items-center gap-3">
                  <span className="rounded-full border border-white/10 bg-white/10 px-3 py-1 text-xs uppercase tracking-widest text-gray-200">
                    {getStatusLabel(movie.status)}
                  </span>
                </div>
                <h2 className="text-3xl font-semibold text-white">{movie.title}</h2>
                {movie.description && (
                  <p className="max-w-3xl text-sm text-gray-200">
                    {movie.description}
                  </p>
                )}
              </div>
            </div>

            <div className="flex-1 overflow-y-auto">
              <div className="grid gap-6 p-6 md:grid-cols-[2fr,1fr]">
                <div className="space-y-6">
                  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
                    <h3 className="text-lg font-semibold">Thông tin chung</h3>
                    <div className="grid gap-3 sm:grid-cols-2">
                      <InfoRow
                        icon={<CalendarDays className="h-4 w-4 text-orange-300" />}
                        label="Ngày khởi chiếu"
                        value={formatDateDisplay(movie.premiereDate)}
                      />
                      <InfoRow
                        icon={<CalendarDays className="h-4 w-4 text-rose-300" />}
                        label="Ngày kết thúc"
                        value={formatDateDisplay(movie.endDate)}
                      />
                      <InfoRow
                        icon={<Clock className="h-4 w-4 text-sky-300" />}
                        label="Thời lượng"
                        value={movie.durationMinutes ? `${movie.durationMinutes} phút` : "-"}
                      />
                      <InfoRow
                        icon={<Film className="h-4 w-4 text-emerald-300" />}
                        label="Thể loại"
                        value={movie.genre || "-"}
                      />
                      <InfoRow
                        icon={<Globe2 className="h-4 w-4 text-purple-300" />}
                        label="Quốc gia"
                        value={movie.country || "-"}
                      />
                      <InfoRow
                        icon={<Languages className="h-4 w-4 text-yellow-300" />}
                        label="Ngôn ngữ"
                        value={movie.language || "-"}
                      />
                      <InfoRow
                        icon={<MapPin className="h-4 w-4 text-pink-300" />}
                        label="Đạo diễn"
                        value={movie.director || "-"}
                      />
                      <InfoRow
                        icon={<Video className="h-4 w-4 text-cyan-300" />}
                        label="Trailer"
                        value={movie.trailerUrl ? (
                          <a
                            href={movie.trailerUrl}
                            target="_blank"
                            rel="noopener noreferrer"
                            className="text-orange-300 underline"
                          >
                            Xem trailer
                          </a>
                        ) : "-"}
                      />
                    </div>
                  </section>

                  {movie.production && (
                    <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
                      <h3 className="text-lg font-semibold">Nhà sản xuất</h3>
                      <p className="text-sm text-gray-200">{movie.production}</p>
                    </section>
                  )}
                </div>

                <div className="space-y-6">
                  <section className="space-y-4 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
                    <h3 className="text-lg font-semibold">Diễn viên</h3>
                    {actors.length === 0 ? (
                      <p className="text-sm text-gray-300">Chưa có thông tin diễn viên.</p>
                    ) : (
                      <ul className="space-y-3">
                        {actors.map((actor) => (
                          <li
                            key={actor.id}
                            className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-3"
                          >
                            {actor.profileImage ? (
                              <img
                                src={actor.profileImage}
                                alt={actor.name}
                                className="h-12 w-12 rounded-full object-cover"
                              />
                            ) : (
                              <div className="flex h-12 w-12 items-center justify-center rounded-full border border-dashed border-white/20 text-xs text-gray-400">
                                No Image
                              </div>
                            )}
                            <div>
                              <p className="text-sm font-medium text-white">{actor.name}</p>
                            </div>
                          </li>
                        ))}
                      </ul>
                    )}
                  </section>

                  <section className="space-y-3 rounded-2xl border border-white/10 bg-white/5 p-5 backdrop-blur-lg">
                    <h3 className="text-lg font-semibold">Trạng thái hoạt động</h3>
                    <p className="text-sm text-gray-200">
                      {movie.isActive ? "Đang hoạt động" : "Tạm ngưng"}
                    </p>
                  </section>
                </div>
              </div>
            </div>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieDetailModal;

const getStatusLabel = (status?: Movie["status"]) => {
  switch (status) {
    case "now_showing":
      return "Đang chiếu";
    case "coming_soon":
      return "Sắp chiếu";
    case "ended":
      return "Đã kết thúc";
    default:
      return "Không xác định";
  }
};

const formatDateDisplay = (dateInput?: Date | string) => {
  if (!dateInput) return "-";
  const date = typeof dateInput === "string" ? new Date(dateInput) : dateInput;
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

interface InfoRowProps {
  icon: React.ReactNode;
  label: string;
  value: React.ReactNode;
}

const InfoRow = ({ icon, label, value }: InfoRowProps) => (
  <div className="flex items-start gap-3 rounded-xl border border-white/5 bg-white/5 p-3">
    <div className="mt-0.5 flex h-8 w-8 items-center justify-center rounded-full bg-white/10 text-white">
      {icon}
    </div>
    <div>
      <p className="text-xs uppercase tracking-wider text-gray-400">{label}</p>
      <p className="text-sm text-white">{value}</p>
    </div>
  </div>
);
