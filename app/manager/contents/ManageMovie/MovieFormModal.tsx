"use client";

import { useEffect, useState } from "react";
import { motion, AnimatePresence } from "framer-motion";
import { useForm, Controller } from "react-hook-form";
import { zodResolver } from "@hookform/resolvers/zod";
import { z } from "zod";
import {
  Calendar,
  Clock,
  Film,
  Globe2,
  Languages,
  Loader2,
  MapPin,
  Pencil,
  Upload,
  X,
} from "lucide-react";
import type { CreateMovieRequest, ManagerMovieApiError } from "@/apis/manager.movie.api";
import type { Movie } from "@/types/movie.type";
import type { Actor } from "@/apis/manager.actor.api";
import { useToast } from "@/components/ToastProvider";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import ActorSelectSection from "./components/ActorSelectSection";

const movieSchema = z
  .object({
    title: z.string().min(1, "Vui lòng nhập tên phim"),
    genre: z.string().optional(),
    durationMinutes: z
      .union([z.number(), z.string()])
      .transform((value) => (value === "" ? undefined : Number(value)))
      .optional()
      .refine((value) => value === undefined || (!Number.isNaN(value) && value > 0), {
        message: "Thời lượng phải lớn hơn 0",
      }),
    premiereDate: z.string().optional(),
    endDate: z.string().optional(),
    director: z.string().optional(),
    language: z.string().optional(),
    country: z.string().optional(),
    isActive: z.boolean().default(true),
    posterUrl: z.string().optional(),
    production: z.string().optional(),
    description: z.string().optional(),
    status: z.enum(["now_showing", "coming_soon", "ended"]).optional(),
    trailerUrl: z.string().url("URL trailer không hợp lệ").optional().or(z.literal("")),
    actorIds: z.array(z.number()).optional(),
  })
  .superRefine((data, ctx) => {
    if (data.premiereDate && data.endDate) {
      const start = new Date(data.premiereDate);
      const end = new Date(data.endDate);

      if (!Number.isNaN(start.getTime()) && !Number.isNaN(end.getTime()) && end < start) {
        ctx.addIssue({
          path: ["endDate"],
          code: z.ZodIssueCode.custom,
          message: "Ngày kết thúc phải sau ngày khởi chiếu",
        });
      }
    }
  });

export type MovieFormValues = z.infer<typeof movieSchema>;

interface MovieFormModalProps {
  open: boolean;
  mode: "create" | "edit";
  movie?: Movie;
  accessToken?: string | null;
  onClose: () => void;
  onSubmit: (values: CreateMovieRequest) => Promise<void>;
  isSubmitting?: boolean;
}

const defaultValues: MovieFormValues = {
  title: "",
  genre: "",
  durationMinutes: undefined,
  premiereDate: "",
  endDate: "",
  director: "",
  language: "",
  country: "",
  isActive: true,
  posterUrl: "",
  production: "",
  description: "",
  status: "coming_soon",
  trailerUrl: "",
  actorIds: [],
};

