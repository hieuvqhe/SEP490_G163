"use client";

import React, { useState, useRef } from "react";
import { Textarea } from "@/components/ui/textarea";
import { LuSendHorizontal } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import LoginModal from "@/components/LoginModal";
import { useCreateReview, useMovieReviews, useUpdateReview, useDeleteReview, useMyReview } from "@/apis/movie.reviews.api";
import { TfiCommentAlt } from "react-icons/tfi";
import { IoMdImages, IoMdClose } from "react-icons/io";
import { FiEdit2, FiTrash2, FiMoreVertical } from "react-icons/fi";
import RateStar from "./RateStar";
import { useToast } from "@/components/ToastProvider";
import { useUploadToCloudinary } from "@/apis/cloudinary.api";
import Image from "next/image";
import { useQueryClient } from "@tanstack/react-query";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
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

interface CommentProps {
  movieId?: number;
}

const Comment = ({ movieId }: CommentProps) => {
  const { showToast } = useToast();
  const { user } = useAuthStore();
  const queryClient = useQueryClient();
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
  const updateReviewMutate = useUpdateReview();
  const deleteReviewMutate = useDeleteReview();
  const uploadToCloudinary = useUploadToCloudinary();

  const [page, setPage] = useState<number>(1);

  // State for edit mode
  const [editingReviewId, setEditingReviewId] = useState<number | null>(null);
  const [editComment, setEditComment] = useState<string>("");
  const [editRatingStar, setEditRatingStar] = useState<number>(0);
  const [editExistingImages, setEditExistingImages] = useState<string[]>([]); // Existing image URLs
  const [editNewImages, setEditNewImages] = useState<File[]>([]); // New images to upload
  const [editNewPreviewUrls, setEditNewPreviewUrls] = useState<string[]>([]); // Preview URLs for new images
  const [isEditUploading, setIsEditUploading] = useState(false);
  const editFileInputRef = useRef<HTMLInputElement>(null);
  const [deleteConfirmOpen, setDeleteConfirmOpen] = useState(false);

  const { data: movieReviewRes } = useMovieReviews({
    movieId: movieId ?? 0,
    params: {
      limit: 5,
      page: page,
      sort: "newest",
    },
  });
  const movieReviewList = movieReviewRes?.result.items;

  // Check if user has already reviewed this movie
  const { data: myReviewRes } = useMyReview(movieId ?? 0, !!user && !!movieId);
  const hasUserReviewed = !!myReviewRes?.result?.review;

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
            // Invalidate queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["movie-reviews", movieId] });
            queryClient.invalidateQueries({ queryKey: ["rating-summary", movieId] });
            queryClient.invalidateQueries({ queryKey: ["my-review", movieId] });
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

  // Handle update review
  const handleUpdateReview = async () => {
    if (!user || editComment.length === 0 || editRatingStar === 0) {
      showToast("Vui lòng điền đầy đủ thông tin", "", "warning");
      return;
    }

    setIsEditUploading(true);

    try {
      // Upload new images to Cloudinary
      let newImageUrls: string[] = [];
      if (editNewImages.length > 0) {
        const uploadPromises = editNewImages.map(file => 
          uploadToCloudinary.mutateAsync(file)
        );
        const results = await Promise.all(uploadPromises);
        newImageUrls = results.map(res => res.secure_url);
      }

      // Combine existing images with new uploaded images
      const allImageUrls = [...editExistingImages, ...newImageUrls];

      updateReviewMutate.mutate(
        {
          movieId: movieId ?? 0,
          body: {
            comment: editComment,
            rating_star: editRatingStar,
            image_urls: allImageUrls.length > 0 ? allImageUrls : undefined,
          },
        },
        {
          onSuccess: (res) => {
            showToast(res.message || "Cập nhật đánh giá thành công", "", "success");
            // Reset edit state
            setEditingReviewId(null);
            setEditComment("");
            setEditRatingStar(0);
            setEditExistingImages([]);
            setEditNewImages([]);
            editNewPreviewUrls.forEach(url => URL.revokeObjectURL(url));
            setEditNewPreviewUrls([]);
            // Invalidate queries to refresh the list
            queryClient.invalidateQueries({ queryKey: ["movie-reviews", movieId] });
            queryClient.invalidateQueries({ queryKey: ["rating-summary", movieId] });
          },
          onError: (error) => {
            showToast(error.message || "Cập nhật thất bại", "", "error");
          },
        }
      );
    } catch (error) {
      showToast("Lỗi khi upload ảnh", "", "error");
      console.error("Upload error:", error);
    } finally {
      setIsEditUploading(false);
    }
  };

  // Handle delete review
  const handleDeleteReview = () => {
    if (!movieId) return;

    deleteReviewMutate.mutate(movieId, {
      onSuccess: () => {
        showToast("Đã xóa đánh giá", "", "success");
        setDeleteConfirmOpen(false);
        // Invalidate queries to refresh the list
        queryClient.invalidateQueries({ queryKey: ["movie-reviews", movieId] });
        queryClient.invalidateQueries({ queryKey: ["rating-summary", movieId] });
        queryClient.invalidateQueries({ queryKey: ["my-review", movieId] });
      },
      onError: (error) => {
        showToast(error.message || "Xóa thất bại", "", "error");
      },
    });
  };

  // Start editing a review
  const handleStartEdit = (review: { rating_id: number; comment: string; rating_star: number; image_urls?: string[] }) => {
    setEditingReviewId(review.rating_id);
    setEditComment(review.comment);
    setEditRatingStar(review.rating_star);
    setEditExistingImages(review.image_urls || []);
    setEditNewImages([]);
    setEditNewPreviewUrls([]);
  };

  // Cancel editing
  const handleCancelEdit = () => {
    setEditingReviewId(null);
    setEditComment("");
    setEditRatingStar(0);
    setEditExistingImages([]);
    setEditNewImages([]);
    editNewPreviewUrls.forEach(url => URL.revokeObjectURL(url));
    setEditNewPreviewUrls([]);
  };

  // Handle edit image selection
  const handleEditImageSelect = (e: React.ChangeEvent<HTMLInputElement>) => {
    const files = e.target.files;
    if (!files) return;

    const totalImages = editExistingImages.length + editNewImages.length;
    const newFiles = Array.from(files).slice(0, 3 - totalImages); // Max 3 images total
    if (newFiles.length === 0) {
      showToast("Tối đa 3 ảnh cho mỗi đánh giá", "", "warning");
      return;
    }

    // Validate file types
    const validFiles = newFiles.filter(file => 
      file.type.startsWith("image/") && file.size <= 5 * 1024 * 1024 // Max 5MB
    );

    if (validFiles.length !== newFiles.length) {
      showToast("Chỉ chấp nhận ảnh và tối đa 5MB mỗi ảnh", "", "warning");
    }

    setEditNewImages(prev => [...prev, ...validFiles]);
    
    // Create preview URLs
    validFiles.forEach(file => {
      const url = URL.createObjectURL(file);
      setEditNewPreviewUrls(prev => [...prev, url]);
    });

    // Reset input
    if (editFileInputRef.current) {
      editFileInputRef.current.value = "";
    }
  };

  // Remove existing image from edit
  const handleRemoveExistingImage = (index: number) => {
    setEditExistingImages(prev => prev.filter((_, i) => i !== index));
  };

  // Remove new image from edit
  const handleRemoveNewImage = (index: number) => {
    URL.revokeObjectURL(editNewPreviewUrls[index]);
    setEditNewImages(prev => prev.filter((_, i) => i !== index));
    setEditNewPreviewUrls(prev => prev.filter((_, i) => i !== index));
  };

  return (
    <>
      <div className="w-full flex flex-col gap-4 items-baseline justify-center">
        {/* Only show review form if user hasn't reviewed yet */}
        {!hasUserReviewed && (
          <>
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
          </>
        )}

        {/* Show message if user has already reviewed */}
        {hasUserReviewed && user && (
          <div className="w-full bg-zinc-800/50 px-4 py-3 border border-white/10 rounded-xl">
            <p className="text-zinc-400 text-sm">
              ✅ Bạn đã đánh giá phim này. Bạn có thể chỉnh sửa hoặc xóa đánh giá của mình bên dưới.
            </p>
          </div>
        )}

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
                ratingId={review.rating_id}
                userId={review.user_id}
                currentUserId={user?.userId}
                isEditing={editingReviewId === review.rating_id}
                editComment={editComment}
                editRatingStar={editRatingStar}
                setEditComment={setEditComment}
                setEditRatingStar={setEditRatingStar}
                onStartEdit={() => handleStartEdit(review)}
                onCancelEdit={handleCancelEdit}
                onSaveEdit={handleUpdateReview}
                onDelete={() => setDeleteConfirmOpen(true)}
                isUpdating={updateReviewMutate.isPending || isEditUploading}
                // Edit images props
                editExistingImages={editExistingImages}
                editNewPreviewUrls={editNewPreviewUrls}
                onRemoveExistingImage={handleRemoveExistingImage}
                onRemoveNewImage={handleRemoveNewImage}
                onEditImageSelect={handleEditImageSelect}
                editFileInputRef={editFileInputRef}
              />
            ))
          )}
        </div>
      </div>

      {/* Delete Confirmation Dialog */}
      <AlertDialog open={deleteConfirmOpen} onOpenChange={setDeleteConfirmOpen}>
        <AlertDialogContent className="bg-zinc-900 border-zinc-800">
          <AlertDialogHeader>
            <AlertDialogTitle className="text-white">Xác nhận xóa đánh giá</AlertDialogTitle>
            <AlertDialogDescription className="text-zinc-400">
              Bạn có chắc chắn muốn xóa đánh giá này? Hành động này không thể hoàn tác.
            </AlertDialogDescription>
          </AlertDialogHeader>
          <AlertDialogFooter>
            <AlertDialogCancel className="bg-zinc-800 border-zinc-700 text-white hover:bg-zinc-700">
              Hủy
            </AlertDialogCancel>
            <AlertDialogAction
              onClick={handleDeleteReview}
              className="bg-red-600 hover:bg-red-700 text-white"
              disabled={deleteReviewMutate.isPending}
            >
              {deleteReviewMutate.isPending ? "Đang xóa..." : "Xóa"}
            </AlertDialogAction>
          </AlertDialogFooter>
        </AlertDialogContent>
      </AlertDialog>

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
  ratingId: number;
  userId: number;
  currentUserId?: number;
  isEditing: boolean;
  editComment: string;
  editRatingStar: number;
  setEditComment: (value: string) => void;
  setEditRatingStar: (value: number) => void;
  onStartEdit: () => void;
  onCancelEdit: () => void;
  onSaveEdit: () => void;
  onDelete: () => void;
  isUpdating: boolean;
  // Edit images props
  editExistingImages: string[];
  editNewPreviewUrls: string[];
  onRemoveExistingImage: (index: number) => void;
  onRemoveNewImage: (index: number) => void;
  onEditImageSelect: (e: React.ChangeEvent<HTMLInputElement>) => void;
  editFileInputRef: React.RefObject<HTMLInputElement | null>;
}

