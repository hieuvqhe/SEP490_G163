"use client";

import type { ReactNode } from "react";
import type { MovieSubmissionDetail } from "@/apis/manager.movie.api";

// --- Props & Component chính (Giữ nguyên) ---

interface MovieDetailModalProps {
  open: boolean;
  submission?: MovieSubmissionDetail;
  isLoading?: boolean;
  onClose: () => void;
  onUpdateAndResubmit?: (submission: MovieSubmissionDetail) => void;
}

const MovieDetailModal = ({
  open,
  submission,
  isLoading,
  onClose,
  onUpdateAndResubmit,
}: MovieDetailModalProps) => {
  if (!open) return null;

  const normalizedStatus = submission?.status ? submission.status.toLowerCase() : "";
  const normalizedRejectionReason = submission?.rejectionReason?.trim().toLowerCase() ?? "";
  const shouldShowUpdateAndResubmitButton =
    !!submission && ["draft", "rejected"].includes(normalizedStatus);
  const isDuplicateMovieRejection =
    normalizedStatus === "rejected" && normalizedRejectionReason === "đã có phim trùng";

  return (
    <div className="fixed inset-0 z-50 flex items-center justify-center bg-black/70 backdrop-blur">
      {/* Container của Modal */}
      <div className="mx-4 w-full max-w-6xl max-h-[90vh] overflow-y-auto rounded-2xl border border-white/10 bg-gray-900/70 p-8 text-white shadow-xl backdrop-blur-lg">
        {/* === Header (Giữ nguyên) === */}
        <div className="mb-6 flex flex-col gap-3 md:flex-row md:items-start md:justify-between">
          <div>
            <h2 className="text-2xl font-semibold">Chi tiết submission phim</h2>
            <p className="mt-1 text-sm text-gray-300">
              Thông tin chi tiết về phim do đối tác gửi lên hệ thống.
            </p>
          </div>
          <div className="flex items-center gap-2 self-start">
            {shouldShowUpdateAndResubmitButton && (
              <button
                type="button"
                onClick={() => submission && onUpdateAndResubmit?.(submission)}
                className="rounded-lg border border-orange-400/40 bg-orange-500/20 px-3 py-1 text-sm font-medium text-orange-100 transition hover:bg-orange-500/30 disabled:cursor-not-allowed disabled:opacity-60"
                disabled={isDuplicateMovieRejection}
                title={
                  isDuplicateMovieRejection
                    ? "Không thể cập nhật và nộp lại do phim đã tồn tại trên hệ thống"
                    : undefined
                }
              >
                Cập nhật và nộp lại
              </button>
            )}
            <button
              onClick={onClose}
              className="rounded-lg border border-white/10 bg-white/5 px-3 py-1 text-sm text-gray-200 hover:bg-white/10"
              type="button"
            >
              Đóng
            </button>
          </div>
        </div>

        {/* === Body === */}
        {isLoading ? (
          <div className="py-24 text-center text-sm text-gray-300">Đang tải chi tiết submission...</div>
        ) : !submission ? (
          <div className="py-24 text-center text-sm text-gray-300">Không tìm thấy thông tin submission.</div>
        ) : (
          <div className="space-y-8">
            
            <section className="relative overflow-hidden rounded-2xl border border-white/10 bg-slate-900/60 shadow-xl shadow-black/20">
              {submission.bannerUrl && (
                <div className="pointer-events-none absolute inset-0">
                  <img
                    src={submission.bannerUrl}
                    alt={`${submission.title} background`}
                    className="h-full w-full object-cover opacity-40"
                    loading="lazy"
                  />
                  <div className="absolute inset-0 bg-gradient-to-r from-slate-950/90 via-slate-950/80 to-slate-900/30" />
                </div>
              )}

              <div className="relative flex flex-col gap-6 p-6 md:flex-row md:items-start md:gap-10 md:p-8">
                <div className="mx-auto w-24 flex-shrink-0 md:mx-0 md:w-36 lg:w-44 xl:w-52">
                  <Poster
                    title={submission.title}
                    src={submission.posterUrl ?? undefined}
                    className="shadow-lg shadow-black/30"
                  />
                </div>

                <main className="flex-1 space-y-5">
                  <div className="flex flex-col gap-3">
                    <div className="flex flex-wrap items-center gap-2 text-xs text-orange-200">
                      <span className="inline-flex items-center rounded-full border border-orange-400/40 bg-orange-500/20 px-3 py-1 uppercase tracking-wide">
                        {formatStatus(submission.status)}
                      </span>
                      <span className="inline-flex items-center rounded-full border border-white/10 bg-white/10 px-3 py-1 text-gray-200">
                        Mã phim: {submission.movieId ? `#${submission.movieId}` : "-"}
                      </span>
                    </div>

                    <h3 className="text-2xl font-bold text-white md:text-3xl lg:text-4xl">
                      {submission.title}
                    </h3>
                    <p className="text-sm leading-relaxed text-gray-200 md:text-base">
                      {submission.description || "Không có mô tả"}
                    </p>
                  </div>

                  <div className="grid gap-3 md:grid-cols-2">
                    <InfoCard label="Đạo diễn" value={submission.director || "-"} />
                    <InfoCard label="Hãng sản xuất" value={submission.production || "-"} />
                    <InfoCard label="Thời lượng" value={formatDuration(submission.durationMinutes)} />
                    <InfoCard label="Thể loại" value={submission.genre || "-"} />
                    <InfoCard label="Ngôn ngữ" value={submission.language || "-"} />
                    <InfoCard label="Quốc gia" value={submission.country || "-"} />
                    <InfoCard label="Ngày công chiếu" value={formatDate(submission.premiereDate)} />
                    <InfoCard label="Ngày kết thúc" value={formatDate(submission.endDate)} />
                  </div>

                  <div className="grid gap-3 md:grid-cols-3">
                    <InfoCard
                      label="Đối tác"
                      value={`${submission.partner.partnerName} (#${submission.partner.partnerId})`}
                    />
                    <InfoCard label="Ngày gửi" value={formatDateTime(submission.submittedAt)} />
                    <InfoCard label="Ngày duyệt" value={formatDateTime(submission.reviewedAt)} />
                  </div>
                </main>
              </div>
            </section>
            

            <section className="space-y-8">

              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-100">Banner & Trailer</h4>
                {submission.bannerUrl ? (
                  <BannerPreview title={submission.title} src={submission.bannerUrl} />
                ) : (
                  <p className="text-sm text-gray-300">Không có banner</p>
                )}
                <DetailGrid>
                  <InfoItem
                    label="Trailer"
                    value={
                      submission.trailerUrl ? (
                        <DocumentLink href={submission.trailerUrl}>Mở trailer</DocumentLink>
                      ) : (
                        "Không có"
                      )
                    }
                  />
                </DetailGrid>
              </div>

        
              <div className="space-y-4">
                <h4 className="text-lg font-semibold text-gray-100">Diễn viên</h4>
                <div className="grid gap-4 md:grid-cols-2 lg:grid-cols-3">
                  {submission.actors.length === 0 ? (
                    <p className="col-span-full text-sm text-gray-300">Không có thông tin diễn viên.</p>
                  ) : (
                    submission.actors.map((actor) => (
                      <div
                        key={actor.movieSubmissionActorId}
                        className="flex items-center gap-3 rounded-xl border border-white/10 bg-white/5 p-4"
                      >
                        <ActorAvatar avatarUrl={actor.actorAvatarUrl} name={actor.actorName} />
                        <div className="min-w-0">
                          <p className="truncate text-sm font-semibold text-white">
                            {actor.actorName || actorFallbackName(actor)}
                          </p>
                          <p className="truncate text-xs text-gray-300">Vai: {actor.role || "Chưa cập nhật"}</p>
                          <p className="truncate text-xs text-gray-400">
                            {actor.isExistingActor ? "Diễn viên có sẵn" : "Diễn viên mới"}
                          </p>
                        </div>
                      </div>
                    ))
                  )}
                </div>
              </div>
            </section>

   
            <section className="space-y-4 pt-4 border-t border-white/10">
              <h4 className="text-lg font-semibold text-gray-100">Thông tin quản lý & Hệ thống</h4>
              <div className="grid gap-6 md:grid-cols-2 lg:grid-cols-3">
                <InfoBlock title="Thông tin Submission">
                  <InfoItem
                    label="Đối tác"
                    value={`${submission.partner.partnerName} (#${submission.partner.partnerId})`}
                  />
                  <InfoItem label="Trạng thái" value={formatStatus(submission.status)} />
                  <InfoItem label="Mã phim hệ thống" value={submission.movieId ? `#${submission.movieId}` : "-"} />
                  <InfoItem label="Ngày gửi" value={formatDateTime(submission.submittedAt)} />
                  <InfoItem label="Ngày duyệt" value={formatDateTime(submission.reviewedAt)} />
                  <InfoItem label="Lý do từ chối" value={submission.rejectionReason || "-"} />
                </InfoBlock>

                <InfoBlock title="Tài liệu & Ghi chú">
                  <InfoItem
                    label="Tài liệu bản quyền"
                    value={
                      submission.copyrightDocumentUrl ? (
                        <DocumentLink href={submission.copyrightDocumentUrl}>Xem tài liệu</DocumentLink>
                      ) : (
                        "Không có"
                      )
                    }
                  />
                  <InfoItem
                    label="Giấy phép phân phối"
                    value={
                      submission.distributionLicenseUrl ? (
                        <DocumentLink href={submission.distributionLicenseUrl}>Xem tài liệu</DocumentLink>
                      ) : (
                        "Không có"
                      )
                    }
                  />
                  <InfoItem
                    label="Ghi chú bổ sung"
                    value={submission.additionalNotes?.trim() ? submission.additionalNotes : "Không có"}
                  />
                </InfoBlock>

                <InfoBlock title="Thông tin Hệ thống">
                  <InfoItem label="Ngày tạo" value={formatDateTime(submission.createdAt)} />
                  <InfoItem label="Cập nhật lần cuối" value={formatDateTime(submission.updatedAt)} />
                </InfoBlock>
              </div>
            </section>
          </div>
        )}
      </div>
    </div>
  );
};



