"use client";

import { useCallback, useEffect, useMemo, useRef, useState } from "react";
import Image from "next/image";
import { PlusCircle, Upload } from "lucide-react";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogFooter,
  DialogHeader,
  DialogTitle,
} from "@/components/ui/dialog";
import {
  AlertDialog,
  AlertDialogAction,
  AlertDialogCancel,
  AlertDialogContent,
  AlertDialogDescription,
  AlertDialogFooter,
  AlertDialogHeader,
  AlertDialogTitle,
} from "@/components/ui/alert-dialog";
import { Button } from "@/components/ui/button";
import {
  MovieSubmissionActor,
  MovieSubmissionResult,
  useCreateNewActor,
  useDeleteMovieSub,
  useGetActors,
  useMovieSubmissionDetail,
  useRemoveActorFromMovieSub,
  useSubmitMovieSub,
  useUpdateActorInMovieSub,
} from "@/apis/partner.movies.api";
import { useGenerateReadSasUrl } from "@/apis/pdf.blob.api";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import { useToast } from "@/components/ToastProvider";
import { cn } from "@/lib/utils";
import { Input } from "@/components/ui/input";
import { Actor } from "@/apis/manager.actor.api";

interface MovieSubmissionDetailDialogProps {
  submissionId: number | null;
  open: boolean;
  onClose: () => void;
  onEdit?: (submission: MovieSubmissionResult) => void;
}

type PdfField = "copyrightDocumentUrl" | "distributionLicenseUrl";

const EmptyState = () => (
  <div className="flex flex-col items-center justify-center py-16 text-center text-sm text-muted-foreground">
    <p>Không tìm thấy thông tin chi tiết phim.</p>
  </div>
);

const STATUS_DISPLAY: Record<string, { label: string; className: string }> = {
  draft: { label: "Bản nháp", className: "text-sky-400" },
  pending: { label: "Chờ duyệt", className: "text-amber-300" },
  approved: { label: "Đã duyệt", className: "text-emerald-400" },
  rejected: { label: "Từ chối", className: "text-red-400" },
};

const DEFAULT_NEW_ACTOR_FORM = {
  name: "",
  role: "",
  avatarUrl: "",
};

const DEFAULT_NEW_ACTOR_ERRORS = {
  name: "",
  role: "",
  avatarUrl: "",
};

const getYouTubeEmbedUrl = (url: string | null | undefined) => {
  if (!url) return null;
  try {
    const parsed = new URL(url);
    const host = parsed.hostname.replace("www.", "");
    if (host === "youtube.com" || host === "m.youtube.com") {
      return `https://www.youtube.com/embed/${parsed.searchParams.get("v") ?? ""}`;
    }
    if (host === "youtu.be") {
      return `https://www.youtube.com/embed${parsed.pathname}`;
    }
    return null;
  } catch (error) {
    return null;
  }
};

