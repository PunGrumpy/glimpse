type Puff = [cx: number, cy: number, r: number];

// Each cloud type is a cluster of puffs over a flat base, in a 200×80 box.
const CLOUD_PUFFS: Record<"cumulus" | "bank" | "wisp", Puff[]> = {
  bank: [
    [30, 62, 14],
    [58, 54, 20],
    [90, 50, 22],
    [124, 52, 20],
    [154, 58, 16],
    [178, 64, 10],
  ],
  cumulus: [
    [52, 56, 22],
    [78, 42, 28],
    [110, 32, 30],
    [140, 46, 24],
    [162, 58, 16],
    [98, 58, 24],
  ],
  wisp: [
    [40, 64, 10],
    [66, 60, 14],
    [96, 58, 15],
    [128, 60, 12],
    [156, 64, 9],
  ],
};

const CloudSilhouette = ({
  variant,
}: {
  variant: keyof typeof CLOUD_PUFFS;
}) => {
  const puffs = CLOUD_PUFFS[variant];
  const body = (
    <>
      {puffs.map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
      <rect x="22" y="58" width="160" height="16" rx="8" />
    </>
  );
  return (
    <svg
      viewBox="0 0 200 80"
      className="block size-full overflow-visible"
      aria-hidden="true"
    >
      <defs>
        <linearGradient
          id={`cloud-fill-${variant}`}
          x1="0"
          y1="0"
          x2="0"
          y2="1"
        >
          <stop offset="0" stopColor="#ffffff" />
          <stop offset="0.55" stopColor="#fdf3ef" />
          <stop offset="1" stopColor="#f2cfc6" />
        </linearGradient>
        <filter id="cloud-soft" x="-20%" y="-20%" width="140%" height="140%">
          <feGaussianBlur stdDeviation="1.6" />
        </filter>
        <filter id="cloud-shadow" x="-20%" y="-20%" width="140%" height="160%">
          <feGaussianBlur stdDeviation="5" />
        </filter>
      </defs>
      <g
        fill="#b98890"
        opacity="0.35"
        transform="translate(0 6)"
        filter="url(#cloud-shadow)"
      >
        {body}
      </g>
      <g fill={`url(#cloud-fill-${variant})`} filter="url(#cloud-soft)">
        {body}
      </g>
    </svg>
  );
};

const CLOUDS = [
  {
    bob: 23,
    delay: -100,
    drift: 280,
    opacity: 0.62,
    top: "4%",
    variant: "wisp",
    width: 300,
  },
  {
    bob: 26,
    delay: -30,
    drift: 200,
    opacity: 0.95,
    top: "12%",
    variant: "cumulus",
    width: 420,
  },
  {
    bob: 21,
    delay: -150,
    drift: 240,
    opacity: 0.8,
    top: "28%",
    variant: "bank",
    width: 380,
  },
  {
    bob: 27,
    delay: -115,
    drift: 175,
    opacity: 0.97,
    top: "43%",
    variant: "cumulus",
    width: 560,
  },
  {
    bob: 29,
    delay: -60,
    drift: 185,
    opacity: 0.94,
    top: "56%",
    variant: "bank",
    width: 540,
  },
  {
    bob: 24,
    delay: -190,
    drift: 230,
    opacity: 0.82,
    top: "63%",
    variant: "wisp",
    width: 430,
  },
] as const;

export const Clouds = () => (
  <div className="cloud-track" aria-hidden="true">
    {CLOUDS.map((c, i) => (
      <div
        // biome-ignore lint/suspicious/noArrayIndexKey: static list
        key={i}
        className="cloud"
        style={{
          animationDelay: `${c.delay}s`,
          animationDuration: `${c.drift}s`,
          height: c.width * 0.4,
          opacity: c.opacity,
          top: c.top,
          width: c.width,
        }}
      >
        <div
          className="cloud-bob size-full"
          style={{ animationDuration: `${c.bob}s` }}
        >
          <CloudSilhouette variant={c.variant} />
        </div>
      </div>
    ))}
  </div>
);