const InfoCard = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <div className="space-y-2 rounded-xl border border-white/10 bg-white/5 p-4">
      <p className="text-xs uppercase tracking-widest text-gray-400">{label}</p>
      <div className="text-sm font-semibold text-white md:text-base">{value}</div>
    </div>
  );
};

const InfoBlock = ({ title, children }: { title: string; children: ReactNode }) => {
  return (
    <div className="rounded-xl border border-white/10 bg-white/5 p-4 h-full">
      <h4 className="mb-4 text-sm font-semibold text-gray-200">{title}</h4>
      <dl className="space-y-3">{children}</dl>
    </div>
  );
};

const InfoItem = ({ label, value }: { label: string; value: ReactNode }) => {
  return (
    <div className="space-y-1">
      <dt className="text-xs uppercase tracking-wider text-gray-400">{label}</dt>
      <dd className="text-sm text-white">{value}</dd>
    </div>
  );
};

const DetailGrid = ({ children }: { children: ReactNode }) => {
  return (
    <dl className="grid gap-x-6 gap-y-3 rounded-xl border border-white/10 bg-white/5 p-3 md:gap-y-4 md:p-4 md:grid-cols-2">
      {children}
    </dl>
  );
};


const posterPlaceholder = "https://images.unsplash.com/photo-1524985069026-dd778a71c7b4?auto=format&fit=crop&w=600&q=80";

