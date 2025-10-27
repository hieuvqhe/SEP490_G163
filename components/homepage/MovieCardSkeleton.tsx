import { Skeleton } from "@/components/ui/skeleton"

export const MovieCardSkeleton = () => {
  return (
    <div
      className="relative overflow-hidden rounded-2xl sm:rounded-3xl 
      bg-zinc-800 [box-shadow:var(--shadow-m)] w-full font-space-grotesk p-2 sm:p-2.5"
    >
      {/* Image Skeleton */}
      <div className="relative">
        <Skeleton className="w-full aspect-square rounded-xl sm:rounded-2xl bg-zinc-700" />

        <div className="absolute top-2 right-2 sm:top-4 sm:right-4">
          <Skeleton className="w-6 h-6 sm:w-8 sm:h-8 rounded-full bg-zinc-700" />
        </div>
      </div>

      {/* Text Skeletons */}
      <div className="mt-3 sm:mt-4 px-1 sm:px-1.5 pb-2 sm:pb-3 pt-1 sm:pt-2 space-y-2">
        <div className="flex justify-between items-center">
          <Skeleton className="h-4 sm:h-6 w-3/4 rounded-md bg-zinc-700" />
          <Skeleton className="w-5 h-5 sm:w-6 sm:h-6 rounded-md bg-zinc-700" />
        </div>

        <Skeleton className="h-3 sm:h-4 w-1/2 rounded-md bg-zinc-700" />

        {/* Buy Button Skeleton */}
        <div className="mt-3 sm:mt-4">
          <Skeleton className="h-8 sm:h-10 w-full rounded-full bg-zinc-700" />
        </div>
      </div>
    </div>
  )
}