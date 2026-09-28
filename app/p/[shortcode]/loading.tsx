import { Skeleton } from "@/components/ui/skeleton";

const PostLoading = () => (
  <div
    className="mx-auto grid max-w-6xl gap-8 px-4 py-10 sm:px-6 lg:grid-cols-[minmax(0,1fr)_360px] lg:py-14"
    aria-busy="true"
  >
    <output className="sr-only">Loading post</output>
    <Skeleton className="aspect-square w-full rounded-2xl" />
    <div className="flex flex-col gap-4">
      <div className="flex items-center gap-3">
        <Skeleton className="size-11 rounded-full" />
        <Skeleton className="h-4 w-32" />
      </div>
      <Skeleton className="h-16 w-full rounded-xl" />
      <Skeleton className="h-4 w-full" />
      <Skeleton className="h-4 w-4/5" />
    </div>
  </div>
);

export default PostLoading;
