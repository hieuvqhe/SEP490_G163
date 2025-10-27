"use client";

import { useEffect, useMemo, useState } from "react";
import { motion } from "framer-motion";
import {
  type Actor,
  type GetActorsParams,
  useGetActors,
  useCreateActor,
  useUpdateActor,
  useDeleteActor,
} from "@/apis/manager.actor.api";
import { useToast } from "@/components/ToastProvider";
import {
  Loader2,
  Plus,
  Pencil,
  Trash2,
  Search,
  UserRound,
} from "lucide-react";
import { useForm } from "react-hook-form";
import { z } from "zod";
import { zodResolver } from "@hookform/resolvers/zod";
import { useAuthStore } from "@/store/authStore";
import { uploadFileToCloudinary } from "@/apis/cloudinary.api";

const searchParamsDefault: GetActorsParams = {
  page: 1,
  limit: 10,
};

const actorSchema = z.object({
  name: z.string().min(1, "Tên diễn viên không được để trống"),
  profileImage: z.string().url("Ảnh đại diện không hợp lệ").optional().or(z.literal("")),
});

type ActorFormValues = z.infer<typeof actorSchema>;

export interface SelectedActor extends Actor {
  role?: string;
}

interface ActorSelectSectionProps {
  accessToken?: string | null;
  selectedActors: SelectedActor[];
  onChange: (actors: SelectedActor[]) => void;
}

