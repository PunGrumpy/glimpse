/**
 * Glimpse brand geometry, shared by the rendered mark and the SVG files
 * people copy or download from the logo's context menu.
 */

export const BRAND_ORANGE = "#ff4801";
export const BRAND_INK = "#171717";

// ---- Mark: a sun peeking over a petal-shaped eyelid (28×28 grid) ----

const MARK_SIZE = 28;
const CENTER_X = 14;
const HORIZON_Y = 17;
const RAY_GAP = 9.6;

/** [angle in degrees, length, half-width] for each ray, left to right. */
const RAYS = [
  [-70, 5.2, 1.5],
  [-35, 6.4, 1.7],
  [0, 7.4, 1.9],
  [35, 6.4, 1.7],
  [70, 5.2, 1.5],
] as const;

// A petal pointing up: tip nearest the sun, rounded outer end.
const petalPath = (length: number, halfWidth: number): string => {
  const tip = -RAY_GAP;
  const end = -RAY_GAP - length;
  const shoulder = -RAY_GAP - length * 0.2;
  const bulge = halfWidth * 1.1;
  return `M0 ${tip} C ${halfWidth} ${shoulder}, ${bulge} ${end}, 0 ${end} C ${-bulge} ${end}, ${-halfWidth} ${shoulder}, 0 ${tip} Z`;
};

export interface MarkPart {
  key: string;
  d: string;
  transform?: string;
}

export const MARK_PARTS: readonly MarkPart[] = [
  // Sun, its lower edge tucked behind the lid.
  {
    d: "M6.2 17.4a7.8 7.8 0 0 1 15.6 0c-2.4-1.3-5-1.9-7.8-1.9s-5.4.6-7.8 1.9z",
    key: "sun",
  },
  // Lower eyelid / horizon.
  {
    d: "M2.6 21.1c3.4-2.6 7.2-3.9 11.4-3.9s8 1.3 11.4 3.9c-3.3 3-7.1 4.5-11.4 4.5s-8.1-1.5-11.4-4.5z",
    key: "lid",
  },
  ...RAYS.map(([angle, length, halfWidth]) => ({
    d: petalPath(length, halfWidth),
    key: `ray${angle}`,
    transform: `translate(${CENTER_X} ${HORIZON_Y}) rotate(${angle})`,
  })),
];

const partsMarkup = (parts: readonly MarkPart[]): string =>
  parts
    .map(({ d, transform }) =>
      transform
        ? `<path d="${d}" transform="${transform}"/>`
        : `<path d="${d}"/>`
    )
    .join("");

// ---- Wordmark: "Glimpse" in Geist SemiBold, -0.03em, outlined at 100 units/em ----

