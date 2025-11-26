"use client";

import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { LuSendHorizontal } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import LoginModal from "@/components/LoginModal";
import { useCreateReview, useMovieReviews } from "@/apis/movie.reviews.api";
import { TfiCommentAlt } from "react-icons/tfi";
import { IoMdImages, IoMdClose } from "react-icons/io";
import RateStar from "./RateStar";
import { useToast } from "@/components/ToastProvider";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import Image from "next/image";

interface CommentProps {
  movieId?: number;
}

const Comment = ({ movieId }: CommentProps) => {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const [showLoginModal, setShowLoginModal] = useState(false);
  const handleLoginSuccess = (data: {
    result: {
      accessToken: string;
      refreshToken: string;
      fullName: string;
      role: string;
    };
  }) => {
    console.log("Login successful:", data);
    setShowLoginModal(false);

    const role = data.result.role;

    // Chỉ redirect nếu là admin/partner/manager/cashier
    // User thường sẽ ở lại trang hiện tại
    if (role) {
      const roleLower = role.toLowerCase();
      
      switch (roleLower) {
        case "admin":
          window.location.href = "/admin";
          break;
        case "partner":
          window.location.href = "/partner";
          break;
        case "manager":
          window.location.href = "/manager";
          break;
        case "cashier":
          window.location.href = "/cashier";
          break;
        case "user":
        default:
          // Ở lại trang hiện tại, chỉ reload để cập nhật state
          window.location.reload();
          break;
      }
    } else {
      window.location.reload();
    }
  };
  const [ratingStar, setRatingStar] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const [selectedImages, setSelectedImages] = useState<File[]>([]);
  const [previewUrls, setPreviewUrls] = useState<string[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const fileInputRef = useRef<HTMLInputElement>(null);
  const createReviewMutate = useCreateReview();
  const uploadToCloudinary = useUploadToCloudinary();

  const [page, setPage] = useState<number>(1);

  const { data: movieReviewRes } = useMovieReviews({
    movieId: movieId ?? 0,
    params: {
      limit: 5,
      page: page,
      sort: "newest",
    },
  });
  const movieReviewList = movieReviewRes?.result.items;

  // Handle image selection
  const handleImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const newFiles = Array.from(files).slice(0, 3 - selectedImages.length); // Max 3 images
    if (newFiles.length === 0) return;

    // Validate file types
    const validFiles = newFiles.filter(file => 
      file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024 // Max 5MB
    );

    if (validFiles.length !== newFiles.length) {
      showToast("Chỉ chấp nhận ảnh và tối đa 5MB mỗi ảnh", "", "warning");
    }

    setSelectedImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setPreviewUrls(prev => [...prev, url]);
    });

    // Reset input
    if (fileInputRef.current) {
      fileInputRef.current.value = "";
    }
  };

  // Remove selected image
  const removeImage = (index: number) => {
    URL.revokeObjectURL(previewUrls[index]);
    setSelectedImages(prev => prev.filter((_, i) => i !== index));
    setPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  const handleCreateNewReview = async () => {
    if (!user || comment.length === 0) return;
    
    setIsUploading(true);
    
    try {
      // Upload images to Cloudinary
      let imageUrls: string[] = [];
      if (selectedImages.length > 0) {
        const uploadPromises = selectedImages.map(file => 
          uploadToCloudinary.mutateAsync(file)
        );
        const results = await Promise.all(uploadPromises);
        imageUrls = results.map(res => res.secure_url);
      }

      // Create review with images
      createReviewMutate.mutate(
        {
          movieId: movieId ?? 0,
          body: {
            comment: comment,
            rating_star: ratingStar,
            image_urls: imageUrls.length > 0 ? imageUrls : undefined,
          },
        },
        {
          onSuccess: (res) => {
            showToast(res.message, "", "success");
            // Reset form
            setComment("");
            setRatingStar(0);
            setSelectedImages([]);
            previewUrls.forEach(url => URL.revokeObjectURL(url));
            setPreviewUrls([]);
          },
          onError: (error) => {
            if (error.message === "Lỗi xác thực dữ liệu") {
              showToast("Bạn hãy thêm sao đã nhé ✨", "", "warning");
            } else {
              showToast(error.message, "", "error");
            }
          },
        }
      );
    } catch (error) {
      showToast("Lỗi khi upload ảnh", "", "error");
      console.error("Upload error:", error);
    } finally {
      setIsUploading(false);
    }
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 items-baseline justify-center">
        <div>
          {user ? (
            <div className="flex gap-3">
              <Avatar>
                <AvatarImage src={user?.avatarUrl} />
                <AvatarFallback>{user?.fullname}</AvatarFallback>
              </Avatar>
              <h1 className="max-w-[100px] truncate">{user?.username}</h1>
            </div>
          ) : (
            <div className="">
              <p>
                Vui lòng{" "}
                <span
                  onClick={() => setShowLoginModal(true)}
                  className="font-semibold text-[#f84565]/80 cursor-pointer"
                >
                  đăng nhập
                </span>{" "}
                để bình luận.
              </p>
            </div>
          )}
        </div>
        <div className="w-full bg-zinc-800 px-2 py-2 border border-white/10 rounded-xl">
          <div className="w-full relative select-none">
            <Textarea
              className="w-full h-[16vh] bg-black select-none rounded-xl border-none"
              placeholder="Viết bình luận"
              maxLength={1000}
              value={comment}
              onChange={(e) => setComment(e.target.value)}
            />
            <p className="absolute right-3 top-1 text-xs text-white/40">
              {`${comment.length}/1000`}
            </p>
          </div>
          <div className="flex justify-between items-center px-3 pt-4">
            <div className="flex flex-col items-baseline gap-3">
              <RateStar setRatingStar={setRatingStar} />
              {/* Image upload section */}
              <div className="flex items-center gap-2">
                <input
                  type="file"
                  ref={fileInputRef}
                  accept="image/*"
                  multiple
                  className="hidden"
                  onChange={handleImageSelect}
                  disabled={selectedImages.length >= 3}
                />
                <button
                  type="button"
                  onClick={() => fileInputRef.current?.click()}
                  disabled={selectedImages.length >= 3}
                  className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                    selectedImages.length >= 3 
                      ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      : "bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer"
                  }`}
                >
                  <IoMdImages size={18} />
                  <span>Thêm ảnh ({selectedImages.length}/3)</span>
                </button>
              </div>
            </div>
            <div
              className={`flex items-center justify-center gap-3 px-4 py-2 rounded-lg transition-all ${
                user && comment.length > 0 && !isUploading
                  ? "cursor-pointer bg-[#f84565] hover:bg-[#ff5a77] text-white"
                  : "bg-zinc-700 text-white/50 cursor-not-allowed"
              }`}
              onClick={!isUploading ? handleCreateNewReview : undefined}
            >
              {isUploading ? (
                <>
                  <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                  <p className="select-none">Đang gửi...</p>
                </>
              ) : (
                <>
                  <p className="select-none">Gửi</p>
                  <LuSendHorizontal />
                </>
              )}
            </div>
          </div>

          {/* Image previews */}
          {previewUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 px-3 pt-3">
              {previewUrls.map((url, index) => (
                <div key={index} className="relative group">
                  <Image
                    src={url}
                    alt={`Preview ${index + 1}`}
                    width={80}
                    height={80}
                    className="w-20 h-20 object-cover rounded-lg border border-white/10"
                  />
                  <button
                    type="button"
                    onClick={() => removeImage(index)}
                    className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity"
                  >
                    <IoMdClose size={14} className="text-white" />
                  </button>
                </div>
              ))}
            </div>
          )}
        </div>

        <div className="w-full items-center flex flex-col gap-4">
          {movieReviewList?.length === 0 ? (
            <div className="w-full mt-2 h-[20vh] rounded-xl flex flex-col text-white/30 items-center bg-white/5 justify-center">
              <TfiCommentAlt size={25} />
              <p>Chưa có bình luận nào</p>
            </div>
          ) : (
            movieReviewList?.map((review) => (
              <CommentCard
                comment={review.comment}
                commentTime={review.rating_at}
                name={review.user_name}
                userAvatar={review.user_avatar}
                ratingStar={review.rating_star}
                imageUrls={review.image_urls}
                key={review.rating_id}
              />
            ))
          )}
        </div>
      </div>

      {showLoginModal && (
        <LoginModal
          isOpen={showLoginModal}
          onClose={() => setShowLoginModal(false)}
          onSuccess={handleLoginSuccess}
        />
      )}
    </>
  );
};

interface CommentCardProps {
  name: string;
  userAvatar?: string;
  commentTime: string;
  comment: string;
  ratingStar: number;
  imageUrls?: string[];
}

const CommentCard = (props: CommentCardProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  // Check if avatar URL is valid
  const isValidAvatarUrl = (url?: string) => {
    if (!url) return false;
    return url.startsWith("http://") || url.startsWith("https://");
  };

  // Get initials from name for avatar fallback
  const getInitials = (name: string) => {
    if (!name) return "U";
    const words = name.trim().split(" ");
    if (words.length === 1) return words[0].charAt(0).toUpperCase();
    return (words[0].charAt(0) + words[words.length - 1].charAt(0)).toUpperCase();
  };

  // Format date
  const formatDate = (dateString: string) => {
    try {
      const date = new Date(dateString);
      return date.toLocaleDateString("vi-VN", {
        day: "2-digit",
        month: "2-digit", 
        year: "numeric",
        hour: "2-digit",
        minute: "2-digit",
      });
    } catch {
      return dateString;
    }
  };

  // Render stars
  const renderStars = (rating: number) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-3.5 h-3.5 ${
              star <= rating ? "text-yellow-400" : "text-zinc-600"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
          >
            <path d="M9.049 2.927c.3-.921 1.603-.921 1.902 0l1.07 3.292a1 1 0 00.95.69h3.462c.969 0 1.371 1.24.588 1.81l-2.8 2.034a1 1 0 00-.364 1.118l1.07 3.292c.3.921-.755 1.688-1.54 1.118l-2.8-2.034a1 1 0 00-1.175 0l-2.8 2.034c-.784.57-1.838-.197-1.539-1.118l1.07-3.292a1 1 0 00-.364-1.118L2.98 8.72c-.783-.57-.38-1.81.588-1.81h3.461a1 1 0 00.951-.69l1.07-3.292z" />
          </svg>
        ))}
      </div>
    );
  };

  return (
    <>
      <div className="flex w-full items-start gap-3 p-3 bg-zinc-800/50 rounded-xl border border-white/5">
        <div className="flex-shrink-0">
          <Avatar className="w-10 h-10">
            {isValidAvatarUrl(props.userAvatar) ? (
              <AvatarImage src={props.userAvatar} alt={props.name} />
            ) : null}
            <AvatarFallback className="bg-gradient-to-br from-[#f84565] to-[#ff6b8a] text-white text-sm font-semibold">
              {getInitials(props.name)}
            </AvatarFallback>
          </Avatar>
        </div>
        <div className="flex flex-col flex-1 gap-1.5">
          <div className="flex items-center gap-2 flex-wrap">
            <h1 className="font-semibold text-sm text-white">{props.name}</h1>
            {renderStars(props.ratingStar)}
            <p className="text-xs text-zinc-500">{formatDate(props.commentTime)}</p>
          </div>
          <p className="text-sm text-zinc-300 leading-relaxed">{props.comment}</p>
          
          {/* Review Images */}
          {props.imageUrls && props.imageUrls.length > 0 && (
            <div className="flex flex-wrap gap-2 mt-2">
              {props.imageUrls.map((url, index) => (
                <div 
                  key={index} 
                  className="cursor-pointer hover:opacity-80 transition-opacity"
                  onClick={() => setSelectedImage(url)}
                >
                  <Image
                    src={url}
                    alt={`Review image ${index + 1}`}
                    width={100}
                    height={100}
                    className="w-24 h-24 object-cover rounded-lg border border-white/10"
                  />
                </div>
              ))}
            </div>
          )}
        </div>
      </div>

      {/* Image Lightbox */}
      {selectedImage && (
        <div 
          className="fixed inset-0 z-50 bg-black/90 flex items-center justify-center p-4"
          onClick={() => setSelectedImage(null)}
        >
          <button
            className="absolute top-4 right-4 w-10 h-10 bg-white/10 hover:bg-white/20 rounded-full flex items-center justify-center transition-colors"
            onClick={() => setSelectedImage(null)}
          >
            <IoMdClose size={24} className="text-white" />
          </button>
          <Image
            src={selectedImage}
            alt="Full size image"
            width={800}
            height={600}
            className="max-w-full max-h-[90vh] object-contain rounded-lg"
            onClick={(e) => e.stopPropagation()}
          />
        </div>
      )}
    </>
  );
};

export default Comment;