export function MovieSubmissionDetailDialog({
  submissionId,
  open,
  onClose,
  onEdit,
}: MovieSubmissionDetailDialogProps) {
  const { showToast } = useToast();
  const [isConfirmSubmitOpen, setIsConfirmSubmitOpen] = useState(false);
  const [isConfirmDeleteOpen, setIsConfirmDeleteOpen] = useState(false);
  const [editingActor, setEditingActor] = useState<MovieSubmissionActor | null>(null);
  const [editActorForm, setEditActorForm] = useState({
    actorName: "",
    actorAvatarUrl: "",
    role: "",
  });
  const [editActorErrors, setEditActorErrors] = useState({
    actorName: "",
    actorAvatarUrl: "",
    role: "",
  });
  const editAvatarInputRef = useRef<HTMLInputElement | null>(null);
  const [actorPendingDelete, setActorPendingDelete] = useState<MovieSubmissionActor | null>(null);
  const [isAddActorDialogOpen, setIsAddActorDialogOpen] = useState(false);
  const [addActorMode, setAddActorMode] = useState<"existing" | "new">("existing");
  const [selectedExistingActor, setSelectedExistingActor] = useState<Actor | null>(null);
  const [existingActorRole, setExistingActorRole] = useState("");
  const [existingActorError, setExistingActorError] = useState("");
  const [existingActorsSearch, setExistingActorsSearch] = useState("");
  const [existingActorPage, setExistingActorPage] = useState(1);
  const [newActorForm, setNewActorForm] = useState(DEFAULT_NEW_ACTOR_FORM);
  const [newActorErrors, setNewActorErrors] = useState(DEFAULT_NEW_ACTOR_ERRORS);
  const newActorAvatarInputRef = useRef<HTMLInputElement | null>(null);

  const resetAddActorDialogState = useCallback(() => {
    setAddActorMode("existing");
    setSelectedExistingActor(null);
    setExistingActorRole("");
    setExistingActorError("");
    setExistingActorsSearch("");
    setExistingActorPage(1);
    setNewActorForm(DEFAULT_NEW_ACTOR_FORM);
    setNewActorErrors(DEFAULT_NEW_ACTOR_ERRORS);
    if (newActorAvatarInputRef.current) {
      newActorAvatarInputRef.current.value = "";
    }
  }, []);

  const [pdfReadState, setPdfReadState] = useState<
    Partial<
      Record<
        PdfField,
        {
          blobUrl: string;
          readUrl?: string;
          expiresAt?: string;
          loading: boolean;
          error?: string;
        }
      >
    >
  >({});

  const isDialogReady = open && submissionId !== null;

  const {
    data,
    isLoading,
    refetch,
  } = useMovieSubmissionDetail(isDialogReady ? submissionId ?? undefined : undefined);

  const detail = useMemo(() => data?.result ?? null, [data]);

  const submitMutation = useSubmitMovieSub(submissionId ?? 0);
  const deleteMutation = useDeleteMovieSub(submissionId ?? 0);
  const generateReadSasMutation = useGenerateReadSasUrl();
  const updateActorMutation = useUpdateActorInMovieSub(submissionId ?? 0);
  const removeActorMutation = useRemoveActorFromMovieSub(submissionId ?? 0);
  const createActorMutation = useCreateNewActor(submissionId ?? 0);
  const {
    mutateAsync: uploadActorAvatar,
    isPending: isUploadingActorAvatar,
  } = useUploadToCloudinary();
  const {
    mutateAsync: uploadNewActorAvatar,
    isPending: isUploadingNewActorAvatar,
  } = useUploadToCloudinary();
  const {
    data: availableActorsRes,
    isLoading: isLoadingAvailableActors,
  } = useGetActors({
    page: existingActorPage,
    limit: 6,
    search: existingActorsSearch,
    sortBy: "name",
    sortOrder: "asc",
  });
  const availableActors = availableActorsRes?.result.actors ?? [];
  const availableActorsPagination = availableActorsRes?.result.pagination;

  const handleClose = () => {
    setIsConfirmDeleteOpen(false);
    setIsConfirmSubmitOpen(false);
    setPdfReadState({});
    generateReadSasMutation.reset();
    setEditingActor(null);
    setActorPendingDelete(null);
    setEditActorForm({ actorName: "", actorAvatarUrl: "", role: "" });
    setEditActorErrors({ actorName: "", actorAvatarUrl: "", role: "" });
    setIsAddActorDialogOpen(false);
    resetAddActorDialogState();
    onClose();
  };

  const trailerEmbedUrl = useMemo(
    () => getYouTubeEmbedUrl(detail?.trailerUrl ?? null),
    [detail]
  );

  const normalizedStatus = detail?.status?.toLowerCase() ?? "";
  const statusDisplay = STATUS_DISPLAY[normalizedStatus] ?? {
    label: detail?.status ?? "Không xác định",
    className: "text-zinc-300",
  };
  const isPendingStatus = normalizedStatus === "pending";

  const fetchReadSas = useCallback(
    async (field: PdfField, blobUrl: string) => {
      setPdfReadState((prev) => ({
        ...prev,
        [field]: {
          blobUrl,
          loading: true,
          error: undefined,
          readUrl: prev[field]?.readUrl,
          expiresAt: prev[field]?.expiresAt,
        },
      }));

      try {
        const response = await generateReadSasMutation.mutateAsync({ blobUrl });
        setPdfReadState((prev) => ({
          ...prev,
          [field]: {
            blobUrl,
            readUrl: response.result.readSasUrl,
            expiresAt: response.result.expiresAt,
            loading: false,
          },
        }));
      } catch (error: any) {
        const message = error?.message || "Không thể tạo liên kết xem trước";
        showToast(message, undefined, "error");
        setPdfReadState((prev) => ({
          ...prev,
          [field]: {
            blobUrl,
            loading: false,
            error: message,
          },
        }));
      }
    },
    [generateReadSasMutation, showToast]
  );

  useEffect(() => {
    const blobUrl = detail?.copyrightDocumentUrl;
    if (!blobUrl) {
      setPdfReadState((prev) => {
        if (!prev.copyrightDocumentUrl) return prev;
        const next = { ...prev };
        delete next.copyrightDocumentUrl;
        return next;
      });
      return;
    }

    const current = pdfReadState.copyrightDocumentUrl;
    if (current?.blobUrl === blobUrl && (current.readUrl || current.loading)) {
      return;
    }

    void fetchReadSas("copyrightDocumentUrl", blobUrl);
  }, [detail?.copyrightDocumentUrl, pdfReadState.copyrightDocumentUrl, fetchReadSas]);

  useEffect(() => {
    const blobUrl = detail?.distributionLicenseUrl;
    if (!blobUrl) {
      setPdfReadState((prev) => {
        if (!prev.distributionLicenseUrl) return prev;
        const next = { ...prev };
        delete next.distributionLicenseUrl;
        return next;
      });
      return;
    }

    const current = pdfReadState.distributionLicenseUrl;
    if (current?.blobUrl === blobUrl && (current.readUrl || current.loading)) {
      return;
    }

    void fetchReadSas("distributionLicenseUrl", blobUrl);
  }, [detail?.distributionLicenseUrl, pdfReadState.distributionLicenseUrl, fetchReadSas]);

  if (!submissionId) {
    return null;
  }

  const openEditActorModal = (actor: MovieSubmissionActor) => {
    setEditingActor(actor);
    setEditActorForm({
      actorName: actor.actorName,
      actorAvatarUrl: actor.actorAvatarUrl,
      role: actor.role,
    });
    setEditActorErrors({ actorName: "", actorAvatarUrl: "", role: "" });
  };

  const validateEditActorForm = () => {
    const nextErrors = {
      actorName: "",
      actorAvatarUrl: "",
      role: "",
    };

    if (!editActorForm.actorName.trim()) {
      nextErrors.actorName = "Vui lòng nhập tên diễn viên.";
    }

    if (!editActorForm.role.trim()) {
      nextErrors.role = "Vui lòng nhập vai diễn.";
    }

    if (!editActorForm.actorAvatarUrl.trim()) {
      nextErrors.actorAvatarUrl = "Vui lòng chọn hoặc nhập ảnh đại diện.";
    }

    setEditActorErrors(nextErrors);
    return Object.values(nextErrors).every((value) => value === "");
  };

  const handleUploadEditActorAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadActorAvatar(file);
      if (result?.secure_url) {
        setEditActorForm((prev) => ({ ...prev, actorAvatarUrl: result.secure_url }));
        setEditActorErrors((prev) => ({ ...prev, actorAvatarUrl: "" }));
      }
    } catch (error) {
      showToast(
        "Tải ảnh thất bại",
        "Vui lòng thử lại hoặc chọn ảnh khác",
        "error"
      );
    } finally {
      if (editAvatarInputRef.current) {
        editAvatarInputRef.current.value = "";
      }
    }
  };

  const handleUpdateActor = async () => {
    if (!editingActor) return;

    if (!validateEditActorForm()) {
      showToast("Thông tin chưa đầy đủ", "Vui lòng kiểm tra lại các trường nhập", "warning");
      return;
    }

    const payload = {
      actorName: editActorForm.actorName.trim(),
      actorAvatarUrl: editActorForm.actorAvatarUrl.trim(),
      role: editActorForm.role.trim(),
    };

    try {
      await updateActorMutation.mutateAsync({
        actorId: editingActor.movieSubmissionActorId,
        newActor: payload,
      });
      showToast("Đã cập nhật diễn viên", undefined, "success");
      setEditingActor(null);
      await refetch();
    } catch (error: any) {
      showToast(
        "Cập nhật diễn viên thất bại",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    }
  };

  const confirmRemoveActor = async () => {
    if (!actorPendingDelete) return;

    try {
      await removeActorMutation.mutateAsync(actorPendingDelete.movieSubmissionActorId);
      showToast("Đã xoá diễn viên khỏi bản nháp", undefined, "success");
      setActorPendingDelete(null);
      await refetch();
    } catch (error: any) {
      showToast(
        "Xoá diễn viên thất bại",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    }
  };

  const handleSubmitMovie = async () => {
    try {
      await submitMutation.mutateAsync();
      showToast("Đã gửi yêu cầu duyệt phim", undefined, "success");
      setIsConfirmSubmitOpen(false);
      refetch();
    } catch (error: any) {
      showToast(error?.message || "Không thể gửi duyệt phim", undefined, "error");
    }
  };

  const handleDeleteMovie = async () => {
    try {
      await deleteMutation.mutateAsync();
      showToast("Đã xoá bản nháp phim", undefined, "success");
      setIsConfirmDeleteOpen(false);
      onClose();
    } catch (error: any) {
      showToast(error?.message || "Không thể xoá bản nháp", undefined, "error");
    }
  };

  const handleSelectExistingActor = (actor: Actor) => {
    setSelectedExistingActor(actor);
    setExistingActorError("");
  };

  const validateExistingActorSelection = () => {
    if (!selectedExistingActor) {
      setExistingActorError("Vui lòng chọn diễn viên trong hệ thống.");
      return false;
    }

    if (!existingActorRole.trim()) {
      setExistingActorError("Vui lòng nhập vai diễn cho diễn viên đã chọn.");
      return false;
    }

    setExistingActorError("");
    return true;
  };

  const validateNewActorForm = () => {
    const nextErrors = {
      name: "",
      role: "",
      avatarUrl: "",
    };

    if (!newActorForm.name.trim()) {
      nextErrors.name = "Vui lòng nhập tên diễn viên.";
    }

    if (!newActorForm.role.trim()) {
      nextErrors.role = "Vui lòng nhập vai diễn.";
    }

    if (!newActorForm.avatarUrl.trim()) {
      nextErrors.avatarUrl = "Vui lòng chọn hoặc nhập ảnh đại diện.";
    }

    setNewActorErrors(nextErrors);
    return Object.values(nextErrors).every((value) => value === "");
  };

  const handleUploadNewActorAvatar = async (
    event: React.ChangeEvent<HTMLInputElement>
  ) => {
    const file = event.target.files?.[0];
    if (!file) return;

    try {
      const result = await uploadNewActorAvatar(file);
      if (result?.secure_url) {
        setNewActorForm((prev) => ({ ...prev, avatarUrl: result.secure_url }));
        setNewActorErrors((prev) => ({ ...prev, avatarUrl: "" }));
      }
    } catch (error) {
      showToast(
        "Tải ảnh thất bại",
        "Vui lòng thử lại hoặc chọn ảnh khác",
        "error"
      );
    } finally {
      if (newActorAvatarInputRef.current) {
        newActorAvatarInputRef.current.value = "";
      }
    }
  };

  const handleAddActorDialogClose = () => {
    setIsAddActorDialogOpen(false);
    resetAddActorDialogState();
  };

  const handleConfirmAddActor = async () => {
    if (addActorMode === "existing") {
      if (!validateExistingActorSelection()) {
        showToast(
          "Thông tin chưa đầy đủ",
          "Vui lòng chọn diễn viên và nhập vai diễn",
          "warning"
        );
        return;
      }

      try {
        await createActorMutation.mutateAsync({
          actorId: selectedExistingActor!.id,
          role: existingActorRole.trim(),
        });
        showToast("Đã thêm diễn viên vào bản nháp", undefined, "success");
        handleAddActorDialogClose();
        await refetch();
      } catch (error: any) {
        showToast(
          "Không thể thêm diễn viên",
          error?.message || "Vui lòng thử lại sau",
          "error"
        );
      }
      return;
    }

    if (!validateNewActorForm()) {
      showToast(
        "Thông tin chưa đầy đủ",
        "Vui lòng kiểm tra lại thông tin diễn viên mới",
        "warning"
      );
      return;
    }

    try {
      await createActorMutation.mutateAsync({
        actorName: newActorForm.name.trim(),
        actorAvatarUrl: newActorForm.avatarUrl.trim(),
        role: newActorForm.role.trim(),
      });
      showToast("Đã thêm diễn viên mới vào bản nháp", undefined, "success");
      handleAddActorDialogClose();
      await refetch();
    } catch (error: any) {
      showToast(
        "Không thể thêm diễn viên mới",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    }
  };

  const renderActors = () => {
    if (!detail?.actors || detail.actors.length === 0) {
      return <p className="text-sm text-muted-foreground">Chưa có diễn viên nào trong bản nháp này.</p>;
    }

    return (
      <div className="grid gap-3">
        {detail.actors.map((actor) => {
          const isUpdatingThisActor =
            updateActorMutation.isPending &&
            editingActor?.movieSubmissionActorId === actor.movieSubmissionActorId;
          const isRemovingThisActor =
            removeActorMutation.isPending &&
            actorPendingDelete?.movieSubmissionActorId === actor.movieSubmissionActorId;

          return (
            <div
              key={`${actor.actorName}-${actor.movieSubmissionActorId}`}
              className="flex items-start gap-4 rounded-lg border border-zinc-700/60 bg-zinc-900/60 p-4"
            >
              <div className="h-20 w-16 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
                <Image
                  src={actor.actorAvatarUrl}
                  alt={actor.actorName}
                  width={80}
                  height={120}
                  className="h-full w-full object-cover"
                />
              </div>
              <div className="flex flex-1 flex-col gap-1">
                <div className="flex flex-wrap items-center justify-between gap-2">
                  <div>
                    <p className="text-sm font-semibold text-zinc-100">{actor.actorName}</p>
                    <p className="text-xs text-zinc-400">ID submission: {actor.movieSubmissionActorId}</p>
                    {actor.actorId !== null ? (
                      <p className="text-xs text-emerald-400">Diễn viên hệ thống (ID: {actor.actorId})</p>
                    ) : (
                      <p className="text-xs text-sky-300">Diễn viên mới trong bản nháp</p>
                    )}
                  </div>
                  {!isPendingStatus && (
                    <div className="flex items-center gap-2">
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() => openEditActorModal(actor)}
                        disabled={isUpdatingThisActor}
                      >
                        {isUpdatingThisActor ? "Đang cập nhật..." : "Chỉnh sửa"}
                      </Button>
                      <Button
                        size="sm"
                        variant="ghost"
                        className="text-red-400 hover:text-red-300"
                        onClick={() => setActorPendingDelete(actor)}
                        disabled={isRemovingThisActor}
                      >
                        {isRemovingThisActor ? "Đang xoá..." : "Xoá"}
                      </Button>
                    </div>
                  )}
                </div>
                <p className="text-xs text-zinc-400">Vai diễn: {actor.role}</p>
              </div>
            </div>
          );
        })}
      </div>
    );
  };

  const loadingState = (
    <div className="flex flex-col items-center justify-center py-16 text-center">
      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
      <p className="mt-3 text-sm text-muted-foreground">Đang tải thông tin phim...</p>
    </div>
  );

  return (
    <Dialog open={open} onOpenChange={(state) => !state && onClose()}>
      <DialogContent className="max-h-[92vh] w-[96vw] max-w-6xl overflow-y-auto bg-zinc-950 text-zinc-100">
        <DialogHeader>
          <DialogTitle>Chi tiết phim</DialogTitle>
          <DialogDescription className="text-muted-foreground">
            Xem thông tin chi tiết và thực hiện các thao tác với bản nháp phim.
          </DialogDescription>
        </DialogHeader>

        {isLoading && loadingState}

        {!isLoading && !detail && <EmptyState />}

        {!isLoading && detail && (
          <div className="space-y-6">
            <div className="grid gap-4 lg:grid-cols-[260px_1fr]">
              <div className="relative aspect-[2/3] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                <Image
                  src={detail.posterUrl}
                  alt={detail.title}
                  fill
                  className="object-cover"
                />
              </div>

              <div className="space-y-4">
                <div className="space-y-2">
                  <h2 className="text-2xl font-semibold text-white">{detail.title}</h2>
                  <p className="text-sm text-zinc-400">
                    Mã bản nháp: <span className="font-medium text-zinc-200">#{detail.movieSubmissionId}</span>
                  </p>
                  <p className="text-sm text-zinc-400">
                    Trạng thái:{" "}
                    <span className={cn("font-medium", statusDisplay.className)}>
                      {statusDisplay.label}
                    </span>
                  </p>
                  <p className="text-sm text-zinc-400">
                    Ngày tạo: {new Date(detail.createdAt).toLocaleString("vi-VN")}
                  </p>
                  <p className="text-sm text-zinc-400">
                    Cập nhật lần cuối: {new Date(detail.updatedAt).toLocaleString("vi-VN")}
                  </p>
                  {detail.rejectionReason ? (
                    <div className="rounded-lg border border-red-500/40 bg-red-500/10 p-3 text-sm text-red-300">
                      <span className="font-semibold">Lý do từ chối:</span> {detail.rejectionReason}
                    </div>
                  ) : null}
                </div>

                <div className="relative aspect-[16/9] w-full overflow-hidden rounded-xl border border-zinc-800 bg-zinc-900">
                  <Image
                    src={detail.bannerUrl || detail.posterUrl}
                    alt={`Banner của ${detail.title}`}
                    fill
                    className="object-cover"
                  />
                </div>
              </div>
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  Thông tin phim
                </h3>
                <div className="grid gap-2 text-sm text-zinc-300">
                  <p>
                    <span className="text-zinc-500">Thể loại:</span> {detail.genre}
                  </p>
                  <p>
                    <span className="text-zinc-500">Thời lượng:</span> {detail.durationMinutes} phút
                  </p>
                  <p>
                    <span className="text-zinc-500">Đạo diễn:</span> {detail.director}
                  </p>
                  <p>
                    <span className="text-zinc-500">Ngôn ngữ:</span> {detail.language}
                  </p>
                  <p>
                    <span className="text-zinc-500">Quốc gia:</span> {detail.country}
                  </p>
                  <p>
                    <span className="text-zinc-500">Ngày khởi chiếu:</span>{" "}
                    {detail.premiereDate
                      ? new Date(detail.premiereDate).toLocaleDateString("vi-VN")
                      : "Chưa xác định"}
                  </p>
                  <p>
                    <span className="text-zinc-500">Ngày kết thúc:</span>{" "}
                    {detail.endDate
                      ? new Date(detail.endDate).toLocaleDateString("vi-VN")
                      : "Chưa xác định"}
                  </p>
                </div>
              </div>

              <div className="space-y-2 rounded-xl border border-zinc-800 bg-zinc-900/50 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  Tài liệu & liên kết
                </h3>
                <div className="grid gap-2 text-sm text-zinc-300">
                  <p className="break-all">
                    <span className="text-zinc-500">Poster:</span> {detail.posterUrl}
                  </p>
                  <p className="break-all">
                    <span className="text-zinc-500">Banner:</span> {detail.bannerUrl}
                  </p>
                  <p className="break-all">
                    <span className="text-zinc-500">Trailer:</span> {detail.trailerUrl}
                  </p>
                  <p className="break-all">
                    <span className="text-zinc-500">Giấy bản quyền:</span> {detail.copyrightDocumentUrl}
                  </p>
                  <p className="break-all">
                    <span className="text-zinc-500">Giấy phép phân phối:</span> {detail.distributionLicenseUrl}
                  </p>
                  {detail.additionalNotes ? (
                    <p>
                      <span className="text-zinc-500">Ghi chú:</span> {detail.additionalNotes}
                    </p>
                  ) : null}
                  {trailerEmbedUrl ? (
                    <div className="relative aspect-video overflow-hidden rounded-lg border border-zinc-800 bg-zinc-900">
                      <iframe
                        src={trailerEmbedUrl}
                        title={`Trailer ${detail.title}`}
                        allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
                        allowFullScreen
                        className="h-full w-full"
                      />
                    </div>
                  ) : null}
                </div>
              </div>
            </div>

            <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <div className="flex flex-wrap items-center justify-between gap-2">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  Diễn viên trong bản nháp
                </h3>
                {!isPendingStatus ? (
                  <Button
                    size="sm"
                    variant="outline"
                    onClick={() => setIsAddActorDialogOpen(true)}
                    className="gap-2"
                  >
                    <PlusCircle className="h-4 w-4" />
                    Thêm diễn viên
                  </Button>
                ) : null}
              </div>
              {renderActors()}
            </div>

            <div className="grid gap-4 lg:grid-cols-2">
              <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  Giấy bản quyền
                </h3>
                {detail?.copyrightDocumentUrl ? (
                  pdfReadState.copyrightDocumentUrl?.loading ? (
                    <div className="flex h-72 w-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
                    </div>
                  ) : pdfReadState.copyrightDocumentUrl?.readUrl ? (
                    <iframe
                      src={`${pdfReadState.copyrightDocumentUrl.readUrl}#toolbar=0`}
                      className="h-72 w-full rounded-lg border border-zinc-800 bg-zinc-950"
                      title="Bản quyền"
                    />
                  ) : (
                    <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-red-500/40 bg-red-500/10 p-4 text-center text-sm text-red-300">
                      <p>{pdfReadState.copyrightDocumentUrl?.error ?? "Không thể hiển thị tài liệu."}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          detail?.copyrightDocumentUrl &&
                          fetchReadSas("copyrightDocumentUrl", detail.copyrightDocumentUrl)
                        }
                      >
                        Thử lại
                      </Button>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa đính kèm tài liệu.</p>
                )}
              </div>
              <div className="space-y-3 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                  Giấy phép phân phối
                </h3>
                {detail?.distributionLicenseUrl ? (
                  pdfReadState.distributionLicenseUrl?.loading ? (
                    <div className="flex h-72 w-full items-center justify-center rounded-lg border border-zinc-800 bg-zinc-950">
                      <div className="h-10 w-10 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
                    </div>
                  ) : pdfReadState.distributionLicenseUrl?.readUrl ? (
                    <iframe
                      src={`${pdfReadState.distributionLicenseUrl.readUrl}#toolbar=0`}
                      className="h-72 w-full rounded-lg border border-zinc-800 bg-zinc-950"
                      title="Giấy phép phân phối"
                    />
                  ) : (
                    <div className="flex h-72 w-full flex-col items-center justify-center gap-3 rounded-lg border border-dashed border-red-500/40 bg-red-500/10 p-4 text-center text-sm text-red-300">
                      <p>{pdfReadState.distributionLicenseUrl?.error ?? "Không thể hiển thị tài liệu."}</p>
                      <Button
                        size="sm"
                        variant="outline"
                        onClick={() =>
                          detail?.distributionLicenseUrl &&
                          fetchReadSas("distributionLicenseUrl", detail.distributionLicenseUrl)
                        }
                      >
                        Thử lại
                      </Button>
                    </div>
                  )
                ) : (
                  <p className="text-sm text-muted-foreground">Chưa đính kèm tài liệu.</p>
                )}
              </div>
            </div>

            <div className="flex items-center justify-between rounded-xl border border-zinc-800 bg-zinc-900/80 p-4">
              <p className="text-sm text-zinc-400">
                {isPendingStatus
                  ? "Bản nháp đang chờ duyệt. Bạn chỉ có thể xem thông tin cho tới khi quản lý phản hồi."
                  : "Nhấn \"Chỉnh sửa\" để cập nhật thông tin bản nháp trong form đầy đủ."}
              </p>
              {detail && onEdit && !isPendingStatus ? (
                <Button
                  variant="outline"
                  size="sm"
                  onClick={() => {
                    onEdit(detail);
                    handleClose();
                  }}
                >
                  Chỉnh sửa trong form
                </Button>
              ) : null}
            </div>
          </div>
        )}

        <DialogFooter className={cn("mt-6", detail ? "flex flex-col gap-2 sm:flex-row sm:justify-between" : "")}
        >
          <Button variant="outline" onClick={handleClose} className="order-2 sm:order-1">
            Đóng
          </Button>
          {detail ? (
            isPendingStatus ? (
              <div className="order-1 sm:order-2 rounded-lg border border-amber-500/40 bg-amber-500/10 px-4 py-2 text-sm text-amber-200">
                Phim đang chờ duyệt. Bạn không thể chỉnh sửa, xoá hay gửi lại cho tới khi có phản hồi từ quản lý.
              </div>
            ) : (
              <div className="flex flex-col gap-2 sm:flex-row sm:order-2 sm:justify-end">
                <Button
                  variant="secondary"
                  onClick={() => setIsConfirmSubmitOpen(true)}
                  disabled={submitMutation.isPending || detail.status?.toLowerCase() !== "draft"}
                  className="border border-emerald-500/60 bg-emerald-700 text-white hover:border-emerald-400 hover:bg-emerald-600"
                >
                  Gửi duyệt
                </Button>
                <Button
                  variant="destructive"
                  onClick={() => setIsConfirmDeleteOpen(true)}
                  disabled={deleteMutation.isPending}
                  className="border border-red-500/70 bg-red-600 text-white hover:border-red-400 hover:bg-red-500"
                >
                  Xoá bản nháp
                </Button>
              </div>
            )
          ) : null}
        </DialogFooter>
      </DialogContent>

      <AlertDialog open={isConfirmSubmitOpen} onOpenChange={setIsConfirmSubmitOpen}>
        <AlertDialogContent className="bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Gửi bản nháp đi duyệt?</AlertDialogTitle>
            <AlertDialogDescription>
              Hệ thống sẽ gửi bản nháp cho đội kiểm duyệt. Bạn chắc chắn muốn tiếp tục?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmSubmitOpen(false)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleSubmitMovie} disabled={submitMutation.isPending}>
              {submitMutation.isPending ? "Đang gửi..." : "Đồng ý"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <AlertDialog open={isConfirmDeleteOpen} onOpenChange={setIsConfirmDeleteOpen}>
        <AlertDialogContent className="bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá bản nháp phim</AlertDialogTitle>
            <AlertDialogDescription>
              Thao tác này không thể hoàn tác. Bạn có chắc chắn muốn xoá bản nháp này?
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setIsConfirmDeleteOpen(false)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction onClick={handleDeleteMovie} disabled={deleteMutation.isPending}>
              {deleteMutation.isPending ? "Đang xoá..." : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

      <Dialog open={isAddActorDialogOpen} onOpenChange={(open) => !open && handleAddActorDialogClose()}>
        <DialogContent className="bg-zinc-950 text-zinc-100 sm:max-w-3xl">
          <DialogHeader>
            <DialogTitle>Thêm diễn viên</DialogTitle>
            <DialogDescription>
              Chọn diễn viên có sẵn trong hệ thống hoặc tạo diễn viên mới cho bản nháp này.
            </DialogDescription>
          </DialogHeader>

          <div className="space-y-6">
            <div className="flex gap-2">
              <Button
                type="button"
                size="sm"
                variant={addActorMode === "existing" ? "secondary" : "outline"}
                onClick={() => {
                  setAddActorMode("existing");
                  setNewActorErrors(DEFAULT_NEW_ACTOR_ERRORS);
                }}
              >
                Chọn diễn viên hệ thống
              </Button>
              <Button
                type="button"
                size="sm"
                variant={addActorMode === "new" ? "secondary" : "outline"}
                onClick={() => {
                  setAddActorMode("new");
                  setExistingActorError("");
                }}
              >
                Tạo diễn viên mới
              </Button>
            </div>

            {addActorMode === "existing" ? (
              <div className="space-y-4">
                <Input
                  placeholder="Tìm kiếm diễn viên theo tên"
                  value={existingActorsSearch}
                  onChange={(event) => {
                    setExistingActorsSearch(event.target.value);
                    setExistingActorPage(1);
                  }}
                />

                <div className="min-h-[180px] rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
                  {isLoadingAvailableActors ? (
                    <div className="flex h-full w-full items-center justify-center">
                      <div className="h-8 w-8 animate-spin rounded-full border-2 border-zinc-700 border-t-transparent" />
                    </div>
                  ) : availableActors.length === 0 ? (
                    <p className="text-sm text-muted-foreground">
                      Không tìm thấy diễn viên phù hợp. Hãy thử từ khoá khác.
                    </p>
                  ) : (
                    <div className="grid gap-3 sm:grid-cols-2">
                      {availableActors.map((actor) => {
                        const isSelected = selectedExistingActor?.id === actor.id;

                        return (
                          <button
                            key={actor.id}
                            type="button"
                            onClick={() => handleSelectExistingActor(actor)}
                            className={cn(
                              "flex items-center gap-3 rounded-lg border p-3 text-left transition",
                              "border-zinc-700/60 bg-zinc-900/60 hover:border-primary/60",
                              isSelected && "border-primary bg-primary/10"
                            )}
                          >
                            <div className="h-14 w-14 flex-shrink-0 overflow-hidden rounded-md bg-zinc-800">
                              {actor.profileImage ? (
                                <Image
                                  src={actor.profileImage}
                                  alt={actor.name}
                                  width={56}
                                  height={56}
                                  className="h-full w-full object-cover"
                                  unoptimized
                                />
                              ) : (
                                <div className="flex h-full w-full items-center justify-center text-sm font-semibold text-zinc-400">
                                  {actor.name.slice(0, 1).toUpperCase()}
                                </div>
                              )}
                            </div>
                            <div className="flex flex-1 flex-col">
                              <span className="text-sm font-semibold text-zinc-100">{actor.name}</span>
                              <span className="text-xs text-zinc-500">ID: {actor.id}</span>
                            </div>
                          </button>
                        );
                      })}
                    </div>
                  )}
                </div>

                {availableActorsPagination && availableActorsPagination.totalPages > 1 ? (
                  <div className="flex items-center justify-between text-sm text-zinc-400">
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() => setExistingActorPage((prev) => Math.max(prev - 1, 1))}
                      disabled={existingActorPage <= 1 || isLoadingAvailableActors}
                    >
                      Trang trước
                    </Button>
                    <span>
                      Trang {existingActorPage} / {availableActorsPagination.totalPages}
                    </span>
                    <Button
                      type="button"
                      variant="outline"
                      size="sm"
                      onClick={() =>
                        setExistingActorPage((prev) =>
                          Math.min(prev + 1, availableActorsPagination.totalPages)
                        )
                      }
                      disabled={
                        existingActorPage >= availableActorsPagination.totalPages ||
                        isLoadingAvailableActors
                      }
                    >
                      Trang sau
                    </Button>
                  </div>
                ) : null}

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="existingActorRole">
                    Vai diễn
                  </label>
                  <Input
                    id="existingActorRole"
                    value={existingActorRole}
                    onChange={(event) => {
                      setExistingActorRole(event.target.value);
                      setExistingActorError("");
                    }}
                    className={cn(existingActorError && "border-red-500")}
                    placeholder="Nhập vai diễn trong phim"
                  />
                  {existingActorError ? (
                    <p className="text-xs text-red-500">{existingActorError}</p>
                  ) : null}
                </div>
              </div>
            ) : (
              <div className="space-y-4">
                <div className="flex flex-col items-center gap-3">
                  <div
                    className={cn(
                      "relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/60 transition hover:border-primary",
                      newActorErrors.avatarUrl && "border-red-500"
                    )}
                    onClick={() => newActorAvatarInputRef.current?.click()}
                  >
                    {newActorForm.avatarUrl ? (
                      <Image
                        src={newActorForm.avatarUrl}
                        alt="Ảnh diễn viên"
                        width={160}
                        height={160}
                        className="h-full w-full object-cover"
                        unoptimized
                      />
                    ) : (
                      <div className="flex flex-col items-center justify-center gap-2 text-xs text-zinc-400">
                        <Upload className="h-5 w-5" />
                        <span>{isUploadingNewActorAvatar ? "Đang tải ảnh..." : "Tải ảnh đại diện"}</span>
                      </div>
                    )}
                    <input
                      ref={newActorAvatarInputRef}
                      type="file"
                      accept="image/*"
                      className="absolute inset-0 cursor-pointer opacity-0"
                      onChange={handleUploadNewActorAvatar}
                      disabled={isUploadingNewActorAvatar}
                    />
                  </div>
                  {newActorErrors.avatarUrl ? (
                    <p className="text-xs text-red-500">{newActorErrors.avatarUrl}</p>
                  ) : null}
                  <Button
                    type="button"
                    variant="outline"
                    size="sm"
                    onClick={() => newActorAvatarInputRef.current?.click()}
                    disabled={isUploadingNewActorAvatar}
                  >
                    {isUploadingNewActorAvatar ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
                  </Button>
                  <Input
                    value={newActorForm.avatarUrl}
                    onChange={(event) =>
                      setNewActorForm((prev) => ({ ...prev, avatarUrl: event.target.value }))
                    }
                    placeholder="Hoặc dán URL ảnh"
                    className={cn(newActorErrors.avatarUrl && "border-red-500")}
                  />
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="newActorName">
                    Tên diễn viên
                  </label>
                  <Input
                    id="newActorName"
                    value={newActorForm.name}
                    onChange={(event) =>
                      setNewActorForm((prev) => ({ ...prev, name: event.target.value }))
                    }
                    className={cn(newActorErrors.name && "border-red-500")}
                  />
                  {newActorErrors.name ? (
                    <p className="text-xs text-red-500">{newActorErrors.name}</p>
                  ) : null}
                </div>

                <div className="space-y-2">
                  <label className="text-sm text-zinc-300" htmlFor="newActorRole">
                    Vai diễn
                  </label>
                  <Input
                    id="newActorRole"
                    value={newActorForm.role}
                    onChange={(event) =>
                      setNewActorForm((prev) => ({ ...prev, role: event.target.value }))
                    }
                    className={cn(newActorErrors.role && "border-red-500")}
                  />
                  {newActorErrors.role ? (
                    <p className="text-xs text-red-500">{newActorErrors.role}</p>
                  ) : null}
                </div>
              </div>
            )}
          </div>

          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button variant="outline" onClick={handleAddActorDialogClose} className="sm:order-1">
              Huỷ
            </Button>
            <Button
              onClick={handleConfirmAddActor}
              disabled={createActorMutation.isPending || isUploadingNewActorAvatar}
              className="sm:order-2"
            >
              {createActorMutation.isPending ? "Đang lưu..." : "Thêm diễn viên"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <Dialog open={!!editingActor} onOpenChange={(open) => !open && setEditingActor(null)}>
        <DialogContent className="bg-zinc-950 text-zinc-100 sm:max-w-lg">
          <DialogHeader>
            <DialogTitle>Cập nhật diễn viên</DialogTitle>
            <DialogDescription>
              Điều chỉnh thông tin diễn viên trong bản nháp. Những thay đổi sẽ được lưu ngay.
            </DialogDescription>
          </DialogHeader>
          <div className="space-y-4">
            <div className="flex flex-col items-center gap-3">
              <div
                className={cn(
                  "relative flex h-32 w-32 cursor-pointer items-center justify-center overflow-hidden rounded-2xl border border-dashed border-zinc-700 bg-zinc-800/60 transition hover:border-primary",
                  editActorErrors.actorAvatarUrl && "border-red-500"
                )}
                onClick={() => editAvatarInputRef.current?.click()}
              >
                {editActorForm.actorAvatarUrl ? (
                  <Image
                    src={editActorForm.actorAvatarUrl}
                    alt="Ảnh diễn viên"
                    width={160}
                    height={160}
                    className="h-full w-full object-cover"
                    unoptimized
                  />
                ) : (
                  <div className="flex flex-col items-center justify-center gap-2 text-xs text-zinc-400">
                    <Upload className="h-5 w-5" />
                    <span>{isUploadingActorAvatar ? "Đang tải ảnh..." : "Tải ảnh đại diện"}</span>
                  </div>
                )}
                <input
                  ref={editAvatarInputRef}
                  type="file"
                  accept="image/*"
                  className="absolute inset-0 cursor-pointer opacity-0"
                  onChange={handleUploadEditActorAvatar}
                  disabled={isUploadingActorAvatar}
                />
              </div>
              {editActorErrors.actorAvatarUrl && (
                <p className="text-xs text-red-500">{editActorErrors.actorAvatarUrl}</p>
              )}
              <Button
                type="button"
                variant="outline"
                size="sm"
                onClick={() => editAvatarInputRef.current?.click()}
                disabled={isUploadingActorAvatar}
              >
                {isUploadingActorAvatar ? "Đang tải ảnh..." : "Chọn ảnh từ máy"}
              </Button>
              <Input
                value={editActorForm.actorAvatarUrl}
                onChange={(event) =>
                  setEditActorForm((prev) => ({ ...prev, actorAvatarUrl: event.target.value }))
                }
                placeholder="Hoặc dán URL ảnh"
                className={cn(editActorErrors.actorAvatarUrl && "border-red-500")}
              />
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="actorName">
                Tên diễn viên
              </label>
              <Input
                id="actorName"
                value={editActorForm.actorName}
                onChange={(event) =>
                  setEditActorForm((prev) => ({ ...prev, actorName: event.target.value }))
                }
                className={cn(editActorErrors.actorName && "border-red-500")}
              />
              {editActorErrors.actorName && (
                <p className="text-xs text-red-500">{editActorErrors.actorName}</p>
              )}
            </div>
            <div className="space-y-2">
              <label className="text-sm text-zinc-300" htmlFor="actorRole">
                Vai diễn
              </label>
              <Input
                id="actorRole"
                value={editActorForm.role}
                onChange={(event) =>
                  setEditActorForm((prev) => ({ ...prev, role: event.target.value }))
                }
                className={cn(editActorErrors.role && "border-red-500")}
              />
              {editActorErrors.role && (
                <p className="text-xs text-red-500">{editActorErrors.role}</p>
              )}
            </div>
          </div>
          <DialogFooter className="flex flex-col gap-2 sm:flex-row sm:justify-end">
            <Button
              variant="outline"
              onClick={() => setEditingActor(null)}
              className="sm:order-1"
            >
              Huỷ
            </Button>
            <Button
              onClick={handleUpdateActor}
              disabled={updateActorMutation.isPending || isUploadingActorAvatar}
              className="sm:order-2"
            >
              {updateActorMutation.isPending ? "Đang lưu..." : "Lưu thay đổi"}
            </Button>
          </DialogFooter>
        </DialogContent>
      </Dialog>

      <AlertDialog open={!!actorPendingDelete} onOpenChange={(open) => !open && setActorPendingDelete(null)}>
        <AlertDialogContent className="bg-zinc-950 text-zinc-100">
          <AlertDialogHeader>
            <AlertDialogTitle>Xoá diễn viên khỏi bản nháp</AlertDialogTitle>
            <AlertDialogDescription>
              Bạn chắc chắn muốn xoá diễn viên này? Thao tác sẽ áp dụng ngay và không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel onClick={() => setActorPendingDelete(null)}>
              Huỷ
            </AlertDialogCancel>
            <AlertDialogAction onClick={confirmRemoveActor} disabled={removeActorMutation.isPending}>
              {removeActorMutation.isPending ? "Đang xoá..." : "Xoá"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>
    </Dialog>
  );
}