const WORDMARK_PATH =
  "M36.70 1.60Q26.60 1.60 19.30-3.15Q12-7.90 8.15-16.20Q4.30-24.50 4.30-35.40Q4.30-46.10 8.25-54.50Q12.20-62.90 19.60-67.75Q27-72.60 37.40-72.60Q46.40-72.60 52.55-69.50Q58.70-66.40 62.40-60.90Q66.10-55.40 67.60-48.20L54-47.50Q52.90-53.80 49.05-57.55Q45.20-61.30 37.50-61.30Q30.70-61.30 26.35-57.80Q22-54.30 19.85-48.45Q17.70-42.60 17.70-35.40Q17.70-28 19.80-22.20Q21.90-16.40 26.35-13.05Q30.80-9.70 37.60-9.70Q42.90-9.70 46.70-11.90Q50.50-14.10 52.70-17.95Q54.90-21.80 55.10-26.50L37.60-26.50L37.60-36.60L67.80-36.60L67.80 0L59.40 0L58.90-10.70Q57.70-8.20 55.80-6.20Q52.40-2.50 47.45-0.45Q42.50 1.60 36.70 1.60M97.30 0L89.40 0Q83.60 0 80.10-3Q76.60-6 76.60-12.60L76.60-71L89.40-71L89.40-13.90Q89.40-11.90 90.45-10.90Q91.50-9.90 93.40-9.90L97.30-9.90M116.10 0L103.30 0L103.30-53.40L116.10-53.40L116.10 0M116.40-60.50L103.10-60.50L103.10-71.90L116.40-71.90M140 0L127.20 0L127.20-53.40L138.80-53.40L139.10-44.50Q139.90-46.60 141.20-48.30Q143.40-51.30 146.65-52.95Q149.90-54.60 153.80-54.60Q160.60-54.60 164.80-50.80Q167.90-47.90 169.30-43.60Q170.10-46.10 171.50-48.10Q173.70-51.20 177.05-52.90Q180.40-54.60 184.60-54.60Q190.10-54.60 194.10-52.25Q198.10-49.90 200.25-45.40Q202.40-40.90 202.40-34.30L202.40 0L189.60 0L189.60-31Q189.60-37.60 187.35-40.90Q185.10-44.20 180.50-44.20Q177.40-44.20 175.20-42.60Q173-41 171.85-37.95Q170.70-34.90 170.70-30.60L170.70 0L158.80 0L158.80-30.60Q158.80-37.20 156.80-40.70Q154.80-44.20 149.90-44.20Q146.80-44.20 144.65-42.60Q142.50-41 141.25-37.95Q140-34.90 140-30.60M226.20 15L213.40 15L213.40-53.40L225.70-53.40L225.90-45.50Q227.90-49.30 231.30-51.60Q235.80-54.60 241.90-54.60Q249.50-54.60 254.55-50.80Q259.60-47 262.10-40.70Q264.60-34.40 264.60-26.70Q264.60-19 262.05-12.70Q259.50-6.40 254.45-2.60Q249.40 1.20 241.80 1.20Q237.80 1.20 234.35-0.20Q230.90-1.60 228.50-4.20Q227.10-5.60 226.20-7.30L226.20 15M238.80-9.20Q244.60-9.20 247.95-13.85Q251.30-18.50 251.30-26.70Q251.30-34.90 247.95-39.55Q244.60-44.20 238.80-44.20Q234.90-44.20 232.10-42.25Q229.30-40.30 227.75-36.40Q226.20-32.50 226.20-26.70Q226.20-20.90 227.70-17Q229.20-13.10 232.05-11.15Q234.90-9.20 238.80-9.20M294.20 1.20Q286.10 1.20 280.75-1.10Q275.40-3.40 272.60-7.50Q269.80-11.60 269.40-16.80L282.50-17.40Q283.20-13.20 285.90-10.90Q288.60-8.60 294.30-8.60Q298.80-8.60 301.15-10.05Q303.50-11.50 303.50-14.60Q303.50-16.40 302.65-17.60Q301.80-18.80 299.35-19.70Q296.90-20.60 292.20-21.50Q284.10-22.90 279.50-24.95Q274.90-27 273.05-30.10Q271.20-33.20 271.20-37.80Q271.20-45.30 276.95-49.95Q282.70-54.60 293.80-54.60Q301.50-54.60 306.45-52.15Q311.40-49.70 313.95-45.65Q316.50-41.60 316.90-36.60L303.90-36Q303.80-38.50 302.70-40.50Q301.60-42.50 299.40-43.65Q297.20-44.80 293.60-44.80Q289.10-44.80 286.75-43Q284.40-41.20 284.40-38.20Q284.40-36.10 285.35-34.70Q286.30-33.30 288.60-32.45Q290.90-31.60 294.90-30.90Q303.10-29.70 307.90-27.60Q312.70-25.50 314.75-22.35Q316.80-19.20 316.80-14.80Q316.80-7.10 310.65-2.95Q304.50 1.20 294.20 1.20M347.90 1.20Q339.90 1.20 334-2.25Q328.10-5.70 324.90-12Q321.70-18.30 321.70-26.70Q321.70-35.10 324.90-41.35Q328.10-47.60 333.95-51.10Q339.80-54.60 347.60-54.60Q355.20-54.60 360.95-51.20Q366.70-47.80 369.80-41.40Q372.90-35 372.90-26L372.90-23.10L335-23.10Q335.40-16.10 338.85-12.55Q342.30-9 348-9Q352.30-9 355.15-10.95Q358-12.90 359.10-16.40L372.20-15.60Q370-7.80 363.55-3.30Q357.10 1.20 347.90 1.20M335-31.70L359.70-31.70Q359.30-38.20 356-41.35Q352.70-44.50 347.60-44.50Q342.50-44.50 339.15-41.20Q335.80-37.90 335-31.70";
// Outline extends to 372.9; a little extra keeps the "e" off the edge.
const WORDMARK_WIDTH = 376;
// Same proportions as the header lockup: 30px mark, 6px gap, 21px type.
const TEXT_SIZE = 21;
const LOCKUP_MARK = (30 / TEXT_SIZE) * 100;
const LOCKUP_GAP = (6 / TEXT_SIZE) * 100;
// Centre of Geist's line box, relative to the baseline.
const LINE_CENTER = -35.5;

/** Mark only, square. */
export const logoSvg = (color: string = BRAND_ORANGE): string =>
  `<svg xmlns="http://www.w3.org/2000/svg" width="${MARK_SIZE}" height="${MARK_SIZE}" viewBox="0 0 ${MARK_SIZE} ${MARK_SIZE}" fill="${color}" role="img" aria-label="Glimpse logo">${partsMarkup(MARK_PARTS)}</svg>`;

/** Mark + "Glimpse", as in the site header. */
export const wordmarkSvg = (): string => {
  const markTop = LINE_CENTER - LOCKUP_MARK / 2;
  const scale = LOCKUP_MARK / MARK_SIZE;
  const textX = LOCKUP_MARK + LOCKUP_GAP;
  const width = Math.ceil(textX + WORDMARK_WIDTH);
  const height = Math.ceil(LOCKUP_MARK);
  const top = Math.floor(markTop);
  return `<svg xmlns="http://www.w3.org/2000/svg" width="${width}" height="${height}" viewBox="0 ${top} ${width} ${height}" role="img" aria-label="Glimpse"><g fill="${BRAND_ORANGE}" transform="translate(0 ${markTop}) scale(${scale})">${partsMarkup(MARK_PARTS)}</g><path fill="${BRAND_INK}" transform="translate(${textX} 0)" d="${WORDMARK_PATH}"/></svg>`;
};
