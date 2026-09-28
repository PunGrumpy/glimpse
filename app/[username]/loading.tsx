import { Skeleton } from "@/components/ui/skeleton";

const GRID_PLACEHOLDERS = Array.from(
  { length: 9 },
  (_, index) => `tile-${index}`
);

const ProfileLoading = () => (
  <div
    className="mx-auto max-w-4xl px-4 py-12 sm:px-6 sm:py-16"
    aria-busy="true"
  >
    <output className="sr-only">Loading profile</output>
    <div className="flex flex-col items-center gap-6 sm:flex-row sm:items-start sm:gap-10">
      <Skeleton className="size-28 rounded-full sm:size-36" />
      <div className="flex w-full flex-1 flex-col items-center gap-3 pt-2 sm:items-start">
        <Skeleton className="h-7 w-48" />
        <Skeleton className="h-4 w-32" />
        <Skeleton className="mt-3 h-4 w-64" />
        <Skeleton className="h-4 w-80 max-w-full" />
      </div>
    </div>
    <div className="border-line/70 mt-12 grid grid-cols-3 gap-1 border-t pt-6 sm:gap-2">
      {GRID_PLACEHOLDERS.map((key) => (
        <Skeleton
          key={key}
          className="aspect-square rounded-md sm:rounded-xl"
        />
      ))}
    </div>
  </div>
);

export default ProfileLoading;
