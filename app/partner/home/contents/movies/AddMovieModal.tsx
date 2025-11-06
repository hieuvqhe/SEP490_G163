"use client";

import { useEffect, useRef, useState } from "react";
import { X, Search, FolderCheckIcon } from "lucide-react";
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
import { useGetActors } from "@/apis/partner.movies.api";
import { CustomPagination } from "@/components/custom/CustomPagination";
import ActorCard from "../../components/movies-coms/ActorCard";
import {
  InputGroup,
  InputGroupAddon,
  InputGroupInput,
} from "@/components/ui/input-group";
import { SelectedActorsPopover } from "../../components/movies-coms/SelectedPopoverActor";
import { Actor } from "@/apis/manager.actor.api";
import { AddActorPanel } from "../../components/movies-coms/AddActorPanel";
import { Button } from "@/components/ui/button";
import { cn } from "@/lib/utils";
import { ArrowUpRightIcon } from "lucide-react";

import {
  Empty,
  EmptyContent,
  EmptyDescription,
  EmptyHeader,
  EmptyMedia,
  EmptyTitle,
} from "@/components/ui/empty";

interface AddMovieModalProps {
  open: boolean;
  onClose: () => void;
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
}

const AddMovieModal = ({ open, onClose }: AddMovieModalProps) => {
  const [page, setPage] = useState(1);
  const [actorSearch, setActorSearch] = useState<string>("");
  const [showActorPanel, setShowActorPanel] = useState(false);

  const handleCloseModal = () => {
    setActorSearch("");
    setPage(1);
    setShowActorPanel(false);
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

  const [selectedIds, setSelectedIds] = useState<number[]>([]);
  const [selectedActors, setSelectedActors] = useState<Actor[]>([]);

  const toggleSelect = (actor: Actor) => {
    setSelectedIds((prev) =>
      prev.includes(actor.id)
        ? prev.filter((id) => id !== actor.id)
        : [...prev, actor.id]
    );

    setSelectedActors((prev) => {
      const exists = prev.some((a) => a.id === actor.id);
      if (exists) {
        return prev.filter((a) => a.id !== actor.id);
      } else {
        return [...prev, actor];
      }
    });
  };

  const [form, setForm] = useState<MovieForm>({
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
  });

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

  const handleSubmit = () => {
    if (!validate()) return;
    console.log("Form submitted ✅:", form);
    setBreadcrumb("addActor");
  };

  let content;
  switch (breadcrumb) {
    case "movieInfo":
      content = (
        <div>
          <h2 className="text-xl font-semibold mb-6 text-zinc-100">
            Thêm phim mới
          </h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
            {/* Cột trái - Preview ảnh */}
            <div className="space-y-4 flex flex-col items-center">
              <div className="w-full flex flex-col items-center gap-3">
                <PosterImage />
              </div>
            </div>

            {/* Cột phải - Form nhập liệu */}
            <div className="space-y-4">
              {/* Banner */}
              <div className="w-full aspect-[16/9] bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center">
                <BannerPreview />
              </div>

              {/* Title + Genre */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="title">Title</Label>
                  <Input
                    id="title"
                    value={form.title}
                    onChange={(e) => handleChange("title", e.target.value)}
                    placeholder="Movie title"
                    className={cn(errors.title && "border-red-500")}
                  />
                  {errors.title && (
                    <p className="text-xs text-red-500 mt-1">{errors.title}</p>
                  )}
                </div>
                <div>
                  <Label htmlFor="genre">Genre</Label>
                  <Input
                    id="genre"
                    value={form.genre}
                    onChange={(e) => handleChange("genre", e.target.value)}
                    placeholder="e.g. Action, Drama"
                    className={cn(errors.genre && "border-red-500")}
                  />
                  {errors.genre && (
                    <p className="text-xs text-red-500 mt-1">{errors.genre}</p>
                  )}
                </div>
              </div>

              {/* Duration + Director */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="durationMinutes">Duration (minutes)</Label>
                  <Input
                    id="durationMinutes"
                    type="number"
                    value={form.durationMinutes}
                    onChange={(e) =>
                      handleChange("durationMinutes", Number(e.target.value))
                    }
                    placeholder="120"
                    className={cn(errors.durationMinutes && "border-red-500")}
                  />
                  {errors.durationMinutes && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.durationMinutes}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="director">Director</Label>
                  <Input
                    id="director"
                    value={form.director}
                    onChange={(e) => handleChange("director", e.target.value)}
                    placeholder="Director name"
                    className={cn(errors.director && "border-red-500")}
                  />
                  {errors.director && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.director}
                    </p>
                  )}
                </div>
              </div>

              {/* Language + Country */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="language">Language</Label>
                  <Input
                    id="language"
                    value={form.language}
                    onChange={(e) => handleChange("language", e.target.value)}
                    placeholder="English"
                    className={cn(errors.language && "border-red-500")}
                  />
                  {errors.language && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.language}
                    </p>
                  )}
                </div>
                <div>
                  <Label htmlFor="country">Country</Label>
                  <Input
                    id="country"
                    value={form.country}
                    onChange={(e) => handleChange("country", e.target.value)}
                    placeholder="USA"
                    className={cn(errors.country && "border-red-500")}
                  />
                  {errors.country && (
                    <p className="text-xs text-red-500 mt-1">
                      {errors.country}
                    </p>
                  )}
                </div>
              </div>

              {/* Production */}
              <div>
                <Label htmlFor="production">Production</Label>
                <Input
                  id="production"
                  value={form.production}
                  onChange={(e) => handleChange("production", e.target.value)}
                  placeholder="Warner Bros"
                  className={cn(errors.production && "border-red-500")}
                />
                {errors.production && (
                  <p className="text-xs text-red-500 mt-1">
                    {errors.production}
                  </p>
                )}
              </div>

              {/* Description */}
              <div>
                <Label htmlFor="description">Description</Label>
                <Textarea
                  id="description"
                  value={form.description}
                  onChange={(e) => handleChange("description", e.target.value)}
                  placeholder="Short description about the movie..."
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

              {/* Premiere + End Date */}
              <div className="grid grid-cols-2 gap-4">
                <div>
                  <Label htmlFor="premiereDate">Premiere Date</Label>
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
                  <Label htmlFor="endDate">End Date</Label>
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

              {/* Trailer URL */}
              <div>
                <Label htmlFor="trailerUrl">Trailer URL (YouTube)</Label>
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

              <Button
                className="w-full"
                variant="outline"
                onClick={handleSubmit}
              >
                Hoàn tất
              </Button>
            </div>
          </div>
        </div>
      );
      break;

    case "addActor":
      content = (
        <div className="flex flex-col w-full space-y-4">
          <div className="flex w-full items-center justify-between">
            <h2 className="text-xl font-semibold text-zinc-100">
              Thêm diễn viên
            </h2>
            <SelectedActorsPopover
              selectedActors={selectedActors}
              onRemove={(id) => {
                setSelectedIds((prev) => prev.filter((x) => x !== id));
                setSelectedActors((prev) => prev.filter((a) => a.id !== id));
              }}
            />
          </div>

          {/* Thanh tìm kiếm */}
          <InputGroup>
            <InputGroupInput
              placeholder="Search..."
              onChange={(e) => setActorSearch(e.target.value)}
            />
            <InputGroupAddon>
              <Search />
            </InputGroupAddon>
            <InputGroupAddon align="inline-end">
              {actors?.length} results
            </InputGroupAddon>
          </InputGroup>

          {/* Actor Grid */}
          {actors?.length === 0 || !actors ? (
            <div className="w-full flex items-center justify-center h-[50vh]">
              <p>
                Không có diễn viên bạn cần?{" "}
                <span
                  onClick={() => setShowActorPanel(true)}
                  className="text-blue-500 hover:underline transition-discrete duration-150 cursor-pointer"
                >
                  Thêm ngay
                </span>
              </p>
            </div>
          ) : (
            <div className="flex flex-col h-[53vh] justify-around items-center">
              <div className="grid grid-cols-2 sm:grid-cols-3 lg:grid-cols-4 gap-5 overflow-y-auto px-1">
                {actors?.map((actor) => (
                  <ActorCard
                    key={actor.id}
                    actor={actor}
                    isSelected={selectedIds.includes(actor.id)}
                    onToggle={() => toggleSelect(actor)}
                  />
                ))}
              </div>

              {/* Pagination */}
              <div className="pt-6 flex justify-center">
                <CustomPagination
                  totalPages={totalPages ?? 1}
                  currentPage={page}
                  onPageChange={setPage}
                />
              </div>
            </div>
          )}
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
                Bạn đã hoàn thiện thông tin phim. <br />
                Chọn option bên dưới để tiến hành đăng ký phim
              </EmptyDescription>
            </EmptyHeader>
            <EmptyContent>
              <div className="flex gap-2">
                <Button variant="outline">Tạo bản nháp</Button>
                <Button>Tạo Phim</Button>
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
            <div
              className={`relative flex-1 p-6 transition-all duration-300 overflow-y-scroll bg-zinc-950 border border-zinc-800 rounded-2xl max-w-6xl mx-auto ${
                showActorPanel ? "max-w-[65%]" : "max-w-full"
              }`}
            >
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

            {/* --- Panel thêm diễn viên (Expand bên phải) --- */}
            <AddActorPanel
              onClose={() => setShowActorPanel(false)}
              open={showActorPanel}
              onAdded={() => console.log("reload")}
            />
          </motion.div>
        </motion.div>
      )}
    </AnimatePresence>
  );
};