const CommentCard = (props: CommentCardProps) => {
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const isOwner = props.currentUserId === props.userId;

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

  // Render editable stars
  const renderEditableStars = (rating: number, onRatingChange: (value: number) => void) => {
    return (
      <div className="flex items-center gap-0.5">
        {[1, 2, 3, 4, 5].map((star) => (
          <svg
            key={star}
            className={`w-5 h-5 cursor-pointer transition-colors ${
              star <= rating ? "text-yellow-400" : "text-zinc-600 hover:text-yellow-300"
            }`}
            fill="currentColor"
            viewBox="0 0 20 20"
            onClick={() => onRatingChange(star)}
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
          <div className="flex items-center justify-between">
            <div className="flex items-center gap-2 flex-wrap">
              <h1 className="font-semibold text-sm text-white">{props.name}</h1>
              {!props.isEditing && renderStars(props.ratingStar)}
              <p className="text-xs text-zinc-500">{formatDate(props.commentTime)}</p>
            </div>
            
            {/* Edit/Delete Menu - Only show for owner */}
            {isOwner && !props.isEditing && (
              <DropdownMenu>
                <DropdownMenuTrigger asChild>
                  <button className="p-1 hover:bg-zinc-700 rounded transition-colors">
                    <FiMoreVertical size={16} className="text-zinc-400" />
                  </button>
                </DropdownMenuTrigger>
                <DropdownMenuContent align="end" className="bg-zinc-800 border-zinc-700">
                  <DropdownMenuItem 
                    onClick={props.onStartEdit}
                    className="text-zinc-200 hover:bg-zinc-700 cursor-pointer"
                  >
                    <FiEdit2 className="mr-2" size={14} />
                    Chỉnh sửa
                  </DropdownMenuItem>
                  <DropdownMenuItem 
                    onClick={props.onDelete}
                    className="text-red-400 hover:bg-zinc-700 cursor-pointer"
                  >
                    <FiTrash2 className="mr-2" size={14} />
                    Xóa
                  </DropdownMenuItem>
                </DropdownMenuContent>
              </DropdownMenu>
            )}
          </div>

          {/* Edit Mode */}
          {props.isEditing ? (
            <div className="space-y-3">
              <div className="flex items-center gap-2">
                <span className="text-sm text-zinc-400">Đánh giá:</span>
                {renderEditableStars(props.editRatingStar, props.setEditRatingStar)}
              </div>
              <Textarea
                value={props.editComment}
                onChange={(e) => props.setEditComment(e.target.value)}
                className="w-full min-h-[80px] bg-zinc-900 border-zinc-700 text-white rounded-lg"
                placeholder="Nhập bình luận..."
                maxLength={1000}
              />

              {/* Edit Images Section */}
              <div className="space-y-2">
                <div className="flex items-center gap-2">
                  <input
                    type="file"
                    ref={props.editFileInputRef}
                    accept="image/*"
                    multiple
                    className="hidden"
                    onChange={props.onEditImageSelect}
                    disabled={props.editExistingImages.length + props.editNewPreviewUrls.length >= 3}
                  />
                  <button
                    type="button"
                    onClick={() => props.editFileInputRef.current?.click()}
                    disabled={props.editExistingImages.length + props.editNewPreviewUrls.length >= 3 || props.isUpdating}
                    className={`flex items-center gap-1.5 px-3 py-1.5 rounded-lg text-sm transition-all ${
                      props.editExistingImages.length + props.editNewPreviewUrls.length >= 3 || props.isUpdating
                        ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                        : "bg-zinc-700 hover:bg-zinc-600 text-white cursor-pointer"
                    }`}
                  >
                    <IoMdImages size={18} />
                    <span>Thêm ảnh ({props.editExistingImages.length + props.editNewPreviewUrls.length}/3)</span>
                  </button>
                </div>

                {/* Display existing and new images */}
                {(props.editExistingImages.length > 0 || props.editNewPreviewUrls.length > 0) && (
                  <div className="flex flex-wrap gap-2">
                    {/* Existing images */}
                    {props.editExistingImages.map((url, index) => (
                      <div key={`existing-${index}`} className="relative group">
                        <Image
                          src={url}
                          alt={`Existing image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg border border-white/10"
                        />
                        <button
                          type="button"
                          onClick={() => props.onRemoveExistingImage(index)}
                          disabled={props.isUpdating}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <IoMdClose size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                    {/* New images */}
                    {props.editNewPreviewUrls.map((url, index) => (
                      <div key={`new-${index}`} className="relative group">
                        <Image
                          src={url}
                          alt={`New image ${index + 1}`}
                          width={80}
                          height={80}
                          className="w-20 h-20 object-cover rounded-lg border border-green-500/50"
                        />
                        <span className="absolute top-1 left-1 text-[10px] bg-green-500 text-white px-1 rounded">Mới</span>
                        <button
                          type="button"
                          onClick={() => props.onRemoveNewImage(index)}
                          disabled={props.isUpdating}
                          className="absolute -top-2 -right-2 w-5 h-5 bg-red-500 rounded-full flex items-center justify-center opacity-0 group-hover:opacity-100 transition-opacity disabled:opacity-50"
                        >
                          <IoMdClose size={14} className="text-white" />
                        </button>
                      </div>
                    ))}
                  </div>
                )}
              </div>

              <div className="flex items-center gap-2">
                <button
                  onClick={props.onSaveEdit}
                  disabled={props.isUpdating || !props.editComment || props.editRatingStar === 0}
                  className={`px-4 py-1.5 rounded-lg text-sm font-medium transition-all ${
                    props.isUpdating || !props.editComment || props.editRatingStar === 0
                      ? "bg-zinc-700 text-zinc-500 cursor-not-allowed"
                      : "bg-[#f84565] hover:bg-[#ff5a77] text-white"
                  }`}
                >
                  {props.isUpdating ? "Đang lưu..." : "Lưu"}
                </button>
                <button
                  onClick={props.onCancelEdit}
                  disabled={props.isUpdating}
                  className="px-4 py-1.5 rounded-lg text-sm font-medium bg-zinc-700 hover:bg-zinc-600 text-white transition-all"
                >
                  Hủy
                </button>
              </div>
            </div>
          ) : (
            <>
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
            </>
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