const ActorSelectSection = ({ accessToken, selectedActors, onChange }: ActorSelectSectionProps) => {
  const { showToast } = useToast();
  const { accessToken: storeToken } = useAuthStore();
  const effectiveToken = accessToken || storeToken || undefined;

  const [searchTerm, setSearchTerm] = useState("");
  const [debouncedSearch, setDebouncedSearch] = useState("");
  const [isCreateMode, setIsCreateMode] = useState(false);
  const [editingActor, setEditingActor] = useState<Actor | null>(null);
  const [uploading, setUploading] = useState(false);

  const {
    register,
    handleSubmit,
    reset,
    setValue,
    formState: { errors },
  } = useForm<ActorFormValues>({
    resolver: zodResolver(actorSchema),
    defaultValues: { name: "", profileImage: "" },
  });

  useEffect(() => {
    const handler = setTimeout(() => setDebouncedSearch(searchTerm.trim()), 400);
    return () => clearTimeout(handler);
  }, [searchTerm]);

  const queryParams = useMemo((): GetActorsParams => {
    return {
      ...searchParamsDefault,
      search: debouncedSearch || undefined,
    };
  }, [debouncedSearch]);

  const {
    data,
    isFetching,
    refetch,
  } = useGetActors(queryParams, effectiveToken);

  const createActorMutation = useCreateActor();
  const updateActorMutation = useUpdateActor();
  const deleteActorMutation = useDeleteActor();

  const actors: Actor[] = data?.result?.actors ?? [];

  const toggleActorSelection = (actor: Actor) => {
    const exists = selectedActors.some((item) => item.id === actor.id);
    if (exists) {
      onChange(selectedActors.filter((item) => item.id !== actor.id));
    } else {
      onChange([
        ...selectedActors,
        {
          ...actor,
          role: "",
        },
      ]);
    }
  };

  const handleCreateActor = handleSubmit(async (values) => {
    if (!effectiveToken) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để tạo diễn viên", "error");
      return;
    }

    createActorMutation.mutate(
      { data: { name: values.name, avatarUrl: values.profileImage || undefined }, accessToken: effectiveToken },
      {
        onSuccess: (response) => {
          showToast("Tạo diễn viên thành công", undefined, "success");
          const newActor: Actor = {
            id: response.result.id,
            name: response.result.name,
            profileImage: response.result.profileImage ?? undefined,
          };
          onChange([...selectedActors, { ...newActor, role: "" }]);
          reset();
          setIsCreateMode(false);
          refetch();
        },
        onError: (error: any) => {
          const message = error?.message || "Không thể tạo diễn viên";
          showToast(message, undefined, "error");
        },
      }
    );
  });

  const handleUpdateActor = handleSubmit(async (values) => {
    if (!effectiveToken || !editingActor) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để cập nhật diễn viên", "error");
      return;
    }

    updateActorMutation.mutate(
      {
        actorId: editingActor.id,
        data: { name: values.name, avatarUrl: values.profileImage || undefined },
        accessToken: effectiveToken,
      },
      {
        onSuccess: (response) => {
          showToast("Cập nhật diễn viên thành công", undefined, "success");
          const updatedActor: Actor = {
            id: response.result.id,
            name: response.result.name,
            profileImage: response.result.profileImage ?? undefined,
          };
          const updatedSelection = selectedActors.map((actor) =>
            actor.id === updatedActor.id ? { ...updatedActor, role: actor.role } : actor
          );
          onChange(updatedSelection);
          reset();
          setEditingActor(null);
          setIsCreateMode(false);
          refetch();
        },
        onError: (error: any) => {
          const message = error?.message || "Không thể cập nhật diễn viên";
          showToast(message, undefined, "error");
        },
      }
    );
  });

  const handleDeleteActor = (actor: Actor) => {
    if (!effectiveToken) {
      showToast("Yêu cầu đăng nhập", "Vui lòng đăng nhập để xoá diễn viên", "error");
      return;
    }

    deleteActorMutation.mutate(
      { actorId: actor.id, accessToken: effectiveToken },
      {
        onSuccess: () => {
          showToast("Đã xoá diễn viên", undefined, "success");
          onChange(selectedActors.filter((item) => item.id !== actor.id));
          refetch();
        },
        onError: (error: any) => {
          const message = error?.message || "Không thể xoá diễn viên";
          showToast(message, undefined, "error");
        },
      }
    );
  };

  const handleRemoveFromSelection = (actorId: number) => {
    onChange(selectedActors.filter((item) => item.id !== actorId));
  };

  const handleRoleChange = (actorId: number, role: string) => {
    onChange(
      selectedActors.map((actor) =>
        actor.id === actorId
          ? {
              ...actor,
              role,
            }
          : actor
      )
    );
  };

  const startCreateActor = () => {
    reset();
    setEditingActor(null);
    setIsCreateMode(true);
  };

  const startEditActor = (actor: Actor) => {
    reset({ name: actor.name, profileImage: actor.profileImage || "" });
    setEditingActor(actor);
    setIsCreateMode(true);
  };

  const cancelCreateEdit = () => {
    reset();
    setEditingActor(null);
    setIsCreateMode(false);
  };

  const uploadAvatar = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      setUploading(true);
      const result = await uploadFileToCloudinary(file);
      if (result?.secure_url) {
        setValue("profileImage", result.secure_url, { shouldValidate: true });
        showToast("Tải ảnh thành công", undefined, "success");
      }
    } catch (error) {
      showToast("Tải ảnh thất bại", "Vui lòng thử lại", "error");
    } finally {
      setUploading(false);
    }
  };

  return (
    <section className="space-y-5 rounded-2xl border border-white/10 bg-white/5 p-6 backdrop-blur">
      <div className="flex flex-wrap items-center justify-between gap-3">
        <div>
          <h3 className="text-lg font-semibold text-white">Diễn viên</h3>
          <p className="mt-1 text-sm text-gray-300">
            Chọn diễn viên có sẵn hoặc tạo mới để gắn vào bộ phim.
          </p>
        </div>
        <div className="flex items-center gap-3">
          <div className="relative">
            <Search className="pointer-events-none absolute left-3 top-1/2 h-4 w-4 -translate-y-1/2 text-gray-400" />
            <input
              value={searchTerm}
              onChange={(event) => setSearchTerm(event.target.value)}
              placeholder="Tìm kiếm diễn viên"
              className="w-56 rounded-lg border border-white/10 bg-white/10 py-2 pl-9 pr-3 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
            />
          </div>
          <button
            type="button"
            onClick={startCreateActor}
            className="flex items-center gap-2 rounded-lg bg-orange-500 px-4 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400"
          >
            <Plus className="h-4 w-4" />
            Thêm diễn viên
          </button>
        </div>
      </div>

      <div className="rounded-xl border border-white/10 bg-white/5">
        <div className="grid gap-3 p-4 sm:grid-cols-2 lg:grid-cols-3">
          {actors.map((actor) => {
            const isSelected = selectedActors.some((item) => item.id === actor.id);
            return (
              <div
                key={actor.id}
                className={`group flex items-center gap-3 rounded-xl border px-4 py-3 transition ${
                  isSelected
                    ? "border-orange-400/40 bg-orange-500/20"
                    : "border-white/10 bg-white/5 hover:bg-white/10"
                }`}
              >
                <div className="flex h-12 w-12 items-center justify-center overflow-hidden rounded-full bg-white/10">
                  {actor.profileImage ? (
                    <img src={actor.profileImage} alt={actor.name} className="h-full w-full object-cover" />
                  ) : (
                    <UserRound className="h-6 w-6 text-gray-300" />
                  )}
                </div>
                <div className="flex-1">
                  <p className="text-sm font-medium text-white">{actor.name}</p>
                  <p className="text-xs text-gray-400">ID: {actor.id}</p>
                </div>
                <div className="flex items-center gap-2">
                  <button
                    type="button"
                    onClick={() => toggleActorSelection(actor)}
                    className={`rounded-lg border px-3 py-1 text-xs font-medium transition ${
                      isSelected
                        ? "border-orange-400/60 bg-orange-500/30 text-white"
                        : "border-white/20 bg-white/10 text-gray-200 hover:bg-white/20"
                    }`}
                  >
                    {isSelected ? "Bỏ chọn" : "Chọn"}
                  </button>
                  <button
                    type="button"
                    onClick={() => startEditActor(actor)}
                    className="hidden rounded-lg bg-emerald-500/20 p-2 text-emerald-200 transition hover:bg-emerald-500/30 group-hover:block"
                    aria-label={`Chỉnh sửa ${actor.name}`}
                  >
                    <Pencil className="h-4 w-4" />
                  </button>
                  <button
                    type="button"
                    onClick={() => handleDeleteActor(actor)}
                    className="hidden rounded-lg bg-red-500/20 p-2 text-red-200 transition hover:bg-red-500/30 group-hover:block"
                    aria-label={`Xoá ${actor.name}`}
                  >
                    <Trash2 className="h-4 w-4" />
                  </button>
                </div>
              </div>
            );
          })}

          {actors.length === 0 && (
            <div className="col-span-full py-8 text-center text-sm text-gray-300">
              {isFetching ? "Đang tải diễn viên..." : "Không tìm thấy diễn viên phù hợp"}
            </div>
          )}
        </div>
      </div>

      {selectedActors.length > 0 && (
        <div className="space-y-3 rounded-xl border border-white/10 bg-white/5 p-4">
          <h4 className="text-sm font-semibold text-white">Diễn viên đã chọn</h4>
          <div className="space-y-3">
            {selectedActors.map((actor) => (
              <div
                key={actor.id}
                className="flex flex-col gap-2 rounded-lg border border-orange-400/30 bg-orange-500/10 p-3 text-sm text-white md:flex-row md:items-center"
              >
                <div className="flex-1">
                  <p className="font-semibold">{actor.name}</p>
                  <p className="text-xs text-white/70">ID: {actor.id}</p>
                </div>
                <div className="flex flex-1 flex-col gap-2 md:flex-row md:items-center">
                  <label className="text-xs uppercase tracking-wide text-white/70 md:w-32">Vai diễn</label>
                  <input
                    value={actor.role ?? ""}
                    onChange={(event) => handleRoleChange(actor.id, event.target.value)}
                    placeholder="Ví dụ: Woody (voice)"
                    className="flex-1 rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-white/60 focus:border-white focus:outline-none"
                  />
                </div>
                <button
                  type="button"
                  onClick={() => handleRemoveFromSelection(actor.id)}
                  className="self-start rounded-lg border border-white/20 bg-white/10 px-3 py-2 text-xs text-white transition hover:bg-white/20"
                >
                  Xoá
                </button>
              </div>
            ))}
          </div>
        </div>
      )}

      <motion.div
        initial={false}
        animate={{ height: isCreateMode ? "auto" : 0, opacity: isCreateMode ? 1 : 0 }}
        className="overflow-hidden"
      >
        {isCreateMode && (
          <div className="space-y-4 rounded-xl border border-white/10 bg-white/5 p-5">
            <div className="flex items-center justify-between">
              <h4 className="text-base font-semibold text-white">
                {editingActor ? "Chỉnh sửa diễn viên" : "Tạo diễn viên mới"}
              </h4>
              <button
                type="button"
                onClick={cancelCreateEdit}
                className="text-sm text-gray-300 hover:text-white"
              >
                Đóng
              </button>
            </div>

            <div className="grid gap-4 sm:grid-cols-2">
              <div className="space-y-2 text-sm">
                <label className="block text-xs uppercase tracking-wide text-gray-400">
                  Tên diễn viên
                </label>
                <input
                  {...register("name")}
                  placeholder="Ví dụ: Ngô Thanh Vân"
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-orange-400 focus:outline-none"
                />
                {errors.name && <p className="text-xs text-red-300">{errors.name.message}</p>}
              </div>

              <div className="space-y-2 text-sm">
                <label className="block text-xs uppercase tracking-wide text-gray-400">
                  Ảnh đại diện (URL)
                </label>
                <input
                  {...register("profileImage")}
                  placeholder="https://..."
                  className="w-full rounded-lg border border-white/10 bg-white/10 px-3 py-2 text-sm text-white placeholder:text-gray-400 focus:border-emerald-400 focus:outline-none"
                />
                {errors.profileImage && (
                  <p className="text-xs text-red-300">{errors.profileImage.message}</p>
                )}
              </div>
            </div>

            <div className="flex flex-wrap items-center justify-between gap-3">
              <label className="flex cursor-pointer items-center gap-2 rounded-lg border border-dashed border-white/20 bg-white/10 px-4 py-2 text-sm text-gray-200 transition hover:bg-white/20">
                {uploading ? <Loader2 className="h-4 w-4 animate-spin" /> : <UploadIcon />}
                Tải ảnh từ máy
                <input type="file" accept="image/*" className="hidden" onChange={uploadAvatar} />
              </label>

              <div className="flex gap-3">
                <button
                  type="button"
                  onClick={cancelCreateEdit}
                  className="rounded-lg border border-white/10 bg-white/10 px-4 py-2 text-sm text-white transition hover:bg-white/20"
                  disabled={createActorMutation.isPending || updateActorMutation.isPending || uploading}
                >
                  Huỷ
                </button>
                <button
                  type="button"
                  onClick={editingActor ? handleUpdateActor : handleCreateActor}
                  className="flex items-center gap-2 rounded-lg bg-orange-500 px-5 py-2 text-sm font-semibold text-slate-900 transition hover:bg-orange-400 disabled:opacity-70"
                  disabled={createActorMutation.isPending || updateActorMutation.isPending || uploading}
                >
                  {(createActorMutation.isPending || updateActorMutation.isPending) ? (
                    <Loader2 className="h-4 w-4 animate-spin" />
                  ) : (
                    <Pencil className="h-4 w-4" />
                  )}
                  {editingActor ? "Lưu diễn viên" : "Tạo diễn viên"}
                </button>
              </div>
            </div>
          </div>
        )}
      </motion.div>
    </section>
  );
};

export default ActorSelectSection;

const UploadIcon = () => (
  <svg xmlns="http://www.w3.org/2000/svg" viewBox="0 0 24 24" className="h-4 w-4" fill="none" stroke="currentColor" strokeWidth="2">
    <path strokeLinecap="round" strokeLinejoin="round" d="M4 16v2a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2v-2" />
    <path strokeLinecap="round" strokeLinejoin="round" d="M12 12V4m0 0 4 4m-4-4-4 4" />
  </svg>
);
