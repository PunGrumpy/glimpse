import { cn } from "@/lib/utils";

export const VerifiedBadge = ({
  className = "size-4",
}: {
  className?: string;
}) => (
  <span className={cn("inline-flex shrink-0", className)}>
    <svg viewBox="0 0 24 24" className="size-full" aria-hidden="true">
      <path
        fill="#3897f0"
        d="M12 1.5l2.6 1.9 3.2-.1 1 3 2.6 1.9-1 3.1 1 3.1-2.6 1.9-1 3-3.2-.1L12 22.5l-2.6-1.9-3.2.1-1-3-2.6-1.9 1-3.1-1-3.1 2.6-1.9 1-3 3.2.1z"
      />
      <path
        fill="none"
        stroke="#fff"
        strokeWidth="2"
        strokeLinecap="round"
        strokeLinejoin="round"
        d="m8 12.2 2.7 2.6L16.2 9.4"
      />
    </svg>
    <span className="sr-only">Verified</span>
  </span>
);
