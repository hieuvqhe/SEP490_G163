"use client";

import { useEffect, useRef, useState } from "react";
import {
  X,
  Search,
  FolderCheckIcon,
  PlusCircle,
  Trash2,
  Loader2,
  Check,
} from "lucide-react";
import { motion, AnimatePresence } from "framer-motion";
import { Label } from "@/components/ui/label";
import { Input } from "@/components/ui/input";
import { Textarea } from "@/components/ui/textarea";
import Image from "next/image";
import {
  Tooltip,
  TooltipContent,
  TooltipProvider,
  TooltipTrigger,
} from "@/components/ui/tooltip";
import {
  CreateMovieSubmissionReq,
  MovieSubmissionResult,
  MovieSubmissionActor,
  partnerMovieSubmissionService,
  useCreateMovieSub,
  useCreateNewActor,
  useGetActors,
  useRemoveActorFromMovieSub,
  useSubmitMovieSub,
  useUpdateActorInMovieSub,
  useUpdateMovieSub,
} from "@/apis/partner.movies.api";
import { CustomPagination } from "@/components/custom/CustomPagination";
import ActorCard from "../../components/movies-coms/ActorCard";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SelectedActorsPopover } from "../../components/movies-coms/SelectedPopoverActor";
import { Actor } from "@/apis/manager.actor.api";
import { Button } from "@/components/ui/button";
import {
  Dialog,
  DialogContent,
  DialogDescription,
  DialogHeader,
  DialogTitle,
  DialogTrigger,
} from "@/components/ui/dialog";
import { cn } from "@/lib/utils";
import { CreateActorModal } from "../../components/movies-coms/CreateActorModal";
import { HelpIcon } from "./HelpIcon";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import { useGenerateReadSasUrl } from "@/apis/pdf.blob.api";
import { useToast } from "@/components/ToastProvider";
import {
  Select,
  SelectContent,
  SelectItem,
  SelectTrigger,
  SelectValue,
} from "@/components/ui/select";
import { Popover, PopoverContent, PopoverTrigger } from "@/components/ui/popover";
import { Badge } from "@/components/ui/badge";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";
import { useGenerateSasSignature } from "@/hooks/usePartner";

interface AddMovieModalProps {
  open: boolean;
  onClose: () => void;
  mode?: "create" | "edit";
  initialSubmission?: MovieSubmissionResult | null;
}

interface MovieForm {
  title: string;
  genre: string;
  durationMinutes: number | "";
  director: string;
  language: string;
  country: string;
  production: string;
  description: string;
  premiereDate: string;
  endDate: string;
  trailerUrl: string;
  posterUrl: string;
  bannerUrl: string;
  copyrightDocumentUrl: string;
  distributionLicenseUrl: string;
  additionalNotes: string;
}

const movieFormDefault: MovieForm = {
  title: "",
  genre: "",
  durationMinutes: "",
  director: "",
  language: "",
  country: "",
  production: "",
  description: "",
  premiereDate: "",
  endDate: "",
  trailerUrl: "",
  posterUrl: "",
  bannerUrl: "",
  copyrightDocumentUrl: "",
  distributionLicenseUrl: "",
  additionalNotes: "",
};

interface PdfUploadFieldProps {
  label: string;
  value: string;
  fileName?: string;
  onUpload: (file: File) => Promise<void>;
  onRemove: () => void;
  isUploading: boolean;
  onPreview?: () => void;
  onViewInfo?: () => void;
  isPreviewLoading?: boolean;
}

type PdfField = "copyrightDocumentUrl" | "distributionLicenseUrl";

type NewActorForm = {
  name: string;
  avatarUrl: string;
  role: string;
};

type PdfUploadInfo = {
  message?: string;
  sasUrl: string;
  blobUrl: string;
  expiresAt?: string;
  readSasUrl?: string;
  readExpiresAt?: string;
};