const Poster = ({ title, src, className }: { title: string; src?: string; className?: string }) => {
  return (
    <div
      className={`relative h-auto w-full aspect-[2/3] overflow-hidden rounded-xl border border-white/10 bg-white/5 ${className ?? ""}`}
    >
      <img
        src={src || posterPlaceholder}
        alt={title}
        className="h-full w-full object-cover"
        loading="lazy"
      />
    </div>
  );
};

const ActorAvatar = ({ avatarUrl, name }: { avatarUrl: string | null | undefined; name: string }) => {
  const placeholder = `https://ui-avatars.com/api/?name=${encodeURIComponent(name || "Actor")}&background=1f2937&color=f97316`;
  return (
    <div className="relative h-12 w-12 flex-shrink-0 overflow-hidden rounded-full border border-white/10">
      <img src={avatarUrl || placeholder} alt={name} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
};

const BannerPreview = ({ title, src }: { title: string; src: string }) => {
  return (
    <div className="relative h-40 w-full overflow-hidden rounded-xl border border-white/10 bg-white/5">
      <img src={src} alt={`${title} banner`} className="h-full w-full object-cover" loading="lazy" />
    </div>
  );
};

const DocumentLink = ({ href, children }: { href: string; children: ReactNode }) => {
  return (
    <a
      href={href}
      target="_blank"
      rel="noopener noreferrer"
      className="text-sm text-orange-300 underline decoration-dotted underline-offset-4 hover:text-orange-200 break-all"
    >
      {children}
    </a>
  );
};

const formatDate = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleDateString("vi-VN");
};

const formatDateTime = (value?: string | null) => {
  if (!value) return "-";
  const date = new Date(value);
  if (Number.isNaN(date.getTime())) return "-";
  return date.toLocaleString("vi-VN");
};

const formatStatus = (status: MovieSubmissionDetail["status"]) => {
  switch (status) {
    case "Pending":
      return "Chờ duyệt";
    case "Resubmitted":
      return "Cần duyệt lại";
    case "Approved":
      return "Đã duyệt";
    case "Rejected":
      return "Đã từ chối";
    default:
      return status;
  }
};

const actorFallbackName = (actor: MovieSubmissionDetail["actors"][number]) => {
  return actor.actorName || "Diễn viên";
};

const formatDuration = (value?: number | null) => {
  if (!value || Number.isNaN(value)) return "-";
  return `${value} phút`;
};

export default MovieDetailModal;