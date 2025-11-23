"use client";

import React, { useState } from "react";
import { Textarea } from "@/components/ui/textarea";
import { LuSendHorizontal } from "react-icons/lu";
import { Avatar, AvatarFallback, AvatarImage } from "@/components/ui/avatar";
import { useAuthStore } from "@/store/authStore";
import LoginModal from "@/components/LoginModal";
import { useCreateReview, useMovieReviews } from "@/apis/movie.reviews.api";
import { TfiCommentAlt } from "react-icons/tfi";
import RateStar from "./RateStar";
import { useToast } from "@/hooks/use-toast";

const Comment = () => {
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

    // Tokens đã được set trong useLogin hook
    // Redirect ngay lập tức dựa trên role từ response
    const role = data.result.role;
    console.log("Redirecting with role from response:", role);

    if (!role) {
      window.location.href = "/";
      return;
    }

    const roleLower = role.toLowerCase();
    let targetPath = "/";

    switch (roleLower) {
      case "admin":
        targetPath = "/admin";
        break;
      case "partner":
        targetPath = "/partner";
        break;
      case "manager":
        targetPath = "/manager";
        break;
      case "user":
      default:
        targetPath = "/";
        break;
    }

    console.log("Redirecting to:", targetPath);
    window.location.href = targetPath;
  };
  const [ratingStar, setRatingStar] = useState<number>(0);
  const [comment, setComment] = useState<string>("");
  const createReviewMutate = useCreateReview();

  const [page, setPage] = useState<number>(1);

  const movieId = Number(localStorage.getItem("movieId"));
  const { data: movieReviewRes } = useMovieReviews({
    movieId: movieId,
    params: {
      limit: 5,
      page: page,
      sort: "newest",
    },
  });
  const movieReviewList = movieReviewRes?.result.items;

  const { toast } = useToast();

  const handleCreateNewReview = () => {
    createReviewMutate.mutate(
      {
        movieId: movieId,
        body: {
          comment: comment,
          rating_star: ratingStar,
        },
      },
      {
        onSuccess: (res) =>
          toast({
            variant: "destructive",
            title: res.message,
            description: res.message,
          }),
        onError: (res) =>
          // toast({
          //   title: "Xảy ra lỗi!",
          //   description: res.message,
          // }),
          console.log(res.message),
      }
    );
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
              {/* <div className="flex items-center gap-3">
                <Checkbox className="select-none cursor-pointer" id="terms" />
                <Label htmlFor="terms" className="select-none cursor-pointer">
                  Tiết lộ ?
                </Label>
              </div> */}
            </div>
            <div
              className={`flex items-center justify-center gap-3 ${
                user || comment.length === 0
                  ? "cursor-pointer hover:opacity-70 transition-opacity duration-200"
                  : "text-white/70 disabled"
              }`}
              onClick={handleCreateNewReview}
            >
              <p className="select-none">Gửi</p>
              <LuSendHorizontal />
            </div>
          </div>
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
                imageUrl={review.user_name}
                name={review.user_name}
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
  imageUrl: string;
  name: string;
  commentTime: string;
  comment: string;
}

const CommentCard = (props: CommentCardProps) => {
  return (
    <div className="flex w-full items-center justify-baseline gap-3">
      <div>
        <Avatar>
          <AvatarImage src={props.imageUrl} />
          <AvatarFallback>{props.name}</AvatarFallback>
        </Avatar>
      </div>
      <div className="flex flex-col items-center gap-3">
        <div className="flex items-center gap-3">
          <h1 className="font-semibold text-md">{props.name}</h1>
          <p className="text-xs text-zinc-600">{props.commentTime}</p>
        </div>
        <div>
          <p>{props.comment}</p>
        </div>
      </div>
    </div>
  );
};

export default Comment;