const PdfUploadField = ({
  label,
  value,
  fileName,
  onUpload,
  onRemove,
  isUploading,
  onPreview,
  onViewInfo,
  isPreviewLoading,
}: PdfUploadFieldProps) => {
  const inputRef = useRef<HTMLInputElement>(null);

  const handleFileChange = async (event: React.ChangeEvent<HTMLInputElement>) => {
    const selectedFile = event.target.files?.[0];
    if (!selectedFile) return;

    await onUpload(selectedFile);
    event.target.value = "";
  };

  const handleClick = () => {
    if (isUploading) return;
    inputRef.current?.click();
  };

  return (
    <div className="space-y-2">
      <Label className="text-sm text-zinc-300">{label}</Label>
      <div
        className={cn(
          "flex items-center justify-between rounded-lg border border-dashed border-zinc-700 bg-zinc-900/60 px-4 py-3 transition hover:border-primary/60",
          isUploading && "pointer-events-none opacity-75"
        )}
      >
        <div className="flex min-w-0 flex-col text-sm text-zinc-300">
          {value ? (
            <span
              className="font-medium text-zinc-100 truncate"
              title={fileName || undefined}
            >
              {fileName || "Tài liệu đã tải lên"}
            </span>
          ) : (
            <span className="text-zinc-500">Chưa có tài liệu</span>
          )}
          <span className="text-xs text-zinc-500">Định dạng: PDF</span>
        </div>

        <div className="flex w-full flex-wrap items-center justify-end gap-2">
          {value ? (
            <Button type="button" variant="ghost" size="sm" onClick={onRemove} disabled={isUploading}>
              Xoá
            </Button>
          ) : null}
          {value && onPreview ? (
            <Button
              type="button"
              size="sm"
              variant="secondary"
              onClick={onPreview}
              disabled={isUploading || isPreviewLoading}
            >
              {isPreviewLoading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Xem trước"}
            </Button>
          ) : null}
          {value && onViewInfo ? (
            <Button
              type="button"
              size="sm"
              variant="ghost"
              onClick={onViewInfo}
              disabled={isUploading}
            >
              Thông tin upload
            </Button>
          ) : null}
          <Button type="button" size="sm" onClick={handleClick} disabled={isUploading}>
            {isUploading ? <Loader2 className="h-4 w-4 animate-spin" /> : "Chọn file"}
          </Button>
          <input
            ref={inputRef}
            type="file"
            accept="application/pdf"
            className="hidden"
            onChange={handleFileChange}
          />
        </div>
      </div>
    </div>
  );
};

const GENRE_OPTIONS = [
  "Hành động",
  "Phiêu lưu",
  "Hài",
  "Tình cảm",
  "Kinh dị",
  "Tâm lý",
  "Hoạt hình",
  "Khoa học viễn tưởng",
];

const COUNTRY_OPTIONS = [
  "Việt Nam",
  "Hoa Kỳ",
  "Hàn Quốc",
  "Nhật Bản",
  "Anh Quốc",
  "Pháp",
  "Khác",
];

const PRODUCTION_OPTIONS = [
  "DC Studios",
  "DreamWorks Animation",
  "DreamWorks Pictures",
  "Netflix",
  "Fox Film",
  "Universal Pictures",
  "Warner Bros.",
  "Khác",
];

const OTHER_OPTION_VALUE = "Khác";

const ALLOWED_PDF_MIME = ["application/pdf"];

const PDF_FIELD_FILE_NAME_MAP: Record<PdfField, string> = {
  copyrightDocumentUrl: "copyright-document.pdf",
  distributionLicenseUrl: "distribution-license.pdf",
};

const extractFileNameFromUrl = (url?: string | null) => {
  if (!url) return undefined;
  try {
    const pathname = new URL(url).pathname;
    const name = pathname.split("/").pop();
    return name || undefined;
  } catch (error) {
    const segments = url.split("/");
    return segments.pop() || undefined;
  }
};

const parseGenres = (genre?: string | null) => {
  if (!genre) return [] as string[];
  return genre
    .split(",")
    .map((item) => item.trim())
    .filter((item) => item.length > 0);
};

const AddMovieModal = ({ open, onClose, mode = "create", initialSubmission = null }: AddMovieModalProps) => {
  const [page, setPage] = useState(1);
  const [actorSearch, setActorSearch] = useState<string>("");
  const [isCreateActorModalOpen, setIsCreateActorModalOpen] = useState(false);
  const [selectedGenres, setSelectedGenres] = useState<string[]>([]);
  const [productionOther, setProductionOther] = useState<string>("");
  const [countryOther, setCountryOther] = useState<string>("");
  const [isCountryOther, setIsCountryOther] = useState<boolean>(false);
  const [posterPreview, setPosterPreview] = useState<string>("");
  const [bannerPreview, setBannerPreview] = useState<string>("");
  const [posterFile, setPosterFile] = useState<File | null>(null);
  const [bannerFile, setBannerFile] = useState<File | null>(null);
  const [pdfFileNames, setPdfFileNames] = useState<Partial<Record<PdfField, string>>>({});
  const [pdfPreviewUrls, setPdfPreviewUrls] = useState<Partial<Record<PdfField, string>>>({});
  const [pdfUploadInfos, setPdfUploadInfos] = useState<Partial<Record<PdfField, PdfUploadInfo>>>({});
  const [uploadingField, setUploadingField] = useState<
    null | "posterUrl" | "bannerUrl" | PdfField
  >(null);
  const [previewPdfField, setPreviewPdfField] = useState<PdfField | null>(null);
  const [infoPdfField, setInfoPdfField] = useState<PdfField | null>(null);

  const { showToast } = useToast();
  const uploadMutation = useUploadToCloudinary();
  const isEditMode = mode === "edit" && !!initialSubmission;
  const submissionId = initialSubmission?.movieSubmissionId ?? null;
  const updateMovieMutation = useUpdateMovieSub(submissionId ?? 0);
  const submitExistingMutation = useSubmitMovieSub(submissionId ?? 0);
  const generateSasMutation = useGenerateSasSignature();
  const generateReadSasMutation = useGenerateReadSasUrl();
  const createMovieMutation = useCreateMovieSub();
  const [previewGeneratingField, setPreviewGeneratingField] = useState<PdfField | null>(null);

  const handlePdfUpload = async (field: PdfField, file: File) => {
    if (!ALLOWED_PDF_MIME.includes(file.type)) {
      showToast("Định dạng không hợp lệ", "Chỉ chấp nhận tệp PDF", "error");
      return;
    }

    try {
      setUploadingField(field);
      const suffix = PDF_FIELD_FILE_NAME_MAP[field] ?? file.name;
      const sasResponse = await generateSasMutation.mutateAsync({
        fileName: `${Date.now()}_${suffix}`,
      });
      const sasUrl = sasResponse?.result?.sasUrl;
      const blobUrl = sasResponse?.result?.blobUrl;

      if (!sasUrl || !blobUrl) {
        throw new Error("Không nhận được thông tin SAS hợp lệ");
      }

      const uploadResult = await fetch(sasUrl, {
        method: "PUT",
        headers: {
          "Content-Type": file.type,
          "x-ms-blob-type": "BlockBlob",
        },
        body: file,
      });

      if (!uploadResult.ok) {
        throw new Error("Không thể tải tệp lên kho lưu trữ");
      }

      handleChange(field, blobUrl as any);
      const uploadedFileName = extractFileNameFromUrl(blobUrl) ?? file.name;
      setPdfFileNames((prev) => ({ ...prev, [field]: uploadedFileName }));

      const uploadInfo: PdfUploadInfo = {
        message: sasResponse?.message,
        sasUrl,
        blobUrl,
        expiresAt: sasResponse?.result?.expiresAt
          ? new Date(sasResponse.result.expiresAt).toISOString()
          : undefined,
      };

      try {
        const readSasResponse = await generateReadSasMutation.mutateAsync({
          blobUrl,
        });
        const readPreviewUrl = readSasResponse.result.readSasUrl;
        uploadInfo.readSasUrl = readSasResponse.result.readSasUrl;
        uploadInfo.readExpiresAt = readSasResponse.result.expiresAt;
        setPdfPreviewUrls((prev) => ({ ...prev, [field]: readPreviewUrl }));
      } catch (readError: any) {
        console.error(`[AddMovieModal] Generate read SAS for ${field} error:`, readError);
        showToast(
          "Không thể tạo liên kết xem trước",
          readError?.message || "Vui lòng thử lại sau",
          "warning"
        );
        setPdfPreviewUrls((prev) => {
          const next = { ...prev };
          delete next[field];
          return next;
        });
      }

      setPdfUploadInfos((prev) => ({
        ...prev,
        [field]: uploadInfo,
      }));
      showToast("Tải file thành công", undefined, "success");
    } catch (error: any) {
      console.error(`[AddMovieModal] Upload ${field} error:`, error);
      showToast(
        "Tải file thất bại",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    } finally {
      setUploadingField(null);
    }
  };

  const handleRemovePdf = (field: PdfField) => {
    handleChange(field, "" as any);
    setPdfFileNames((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setPdfPreviewUrls((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    setPdfUploadInfos((prev) => {
      const next = { ...prev };
      delete next[field];
      return next;
    });
    if (previewPdfField === field) {
      setPreviewPdfField(null);
    }
    if (infoPdfField === field) {
      setInfoPdfField(null);
    }
  };

  const handlePreviewPdf = async (field: PdfField) => {
    if (previewGeneratingField) {
      if (previewGeneratingField === field) return;
      return;
    }

    const blobUrl = form[field];
    if (!blobUrl) {
      showToast("Không tìm thấy tài liệu để xem trước", undefined, "error");
      return;
    }

    try {
      setPreviewGeneratingField(field);
      let previewUrl = pdfPreviewUrls[field];

      if (!previewUrl) {
        const readSasResponse = await generateReadSasMutation.mutateAsync({
          blobUrl,
        });
        previewUrl = readSasResponse.result.readSasUrl;
        setPdfPreviewUrls((prev) => ({ ...prev, [field]: previewUrl! }));

        if (pdfUploadInfos[field]) {
          setPdfUploadInfos((prev) => ({
            ...prev,
            [field]: {
              ...prev[field]!,
              readSasUrl: readSasResponse.result.readSasUrl,
              readExpiresAt: readSasResponse.result.expiresAt,
            },
          }));
        }
      }

      setPreviewPdfField(field);
    } catch (error: any) {
      showToast(
        "Không thể tạo liên kết xem trước",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    } finally {
      setPreviewGeneratingField(null);
    }
  };

  const handleCloseModal = () => {
    setActorSearch("");
    setPage(1);
    setIsCreateActorModalOpen(false);
    setSelectedGenres([]);
    setProductionOther("");
    setSelectedIds([]);
    setSelectedActors([]);
    setActorRoles({});
    setNewActors(() => []);
    setPosterPreview("");
    setBannerPreview("");
    setPosterFile(null);
    setBannerFile(null);
    setPdfFileNames({});
    setPdfPreviewUrls({});
    setPdfUploadInfos({});
    setUploadingField(null);
    setPreviewPdfField(null);
    setInfoPdfField(null);
    setForm({ ...movieFormDefault });
    setErrors({} as Record<keyof MovieForm, string>);
    setBreadcrumb("movieInfo");
    createMovieMutation.reset();
    updateMovieMutation.reset();
    submitExistingMutation.reset();
    generateReadSasMutation.reset();
    onClose();
  };

  // Tìm kiếm thì set page = 1
  useEffect(() => {
    setPage(1);
  }, [actorSearch]);

  const { data: actorRes, isLoading: actorResLoading } = useGetActors({
    limit: 4,
    page: page,
    search: actorSearch,
    sortBy: "name",
    sortOrder: "desc",
  });

  const actors = actorRes?.result.actors;
  const totalPages = actorRes?.result.pagination.totalPages;

  const [breadcrumb, setBreadcrumb] = useState<
    "movieInfo" | "addActor" | "complete"
  >("movieInfo");
  const [isPayloadPreviewOpen, setIsPayloadPreviewOpen] = useState(false);

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);
  const [actorRoles, setActorRoles] = useState<Record<number, string>>({});
  const [newActors, setNewActors] = useState<NewActorForm[]>(() => []);

  useEffect(() => {
    if (!open) return;
    if (!isEditMode || !initialSubmission) return;

    setBreadcrumb("movieInfo");
    setActorSearch("");
    setPage(1);
    setErrors({} as Record<keyof MovieForm, string>);
    setUploadingField(null);
    setPosterFile(null);
    setBannerFile(null);
    setIsPayloadPreviewOpen(false);

    const parsedGenres = parseGenres(initialSubmission.genre);
    setSelectedGenres(parsedGenres);

    const genreString = parsedGenres.join(", ");
    const rawCountry = (initialSubmission.country ?? "").trim();
    const isOtherCountryOption =
      rawCountry !== "" && !COUNTRY_OPTIONS.includes(rawCountry);
    setIsCountryOther(isOtherCountryOption);
    setCountryOther(isOtherCountryOption ? rawCountry : "");

    const productionValue = initialSubmission.production ?? "";
    const isOtherProductionOption =
      productionValue !== "" && !PRODUCTION_OPTIONS.includes(productionValue);
    setProductionOther(isOtherProductionOption ? productionValue : "");

    setForm({
      title: initialSubmission.title ?? "",
      genre: genreString,
      durationMinutes: initialSubmission.durationMinutes ?? "",
      director: initialSubmission.director ?? "",
      language: initialSubmission.language ?? "",
      country: rawCountry,
      production: productionValue,
      description: initialSubmission.description ?? "",
      premiereDate: initialSubmission.premiereDate
        ? initialSubmission.premiereDate.slice(0, 10)
        : "",
      endDate: initialSubmission.endDate
        ? initialSubmission.endDate.slice(0, 10)
        : "",
      trailerUrl: initialSubmission.trailerUrl ?? "",
      posterUrl: initialSubmission.posterUrl ?? "",
      bannerUrl: initialSubmission.bannerUrl ?? "",
      copyrightDocumentUrl: initialSubmission.copyrightDocumentUrl ?? "",
      distributionLicenseUrl: initialSubmission.distributionLicenseUrl ?? "",
      additionalNotes: initialSubmission.additionalNotes ?? "",
    });

    setPosterPreview(initialSubmission.posterUrl ?? "");
    setBannerPreview(initialSubmission.bannerUrl ?? "");

    const nextPdfNames: Partial<Record<PdfField, string>> = {};
    if (initialSubmission.copyrightDocumentUrl) {
      nextPdfNames.copyrightDocumentUrl = extractFileNameFromUrl(
        initialSubmission.copyrightDocumentUrl
      );
    }
    if (initialSubmission.distributionLicenseUrl) {
      nextPdfNames.distributionLicenseUrl = extractFileNameFromUrl(
        initialSubmission.distributionLicenseUrl
      );
    }
    setPdfFileNames(nextPdfNames);
    setPdfPreviewUrls({});
    setPreviewPdfField(null);

    const existingActorsFromSubmission =
      initialSubmission.actors?.filter(
        (actor) => actor.actorId !== null && actor.actorId !== undefined
      ) ?? [];

    const normalizedExistingActors: Actor[] = existingActorsFromSubmission.map(
      (actor) => ({
        id: actor.actorId as number,
        name: actor.actorName,
        profileImage: actor.actorAvatarUrl,
      })
    );

    setSelectedActors(normalizedExistingActors);
    setSelectedIds(normalizedExistingActors.map((actor) => actor.id));

    const initialRoles: Record<number, string> = {};
    existingActorsFromSubmission.forEach((actor) => {
      if (actor.actorId !== null && actor.actorId !== undefined) {
        initialRoles[actor.actorId] = actor.role ?? "";
      }
    });
    setActorRoles(initialRoles);

    const newActorsFromSubmission =
      initialSubmission.actors?.filter(
        (actor) => actor.actorId === null || actor.actorId === undefined
      ) ?? [];

    setNewActors(
      newActorsFromSubmission.map((actor) => ({
        name: actor.actorName,
        avatarUrl: actor.actorAvatarUrl,
        role: actor.role ?? "",
      }))
    );
  }, [open, isEditMode, initialSubmission]);

  const toggleSelect = (actor: Actor) => {
    const isSelected = selectedIds.includes(actor.id);
    setSelectedIds((prev) =>
      isSelected ? prev.filter((id) => id !== actor.id) : [...prev, actor.id]
    );

    setSelectedActors((prev) => {
      const exists = prev.some((a) => a.id === actor.id);
      if (exists) {
        return prev.filter((a) => a.id !== actor.id);
      } else {
        return [...prev, actor];
      }
    });

    setActorRoles((prev) => {
      const next = { ...prev };
      if (isSelected) {
        delete next[actor.id];
      } else if (next[actor.id] === undefined) {
        next[actor.id] = "";
      }
      return next;
    });
  };

  const handleActorRoleChange = (actorId: number, role: string) => {
    setActorRoles((prev) => ({ ...prev, [actorId]: role }));
  };

  const handleRemoveSelectedActor = (actorId: number) => {
    setSelectedIds((prev) => prev.filter((id) => id !== actorId));
    setSelectedActors((prev) => prev.filter((a) => a.id !== actorId));
    setActorRoles((prev) => {
      const next = { ...prev };
      delete next[actorId];
      return next;
    });
  };

  const handleAddNewActor = (actor: NewActorForm) => {
    setNewActors((prev) => [
      ...prev,
      {
        name: actor.name.trim(),
        avatarUrl: actor.avatarUrl.trim(),
        role: actor.role.trim(),
      },
    ]);
  };

  const handleUpdateNewActorRole = (index: number, role: string) => {
    setNewActors((prev) =>
      prev.map((actor, idx) =>
        idx === index ? { ...actor, role: role } : actor
      )
    );
  };

  const handleRemoveNewActor = (index: number) => {
    setNewActors((prev) => prev.filter((_, idx) => idx !== index));
  };

  const existingActorsValid = selectedActors.every((actor) =>
    (actorRoles[actor.id] ?? "").trim()
  );
  const newActorsValid = newActors.every(
    (actor) =>
      actor.name.trim() && actor.avatarUrl.trim() && actor.role.trim()
  );
  const hasExistingActors = selectedActors.length > 0;
  const hasNewActors = newActors.length > 0;
  const hasActors = hasExistingActors || hasNewActors;
  const canProceed =
    hasActors &&
    (!hasExistingActors || existingActorsValid) &&
    (!hasNewActors || newActorsValid);

  const handleGoToComplete = () => {
    if (!canProceed) return;
    setBreadcrumb("complete");
  };

  const [form, setForm] = useState<MovieForm>({ ...movieFormDefault });

  const [errors, setErrors] = useState<Record<keyof MovieForm, string>>(
    {} as Record<keyof MovieForm, string>
  );

  const handleChange = <K extends keyof MovieForm>(
    field: K,
    value: MovieForm[K]
  ) => {
    setForm((prev) => ({ ...prev, [field]: value }));
    setErrors((prev) => ({ ...prev, [field]: "" })); // clear lỗi khi user sửa
  };

  const validate = (): boolean => {
    const newErrors: Record<keyof MovieForm, string> = {} as any;

    if (!form.title.trim()) newErrors.title = "Vui lòng nhập tiêu đề phim.";
    if (!form.genre.trim()) newErrors.genre = "Vui lòng nhập thể loại.";
    if (!form.durationMinutes || form.durationMinutes <= 0)
      newErrors.durationMinutes = "Thời lượng phải lớn hơn 0.";
    if (!form.director.trim())
      newErrors.director = "Vui lòng nhập tên đạo diễn.";
    if (!form.language.trim()) newErrors.language = "Vui lòng nhập ngôn ngữ.";
    if (!form.country.trim()) newErrors.country = "Vui lòng nhập quốc gia.";
    if (!form.production.trim())
      newErrors.production = "Vui lòng nhập hãng sản xuất.";
    if (!form.description.trim())
      newErrors.description = "Vui lòng nhập mô tả phim.";
    if (!form.premiereDate)
      newErrors.premiereDate = "Vui lòng chọn ngày khởi chiếu.";
    if (!form.endDate) newErrors.endDate = "Vui lòng chọn ngày kết thúc.";
    if (
      form.premiereDate &&
      form.endDate &&
      new Date(form.endDate) < new Date(form.premiereDate)
    )
      newErrors.endDate = "Ngày kết thúc phải sau ngày khởi chiếu.";

    if (
      form.trailerUrl &&
      !/^https:\/\/(www\.)?youtube\.com\/watch\?v=/.test(form.trailerUrl)
    )
      newErrors.trailerUrl = "URL trailer không hợp lệ. Phải là link YouTube.";

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const validatePdfDocuments = () => {
    if (!form.copyrightDocumentUrl) {
      showToast(
        "Thiếu văn bản bản quyền",
        "Vui lòng upload file PDF (bản quyền).",
        "error"
      );
      return false;
    }

    if (!form.distributionLicenseUrl) {
      showToast(
        "Thiếu giấy phép phân phối",
        "Vui lòng upload file PDF (giấy phép).",
        "error"
      );
      return false;
    }

    return true;
  };

  const buildSubmissionPayload = (): CreateMovieSubmissionReq | null => {
    if (!validate()) return null;

    if (!validatePdfDocuments()) return null;

    if (!form.posterUrl && !posterFile) {
      showToast(
        "Thiếu poster",
        "Vui lòng tải lên poster phim trước khi tiếp tục",
        "error"
      );
      return null;
    }

    if (!form.bannerUrl && !bannerFile) {
      showToast(
        "Thiếu banner",
        "Vui lòng tải lên banner phim trước khi tiếp tục",
        "error"
      );
      return null;
    }

    if (!hasActors) {
      showToast(
        "Thiếu diễn viên",
        "Cần chọn ít nhất một diễn viên để gửi bản nháp",
        "error"
      );
      return null;
    }

    if (!existingActorsValid || !newActorsValid) {
      showToast(
        "Vai diễn chưa đầy đủ",
        "Vui lòng nhập vai diễn cho tất cả diễn viên",
        "error"
      );
      return null;
    }

    return buildSubmissionPayloadFromState();
  };

  const buildSubmissionPayloadFromState = () => {
    const existingActorIds = hasExistingActors
      ? selectedActors.map((actor) => actor.id)
      : null;

    const actorRolesPayload =
      existingActorIds?.length
        ? Object.fromEntries(
            existingActorIds.map((actorId) => [
              actorId.toString(),
              (actorRoles[actorId] ?? "").trim(),
            ])
          )
        : null;

    const newActorsPayload = hasNewActors
      ? newActors.map((actor) => ({
          name: actor.name,
          avatarUrl: actor.avatarUrl,
          role: actor.role,
        }))
      : null;

    return {
      title: form.title.trim(),
      genre: form.genre.trim(),
      durationMinutes: Number(form.durationMinutes) || 0,
      director: form.director.trim(),
      language: form.language.trim(),
      country: form.country.trim(),
      posterUrl: form.posterUrl,
      bannerUrl: form.bannerUrl,
      production: form.production.trim(),
      description: form.description.trim(),
      premiereDate: form.premiereDate,
      endDate: form.endDate,
      trailerUrl: form.trailerUrl.trim(),
      copyrightDocumentUrl: form.copyrightDocumentUrl,
      distributionLicenseUrl: form.distributionLicenseUrl,
      additionalNotes: form.additionalNotes,
      actorIds: existingActorIds,
      newActors: newActorsPayload,
      actorRoles: actorRolesPayload,
    };
  };

  const uploadMediaIfNeeded = async () => {
    let posterUrl = form.posterUrl;
    let bannerUrl = form.bannerUrl;

    try {
      if (posterFile) {
        setUploadingField("posterUrl");
        const res = await uploadMutation.mutateAsync(posterFile);
        posterUrl = res?.secure_url ?? posterUrl;
      }

      if (bannerFile) {
        setUploadingField("bannerUrl");
        const res = await uploadMutation.mutateAsync(bannerFile);
        bannerUrl = res?.secure_url ?? bannerUrl;
      }
    } finally {
      setUploadingField(null);
    }
    return { posterUrl, bannerUrl };
  };

  const handleCreateDraft = async () => {
    if (uploadingField !== null) return;

    try {
      const payload = buildSubmissionPayload();
      if (!payload) {
        setBreadcrumb("movieInfo");
        return;
      }

      const { posterUrl, bannerUrl } = await uploadMediaIfNeeded();
      const finalPayload = {
        ...payload,
        posterUrl,
        bannerUrl,
      };

      if (isEditMode && submissionId) {
        console.log("[AddMovieModal] Update draft payload:", finalPayload);
        await updateMovieMutation.mutateAsync(finalPayload);
        showToast("Đã cập nhật bản nháp", undefined, "success");
      } else {
        console.log("[AddMovieModal] Draft payload (create):", finalPayload);
        const response = await createMovieMutation.mutateAsync(finalPayload);
        console.log("[AddMovieModal] Draft response:", response);
        showToast(
          "Đã lưu bản nháp",
          "Bạn có thể xem lại trong danh sách phim",
          "success"
        );
      }

      handleCloseModal();
    } catch (error: any) {
      console.error("[AddMovieModal] Draft error:", error);
      showToast(
        isEditMode ? "Cập nhật bản nháp thất bại" : "Lưu bản nháp thất bại",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    }
  };

  const handleCreateAndSubmit = async () => {
    if (uploadingField !== null) return;

    try {
      const payload = buildSubmissionPayload();
      if (!payload) {
        setBreadcrumb("movieInfo");
        return;
      }

      const { posterUrl, bannerUrl } = await uploadMediaIfNeeded();
      const finalPayload = {
        ...payload,
        posterUrl,
        bannerUrl,
      };

      if (isEditMode && submissionId) {
        console.log("[AddMovieModal] Update & submit payload:", finalPayload);
        await updateMovieMutation.mutateAsync(finalPayload);
        await submitExistingMutation.mutateAsync();
        showToast("Đã cập nhật và gửi duyệt", undefined, "success");
      } else {
        console.log("[AddMovieModal] Submit payload (create):", finalPayload);
        const response = await createMovieMutation.mutateAsync(finalPayload);
        console.log("[AddMovieModal] Submit create response:", response);

        if (response?.result?.movieSubmissionId) {
          const submitRes = await partnerMovieSubmissionService.submitMovieSub(
            response.result.movieSubmissionId
          );
          console.log("[AddMovieModal] Submit final response:", submitRes);
        }

        showToast(
          "Tạo phim thành công",
          "Yêu cầu đã được gửi lên hệ thống",
          "success"
        );
      }

      handleCloseModal();
    } catch (error: any) {
      console.error("[AddMovieModal] Submit error:", error);
      showToast(
        isEditMode ? "Gửi duyệt thất bại" : "Tạo phim thất bại",
        error?.message || "Vui lòng thử lại sau",
        "error"
      );
    }
  };

  const handleSubmit = async () => {
    if (!validate()) return;

    try {
      const { posterUrl, bannerUrl } = await uploadMediaIfNeeded();
      setForm((prev) => ({
        ...prev,
        posterUrl,
        bannerUrl,
      }));
      setUploadingField(null);
      setBreadcrumb(isEditMode ? "complete" : "addActor");
    } catch (error) {
      console.error(error);
      showToast("Tải ảnh thất bại", "Vui lòng thử lại hoặc chọn ảnh khác", "error");
      setUploadingField(null);
    }
  };

  let content;
  switch (breadcrumb) {
    case "movieInfo":
      content = (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-zinc-100">
            {isEditMode ? "Chỉnh sửa bản nháp phim" : "Thêm phim mới"}
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái - Preview ảnh */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-full flex flex-col items-center gap-3">
                <PosterPicker
                  previewUrl={posterPreview}
                  isUploading={uploadingField === "posterUrl"}
                  onSelectFile={(file, previewUrl) => {
                    setPosterFile(file);
                    setPosterPreview(previewUrl);
                  }}
                  onClear={() => {
                    setPosterFile(null);
                    setPosterPreview("");
                    handleChange("posterUrl", "" as any);
                  }}
                />
              </div>
            </div>

            {/* Cột phải - Form nhập liệu */}
            <div className="space-y-4">
              {/* Banner */}
              <div className="w-full aspect-[16/9] bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                <BannerPicker
                  previewUrl={bannerPreview}
                  isUploading={uploadingField === "bannerUrl"}
                  onSelectFile={(file, previewUrl) => {
                    setBannerFile(file);
                    setBannerPreview(previewUrl);
                  }}
                  onClear={() => {
                    setBannerFile(null);
                    setBannerPreview("");
                    handleChange("bannerUrl", "" as any);
                  }}
                />
              </div>

              {/* Tên phim + Thể loại */}
              <div className="grid grid-cols-1 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="title">Tên phim</Label>
                    <HelpIcon
                      title="Tên phim"
                      description="Nhập tên chính thức của phim. Tên này sẽ hiển thị trên hệ thống và được sử dụng để tìm kiếm."
                    />
                  </div>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Ví dụ: Dòng Sông Ánh Sáng"
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>

                <div className="space-y-2">
                  <div className="flex items-center gap-2">
                    <Label>Thể loại</Label>
                    <HelpIcon
                      title="Thể loại phim"
                      description="Chọn một hoặc nhiều thể loại phù hợp với phim. Thể loại giúp khách hàng tìm kiếm và lọc phim dễ dàng hơn."
                    />
                  </div>
                  <Popover>
                    <PopoverTrigger asChild>
                      <Button
                        type="button"
                        variant="outline"
                        className={cn(
                          "w-full justify-between bg-zinc-900/90 text-zinc-100 hover:bg-zinc-800",
                          errors.genre && "border-red-500"
                        )}
                      >
                        {selectedGenres.length > 0
                          ? `Đã chọn ${selectedGenres.length} thể loại`
                          : "Chọn thể loại"}
                      </Button>
                    </PopoverTrigger>
                    <PopoverContent
                      className="w-72 space-y-2 bg-zinc-900 border border-zinc-800 text-zinc-100 shadow-lg"
                      align="start"
                    >
                      <div className="flex flex-wrap gap-2">
                        {GENRE_OPTIONS.map((option) => {
                          const isSelected = selectedGenres.includes(option);
                          return (
                            <button
                              key={option}
                              type="button"
                              className={cn(
                                "flex items-center gap-2 rounded-full border px-3 py-1 text-sm transition",
                                isSelected
                                  ? "border-primary bg-primary/20 text-primary"
                                  : "border-zinc-700 bg-zinc-800 text-zinc-200 hover:border-primary"
                              )}
                              onClick={() => {
                                setSelectedGenres((prev) => {
                                  const exists = prev.includes(option);
                                  const next = exists
                                    ? prev.filter((item) => item !== option)
                                    : [...prev, option];
                                  handleChange("genre", next.join(", ") as any);
                                  return next;
                                });
                              }}
                            >
                              <Check
                                className={cn(
                                  "h-4 w-4",
                                  isSelected ? "opacity-100" : "opacity-0"
                                )}
                              />
                              {option}
                            </button>
                          );
                        })}
                      </div>

                      {errors.genre && (
                        <p className="text-xs text-red-500 mt-1">{errors.genre}</p>
                      )}
                    </PopoverContent>
                  </Popover>

                  {selectedGenres.length > 0 && (
                    <div className="flex flex-wrap gap-2 pt-2">
                      {selectedGenres.map((genre) => (
                        <Badge
                          key={genre}
                          variant="secondary"
                          className="flex items-center gap-1 border border-primary/40 bg-primary/15 text-primary"
                        >
                          {genre}
                          <button
                            type="button"
                            className="text-xs text-primary/80 hover:text-primary"
                            onClick={() => {
                              setSelectedGenres((prev) => {
                                const next = prev.filter((item) => item !== genre);
                                handleChange("genre", next.join(", ") as any);
                                return next;
                              });
                            }}
                          >
                            ×
                          </button>
                        </Badge>
                      ))}
                    </div>
                  )}
                </div>
              </div>

              {/* Thời lượng + Đạo diễn */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="durationMinutes">Thời lượng (phút)</Label>
                    <HelpIcon
                      title="Thời lượng phim"
                      description="Nhập tổng thời lượng phim tính bằng phút. Ví dụ: phim 2 giờ = 120 phút. Thông tin này giúp lập lịch chiếu chính xác."
                    />
                  </div>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      handleChange("durationMinutes", Number(e.target.value))
                    }
                    placeholder="Ví dụ: 120"
                    className={cn(errors.durationMinutes && "border-red-500")}
                  />
                  {errors.durationMinutes && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.durationMinutes}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="director">Đạo diễn</Label>
                    <HelpIcon
                      title="Đạo diễn"
                      description="Tên đạo diễn chính của phim. Thông tin này sẽ hiển thị trong chi tiết phim và giúp khách hàng tìm hiểu thêm."
                    />
                  </div>
                  <Input
                    id="director"
                    value={form.director}
                    onChange={(e) => handleChange("director", e.target.value)}
                    placeholder="Tên đạo diễn"
                    className={cn(errors.director && "border-red-500")}
                  />
                  {errors.director && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.director}
                    </p>
                  )}
                </div>
              </div>

              {/* Ngôn ngữ + Quốc gia */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="language">Ngôn ngữ</Label>
                    <HelpIcon
                      title="Ngôn ngữ phim"
                      description="Ngôn ngữ chính của phim (có thể kèm phụ đề). Ví dụ: 'Tiếng Anh', 'Tiếng Việt', 'Tiếng Hàn - Phụ đề Việt'."
                    />
                  </div>
                  <Input
                    id="language"
                    value={form.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    placeholder="Ví dụ: Tiếng Việt"
                    className={cn(errors.language && "border-red-500")}
                  />
                  {errors.language && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.language}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="country">Quốc gia</Label>
                    <HelpIcon
                      title="Quốc gia sản xuất"
                      description="Chọn quốc gia hoặc khu vực sản xuất phim. Nếu không có trong danh sách, chọn 'Khác' để nhập thủ công."
                    />
                  </div>
                  <Select
                    value={isCountryOther ? OTHER_OPTION_VALUE : form.country}
                    onValueChange={(value) => {
                      if (value === OTHER_OPTION_VALUE) {
                        setIsCountryOther(true);
                        handleChange("country", countryOther as any);
                      } else {
                        setIsCountryOther(false);
                        handleChange("country", value as any);
                      }
                    }}
                  >
                    <SelectTrigger
                      id="country"
                      className={cn(
                        "w-full bg-zinc-900/90 text-zinc-100 hover:bg-zinc-800",
                        errors.country && "border-red-500"
                      )}
                    >
                      <SelectValue placeholder="Chọn quốc gia" />
                    </SelectTrigger>
                    <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
                      {COUNTRY_OPTIONS.map((country) => (
                        <SelectItem key={country} value={country}>
                          {country}
                        </SelectItem>
                      ))}
                    </SelectContent>
                  </Select>
                  {isCountryOther && (
                    <div className="mt-3 space-y-2">
                      <Label htmlFor="countryOther" className="text-xs uppercase tracking-wide text-zinc-400">
                        Nhập quốc gia khác
                      </Label>
                      <Input
                        id="countryOther"
                        value={countryOther}
                        onChange={(e) => {
                          setCountryOther(e.target.value);
                          handleChange("country", e.target.value as any);
                        }}
                        placeholder="Tên quốc gia"
                        className={cn(errors.country && "border-red-500")}
                      />
                    </div>
                  )}
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">{errors.country}</p>
                  )}
                </div>
              </div>

              {/* Hãng sản xuất */}
              <div>
                <div className="flex items-center gap-2">
                  <Label>Hãng sản xuất</Label>
                  <HelpIcon
                    title="Hãng sản xuất"
                    description="Chọn studio hoặc công ty sản xuất phim. Nếu không có trong danh sách, chọn 'Khác' để nhập thủ công."
                  />
                </div>
                <Select
                  value={
                    PRODUCTION_OPTIONS.includes(form.production)
                      ? form.production
                      : OTHER_OPTION_VALUE
                  }
                  onValueChange={(value) => {
                    if (value === OTHER_OPTION_VALUE) {
                      handleChange("production", productionOther as any);
                    } else {
                      handleChange("production", value as any);
                      setProductionOther("");
                    }
                  }}
                >
                  <SelectTrigger
                    className={cn(
                      "w-full bg-zinc-900/90 text-zinc-100 hover:bg-zinc-800",
                      errors.production && "border-red-500"
                    )}
                  >
                    <SelectValue placeholder="Chọn hãng sản xuất" />
                  </SelectTrigger>
                  <SelectContent className="bg-zinc-900 border border-zinc-800 text-zinc-100">
                    {PRODUCTION_OPTIONS.map((producer) => (
                      <SelectItem key={producer} value={producer}>
                        {producer}
                      </SelectItem>
                    ))}
                  </SelectContent>
                </Select>

                {(!PRODUCTION_OPTIONS.includes(form.production) || form.production === "") && (
                  <div className="mt-3 space-y-2">
                    <Label htmlFor="productionOther" className="text-xs uppercase tracking-wide text-zinc-400">
                      Nhập hãng sản xuất khác
                    </Label>
                    <Input
                      id="productionOther"
                      value={productionOther}
                      onChange={(e) => {
                        setProductionOther(e.target.value);
                        handleChange("production", e.target.value as any);
                      }}
                      placeholder="Tên hãng sản xuất"
                      className={cn(errors.production && "border-red-500")}
                    />
                  </div>
                )}

                {errors.production && (
                  <p className="text-xs text-red-500 mt-1">{errors.production}</p>
                )}
              </div>

              {/* Mô tả phim */}
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="description">Mô tả</Label>
                  <HelpIcon
                    title="Mô tả phim"
                    description="Viết tóm tắt nội dung, cốt truyện chính của phim. Mô tả hấp dẫn giúp thu hút khách hàng mua vé."
                  />
                </div>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Tóm tắt nội dung chính của bộ phim..."
                  className={cn(
                    "min-h-[100px]",
                    errors.description && "border-red-500"
                  )}
                />
                {errors.description && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.description}
                  </p>
                )}
              </div>

              {/* Ngày công chiếu + Ngày kết thúc */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="premiereDate">Ngày khởi chiếu</Label>
                    <HelpIcon
                      title="Ngày khởi chiếu"
                      description="Chọn ngày phim bắt đầu công chiếu tại rạp. Ngày này phải sau ngày hiện tại và trước ngày kết thúc."
                    />
                  </div>
                  <Input
                    id="premiereDate"
                    type="date"
                    value={form.premiereDate}
                    onChange={(e) =>
                      handleChange("premiereDate", e.target.value)
                    }
                    className={cn(errors.premiereDate && "border-red-500")}
                  />
                  {errors.premiereDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.premiereDate}
                    </p>
                  )}
                </div>
                <div>
                  <div className="flex items-center gap-2">
                    <Label htmlFor="endDate">Ngày kết thúc chiếu</Label>
                    <HelpIcon
                      title="Ngày kết thúc"
                      description="Chọn ngày kết thúc công chiếu. Ngày này phải sau ngày khởi chiếu. Sau ngày này phim sẽ không còn chiếu tại rạp."
                    />
                  </div>
                  <Input
                    id="endDate"
                    type="date"
                    value={form.endDate}
                    onChange={(e) => handleChange("endDate", e.target.value)}
                    className={cn(errors.endDate && "border-red-500")}
                  />
                  {errors.endDate && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.endDate}
                    </p>
                  )}
                </div>
              </div>

              {/* Trailer */}
              <div>
                <div className="flex items-center gap-2">
                  <Label htmlFor="trailerUrl">Đường dẫn trailer (YouTube)</Label>
                  <HelpIcon
                    title="Trailer phim"
                    description="Nhập link YouTube của trailer phim. Trailer giúp khách hàng xem trước nội dung và quyết định mua vé. Link phải đúng định dạng YouTube."
                    side="left"
                  />
                </div>
                <Input
                  id="trailerUrl"
                  value={form.trailerUrl}
                  onChange={(e) => handleChange("trailerUrl", e.target.value)}
                  placeholder="https://youtube.com/watch?v=..."
                  className={cn(errors.trailerUrl && "border-red-500")}
                />
                {errors.trailerUrl && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.trailerUrl}
                  </p>
                )}
              </div>

              {/* Tài liệu pháp lý */}
              <div className="space-y-2">
                <div className="flex items-center gap-2 mb-2">
                  <h3 className="text-sm font-medium text-zinc-300">Tài liệu pháp lý</h3>
                  <HelpIcon
                    title="Tài liệu pháp lý bắt buộc"
                    description="Cần tải lên văn bản bản quyền và giấy phép phân phối (định dạng PDF). Đây là yêu cầu bắt buộc để đảm bảo tính hợp pháp của việc chiếu phim."
                    side="right"
                  />
                </div>
              <div className="grid grid-cols-1 gap-4">
                <PdfUploadField
                  label="Văn bản bản quyền (PDF)"
                  value={form.copyrightDocumentUrl}
                  fileName={pdfFileNames.copyrightDocumentUrl}
                  onRemove={() => handleRemovePdf("copyrightDocumentUrl")}
                  onUpload={(file) => handlePdfUpload("copyrightDocumentUrl", file)}
                  isUploading={uploadingField === "copyrightDocumentUrl"}
                  onPreview={() => void handlePreviewPdf("copyrightDocumentUrl")}
                  isPreviewLoading={previewGeneratingField === "copyrightDocumentUrl"}
                  onViewInfo={pdfUploadInfos.copyrightDocumentUrl ? () => setInfoPdfField("copyrightDocumentUrl") : undefined}
                />
                <PdfUploadField
                  label="Giấy phép phân phối (PDF)"
                  value={form.distributionLicenseUrl}
                  fileName={pdfFileNames.distributionLicenseUrl}
                  onRemove={() => handleRemovePdf("distributionLicenseUrl")}
                  onUpload={(file) => handlePdfUpload("distributionLicenseUrl", file)}
                  isUploading={uploadingField === "distributionLicenseUrl"}
                  onPreview={() => void handlePreviewPdf("distributionLicenseUrl")}
                  isPreviewLoading={previewGeneratingField === "distributionLicenseUrl"}
                  onViewInfo={pdfUploadInfos.distributionLicenseUrl ? () => setInfoPdfField("distributionLicenseUrl") : undefined}
                />
              </div>
              </div>

              {/* Ghi chú bổ sung */}
              <div>
                <Label htmlFor="additionalNotes">Ghi chú thêm (tuỳ chọn)</Label>
                <Textarea
                  id="additionalNotes"
                  value={form.additionalNotes}
                  onChange={(event) => handleChange("additionalNotes", event.target.value as any)}
                  placeholder="Ví dụ: Thông tin thêm về bản quyền, điều khoản đặc biệt..."
                  className="min-h-[80px]"
                />
              </div>

              <Button
                className="w-full"
                variant="outline"
                onClick={handleSubmit}
              >
                {isEditMode ? "Tiếp tục" : "Tiếp tục chọn diễn viên"}
              </Button>
            </div>
          </div>
        </div>
      );
      break;

    case "addActor":
      if (isEditMode) {
        content = (
          <div className="flex w-full flex-col items-center justify-center gap-4 rounded-xl border border-zinc-800 bg-zinc-900/50 p-8 text-center text-sm text-zinc-400">
            <h2 className="text-xl font-semibold text-zinc-100">Danh sách diễn viên</h2>
            <p>
              Việc thêm hoặc chỉnh sửa diễn viên cho bản nháp đang được thực hiện trong phần
              "Chi tiết bản nháp". Bạn có thể tiếp tục hoàn thiện thông tin phim ở bước kế tiếp.
            </p>
            <Button variant="outline" onClick={() => setBreadcrumb("complete")}>Tiếp tục</Button>
          </div>
        );
        break;
      }

      content = (
        <div className="flex w-full flex-col space-y-6">
          <div className="flex flex-col gap-3 sm:flex-row sm:items-start sm:justify-between">
            <div className="space-y-1">
              <h2 className="text-xl font-semibold text-zinc-100">
                Thêm diễn viên
              </h2>
              <p className="text-sm text-zinc-400">
                Chọn diễn viên có sẵn hoặc tạo mới nếu chưa có trong hệ thống.
              </p>
            </div>
            <div className="flex flex-wrap items-center gap-3">
              <SelectedActorsPopover
                selectedActors={selectedActors}
                onRemove={handleRemoveSelectedActor}
              />
              <Button
                type="button"
                onClick={() => setIsCreateActorModalOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Tạo diễn viên mới
              </Button>
            </div>
          </div>

          {/* Thanh tìm kiếm */}
          <InputGroup>
            <InputGroupInput
              placeholder="Tìm kiếm diễn viên..."
              onChange={(e) => setActorSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {actorResLoading
                ? "Đang tải..."
                : `${actorRes?.result.pagination.totalCount ?? actors?.length ?? 0} kết quả`}
            </InputGroupAddon>
          </InputGroup>

          {/* Actor Grid */}
          {actorResLoading ? (
            <div className="flex h-[45vh] items-center justify-center">
              <p className="text-sm text-zinc-400">
                Đang tải danh sách diễn viên...
              </p>
            </div>
          ) : !actors || actors.length === 0 ? (
            <div className="flex h-[45vh] flex-col items-center justify-center gap-3 text-center">
              <p className="text-sm text-zinc-400">
                Không tìm thấy diễn viên phù hợp với tìm kiếm hiện tại.
              </p>
              <Button
                type="button"
                variant="outline"
                onClick={() => setIsCreateActorModalOpen(true)}
                className="flex items-center gap-2"
              >
                <PlusCircle className="h-4 w-4" />
                Tạo diễn viên mới
              </Button>
            </div>
          ) : (
            <div className="space-y-6">
              <div className="grid max-h-[45vh] grid-cols-2 gap-4 overflow-y-auto px-1 md:grid-cols-3 lg:grid-cols-4">
                {actors.map((actor) => (
                  <ActorCard
                    key={actor.id}
                    actor={actor}
                    isSelected={selectedIds.includes(actor.id)}
                    onToggle={() => toggleSelect(actor)}
                  />
                ))}
              </div>

              {totalPages && totalPages > 1 ? (
                <div className="flex justify-center">
                  <CustomPagination
                    totalPages={totalPages ?? 1}
                    currentPage={page}
                    onPageChange={setPage}
                  />
                </div>
              ) : null}
            </div>
          )}

          {selectedActors.length > 0 && (
            <div className="space-y-4 rounded-xl border border-zinc-800 bg-zinc-900/60 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-zinc-300">
                Diễn viên có sẵn đã chọn
              </h3>
              <div className="space-y-3">
                {selectedActors.map((actor) => (
                  <div
                    key={actor.id}
                    className="flex flex-col gap-3 rounded-lg border border-zinc-800/80 bg-zinc-900/80 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3 sm:w-64">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-zinc-800">
                        <Image
                          src={
                            actor.profileImage ??
                            "https://via.placeholder.com/120x160?text=No+Image"
                          }
                          alt={actor.name}
                          width={120}
                          height={160}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm font-medium text-zinc-100">
                          {actor.name}
                        </p>
                        <p className="text-xs text-zinc-500">ID: {actor.id}</p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-xs uppercase tracking-wide text-zinc-500 sm:w-32">
                        Vai diễn
                      </label>
                      <Input
                        value={actorRoles[actor.id] ?? ""}
                        onChange={(event) =>
                          handleActorRoleChange(actor.id, event.target.value)
                        }
                        placeholder="Ví dụ: Nam chính"
                        className="bg-zinc-900 text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveSelectedActor(actor.id)}
                        className="flex items-center gap-2 self-start rounded-lg border border-transparent bg-zinc-800 px-3 py-2 text-sm text-zinc-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          {newActors.length > 0 && (
            <div className="space-y-4 rounded-xl border border-primary/40 bg-primary/10 p-4">
              <h3 className="text-sm font-semibold uppercase tracking-wide text-primary">
                Diễn viên mới sẽ tạo cùng bản nháp
              </h3>
              <div className="space-y-3">
                {newActors.map((actor, index) => (
                  <div
                    key={`${actor.name}-${index}`}
                    className="flex flex-col gap-3 rounded-lg border border-primary/30 bg-zinc-900/80 p-3 sm:flex-row sm:items-center"
                  >
                    <div className="flex items-center gap-3 sm:w-64">
                      <div className="h-16 w-16 overflow-hidden rounded-lg bg-zinc-800">
                        <Image
                          src={actor.avatarUrl}
                          alt={actor.name}
                          width={120}
                          height={160}
                          className="h-full w-full object-cover"
                          unoptimized
                        />
                      </div>
                      <div>
                        <p className="text-sm font-semibold text-primary">
                          {actor.name}
                        </p>
                        <p className="text-xs text-zinc-400">
                          Diễn viên mới #{index + 1}
                        </p>
                      </div>
                    </div>

                    <div className="flex flex-1 flex-col gap-2 sm:flex-row sm:items-center">
                      <label className="text-xs uppercase tracking-wide text-primary/80 sm:w-32">
                        Vai diễn
                      </label>
                      <Input
                        value={actor.role}
                        onChange={(event) =>
                          handleUpdateNewActorRole(index, event.target.value)
                        }
                        placeholder="Ví dụ: Khách mời"
                        className="bg-zinc-900 text-zinc-100"
                      />
                      <button
                        type="button"
                        onClick={() => handleRemoveNewActor(index)}
                        className="flex items-center gap-2 self-start rounded-lg border border-transparent bg-zinc-800 px-3 py-2 text-sm text-zinc-200 transition hover:border-red-500 hover:bg-red-500/10 hover:text-red-400"
                      >
                        <Trash2 className="h-4 w-4" />
                        Xoá
                      </button>
                    </div>
                  </div>
                ))}
              </div>
            </div>
          )}

          <div className="flex flex-col gap-3 border-t border-zinc-800 pt-4 sm:flex-row sm:items-center sm:justify-between">
            <p className="text-sm text-zinc-400">
              {!hasActors
                ? "Hãy chọn ít nhất một diễn viên hoặc tạo mới để tiếp tục."
                : !canProceed
                ? "Vui lòng nhập vai diễn cho mọi diễn viên trước khi tiếp tục."
                : isEditMode
                ? "Thông tin diễn viên đã sẵn sàng, bạn có thể cập nhật bản nháp."
                : "Thông tin diễn viên đã sẵn sàng, hãy tiếp tục để hoàn thiện bản nháp."}
            </p>
            <div className="flex flex-wrap gap-2">
              <Button
                type="button"
                variant="outline"
                onClick={() => setBreadcrumb("movieInfo")}
              >
                Quay lại
              </Button>
              <Button
                type="button"
                onClick={handleGoToComplete}
                disabled={!canProceed}
              >
                {isEditMode ? "Tiếp tục" : "Tiếp tục"}
              </Button>
            </div>
          </div>
        </div>
      );
      break;

    case "complete":
      content = (
        <div className="w-full pt-10 justify-center items-center">
          <Empty>
            <EmptyHeader>
              <EmptyMedia variant="icon">
                <FolderCheckIcon />
              </EmptyMedia>
              <EmptyTitle>Hoàn thiện</EmptyTitle>
              <EmptyDescription>
                {isEditMode
                  ? "Bạn đã hoàn thiện thông tin bản nháp. Chọn hành động bên dưới để lưu hoặc gửi duyệt."
                  : "Bạn đã hoàn thiện thông tin phim. \n                Chọn option bên dưới để tiến hành đăng ký phim"}
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex flex-col gap-3">
                <Dialog open={isPayloadPreviewOpen} onOpenChange={setIsPayloadPreviewOpen}>
                  <DialogTrigger asChild>
                    <Button variant="ghost" type="button">
                      Xem mẫu JSON gửi API
                    </Button>
                  </DialogTrigger>
                  <DialogContent className="bg-zinc-900 border-zinc-800 text-zinc-100 max-w-2xl">
                    <DialogHeader>
                      <DialogTitle>Mẫu dữ liệu gửi API</DialogTitle>
                      <DialogDescription>
                        Đây là dữ liệu JSON sẽ được gửi theo thông tin bạn đã nhập.
                      </DialogDescription>
                    </DialogHeader>
                    <pre className="max-h-[50vh] overflow-auto rounded-lg bg-zinc-950 p-4 text-xs leading-5 text-zinc-200">
                      {JSON.stringify(buildSubmissionPayloadFromState(), null, 2)}
                    </pre>
                  </DialogContent>
                </Dialog>
                <div className="flex gap-2">
                  <Button
                    variant="outline"
                    disabled={
                      uploadingField !== null ||
                      (isEditMode
                        ? updateMovieMutation.isPending
                        : createMovieMutation.isPending)
                    }
                    onClick={handleCreateDraft}
                  >
                    {isEditMode ? "Lưu cập nhật" : "Tạo bản nháp"}
                  </Button>
                  <Button
                    disabled={
                      uploadingField !== null ||
                      (isEditMode
                        ? updateMovieMutation.isPending || submitExistingMutation.isPending
                        : createMovieMutation.isPending)
                    }
                    onClick={handleCreateAndSubmit}
                  >
                    {isEditMode ? "Cập nhật & gửi duyệt" : "Tạo phim"}
                  </Button>
                </div>
              </div>
            </EmptyContent>
          </Empty>
        </div>
      );
      break;
  }

  return (
    <AnimatePresence>
      {open && (
        <motion.div
          className="fixed inset-0 z-50 flex items-center justify-center bg-zinc-950/70 backdrop-blur-sm"
          initial={{ opacity: 0 }}
          animate={{ opacity: 1 }}
          exit={{ opacity: 0 }}
          onClick={handleCloseModal}
        >
          <motion.div
            className="relative flex bg-zinc-900 h-[80vh] border border-zinc-800 rounded-2xl shadow-2xl w-[50%] max-w-5xl overflow-hidden text-zinc-100"
            initial={{ scale: 0.9, opacity: 0, y: 30 }}
            animate={{ scale: 1, opacity: 1, y: 0 }}
            exit={{ scale: 0.9, opacity: 0, y: 30 }}
            transition={{ type: "spring", damping: 20, stiffness: 250 }}
            onClick={(e) => e.stopPropagation()}
          >
            {/* --- Vùng chính: Thêm phim --- */}
            <div className="relative flex-1 p-6 transition-all duration-300 overflow-y-scroll bg-zinc-950 border border-zinc-800 rounded-2xl max-w-6xl mx-auto">
              {/* Nút đóng */}
              <button
                onClick={handleCloseModal}
                className="absolute top-4 right-4 text-zinc-400 hover:text-zinc-200 transition"
              >
                <X className="h-5 w-5" />
              </button>

              {/* Breadcrumb */}
              <div className="flex items-center gap-2 text-sm text-zinc-400 mb-6">
                <span
                  onClick={() => setBreadcrumb("movieInfo")}
                  className={
                    breadcrumb === "movieInfo"
                      ? `font-semibold text-primary`
                      : `cursor-pointer hover:underline`
                  }
                >
                  Movie Info
                </span>
                <span>›</span>
                <span
                  onClick={() => setBreadcrumb("addActor")}
                  className={
                    breadcrumb === "addActor"
                      ? `font-semibold text-primary`
                      : `cursor-pointer hover:underline`
                  }
                >
                  Add Actors
                </span>
                <span>›</span>
                <span
                  onClick={() => setBreadcrumb("complete")}
                  className={
                    breadcrumb === "complete"
                      ? `font-semibold text-primary`
                      : `cursor-pointer hover:underline`
                  }
                >
                  Complete
                </span>
              </div>

              {/* Thêm phim */}
              {content}
            </div>
            <CreateActorModal
              open={isCreateActorModalOpen}
              onClose={() => setIsCreateActorModalOpen(false)}
              onCreate={handleAddNewActor}
            />
            <Dialog
              open={previewPdfField !== null}
              onOpenChange={(state) => {
                if (!state) {
                  setPreviewPdfField(null);
                }
              }}
            >
              <DialogContent className="w-full max-w-4xl h-[80vh] overflow-hidden bg-zinc-950 text-zinc-100">
                <DialogHeader>
                  <DialogTitle>Xem trước tài liệu PDF</DialogTitle>
                  <DialogDescription>
                    {previewPdfField ? pdfFileNames[previewPdfField] || "Tài liệu" : ""}
                  </DialogDescription>
                </DialogHeader>
                <div className="flex h-full w-full items-center justify-center rounded-xl border border-zinc-800 bg-black/30">
                  {previewPdfField && pdfPreviewUrls[previewPdfField] ? (
                    <iframe
                      title="PDF Preview"
                      src={`${pdfPreviewUrls[previewPdfField]}#toolbar=0`}
                      className="h-full w-full"
                    />
                  ) : (
                    <p className="text-sm text-muted-foreground">Không tìm thấy tài liệu để hiển thị.</p>
                  )}
                </div>
              </DialogContent>
            </Dialog>
            <Dialog
              open={infoPdfField !== null}
              onOpenChange={(state) => {
                if (!state) {
                  setInfoPdfField(null);
                }
              }}
            >
              <DialogContent className="w-full max-w-xl bg-zinc-950 text-zinc-100">
                <DialogHeader>
                  <DialogTitle>Thông tin upload PDF</DialogTitle>
                  <DialogDescription>
                    {infoPdfField ? pdfFileNames[infoPdfField] || "Tài liệu" : ""}
                  </DialogDescription>
                </DialogHeader>
                {infoPdfField ? (
                  <div className="space-y-3 text-sm">
                    {pdfUploadInfos[infoPdfField]?.message ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Thông báo</p>
                        <p className="break-all text-zinc-100">{pdfUploadInfos[infoPdfField]?.message}</p>
                      </div>
                    ) : null}
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Upload SAS URL</p>
                      <p className="break-all text-primary">{pdfUploadInfos[infoPdfField]?.sasUrl}</p>
                    </div>
                    <div>
                      <p className="text-xs uppercase tracking-wide text-zinc-500">Blob URL</p>
                      <p className="break-all text-primary">{pdfUploadInfos[infoPdfField]?.blobUrl}</p>
                    </div>
                    {pdfUploadInfos[infoPdfField]?.expiresAt ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Upload hết hạn</p>
                        <p className="text-zinc-100">
                          {new Date(pdfUploadInfos[infoPdfField]!.expiresAt as string).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    ) : null}
                    {pdfUploadInfos[infoPdfField]?.readSasUrl ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Read SAS URL</p>
                        <p className="break-all text-primary">{pdfUploadInfos[infoPdfField]?.readSasUrl}</p>
                      </div>
                    ) : null}
                    {pdfUploadInfos[infoPdfField]?.readExpiresAt ? (
                      <div>
                        <p className="text-xs uppercase tracking-wide text-zinc-500">Read hết hạn</p>
                        <p className="text-zinc-100">
                          {new Date(pdfUploadInfos[infoPdfField]!.readExpiresAt as string).toLocaleString("vi-VN")}
                        </p>
                      </div>
                    ) : null}
                  </div>
                ) : null}
              </DialogContent>
            </Dialog>
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMovieModal;

interface PosterPickerProps {
  previewUrl: string;
  isUploading: boolean;
  onSelectFile: (file: File, previewUrl: string) => void;
  onClear: () => void;
}

const PosterPicker = ({ previewUrl, isUploading, onSelectFile, onClear }: PosterPickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    onSelectFile(file, objectUrl);
  };

  const handleTriggerClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleTriggerClick}
            className={cn(
              "group relative flex aspect-[3/4] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-zinc-800 transition hover:ring-2 hover:ring-primary/60",
              isUploading && "pointer-events-none opacity-75"
            )}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Poster Preview"
                width={400}
                height={600}
                className="h-full w-full object-cover transition group-hover:opacity-90"
              />
            ) : (
              <span className="text-sm text-zinc-500 transition group-hover:text-zinc-300">
                Poster preview
              </span>
            )}

            {previewUrl && !isUploading ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-300 opacity-0 transition hover:bg-zinc-900 hover:text-zinc-100 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp,image/png,image/jpeg"
              onChange={handleSelectFile}
              className="hidden"
            />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
        >
          Click để thêm ảnh
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

interface BannerPickerProps {
  previewUrl: string;
  isUploading: boolean;
  onSelectFile: (file: File, previewUrl: string) => void;
  onClear: () => void;
}

const BannerPicker = ({ previewUrl, isUploading, onSelectFile, onClear }: BannerPickerProps) => {
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleSelectFile = (event: React.ChangeEvent<HTMLInputElement>) => {
    const file = event.target.files?.[0];
    if (!file) return;

    const objectUrl = URL.createObjectURL(file);
    onSelectFile(file, objectUrl);
  };

  const handleTriggerClick = () => {
    if (isUploading) return;
    fileInputRef.current?.click();
  };

  const handleClear = (event: React.MouseEvent<HTMLButtonElement>) => {
    event.stopPropagation();
    onClear();
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleTriggerClick}
            className={cn(
              "group relative flex aspect-[16/9] w-full cursor-pointer items-center justify-center overflow-hidden rounded-xl bg-zinc-800 transition hover:ring-2 hover:ring-primary/60",
              isUploading && "pointer-events-none opacity-75"
            )}
          >
            {previewUrl ? (
              <Image
                src={previewUrl}
                alt="Banner Preview"
                width={800}
                height={450}
                className="h-full w-full object-cover transition group-hover:opacity-90"
              />
            ) : (
              <span className="text-sm text-zinc-500 transition group-hover:text-zinc-300">
                Banner preview
              </span>
            )}

            {previewUrl && !isUploading ? (
              <button
                type="button"
                onClick={handleClear}
                className="absolute right-3 top-3 inline-flex h-8 w-8 items-center justify-center rounded-full bg-zinc-900/80 text-zinc-300 opacity-0 transition hover:bg-zinc-900 hover:text-zinc-100 group-hover:opacity-100"
              >
                <X className="h-4 w-4" />
              </button>
            ) : null}

            {isUploading && (
              <div className="absolute inset-0 flex items-center justify-center bg-zinc-950/60 text-primary">
                <Loader2 className="h-6 w-6 animate-spin" />
              </div>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/webp"
              onChange={handleSelectFile}
              className="hidden"
            />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="rounded-md bg-zinc-800 px-2 py-1 text-xs text-zinc-100"
        >
          Click để thêm ảnh
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