const MovieFormModal = ({
  open,
  mode,
  movie,
  accessToken,
  onClose,
  onSubmit,
  isSubmitting,
}: MovieFormModalProps) => {
  const { showToast } = useToast();
  const uploadMutation = useUploadToCloudinary();
  const [selectedActors, setSelectedActors] = useState<Actor[]>(() => {
    if (!movie || !Array.isArray(movie.actor)) return [];
    return movie.actor.map((item) => ({
      id: item.id,
      name: item.name,
      profileImage: item.profileImage ?? undefined,
    }));
  });

  const {
    register,
    handleSubmit,
    reset,
    control,
    formState: { errors },
    setError,
    setValue,
  } = useForm<MovieFormValues>({
    resolver: zodResolver(movieSchema),
    defaultValues,
  });

  useEffect(() => {
    if (!open) return;

    if (mode === "edit" && movie) {
      const existingActors = Array.isArray(movie.actor)
        ? movie.actor.map((item) => ({
            id: item.id,
            name: item.name,
            profileImage: item.profileImage ?? undefined,
          }))
        : [];

      reset({
        title: movie.title || "",
        genre: movie.genre || "",
        durationMinutes: movie.durationMinutes,
        premiereDate: movie.premiereDate ? new Date(movie.premiereDate).toISOString().split("T")[0] : "",
        endDate: movie.endDate ? new Date(movie.endDate).toISOString().split("T")[0] : "",
        director: movie.director || "",
        language: movie.language || "",
        country: movie.country || "",
        isActive: Boolean(movie.isActive),
        posterUrl: movie.posterUrl || "",
        production: movie.production || "",
        description: movie.description || "",
        status: movie.status || "coming_soon",
        trailerUrl: movie.trailerUrl || "",
        actorIds: existingActors.map((actor) => actor.id),
      });
      setSelectedActors(existingActors);
    } else {
      reset(defaultValues);
      setSelectedActors([]);
    }
  }, [open, mode, movie, reset]);

  const onSelectActors = (actors: Actor[]) => {
    setSelectedActors(actors);
    setValue("actorIds", actors.map((actor) => actor.id), { shouldValidate: true });
  };

  const handleOnSubmit = async (values: MovieFormValues) => {
    try {
      await onSubmit({
        title: values.title,
        genre: values.genre,
        durationMinutes: values.durationMinutes,
        premiereDate: values.premiereDate || undefined,
        endDate: values.endDate || undefined,
        director: values.director,
        language: values.language,
        country: values.country,
        isActive: values.isActive,
        posterUrl: values.posterUrl,
        production: values.production,
        description: values.description,
        status: values.status,
        trailerUrl: values.trailerUrl || undefined,
        actorIds: values.actorIds?.length ? values.actorIds : undefined,
      });
    } catch (error) {
      const apiError = error as ManagerMovieApiError | undefined;
      if (apiError?.errors) {
        Object.entries(apiError.errors).forEach(([field, detail]) => {
          if (!detail) return;
          const message = typeof detail === "string" ? detail : (detail as { msg?: string }).msg;
          if (!message) return;

          const normalizedField = normalizeMovieField(field);
          if (normalizedField) {
            setError(normalizedField as keyof MovieFormValues, {
              type: "server",
              message,
            });
          }
        });
      }

      showToast(
        apiError?.message || "Không thể lưu phim",
        "Vui lòng kiểm tra lại thông tin và thử lại",
        "error"
      );
    }
  };

  const handleUploadPoster = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    if (!accessToken) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tải ảnh", "error");
      return;
    }

    try {
      const result = await uploadMutation.mutateAsync(file);
      if (result?.secure_url) {
        setValue("posterUrl", result.secure_url, { shouldValidate: true });
        showToast("Tải ảnh thành công", undefined, "success");
      }
    } catch (error) {
      showToast("Tải ảnh thất bại", "Vui lòng thử lại sau", "error");
    }
  };

  if (!open) return null;

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
            className="mx-4 h-[90vh] w-full max-w-5xl overflow-y-auto rounded-2xl border border-white/10 bg-white/10 p-8 text-white shadow-2xl backdrop-blur-xl"
            initial={{ opacity: 0, scale: 0.9, y: 40 }}
            animate={{ opacity: 1, scale: 1, y: 0 }}
            exit={{ opacity: 0, scale: 0.95, y: 20 }}
            transition={{ duration: 0.3, ease: "easeOut" }}
            onClick={(event) => event.stopPropagation()}
          >
            <div className="mb-8 flex items-start justify-between">
              <div>
                <h2 className="text-2xl font-semibold">
                  {mode === "create" ? "Tạo phim mới" : "Chỉnh sửa phim"}
                </h2>
                <p className="mt-1 text-sm text-gray-300">
                  Điền các thông tin chi tiết cho bộ phim và quản lý danh sách diễn viên.
                </p>
              </div>
              <motion.button
                onClick={onClose}
                className="rounded-full border border-white/10 bg-white/5 p-2 text-gray-300 transition hover:bg-white/10 hover:text-white"
                whileHover={{ scale: 1.1, rotate: 90 }}
                whileTap={{ scale: 0.95 }}
              >
                <X className="h-5 w-5" />
              </motion.button>
            </div>

            <form className="space-y-8" onSubmit={handleSubmit(handleOnSubmit)}>
              <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold">Thông tin cơ bản</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field
                    label="Tên phim"
                    error={errors.title?.message}
                    icon={<Film className="h-4 w-4 text-orange-300" />}
                  >
                    <input
                      {...register("title")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                      placeholder="Nhập tên phim"
                    />
                  </Field>

                  <Field
                    label="Thể loại"
                    error={errors.genre?.message}
                    icon={<Film className="h-4 w-4 text-emerald-300" />}
                  >
                    <input
                      {...register("genre")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                      placeholder="Ví dụ: Hành động, Tâm lý"
                    />
                  </Field>

                  <Field
                    label="Thời lượng (phút)"
                    error={errors.durationMinutes?.message}
                    icon={<Clock className="h-4 w-4 text-sky-300" />}
                  >
                    <input
                      type="number"
                      {...register("durationMinutes")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-sky-400 focus:outline-none"
                      placeholder="ví dụ: 120"
                    />
                  </Field>

                  <Field
                    label="Ngày khởi chiếu"
                    error={errors.premiereDate?.message}
                    icon={<Calendar className="h-4 w-4 text-pink-300" />}
                  >
                    <input
                      type="date"
                      {...register("premiereDate")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white focus:border-pink-400 focus:outline-none"
                    />
                  </Field>

                  <Field
                    label="Ngày kết thúc"
                    error={errors.endDate?.message}
                    icon={<Calendar className="h-4 w-4 text-rose-300" />}
                  >
                    <input
                      type="date"
                      {...register("endDate")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white focus:border-rose-400 focus:outline-none"
                    />
                  </Field>

                  <Field
                    label="Đạo diễn"
                    error={errors.director?.message}
                    icon={<MapPin className="h-4 w-4 text-purple-300" />}
                  >
                    <input
                      {...register("director")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white Placeholder:text-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="Tên đạo diễn"
                    />
                  </Field>

                  <Field
                    label="Ngôn ngữ"
                    error={errors.language?.message}
                    icon={<Languages className="h-4 w-4 text-yellow-300" />}
                  >
                    <input
                      {...register("language")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-yellow-400 focus:outline-none"
                      placeholder="Ví dụ: Tiếng Việt"
                    />
                  </Field>

                  <Field
                    label="Quốc gia"
                    error={errors.country?.message}
                    icon={<Globe2 className="h-4 w-4 text-cyan-300" />}
                  >
                    <input
                      {...register("country")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-cyan-400 focus:outline-none"
                      placeholder="Ví dụ: Việt Nam"
                    />
                  </Field>
                </div>
              </section>

              <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
                <h3 className="text-lg font-semibold">Thông tin bổ sung</h3>
                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Nhà sản xuất" error={errors.production?.message}>
                    <textarea
                      {...register("production")}
                      className="min-h-[80px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                      placeholder="Nhà sản xuất, đơn vị phát hành..."
                    />
                  </Field>

                  <Field label="Mô tả" error={errors.description?.message}>
                    <textarea
                      {...register("description")}
                      className="min-h-[80px] w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-purple-400 focus:outline-none"
                      placeholder="Tóm tắt nội dung phim"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Poster" error={errors.posterUrl?.message}>
                    <div className="flex items-center gap-4">
                      <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/10 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/20">
                        <Upload className="h-4 w-4" />
                        Tải ảnh lên
                        <input
                          type="file"
                          accept="image/*"
                          className="hidden"
                          onChange={handleUploadPoster}
                        />
                      </label>
                      <input
                        {...register("posterUrl")}
                        placeholder="Hoặc dán URL ảnh"
                        className="flex-1 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                      />
                    </div>
                    {uploadMutation.isPending && (
                      <p className="mt-2 text-xs text-gray-300">Đang tải ảnh lên Cloudinary...</p>
                    )}
                  </Field>

                  <Field
                    label="Trailer"
                    error={errors.trailerUrl?.message}
                    icon={<Upload className="h-4 w-4 text-sky-300" />}
                  >
                    <input
                      {...register("trailerUrl")}
                      placeholder="https://youtube.com/..."
                      className="w-full rounded-lg border border-white/10 bg-white/10 py-2 pl-10 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-sky-400 focus:outline-none"
                    />
                  </Field>
                </div>

                <div className="grid gap-5 md:grid-cols-2">
                  <Field label="Trạng thái" error={errors.status?.message}>
                    <select
                      {...register("status")}
                      className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white focus:border-orange-400 focus:outline-none"
                    >
                      <option value="now_showing" className="bg-slate-900 text-white">
                        Đang chiếu
                      </option>
                      <option value="coming_soon" className="bg-slate-900 text-white">
                        Sắp chiếu
                      </option>
                      <option value="ended" className="bg-slate-900 text-white">
                        Đã kết thúc
                      </option>
                    </select>
                  </Field>

                  <Controller
                    control={control}
                    name="isActive"
                    render={({ field }) => (
                      <Field label="Trạng thái hoạt động">
                        <label className="flex items-center gap-3 rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm">
                          <input
                            type="checkbox"
                            checked={field.value}
                            onChange={(event) => field.onChange(event.target.checked)}
                            className="h-4 w-4 rounded border-white/20 bg-transparent"
                          />
                          <span className="text-gray-200">Phim đang hoạt động</span>
                        </label>
                      </Field>
                    )}
                  />
                </div>
              </section>

              <ActorSelectSection
                accessToken={accessToken}
                selectedActors={selectedActors}
                onChange={onSelectActors}
              />

              <div className="flex justify-end gap-3">
                <button
                  type="button"
                  onClick={onClose}
                  className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                  disabled={isSubmitting || uploadMutation.isPending}
                >
                  Huỷ
                </button>
                <button
                  type="submit"
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400 disabled:opacity-70"
                  disabled={isSubmitting || uploadMutation.isPending}
                >
                  {isSubmitting ? (
                    <>
                      <Loader2 className="h-4 w-4 animate-spin" />
                      Đang lưu...
                    </>
                  ) : (
                    <>
                      <Pencil className="h-4 w-4" />
                      {mode === "create" ? "Tạo phim" : "Lưu thay đổi"}
                    </>
                  )}
                </button>
              </div>
            </form>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default MovieFormModal;

interface FieldProps {
  label: string;
  children: React.ReactNode;
  error?: string;
  icon?: React.ReactNode;
}

const Field = ({ label, children, error, icon }: FieldProps) => (
  <div className="space-y-2 text-sm">
    <label className="block text-xs uppercase tracking-wide text-gray-400">{label}</label>
    <div className="relative">
      {icon && (
        <span className="pointer-events-none absolute left-3 top-1/2 -translate-y-1/2 text-gray-400">
          {icon}
        </span>
      )}
      {children}
    </div>
    {error && <p className="text-xs text-red-300">{error}</p>}
  </div>
);

const normalizeMovieField = (field: string) => {
  const normalized = field.trim().toLowerCase();
  switch (normalized) {
    case "title":
      return "title";
    case "genre":
      return "genre";
    case "durationminutes":
    case "duration_minutes":
      return "durationMinutes";
    case "premieredate":
    case "premiere_date":
      return "premiereDate";
    case "enddate":
    case "end_date":
      return "endDate";
    case "director":
      return "director";
    case "language":
      return "language";
    case "country":
      return "country";
    case "posterurl":
    case "poster_url":
      return "posterUrl";
    case "production":
      return "production";
    case "description":
      return "description";
    case "status":
      return "status";
    case "trailerurl":
    case "trailer_url":
      return "trailerUrl";
    default:
      return undefined;
  }
};
