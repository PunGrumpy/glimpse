// The hero's drifting sunset clouds. Pure CSS motion (see `.cloud` in
// globals.css): calm by design, and paused for reduced motion.

type Puff = [cx: number, cy: number, r: number];
type CloudVariant = "cumulus" | "bank" | "wisp";

// Each cloud type is a cluster of puffs over a flat base, in a 200×80 box.
const CLOUD_PUFFS: Record<CloudVariant, Puff[]> = {
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

// Puffs this big or larger catch the light on top.
const HIGHLIGHT_MIN_RADIUS = 18;

const highlightsFor = (puffs: Puff[]): Puff[] =>
  puffs.flatMap(([cx, cy, r]) =>
    r >= HIGHLIGHT_MIN_RADIUS
      ? [[cx - r * 0.12, cy - r * 0.28, r * 0.62] satisfies Puff]
      : []
  );

const CLOUD_HIGHLIGHTS: Record<CloudVariant, Puff[]> = {
  bank: highlightsFor(CLOUD_PUFFS.bank),
  cumulus: highlightsFor(CLOUD_PUFFS.cumulus),
  wisp: highlightsFor(CLOUD_PUFFS.wisp),
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

// Clouds are drawn in a 200×80 box.
const ASPECT = 0.4;

// ---- Drawing ----

const CloudBody = ({ variant }: { variant: CloudVariant }) => (
  <>
    {CLOUD_PUFFS[variant].map(([cx, cy, r]) => (
      <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
    ))}
    <rect x="22" y="58" width="160" height="16" rx="8" />
  </>
);

/** The original cloud, with a softly lit crown. */
const CloudArt = ({ variant }: { variant: CloudVariant }) => (
  <svg
    viewBox="0 0 200 80"
    className="block size-full overflow-visible"
    aria-hidden="true"
  >
    <g
      fill="#b98890"
      opacity="0.35"
      transform="translate(0 6)"
      filter="url(#cloud-shadow)"
    >
      <CloudBody variant={variant} />
    </g>
    <g fill="url(#cloud-fill)" filter="url(#cloud-soft)">
      <CloudBody variant={variant} />
    </g>
    <g fill="#ffffff" opacity="0.5" filter="url(#cloud-glow)">
      {CLOUD_HIGHLIGHTS[variant].map(([cx, cy, r]) => (
        <circle key={`${cx}-${cy}`} cx={cx} cy={cy} r={r} />
      ))}
    </g>
  </svg>
);

/** Shared gradient and filters, defined once for every cloud. */
const SkyDefinitions = () => (
  <svg width="0" height="0" className="absolute" aria-hidden="true">
    <defs>
      <linearGradient id="cloud-fill" x1="0" y1="0" x2="0" y2="1">
        <stop offset="0" stopColor="#ffffff" />
        <stop offset="0.55" stopColor="#fdf3ef" />
        <stop offset="1" stopColor="#f2cfc6" />
      </linearGradient>
      <filter id="cloud-soft" x="-20%" y="-20%" width="140%" height="140%">
        <feGaussianBlur stdDeviation="1.6" />
      </filter>
      <filter id="cloud-glow" x="-30%" y="-30%" width="160%" height="160%">
        <feGaussianBlur stdDeviation="3.5" />
      </filter>
      <filter id="cloud-shadow" x="-20%" y="-20%" width="140%" height="160%">
        <feGaussianBlur stdDeviation="5" />
      </filter>
    </defs>
  </svg>
);

export const Clouds = () => (
  <div className="cloud-track" aria-hidden="true">
    <SkyDefinitions />
    {CLOUDS.map((cloud) => (
      <div
        key={`${cloud.variant}-${cloud.top}`}
        className="cloud"
        style={{
          animationDelay: `${cloud.delay}s`,
          animationDuration: `${cloud.drift}s`,
          height: cloud.width * ASPECT,
          opacity: cloud.opacity,
          top: cloud.top,
          width: cloud.width,
        }}
      >
        <div
          className="cloud-bob size-full"
          style={{ animationDuration: `${cloud.bob}s` }}
        >
          <CloudArt variant={cloud.variant} />
        </div>
      </div>
    ))}
  </div>
);