export default AddMovieModal;

const PosterImage = () => {
  const [posterUrl, setPosterUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handlePosterChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setPosterUrl(objectUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };
  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className="w-full aspect-[3/4] bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer relative group hover:ring-2 hover:ring-primary/60 transition"
          >
            {posterUrl ? (
              <Image
                src={posterUrl}
                alt="Poster Preview"
                width={400}
                height={600}
                className="object-cover w-full h-full group-hover:opacity-90 transition"
              />
            ) : (
              <span className="text-zinc-500 text-sm group-hover:text-zinc-300 transition">
                Poster preview
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/webp,image/png,image/jpeg"
              onChange={handlePosterChange}
              className="hidden"
            />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="bg-zinc-800 text-zinc-100 text-xs rounded-md px-2 py-1"
        >
          Click để thêm ảnh
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};

const BannerPreview = () => {
  const [bannerUrl, setBannerUrl] = useState<string>("");
  const fileInputRef = useRef<HTMLInputElement>(null);

  const handleBannerChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const file = e.target.files?.[0];
    if (file) {
      const objectUrl = URL.createObjectURL(file);
      setBannerUrl(objectUrl);
    }
  };

  const handleClick = () => {
    fileInputRef.current?.click();
  };

  return (
    <TooltipProvider delayDuration={100}>
      <Tooltip>
        <TooltipTrigger asChild>
          <div
            onClick={handleClick}
            className="w-full aspect-[16/9] bg-zinc-800 rounded-xl overflow-hidden flex items-center justify-center cursor-pointer relative group hover:ring-2 hover:ring-primary/60 transition"
          >
            {bannerUrl ? (
              <Image
                src={bannerUrl}
                alt="Banner Preview"
                width={800}
                height={450}
                className="object-cover w-full h-full group-hover:opacity-90 transition"
              />
            ) : (
              <span className="text-zinc-500 text-sm group-hover:text-zinc-300 transition">
                Banner preview
              </span>
            )}

            <input
              ref={fileInputRef}
              type="file"
              accept="image/jpg,image/jpeg,image/png,image/webp"
              onChange={handleBannerChange}
              className="hidden"
            />
          </div>
        </TooltipTrigger>

        <TooltipContent
          side="top"
          className="bg-zinc-800 text-zinc-100 text-xs rounded-md px-2 py-1"
        >
          Click để thêm ảnh
        </TooltipContent>
      </Tooltip>
    </TooltipProvider>
  );
};
