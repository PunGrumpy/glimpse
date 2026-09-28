import { BRAND_ORANGE, MARK_PARTS } from "@/lib/brand";

/** The Glimpse mark: a sun peeking over a petal-shaped eyelid. */
export const BrandMark = ({
  size = 28,
  color = BRAND_ORANGE,
  className,
}: {
  size?: number;
  color?: string;
  className?: string;
}) => (
  <svg
    width={size}
    height={size}
    viewBox="0 0 28 28"
    fill={color}
    className={className}
    aria-hidden="true"
  >
    {MARK_PARTS.map(({ key, d, transform }) => (
      <path key={key} d={d} transform={transform} />
    ))}
  </svg>
);
