import React from "react";
import { Skeleton } from "@/components/ui/skeleton";

const MovieCardSkeleton = () => {
  return (
    <div className="relative rounded-xl w-full">
      <div className="aspect-[2/3] w-full relative">
        <Skeleton className="w-full h-full rounded-xl" />

        <div className="absolute top-2 right-2">
          <Skeleton className="w-12 h-6 rounded-md" />
        </div>
      </div>

      <div className="p-3 space-y-2">
        <Skeleton className="h-4 w-3/4" />
        <Skeleton className="h-3 w-1/2" />
      </div>
    </div>
  );
};

export default MovieCardSkeleton;
